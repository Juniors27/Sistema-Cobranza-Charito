import { useState, useMemo } from "react";

export const usePaginacion = (datos = [], registrosIniciales = 10) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] =
    useState(registrosIniciales);

  const totalRegistros = datos.length;

  const totalPaginas = useMemo(() => {
    return Math.ceil(totalRegistros / registrosPorPagina) || 1;
  }, [totalRegistros, registrosPorPagina]);

  
  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const indiceInicio = useMemo(() => {
    return (paginaSegura - 1) * registrosPorPagina;
  }, [paginaSegura, registrosPorPagina]);

  const indiceFin = useMemo(() => {
    return indiceInicio + registrosPorPagina;
  }, [indiceInicio, registrosPorPagina]);

  const datosPaginados = useMemo(() => {
    return datos.slice(indiceInicio, indiceFin);
  }, [datos, indiceInicio, indiceFin]);

  const irAPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaActual(numero);
    }
  };

  const paginaAnterior = () => {
    if (paginaSegura > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaSegura < totalPaginas) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1);
  };

  return {
    paginaActual: paginaSegura,
    registrosPorPagina,
    totalRegistros,
    totalPaginas,
    datosPaginados,
    indiceInicio,
    indiceFin,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    cambiarRegistrosPorPagina,
  };
};
