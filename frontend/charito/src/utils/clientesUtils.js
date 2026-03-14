import * as XLSX from "xlsx"
import { toast } from "sonner"


//FORMATEA FECHA PARA QUE SEA DD/MM/AAAA
export const formatearFechaDMY = (fecha) => {
  if (!fecha) return "";

  let dateObj = fecha;

  // Si viene como string "YYYY-MM-DD"
  if (typeof fecha === "string") {
    const [y, m, d] = fecha.split("-");
    dateObj = new Date(y, m - 1, d);
  }

  // Validación extra por si llega algo raro
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";

  const d = String(dateObj.getDate()).padStart(2, "0");
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const y = dateObj.getFullYear();

  return `${d}/${m}/${y}`;
};

export const obtenerFechaReferenciaPago = (venta) => {
  if (venta?.ultimo_pago_fecha) {
    return formatearFechaDMY(venta.ultimo_pago_fecha)
  }

  if (venta?.fecha_inicial) {
    return formatearFechaDMY(venta.fecha_inicial)
  }

  return "Sin pagos"
}



//CALCULA EL ESTADO AUTOMATICO DE L CONTRATO
export const calcularEstadoAutomatico = (venta) => {
  if (!venta) return "pendiente";

  const saldo = Number(venta.saldo_pendiente);

  if (saldo <= 0) return "cancelado";

  if (venta.estado === "recogido") return "recogido";
  if (venta.estado === "bajada") return "bajada";

  if (!venta.ultimo_pago_fecha) return "pendiente";

  const dias = Math.floor(
    (new Date() - new Date(venta.ultimo_pago_fecha)) / (1000 * 60 * 60 * 24),
  );

  let limite = 0;
  if (venta.frecuencia_pago === "semanal") limite = 21;
  if (venta.frecuencia_pago === "quincenal") limite = 30;
  if (venta.frecuencia_pago === "mensual") limite = 60;

  return dias > limite ? "controlar" : "pendiente";
};


//OBTIENE EL COLOR DE LOS ESTADOS
export const obtenerColorEstado = (estado) => {
  const colores = {
    cancelado: "bg-red-100 text-red-800",
    pendiente: "bg-green-100 text-green-800",
    recogido: "bg-orange-100 text-orange-800",
    controlar: "bg-black text-white",
    bajada: "bg-purple-100 text-purple-800",
  };
  return colores[estado] || colores["pendiente"];
};


//EXPORTA LAS TARJETAS DE CLIENTES A EXCEL
 export const exportarExcel = (ventasFiltradas) => {

    if (!Array.isArray(ventasFiltradas) || ventasFiltradas.length === 0) {
      toast.error("No hay ventas para exportar")
      return
    }

    const data = ventasFiltradas.map((venta) => {
      const ultimoPago = obtenerFechaReferenciaPago(venta)

      return {
        Contrato: venta.numero_contrato,
        Cliente: `${venta.nombre} ${venta.apellido}`,
        Dirección: venta.direccion,
        Lugar: venta.lugar,
        Zona: venta.zona,
        Producto: venta.producto_nombre,
        "Precio Total": venta.precio_total,
        "Fecha Venta": formatearFechaDMY(venta.fecha_venta),
        "Día Cobro": venta.dia_cobro,
        "Saldo Pendiente": venta.saldo_pendiente,
        "Último Pago": ultimoPago,
        Frecuencia: venta.frecuencia_pago,
        Estado: calcularEstadoAutomatico(venta),
        Cobrador:venta.cobrador_nombre,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes")

    XLSX.writeFile(workbook, "Registro_clientes.xlsx")

    toast.success("Excel exportado correctamente")
  }
