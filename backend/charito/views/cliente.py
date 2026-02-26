from rest_framework.generics import ListAPIView
from ..models.venta import Venta
from charito.serializers.cliente import ClienteSerializer   # 👈 Importa tu ClienteSerializer

class ListaClientesView(ListAPIView):
    serializer_class = ClienteSerializer

    def get_queryset(self):
        return (
            Venta.objects
            .select_related("producto", "cobrador")
            .order_by("-fecha_venta")
        )