from datetime import date, datetime, timedelta

from django.db.models import OuterRef, Q, Subquery
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.observacion_control import ObservacionControl
from ..models.pago import Pago
from ..models.venta import Venta


class ControlTarjetasPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


def _parsear_fecha_local(fecha):
    if not fecha:
        return None

    if isinstance(fecha, datetime):
        return fecha.date()

    return fecha


def _diferencia_en_dias(fecha_inicio, fecha_fin):
    inicio = _parsear_fecha_local(fecha_inicio)
    fin = _parsear_fecha_local(fecha_fin)
    if not inicio or not fin:
        return 0
    return (fin - inicio).days


def _sumar_meses_respetando_fin_de_mes(fecha_base, cantidad_meses):
    year = fecha_base.year + ((fecha_base.month - 1 + cantidad_meses) // 12)
    month = ((fecha_base.month - 1 + cantidad_meses) % 12) + 1
    first_day = date(year, month, 1)

    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)

    ultimo_dia = (next_month - timedelta(days=1)).day
    return date(year, month, min(fecha_base.day, ultimo_dia))


def _calcular_meses_completos(fecha_inicio, fecha_fin):
    meses = 0

    while True:
        siguiente = _sumar_meses_respetando_fin_de_mes(fecha_inicio, meses + 1)
        if siguiente <= fecha_fin:
            meses += 1
            continue
        break

    return meses


def _pluralizar(valor, singular, plural):
    return f"{valor} {singular if valor == 1 else plural}"


def _formatear_fecha_dmy(fecha):
    fecha_base = _parsear_fecha_local(fecha)
    if not fecha_base:
        return "Sin pagos"
    return fecha_base.strftime("%d/%m/%Y")


def _formatear_tiempo(dias, frecuencia_pago, fecha_referencia):
    if dias <= 0:
        return "Hoy"

    if frecuencia_pago == "semanal":
        if dias < 7:
            return _pluralizar(dias, "dia", "dias")

        semanas = dias // 7
        dias_restantes = dias % 7
        if dias_restantes > 0:
            return (
                f"{_pluralizar(semanas, 'semana', 'semanas')} "
                f"y {_pluralizar(dias_restantes, 'dia', 'dias')}"
            )
        return _pluralizar(semanas, "semana", "semanas")

    if frecuencia_pago == "quincenal":
        if dias < 15:
            return _pluralizar(dias, "dia", "dias")

        quincenas = dias // 15
        dias_restantes = dias % 15
        if dias_restantes > 0:
            return (
                f"{_pluralizar(quincenas, 'quincena', 'quincenas')} "
                f"y {_pluralizar(dias_restantes, 'dia', 'dias')}"
            )
        return _pluralizar(quincenas, "quincena", "quincenas")

    if frecuencia_pago == "mensual":
        hoy = date.today()
        meses = _calcular_meses_completos(fecha_referencia, hoy)

        if meses < 1:
            return _pluralizar(dias, "dia", "dias")

        fecha_ancla = _sumar_meses_respetando_fin_de_mes(fecha_referencia, meses)
        dias_restantes = _diferencia_en_dias(fecha_ancla, hoy)
        if dias_restantes > 0:
            return (
                f"{_pluralizar(meses, 'mes', 'meses')} "
                f"y {_pluralizar(dias_restantes, 'dia', 'dias')}"
            )
        return _pluralizar(meses, "mes", "meses")

    return _pluralizar(dias, "dia", "dias")


def _dias_limite(frecuencia_pago):
    if frecuencia_pago == "semanal":
        return 14
    if frecuencia_pago == "quincenal":
        return 30
    if frecuencia_pago == "mensual":
        return 60
    return 0


