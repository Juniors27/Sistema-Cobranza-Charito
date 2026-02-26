from rest_framework import serializers
from decimal import Decimal
from ..models.venta import Venta
from ..models.producto import Producto
from ..models.cobrador import Cobrador


class VentaSerializer(serializers.ModelSerializer):
    # =========================
    # SOLO LECTURA
    # =========================
    producto_nombre = serializers.CharField(
        source='producto.nombre',
        read_only=True
    )

    cobrador_nombre = serializers.CharField(
        source='cobrador.nombre',
        read_only=True
    )

    cliente = serializers.SerializerMethodField()
    
    # =========================
    # ÚLTIMO PAGO (ANNOTATE)    
    # =========================
    ultimo_pago_fecha = serializers.DateField(read_only=True)
    ultimo_pago_monto = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    # =========================
    # ESCRITURA
    # =========================
    # Producto viene desde JS (nombre + categoria)
    producto = serializers.JSONField(write_only=True, required=False)


    # Cobrador sí existe en BD
    cobrador = serializers.PrimaryKeyRelatedField(
        queryset=Cobrador.objects.all(),
        error_messages={
            'does_not_exist': 'El cobrador seleccionado no existe.',
            'required': 'El cobrador es obligatorio.'
        }
    )

    class Meta:
        model = Venta
        fields = [
            'id',
            'numero_contrato',
            'fecha_venta',

            # Cliente
            'nombre',
            'apellido',
            'cliente',
            'direccion',
            'lugar',
            'zona',

            # Producto
            'producto',
            'producto_nombre',
            'cantidad',
            'precio_total',

            # Pagos
            'monto',
            'inicial',
            'saldo_pendiente',
            'ultimo_pago_fecha',      # 👈 AGREGA ESTE
            'ultimo_pago_monto',      # 👈 AGREGA ESTE
            'frecuencia_pago',
            'dia_cobro',
            'fecha_inicial',
            'primer_pago_registrado',

            # Control
            'vendedor',
            'cobrador',
            'cobrador_nombre',
            'estado',

            # Metadata
            'fecha_registro',
            'usuario_registro',
        ]

        read_only_fields = [
            'saldo_pendiente',
            'primer_pago_registrado',
            'fecha_registro',
            'fecha_inicial',
            'usuario_registro',
        ]

    # =========================
    # MÉTODOS AUXILIARES
    # =========================
    def get_cliente(self, obj):
        return f"{obj.nombre} {obj.apellido}"

    # =========================
    # VALIDACIONES
    # =========================
    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1")
        return value

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value

    def validate_precio_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio total debe ser mayor a 0")
        return value

    def validate(self, data):
     if 'inicial' in data or 'monto' in data:
        inicial = data.get('inicial', Decimal('0.00'))
        monto = data.get('monto')

        if monto is not None and inicial > monto:
            raise serializers.ValidationError({
                'inicial': 'El inicial no puede ser mayor al monto total'
            })

     return data


    # =========================
    # CREATE (CLAVE DE TODO)
    # =========================
    def create(self, validated_data):
        """
        - Crea o reutiliza producto desde JS
        - Calcula saldo pendiente
        - Maneja pago inicial
        """

        # -------- PRODUCTO --------
        producto_data = validated_data.pop('producto')

        producto, _ = Producto.objects.get_or_create(
            nombre=producto_data['nombre'],
            defaults={
                'categoria': producto_data.get('categoria', '')
            }
        )

        # -------- CÁLCULOS --------
        monto = validated_data.get('monto', Decimal('0.00'))
        inicial = validated_data.get('inicial', Decimal('0.00'))

        validated_data['saldo_pendiente'] = monto - inicial

        if inicial > 0:
            validated_data['primer_pago_registrado'] = True
            validated_data['fecha_inicial'] = validated_data.get('fecha_venta')

        # -------- CREAR VENTA --------
        venta = Venta.objects.create(
            producto=producto,
            **validated_data
        )

        return venta

    # =========================
    # UPDATE
    # =========================
    def update(self, instance, validated_data):
    # --- PRODUCTO (si viene) ---
     producto_data = validated_data.pop('producto', None)

     if producto_data:
        from ..models.producto import Producto

        if isinstance(producto_data, int):
            instance.producto_id = producto_data

        elif isinstance(producto_data, dict):
            producto, _ = Producto.objects.get_or_create(
                nombre=producto_data['nombre'],
                defaults={'categoria': producto_data.get('categoria', '')}
            )
            instance.producto = producto

    # --- RECALCULAR SALDO SOLO SI CORRESPONDE ---
     if 'monto' in validated_data or 'inicial' in validated_data:
        monto = validated_data.get('monto', instance.monto)
        inicial = validated_data.get('inicial', instance.inicial)
        validated_data['saldo_pendiente'] = monto - inicial

    # --- UPDATE NORMAL ---
     instance = super().update(instance, validated_data)

    # 🚨 ESTO ES LO QUE TE FALTABA
     return instance


    
    def validate_producto(self, value):
        print("PRODUCTO RECIBIDO 👉", value)
        return value
   
   #VALIDAR DUPLICADO DE CONTRATO
   
    def validate_numero_contrato(self, value):
     """
    Valida en tiempo real si el número de contrato ya existe
    """
     qs = Venta.objects.filter(numero_contrato=value)

    # En caso de UPDATE
     if self.instance:
        qs = qs.exclude(pk=self.instance.pk)

     if qs.exists():
        raise serializers.ValidationError("Contrato ya está registrado")

     return value

