from rest_framework import serializers
from ..models.venta import Venta


class ClienteSerializer(serializers.ModelSerializer):
    producto = serializers.CharField(source="producto.nombre", read_only=True)
    cobrador_nombre = serializers.CharField(source="cobrador.nombre", read_only=True)

    class Meta:
        model = Venta
        fields = [
            "id",
            "numero_contrato",
            "fecha_venta",

            "nombre",
            "apellido",
            "direccion",
            "lugar",
            "zona",

            "producto",
            "precio_total",
            "cantidad",

            "monto",
            "inicial",
            "saldo_pendiente",
            "frecuencia_pago",
            "dia_cobro",

            "estado",

            "cobrador",
            "cobrador_nombre",
        ]
