import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  clientesService,
  cambiarEstadoVentaService,
  exportarClientesFiltradosService,
} from "@/src/services/clientesService";
import { getHistorialPagos } from "@/src/services/reporteService";
import { productos } from "@/src/data/productos";
import { getVentaDetalle } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import { exportarExcel as exportarExcelUtil } from "@/src/utils/clientesUtils";

export const useClientes = () => {
  const [ventas, setVentas] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [zonaFiltro, setZonaFiltro] = useState("todas");
  const [modalEditar, setModalEditar] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchDebounced(searchTerm.trim());
      setPaginaActual(1);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPaginaActual(1);
  }, [zonaFiltro, registrosPorPagina]);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina, searchDebounced, zonaFiltro]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientesData, cobradoresData] = await Promise.all([
        clientesService.listar({
          page: paginaActual,
          pageSize: registrosPorPagina,
          search: searchDebounced,
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
  };

  const cambiarEstadoVenta = async (numero_contrato, estadoObjetivo) => {
    try {
      const venta = ventas.find((v) => v.numero_contrato === numero_contrato);

      if (!venta) return toast.error("No se encontró la venta");
      if (venta.estado === "cancelado") return toast.error("La venta está cancelada");

      const nuevoEstado = venta.estado === estadoObjetivo ? "pendiente" : estadoObjetivo;

      await cambiarEstadoVentaService(venta.id, nuevoEstado);
      await cargarDatos();
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al cambiar el estado");
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
        monto_frecuencia: ventaDetallada.monto_frecuencia ?? "",
        productos: productosVenta,
      });
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
      if (!ventaEditar.nombre || !ventaEditar.apellido || !ventaEditar.direccion) {
        return toast.error("Completa los campos obligatorios");
      }

      if (!ventaEditar.cobrador) return toast.error("Selecciona un cobrador");
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

      const ventaActualizada = {
        ...ventaEditar,
        monto_frecuencia:
          ventaEditar.monto_frecuencia === "" || ventaEditar.monto_frecuencia === null
            ? null
            : Number(ventaEditar.monto_frecuencia),
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
    } catch {
      toast.error("Error al actualizar");
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
        search: searchDebounced,
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
    searchTerm,
    zonaFiltro,
    modalEditar,
    ventaEditar,
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
    setSearchTerm,
    setZonaFiltro,
    setModalEditar,
    setVentaEditar,
    setBuscarProductoEdit,
    setMostrarProductosEdit,
    cargarDatos,
    cambiarEstadoVenta,
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
