from rest_framework import serializers
from ..models.venta import Venta


class ClienteSerializer(serializers.ModelSerializer):
    producto = serializers.SerializerMethodField()
    productos = serializers.SerializerMethodField()
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
            "productos",
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

    def get_producto(self, obj):
        return obj.obtener_productos_resumen()

    def get_productos(self, obj):
        return [
            {
                "id": item.id,
                "producto_id": item.producto_id,
                "nombre": item.producto.nombre,
                "categoria": item.producto.categoria,
                "cantidad": item.cantidad,
                "precio_total": str(item.precio_total),
            }
            for item in obj.obtener_items_producto()
        ]


class ClienteListSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.SerializerMethodField()
    cobrador_nombre = serializers.CharField(source="cobrador.nombre", read_only=True)
    ultimo_pago_fecha = serializers.DateField(read_only=True, allow_null=True)
    fecha_inicial = serializers.SerializerMethodField()

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
            "producto_nombre",
            "precio_total",
            "cantidad",
            "monto",
            "inicial",
            "saldo_pendiente",
            "frecuencia_pago",
            "dia_cobro",
            "fecha_inicial",
            "estado",
            "cobrador",
            "cobrador_nombre",
            "ultimo_pago_fecha",
        ]

    def get_producto_nombre(self, obj):
        return obj.obtener_productos_resumen()

    def get_fecha_inicial(self, obj):
        if obj.fecha_inicial:
            return obj.fecha_inicial

        if obj.inicial and obj.inicial > 0:
            return obj.fecha_venta

        return None
