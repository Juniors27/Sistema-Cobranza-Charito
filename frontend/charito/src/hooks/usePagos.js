"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  validarFechaNoFutura,
} from "@/src/utils/pagosUtils";
import { obtenerFechaActualISO } from "@/src/utils/clientesUtils";
import {
  buscarUltimoPagoService,
  registrarPagoService,
  editarPagoService,
  eliminarPagoService,
} from "@/src/services/pagosService";
import { getVentas } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import { formatearCodigoContrato } from "@/src/utils/contratosUtils";

export const usePagos = () => {
  const [ventas, setVentas] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [fechaPagoBatch, setFechaPagoBatch] = useState(
    obtenerFechaActualISO(),
  );
  const [cobradorBatch, setCobradorBatch] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pagoEditando, setPagoEditando] = useState(null);
  const [ventaSeleccionadaId, setVentaSeleccionadaId] = useState(null);

  const [formPago, setFormPago] = useState({
    numeroContrato: "",
    monto: "",
    montoInicial: "",
  });

  async function cargarDatos() {
    try {
      const [ventasData, cobradoresData] = await Promise.all([
        getVentas(),
        obtenerCobradores(),
      ]);
      setVentas(ventasData);
      setCobradores(cobradoresData);
    } catch {
      toast.error("Error al cargar datos iniciales");
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDatos();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const numeroContratoLimpio = formPago.numeroContrato.trim();
  const contratosCoincidentes = ventas
    .filter((v) => v.numero_contrato === numeroContratoLimpio)
    .sort((a, b) => String(b.lote || "").localeCompare(String(a.lote || "")));

  const contratoActual =
    contratosCoincidentes.find((v) => v.id === ventaSeleccionadaId) ||
    (contratosCoincidentes.length === 1 ? contratosCoincidentes[0] : null);

  const esPrimerPagoContrato = contratoActual
    ? !contratoActual.primer_pago_registrado
    : false;

  const requiereSeleccionContrato = contratosCoincidentes.length > 1 && !contratoActual;

  const actualizarNumeroContrato = (numeroContrato) => {
    setVentaSeleccionadaId(null);
    setFormPago((prev) => ({
      ...prev,
      numeroContrato: String(numeroContrato || "").replace(/\D/g, ""),
    }));
  };

  const seleccionarContrato = (ventaId) => {
    setVentaSeleccionadaId(ventaId);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setPagoEditando(null);
    setVentaSeleccionadaId(null);
    setFormPago({ numeroContrato: "", monto: "", montoInicial: "" });
    setFechaPagoBatch(obtenerFechaActualISO());
    setCobradorBatch("");
  };

  const buscarUltimoPago = async () => {
    if (!formPago.numeroContrato) {
      toast.error("Ingresa un número de contrato");
      return false;
    }

    if (requiereSeleccionContrato) {
      toast.warning("Selecciona el contrato correcto antes de buscar el último pago");
      return false;
    }

    if (!contratoActual) {
      toast.error("Contrato no encontrado");
      return false;
    }

    const { res, data } = await buscarUltimoPagoService(
      formPago.numeroContrato,
      contratoActual.lote,
    );

    if (!res.ok) {
      toast.error(
        data.mensaje || data.error || "No se encontro el último pago",
      );
      return false;
    }

    actualizarVentaLocal(contratoActual, data, data.pago);
    setFormPago((prev) => ({ ...prev, monto: data.pago.monto }));
    setFechaPagoBatch(data.pago.fecha_pago);
    setCobradorBatch(data.pago.cobrador.toString());
    setPagoEditando(data.pago);
    setVentaSeleccionadaId(contratoActual.id);
    setModoEdicion(true);
    return true;
  };

  const registrarPago = async () => {
    if (
      !formPago.numeroContrato ||
      !formPago.monto ||
      !cobradorBatch ||
      !fechaPagoBatch
    ) {
      toast.error("Completa todos los campos");
      return false;
    }

    if (requiereSeleccionContrato) {
      toast.warning("Selecciona el contrato correcto antes de registrar el pago");
      return false;
    }

    const venta = contratoActual;
    if (!venta) {
      toast.error("Contrato no encontrado");
      return false;
    }

    if (!validarFechaNoFutura(fechaPagoBatch)) {
      toast.warning("No se aceptan fechas futuras");
      return false;
    }

    const payload = {
      venta: venta.id,
      fecha_pago: fechaPagoBatch,
      monto: parseFloat(formPago.monto),
      cobrador: parseInt(cobradorBatch),
      es_primer_pago: !venta.primer_pago_registrado,
    };

    const { res, data } = await registrarPagoService(payload);

    if (!res.ok) {
      toast.error(data.error || "Error al registrar");
      return false;
    }

    actualizarVentaLocal(venta, data, data.ultimo_pago || payload);
    setVentaSeleccionadaId(null);
    setFormPago({ numeroContrato: "", monto: "", montoInicial: "" });
    toast.success("Pago registrado exitosamente");
    return true;
  };

  const editarPago = async () => {
    if (!pagoEditando) return;

    if (!validarFechaNoFutura(fechaPagoBatch)) {
      toast.warning("No se aceptan fechas futuras");
      return;
    }

    const payload = {
      monto: parseFloat(formPago.monto),
      fecha_pago: fechaPagoBatch,
      cobrador: parseInt(cobradorBatch),
    };

    const { res, data } = await editarPagoService(pagoEditando.id, payload);

    if (!res.ok) {
      toast.error(data.error || "Error al editar");
      return;
    }

    const venta = contratoActual;
    actualizarVentaLocal(venta, data, data.ultimo_pago || data.pago);
    cancelarEdicion();
    toast.success("Pago editado exitosamente");
  };

  const eliminarPago = async () => {
    if (!pagoEditando) return;

    const confirmar = window.confirm(
      "Eliminar pago? Esta accion no se puede deshacer",
    );
    if (!confirmar) return;

    const { res, data } = await eliminarPagoService(pagoEditando.id);

    if (!res.ok) {
      toast.error(data.error || "Error al eliminar");
      return;
    }

    const venta = contratoActual;
    actualizarVentaLocal(venta, data, data.ultimo_pago || null);
    cancelarEdicion();
    toast.success("Pago eliminado exitosamente");
  };

  const registrarDescuento = async () => {
    if (!formPago.numeroContrato || !formPago.monto || !fechaPagoBatch) {
      toast.error("Completa contrato, monto y fecha");
      return;
    }

    if (requiereSeleccionContrato) {
      toast.warning("Selecciona el contrato correcto antes de aplicar el descuento");
      return;
    }

    const venta = contratoActual;
    if (!venta) {
      toast.error("Contrato no encontrado");
      return;
    }

    if (!validarFechaNoFutura(fechaPagoBatch)) {
      toast.warning("No se aceptan fechas futuras");
      return;
    }

    const payload = {
      venta: venta.id,
      fecha_pago: fechaPagoBatch,
      monto: parseFloat(formPago.monto),
      cobrador: parseInt(cobradorBatch),
      es_primer_pago: false,
      es_descuento: true,
      notas: "DESCUENTO",
    };

    const { res, data } = await registrarPagoService(payload);

    if (!res.ok) {
      toast.error(data.error || "Error al registrar descuento");
      return;
    }

    actualizarVentaLocal(venta, data, data.ultimo_pago || payload);
    setVentaSeleccionadaId(null);
    setFormPago({ numeroContrato: "", monto: "", montoInicial: "" });
    toast.success("Descuento aplicado correctamente");
  };

  const actualizarVentaLocal = (venta, data = {}, ultimoPago = data.pago) => {
    if (!venta) return;

    const ventasActualizadas = ventas.map((v) =>
      v.id === venta.id
        ? {
            ...v,
            saldo_pendiente: data.saldo_pendiente ?? v.saldo_pendiente,
            estado: data.estado_venta ?? v.estado,
            primer_pago_registrado:
              data.primer_pago_registrado ?? (ultimoPago ? true : v.primer_pago_registrado),
            ultimo_pago_fecha: ultimoPago?.fecha_pago ?? null,
            ultimo_pago_monto: ultimoPago?.monto ?? null,
          }
        : v,
    );

    setVentas(ventasActualizadas);
    localStorage.setItem("ventas", JSON.stringify(ventasActualizadas));
  };

  return {
    ventas,
    cobradores,
    fechaPagoBatch,
    setFechaPagoBatch,
    cobradorBatch,
    setCobradorBatch,
    formPago,
    setFormPago,
    actualizarNumeroContrato,
    modoEdicion,
    pagoEditando,
    contratoActual,
    contratosCoincidentes,
    requiereSeleccionContrato,
    seleccionarContrato,
    formatearCodigoContrato,
    esPrimerPagoContrato,
    buscarUltimoPago,
    registrarPago,
    editarPago,
    eliminarPago,
    registrarDescuento,
    cancelarEdicion,
  };
};
