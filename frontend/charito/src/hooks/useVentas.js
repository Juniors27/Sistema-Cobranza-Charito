"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import {
  validarContratoService,
  registrarVentaService,
} from "@/src/services/ventasService";

export const useVentas = (productos = []) => {
  const [buscarProducto, setBuscarProducto] = useState("");
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [cobradores, setCobradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorContrato, setErrorContrato] = useState("");
  const [mostrarSaldo, setMostrarSaldo] = useState(false);
  const [erroresFormulario, setErroresFormulario] = useState({});

  const [formVenta, setFormVenta] = useState({
    numeroContrato: "",
    nombre: "",
    apellido: "",
    direccion: "",
    lugar: "",
    zona: "milagro",
    productos: [],
    frecuenciaPago: "semanal",
    montoFrecuencia: "",
    diaCobro: "",
    vendedor: "",
    fechaVenta: new Date().toISOString().split("T")[0],
    fechaPrimerCobro: "",
    monto: "",
    dioInicial: false,
    inicial: "",
    cobradorId: "",
    estado: "pendiente",
  });

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) =>
        p.nombre.toLowerCase().includes(buscarProducto.toLowerCase())
      ),
    [productos, buscarProducto]
  );

  const precioTotal = useMemo(
    () =>
      formVenta.productos.reduce(
        (total, producto) => total + Number(producto.precio_total || 0),
        0
      ),
    [formVenta.productos]
  );

  const saldo = (Number(formVenta.monto) || 0) - (Number(formVenta.inicial) || 0);
  const requiereFechaPrimerCobro = !formVenta.dioInicial;

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerCobradores();
        setCobradores(data);
      } catch {
        toast.error("Error al cargar cobradores");
      }
    };

    cargar();
  }, []);

  const limpiarErrorCampo = (campo) => {
    if (campo === "numeroContrato") {
      setErrorContrato("");
    }

    setErroresFormulario((prev) => {
      if (!prev[campo]) return prev;

      const next = { ...prev };
      delete next[campo];
      return next;
    });
  };

  const agregarProducto = (producto) => {
    setFormVenta((prev) => {
      const yaExiste = prev.productos.some((item) => item.nombre === producto.nombre);
      if (yaExiste) {
        toast.warning("Ese producto ya fue agregado. Puedes editar su cantidad o monto.");
        return prev;
      }

      limpiarErrorCampo("productos");

      return {
        ...prev,
        productos: [
          ...prev.productos,
          {
            nombre: producto.nombre,
            categoria: producto.categoria,
            cantidad: 1,
            precio_total: "",
          },
        ],
      };
    });

    setBuscarProducto("");
    setMostrarProductos(false);
  };

  const actualizarProducto = (index, campo, valor) => {
    limpiarErrorCampo("productos");
    setFormVenta((prev) => ({
      ...prev,
      productos: prev.productos.map((producto, itemIndex) =>
        itemIndex === index ? { ...producto, [campo]: valor } : producto
      ),
    }));
  };

  const eliminarProducto = (index) => {
    setFormVenta((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validarContrato = async (numeroContrato) => {
    if (!numeroContrato) {
      setErrorContrato("");
      return false;
    }

    try {
      const existe = await validarContratoService(numeroContrato);

      if (existe) {
        setErrorContrato("Contrato ya est\u00e1 registrado");
        toast.warning("El contrato ya existe");
        return true;
      }

      setErrorContrato("");
      return false;
    } catch (error) {
      toast.error("Error al validar contrato");
      console.error(error);
      return false;
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formVenta.numeroContrato.trim()) {
      nuevosErrores.numeroContrato = "Ingresa el n\u00famero de contrato";
    }
    if (!formVenta.nombre.trim()) nuevosErrores.nombre = "Ingresa el nombre";
    if (!formVenta.apellido.trim()) nuevosErrores.apellido = "Ingresa el apellido";
    if (!formVenta.direccion.trim()) nuevosErrores.direccion = "Ingresa la direcci\u00f3n";
    if (!formVenta.lugar.trim()) nuevosErrores.lugar = "Ingresa el lugar";
    if (!formVenta.zona) nuevosErrores.zona = "Selecciona la zona";
    if (!formVenta.cobradorId) nuevosErrores.cobradorId = "Selecciona un cobrador";
    if (!formVenta.frecuenciaPago) nuevosErrores.frecuenciaPago = "Selecciona la forma de pago";
    if (!formVenta.montoFrecuencia || Number(formVenta.montoFrecuencia) <= 0) {
      nuevosErrores.montoFrecuencia = "Ingresa cu\u00e1nto dar\u00e1 seg\u00fan la frecuencia";
    }
    if (!formVenta.diaCobro.trim()) nuevosErrores.diaCobro = "Ingresa el d\u00eda de cobranza";
    if (!formVenta.vendedor.trim()) nuevosErrores.vendedor = "Ingresa el vendedor";
    if (!formVenta.fechaVenta) nuevosErrores.fechaVenta = "Selecciona la fecha de venta";
    if (requiereFechaPrimerCobro && !formVenta.fechaPrimerCobro) {
      nuevosErrores.fechaPrimerCobro = "Selecciona la fecha estimada de primer cobro";
    }
    if (!formVenta.monto || Number(formVenta.monto) <= 0) {
      nuevosErrores.monto = "Ingresa un saldo actual v\u00e1lido";
    }

    if (errorContrato) nuevosErrores.numeroContrato = errorContrato;

    if (formVenta.productos.length === 0) {
      nuevosErrores.productos = "Agrega al menos un producto";
    }

    const productosInvalidos = formVenta.productos.some(
      (producto) =>
        !producto.nombre ||
        Number(producto.cantidad || 0) < 1 ||
        !producto.precio_total ||
        Number(producto.precio_total) <= 0
    );

    if (productosInvalidos) {
      nuevosErrores.productos = "Revisa cantidad y monto de los productos";
    }

    if (formVenta.dioInicial && Number(formVenta.inicial || 0) <= 0) {
      nuevosErrores.inicial = "Ingresa el monto inicial";
    }

    if (
      formVenta.dioInicial &&
      Number(formVenta.inicial || 0) > 0 &&
      Number(formVenta.inicial || 0) > Number(formVenta.monto || 0)
    ) {
      nuevosErrores.inicial = "El inicial no puede ser mayor al saldo actual";
    }

    setErroresFormulario(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const registrarVenta = async () => {
    try {
      setLoading(true);

      if (!validarFormulario()) {
        toast.error("Falta completar datos obligatorios");
        return false;
      }

      const payload = {
        numero_contrato: formVenta.numeroContrato,
        fecha_venta: formVenta.fechaVenta,
        nombre: formVenta.nombre,
        apellido: formVenta.apellido,
        direccion: formVenta.direccion,
        lugar: formVenta.lugar || "",
        zona: formVenta.zona,
        productos: formVenta.productos.map((producto) => ({
          nombre: producto.nombre,
          categoria: producto.categoria,
          cantidad: Number(producto.cantidad || 1),
          precio_total: Number(producto.precio_total || 0),
        })),
        cantidad: formVenta.productos.reduce(
          (total, producto) => total + Number(producto.cantidad || 0),
          0
        ),
        precio_total: Number(precioTotal),
        monto: Number(formVenta.monto),
        inicial: Number(formVenta.inicial || 0),
        frecuencia_pago: formVenta.frecuenciaPago,
        monto_frecuencia: Number(formVenta.montoFrecuencia),
        dia_cobro: formVenta.diaCobro || "",
        fecha_primer_cobro:
          formVenta.fechaPrimerCobro || (formVenta.dioInicial ? formVenta.fechaVenta : null),
        vendedor: formVenta.vendedor || "",
        cobrador: Number(formVenta.cobradorId),
      };

      await registrarVentaService(payload);
      toast.success("Venta registrada correctamente");

      setFormVenta((prev) => ({
        ...prev,
        numeroContrato: "",
        nombre: "",
        apellido: "",
        direccion: "",
        lugar: "",
        productos: [],
        fechaPrimerCobro: "",
        monto: "",
        montoFrecuencia: "",
        inicial: "",
        dioInicial: false,
      }));
      setErroresFormulario({});
      setBuscarProducto("");
      setMostrarProductos(false);

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
    loading,
    formVenta,
    setFormVenta,
    errorContrato,
    erroresFormulario,
    limpiarErrorCampo,
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
    requiereFechaPrimerCobro,
    precioTotal,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  };
};
