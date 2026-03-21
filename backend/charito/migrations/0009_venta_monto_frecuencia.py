from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0008_observacioncontrol"),
    ]

    operations = [
        migrations.AddField(
            model_name="venta",
            name="monto_frecuencia",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
                validators=[MinValueValidator(Decimal("0.00"))],
            ),
        ),
    ]
