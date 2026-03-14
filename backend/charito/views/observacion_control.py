from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models.observacion_control import ObservacionControl
from ..models.venta import Venta
from ..serializers.observacion_control import ObservacionControlSerializer


class ObservacionesControlListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        observaciones = ObservacionControl.objects.all().select_related("venta")
        serializer = ObservacionControlSerializer(observaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ObservacionesControlView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, venta_id):
        observaciones = ObservacionControl.objects.filter(venta_id=venta_id)
        serializer = ObservacionControlSerializer(observaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, venta_id):
        try:
            Venta.objects.get(id=venta_id)
        except Venta.DoesNotExist:
            return Response(
                {"detail": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        payload = {**request.data, "venta": venta_id}
        serializer = ObservacionControlSerializer(data=payload)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ObservacionControlDetalleView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, observacion_id):
        try:
            observacion = ObservacionControl.objects.get(id=observacion_id)
        except ObservacionControl.DoesNotExist:
            return Response(
                {"detail": "Observacion no encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ObservacionControlSerializer(
            observacion,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, observacion_id):
        try:
            observacion = ObservacionControl.objects.get(id=observacion_id)
        except ObservacionControl.DoesNotExist:
            return Response(
                {"detail": "Observacion no encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        observacion.delete()
        return Response(
            {"detail": "Observacion eliminada"},
            status=status.HTTP_200_OK,
        )
