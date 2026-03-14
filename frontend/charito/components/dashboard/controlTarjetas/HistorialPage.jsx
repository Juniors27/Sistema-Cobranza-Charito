"use client"
import { usePaginacion } from "@/src/hooks/usePaginacion";
import { Paginacion, SectionHeader } from "@/components/ui";
import HistorialFiltros from "./HistorialFiltros"
import HistorialTabla from "./HistorialTabla"
import { useControlTarjetas } from "@/src/hooks/useControlTarjetas";

export default function HistorialPage() {
  const {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
    cobradores,
    loading,
    error,
    searchTerm,
    filtro,
    ventas,
    pagos,
    obtenerUltimoPago,
    calcularEstadoAutomatico,
    esBuenPagador,
    cargarDatos,
    setSearchTerm,
    setFiltro,
    controlTarjetasExcel,
  } = useControlTarjetas();

  const {
    datosPaginados,
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
  } = usePaginacion(ventasFiltradas);

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
          ventas={ventas}
          pagos={pagos}
          controlTarjetasExcel={controlTarjetasExcel}
          ventasFiltradas={ventasFiltradas}
        />

        <div className="bg-white rounded-[28px] border border-slate-200 shadow-[0_18px_38px_rgba(15,23,42,0.06)] p-6">
          <HistorialTabla
            datosPaginados={datosPaginados}
            registrosPorPagina={registrosPorPagina}
            cambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
            indiceInicio={indiceInicio}
            indiceFin={indiceFin}
            loading={loading}
            error={error}
            totalRegistros={totalRegistros}
            cobradores={cobradores}
            calcularEstadoAutomatico={calcularEstadoAutomatico}
            esBuenPagador={esBuenPagador}
            obtenerUltimoPago={obtenerUltimoPago}
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
    </div>
  )
}
