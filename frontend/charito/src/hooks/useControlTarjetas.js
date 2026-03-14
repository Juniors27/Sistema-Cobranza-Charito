import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { getVentas } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import {
  editarObservacionControl,
  eliminarObservacionControl,
  getObservacionesControl,
  getPagos,
  getTodasObservacionesControl,
  registrarObservacionControl,
} from "../services/controlTarjetasService";

import {
  filtrarVentasHistorial,
  controlTarjetasExcel as controlTarjetasUtil,
  esBuenPagador,
  obtenerUltimoPago,
  obtenerAlertaPromesa,
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
  const [modalObservacionesAbierto, setModalObservacionesAbierto] = useState(false);
  const [ventaObservaciones, setVentaObservaciones] = useState(null);
  const [observacionesControl, setObservacionesControl] = useState([]);
  const [todasObservacionesControl, setTodasObservacionesControl] = useState([]);
  const [cargandoObservaciones, setCargandoObservaciones] = useState(false);
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);
  const [editandoObservacionId, setEditandoObservacionId] = useState(null);
  const [formObservacion, setFormObservacion] = useState({
    fecha_control: "",
    tipo_resultado: "promesa_pago",
    observacion: "",
    fecha_compromiso_pago: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      const [ventasData, pagosData, cobradoresData, observacionesData] = await Promise.all([
        getVentas({ modulo: "control" }),
        getPagos(),
        obtenerCobradores(),
        getTodasObservacionesControl(),
      ]);

      setVentas(ventasData);
      setPagos(pagosData);
      setCobradores(cobradoresData);
      setTodasObservacionesControl(observacionesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
    clientesPromesaVencida,
  } =
    useMemo(() => {
      return filtrarVentasHistorial(
        ventas,
        filtro,
        searchTerm,
        cobradores,
        pagos,
        todasObservacionesControl,
      );
    }, [ventas, filtro, searchTerm, cobradores, pagos, todasObservacionesControl]);

  const controlTarjetasExcel = () =>
    controlTarjetasUtil(ventasFiltradas, cobradores, pagos);
  const calcularEstado = (venta) => calcularEstadoAutomatico(venta, pagos);
  const esBuenPagadorFn = (venta) => esBuenPagador(venta, pagos);
  const obtenerUltimoPagoFn = (venta) => obtenerUltimoPago(venta, pagos);
  const obtenerAlertaPromesaFn = (venta) =>
    obtenerAlertaPromesa(venta, pagos, todasObservacionesControl);

  const abrirModalObservaciones = async (venta) => {
    try {
      setVentaObservaciones(venta);
      setModalObservacionesAbierto(true);
      setObservacionesControl([]);
      setCargandoObservaciones(true);
      // La fecha de control se registra manualmente para conservar la jornada real del seguimiento.
      setFormObservacion({
        fecha_control: new Date().toISOString().split("T")[0],
        tipo_resultado: "promesa_pago",
        observacion: "",
        fecha_compromiso_pago: "",
      });
      setEditandoObservacionId(null);

      const data = await getObservacionesControl(venta.id);
      setObservacionesControl(data);
    } catch (err) {
      toast.error(err.message || "No se pudo cargar el historial de observaciones");
    } finally {
      setCargandoObservaciones(false);
    }
  };

  const cerrarModalObservaciones = () => {
    setModalObservacionesAbierto(false);
    setVentaObservaciones(null);
    setObservacionesControl([]);
    setEditandoObservacionId(null);
    setFormObservacion({
      fecha_control: "",
      tipo_resultado: "promesa_pago",
      observacion: "",
      fecha_compromiso_pago: "",
    });
  };

  const guardarObservacion = async () => {
    if (!ventaObservaciones) return;
    if (!formObservacion.fecha_control || !formObservacion.observacion.trim()) {
      toast.error("Completa la fecha de control y la observacion");
      return;
    }

    try {
      setGuardandoObservacion(true);
      const payload = {
        ...formObservacion,
        observacion: formObservacion.observacion.trim(),
        fecha_compromiso_pago: formObservacion.fecha_compromiso_pago || null,
      };

      let observacionGuardada = null;

      if (editandoObservacionId) {
        observacionGuardada = await editarObservacionControl(editandoObservacionId, payload);
        setObservacionesControl((prev) =>
          prev.map((item) =>
            item.id === editandoObservacionId ? observacionGuardada : item
          )
        );
        setTodasObservacionesControl((prev) =>
          prev.map((item) =>
            item.id === editandoObservacionId ? observacionGuardada : item
          )
        );
      } else {
        observacionGuardada = await registrarObservacionControl(
          ventaObservaciones.id,
          payload
        );

        setObservacionesControl((prev) => [observacionGuardada, ...prev]);
        setTodasObservacionesControl((prev) => [observacionGuardada, ...prev]);
      }

      setFormObservacion((prev) => ({
        ...prev,
        observacion: "",
        fecha_compromiso_pago: "",
      }));
      setEditandoObservacionId(null);
      toast.success(
        editandoObservacionId
          ? "Observacion actualizada correctamente"
          : "Observacion registrada correctamente"
      );
    } catch (err) {
      toast.error(err.message || "No se pudo registrar la observacion");
    } finally {
      setGuardandoObservacion(false);
    }
  };

  const iniciarEdicionObservacion = (observacion) => {
    setEditandoObservacionId(observacion.id);
    setFormObservacion({
      fecha_control: observacion.fecha_control || "",
      tipo_resultado: observacion.tipo_resultado || "promesa_pago",
      observacion: observacion.observacion || "",
      fecha_compromiso_pago: observacion.fecha_compromiso_pago || "",
    });
  };

  const cancelarEdicionObservacion = () => {
    setEditandoObservacionId(null);
    setFormObservacion((prev) => ({
      ...prev,
      fecha_control: new Date().toISOString().split("T")[0],
      tipo_resultado: "promesa_pago",
      observacion: "",
      fecha_compromiso_pago: "",
    }));
  };

  const borrarObservacion = async (observacionId) => {
    try {
      await eliminarObservacionControl(observacionId);
      setObservacionesControl((prev) => prev.filter((item) => item.id !== observacionId));
      setTodasObservacionesControl((prev) => prev.filter((item) => item.id !== observacionId));

      if (editandoObservacionId === observacionId) {
        cancelarEdicionObservacion();
      }

      toast.success("Observacion eliminada correctamente");
    } catch (err) {
      toast.error(err.message || "No se pudo eliminar la observacion");
    }
  };

  return {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
    clientesPromesaVencida,
    cobradores,
    ventas,
    pagos,
    loading,
    error,    
    searchTerm,
    filtro,
    modalObservacionesAbierto,
    ventaObservaciones,
    observacionesControl,
    todasObservacionesControl,
    cargandoObservaciones,
    guardandoObservacion,
    editandoObservacionId,
    formObservacion,
    calcularEstadoAutomatico: calcularEstado,
    esBuenPagador: esBuenPagadorFn,
    obtenerUltimoPago: obtenerUltimoPagoFn,
    obtenerAlertaPromesa: obtenerAlertaPromesaFn,
    controlTarjetasExcel,
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
  };
};
