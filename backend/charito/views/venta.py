from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from django.utils.dateparse import parse_date
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import OuterRef, Prefetch, Subquery
from rest_framework.filters import SearchFilter, OrderingFilter
from ..models.venta import Venta, VentaItem
from ..serializers.venta import (
    VentaControlSerializer,
    VentaDashboardSerializer,
    VentaListLiteSerializer,
    VentaSerializer,
)
from ..models.pago import Pago


class VentaViewSet(ModelViewSet):
    queryset = Venta.objects.select_related(
        'producto',
        'cobrador',
        'usuario_registro'
    ).prefetch_related('items__producto')
    serializer_class = VentaSerializer
    permission_classes = [AllowAny]

    # Filtros y búsqueda
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter
    ]

    filterset_fields = [
        'zona',
        'estado',
        'cobrador',
        'producto',
        'frecuencia_pago',
    ]

    search_fields = [
        'numero_contrato',
        'nombre',
        'apellido',
        'direccion',
    ]

    ordering_fields = [
        'fecha_venta',
        'fecha_registro',
        'saldo_pendiente',
    ]

    ordering = ['-fecha_venta']

    def create(self, request, *args, **kwargs):
        """Override create para mejor debugging"""
        print("\n" + "="*50)
        print("📥 DATOS RECIBIDOS:")
        print("="*50)
        for key, value in request.data.items():
            print(f"  {key}: {value} (type: {type(value).__name__})")
        print("="*50 + "\n")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print("\n" + "="*50)
            print("❌ ERRORES DE VALIDACIÓN:")
            print("="*50)
            for field, errors in serializer.errors.items():
                print(f"  {field}: {errors}")
            print("="*50 + "\n")
            
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Asignar usuario si está autenticado
        if request.user.is_authenticated:
            serializer.save(usuario_registro=request.user)
        else:
            serializer.save()
        
        headers = self.get_success_headers(serializer.data)
        
        print("\n" + "="*50)
        print("✅ VENTA CREADA EXITOSAMENTE")
        print("="*50)
        print(f"  ID: {serializer.data.get('id')}")
        print(f"  Contrato: {serializer.data.get('numero_contrato')}")
        print(f"  Cliente: {serializer.data.get('cliente')}")
        print("="*50 + "\n")
        
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
        
class VentaListView(ListAPIView):
    serializer_class = VentaListLiteSerializer

    def get_serializer_class(self):
        if self.request.query_params.get("detallado") == "1":
            return VentaSerializer
        modulo = self.request.query_params.get("modulo")
        if modulo == "dashboard":
            return VentaDashboardSerializer
        if modulo == "control":
            return VentaControlSerializer
        return VentaListLiteSerializer

    def get_queryset(self):
        ultimo_pago = Pago.objects.filter(
            venta=OuterRef('pk')
        ).order_by('-fecha_pago', '-fecha_registro')
        modulo = self.request.query_params.get("modulo")

        if modulo == "dashboard":
            queryset = Venta.objects.select_related("cobrador").only(
                "id",
                "numero_contrato",
                "fecha_venta",
                "nombre",
                "apellido",
                "zona",
                "monto",
                "inicial",
                "saldo_pendiente",
                "fecha_primer_cobro",
                "primer_pago_registrado",
                "cobrador",
                "cobrador__nombre",
                "estado",
                "entregado_cobrador",
                "fecha_entrega_cobrador",
            ).order_by("-fecha_venta")
        elif modulo == "control":
            queryset = Venta.objects.only(
                "id",
                "numero_contrato",
                "fecha_venta",
                "nombre",
                "apellido",
                "direccion",
                "zona",
                "frecuencia_pago",
                "fecha_inicial",
                "saldo_pendiente",
                "estado",
                "cobrador",
            ).order_by("-fecha_venta")
        else:
            items_prefetch = Prefetch(
                "items",
                queryset=VentaItem.objects.select_related("producto").only(
                    "id",
                    "venta_id",
                    "producto_id",
                    "cantidad",
                    "precio_total",
                    "producto__id",
                    "producto__nombre",
                    "producto__categoria",
                ),
            )

            queryset = Venta.objects.select_related(
                'producto',
                'cobrador'
            ).prefetch_related(items_prefetch).annotate(
                ultimo_pago_fecha=Subquery(
                    ultimo_pago.values('fecha_pago')[:1]
                ),
                ultimo_pago_monto=Subquery(
                    ultimo_pago.values('monto')[:1]
                )
            ).order_by('-fecha_venta')

        # 🔹 filtro por mes
        mes = self.request.query_params.get('mes')
        if mes:
            try:
                year, month = mes.split('-')
                queryset = queryset.filter(
                    fecha_venta__year=year,
                    fecha_venta__month=month
                )
            except ValueError:
                pass

        # 🔹 filtro por rango
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')

        if fecha_inicio and fecha_fin:
            inicio = parse_date(fecha_inicio)
            fin = parse_date(fecha_fin)

            if inicio and fin:
                queryset = queryset.filter(
                    fecha_venta__gte=inicio,
                    fecha_venta__lte=fin
                )

        return queryset
    
class ValidarContratoView(APIView):
    def get(self, request, numero_contrato):
        existe = Venta.objects.filter(
            numero_contrato=numero_contrato
        ).exists()

        if existe:
            return Response(
                {"detail": "Contrato ya está registrado"},
                status=status.HTTP_409_CONFLICT
            )

        return Response(
            {"detail": "Contrato disponible"},
            status=status.HTTP_200_OK
        )
        
def partial_update(self, request, *args, **kwargs):
    serializer = self.get_serializer(
        self.get_object(),
        data=request.data,
        partial=True
    )

    if not serializer.is_valid():
        print("❌ ERRORES PATCH:", serializer.errors)
        return Response(serializer.errors, status=400)

    return super().partial_update(request, *args, **kwargs)


class ProgramacionPrimerCobroView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            venta = Venta.objects.get(pk=pk)
        except Venta.DoesNotExist:
            return Response(
                {"detail": "Contrato no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        fecha_primer_cobro = request.data.get("fecha_primer_cobro")
        entregado_cobrador = request.data.get("entregado_cobrador")

        if fecha_primer_cobro is not None:
            if fecha_primer_cobro == "":
                venta.fecha_primer_cobro = None
            else:
                fecha_parseada = parse_date(str(fecha_primer_cobro))
                if not fecha_parseada:
                    return Response(
                        {"fecha_primer_cobro": ["Fecha invalida"]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                venta.fecha_primer_cobro = fecha_parseada

        if entregado_cobrador is not None:
            entregado = str(entregado_cobrador).lower() in ["true", "1", "si", "yes"]
            venta.entregado_cobrador = entregado
            venta.fecha_entrega_cobrador = timezone.localdate() if entregado else None

        venta.save(
            update_fields=[
                "fecha_primer_cobro",
                "entregado_cobrador",
                "fecha_entrega_cobrador",
                "fecha_actualizacion",
            ]
        )

        serializer = VentaSerializer(venta)
        return Response(serializer.data, status=status.HTTP_200_OK)
