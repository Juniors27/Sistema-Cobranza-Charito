import { useState, useMemo, useEffect } from "react";

export const usePaginacion = (datos = [], registrosIniciales = 10) => {
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] =
    useState(registrosIniciales);

  const totalRegistros = datos.length;

  const totalPaginas = useMemo(() => {
    return Math.ceil(totalRegistros / registrosPorPagina) || 1;
  }, [totalRegistros, registrosPorPagina]);

  
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  const indiceInicio = useMemo(() => {
    return (paginaActual - 1) * registrosPorPagina;
  }, [paginaActual, registrosPorPagina]);

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
    if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1);
  };

  return {
    paginaActual,
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
