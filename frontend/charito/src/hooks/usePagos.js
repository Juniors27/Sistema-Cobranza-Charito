"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validarFechaNoFutura } from "@/src/utils/pagosUtils";
import {
  buscarUltimoPagoService,
  registrarPagoService,
  editarPagoService,
  eliminarPagoService,
} from "@/src/services/pagosService";
import { getVentas } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";

export const usePagos = () => {
  const [ventas, setVentas] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [fechaPagoBatch, setFechaPagoBatch] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [cobradorBatch, setCobradorBatch] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pagoEditando, setPagoEditando] = useState(null);

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

  const contratoActual = ventas.find(
    (v) => v.numero_contrato === formPago.numeroContrato,
  );

  const esPrimerPagoContrato = contratoActual
    ? !contratoActual.primer_pago_registrado
    : false;

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setPagoEditando(null);
    setFormPago({ numeroContrato: "", monto: "", montoInicial: "" });
    setFechaPagoBatch(new Date().toISOString().split("T")[0]);
    setCobradorBatch("");
  };

  const buscarUltimoPago = async () => {
    if (!formPago.numeroContrato) {
      toast.error("Ingresa un numero de contrato");
      return false;
    }

    const { res, data } = await buscarUltimoPagoService(
      formPago.numeroContrato,
    );

    if (!res.ok) {
      toast.error(
        data.mensaje || data.error || "No se encontro el ultimo pago",
      );
      return false;
    }

    setFormPago((prev) => ({ ...prev, monto: data.pago.monto }));
    setFechaPagoBatch(data.pago.fecha_pago);
    setCobradorBatch(data.pago.cobrador.toString());
    setPagoEditando(data.pago);
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

    const venta = ventas.find(
      (v) => v.numero_contrato === formPago.numeroContrato,
    );
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

    actualizarVentaLocal(venta, data);
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

    const venta = ventas.find(
      (v) => v.numero_contrato === formPago.numeroContrato,
    );
    actualizarVentaLocal(venta, data);
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

    const venta = ventas.find(
      (v) => v.numero_contrato === formPago.numeroContrato,
    );
    actualizarVentaLocal(venta, data);
    cancelarEdicion();
    toast.success("Pago eliminado exitosamente");
  };

  const registrarDescuento = async () => {
    if (!formPago.numeroContrato || !formPago.monto || !fechaPagoBatch) {
      toast.error("Completa contrato, monto y fecha");
      return;
    }

    const venta = ventas.find(
      (v) => v.numero_contrato === formPago.numeroContrato,
    );
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

    actualizarVentaLocal(venta, data);
    setFormPago({ numeroContrato: "", monto: "", montoInicial: "" });
    toast.success("Descuento aplicado correctamente");
  };

  const actualizarVentaLocal = (venta, data) => {
    const ventasActualizadas = ventas.map((v) =>
      v.id === venta.id
        ? {
            ...v,
            saldo_pendiente: data.saldo_pendiente,
            estado: data.estado_venta,
            primer_pago_registrado: data.primer_pago_registrado ?? true,
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
    modoEdicion,
    pagoEditando,
    contratoActual,
    esPrimerPagoContrato,
    buscarUltimoPago,
    registrarPago,
    editarPago,
    eliminarPago,
    registrarDescuento,
    cancelarEdicion,
  };
};
