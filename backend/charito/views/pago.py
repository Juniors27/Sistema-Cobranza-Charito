from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.dateparse import parse_date
from charito.serializers.pago import PagoSerializer, PagoReporteSerializer, HistorialPagosSerializer
from ..models.pago import Pago


class RegistrarPagoView(APIView):
    def post(self, request):
        serializer = PagoSerializer(data=request.data)

        if serializer.is_valid():
            try:
                pago = serializer.save(
                    usuario_registro=request.user if request.user.is_authenticated else None
                )
                return Response(
                    {
                        "mensaje": "Pago registrado correctamente",
                        "saldo_pendiente": pago.venta.saldo_pendiente,
                        "estado_venta": pago.venta.estado,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListarPagosView(APIView):
    """
    Devuelve todos los pagos en JSON
    """

    def get(self, request):
        pagos = Pago.objects.all().select_related("venta", "cobrador")
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)


class ReporteCobranzaView(APIView):
    def get(self, request):
        pagos = Pago.objects.select_related("venta", "cobrador").prefetch_related("venta__items__producto").filter(es_descuento=False)

        fecha = request.query_params.get("fecha")
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")
        cobrador_id = request.query_params.get("cobrador")

        if fecha:
            pagos = pagos.filter(fecha_pago=parse_date(fecha))

        if fecha_inicio and fecha_fin:
            pagos = pagos.filter(
                fecha_pago__range=[
                    parse_date(fecha_inicio),
                    parse_date(fecha_fin),
                ]
            )

        if cobrador_id:
            pagos = pagos.filter(cobrador_id=cobrador_id)

        serializer = PagoReporteSerializer(pagos, many=True)
        return Response(serializer.data)


class HistorialPagosVentaView(APIView):
    """
    Devuelve el historial de movimientos de una venta específica.
    Incluye la inicial registrada al crear la venta y los pagos posteriores.
    """

    def get(self, request, venta_id):
        try:
            from ..models.venta import Venta

            venta = Venta.objects.get(id=venta_id)
            pagos = (
                Pago.objects.filter(venta_id=venta_id)
                .select_related("venta")
                .order_by("fecha_pago")
            )

            saldo_acumulado = venta.monto
            data = []

            if venta.inicial > 0 and venta.fecha_inicial:
                saldo_acumulado -= venta.inicial
                data.append(
                    {
                        "id": f"inicial-{venta.id}",
                        "fecha_pago": venta.fecha_inicial.strftime("%d-%m-%Y"),
                        "monto": float(venta.inicial),
                        "saldo_despues_pago": float(saldo_acumulado),
                        "tipo_movimiento": "inicial",
                    }
                )

            for pago in pagos:
                saldo_acumulado -= pago.monto
                data.append(
                    {
                        "id": pago.id,
                        "fecha_pago": pago.fecha_pago.strftime("%d-%m-%Y"),
                        "monto": float(pago.monto),
                        "saldo_despues_pago": float(saldo_acumulado),
                        "tipo_movimiento": "pago",
                    }
                )

            return Response(data, status=status.HTTP_200_OK)

        except Venta.DoesNotExist:
            return Response(
                {"error": "Venta no encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            import traceback

            print(traceback.format_exc())

            return Response(
                {"error": f"Error al obtener historial: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EditarPagoView(APIView):
    """
    Edita un pago existente y recalcula el saldo de la venta
    """

    def patch(self, request, pago_id):
        try:
            pago = Pago.objects.select_related("venta").get(id=pago_id)
            venta = pago.venta

            monto_anterior = pago.monto

            nuevo_monto = request.data.get("monto")
            nueva_fecha = request.data.get("fecha_pago")
            nuevo_cobrador = request.data.get("cobrador")

            saldo_disponible = venta.saldo_pendiente + monto_anterior

            if nuevo_monto and float(nuevo_monto) > float(saldo_disponible):
                return Response(
                    {
                        "error": (
                            f"El nuevo monto (S/ {nuevo_monto}) excede el saldo disponible "
                            f"(S/ {saldo_disponible})"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            venta.saldo_pendiente += monto_anterior

            if nuevo_monto:
                pago.monto = nuevo_monto
            if nueva_fecha:
                pago.fecha_pago = parse_date(nueva_fecha)
            if nuevo_cobrador:
                pago.cobrador_id = nuevo_cobrador

            venta.saldo_pendiente -= pago.monto

            if venta.saldo_pendiente == 0:
                venta.estado = "cancelado"
            elif venta.saldo_pendiente > 0 and venta.estado == "cancelado":
                venta.estado = "controlar"

            pago.save()
            venta.save()

            serializer = PagoSerializer(pago)

            return Response(
                {
                    "mensaje": "Pago actualizado correctamente",
                    "pago": serializer.data,
                    "saldo_pendiente": float(venta.saldo_pendiente),
                    "estado_venta": venta.estado,
                },
                status=status.HTTP_200_OK,
            )

        except Pago.DoesNotExist:
            return Response(
                {"error": "Pago no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            import traceback

            print(traceback.format_exc())
            return Response(
                {"error": f"Error al actualizar pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class EliminarPagoView(APIView):
    """
    Elimina un pago y recalcula el saldo de la venta
    Solo permite eliminar el último pago registrado de cada contrato
    """

    def delete(self, request, pago_id):
        try:
            pago = Pago.objects.select_related("venta").get(id=pago_id)
            venta = pago.venta

            ultimo_pago = Pago.objects.filter(venta=venta).order_by("-fecha_pago", "-fecha_registro").first()

            if pago.id != ultimo_pago.id:
                return Response(
                    {"error": "Solo se puede eliminar el último pago registrado del contrato"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            monto_eliminado = pago.monto
            era_primer_pago = pago.es_primer_pago

            venta.saldo_pendiente += monto_eliminado

            if era_primer_pago:
                venta.primer_pago_registrado = False
                venta.fecha_inicial = None

            if venta.estado == "cancelado":
                venta.estado = "controlar"

            pagos_restantes = Pago.objects.filter(venta=venta).exclude(id=pago.id).exists()
            if not pagos_restantes:
                venta.primer_pago_registrado = False

            venta.save()
            pago.delete()

            return Response(
                {
                    "mensaje": "Pago eliminado correctamente",
                    "saldo_pendiente": float(venta.saldo_pendiente),
                    "estado_venta": venta.estado,
                    "primer_pago_registrado": venta.primer_pago_registrado,
                },
                status=status.HTTP_200_OK,
            )

        except Pago.DoesNotExist:
            return Response(
                {"error": "Pago no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            import traceback

            print(traceback.format_exc())
            return Response(
                {"error": f"Error al eliminar pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ObtenerUltimoPagoView(APIView):
    """
    Obtiene el último pago registrado para un contrato específico
    """

    def get(self, request, numero_contrato):
        try:
            from ..models.venta import Venta

            venta = Venta.objects.prefetch_related("items__producto").get(numero_contrato=numero_contrato)
            ultimo_pago = Pago.objects.filter(venta=venta).order_by("-fecha_pago", "-fecha_registro").first()

            if not ultimo_pago:
                return Response(
                    {"mensaje": "No se encontraron pagos para este contrato"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = PagoSerializer(ultimo_pago)

            return Response(
                {
                    "pago": serializer.data,
                    "venta_id": venta.id,
                    "numero_contrato": venta.numero_contrato,
                    "cliente": f"{venta.nombre} {venta.apellido}",
                    "producto": venta.obtener_productos_resumen(),
                    "saldo_pendiente": float(venta.saldo_pendiente),
                },
                status=status.HTTP_200_OK,
            )

        except Venta.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            import traceback

            print(traceback.format_exc())
            return Response(
                {"error": f"Error al obtener último pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