def _serializar_venta_control(venta, hoy):
    saldo = float(venta.saldo_pendiente or 0)
    fecha_ultimo_movimiento = (
        _parsear_fecha_local(venta.ultimo_pago_fecha)
        or _parsear_fecha_local(venta.fecha_inicial)
        or _parsear_fecha_local(venta.fecha_venta)
    )

    dias = _diferencia_en_dias(fecha_ultimo_movimiento, hoy)
    limite = _dias_limite(venta.frecuencia_pago)
    estado_control = "controlar" if saldo > 0 and dias > limite else "normal"
    es_buen_pagador = saldo > 0 and dias <= limite

    alerta_promesa = None
    fecha_promesa = _parsear_fecha_local(venta.ultima_promesa_fecha)
    if fecha_promesa and (not fecha_ultimo_movimiento or fecha_ultimo_movimiento < fecha_promesa):
        dias_vencidos = _diferencia_en_dias(fecha_promesa, hoy)

        if dias_vencidos < 0:
            alerta_promesa = {
                "tipo": "futura",
                "texto": f"Promesa {fecha_promesa.strftime('%d/%m/%Y')}",
                "detalle": "Aun dentro del plazo prometido",
            }
        elif dias_vencidos == 0:
            alerta_promesa = {
                "tipo": "hoy",
                "texto": "Promesa vence hoy",
                "detalle": fecha_promesa.strftime("%d/%m/%Y"),
            }
        else:
            alerta_promesa = {
                "tipo": "vencida",
                "texto": "Promesa vencida",
                "detalle": f"{fecha_promesa.strftime('%d/%m/%Y')} - {dias_vencidos} dias",
            }

    return {
        "id": venta.id,
        "numero_contrato": venta.numero_contrato,
        "fecha_venta": venta.fecha_venta.isoformat() if venta.fecha_venta else None,
        "nombre": venta.nombre,
        "apellido": venta.apellido,
        "direccion": venta.direccion,
        "zona": venta.zona,
        "frecuencia_pago": venta.frecuencia_pago,
        "monto_frecuencia": str(venta.monto_frecuencia),
        "fecha_inicial": venta.fecha_inicial.isoformat() if venta.fecha_inicial else None,
        "saldo_pendiente": str(venta.saldo_pendiente),
        "estado": venta.estado,
        "cobrador": venta.cobrador_id,
        "cobrador_nombre": venta.cobrador.nombre if venta.cobrador_id else "",
        "estado_control": estado_control,
        "es_buen_pagador": es_buen_pagador,
        "ultimo_pago": {
            "fecha": _formatear_fecha_dmy(
                _parsear_fecha_local(venta.ultimo_pago_fecha)
                or _parsear_fecha_local(venta.fecha_inicial)
            ),
            "dias": dias,
            "atraso": _formatear_tiempo(dias, venta.frecuencia_pago, fecha_ultimo_movimiento),
        },
        "alerta_promesa": alerta_promesa,
    }


class ControlTarjetasListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = ControlTarjetasPagination

    def get(self, request):
        filtro = request.query_params.get("filtro", "todos")
        busqueda = request.query_params.get("search", "").strip()

        ultimo_pago = Pago.objects.filter(venta=OuterRef("pk")).order_by(
            "-fecha_pago",
            "-fecha_registro",
        )
        ultima_promesa = ObservacionControl.objects.filter(
            venta=OuterRef("pk"),
            fecha_compromiso_pago__isnull=False,
        ).order_by("-fecha_control", "-fecha_registro", "-id")

        queryset = (
            Venta.objects.select_related("cobrador")
            .annotate(
                ultimo_pago_fecha=Subquery(ultimo_pago.values("fecha_pago")[:1]),
                ultima_promesa_fecha=Subquery(ultima_promesa.values("fecha_compromiso_pago")[:1]),
            )
            .exclude(estado__in=["cancelada", "recogido", "bajada"])
            .order_by("-fecha_venta", "-id")
        )

        if busqueda:
            queryset = queryset.filter(
                Q(numero_contrato__icontains=busqueda)
                | Q(nombre__icontains=busqueda)
                | Q(apellido__icontains=busqueda)
                | Q(direccion__icontains=busqueda)
                | Q(zona__icontains=busqueda)
                | Q(cobrador__nombre__icontains=busqueda)
            )

        hoy = date.today()
        serializadas = [
            _serializar_venta_control(venta, hoy)
            for venta in queryset
            if float(venta.saldo_pendiente or 0) > 0
        ]

        clientes_controlar = [
            item for item in serializadas if item["estado_control"] == "controlar"
        ]
        buenos_pagadores = [item for item in serializadas if item["es_buen_pagador"]]
        clientes_promesa_vencida = [
            item
            for item in serializadas
            if item["alerta_promesa"] and item["alerta_promesa"]["tipo"] == "vencida"
        ]

        if filtro == "controlar":
            filtradas = clientes_controlar
        elif filtro == "buenos":
            filtradas = buenos_pagadores
        elif filtro == "promesas_vencidas":
            filtradas = clientes_promesa_vencida
        else:
            filtradas = serializadas

        paginator = self.pagination_class()
        pagina = paginator.paginate_queryset(filtradas, request)

        return Response(
            {
                "count": len(filtradas),
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": pagina,
                "conteos": {
                    "todos": len(serializadas),
                    "controlar": len(clientes_controlar),
                    "buenos": len(buenos_pagadores),
                    "promesas_vencidas": len(clientes_promesa_vencida),
                },
            }
        )
