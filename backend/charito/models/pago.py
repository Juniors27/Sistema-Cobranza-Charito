from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from .venta import Venta
from .cobrador import Cobrador



class Pago(models.Model):
    """Modelo para registrar pagos de los clientes"""
    
    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name='pagos',
        verbose_name="Contrato"
    )
    fecha_pago = models.DateField(verbose_name="Fecha de pago")
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Monto pagado"
    )
    cobrador = models.ForeignKey(
        Cobrador,
        on_delete=models.PROTECT,
        related_name='pagos_cobrados',
        verbose_name="Cobrador que recibió el pago"
    )
    es_primer_pago = models.BooleanField(
        default=False,
        verbose_name="Es el primer pago"
    )
    es_descuento = models.BooleanField(
    default=False,
    verbose_name="Es descuento"
)

    
    # Metadata
    fecha_registro = models.DateTimeField(auto_now_add=True)
    usuario_registro = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='pagos_registrados',
        verbose_name="Usuario que registró"
    )
    notas = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notas adicionales"
    )
    
    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['-fecha_pago', '-fecha_registro']
        indexes = [
            models.Index(fields=['fecha_pago']),
            models.Index(fields=['cobrador', 'fecha_pago']),
            models.Index(fields=['venta', '-fecha_pago', '-fecha_registro']),
        ]
    
    def __str__(self):
        return f"Pago {self.venta.numero_contrato} - S/ {self.monto} - {self.fecha_pago}"
    
    def save(self, *args, **kwargs):
        """Actualiza el saldo pendiente de la venta al registrar un pago"""
        es_nuevo = not self.pk
        
        if es_nuevo:
            # Validar que el monto no exceda el saldo pendiente
            if self.monto > self.venta.saldo_pendiente:
                raise ValueError(
                    f"El monto del pago (S/ {self.monto}) no puede ser mayor "
                    f"al saldo pendiente (S/ {self.venta.saldo_pendiente})"
                )
            
            # Actualizar saldo pendiente
            self.venta.saldo_pendiente -= self.monto
            
            # Actualizar estado si es el primer pago
            if self.es_primer_pago:
                self.venta.primer_pago_registrado = True
                if not self.venta.fecha_inicial:
                    self.venta.fecha_inicial = self.fecha_pago
            
            # Cambiar estado a cancelado si el saldo llega a 0
            if self.venta.saldo_pendiente == 0:
                self.venta.estado = 'cancelado'
            
            self.venta.save()
        
        super().save(*args, **kwargs)