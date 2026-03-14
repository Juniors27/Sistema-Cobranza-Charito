from rest_framework import serializers

from ..models.observacion_control import ObservacionControl


class ObservacionControlSerializer(serializers.ModelSerializer):
    tipo_resultado_label = serializers.CharField(
        source="get_tipo_resultado_display",
        read_only=True,
    )

    class Meta:
        model = ObservacionControl
        fields = [
            "id",
            "venta",
            "fecha_control",
            "tipo_resultado",
            "tipo_resultado_label",
            "observacion",
            "fecha_compromiso_pago",
            "fecha_registro",
        ]
        read_only_fields = ["id", "fecha_registro"]

    def validate(self, attrs):
        tipo_resultado = attrs.get(
            "tipo_resultado",
            getattr(self.instance, "tipo_resultado", None),
        )
        fecha_compromiso_pago = attrs.get(
            "fecha_compromiso_pago",
            getattr(self.instance, "fecha_compromiso_pago", None),
        )

        requiere_compromiso = tipo_resultado in {"promesa_pago", "reprogramado"}
        if requiere_compromiso and not fecha_compromiso_pago:
            raise serializers.ValidationError(
                {"fecha_compromiso_pago": "Ingresa la fecha prometida de pago"}
            )

        if not requiere_compromiso and fecha_compromiso_pago:
            attrs["fecha_compromiso_pago"] = None

        return attrs
