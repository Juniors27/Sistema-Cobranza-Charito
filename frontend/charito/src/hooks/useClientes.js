import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  clientesService,
  cambiarEstadoVentaService,
} from "@/src/services/clientesService";
import { productos } from "@/src/data/productos";
import { getVentas } from "@/src/services/ventasService";
import { obtenerCobradores } from "@/src/services/cobradoresService";
import { exportarExcel as exportarExcelUtil } from "@/src/utils/clientesUtils";

export const useClientes = () => {
  const [ventas, setVentas] = useState([]);
  const [cobradores, setCobradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [zonaFiltro, setZonaFiltro] = useState("todas");
  const [modalEditar, setModalEditar] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buscarProductoEdit, setBuscarProductoEdit] = useState("");
  const [mostrarProductosEdit, setMostrarProductosEdit] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasData, cobradoresData] = await Promise.all([
        getVentas(),
        obtenerCobradores(),
      ]);

      setVentas(ventasData);
      setCobradores(cobradoresData);
    } catch (error) {
      setError(error.message);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoVenta = async (numero_contrato, estadoObjetivo) => {
    try {
      const venta = ventas.find((v) => v.numero_contrato === numero_contrato);

      if (!venta) return toast.error("No se encontró la venta");
      if (venta.estado === "cancelado")
        return toast.error("La venta está cancelada");

      const nuevoEstado =
        venta.estado === estadoObjetivo ? "pendiente" : estadoObjetivo;

      await cambiarEstadoVentaService(venta.id, nuevoEstado);

      setVentas((prev) =>
        prev.map((v) =>
          v.id === venta.id ? { ...v, estado: nuevoEstado } : v,
        ),
      );

      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al cambiar el estado");
    }
  };

  const abrirModalEditar = (venta) => {
    setVentaEditar({ ...venta });

    const productoEncontrado = productos.find(
      (p) => p.nombre === venta.producto_nombre,
    );

    setProductoSeleccionado(productoEncontrado || null);
    setBuscarProductoEdit(venta.producto_nombre || "");
    setModalEditar(true);
  };

  const guardarEdicion = async () => {
    try {
      if (
        !ventaEditar.nombre ||
        !ventaEditar.apellido ||
        !ventaEditar.direccion
      )
        return toast.error("Completa los campos obligatorios");

      if (!ventaEditar.cobrador) return toast.error("Selecciona un cobrador");

      if (!productoSeleccionado) return toast.error("Selecciona un producto");

      const ventaActualizada = {
        ...ventaEditar,
        producto: {
          nombre: productoSeleccionado.nombre,
          categoria: productoSeleccionado.categoria,
        },
        cobrador: Number(ventaEditar.cobrador),
      };

      await clientesService.actualizar(ventaEditar.id, ventaActualizada);
      await cargarDatos();

      setModalEditar(false);
      toast.success("Cliente actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const eliminarVenta = async (ventaId) => {
    if (!confirm("¿Eliminar cliente y pagos?")) return;

    try {
      await clientesService.eliminar(ventaId);
      setVentas((prev) => prev.filter((v) => v.id !== ventaId));
      toast.success("Cliente eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // 🔹 FILTROS
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const matchZona = zonaFiltro === "todas" || v.zona === zonaFiltro;
      const search = searchTerm.toLowerCase();

      const matchSearch =
        v.numero_contrato?.toLowerCase().includes(search) ||
        v.nombre?.toLowerCase().includes(search) ||
        v.apellido?.toLowerCase().includes(search) ||
        v.direccion?.toLowerCase().includes(search) ||
        v.producto_nombre?.toLowerCase().includes(search);

      return matchZona && matchSearch;
    });
  }, [ventas, searchTerm, zonaFiltro]);

  const exportarExcel = () => exportarExcelUtil(ventasFiltradas);

  return {
    ventasFiltradas,
    exportarExcel,
    cobradores,
    searchTerm,
    zonaFiltro,
    modalEditar,
    ventaEditar,
    productos,
    loading,
    error,
    buscarProductoEdit,
    mostrarProductosEdit,
    productoSeleccionado,

    setSearchTerm,
    setZonaFiltro,
    setModalEditar,
    setVentaEditar,
    setBuscarProductoEdit,
    setMostrarProductosEdit,
    setProductoSeleccionado,
    cargarDatos,
    cambiarEstadoVenta,
    abrirModalEditar,
    guardarEdicion,
    eliminarVenta,
  };
};
