// Sample/example seed data, ported from the original Claude Artifact
// reference (dashboard-pensado-source.html) so the dashboard isn't empty
// on first load. Every seeded row is marked sample:true and shows the
// "Ejemplo" badge until a human edits it.
const { seedIfEmpty, addToCollection, countCollection } = require("./db");

function seedAll() {
  seedIfEmpty("pedidos", [
    { cliente: "Gabriela R.", producto: "Ponqué de dátiles y nueces", monto: 18, pago: "Transferencia", estado: "Por aprobar" },
    { cliente: "Luis Peña", producto: "Galletas nutritivas (x6) + Hummus", monto: 14, pago: "Pago móvil", estado: "Pagado" },
    { cliente: "Marianela Soto", producto: "Pan de sandwich libre de gluten", monto: 9, pago: "Efectivo", estado: "Atendido por Mafe" },
    { cliente: "Carlos Uzcátegui", producto: "Mermelada mini x4 (regalo corporativo)", monto: 22, pago: "Transferencia", estado: "Pagado" },
    { cliente: "Andreína Paz", producto: "Kibbe congelado (x10)", monto: 16, pago: "Pago móvil", estado: "Por aprobar" },
    { cliente: "José Linares", producto: "Masa de pizza pre-horneada (x2)", monto: 7, pago: "Efectivo", estado: "Atendido por Mafe" },
  ]);

  seedIfEmpty("clientes", [
    { nombre: "Gabriela R.", contacto: "+58 412-555-0133", interes: "Vio el post del ponqué de dátiles en IG", producto: "Ponqué de dátiles y nueces" },
    { nombre: "Luis Peña", contacto: "+58 414-555-0187", interes: "Busca opciones libres de gluten para su hija", producto: "Galletas nutritivas" },
    { nombre: "Carolina M.", contacto: "@carito.ve", interes: "Quiere aprender a decorar postres", producto: "Taller de plating" },
    { nombre: "Carlos Uzcátegui", contacto: "+58 416-555-0120", interes: "Regalo corporativo de fin de año", producto: "Mermelada mini degustación" },
    { nombre: "Andreína Paz", contacto: "+58 412-555-0199", interes: "Repite pedido, le gustó el kibbe la vez pasada", producto: "Kibbe congelado" },
  ]);

  seedIfEmpty("catalogo", [
    { nombre: "Flores y hojas comestibles", linea: "Garnish para alta cocina", precio: 6, etiqueta: "Ninguna" },
    { nombre: "Ponqué de dátiles y nueces", linea: "Panadería / repostería", precio: 18, etiqueta: "Libre de gluten" },
    { nombre: "Galletas nutritivas", linea: "Panadería / repostería", precio: 8, etiqueta: "Libre de gluten" },
    { nombre: "Pan de sandwich", linea: "Panadería", precio: 6, etiqueta: "Libre de gluten" },
    { nombre: "Pita", linea: "Panadería árabe", precio: 5, etiqueta: "Sin confirmar" },
    { nombre: "Masa de pizza pre-horneada", linea: "Panadería árabe", precio: 5, etiqueta: "Sin confirmar" },
    { nombre: "Tortas libres de gluten", linea: "Por encargo", precio: 35, etiqueta: "Libre de gluten" },
    { nombre: "Hummus", linea: "Cocina árabe", precio: 5, etiqueta: "Ninguna" },
    { nombre: "Kibbe congelado", linea: "Cocina árabe", precio: 7, etiqueta: "Libre de gluten" },
    { nombre: "Falafel congelado", linea: "Cocina árabe", precio: 7, etiqueta: "Sin confirmar" },
    { nombre: "Mermelada mini degustación", linea: "Mermeladas gourmet", precio: 2, etiqueta: "Ninguna" },
  ]);

  seedIfEmpty("reservas", [
    { quien: "Carolina M.", curso: "Taller de plating + visita al huerto", estado: "Por confirmar" },
    { quien: "Grupo Farmanova (4 personas)", curso: "Evento 15 nov — menú de miel", estado: "Confirmado" },
    { quien: "Rosana Delgado", curso: "Asesoría de registro sanitario", estado: "Agendada" },
    { quien: "Equipo de cocina Arepa&Co", curso: "Asesoría culinaria (grupo)", estado: "Por confirmar" },
  ]);

  seedIfEmpty("eventos", [
    { fecha: "2026-11-15", nombre: "El sabor de nuestros paisajes en las mieles de las abejas indígenas venezolanas", cupo: 12, estado: "Abierto" },
    { fecha: "2026-11-22", nombre: "Taller de plating + visita al huerto", cupo: 8, estado: "Abierto" },
    { fecha: "2026-12-06", nombre: "Curso de cata de miel de meliponinas", cupo: 10, estado: "Cerrado" },
  ]);

  seedIfEmpty("contabilidad", [
    { fecha: "2026-11-01", tipo: "Ingreso", descripcion: "Pedidos de la semana (panadería)", monto: 86 },
    { fecha: "2026-11-02", tipo: "Gasto operativo", descripcion: "Insumos: harina de almendra, dátiles, nueces", monto: 34 },
    { fecha: "2026-11-03", tipo: "Gasto de curso", descripcion: "Miel de meliponinas para el curso de cata", monto: 20 },
    { fecha: "2026-11-04", tipo: "Ingreso", descripcion: "Mermeladas mini (regalo corporativo)", monto: 44 },
    { fecha: "2026-11-05", tipo: "Gasto de taller", descripcion: "Materiales taller de plating", monto: 15 },
    { fecha: "2026-11-06", tipo: "Otro gasto", descripcion: "Empaques y etiquetas", monto: 12 },
  ]);

  seedIfEmpty("pendientes", [
    { texto: "🔒 Confirmar si pita, masa de pizza y falafel son libres de gluten" },
    { texto: "💰 Cargar precios reales de cada producto (hoy son de ejemplo)" },
    { texto: "🏦 Agregar datos bancarios / pago móvil reales para el bot de pagos" },
    { texto: "📸 Fotos reales de productos sin foto todavía" },
    { texto: "🪴 Mapas del huerto, pisos 4 a 7, para el tour 3D" },
  ]);

  seedIfEmpty("huerto", [
    { nombre: "Capuchina (flor comestible)", descripcion: "Flor de sabor picante, usada como garnish en platos salados.", piso: 1, matero: "P1-M03", foto: null },
    { nombre: "Romero", descripcion: "Hierba aromática, usada en panadería y marinados.", piso: 2, matero: "P2-M01", foto: null },
    { nombre: "Begonia (hoja comestible)", descripcion: "Hoja de sabor cítrico, usada como garnish en postres.", piso: 3, matero: "P3-M05", foto: null },
  ]);

  // Ingredients + recipes are linked by id, so seed them together and only
  // once (same guard as the original artifact: skip if ingredients exist).
  if (countCollection("ingredients") === 0) {
    const seedIngredients = [
      { name: "Harina de almendra", unit: "g", costPerUnit: 0.012 },
      { name: "Dátiles", unit: "g", costPerUnit: 0.009 },
      { name: "Miel de meliponinas", unit: "ml", costPerUnit: 0.08 },
      { name: "Nueces", unit: "g", costPerUnit: 0.015 },
      { name: "Frascos mini degustación", unit: "unidad", costPerUnit: 0.35 },
      { name: "Garbanzo", unit: "g", costPerUnit: 0.004 },
    ];
    const ids = seedIngredients.map((ing) => addToCollection("ingredients", ing, { sample: true }).id);

    addToCollection(
      "recipes",
      {
        name: "Ponqué de dátiles y nueces (libre de gluten)",
        yieldUnits: 8,
        marginPercent: 45,
        items: [
          { ingredientId: ids[0], qty: 250 },
          { ingredientId: ids[1], qty: 150 },
          { ingredientId: ids[3], qty: 100 },
        ],
      },
      { sample: true }
    );
    addToCollection(
      "recipes",
      {
        name: "Mermelada mini degustación",
        yieldUnits: 12,
        marginPercent: 55,
        items: [
          { ingredientId: ids[2], qty: 240 },
          { ingredientId: ids[4], qty: 12 },
        ],
      },
      { sample: true }
    );
    addToCollection(
      "recipes",
      {
        name: "Hummus (tarro mediano)",
        yieldUnits: 6,
        marginPercent: 50,
        items: [{ ingredientId: ids[5], qty: 300 }],
      },
      { sample: true }
    );
  }
}

module.exports = { seedAll };
