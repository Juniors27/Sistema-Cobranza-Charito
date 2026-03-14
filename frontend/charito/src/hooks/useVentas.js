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

  const [formVenta, setFormVenta] = useState({
    numeroContrato: "",
    nombre: "",
    apellido: "",
    direccion: "",
    lugar: "",
    zona: "milagro",
    productos: [],
    frecuenciaPago: "semanal",
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

  const agregarProducto = (producto) => {
    setFormVenta((prev) => {
      const yaExiste = prev.productos.some((item) => item.nombre === producto.nombre);
      if (yaExiste) {
        toast.warning("Ese producto ya fue agregado. Puedes editar su cantidad o monto.");
        return prev;
      }

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
        setErrorContrato("Contrato ya está registrado");
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

  const registrarVenta = async () => {
    try {
      setLoading(true);

      if (formVenta.productos.length === 0) {
        toast.error("Agrega al menos un producto");
        return false;
      }

      const productosInvalidos = formVenta.productos.some(
        (producto) => !producto.precio_total || Number(producto.precio_total) <= 0
      );

      if (productosInvalidos) {
        toast.error("Cada producto debe tener un monto válido");
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
        dia_cobro: formVenta.diaCobro || "",
        fecha_primer_cobro: formVenta.fechaPrimerCobro || null,
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
        inicial: "",
        dioInicial: false,
      }));
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
    precioTotal,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  };
};
