from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0009_venta_monto_frecuencia"),
    ]

    operations = [
        migrations.AddField(
            model_name="venta",
            name="fecha_recogido",
            field=models.DateField(blank=True, null=True),
        ),
    ]
