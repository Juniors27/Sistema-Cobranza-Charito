from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from .cobrador import Cobrador
from .producto import Producto



class Venta(models.Model):

    ZONAS = [
        ('milagro', 'Milagro'),
        ('huanchaco', 'Huanchaco'),
        ('buenos aires', 'Buenos Aires'),
    ]

    FRECUENCIAS_PAGO = [
        ('semanal', 'Semanal'),
        ('quincenal', 'Quincenal'),
        ('mensual', 'Mensual'),
    ]

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('recogido', 'Recogido'),
        ('controlar', 'Controlar'),
        ('bajada', 'Bajada'),
        ('cancelado', 'Cancelado'),
    ]

    # Contrato
    numero_contrato = models.CharField(max_length=50, unique=True)
    fecha_venta = models.DateField()

    # Cliente
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    direccion = models.CharField(max_length=255)
    lugar = models.CharField(max_length=100, blank=True, null=True)
    zona = models.CharField(max_length=20, choices=ZONAS)

    # Producto
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='ventas'
    )
    cantidad = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Cantidad"
    )

    precio_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )

    # Pagos
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    inicial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    saldo_pendiente = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    frecuencia_pago = models.CharField(max_length=20, choices=FRECUENCIAS_PAGO)
    dia_cobro = models.CharField(max_length=50, blank=True, null=True)

    # Control
    fecha_inicial = models.DateField(blank=True, null=True)
    primer_pago_registrado = models.BooleanField(default=False)

    vendedor = models.CharField(max_length=100, blank=True, null=True)
    cobrador = models.ForeignKey(
        Cobrador,
        on_delete=models.PROTECT,
        related_name='ventas'
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    usuario_registro = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='ventas_registradas'
    )

    class Meta:
        ordering = ['-fecha_venta', '-fecha_registro']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.saldo_pendiente = self.monto - self.inicial
            if self.inicial > 0:
                self.primer_pago_registrado = True
                self.fecha_inicial = self.fecha_venta
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero_contrato} - {self.nombre} {self.apellido}"
