from django.db import models



class Cobrador(models.Model):
    """Modelo para gestionar cobradores del sistema"""
    
    ZONAS = [
        ('milagro', 'Milagro'),
        ('huanchaco', 'Huanchaco'),
        ('buenos aires', 'Buenos Aires'),
    ]
    
    nombre = models.CharField(max_length=100, verbose_name="Nombre completo")
    zona = models.CharField(max_length=20, choices=ZONAS, verbose_name="Zona asignada")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Cobrador"
        verbose_name_plural = "Cobradores"
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} - {self.get_zona_display()}"
    
    def total_clientes(self):
        """Retorna el número de clientes activos asignados"""
        return self.ventas.filter(saldo_pendiente__gt=0).count()
