"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

import { obtenerCobradores } from "@/src/services/cobradoresService";
import {
  validarContratoService,
  registrarVentaService,
} from "@/src/services/ventasService";

export const useVentas = (productos = []) => {
  // =========================
  // ESTADOS PARA BÚSQUEDA DE PRODUCTOS
  // =========================
  const [buscarProducto, setBuscarProducto] = useState("");
  const [mostrarProductos, setMostrarProductos] = useState(false);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(buscarProducto.toLowerCase()),
  );

   const [mostrarSaldo, setMostrarSaldo] = useState(false)

  /* =========================
     ESTADO PRINCIPAL
  ========================== */
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorContrato, setErrorContrato] = useState("");

  const [formVenta, setFormVenta] = useState({
    numeroContrato: "",
    nombre: "",
    apellido: "",
    direccion: "",
    lugar: "",
    zona: "milagro",
    producto: null,
    cantidad: "1",
    frecuenciaPago: "semanal",
    diaCobro: "",
    vendedor: "",
    fechaVenta: new Date().toISOString().split("T")[0],
    precioTotal: "",
    monto: "",
    dioInicial: false,
    inicial: "",
    cobradorId: "",
    estado: "pendiente",
  });

  // Calcular saldo automáticamente
const saldo = (Number(formVenta.monto) || 0) - (Number(formVenta.inicial) || 0);


  /* =========================
     CARGAR COBRADORES
  ========================== */
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerCobradores();
        setCobradores(data);
      } catch (error) {
        toast.error("Error al cargar cobradores");
      }
    };

    cargar();
  }, []);

  /* =========================
     VALIDAR CONTRATO
  ========================== */

  const validarContrato = async (numeroContrato) => {
    if (!numeroContrato) {
      setErrorContrato(""); // limpia el error si el input está vacío
      return false;
    }

    try {
      // Llamamos al service con el número que nos pasan
      const existe = await validarContratoService(formVenta.numeroContrato);

      if (existe) {
        setErrorContrato("Contrato ya está registrado"); // actualizamos el estado del error
        toast.warning("El contrato ya existe");
        return true;
      } else {
        setErrorContrato(""); // borramos el error si no existe
        return false;
      }
    } catch (error) {
      toast.error("Error al validar contrato");
      console.error(error);
      return false;
    }
  };

  /* =========================
     REGISTRAR VENTA
  ========================== */
  const registrarVenta = async () => {
    try {
      setLoading(true);

      const payload = {
        numero_contrato: formVenta.numeroContrato,
        fecha_venta: formVenta.fechaVenta,

        nombre: formVenta.nombre,
        apellido: formVenta.apellido,
        direccion: formVenta.direccion,
        lugar: formVenta.lugar || "",
        zona: formVenta.zona,

        producto: {
          nombre: formVenta.producto.nombre,
          categoria: formVenta.producto.categoria,
        },

        cantidad: Number(formVenta.cantidad || 1),

        precio_total: Number(formVenta.precioTotal), // ✅ número
        monto: Number(formVenta.monto),
        inicial: Number(formVenta.inicial || 0),

        frecuencia_pago: formVenta.frecuenciaPago,
        dia_cobro: formVenta.diaCobro || "",

        vendedor: formVenta.vendedor || "",
        cobrador: Number(formVenta.cobradorId),
      };

      await registrarVentaService(payload);
      toast.success("Venta registrada correctamente");

       // ✅ LIMPIAR FORMULARIO
      setFormVenta(prev => ({
        ...prev,
        numeroContrato: "",
        nombre: "",
        apellido: "",
        direccion: "",
        lugar: "",
        producto: null,
        cantidad: "1",
        precioTotal: "",
        monto: "",
        inicial: "",
        dioInicial:false,
        //cobradorId: "",
        
      }))
      setBuscarProducto("")
      setMostrarProductos(false)

      return true;
    } catch (error) {
      toast.error(error.message);
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }

    

  };

  return {
    cobradores,
    setCobradores,
    loading,
    formVenta,
    setFormVenta,
    errorContrato,
    setErrorContrato,
    buscarProducto,
    setBuscarProducto,
    mostrarProductos,
    setMostrarProductos,
    productosFiltrados,
    registrarVenta,
    validarContrato,
    mostrarSaldo,
    setMostrarSaldo,
    saldo,
  };
};
