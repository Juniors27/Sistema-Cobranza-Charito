import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  clientesService,
  cambiarEstadoVentaService,
  exportarClientesFiltradosService,
} from "@/src/services/clientesService";
import { getHistorialPagos } from "@/src/services/reporteService";
import { productos } from "@/src/data/productos";
import { getVentaDetalle, validarContratoService } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import {
  exportarExcel as exportarExcelUtil,
  obtenerFechaActualISO,
} from "@/src/utils/clientesUtils";
import { obtenerLoteDesdeFechaVenta } from "@/src/utils/contratosUtils";

export const useClientes = () => {
  const sanitizarNumeroContrato = (valor = "") => valor.replace(/\D/g, "");
  const [ventas, setVentas] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [filtrosBusqueda, setFiltrosBusqueda] = useState({
    lote: "",
    numeroContrato: "",
    nombreCliente: "",
  });
  const [filtrosDebounced, setFiltrosDebounced] = useState({
    lote: "",
    numeroContrato: "",
    nombreCliente: "",
  });
  const [zonaFiltro, setZonaFiltro] = useState("todas");
  const [modalEditar, setModalEditar] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [errorContratoEditar, setErrorContratoEditar] = useState("");
  const [historialPagos, setHistorialPagos] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buscarProductoEdit, setBuscarProductoEdit] = useState("");
  const [mostrarProductosEdit, setMostrarProductosEdit] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [ventaEliminar, setVentaEliminar] = useState(null);
  const [eliminandoVenta, setEliminandoVenta] = useState(false);
  const [modalRecogido, setModalRecogido] = useState(false);
  const [ventaRecogido, setVentaRecogido] = useState(null);
  const [guardandoRecogido, setGuardandoRecogido] = useState(false);
  const [formRecogido, setFormRecogido] = useState({
    accion: "marcar",
    fechaRecogido: obtenerFechaActualISO(),
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFiltrosDebounced({
        lote: filtrosBusqueda.lote.trim(),
        numeroContrato: sanitizarNumeroContrato(filtrosBusqueda.numeroContrato),
        nombreCliente: filtrosBusqueda.nombreCliente.trim(),
      });
      setPaginaActual(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filtrosBusqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [zonaFiltro, registrosPorPagina]);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientesData, cobradoresData] = await Promise.all([
        clientesService.listar({
          page: paginaActual,
          pageSize: registrosPorPagina,
          lote: filtrosDebounced.lote,
          numeroContrato: filtrosDebounced.numeroContrato,
          nombreCliente: filtrosDebounced.nombreCliente,
          zona: zonaFiltro,
        }),
        obtenerCobradores(),
      ]);

      setVentas(clientesData.results || []);
      setTotalRegistros(clientesData.count || 0);
      setTotalPaginas(Math.max(1, Math.ceil((clientesData.count || 0) / registrosPorPagina)));
      setCobradores(cobradoresData);
    } catch (loadError) {
      setError(loadError.message);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  }, [paginaActual, registrosPorPagina, filtrosDebounced, zonaFiltro]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarEstadoVenta = async (numero_contrato, estadoObjetivo, opciones = {}) => {
    try {
      const venta = ventas.find((v) => v.numero_contrato === numero_contrato);

      if (!venta) {
        toast.error("No se encontró la venta");
        return false;
      }
      if (venta.estado === "cancelado") {
        toast.error("La venta está cancelada");
        return false;
      }

      const { forzarEstado = false, ...payloadExtra } = opciones;
      const payload =
        venta.estado === estadoObjetivo && !forzarEstado
          ? { estado: "pendiente", fecha_recogido: null }
          : { estado: estadoObjetivo, ...payloadExtra };

      await cambiarEstadoVentaService(venta.id, payload);
      await cargarDatos();
      toast.success("Estado actualizado");
      return true;
    } catch (error) {
      toast.error(error.message || "Error al cambiar el estado");
      return false;
    }
  };

  const abrirModalRecogido = (venta) => {
    if (!venta) return;

    const estaRecogido = venta.estado === "recogido";
    setVentaRecogido(venta);
    setFormRecogido({
      accion: estaRecogido ? "actualizar" : "marcar",
      fechaRecogido: venta.fecha_recogido || obtenerFechaActualISO(),
    });
    setModalRecogido(true);
  };

  const cerrarModalRecogido = () => {
    if (guardandoRecogido) return;

    setModalRecogido(false);
    setVentaRecogido(null);
    setFormRecogido({
      accion: "marcar",
      fechaRecogido: obtenerFechaActualISO(),
    });
  };

  const actualizarFormRecogido = (campo, valor) => {
    setFormRecogido((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const confirmarCambioRecogido = async () => {
    if (!ventaRecogido) return;

    if (
      (formRecogido.accion === "marcar" || formRecogido.accion === "actualizar") &&
      !formRecogido.fechaRecogido
    ) {
      toast.error("Selecciona la fecha de recojo");
      return;
    }

    try {
      setGuardandoRecogido(true);
      let actualizado = false;

      if (formRecogido.accion === "revertir") {
        actualizado = await cambiarEstadoVenta(ventaRecogido.numero_contrato, "recogido");
      } else {
        actualizado = await cambiarEstadoVenta(ventaRecogido.numero_contrato, "recogido", {
          forzarEstado: true,
          fecha_recogido: formRecogido.fechaRecogido,
        });
      }

      if (!actualizado) return;

      setModalRecogido(false);
      setVentaRecogido(null);
      setFormRecogido({
        accion: "marcar",
        fechaRecogido: obtenerFechaActualISO(),
      });
    } finally {
      setGuardandoRecogido(false);
    }
  };

  const abrirModalEditar = async (venta) => {
    try {
      const ventaDetallada = await getVentaDetalle(venta.id);

      const productosVenta =
        Array.isArray(ventaDetallada.productos) && ventaDetallada.productos.length > 0
          ? ventaDetallada.productos.map((producto) => ({
              nombre: producto.nombre,
              categoria: producto.categoria,
              cantidad: String(producto.cantidad ?? 1),
              precio_total: String(producto.precio_total ?? ""),
            }))
          : [
              {
                nombre: ventaDetallada.producto_nombre,
                categoria: "",
                cantidad: String(ventaDetallada.cantidad ?? 1),
                precio_total: String(ventaDetallada.precio_total ?? ""),
              },
            ];

      setVentaEditar({
        ...ventaDetallada,
        lote: ventaDetallada.lote || obtenerLoteDesdeFechaVenta(ventaDetallada.fecha_venta),
        numero_contrato: sanitizarNumeroContrato(String(ventaDetallada.numero_contrato ?? "")),
        numero_contrato_original: sanitizarNumeroContrato(
          String(ventaDetallada.numero_contrato ?? "")
        ),
        monto_frecuencia: ventaDetallada.monto_frecuencia ?? "",
        productos: productosVenta,
      });
      setErrorContratoEditar("");
      setBuscarProductoEdit("");
      setMostrarProductosEdit(false);
      setModalEditar(true);
    } catch {
      toast.error("No se pudo cargar la venta para editar");
    }
  };

  const agregarProductoEditar = (producto) => {
    if (!ventaEditar) return;

    const yaExiste = ventaEditar.productos?.some((item) => item.nombre === producto.nombre);
    if (yaExiste) {
      toast.warning("Ese producto ya está en la venta");
      return;
    }

    setVentaEditar((prev) => ({
      ...prev,
      productos: [
        ...(prev.productos || []),
        {
          nombre: producto.nombre,
          categoria: producto.categoria,
          cantidad: "1",
          precio_total: "",
        },
      ],
    }));
    setBuscarProductoEdit("");
    setMostrarProductosEdit(false);
  };

  const actualizarProductoEditar = (index, campo, valor) => {
    setVentaEditar((prev) => ({
      ...prev,
      productos: prev.productos.map((producto, itemIndex) =>
        itemIndex === index ? { ...producto, [campo]: valor } : producto
      ),
    }));
  };

  const eliminarProductoEditar = (index) => {
    setVentaEditar((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const cargarHistorial = async (ventaId) => {
    setCargandoHistorial(true);

    try {
      const data = await getHistorialPagos(ventaId);
      setHistorialPagos(data);
    } catch {
      setHistorialPagos([]);
      toast.error("Error cargando historial");
    } finally {
      setCargandoHistorial(false);
    }
  };

  const abrirModalDetalle = async (venta) => {
    setVentaDetalle({ ...venta });
    setModalDetalle(true);

    if (venta.id) {
      try {
        const ventaDetallada = await getVentaDetalle(venta.id);
        setVentaDetalle(ventaDetallada);
      } catch {
        toast.error("No se pudo cargar el detalle completo del cliente");
      }

      await cargarHistorial(venta.id);
    }
  };

  const cerrarModalDetalle = () => {
    setModalDetalle(false);
    setVentaDetalle(null);
    setHistorialPagos([]);
  };

  const guardarEdicion = async () => {
    try {
      const numeroContrato = sanitizarNumeroContrato(ventaEditar?.numero_contrato);
      const numeroContratoOriginal = sanitizarNumeroContrato(
        ventaEditar?.numero_contrato_original
      );

      if (!numeroContrato) {
        return toast.error("Ingresa el numero de contrato");
      }

      if (numeroContrato !== numeroContratoOriginal) {
        const existe = await validarContratoService(numeroContrato, ventaEditar?.fecha_venta);
        if (existe) {
          setErrorContratoEditar("Contrato ya está registrado");
          return toast.error("El numero de contrato ya existe");
        }
      }

      setErrorContratoEditar("");

      if (!ventaEditar.nombre || !ventaEditar.apellido || !ventaEditar.direccion) {
        return toast.error("Completa los campos obligatorios");
      }

      if (!ventaEditar.cobrador) return toast.error("Selecciona un cobrador");
      if (Number(ventaEditar.monto || 0) <= 0) {
        return toast.error("Ingresa un saldo actual valido");
      }
      if (Number(ventaEditar.inicial || 0) < 0) {
        return toast.error("El pago inicial no puede ser negativo");
      }
      if (Number(ventaEditar.inicial || 0) > Number(ventaEditar.monto || 0)) {
        return toast.error("El pago inicial no puede ser mayor al saldo actual");
      }
      if (!ventaEditar.productos || ventaEditar.productos.length === 0) {
        return toast.error("Agrega al menos un producto");
      }

      const productosInvalidos = ventaEditar.productos.some(
        (producto) =>
          !producto.nombre ||
          Number(producto.cantidad || 0) < 1 ||
          Number(producto.precio_total || 0) <= 0
      );

      if (productosInvalidos) {
        return toast.error("Revisa cantidad y monto de los productos");
      }

      const { numero_contrato_original, ...ventaSinContratoOriginal } = ventaEditar;

      const ventaActualizada = {
        ...ventaSinContratoOriginal,
        lote: obtenerLoteDesdeFechaVenta(ventaEditar.fecha_venta),
        numero_contrato: numeroContrato,
        monto_frecuencia:
          ventaEditar.monto_frecuencia === "" || ventaEditar.monto_frecuencia === null
            ? null
            : Number(ventaEditar.monto_frecuencia),
        inicial: Number(ventaEditar.inicial || 0),
        monto: Number(ventaEditar.monto || 0),
        productos: ventaEditar.productos.map((producto) => ({
          nombre: producto.nombre,
          categoria: producto.categoria || "otros",
          cantidad: Number(producto.cantidad || 1),
          precio_total: Number(producto.precio_total || 0),
        })),
        cantidad: ventaEditar.productos.reduce(
          (total, producto) => total + Number(producto.cantidad || 0),
          0
        ),
        precio_total: ventaEditar.productos.reduce(
          (total, producto) => total + Number(producto.precio_total || 0),
          0
        ),
        cobrador: Number(ventaEditar.cobrador),
      };

      await clientesService.actualizar(ventaEditar.id, ventaActualizada);
      await cargarDatos();
      setModalEditar(false);
      toast.success("Cliente actualizado");
    } catch (error) {
      toast.error(error.message || "Error al actualizar");
    }
  };

  const solicitarEliminarVenta = (venta) => {
    setVentaEliminar(venta);
    setModalEliminar(true);
  };

  const cancelarEliminacionVenta = () => {
    setModalEliminar(false);
    setVentaEliminar(null);
  };

  const eliminarVenta = async () => {
    if (!ventaEliminar?.id) return;

    try {
      setEliminandoVenta(true);
      await clientesService.eliminar(ventaEliminar.id);
      await cargarDatos();
      cancelarEliminacionVenta();
      toast.success("Cliente eliminado");
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setEliminandoVenta(false);
    }
  };

  const exportarExcel = async () => {
    try {
      const data = await exportarClientesFiltradosService({
        lote: filtrosDebounced.lote,
        numeroContrato: filtrosDebounced.numeroContrato,
        nombreCliente: filtrosDebounced.nombreCliente,
        zona: zonaFiltro,
      });
      exportarExcelUtil(data);
    } catch {
      toast.error("Error al exportar clientes");
    }
  };

  const indiceInicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + ventas.length;

  const paginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual((prev) => prev - 1);
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual((prev) => prev + 1);
  };

  const irAPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) setPaginaActual(numero);
  };

  const cambiarRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1);
  };

  return {
    ventasFiltradas: ventas,
    exportarExcel,
    cobradores,
    filtrosBusqueda,
    zonaFiltro,
    modalEditar,
    ventaEditar,
    errorContratoEditar,
    modalDetalle,
    modalEliminar,
    ventaDetalle,
    ventaEliminar,
    historialPagos,
    cargandoHistorial,
    productos,
    loading,
    error,
    buscarProductoEdit,
    mostrarProductosEdit,
    paginaActual,
    totalPaginas,
    registrosPorPagina,
    indiceInicio,
    indiceFin,
    totalRegistros,
    eliminandoVenta,
    modalRecogido,
    ventaRecogido,
    guardandoRecogido,
    formRecogido,
    setFiltrosBusqueda,
    setZonaFiltro,
    setModalEditar,
    setVentaEditar,
    setErrorContratoEditar,
    setBuscarProductoEdit,
    setMostrarProductosEdit,
    cargarDatos,
    cambiarEstadoVenta,
    abrirModalRecogido,
    cerrarModalRecogido,
    actualizarFormRecogido,
    confirmarCambioRecogido,
    abrirModalDetalle,
    cerrarModalDetalle,
    abrirModalEditar,
    guardarEdicion,
    solicitarEliminarVenta,
    cancelarEliminacionVenta,
    eliminarVenta,
    agregarProductoEditar,
    actualizarProductoEditar,
    eliminarProductoEditar,
    paginaAnterior,
    paginaSiguiente,
    irAPagina,
    cambiarRegistrosPorPagina,
  };
};
