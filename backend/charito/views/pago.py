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
                pago = serializer.save(usuario_registro=request.user 
                                       if request.user.is_authenticated 
                                       else None)                
                return Response(
                    {
                        "mensaje": "Pago registrado correctamente",
                        "saldo_pendiente": pago.venta.saldo_pendiente,
                        "estado_venta": pago.venta.estado
                    },
                    status=status.HTTP_201_CREATED
                )
            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class ListarPagosView(APIView):
    """
    Devuelve todos los pagos en JSON
    """
    def get(self, request):
        pagos = Pago.objects.all().select_related('venta', 'cobrador')
        serializer = PagoSerializer(pagos, many=True)
        return Response(serializer.data)
    

class ReporteCobranzaView(APIView):

    def get(self, request):
        pagos = Pago.objects.select_related("venta", "cobrador") \
                            .filter(es_descuento=False)  

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
                    parse_date(fecha_fin)
                ]
            )

        if cobrador_id:
            pagos = pagos.filter(cobrador_id=cobrador_id)

        serializer = PagoReporteSerializer(pagos, many=True)
        return Response(serializer.data)

# 🆕 NUEVA VISTA PARA HISTORIAL DE PAGOS
class HistorialPagosVentaView(APIView):
    """
    Devuelve el historial completo de pagos de una venta específica
    ordenados por fecha de pago con saldos calculados
    """
    def get(self, request, venta_id):
        try:
            # Obtener la venta para saber el monto total y saldo actual
            from ..models.venta import Venta
            venta = Venta.objects.get(id=venta_id)
            
            # Filtrar pagos por venta_id y ordenar por fecha
            pagos = Pago.objects.filter(
                venta_id=venta_id
            ).select_related('venta').order_by('fecha_pago')
            
            if not pagos.exists():
                return Response(
                    {"mensaje": "No se encontraron pagos para esta venta"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Calcular el saldo después de cada pago
            monto_total_venta = venta.monto  # Asumiendo que tienes este campo
            saldo_acumulado = monto_total_venta
            
            data = []
            for pago in pagos:
                saldo_acumulado -= pago.monto
                data.append({
                    'id': pago.id,
                    'fecha_pago': pago.fecha_pago.strftime('%d-%m-%Y'),
                    'monto': float(pago.monto),
                    'saldo_despues_pago': float(saldo_acumulado),
                })
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Venta.DoesNotExist:
            return Response(
                {"error": "Venta no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            
            return Response(
                {"error": f"Error al obtener historial: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            

# Agregar estas vistas a tu archivo de vistas de pagos

class EditarPagoView(APIView):
    """
    Edita un pago existente y recalcula el saldo de la venta
    """
    def patch(self, request, pago_id):
        try:
            pago = Pago.objects.select_related('venta').get(id=pago_id)
            venta = pago.venta
            
            # Guardar el monto anterior para recalcular
            monto_anterior = pago.monto
            
            # Obtener los nuevos datos
            nuevo_monto = request.data.get('monto')
            nueva_fecha = request.data.get('fecha_pago')
            nuevo_cobrador = request.data.get('cobrador')
            
            # Validar que el nuevo monto no sea mayor al saldo disponible
            # Saldo disponible = saldo actual + monto que se va a devolver - nuevo monto
            saldo_disponible = venta.saldo_pendiente + monto_anterior
            
            if nuevo_monto and float(nuevo_monto) > float(saldo_disponible):
                return Response(
                    {"error": f"El nuevo monto (S/ {nuevo_monto}) excede el saldo disponible (S/ {saldo_disponible})"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Revertir el efecto del pago anterior en el saldo
            venta.saldo_pendiente += monto_anterior
            
            # Actualizar los campos del pago
            if nuevo_monto:
                pago.monto = nuevo_monto
            if nueva_fecha:
                pago.fecha_pago = parse_date(nueva_fecha)
            if nuevo_cobrador:
                pago.cobrador_id = nuevo_cobrador
            
            # Aplicar el nuevo monto al saldo
            venta.saldo_pendiente -= pago.monto
            
            # Actualizar estado de la venta
            if venta.saldo_pendiente == 0:
                venta.estado = 'cancelado'
            elif venta.saldo_pendiente > 0 and venta.estado == 'cancelado':
                venta.estado = 'controlar'  # Volver al estado anterior si ya no está cancelado
            
            # Guardar cambios
            pago.save()
            venta.save()
            
            serializer = PagoSerializer(pago)
            
            return Response(
                {
                    "mensaje": "Pago actualizado correctamente",
                    "pago": serializer.data,
                    "saldo_pendiente": float(venta.saldo_pendiente),
                    "estado_venta": venta.estado
                },
                status=status.HTTP_200_OK
            )
            
        except Pago.DoesNotExist:
            return Response(
                {"error": "Pago no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": f"Error al actualizar pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EliminarPagoView(APIView):
    """
    Elimina un pago y recalcula el saldo de la venta
    Solo permite eliminar el último pago registrado de cada contrato
    """
    def delete(self, request, pago_id):
        try:
            pago = Pago.objects.select_related('venta').get(id=pago_id)
            venta = pago.venta
            
            # Verificar que sea el último pago del contrato
            ultimo_pago = Pago.objects.filter(venta=venta).order_by('-fecha_pago', '-fecha_registro').first()
            
            if pago.id != ultimo_pago.id:
                return Response(
                    {"error": "Solo se puede eliminar el último pago registrado del contrato"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Guardar datos antes de eliminar
            monto_eliminado = pago.monto
            era_primer_pago = pago.es_primer_pago
            
            # Revertir el saldo
            venta.saldo_pendiente += monto_eliminado
            
            # Si era el primer pago, actualizar el flag
            if era_primer_pago:
                venta.primer_pago_registrado = False
                venta.fecha_inicial = None
            
            # Actualizar estado de la venta
            # Si estaba cancelado, volver a controlar
            if venta.estado == 'cancelado':
                venta.estado = 'controlar'
            
            # Verificar si quedan más pagos
            pagos_restantes = Pago.objects.filter(venta=venta).exclude(id=pago.id).exists()
            if not pagos_restantes:
                venta.primer_pago_registrado = False
            
            # Guardar venta y eliminar pago
            venta.save()
            pago.delete()
            
            return Response(
                {
                    "mensaje": "Pago eliminado correctamente",
                    "saldo_pendiente": float(venta.saldo_pendiente),
                    "estado_venta": venta.estado,
                    "primer_pago_registrado": venta.primer_pago_registrado
                },
                status=status.HTTP_200_OK
            )
            
        except Pago.DoesNotExist:
            return Response(
                {"error": "Pago no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": f"Error al eliminar pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ObtenerUltimoPagoView(APIView):
    """
    Obtiene el último pago registrado para un contrato específico
    """
    def get(self, request, numero_contrato):
        try:
            from ..models.venta import Venta
            
            venta = Venta.objects.get(numero_contrato=numero_contrato)
            ultimo_pago = Pago.objects.filter(venta=venta).order_by('-fecha_pago', '-fecha_registro').first()
            
            if not ultimo_pago:
                return Response(
                    {"mensaje": "No se encontraron pagos para este contrato"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = PagoSerializer(ultimo_pago)
            
            return Response(
                {
                    "pago": serializer.data,
                    "venta_id": venta.id,
                    "numero_contrato": venta.numero_contrato,
                    "cliente": f"{venta.nombre} {venta.apellido}",
                    "producto": venta.producto.nombre,
                    "saldo_pendiente": float(venta.saldo_pendiente)
                },
                status=status.HTTP_200_OK
            )
            
        except Venta.DoesNotExist:
            return Response(
                {"error": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": f"Error al obtener último pago: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )