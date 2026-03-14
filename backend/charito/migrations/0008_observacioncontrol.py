from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("charito", "0007_ventaitem_y_migracion_historica"),
    ]

    operations = [
        migrations.CreateModel(
            name="ObservacionControl",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("fecha_control", models.DateField()),
                ("tipo_resultado", models.CharField(choices=[("promesa_pago", "Promesa de pago"), ("reprogramado", "Reprogramado"), ("no_ubicado", "No ubicado"), ("fugado", "Fugado"), ("bajada", "Tarjeta bajada"), ("sin_dinero", "Sin dinero"), ("se_niega", "Se niega a pagar"), ("visita_pendiente", "Visita pendiente"), ("otro", "Otro")], max_length=30)),
                ("observacion", models.TextField()),
                ("fecha_compromiso_pago", models.DateField(blank=True, null=True)),
                ("fecha_registro", models.DateTimeField(auto_now_add=True)),
                ("venta", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="observaciones_control", to="charito.venta")),
            ],
            options={
                "ordering": ["-fecha_control", "-fecha_registro", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="observacioncontrol",
            index=models.Index(fields=["venta", "-fecha_control"], name="charito_obs_venta_i_26cc1e_idx"),
        ),
        migrations.AddIndex(
            model_name="observacioncontrol",
            index=models.Index(fields=["fecha_compromiso_pago"], name="charito_obs_fecha_cfbf9f_idx"),
        ),
    ]
