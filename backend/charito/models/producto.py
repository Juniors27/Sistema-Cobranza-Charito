from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Producto(models.Model):
    """Modelo para catálogo de productos"""
    
    CATEGORIAS = [
        ('camas', 'Camas'),
        ('colchones', 'Colchones'),
        ('roperos', 'Roperos'),
        ('muebles_sala', 'Muebles de Sala'),
        ('comedores', 'Comedores'),
        ('electrodomesticos', 'Electrodomésticos'),
        ('otros', 'Otros'),
    ]
    
    nombre = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="Nombre del producto",
        help_text="Ej: Cama 2 plazas, Colchón Orthopedic, Ropero 4 puertas"
    )
    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIAS,
        default='otros',
        verbose_name="Categoría"
    )
    precio_sugerido = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Precio sugerido",
        help_text="Precio de referencia (opcional)"
    )
    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
        help_text="Desactivar productos que ya no se venden"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción adicional"
    )
    
    # Metadata
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['categoria', 'nombre']
        indexes = [
            models.Index(fields=['nombre']),
            models.Index(fields=['categoria', 'activo']),
        ]
    
    def __str__(self):
        return self.nombre
    
    def total_vendidos(self):
        """Retorna el total de unidades vendidas"""
        return self.ventas.count()
    
    def monto_total_ventas(self):
        """Retorna el monto total en ventas de este producto"""
        from django.db.models import Sum
        total = self.ventas.aggregate(total=Sum('precio_total'))['total']
        return total or Decimal('0.00')
