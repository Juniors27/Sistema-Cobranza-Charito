"use client";
import { useClientes } from "@/src/hooks/useClientes";
import { Paginacion, SectionHeader } from "@/components/ui";
import ClientesFiltros from "./ClientesFiltros";
import ClientesTabla from "./ClientesTabla";
import ClienteEditModal from "./ClienteEditModal";
import ClienteDetalleModal from "./ClienteDetalleModal";
import ClienteDeleteModal from "./ClienteDeleteModal";

export default function ClientesPage() {
  const {
    ventasFiltradas,
    searchTerm,
    exportarExcel,
    setSearchTerm,
    zonaFiltro,
    loading,
    error,
    setZonaFiltro,
    modalEditar,
    setModalEditar,
    modalDetalle,
    modalEliminar,
    ventaDetalle,
    ventaEliminar,
    historialPagos,
    cargandoHistorial,
    eliminandoVenta,
    cargarDatos,
    paginaActual,
    totalPaginas,
    registrosPorPagina,
    indiceInicio,
    indiceFin,
    totalRegistros,
    paginaAnterior,
    cambiarRegistrosPorPagina,
    paginaSiguiente,
    irAPagina,
    ...restCliente
  } = useClientes();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <SectionHeader
        titulo="Gestión de Clientes"
        subtitulo="Administra tus clientes y contratos"
        onRefresh={cargarDatos}
      />
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <ClientesFiltros
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          zonaFiltro={zonaFiltro}
          setZonaFiltro={setZonaFiltro}
          exportarExcel={exportarExcel} // pendiente de implementar
        />
        <ClientesTabla
          ventasPaginadas={ventasFiltradas}
          registrosPorPagina={registrosPorPagina}
          cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
          indiceInicio={indiceInicio}
          indiceFin={indiceFin}
          loading={loading}
          error={error}
          totalRegistros={totalRegistros}
          {...restCliente}
        />
        {totalPaginas > 1 && (
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            paginaAnterior={paginaAnterior}
            paginaSiguiente={paginaSiguiente}
            irAPagina={irAPagina}
          />
        )}
      </div>
      {modalEditar && (
        <ClienteEditModal
          setModalEditar={setModalEditar}
          {...restCliente}
        />
      )}
      {modalDetalle && (
        <ClienteDetalleModal
          ventaDetalle={ventaDetalle}
          historialPagos={historialPagos}
          cargandoHistorial={cargandoHistorial}
          cerrarModalDetalle={restCliente.cerrarModalDetalle}
        />
      )}
      <ClienteDeleteModal
        abierto={modalEliminar}
        venta={ventaEliminar}
        eliminando={eliminandoVenta}
        confirmarEliminacion={restCliente.eliminarVenta}
        cancelarEliminacion={restCliente.cancelarEliminacionVenta}
      />
    </div>
  );
}
