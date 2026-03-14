from django.contrib import admin
from django.urls import path
from charito.views.cobrador import CobradorViewSet, CobradorListView
from charito.views.venta import VentaViewSet, VentaListView, ValidarContratoView, ProgramacionPrimerCobroView
from charito.views.cliente import ListaClientesView
from charito.views.pago import RegistrarPagoView, ListarPagosView, ReporteCobranzaView, HistorialPagosVentaView, EditarPagoView, EliminarPagoView, ObtenerUltimoPagoView
from charito.views.observacion_control import (
    ObservacionControlDetalleView,
    ObservacionesControlListView,
    ObservacionesControlView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/cobradores/',CobradorViewSet.as_view({'get': 'list','post': 'create',}), name='cobrador-list'),
    path('api/cobradores/<int:pk>/',CobradorViewSet.as_view({'get': 'retrieve','put': 'update','delete': 'destroy',
        }),name='cobrador-detail'),
    path('api/ventas/', VentaViewSet.as_view({'get': 'list', 'post': 'create',}), name='venta-list'),
    path('api/ventas/<int:pk>/', VentaViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update','put': 'update', 'delete': 'destroy',}),
        name='venta-detail'),
   
    path('api/lista/ventas/', VentaListView.as_view(), name='ventas-list'),
    path('api/lista/cobradores/', CobradorListView.as_view(), name='cobradores-list'),
    path("api/lista/clientes/", ListaClientesView.as_view(), name="lista-clientes"),
    path('api/pagos/registrar/', RegistrarPagoView.as_view(), name='registrar-pago'),
    path('api/pagos/', ListarPagosView.as_view(), name='listar-pagos'), 
    path("api/reporte/cobranza/", ReporteCobranzaView.as_view(),name="reporte-cobranza"),
    path("api/ventas/validar/<str:numero_contrato>/", ValidarContratoView.as_view(), name="validar-contrato"),
    path('api/ventas/<int:pk>/programacion-primer-cobro/', ProgramacionPrimerCobroView.as_view(), name='venta-programacion-primer-cobro'),
    path('api/historial-pagos/<int:venta_id>/', HistorialPagosVentaView.as_view(), name='historial-pagos'),
    
     #Nuevas rutas para editar y eliminar pagos
    path('api/pagos/<int:pago_id>/editar/', EditarPagoView.as_view(), name='editar-pago'),
    path('api/pagos/<int:pago_id>/eliminar/', EliminarPagoView.as_view(), name='eliminar-pago'),
    path('api/pagos/ultimo/<str:numero_contrato>/', ObtenerUltimoPagoView.as_view(), name='obtener-ultimo-pago'),
    path('api/control-observaciones/', ObservacionesControlListView.as_view(), name='control-observaciones-lista'),
    path('api/control-observaciones/<int:venta_id>/', ObservacionesControlView.as_view(), name='control-observaciones'),
    path('api/control-observaciones/detalle/<int:observacion_id>/', ObservacionControlDetalleView.as_view(), name='control-observaciones-detalle'),
]
     

