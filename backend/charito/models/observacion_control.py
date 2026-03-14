from django.db import models

from .venta import Venta


class ObservacionControl(models.Model):
    RESULTADOS = [
        ("promesa_pago", "Promesa de pago"),
        ("reprogramado", "Reprogramado"),
        ("no_ubicado", "No ubicado"),
        ("fugado", "Fugado"),
        ("bajada", "Tarjeta bajada"),
        ("sin_dinero", "Sin dinero"),
        ("se_niega", "Se niega a pagar"),
        ("visita_pendiente", "Visita pendiente"),
        ("otro", "Otro"),
    ]

    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name="observaciones_control",
    )
    fecha_control = models.DateField()
    tipo_resultado = models.CharField(max_length=30, choices=RESULTADOS)
    observacion = models.TextField()
    # La fecha prometida es opcional y solo aplica cuando hubo compromiso de pago.
    fecha_compromiso_pago = models.DateField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha_control", "-fecha_registro", "-id"]
        indexes = [
            models.Index(fields=["venta", "-fecha_control"]),
            models.Index(fields=["fecha_compromiso_pago"]),
        ]

    def __str__(self):
        return f"{self.venta.numero_contrato} - {self.fecha_control} - {self.tipo_resultado}"
