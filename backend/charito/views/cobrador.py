from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListAPIView
from django.db.models import Count
from charito.models import Cobrador
from charito.serializers import CobradorSerializer


class CobradorViewSet(ModelViewSet):
    queryset = Cobrador.objects.all()
    serializer_class = CobradorSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        activo = self.request.query_params.get('activo')

        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')

        return queryset

class CobradorListView(ListAPIView):
    serializer_class = CobradorSerializer

    def get_queryset(self):
        return (
            Cobrador.objects
            .annotate(total_clientes=Count('ventas', distinct=True))
            .order_by('nombre')
        )