from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.venta import Venta
from ..serializers.venta import VentaDashboardSerializer


class ContratosSalidaPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


def _obtener_semana_laboral(referencia):
    dia_semana = (referencia.weekday() + 1) % 7

    if dia_semana == 6:
        inicio = referencia + timedelta(days=1)
    else:
        inicio = referencia - timedelta(days=dia_semana)

    fin = inicio + timedelta(days=3)
    return inicio, fin


class ContratosSalidaListView(APIView):
    permission_classes = [AllowAny]
    pagination_class = ContratosSalidaPagination

    def get(self, request):
        periodo = request.query_params.get("periodo", "semana_laboral")
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")
        cobrador = request.query_params.get("cobrador", "todos")
        busqueda = request.query_params.get("search", "").strip()

        queryset = (
            Venta.objects.select_related("cobrador")
            .only(
                "id",
                "numero_contrato",
                "fecha_venta",
                "nombre",
                "apellido",
                "direccion",
                "zona",
                "monto",
                "inicial",
                "saldo_pendiente",
                "frecuencia_pago",
                "monto_frecuencia",
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
            .filter(inicial__lte=0)
            .filter(fecha_primer_cobro__isnull=False)
        )

        if periodo == "rango" and fecha_inicio and fecha_fin:
            queryset = queryset.filter(
                fecha_primer_cobro__gte=fecha_inicio,
                fecha_primer_cobro__lte=fecha_fin,
            )
        elif periodo == "semana_laboral":
            inicio, fin = _obtener_semana_laboral(timezone.localdate())
            queryset = queryset.filter(
                fecha_primer_cobro__gte=inicio,
                fecha_primer_cobro__lte=fin,
            )

        if cobrador and cobrador != "todos":
            queryset = queryset.filter(cobrador_id=cobrador)

        if busqueda:
            queryset = queryset.filter(
                Q(numero_contrato__icontains=busqueda)
                | Q(nombre__icontains=busqueda)
                | Q(apellido__icontains=busqueda)
                | Q(zona__icontains=busqueda)
                | Q(cobrador__nombre__icontains=busqueda)
            )

        queryset = queryset.order_by("fecha_primer_cobro", "numero_contrato")

        resumen_base = queryset.aggregate(
            total=Count("id"),
            entregados=Count("id", filter=Q(entregado_cobrador=True)),
            ya_pagaron=Count("id", filter=Q(primer_pago_registrado=True)),
            saldo_total=Sum("saldo_pendiente"),
            cobradores=Count("cobrador_id", distinct=True),
        )

        total = resumen_base["total"] or 0
        ya_pagaron = resumen_base["ya_pagaron"] or 0
        resumen = {
            "total": total,
            "entregados": resumen_base["entregados"] or 0,
            "yaPagaron": ya_pagaron,
            "pendientesPrimerPago": total - ya_pagaron,
            "saldoTotal": resumen_base["saldo_total"] or 0,
            "cobradores": resumen_base["cobradores"] or 0,
        }

        grupos = list(
            queryset.values("cobrador_id", "cobrador__nombre", "cobrador__zona")
            .annotate(
                total=Count("id"),
                entregados=Count("id", filter=Q(entregado_cobrador=True)),
                yaPagaron=Count("id", filter=Q(primer_pago_registrado=True)),
            )
            .order_by("-total", "cobrador__nombre", "cobrador__zona")
        )

        grupos_por_cobrador = [
            {
                "id": item["cobrador_id"],
                "nombre": item["cobrador__nombre"] or "Sin cobrador",
                "zona": item["cobrador__zona"] or "",
                "total": item["total"],
                "entregados": item["entregados"],
                "yaPagaron": item["yaPagaron"],
                "pendientes": item["total"] - item["yaPagaron"],
            }
            for item in grupos
            if item["cobrador_id"] is not None
        ]

        paginator = self.pagination_class()
        pagina = paginator.paginate_queryset(queryset, request)
        serializer = VentaDashboardSerializer(pagina, many=True)

        return Response(
            {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data,
                "resumen": resumen,
                "gruposPorCobrador": grupos_por_cobrador,
            }
        )
