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


class ClientesQuerysetMixin:
    def get_clientes_queryset(self):
        ultimo_pago = Pago.objects.filter(
            venta=OuterRef("pk")
        ).order_by("-fecha_pago", "-fecha_registro")

        lote = self.request.query_params.get("lote", "").strip()
        numero_contrato = self.request.query_params.get("numero_contrato", "").strip()
        nombre_cliente = self.request.query_params.get("nombre_cliente", "").strip()
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

        if lote:
            queryset = queryset.filter(lote__icontains=lote)

        if numero_contrato:
            queryset = queryset.filter(numero_contrato__icontains=numero_contrato)

        if nombre_cliente:
            queryset = queryset.filter(
                Q(nombre__icontains=nombre_cliente)
                | Q(apellido__icontains=nombre_cliente)
            )

        return queryset


class ListaClientesView(ClientesQuerysetMixin, ListAPIView):
    serializer_class = ClienteListSerializer
    pagination_class = ClientesPagination

    def get_queryset(self):
        return self.get_clientes_queryset()


class ExportarClientesView(ClientesQuerysetMixin, ListAPIView):
    serializer_class = ClienteListSerializer
    pagination_class = None

    def get_queryset(self):
        return self.get_clientes_queryset()
