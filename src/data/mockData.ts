export interface Cliente {
  id: string;
  nombre_cliente: string;
  cedula: string;
  fecha_nacimiento: string;
  correo: string;
  celular: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  tipo_servicio: string;
}

export interface Venta {
  id: string;
  cliente_id: string;
  destino: string;
  fecha_venta: string;
  fecha_inicio_viaje: string;
  fecha_fin_viaje: string;
  codigo_reserva_aerea: string;
  codigo_reserva_hotel: string;
  receptivos_programa: string;
  valor_total_venta: number;
  costo_por_proveedor: number;
  ingreso_agencia: number;
  saldo_cliente: number;
  estado_pago_cliente: string;
  plazo_pago_cliente: string;
}

export interface PagoCliente {
  id: string;
  venta_id: string;
  monto_abonado: number;
  fecha_pago: string;
  metodo_pago: string;
}

export interface CuentaPorPagar {
  id: string;
  venta_id: string;
  proveedor_id: string;
  monto_deuda: number;
  plazo_pago_proveedor: string;
  estado_pago: string;
}

export const clientes: Cliente[] = [
  { id: "c1", nombre_cliente: "María García López", cedula: "1234567890", fecha_nacimiento: "1985-03-15", correo: "maria@email.com", celular: "+57 310 123 4567" },
  { id: "c2", nombre_cliente: "Carlos Rodríguez", cedula: "0987654321", fecha_nacimiento: "1990-07-22", correo: "carlos@email.com", celular: "+57 315 987 6543" },
  { id: "c3", nombre_cliente: "Ana Martínez Ruiz", cedula: "5678901234", fecha_nacimiento: "1988-11-08", correo: "ana@email.com", celular: "+57 320 567 8901" },
  { id: "c4", nombre_cliente: "Pedro Sánchez", cedula: "1122334455", fecha_nacimiento: "1992-01-30", correo: "pedro@email.com", celular: "+57 300 112 2334" },
  { id: "c5", nombre_cliente: "Laura Díaz Gómez", cedula: "6677889900", fecha_nacimiento: "1995-05-12", correo: "laura@email.com", celular: "+57 311 667 7889" },
];

export const proveedores: Proveedor[] = [
  { id: "p1", nombre: "Avianca Airlines", tipo_servicio: "Aerolínea" },
  { id: "p2", nombre: "Hotel Decameron", tipo_servicio: "Hotelería" },
  { id: "p3", nombre: "LATAM Airlines", tipo_servicio: "Aerolínea" },
  { id: "p4", nombre: "Hotel Hilton Cartagena", tipo_servicio: "Hotelería" },
  { id: "p5", nombre: "Receptivos Colombia", tipo_servicio: "Receptivo" },
];

export const ventas: Venta[] = [
  { id: "v1", cliente_id: "c1", destino: "Cancún, México", fecha_venta: "2026-03-01", fecha_inicio_viaje: "2026-04-10", fecha_fin_viaje: "2026-04-17", codigo_reserva_aerea: "AV-78234", codigo_reserva_hotel: "DEC-1122", receptivos_programa: "Tour Xcaret + Chichén Itzá", valor_total_venta: 4500000, costo_por_proveedor: 3200000, ingreso_agencia: 1300000, saldo_cliente: 2000000, estado_pago_cliente: "Parcial", plazo_pago_cliente: "2026-04-01" },
  { id: "v2", cliente_id: "c2", destino: "Cartagena, Colombia", fecha_venta: "2026-03-05", fecha_inicio_viaje: "2026-03-28", fecha_fin_viaje: "2026-03-31", codigo_reserva_aerea: "LA-99012", codigo_reserva_hotel: "HIL-3344", receptivos_programa: "City Tour + Islas del Rosario", valor_total_venta: 2800000, costo_por_proveedor: 2100000, ingreso_agencia: 700000, saldo_cliente: 800000, estado_pago_cliente: "Parcial", plazo_pago_cliente: "2026-03-26" },
  { id: "v3", cliente_id: "c3", destino: "Punta Cana, RD", fecha_venta: "2026-03-10", fecha_inicio_viaje: "2026-05-01", fecha_fin_viaje: "2026-05-08", codigo_reserva_aerea: "AV-55678", codigo_reserva_hotel: "DEC-5566", receptivos_programa: "All Inclusive", valor_total_venta: 5200000, costo_por_proveedor: 3800000, ingreso_agencia: 1400000, saldo_cliente: 5200000, estado_pago_cliente: "Pendiente", plazo_pago_cliente: "2026-04-15" },
  { id: "v4", cliente_id: "c4", destino: "San Andrés, Colombia", fecha_venta: "2026-02-20", fecha_inicio_viaje: "2026-03-15", fecha_fin_viaje: "2026-03-20", codigo_reserva_aerea: "AV-33210", codigo_reserva_hotel: "DEC-7788", receptivos_programa: "Snorkel + Acuario", valor_total_venta: 1900000, costo_por_proveedor: 1400000, ingreso_agencia: 500000, saldo_cliente: 0, estado_pago_cliente: "Pagado", plazo_pago_cliente: "2026-03-10" },
  { id: "v5", cliente_id: "c5", destino: "Miami, USA", fecha_venta: "2026-03-18", fecha_inicio_viaje: "2026-06-01", fecha_fin_viaje: "2026-06-10", codigo_reserva_aerea: "LA-11234", codigo_reserva_hotel: "HIL-9900", receptivos_programa: "Parques Universal + Everglades", valor_total_venta: 7800000, costo_por_proveedor: 5600000, ingreso_agencia: 2200000, saldo_cliente: 4000000, estado_pago_cliente: "Parcial", plazo_pago_cliente: "2026-05-15" },
];

