import * as XLSX from "xlsx";

const MILISEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

const parsearFechaLocal = (fechaStr) => {
  const [year, month, day] = fechaStr.split("-");
  return new Date(year, month - 1, day);
};

const formatearFechaDMY = (fecha) => {
  const d = new Date(fecha);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const diferenciaEnDias = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  return Math.floor((fin - inicio) / MILISEGUNDOS_POR_DIA);
};

const sumarMesesRespetandoFinDeMes = (fecha, cantidadMeses) => {
  const base = new Date(fecha);
  const diaOriginal = base.getDate();
  const primerDiaMesObjetivo = new Date(
    base.getFullYear(),
    base.getMonth() + cantidadMeses,
    1,
  );
  const ultimoDiaMesObjetivo = new Date(
    primerDiaMesObjetivo.getFullYear(),
    primerDiaMesObjetivo.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    primerDiaMesObjetivo.getFullYear(),
    primerDiaMesObjetivo.getMonth(),
    Math.min(diaOriginal, ultimoDiaMesObjetivo),
  );
};

const calcularMesesCompletos = (fechaInicio, fechaFin) => {
  let meses = 0;

  while (true) {
    const siguiente = sumarMesesRespetandoFinDeMes(fechaInicio, meses + 1);
    if (siguiente <= fechaFin) {
      meses += 1;
      continue;
    }
    break;
  }

  return meses;
};

const pluralizar = (valor, singular, plural) =>
  `${valor} ${valor === 1 ? singular : plural}`;

