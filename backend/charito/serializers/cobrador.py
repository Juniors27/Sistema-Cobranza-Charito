from rest_framework import serializers
from charito.models import Cobrador


class CobradorSerializer(serializers.ModelSerializer):
    total_clientes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cobrador
        fields = [
            'id',
            'nombre',
            'zona',
            'activo',
            'fecha_registro',
            'total_clientes'
        ]
