from django.db import migrations, models


def poblar_lote_desde_fecha(apps, schema_editor):
    Venta = apps.get_model("charito", "Venta")

    for venta in Venta.objects.all().only("id", "fecha_venta"):
        lote = f"{venta.fecha_venta.year % 100:02d}" if venta.fecha_venta else ""
        Venta.objects.filter(pk=venta.pk).update(lote=lote)


def limpiar_lote(apps, schema_editor):
    Venta = apps.get_model("charito", "Venta")
    Venta.objects.all().update(lote="")


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0010_venta_fecha_recogido"),
    ]

    operations = [
        migrations.AddField(
            model_name="venta",
            name="lote",
            field=models.CharField(blank=True, db_index=True, default="", editable=False, max_length=2),
            preserve_default=False,
        ),
        migrations.RunPython(poblar_lote_desde_fecha, limpiar_lote),
        migrations.AlterField(
            model_name="venta",
            name="numero_contrato",
            field=models.CharField(max_length=50),
        ),
        migrations.AddConstraint(
            model_name="venta",
            constraint=models.UniqueConstraint(fields=("lote", "numero_contrato"), name="unique_lote_numero_contrato"),
        ),
    ]