const formatearTiempoSegunFrecuencia = (dias, frecuenciaPago, fechaReferencia) => {
  if (dias <= 0) return "Hoy";

  if (frecuenciaPago === "semanal") {
    if (dias < 7) return pluralizar(dias, "dia", "dias");

    const semanas = Math.floor(dias / 7);
    const diasRestantes = dias % 7;
    return diasRestantes > 0
      ? `${pluralizar(semanas, "semana", "semanas")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(semanas, "semana", "semanas");
  }

  if (frecuenciaPago === "quincenal") {
    if (dias < 15) return pluralizar(dias, "dia", "dias");

    const quincenas = Math.floor(dias / 15);
    const diasRestantes = dias % 15;
    return diasRestantes > 0
      ? `${pluralizar(quincenas, "quincena", "quincenas")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(quincenas, "quincena", "quincenas");
  }

  if (frecuenciaPago === "mensual") {
    const hoy = new Date();
    const meses = calcularMesesCompletos(fechaReferencia, hoy);

    if (meses < 1) return pluralizar(dias, "dia", "dias");

    const fechaAncla = sumarMesesRespetandoFinDeMes(fechaReferencia, meses);
    const diasRestantes = diferenciaEnDias(fechaAncla, hoy);
    return diasRestantes > 0
      ? `${pluralizar(meses, "mes", "meses")} y ${pluralizar(diasRestantes, "dia", "dias")}`
      : pluralizar(meses, "mes", "meses");
  }

  return pluralizar(dias, "dia", "dias");
};

export const obtenerFechaUltimoMovimiento = (venta, pagos) => {
  const pagosDelContrato = pagos.filter((p) => p.venta === venta.id);

  if (pagosDelContrato.length > 0) {
    const ultimoPago = pagosDelContrato.reduce((max, p) =>
      new Date(p.fecha_pago) > new Date(max.fecha_pago) ? p : max,
    );
    return parsearFechaLocal(ultimoPago.fecha_pago);
  }

  if (venta.fecha_inicial) {
    return parsearFechaLocal(venta.fecha_inicial);
  }

  return null;
};

export const obtenerFechaReferencia = (venta, pagos) => {
  return obtenerFechaUltimoMovimiento(venta, pagos) || parsearFechaLocal(venta.fecha_venta);
};

export const calcularEstadoAutomatico = (venta, pagos) => {
  if (Number(venta.saldo_pendiente) === 0) return "cancelado";
  if (venta.estado === "recogido") return "recogido";
  if (venta.estado === "bajada") return "bajada";

  const fechaReferencia = obtenerFechaReferencia(venta, pagos);
  const diasSinPago = diferenciaEnDias(fechaReferencia, new Date());

  let diasLimite = 0;
  if (venta.frecuencia_pago === "semanal") diasLimite = 14;
  if (venta.frecuencia_pago === "quincenal") diasLimite = 30;
  if (venta.frecuencia_pago === "mensual") diasLimite = 60;

  return diasSinPago > diasLimite ? "controlar" : "pendiente";
};

export const esBuenPagador = (venta, pagos) => {
  if (parseFloat(venta.saldo_pendiente) === 0) return false;

  const fechaReferencia = obtenerFechaReferencia(venta, pagos);
  const diasSinPago = diferenciaEnDias(fechaReferencia, new Date());

  let diasLimite = 0;
  if (venta.frecuencia_pago === "semanal") diasLimite = 14;
  if (venta.frecuencia_pago === "quincenal") diasLimite = 30;
  if (venta.frecuencia_pago === "mensual") diasLimite = 60;

  return diasSinPago <= diasLimite;
};

export const obtenerUltimoPago = (venta, pagos) => {
  const fechaUltimoMovimiento = obtenerFechaUltimoMovimiento(venta, pagos);
  const fechaReferencia = obtenerFechaReferencia(venta, pagos);
  const dias = diferenciaEnDias(fechaReferencia, new Date());

  return {
    fecha: fechaUltimoMovimiento ? formatearFechaDMY(fechaUltimoMovimiento) : "Sin pagos",
    dias,
    atraso: formatearTiempoSegunFrecuencia(
      dias,
      venta.frecuencia_pago,
      fechaReferencia,
    ),
  };
};

export const obtenerAlertaPromesa = (venta, pagos, observaciones = []) => {
  const observacionesVenta = observaciones
    .filter((item) => item.venta === venta.id)
    .sort((a, b) => {
      const fechaA = new Date(a.fecha_control)
      const fechaB = new Date(b.fecha_control)
      return fechaB - fechaA || b.id - a.id
    })

  const ultimaConPromesa = observacionesVenta.find(
    (item) => item.fecha_compromiso_pago
  )

  if (!ultimaConPromesa?.fecha_compromiso_pago) return null

  const fechaCompromiso = parsearFechaLocal(ultimaConPromesa.fecha_compromiso_pago)
  const fechaUltimoMovimiento = obtenerFechaUltimoMovimiento(venta, pagos)

  // Si ya hubo un movimiento despues de la promesa, la alerta deja de aplicar.
  if (fechaUltimoMovimiento && fechaUltimoMovimiento >= fechaCompromiso) {
    return null
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const diasVencidos = diferenciaEnDias(fechaCompromiso, hoy)

  if (diasVencidos < 0) {
    return {
      tipo: "futura",
      texto: `Promesa ${formatearFechaDMY(fechaCompromiso)}`,
      detalle: "Aun dentro del plazo prometido",
    }
  }

  if (diasVencidos === 0) {
    return {
      tipo: "hoy",
      texto: "Promesa vence hoy",
      detalle: formatearFechaDMY(fechaCompromiso),
    }
  }

  return {
    tipo: "vencida",
    texto: `Promesa vencida`,
    detalle: `${formatearFechaDMY(fechaCompromiso)} · ${diasVencidos} dias`,
  }
}

export const filtrarVentasHistorial = (
  ventas,
  filtro,
  searchTerm,
  cobradores,
  pagos,
  observaciones = [],
) => {
  const estadosInactivos = ["cancelada", "recogido", "bajada"];

  const ventasActivas = ventas.filter(
    (v) => !estadosInactivos.includes(v.estado?.toLowerCase()),
  );

  const clientesControlar = ventasActivas.filter(
    (v) => calcularEstadoAutomatico(v, pagos) === "controlar",
  );

  const buenosPagadores = ventasActivas.filter((v) => esBuenPagador(v, pagos));
  const clientesPromesaVencida = ventasActivas.filter(
    (v) => obtenerAlertaPromesa(v, pagos, observaciones)?.tipo === "vencida"
  )

  let ventasFiltradas = [];

  switch (filtro) {
    case "controlar":
      ventasFiltradas = clientesControlar;
      break;
    case "buenos":
      ventasFiltradas = buenosPagadores;
      break;
    case "promesas_vencidas":
      ventasFiltradas = clientesPromesaVencida;
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
    clientesPromesaVencida,
  };
};

export const controlTarjetasExcel = (ventasFiltradas) => {
  const data = ventasFiltradas.map((v) => ({
    Contrato: v.numero_contrato,
    Cliente: `${v.nombre} ${v.apellido}`,
    Direccion: v.direccion,
    Zona: v.zona,
    Frecuencia: v.frecuencia_pago,
    "Fecha Venta": v.fecha_venta ? formatearFechaDMY(v.fecha_venta) : "",
    "Ultimo Pago": v.ultimo_pago?.fecha || "Sin pagos",
    "Tiempo sin Pago": v.ultimo_pago?.atraso || "-",
    Saldo: parseFloat(v.saldo_pendiente).toFixed(2),
    Cobrador: v.cobrador_nombre || "",
    Estado: v.estado_control || "normal",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Control");
  XLSX.writeFile(wb, "control_cobranza.xlsx");
};
