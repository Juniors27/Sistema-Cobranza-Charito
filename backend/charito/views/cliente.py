from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import OuterRef, Subquery, Q
from ..models.venta import Venta
from ..models.pago import Pago
from charito.serializers.cliente import ClienteListSerializer


class ClientesPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class ListaClientesView(ListAPIView):
    serializer_class = ClienteListSerializer
    pagination_class = ClientesPagination

    def get_queryset(self):
        ultimo_pago = Pago.objects.filter(
            venta=OuterRef("pk")
        ).order_by("-fecha_pago", "-fecha_registro")

        search = self.request.query_params.get("search", "").strip()
        zona = self.request.query_params.get("zona", "").strip().lower()

        queryset = (
            Venta.objects
            .select_related("producto", "cobrador")
            .annotate(
                ultimo_pago_fecha=Subquery(ultimo_pago.values("fecha_pago")[:1])
            )
            .order_by("-fecha_venta")
        )

        if zona and zona != "todas":
            queryset = queryset.filter(zona=zona)

        if search:
            queryset = queryset.filter(
                Q(numero_contrato__icontains=search)
                | Q(nombre__icontains=search)
                | Q(apellido__icontains=search)
                | Q(direccion__icontains=search)
                | Q(items__producto__nombre__icontains=search)
            ).distinct()

        return queryset
