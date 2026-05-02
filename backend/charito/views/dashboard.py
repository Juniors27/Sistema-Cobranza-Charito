from datetime import timedelta

from django.db.models import F, Window
from django.db.models.functions import RowNumber
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.cobrador import Cobrador
from ..models.pago import Pago
from ..models.venta import Venta


FECHAS_INICIO_PROGRAMACION = ["2026-03-12", "2026-03-13"]
LIMITE_CRITICO = {
    "semanal": 28,
    "quincenal": 60,
    "mensual": 90,
}
ESTADOS_INACTIVOS = {"cancelada", "recogido", "bajada"}


def serializar_fecha(fecha):
    return fecha.isoformat() if fecha else None


def obtener_semana_laboral(referencia):
    dias_desde_domingo = (referencia.weekday() + 1) % 7
    inicio = referencia - timedelta(days=dias_desde_domingo)

    return inicio, inicio + timedelta(days=3)


def fecha_en_periodo(fecha, periodo, fecha_inicio, fecha_fin, referencia):
    if not fecha:
        return False

    if periodo == "historico":
        return True

    if periodo == "hoy":
        return fecha == referencia

    if periodo == "semana_laboral":
        inicio, fin = obtener_semana_laboral(referencia)
        return inicio <= fecha <= fin

    if periodo == "rango":
        inicio = parse_date(fecha_inicio or "")
        fin = parse_date(fecha_fin or "")
        if not inicio or not fin:
            return False
        return inicio <= fecha <= fin

    return True


def pluralizar(valor, singular, plural):
    return f"{valor} {singular if valor == 1 else plural}"


def sumar_meses_respetando_fin_de_mes(fecha, cantidad_meses):
    mes_base = fecha.month - 1 + cantidad_meses
    anio = fecha.year + mes_base // 12
    mes = mes_base % 12 + 1

    if mes == 12:
        primer_dia_siguiente_mes = fecha.replace(year=anio + 1, month=1, day=1)
    else:
        primer_dia_siguiente_mes = fecha.replace(year=anio, month=mes + 1, day=1)

    ultimo_dia_mes = (primer_dia_siguiente_mes - timedelta(days=1)).day
    return fecha.replace(year=anio, month=mes, day=min(fecha.day, ultimo_dia_mes))


def meses_completos(fecha_inicio, fecha_fin):
    meses = 0

    while sumar_meses_respetando_fin_de_mes(fecha_inicio, meses + 1) <= fecha_fin:
        meses += 1

    return meses


def formatear_atraso(dias, frecuencia_pago, fecha_referencia, hoy):
    if dias <= 0:
        return "Hoy"

    if frecuencia_pago == "semanal":
        if dias < 7:
            return pluralizar(dias, "dia", "dias")
        semanas = dias // 7
        dias_restantes = dias % 7
        return (
            f"{pluralizar(semanas, 'semana', 'semanas')} y {pluralizar(dias_restantes, 'dia', 'dias')}"
            if dias_restantes
            else pluralizar(semanas, "semana", "semanas")
        )

    if frecuencia_pago == "quincenal":
        if dias < 15:
            return pluralizar(dias, "dia", "dias")
        quincenas = dias // 15
        dias_restantes = dias % 15
        return (
            f"{pluralizar(quincenas, 'quincena', 'quincenas')} y {pluralizar(dias_restantes, 'dia', 'dias')}"
            if dias_restantes
            else pluralizar(quincenas, "quincena", "quincenas")
        )

    if frecuencia_pago == "mensual":
        meses = meses_completos(fecha_referencia, hoy)
        if meses < 1:
            return pluralizar(dias, "dia", "dias")

        fecha_ancla = sumar_meses_respetando_fin_de_mes(fecha_referencia, meses)
        dias_restantes = (hoy - fecha_ancla).days
        return (
            f"{pluralizar(meses, 'mes', 'meses')} y {pluralizar(dias_restantes, 'dia', 'dias')}"
            if dias_restantes > 0
            else pluralizar(meses, "mes", "meses")
        )

    return pluralizar(dias, "dia", "dias")


def obtener_ultimos_pagos():
    pagos = (
        Pago.objects.only("id", "venta_id", "fecha_pago", "monto", "fecha_registro")
        .annotate(
            fila=Window(
                expression=RowNumber(),
                partition_by=[F("venta_id")],
                order_by=[F("fecha_pago").desc(), F("fecha_registro").desc()],
            )
        )
        .filter(fila=1)
    )

    return {pago.venta_id: pago for pago in pagos}


