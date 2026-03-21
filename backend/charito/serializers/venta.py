from decimal import Decimal
from rest_framework import serializers
from ..models.venta import Venta, VentaItem
from ..models.producto import Producto
from ..models.cobrador import Cobrador


class VentaSerializer(serializers.ModelSerializer):
    cobrador_nombre = serializers.CharField(source="cobrador.nombre", read_only=True)
    cliente = serializers.SerializerMethodField()
    producto_nombre = serializers.SerializerMethodField()
    productos = serializers.ListField(write_only=True, required=False)
    ultimo_pago_fecha = serializers.DateField(read_only=True)
    ultimo_pago_monto = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    cobrador = serializers.PrimaryKeyRelatedField(
        queryset=Cobrador.objects.all(),
        error_messages={
            "does_not_exist": "El cobrador seleccionado no existe.",
            "required": "El cobrador es obligatorio.",
        },
    )

    class Meta:
        model = Venta
        fields = [
            "id",
            "numero_contrato",
            "fecha_venta",
            "nombre",
            "apellido",
            "cliente",
            "direccion",
            "lugar",
            "zona",
            "producto",
            "producto_nombre",
            "productos",
            "cantidad",
            "precio_total",
            "monto",
            "inicial",
            "saldo_pendiente",
            "ultimo_pago_fecha",
            "ultimo_pago_monto",
            "frecuencia_pago",
            "monto_frecuencia",
            "dia_cobro",
            "fecha_inicial",
            "fecha_primer_cobro",
            "primer_pago_registrado",
            "vendedor",
            "cobrador",
            "cobrador_nombre",
            "estado",
            "entregado_cobrador",
            "fecha_entrega_cobrador",
            "fecha_registro",
            "usuario_registro",
        ]
        read_only_fields = [
            "saldo_pendiente",
            "primer_pago_registrado",
            "fecha_registro",
            "fecha_inicial",
            "usuario_registro",
            "fecha_entrega_cobrador",
        ]
        extra_kwargs = {
            "producto": {"required": False},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["producto_nombre"] = self.get_producto_nombre(instance)
        representation["productos"] = self._serializar_items(instance)
        return representation

    def get_cliente(self, obj):
        return f"{obj.nombre} {obj.apellido}"

    def get_producto_nombre(self, obj):
        return obj.obtener_productos_resumen()

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
        inicial = data.get("inicial", getattr(self.instance, "inicial", Decimal("0.00")))
        monto = data.get("monto", getattr(self.instance, "monto", None))

        if monto is not None and inicial > monto:
            raise serializers.ValidationError({
                "inicial": "El inicial no puede ser mayor al monto total"
            })

        productos = self.initial_data.get("productos")
        if productos:
            if not isinstance(productos, list):
                raise serializers.ValidationError({
                    "productos": "Los productos deben enviarse como lista"
                })

            productos_normalizados = self._normalizar_items(productos)
            data["productos"] = productos_normalizados

            total_cantidad = sum(item["cantidad"] for item in productos_normalizados)
            total_precio = sum(item["precio_total"] for item in productos_normalizados)

            data["cantidad"] = total_cantidad
            data["precio_total"] = total_precio

        return data

    def create(self, validated_data):
        productos_data = validated_data.pop("productos", None)
        producto_data = validated_data.pop("producto", None)

        if productos_data:
            producto_principal = productos_data[0]["producto"]
        else:
            producto_principal = self._resolver_producto_legacy(producto_data)

        monto = validated_data.get("monto", Decimal("0.00"))
        inicial = validated_data.get("inicial", Decimal("0.00"))
        validated_data["saldo_pendiente"] = monto - inicial

        if inicial > 0:
            validated_data["primer_pago_registrado"] = True
            validated_data["fecha_inicial"] = validated_data.get("fecha_venta")

        venta = Venta.objects.create(
            producto=producto_principal,
            **validated_data,
        )

        if productos_data:
            self._sincronizar_items(venta, productos_data)
        else:
            self._sincronizar_items_legacy(venta, producto_principal)

        return venta

    def update(self, instance, validated_data):
        productos_data = validated_data.pop("productos", None)
        producto_data = validated_data.pop("producto", None)

        if "monto" in validated_data or "inicial" in validated_data:
            monto = validated_data.get("monto", instance.monto)
            inicial = validated_data.get("inicial", instance.inicial)
            validated_data["saldo_pendiente"] = monto - inicial

        instance = super().update(instance, validated_data)

        if productos_data:
            instance.producto = productos_data[0]["producto"]
            instance.cantidad = sum(item["cantidad"] for item in productos_data)
            instance.precio_total = sum(item["precio_total"] for item in productos_data)
            instance.save(update_fields=["producto", "cantidad", "precio_total"])
            self._sincronizar_items(instance, productos_data)
        elif producto_data:
            producto_resuelto = self._resolver_producto_legacy(producto_data)

            if instance.items.count() <= 1:
                instance.producto = producto_resuelto
                instance.save(update_fields=["producto"])
                self._sincronizar_items_legacy(instance, producto_resuelto)

        return instance

    def validate_numero_contrato(self, value):
        qs = Venta.objects.filter(numero_contrato=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("Contrato ya está registrado")

        return value

    def _resolver_producto_legacy(self, producto_data):
        if not producto_data:
            raise serializers.ValidationError({
                "producto": "Selecciona al menos un producto"
            })

        if isinstance(producto_data, int):
            return Producto.objects.get(pk=producto_data)

        if isinstance(producto_data, dict):
            producto, _ = Producto.objects.get_or_create(
                nombre=producto_data["nombre"],
                defaults={"categoria": producto_data.get("categoria", "otros")},
            )
            return producto

        raise serializers.ValidationError({
            "producto": "Formato de producto inválido"
        })

    def _normalizar_items(self, productos):
        items = []
        for producto_data in productos:
            if not isinstance(producto_data, dict):
                raise serializers.ValidationError({
                    "productos": "Cada item debe ser un objeto válido"
                })

            nombre = producto_data.get("nombre")
            if not nombre:
                raise serializers.ValidationError({
                    "productos": "Cada item debe tener nombre de producto"
                })

            producto, _ = Producto.objects.get_or_create(
                nombre=nombre,
                defaults={"categoria": producto_data.get("categoria", "otros")},
            )

            cantidad = int(producto_data.get("cantidad") or 1)
            precio_total = Decimal(str(producto_data.get("precio_total") or "0"))

            if cantidad < 1:
                raise serializers.ValidationError({
                    "productos": f"La cantidad de {nombre} debe ser al menos 1"
                })

            if precio_total <= 0:
                raise serializers.ValidationError({
                    "productos": f"El monto de {nombre} debe ser mayor a 0"
                })

            items.append({
                "producto": producto,
                "cantidad": cantidad,
                "precio_total": precio_total,
            })

        if not items:
            raise serializers.ValidationError({
                "productos": "Agrega al menos un producto"
            })

        return items

    def _sincronizar_items(self, venta, productos_data):
        venta.items.all().delete()

        VentaItem.objects.bulk_create(
            [
                VentaItem(
                    venta=venta,
                    producto=item["producto"],
                    cantidad=item["cantidad"],
                    precio_total=item["precio_total"],
                )
                for item in productos_data
            ]
        )

    def _sincronizar_items_legacy(self, venta, producto):
        venta.items.all().delete()
        VentaItem.objects.create(
            venta=venta,
            producto=producto,
            cantidad=venta.cantidad or 1,
            precio_total=venta.precio_total,
        )

    def _serializar_items(self, venta):
        items = venta.obtener_items_producto()
        return [
            {
                "id": item.id if getattr(item, "id", None) else None,
                "producto_id": item.producto_id,
                "nombre": item.producto.nombre if item.producto_id else "",
                "categoria": item.producto.categoria if item.producto_id else "",
                "cantidad": item.cantidad,
                "precio_total": str(item.precio_total),
            }
            for item in items
        ]


class VentaListLiteSerializer(serializers.ModelSerializer):
    cobrador_nombre = serializers.CharField(source="cobrador.nombre", read_only=True)
    cliente = serializers.SerializerMethodField()
    producto_nombre = serializers.SerializerMethodField()
    ultimo_pago_fecha = serializers.DateField(read_only=True)
    ultimo_pago_monto = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Venta
        fields = [
            "id",
            "numero_contrato",
            "fecha_venta",
            "nombre",
            "apellido",
            "cliente",
            "direccion",
            "lugar",
            "zona",
            "producto",
            "producto_nombre",
            "cantidad",
            "precio_total",
            "monto",
            "inicial",
            "saldo_pendiente",
            "ultimo_pago_fecha",
            "ultimo_pago_monto",
            "frecuencia_pago",
            "monto_frecuencia",
            "dia_cobro",
            "fecha_inicial",
            "fecha_primer_cobro",
            "primer_pago_registrado",
            "vendedor",
            "cobrador",
            "cobrador_nombre",
            "estado",
            "entregado_cobrador",
            "fecha_entrega_cobrador",
            "fecha_registro",
            "usuario_registro",
        ]

    def get_cliente(self, obj):
        return f"{obj.nombre} {obj.apellido}"

    def get_producto_nombre(self, obj):
        return obj.obtener_productos_resumen()


class VentaDashboardSerializer(serializers.ModelSerializer):
    cobrador_nombre = serializers.CharField(source="cobrador.nombre", read_only=True)
    cliente = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = [
            "id",
            "numero_contrato",
            "fecha_venta",
            "nombre",
            "apellido",
            "cliente",
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
            "cobrador_nombre",
            "estado",
            "entregado_cobrador",
            "fecha_entrega_cobrador",
        ]

    def get_cliente(self, obj):
        return f"{obj.nombre} {obj.apellido}"


class VentaControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = [
            "id",
            "numero_contrato",
            "fecha_venta",
            "nombre",
            "apellido",
            "direccion",
            "zona",
            "frecuencia_pago",
            "monto_frecuencia",
            "fecha_inicial",
            "saldo_pendiente",
            "estado",
            "cobrador",
        ]
