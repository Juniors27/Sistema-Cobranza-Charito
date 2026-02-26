import * as XLSX from "xlsx";

/* =========================
     ESTADO AUTOMÁTICO
  ========================== */
export const calcularEstadoAutomatico = (venta, pagos) => {
  if (Number(venta.saldo_pendiente) === 0) return "cancelado";
  if (venta.estado === "recogido") return "recogido";
  if (venta.estado === "bajada") return "bajada";

  const fechaReferencia = obtenerFechaReferencia(venta, pagos);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaRef = new Date(fechaReferencia);
  fechaRef.setHours(0, 0, 0, 0);
  const diasSinPago = Math.floor((hoy - fechaRef) / (1000 * 60 * 60 * 24));

  let diasLimite = 0;
  if (venta.frecuencia_pago === "semanal") diasLimite = 14;
  if (venta.frecuencia_pago === "quincenal") diasLimite = 30;
  if (venta.frecuencia_pago === "mensual") diasLimite = 60;

  return diasSinPago > diasLimite ? "controlar" : "pendiente";
};

/* =========================
     BUEN PAGADOR
  ========================== */
export const esBuenPagador = (venta, pagos) => {
  if (parseFloat(venta.saldo_pendiente) === 0) return false;

  const fechaReferencia = obtenerFechaReferencia(venta, pagos);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaRef = new Date(fechaReferencia);
  fechaRef.setHours(0, 0, 0, 0);
  const diasSinPago = Math.floor((hoy - fechaRef) / (1000 * 60 * 60 * 24));

  let diasLimite = 0;
  if (venta.frecuencia_pago === "semanal") diasLimite = 14;
  if (venta.frecuencia_pago === "quincenal") diasLimite = 30;
  if (venta.frecuencia_pago === "mensual") diasLimite = 60;

  return diasSinPago <= diasLimite;
};

/* =========================
     ÚLTIMO PAGO / DÍAS
  ========================== */
export const obtenerUltimoPago = (venta, pagos) => {
  const fechaReferencia = obtenerFechaReferencia(venta, pagos);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaRef = new Date(fechaReferencia);
  fechaRef.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy - fechaRef) / (1000 * 60 * 60 * 24));

  return {
    fecha: formatearFechaDMY(fechaReferencia),
    dias,
  };
};

/* =========================
     FECHA BASE PARA CÁLCULOS
  ========================== */
export const obtenerFechaReferencia = (venta, pagos) => {
  const pagosDelContrato = pagos.filter((p) => p.venta === venta.id);

  let fechaStr = null;

  if (pagosDelContrato.length > 0) {
    const ultimoPago = pagosDelContrato.reduce((max, p) =>
      new Date(p.fecha_pago) > new Date(max.fecha_pago) ? p : max,
    );
    fechaStr = ultimoPago.fecha_pago;
  } else if (venta.fecha_inicial) {
    fechaStr = venta.fecha_inicial;
  } else {
    fechaStr = venta.fecha_venta;
  }

  const [year, month, day] = fechaStr.split("-");
  return new Date(year, month - 1, day);
};

/* =========================
     FORMATEAR FECHA
  ========================== */
const formatearFechaDMY = (fecha) => {
  const d = new Date(fecha);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/* ===========================
   FILTRO PRINCIPAL
=========================== */
export const filtrarVentasHistorial = (
  ventas,
  filtro,
  searchTerm,
  cobradores,
  pagos,
) => {
  const estadosInactivos = ["cancelada", "recogido", "bajada"];

  const ventasActivas = ventas.filter(
    (v) => !estadosInactivos.includes(v.estado?.toLowerCase()),
  );

  const clientesControlar = ventasActivas.filter(
    (v) => calcularEstadoAutomatico(v, pagos) === "controlar",
  );

  const buenosPagadores = ventasActivas.filter((v) => esBuenPagador(v, pagos));

  let ventasFiltradas = [];

  switch (filtro) {
    case "controlar":
      ventasFiltradas = clientesControlar;
      break;
    case "buenos":
      ventasFiltradas = buenosPagadores;
      break;
    default:
      ventasFiltradas = [...clientesControlar, ...buenosPagadores];
  }

  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    const cobradoresMap = Object.fromEntries(cobradores.map((c) => [c.id, c]));

    ventasFiltradas = ventasFiltradas.filter((v) => {
      const cobrador = cobradoresMap[v.cobrador];
      return (
        v.numero_contrato?.toLowerCase().includes(search) ||
        v.nombre?.toLowerCase().includes(search) ||
        v.apellido?.toLowerCase().includes(search) ||
        v.direccion?.toLowerCase().includes(search) ||
        v.zona?.toLowerCase().includes(search) ||
        cobrador?.nombre?.toLowerCase().includes(search)
      );
    });
  }

  return {
    ventasFiltradas,
    clientesControlar,
    buenosPagadores,
  };
};

/* ===========================
   EXPORTAR EXCEL
=========================== */
export const controlTarjetasExcel = (ventasFiltradas, cobradores, pagos) => {
  const data = ventasFiltradas.map((v) => {
    const cobrador = cobradores.find((c) => c.id === v.cobrador);
    const ultimoPago = obtenerUltimoPago(v, pagos);

    return {
      Contrato: v.numero_contrato,
      Cliente: `${v.nombre} ${v.apellido}`,
      Dirección: v.direccion,
      Zona: v.zona,
      Frecuencia: v.frecuencia_pago,
      "Fecha Venta": formatearFechaDMY(v.fecha_venta),
      "Último Pago": ultimoPago.fecha,
      "Días sin Pago": ultimoPago.dias,
      Saldo: parseFloat(v.saldo_pendiente).toFixed(2),
      Cobrador: cobrador?.nombre || "",
      Estado: calcularEstadoAutomatico(v, pagos),
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Control");
  XLSX.writeFile(wb, "control_cobranza.xlsx");
};