def serializar_contrato_basico(venta):
    return {
        "id": venta.id,
        "lote": venta.lote,
        "numero_contrato": venta.numero_contrato,
        "codigo_contrato": venta.codigo_contrato,
        "cliente": f"{venta.nombre} {venta.apellido}",
        "cobrador": venta.cobrador_id,
        "cobrador_nombre": venta.cobrador.nombre if venta.cobrador_id else "",
        "fecha_venta": serializar_fecha(venta.fecha_venta),
        "fecha_primer_cobro": serializar_fecha(venta.fecha_primer_cobro),
        "saldo_pendiente": float(venta.saldo_pendiente or 0),
        "entregado_cobrador": bool(venta.entregado_cobrador),
        "fecha_entrega_cobrador": serializar_fecha(venta.fecha_entrega_cobrador),
        "zona": venta.zona,
    }


class DashboardResumenView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        periodo = request.query_params.get("periodo", "semana_laboral")
        fecha_inicio = request.query_params.get("fecha_inicio", "")
        fecha_fin = request.query_params.get("fecha_fin", "")
        hoy = timezone.localdate()

        ultimos_pagos = obtener_ultimos_pagos()
        ventas = Venta.objects.select_related("cobrador").only(
            "id",
            "lote",
            "numero_contrato",
            "fecha_venta",
            "nombre",
            "apellido",
            "direccion",
            "zona",
            "inicial",
            "saldo_pendiente",
            "frecuencia_pago",
            "fecha_inicial",
            "fecha_primer_cobro",
            "primer_pago_registrado",
            "cobrador",
            "cobrador__nombre",
            "cobrador__zona",
            "estado",
            "entregado_cobrador",
            "fecha_entrega_cobrador",
        )
        cobradores = list(Cobrador.objects.only("id", "nombre", "zona"))

        clientes_por_zona = {
            "milagro": 0,
            "huanchaco": 0,
            "buenosAires": 0,
        }
        activas_por_cobrador = {}
        bajadas_por_cobrador = {}
        canceladas_por_cobrador = {}
        ventas_activas = []
        ventas_canceladas_periodo = []
        contratos_primer_cobro_periodo = []
        contratos_pendientes_programacion = []

        for venta in ventas:
            estado = (venta.estado or "").lower()
            saldo_pendiente = float(venta.saldo_pendiente or 0)
            cobrador_id = venta.cobrador_id

            if estado == "bajada" and cobrador_id:
                bajadas_por_cobrador[cobrador_id] = bajadas_por_cobrador.get(cobrador_id, 0) + 1

            if estado == "cancelado":
                ultimo_pago = ultimos_pagos.get(venta.id)
                if (
                    (ultimo_pago and fecha_en_periodo(ultimo_pago.fecha_pago, periodo, fecha_inicio, fecha_fin, hoy))
                    or (not ultimo_pago and periodo == "historico")
                ):
                    ventas_canceladas_periodo.append(venta)
                    if cobrador_id:
                        canceladas_por_cobrador[cobrador_id] = canceladas_por_cobrador.get(cobrador_id, 0) + 1

            if (
                venta.fecha_primer_cobro
                and not venta.primer_pago_registrado
                and saldo_pendiente > 0
                and fecha_en_periodo(venta.fecha_primer_cobro, periodo, fecha_inicio, fecha_fin, hoy)
            ):
                contratos_primer_cobro_periodo.append(serializar_contrato_basico(venta))

            if (
                not venta.fecha_primer_cobro
                and float(venta.inicial or 0) <= 0
                and not venta.primer_pago_registrado
                and serializar_fecha(venta.fecha_venta) in FECHAS_INICIO_PROGRAMACION
            ):
                contratos_pendientes_programacion.append(serializar_contrato_basico(venta))

            if estado in ESTADOS_INACTIVOS or saldo_pendiente <= 0:
                continue

            ventas_activas.append(venta)

            if venta.zona == "milagro":
                clientes_por_zona["milagro"] += 1
            if venta.zona == "huanchaco":
                clientes_por_zona["huanchaco"] += 1
            if venta.zona == "buenos aires":
                clientes_por_zona["buenosAires"] += 1

            if cobrador_id:
                activas_por_cobrador[cobrador_id] = activas_por_cobrador.get(cobrador_id, 0) + 1

        clientes_criticos = []
        for venta in ventas_activas:
            ultimo_pago = ultimos_pagos.get(venta.id)
            fecha_referencia = (
                ultimo_pago.fecha_pago
                if ultimo_pago
                else venta.fecha_inicial or venta.fecha_venta
            )
            fecha_ultimo_movimiento = ultimo_pago.fecha_pago if ultimo_pago else venta.fecha_inicial

            if not fecha_referencia:
                continue

            dias_atraso = (hoy - fecha_referencia).days
            limite_critico = LIMITE_CRITICO.get(venta.frecuencia_pago, 9999)

            if dias_atraso < limite_critico:
                continue

            clientes_criticos.append(
                {
                    "id": venta.id,
                    "codigo_contrato": venta.codigo_contrato,
                    "lote": venta.lote,
                    "numero_contrato": venta.numero_contrato,
                    "cliente": f"{venta.nombre} {venta.apellido}",
                    "direccion": venta.direccion,
                    "zona": venta.zona,
                    "cobrador_nombre": venta.cobrador.nombre if venta.cobrador_id else "",
                    "saldo_pendiente": float(venta.saldo_pendiente or 0),
                    "frecuencia_pago": venta.frecuencia_pago,
                    "dias_atraso": dias_atraso,
                    "atraso_texto": formatear_atraso(
                        dias_atraso,
                        venta.frecuencia_pago,
                        fecha_referencia,
                        hoy,
                    ),
                    "fecha_ultimo_movimiento": serializar_fecha(fecha_ultimo_movimiento),
                    "severidad": dias_atraso - limite_critico,
                }
            )

        clientes_criticos.sort(
            key=lambda cliente: (
                -cliente["severidad"],
                -cliente["saldo_pendiente"],
                str(cliente["numero_contrato"]),
            )
        )
        contratos_primer_cobro_periodo.sort(
            key=lambda contrato: (
                contrato["fecha_primer_cobro"] or "",
                str(contrato["numero_contrato"]),
            )
        )
        contratos_pendientes_programacion.sort(
            key=lambda contrato: contrato["fecha_venta"] or ""
        )

        clientes_por_cobrador = [
            {
                "nombre": cobrador.nombre,
                "cantidad": activas_por_cobrador.get(cobrador.id, 0),
                "canceladas": canceladas_por_cobrador.get(cobrador.id, 0),
                "bajadas": bajadas_por_cobrador.get(cobrador.id, 0),
                "zona": cobrador.zona,
            }
            for cobrador in cobradores
        ]
        canceladas_por_cobrador_data = [
            {
                "id": cobrador.id,
                "nombre": cobrador.nombre,
                "zona": cobrador.zona,
                "cantidad": canceladas_por_cobrador.get(cobrador.id, 0),
            }
            for cobrador in cobradores
        ]
        primeros_cobros_por_cobrador = []
        for cobrador in cobradores:
            contratos = [
                contrato
                for contrato in contratos_primer_cobro_periodo
                if contrato["cobrador"] == cobrador.id
            ]
            primeros_cobros_por_cobrador.append(
                {
                    "id": cobrador.id,
                    "nombre": cobrador.nombre,
                    "zona": cobrador.zona,
                    "cantidad": len(contratos),
                    "entregados": len([contrato for contrato in contratos if contrato["entregado_cobrador"]]),
                    "pendientes": len([contrato for contrato in contratos if not contrato["entregado_cobrador"]]),
                    "contratos": contratos,
                }
            )

        resumen_clientes_criticos = {
            "total": len(clientes_criticos),
            "saldoTotal": sum(cliente["saldo_pendiente"] for cliente in clientes_criticos),
            "cobradoresComprometidos": len(
                {
                    cliente["cobrador_nombre"]
                    for cliente in clientes_criticos
                    if cliente["cobrador_nombre"]
                }
            ),
            "top": clientes_criticos[:5],
            "lista": clientes_criticos,
        }

        return Response(
            {
                "totalVentasActivas": len(ventas_activas),
                "clientesPorZona": clientes_por_zona,
                "clientesPorCobrador": clientes_por_cobrador,
                "canceladasPorCobrador": canceladas_por_cobrador_data,
                "contratosPrimerCobroPeriodo": contratos_primer_cobro_periodo,
                "primerosCobrosPorCobrador": primeros_cobros_por_cobrador,
                "contratosPendientesProgramacion": contratos_pendientes_programacion,
                "resumenClientesCriticos": resumen_clientes_criticos,
            }
        )
