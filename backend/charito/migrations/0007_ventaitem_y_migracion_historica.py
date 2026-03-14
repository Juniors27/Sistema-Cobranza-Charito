from django.db import migrations, models
import django.db.models.deletion
from decimal import Decimal


def migrar_items_historicos(apps, schema_editor):
    Venta = apps.get_model("charito", "Venta")
    VentaItem = apps.get_model("charito", "VentaItem")

    items = []
    for venta in Venta.objects.all().iterator():
      if not venta.producto_id:
        continue

      items.append(
          VentaItem(
              venta_id=venta.id,
              producto_id=venta.producto_id,
              cantidad=venta.cantidad or 1,
              precio_total=venta.precio_total or Decimal("0.01"),
          )
      )

    if items:
      VentaItem.objects.bulk_create(items, batch_size=500)


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0006_venta_fecha_primer_cobro_y_entrega"),
    ]

    operations = [
        migrations.CreateModel(
            name="VentaItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("cantidad", models.PositiveIntegerField(default=1)),
                ("precio_total", models.DecimalField(decimal_places=2, max_digits=10)),
                ("fecha_registro", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
                ("producto", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="items_vendidos", to="charito.producto")),
                ("venta", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="charito.venta")),
            ],
            options={
                "ordering": ["id"],
            },
        ),
        migrations.RunPython(migrar_items_historicos, migrations.RunPython.noop),
    ]
