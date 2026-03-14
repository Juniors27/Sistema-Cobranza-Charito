from rest_framework import serializers
from ..models.pago import Pago

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = [
            'id',
            'venta',
            'fecha_pago',
            'monto',
            'cobrador',
            'es_primer_pago',
            'es_descuento',
            'notas',
        ]

class PagoReporteSerializer(serializers.ModelSerializer):
    venta_id = serializers.IntegerField(source='venta.id') 
    numeroContrato = serializers.CharField(source='venta.numero_contrato')
    fecha_venta = serializers.DateField(source='venta.fecha_venta')
    estado = serializers.CharField(source='venta.estado')
    cliente = serializers.SerializerMethodField()
    zona = serializers.CharField(source='venta.zona')
    direccion = serializers.CharField(source='venta.direccion')
    producto = serializers.SerializerMethodField()
    
    saldo_pendiente = serializers.DecimalField(
        source='venta.saldo_pendiente',
        max_digits=10,
        decimal_places=2
    )
    cobradorNombre = serializers.CharField(source='cobrador.nombre')

    class Meta:
        model = Pago
        fields = [
            'id',
            'venta_id',
            'fecha_pago',
            'monto',
            'numeroContrato',
            'fecha_venta',
            'estado',
            'cliente',
            'zona',
            'direccion',    
            'producto',
            'saldo_pendiente',
            'cobradorNombre',
            'es_descuento',
        ]

    def get_cliente(self, obj):
        return f"{obj.venta.nombre} {obj.venta.apellido}"

    def get_producto(self, obj):
        return obj.venta.obtener_productos_resumen()
    
# 🆕 NUEVO SERIALIZER PARA HISTORIAL
class HistorialPagosSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar el historial de pagos de un contrato
    """
    fecha_pago = serializers.DateField(format='%d-%m-%Y')
    
    # 👇 CORRECCIÓN: Tomar saldo_pendiente de la venta relacionada
    saldo_pendiente = serializers.DecimalField(
        source='venta.saldo_pendiente',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Pago
        fields = [
            'id',
            'fecha_pago',
            'monto',
            'saldo_pendiente',
            'es_descuento',
            'notas',
        ]