export const pagosClientes: PagoCliente[] = [
  { id: "pc1", venta_id: "v1", monto_abonado: 2500000, fecha_pago: "2026-03-01", metodo_pago: "Transferencia" },
  { id: "pc2", venta_id: "v2", monto_abonado: 2000000, fecha_pago: "2026-03-05", metodo_pago: "Tarjeta de Crédito" },
  { id: "pc3", venta_id: "v4", monto_abonado: 1900000, fecha_pago: "2026-02-25", metodo_pago: "Efectivo" },
  { id: "pc4", venta_id: "v5", monto_abonado: 3800000, fecha_pago: "2026-03-18", metodo_pago: "Transferencia" },
];

export const cuentasPorPagar: CuentaPorPagar[] = [
  { id: "cp1", venta_id: "v1", proveedor_id: "p1", monto_deuda: 1800000, plazo_pago_proveedor: "2026-04-05", estado_pago: "Pendiente" },
  { id: "cp2", venta_id: "v1", proveedor_id: "p2", monto_deuda: 1400000, plazo_pago_proveedor: "2026-03-28", estado_pago: "Pendiente" },
  { id: "cp3", venta_id: "v2", proveedor_id: "p3", monto_deuda: 900000, plazo_pago_proveedor: "2026-03-25", estado_pago: "Pendiente" },
  { id: "cp4", venta_id: "v2", proveedor_id: "p4", monto_deuda: 1200000, plazo_pago_proveedor: "2026-03-27", estado_pago: "Pendiente" },
  { id: "cp5", venta_id: "v3", proveedor_id: "p1", monto_deuda: 2000000, plazo_pago_proveedor: "2026-04-20", estado_pago: "Pendiente" },
  { id: "cp6", venta_id: "v3", proveedor_id: "p2", monto_deuda: 1800000, plazo_pago_proveedor: "2026-04-18", estado_pago: "Pendiente" },
  { id: "cp7", venta_id: "v4", proveedor_id: "p1", monto_deuda: 800000, plazo_pago_proveedor: "2026-03-12", estado_pago: "Pagado" },
  { id: "cp8", venta_id: "v4", proveedor_id: "p2", monto_deuda: 600000, plazo_pago_proveedor: "2026-03-14", estado_pago: "Pagado" },
  { id: "cp9", venta_id: "v5", proveedor_id: "p3", monto_deuda: 3000000, plazo_pago_proveedor: "2026-05-20", estado_pago: "Pendiente" },
  { id: "cp10", venta_id: "v5", proveedor_id: "p4", monto_deuda: 2600000, plazo_pago_proveedor: "2026-05-25", estado_pago: "Pendiente" },
];

export const getClienteName = (clienteId: string): string => {
  return clientes.find(c => c.id === clienteId)?.nombre_cliente ?? "Desconocido";
};

export const getProveedorName = (proveedorId: string): string => {
  return proveedores.find(p => p.id === proveedorId)?.nombre ?? "Desconocido";
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);
};

export const getSemaforoStatus = (fechaLimite: string): "verde" | "amarillo" | "rojo" => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(fechaLimite + "T00:00:00");
  const diffDays = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "rojo";
  if (diffDays <= 7) return "amarillo";
  return "verde";
};
