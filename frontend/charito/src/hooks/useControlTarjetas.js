import { useState, useEffect, useMemo } from "react";

import { getVentas } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import { getPagos } from "../services/controlTarjetasService";

import {
  filtrarVentasHistorial,
  controlTarjetasExcel as controlTarjetasUtil,
  esBuenPagador,
  obtenerUltimoPago,
  calcularEstadoAutomatico,
} from "@/src/utils/controlTarjetasUtils";

export const useControlTarjetas = () => {
  const [ventas, setVentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [ventasData, pagosData, cobradoresData] = await Promise.all([
        getVentas(),
        getPagos(),
        obtenerCobradores(),
      ]);

      setVentas(ventasData);
      setPagos(pagosData);
      setCobradores(cobradoresData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const { ventasFiltradas, clientesControlar, buenosPagadores } =
    useMemo(() => {
      return filtrarVentasHistorial(
        ventas,
        filtro,
        searchTerm,
        cobradores,
        pagos,
      );
    }, [ventas, filtro, searchTerm, cobradores, pagos]);

  const controlTarjetasExcel = () =>
    controlTarjetasUtil(ventasFiltradas, cobradores, pagos);
  const calcularEstado = (venta) => calcularEstadoAutomatico(venta, pagos);
  const esBuenPagadorFn = (venta) => esBuenPagador(venta, pagos);
  const obtenerUltimoPagoFn = (venta) => obtenerUltimoPago(venta, pagos);

  return {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
    cobradores,
    ventas,
    pagos,
    loading,
    error,    
    searchTerm,
    filtro,
    calcularEstadoAutomatico: calcularEstado,
    esBuenPagador: esBuenPagadorFn,
    obtenerUltimoPago: obtenerUltimoPagoFn,
    controlTarjetasExcel,
    cargarDatos,
    setSearchTerm,
    setFiltro,
  };
};
