"use client"
import { Paginacion, SectionHeader } from "@/components/ui";
import HistorialFiltros from "./HistorialFiltros"
import HistorialTabla from "./HistorialTabla"
import ObservacionesControlModal from "./ObservacionesControlModal"
import { useControlTarjetas } from "@/src/hooks/useControlTarjetas";

export default function HistorialPage() {
  const {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
    clientesPromesaVencida,
    conteos,
    loading,
    error,
    searchTerm,
    filtro,
    modalObservacionesAbierto,
    ventaObservaciones,
    observacionesControl,
    cargandoObservaciones,
    guardandoObservacion,
    editandoObservacionId,
    formObservacion,
    cargarDatos,
    abrirModalObservaciones,
    cerrarModalObservaciones,
    guardarObservacion,
    iniciarEdicionObservacion,
    cancelarEdicionObservacion,
    borrarObservacion,
    setSearchTerm,
    setFiltro,
    setFormObservacion,
    controlTarjetasExcel,
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
  } = useControlTarjetas();

  return (
    <div className="space-y-6">
      <div className="max-w-screen-2xl mx-auto">
        <SectionHeader
          titulo="Historial"
          subtitulo="Monitorea el estado de tus clientes"
          onRefresh={cargarDatos}
        />

        <HistorialFiltros
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filtro={filtro}
          setFiltro={setFiltro}
          clientesControlar={clientesControlar}
          buenosPagadores={buenosPagadores}
          clientesPromesaVencida={clientesPromesaVencida}
          conteos={conteos}
          controlTarjetasExcel={controlTarjetasExcel}
          ventasFiltradas={ventasFiltradas}
        />

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-[0_18px_38px_rgba(15,23,42,0.06)] p-6">
          <HistorialTabla
            datosPaginados={ventasFiltradas}
            registrosPorPagina={registrosPorPagina}
            cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
            indiceInicio={indiceInicio}
            indiceFin={indiceFin}
            loading={loading}
            error={error}
            totalRegistros={totalRegistros}
            abrirModalObservaciones={abrirModalObservaciones}
            cargarDatos={cargarDatos}
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
      </div>

      <ObservacionesControlModal
        abierto={modalObservacionesAbierto}
        venta={ventaObservaciones}
        observaciones={observacionesControl}
        cargando={cargandoObservaciones}
        guardando={guardandoObservacion}
        editandoObservacionId={editandoObservacionId}
        formObservacion={formObservacion}
        setFormObservacion={setFormObservacion}
        guardarObservacion={guardarObservacion}
        iniciarEdicionObservacion={iniciarEdicionObservacion}
        cancelarEdicionObservacion={cancelarEdicionObservacion}
        borrarObservacion={borrarObservacion}
        onClose={cerrarModalObservaciones}
      />
    </div>
  )
}
