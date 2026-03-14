from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0005_pago_es_descuento"),
    ]

    operations = [
        migrations.AddField(
            model_name="venta",
            name="entregado_cobrador",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="venta",
            name="fecha_entrega_cobrador",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="venta",
            name="fecha_primer_cobro",
            field=models.DateField(blank=True, null=True),
        ),
    ]
