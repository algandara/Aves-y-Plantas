// ===== Alimentación infantil: datos del plan semanal =====
// Basado en la Bremer Checkliste (BIPS) para Kindertagesstätten: 5 días de almuerzo.
// El punto 4 (Wunschessen de los niños) no se puede comprobar con una semana y no se usa.

const FOOD_DAYS = [
  { de: "Montag", es: "Lunes" },
  { de: "Dienstag", es: "Martes" },
  { de: "Mittwoch", es: "Miércoles" },
  { de: "Donnerstag", es: "Jueves" },
  { de: "Freitag", es: "Viernes" }
];

// Reglas comprobables del plan. R8 se divide en tres condiciones (a, b, c).
const FOOD_RULES = [
  { id: "R1", de: "3 vegetarische Gerichte", es: "Al menos 3 platos vegetarianos" },
  { id: "R2", de: "Genau 1 Fleisch- oder Fischgericht", es: "Exactamente 1 plato de carne o pescado" },
  { id: "R5", de: "2–3 × frisches Obst", es: "Fruta fresca en 2 o 3 días" },
  { id: "R6", de: "2–3 × Rohkost oder Salat", es: "Verdura cruda o ensalada en 2 o 3 días" },
  { id: "R7", de: "Mindestens 1 × Hülsenfrüchte", es: "Al menos 1 plato con legumbres" },
  { id: "R8a", de: "Täglich Getreide oder Kartoffeln", es: "Cereal o patata todos los días" },
  { id: "R8b", de: "Davon mind. 2 × frische Kartoffeln", es: "Al menos 2 días con patata fresca" },
  { id: "R8c", de: "Davon mind. 1 × Vollkornprodukt", es: "Al menos 1 día con cereal integral" }
];

// Puntos de la checklist que se pueden comprobar (juego de contar puntos)
const FOOD_POINTS = [
  { punto: 1, de: "3 vegetarische Gerichte", es: "3 platos vegetarianos", rules: ["R1"] },
  { punto: 2, de: "Genau 1 Fleisch- oder Fischgericht", es: "Exactamente 1 plato de carne o pescado", rules: ["R2"] },
  { punto: 5, de: "2–3 × frisches Obst", es: "Fruta fresca en 2 o 3 días", rules: ["R5"] },
  { punto: 6, de: "2–3 × Rohkost oder Salat", es: "Verdura cruda o ensalada en 2 o 3 días", rules: ["R6"] },
  { punto: 7, de: "Mindestens 1 × Hülsenfrüchte", es: "Al menos 1 plato con legumbres", rules: ["R7"] },
  { punto: 8, de: "Täglich Getreide oder Kartoffeln, davon 2 × frische Kartoffeln und 1 × Vollkornprodukt", es: "Cereal o patata todos los días, con 2 días de patata fresca y 1 de cereal integral", rules: ["R8a", "R8b", "R8c"] }
];

// Grupos de la pirámide alimentaria (juego Clasificar)
const FOOD_GROUPS = [
  { id: "obst", de: "Obst und Gemüse", es: "Fruta y verdura" },
  { id: "getreide", de: "Brot, Getreide und Beilagen", es: "Pan, cereales y guarniciones" },
  { id: "milch", de: "Milch und Milchprodukte", es: "Leche y lácteos" },
  { id: "protein", de: "Hülsenfrüchte, Fleisch, Fisch und Ei", es: "Legumbres, carne, pescado y huevo" },
  { id: "oele", de: "Öle und Fette, Nüsse", es: "Aceites, grasas y frutos secos" },
  { id: "getraenke", de: "Getränke", es: "Bebidas" },
  { id: "extras", de: "Extras", es: "Dulces y snacks" }
];

const FOOD_ITEMS = [
  // obst: fruta y verdura
  { de: "Apfel", es: "manzana", g: "obst" },
  { de: "Birne", es: "pera", g: "obst" },
  { de: "Banane", es: "plátano", g: "obst" },
  { de: "Orange", es: "naranja", g: "obst" },
  { de: "Erdbeeren", es: "fresas", g: "obst" },
  { de: "Weintrauben", es: "uvas", g: "obst" },
  { de: "Heidelbeeren", es: "arándanos", g: "obst" },
  { de: "Karotte", es: "zanahoria", g: "obst" },
  { de: "Gurke", es: "pepino", g: "obst" },
  { de: "Tomate", es: "tomate", g: "obst" },
  { de: "Paprika", es: "pimiento", g: "obst" },
  { de: "Brokkoli", es: "brócoli", g: "obst" },
  { de: "Spinat", es: "espinacas", g: "obst" },
  { de: "Zucchini", es: "calabacín", g: "obst" },
  // getreide: pan, cereales, arroz, pasta y patata
  { de: "Vollkornbrot", es: "pan integral", g: "getreide" },
  { de: "Roggenbrot", es: "pan de centeno", g: "getreide" },
  { de: "Brötchen", es: "panecillo", g: "getreide" },
  { de: "Haferflocken", es: "copos de avena", g: "getreide" },
  { de: "Müsli", es: "muesli", g: "getreide" },
  { de: "Reis", es: "arroz", g: "getreide" },
  { de: "Vollkornreis", es: "arroz integral", g: "getreide" },
  { de: "Nudeln", es: "pasta", g: "getreide" },
  { de: "Vollkornnudeln", es: "pasta integral", g: "getreide" },
  { de: "Couscous", es: "cuscús", g: "getreide" },
  { de: "Kartoffeln", es: "patatas", g: "getreide" },
  { de: "Kartoffelbrei", es: "puré de patata", g: "getreide" },
  { de: "Ofenkartoffeln", es: "patatas al horno", g: "getreide" },
  // milch: leche y lácteos
  { de: "Milch", es: "leche", g: "milch" },
  { de: "Joghurt", es: "yogur", g: "milch" },
  { de: "Käse", es: "queso", g: "milch" },
  { de: "Quark", es: "requesón", g: "milch" },
  { de: "Buttermilch", es: "suero de mantequilla", g: "milch" },
  { de: "Kefir", es: "kéfir", g: "milch" },
  { de: "Frischkäse", es: "queso fresco", g: "milch" },
  { de: "Mozzarella", es: "mozzarella", g: "milch" },
  { de: "Hüttenkäse", es: "queso cottage", g: "milch" },
  { de: "Sojadrink (mit Calcium)", es: "bebida de soja (con calcio)", g: "milch" },
  // protein: legumbres, carne, pescado y huevo
  { de: "Ei", es: "huevo", g: "protein" },
  { de: "Linsen", es: "lentejas", g: "protein" },
  { de: "Kichererbsen", es: "garbanzos", g: "protein" },
  { de: "Kidneybohnen", es: "alubias rojas", g: "protein" },
  { de: "Weiße Bohnen", es: "alubias blancas", g: "protein" },
  { de: "Erbsen", es: "guisantes", g: "protein" },
  { de: "Dicke Bohnen", es: "habas", g: "protein" },
  { de: "Tofu", es: "tofu", g: "protein" },
  { de: "Hähnchen", es: "pollo", g: "protein" },
  { de: "Putenbrust", es: "pechuga de pavo", g: "protein" },
  { de: "Rindfleisch", es: "ternera", g: "protein" },
  { de: "Hackfleisch", es: "carne picada", g: "protein" },
  { de: "Lachs", es: "salmón", g: "protein" },
  { de: "Thunfisch", es: "atún", g: "protein" },
  { de: "Fischstäbchen", es: "palitos de pescado", g: "protein" },
  // oele: aceites, grasas y frutos secos
  { de: "Butter", es: "mantequilla", g: "oele" },
  { de: "Margarine", es: "margarina", g: "oele" },
  { de: "Olivenöl", es: "aceite de oliva", g: "oele" },
  { de: "Rapsöl", es: "aceite de colza", g: "oele" },
  { de: "Sonnenblumenöl", es: "aceite de girasol", g: "oele" },
  { de: "Walnüsse", es: "nueces", g: "oele" },
  { de: "Mandeln", es: "almendras", g: "oele" },
  { de: "Haselnüsse", es: "avellanas", g: "oele" },
  { de: "Sahne", es: "nata", g: "oele" },
  // getraenke: bebidas
  { de: "Wasser", es: "agua", g: "getraenke" },
  { de: "Mineralwasser", es: "agua mineral", g: "getraenke" },
  { de: "Ungesüßter Tee", es: "té sin azúcar", g: "getraenke" },
  { de: "Kräutertee", es: "infusión de hierbas", g: "getraenke" },
  { de: "Früchtetee (ungesüßt)", es: "té de frutas sin azúcar", g: "getraenke" },
  // extras: dulces, snacks y fritos (con moderación)
  { de: "Schokolade", es: "chocolate", g: "extras" },
  { de: "Gummibärchen", es: "gominolas", g: "extras" },
  { de: "Chips", es: "patatas fritas de bolsa", g: "extras" },
  { de: "Pommes frites", es: "patatas fritas (de freidora)", g: "extras" },
  { de: "Kroketten", es: "croquetas", g: "extras" },
  { de: "Frühlingsrollen", es: "rollitos de primavera", g: "extras" },
  { de: "Krapfen", es: "buñuelo de Berlín", g: "extras" },
  { de: "Kekse", es: "galletas", g: "extras" },
  { de: "Kuchen", es: "tarta", g: "extras" },
  { de: "Speiseeis", es: "helado", g: "extras" },
  { de: "Cola", es: "refresco de cola", g: "extras" },
  { de: "Salzstangen", es: "palitos salados", g: "extras" },
  { de: "Popcorn", es: "palomitas", g: "extras" },
  { de: "Marmelade", es: "mermelada", g: "extras" },
  { de: "Schokoriegel", es: "barrita de chocolate", g: "extras" },
  { de: "Donut", es: "donut", g: "extras" },
  { de: "Lakritz", es: "regaliz", g: "extras" },
  { de: "Pflaumen", es: "ciruelas", g: "obst" },
  { de: "Kirschen", es: "cerezas", g: "obst" },
  { de: "Pfirsich", es: "melocotón", g: "obst" },
  { de: "Mango", es: "mango", g: "obst" },
  { de: "Kiwi", es: "kiwi", g: "obst" },
  { de: "Ananas", es: "piña", g: "obst" },
  { de: "Kohlrabi", es: "colinabo", g: "obst" },
  { de: "Kopfsalat", es: "lechuga", g: "obst" },
  { de: "Blumenkohl", es: "coliflor", g: "obst" },
  { de: "Aubergine", es: "berenjena", g: "obst" },
  { de: "Haferbrei", es: "gachas de avena", g: "getreide" },
  { de: "Dinkelbrot", es: "pan de espelta", g: "getreide" },
  { de: "Vollkornbrötchen", es: "panecillo integral", g: "getreide" },
  { de: "Polenta", es: "polenta", g: "getreide" },
  { de: "Bulgur", es: "bulgur", g: "getreide" },
  { de: "Hirse", es: "mijo", g: "getreide" },
  { de: "Spätzle", es: "spätzle", g: "getreide" },
  { de: "Salzkartoffeln", es: "patatas cocidas", g: "getreide" },
  { de: "Vollkornspaghetti", es: "espaguetis integrales", g: "getreide" },
  { de: "Basmatireis", es: "arroz basmati", g: "getreide" },
  { de: "Parmesan", es: "parmesano", g: "milch" },
  { de: "Feta", es: "feta", g: "milch" },
  { de: "Ricotta", es: "ricotta", g: "milch" },
  { de: "Schmand", es: "nata agria", g: "milch" },
  { de: "Kakao (mit Milch)", es: "cacao con leche", g: "milch" },
  { de: "Laktosefreie Milch", es: "leche sin lactosa", g: "milch" },
  { de: "Schweinefleisch", es: "carne de cerdo", g: "protein" },
  { de: "Hähnchenschenkel", es: "muslo de pollo", g: "protein" },
  { de: "Putenschnitzel", es: "escalope de pavo", g: "protein" },
  { de: "Forelle", es: "trucha", g: "protein" },
  { de: "Kabeljau", es: "bacalao", g: "protein" },
  { de: "Seelachs", es: "abadejo", g: "protein" },
  { de: "Garnelen", es: "gambas", g: "protein" },
  { de: "Hummus", es: "hummus", g: "protein" },
  { de: "Leinöl", es: "aceite de lino", g: "oele" },
  { de: "Kokosöl", es: "aceite de coco", g: "oele" },
  { de: "Sonnenblumenkerne", es: "pipas de girasol", g: "oele" },
  { de: "Erdnussbutter", es: "mantequilla de cacahuete", g: "oele" },
  { de: "Avocado", es: "aguacate", g: "oele" },
  { de: "Apfelschorle (1:3 verdünnt)", es: "zumo de manzana diluido (1:3)", g: "getraenke" },
  { de: "Kamillentee", es: "infusión de manzanilla", g: "getraenke" },
  { de: "Pfefferminztee", es: "té de menta", g: "getraenke" },
  { de: "Fencheltee", es: "infusión de hinojo", g: "getraenke" }
];

// =====================================================================
// CATÁLOGO DE PLATOS (≈900). Se genera combinando ingredientes y preparaciones.
// Cada plato tiene un "slot" (main, carb, raw o dessert) y los datos que usa
// la comprobación de reglas.
// =====================================================================

// ----- Principales vegetarianos: base × método -----
const VEG_BASES = {
  "Linsen": { es: "lentejas", leg: true },
  "Kichererbsen": { es: "garbanzos", leg: true },
  "Bohnen": { es: "judías", leg: true },
  "Kidneybohnen": { es: "alubias rojas", leg: true },
  "Erbsen": { es: "guisantes", leg: true },
  "Dicke Bohnen": { es: "habas", leg: true },
  "Weiße Bohnen": { es: "alubias blancas", leg: true },
  "Tofu": { es: "tofu", leg: true },
  "Gemüse": { es: "verduras", leg: false },
  "Kürbis": { es: "calabaza", leg: false },
  "Spinat": { es: "espinacas", leg: false },
  "Zucchini": { es: "calabacín", leg: false },
  "Karotten": { es: "zanahorias", leg: false },
  "Paprika": { es: "pimiento", leg: false },
  "Brokkoli": { es: "brócoli", leg: false },
  "Blumenkohl": { es: "coliflor", leg: false },
  "Tomaten": { es: "tomate", leg: false },
  "Pilz": { es: "setas", leg: false },
  "Käse": { es: "queso", leg: false },
  "Lauch": { es: "puerro", leg: false },
  "Kohlrabi": { es: "colinabo", leg: false },
  "Aubergine": { es: "berenjena", leg: false },
  "Spargel": { es: "espárragos", leg: false },
  "Mais": { es: "maíz", leg: false },
  "Fenchel": { es: "hinojo", leg: false },
  "Rote-Bete": { es: "remolacha", leg: false },
  "Ei": { es: "huevo", leg: false },
  "Feta": { es: "feta", leg: false },
  "Sellerie": { es: "apio", leg: false },
  "Wirsing": { es: "col rizada", leg: false }
};

const VEG_METHODS = [
  { m: "Curry", es: "curry de", bases: ["Linsen", "Kichererbsen", "Bohnen", "Kidneybohnen", "Erbsen", "Tofu", "Gemüse", "Kürbis", "Spinat", "Blumenkohl", "Brokkoli", "Zucchini", "Karotten", "Mais", "Aubergine", "Ei"] },
  { m: "Bolognese", es: "boloñesa de", bases: ["Linsen", "Kidneybohnen", "Tofu", "Gemüse", "Pilz", "Zucchini", "Karotten", "Lauch", "Sellerie"] },
  { m: "Eintopf", es: "guiso de", bases: ["Linsen", "Bohnen", "Erbsen", "Dicke Bohnen", "Weiße Bohnen", "Gemüse", "Kürbis", "Kohlrabi", "Lauch", "Karotten", "Wirsing", "Sellerie"] },
  { m: "Auflauf", es: "gratinado de", bases: ["Gemüse", "Brokkoli", "Blumenkohl", "Spinat", "Zucchini", "Lauch", "Spargel", "Kürbis", "Aubergine", "Fenchel", "Kohlrabi", "Tomaten", "Wirsing", "Sellerie"] },
  { m: "Pfanne", es: "salteado de", bases: ["Gemüse", "Pilz", "Paprika", "Zucchini", "Brokkoli", "Spinat", "Kichererbsen", "Mais", "Karotten", "Tomaten", "Aubergine", "Tofu", "Ei"] },
  { m: "Frikadellen", es: "hamburguesas de", bases: ["Linsen", "Kichererbsen", "Bohnen", "Erbsen", "Zucchini", "Karotten", "Spinat", "Kürbis", "Rote-Bete", "Tofu", "Feta"] },
  { m: "Burger", es: "burger de", bases: ["Linsen", "Kichererbsen", "Bohnen", "Zucchini", "Karotten", "Rote-Bete", "Pilz", "Spinat", "Mais", "Tofu"] },
  { m: "Suppe", es: "sopa de", bases: ["Linsen", "Erbsen", "Kürbis", "Karotten", "Lauch", "Brokkoli", "Blumenkohl", "Tomaten", "Spinat", "Kohlrabi", "Gemüse", "Fenchel", "Pilz", "Sellerie"] },
  { m: "Gratin", es: "gratinado de", bases: ["Brokkoli", "Blumenkohl", "Spinat", "Lauch", "Spargel", "Kürbis", "Zucchini", "Aubergine", "Fenchel", "Tomaten", "Wirsing"] },
  { m: "Ragout", es: "ragú de", bases: ["Pilz", "Gemüse", "Linsen", "Kichererbsen", "Bohnen", "Kürbis", "Blumenkohl", "Brokkoli", "Erbsen", "Tofu"] },
  { m: "Risotto", es: "risotto de", bases: ["Pilz", "Spargel", "Kürbis", "Spinat", "Erbsen", "Zucchini", "Brokkoli", "Tomaten", "Lauch", "Fenchel", "Rote-Bete", "Gemüse", "Sellerie"] },
  { m: "Lasagne", es: "lasaña de", bases: ["Gemüse", "Spinat", "Zucchini", "Pilz", "Kürbis", "Aubergine", "Brokkoli", "Linsen", "Lauch", "Wirsing"] },
  { m: "Quiche", es: "quiche de", bases: ["Lauch", "Spinat", "Brokkoli", "Zucchini", "Pilz", "Tomaten", "Spargel", "Kürbis", "Mais", "Gemüse", "Feta", "Wirsing"] },
  { m: "Omelett", es: "tortilla de", bases: ["Pilz", "Spinat", "Paprika", "Tomaten", "Zucchini", "Lauch", "Brokkoli", "Spargel", "Feta", "Kohlrabi"] },
  { m: "Strudel", es: "strudel de", bases: ["Spinat", "Lauch", "Pilz", "Zucchini", "Kürbis", "Brokkoli", "Spargel", "Gemüse", "Feta", "Mais"] },
  { m: "Bratlinge", es: "buñuelos de", bases: ["Linsen", "Kichererbsen", "Bohnen", "Erbsen", "Karotten", "Zucchini", "Rote-Bete", "Spinat", "Kürbis", "Tofu"] },
  { m: "Pizza", es: "pizza de", bases: ["Tomaten", "Paprika", "Pilz", "Spinat", "Mais", "Zucchini", "Brokkoli", "Feta", "Gemüse", "Spargel", "Lauch"] },
  { m: "Wrap", es: "wrap de", bases: ["Kichererbsen", "Linsen", "Bohnen", "Gemüse", "Paprika", "Spinat", "Zucchini", "Mais", "Feta", "Tofu"] },
  { m: "Chili", es: "chili de", bases: ["Kidneybohnen", "Bohnen", "Linsen", "Mais", "Paprika", "Kürbis", "Zucchini", "Tomaten", "Tofu"] },
  { m: "Dal", es: "dal de", bases: ["Linsen", "Kichererbsen", "Erbsen", "Dicke Bohnen", "Spinat", "Karotten", "Kürbis", "Blumenkohl"] },
  { m: "Puffer", es: "tortitas de", bases: ["Zucchini", "Karotten", "Lauch", "Brokkoli", "Kohlrabi", "Rote-Bete", "Spinat", "Mais", "Pilz", "Sellerie"] },
  { m: "Pastete", es: "paté de", bases: ["Linsen", "Kichererbsen", "Pilz", "Bohnen", "Erbsen", "Tofu"] },
  { m: "Muffins", es: "muffins de", bases: ["Gemüse", "Zucchini", "Karotten", "Spinat", "Mais", "Lauch", "Kürbis", "Tomaten", "Feta", "Paprika"] },
  { m: "Tortilla", es: "tortilla de", bases: ["Spinat", "Zucchini", "Paprika", "Pilz", "Brokkoli", "Lauch", "Tomaten", "Feta", "Sellerie"] },
  { m: "Schnitzel", es: "escalope de", bases: ["Blumenkohl", "Aubergine", "Zucchini", "Pilz", "Kohlrabi", "Spargel", "Fenchel", "Tofu", "Kürbis"] }
];

const VEG_MAINS = [];
VEG_METHODS.forEach(meth => {
  meth.bases.forEach(b => {
    const base = VEG_BASES[b];
    VEG_MAINS.push({ de: `${b}-${meth.m}`, es: `${meth.es} ${base.es}`, slot: "main", kind: "veg", leg: base.leg });
  });
});

// ----- Principales de carne y pescado (nombre alemán, nombre español) -----
const MEAT_LIST = [
  ["Hähnchenschnitzel", "escalope de pollo"],
  ["Putenschnitzel", "escalope de pavo"],
  ["Schweineschnitzel", "escalope de cerdo"],
  ["Hähnchengeschnetzeltes", "pollo salteado en tiras"],
  ["Putengeschnetzeltes", "pavo salteado en tiras"],
  ["Rindergeschnetzeltes", "ternera salteada en tiras"],
  ["Schweinegeschnetzeltes", "cerdo salteado en tiras"],
  ["Hähnchenspieß", "pincho de pollo"],
  ["Putenspieß", "pincho de pavo"],
  ["Schweinespieß", "pincho de cerdo"],
  ["Rinderspieß", "pincho de ternera"],
  ["Hähnchenbraten", "asado de pollo"],
  ["Putenbraten", "asado de pavo"],
  ["Rinderbraten", "asado de ternera"],
  ["Schweinebraten", "asado de cerdo"],
  ["Rindergulasch", "estofado de ternera"],
  ["Schweinegulasch", "estofado de cerdo"],
  ["Putengulasch", "estofado de pavo"],
  ["Hähnchencurry", "curry de pollo"],
  ["Putencurry", "curry de pavo"],
  ["Hähnchenragout", "ragú de pollo"],
  ["Rinderragout", "ragú de ternera"],
  ["Schweineragout", "ragú de cerdo"],
  ["Hähnchen-Gyros", "gyros de pollo"],
  ["Schweine-Gyros", "gyros de cerdo"],
  ["Rinderröllchen", "rollitos de ternera"],
  ["Hähnchenröllchen", "rollitos de pollo"],
  ["Schweinröllchen", "rollitos de cerdo"],
  ["Hähnchensuppe", "sopa de pollo"],
  ["Rindersuppe", "sopa de ternera"],
  ["Putensuppe", "sopa de pavo"],
  ["Frikadellen", "hamburguesas de carne"],
  ["Hackbraten", "pastel de carne picada"],
  ["Hack-Bolognese", "boloñesa de carne picada"],
  ["Hack-Eintopf", "guiso de carne picada"],
  ["Hack-Auflauf", "gratinado de carne picada"],
  ["Hack-Pfanne", "salteado de carne picada"],
  ["Hack-Lasagne", "lasaña de carne picada"],
  ["Hack-Chili", "chili de carne picada"],
  ["Hack-Klößchen", "albóndigas de carne picada"],
  ["Hackfleisch-Burger", "burger de carne picada"],
  ["Hähnchen-Burger", "burger de pollo"],
  ["Putenfrikadellen", "hamburguesas de pavo"],
  ["Hähnchen-Wraps", "wraps de pollo"]
];

const FISH_LIST = [
  ["Fischstäbchen", "palitos de pescado"],
  ["Fischfrikadellen", "hamburguesas de pescado"],
  ["Lachsfilet", "filete de salmón"],
  ["Forellenfilet", "filete de trucha"],
  ["Pangasiusfilet", "filete de pangasio"],
  ["Kabeljaufilet", "filete de bacalao"],
  ["Schollenfilet", "filete de platija"],
  ["Zanderfilet", "filete de lucioperca"],
  ["Seelachsfilet", "filete de abadejo"],
  ["Seelachs in Kräutersoße", "abadejo con salsa de hierbas"],
  ["Lachs-Auflauf", "gratinado de salmón"],
  ["Seelachs-Auflauf", "gratinado de abadejo"],
  ["Kabeljau-Auflauf", "gratinado de bacalao"],
  ["Pangasius-Auflauf", "gratinado de pangasio"],
  ["Thunfisch-Auflauf", "gratinado de atún"],
  ["Lachspfanne", "salteado de salmón"],
  ["Pangasiuspfanne", "salteado de pangasio"],
  ["Forellenpfanne", "salteado de trucha"],
  ["Zanderpfanne", "salteado de lucioperca"],
  ["Lachsburger", "burger de salmón"],
  ["Seelachsburger", "burger de abadejo"],
  ["Thunfischburger", "burger de atún"],
  ["Seelachs-Eintopf", "guiso de abadejo"],
  ["Kabeljau-Eintopf", "guiso de bacalao"],
  ["Pangasius-Eintopf", "guiso de pangasio"],
  ["Pangasius-Curry", "curry de pangasio"],
  ["Lachs-Curry", "curry de salmón"],
  ["Kabeljau-Curry", "curry de bacalao"],
  ["Seelachs-Ragout", "ragú de abadejo"],
  ["Kabeljau-Ragout", "ragú de bacalao"],
  ["Scholle-Ragout", "ragú de platija"],
  ["Lachsspieß", "pincho de salmón"],
  ["Thunfischspieß", "pincho de atún"],
  ["Forellenspieß", "pincho de trucha"],
  ["Lachs-Lasagne", "lasaña de salmón"],
  ["Thunfisch-Lasagne", "lasaña de atún"],
  ["Seelachs-Lasagne", "lasaña de abadejo"],
  ["Fischsuppe", "sopa de pescado"],
  ["Fischeintopf mit Gemüse", "guiso de pescado con verduras"]
];

// ----- Guarniciones (cereal o patata). type = familia; fresh y vollkorn son las comprobaciones -----
const POTATO_TOPPINGS = [["mit Kräuterquark", "con requesón de hierbas"], ["mit Butter", "con mantequilla"], ["mit Joghurt-Dip", "con salsa de yogur"]];
const SOBRE_TOPPINGS = [["mit Butter", "con mantequilla"], ["mit Soße", "con salsa"]];
const PASTA_TOPPINGS = [["mit Tomatensoße", "con salsa de tomate"], ["mit Pesto", "con pesto"], ["mit Käse", "con queso"], ["mit Gemüsesoße", "con salsa de verduras"]];
const BREAD_TOPPINGS = [["mit Frischkäse", "con queso fresco"], ["mit Butter", "con mantequilla"], ["mit Käse", "con queso"], ["mit Gurke", "con pepino"]];

const CARB_GROUPS = [
  { type: "kart_frisch", fresh: true, vollkorn: false, toppings: POTATO_TOPPINGS, bases: [
    ["Salzkartoffeln", "patatas cocidas"], ["Ofenkartoffeln", "patatas al horno"], ["Pellkartoffeln", "patatas con piel"],
    ["Bratkartoffeln", "patatas salteadas"], ["Kartoffelbrei (frisch)", "puré de patata fresco"], ["Kartoffelwedges", "gajos de patata"],
    ["Kartoffelecken", "gajos de patata al horno"], ["Dillkartoffeln", "patatas con eneldo"], ["Petersilienkartoffeln", "patatas con perejil"],
    ["Rösti", "rösti (tortita de patata)"], ["Kartoffelgratin", "gratén de patata"], ["Kartoffelstampf", "puré de patata rústico"]
  ] },
  { type: "kart_sobre", fresh: false, vollkorn: false, toppings: SOBRE_TOPPINGS, bases: [
    ["Kartoffelpüree aus Flocken", "puré de patata de copos"], ["Kartoffelpüree aus Pulver", "puré de patata en polvo"],
    ["Kartoffelpüree aus dem Beutel", "puré de patata de sobre"], ["Kartoffelklöße (Fertigprodukt)", "bolas de patata precocinadas"],
    ["Kartoffelchips", "patatas chips"]
  ] },
  { type: "reis", fresh: false, vollkorn: false, toppings: PASTA_TOPPINGS, bases: [
    ["Reis", "arroz"], ["Basmatireis", "arroz basmati"], ["Jasminreis", "arroz jazmín"], ["Risottoreis", "arroz para risotto"],
    ["Reisnudeln", "fideos de arroz"], ["Paella-Reis", "arroz para paella"], ["Kräuterreis", "arroz con hierbas"],
    ["Gemüsereis", "arroz con verduras"], ["Kokosreis", "arroz con coco"]
  ] },
  { type: "nudeln", fresh: false, vollkorn: false, toppings: PASTA_TOPPINGS, bases: [
    ["Nudeln", "pasta"], ["Spaghetti", "espaguetis"], ["Penne", "penne"], ["Fusilli", "fusilli"], ["Farfalle", "farfalle"],
    ["Tagliatelle", "tagliatelle"], ["Makkaroni", "macarrones"], ["Spirelli", "espirales"], ["Hörnchen", "macarrones (codos)"], ["Spätzle", "spätzle"]
  ] },
  { type: "vollnudeln", fresh: false, vollkorn: true, toppings: PASTA_TOPPINGS, bases: [
    ["Vollkornnudeln", "pasta integral"], ["Vollkornspaghetti", "espaguetis integrales"], ["Vollkornpenne", "penne integrales"],
    ["Vollkornfusilli", "fusilli integrales"], ["Vollkornhörnchen", "macarrones integrales"], ["Dinkelnudeln", "pasta de espelta"],
    ["Vollkornspirelli", "espirales integrales"]
  ] },
  { type: "brot", fresh: false, vollkorn: false, toppings: BREAD_TOPPINGS, bases: [
    ["Weißbrot", "pan blanco"], ["Toastbrot", "pan de molde"], ["Baguette", "baguette"], ["Brötchen", "panecillo"],
    ["Fladenbrot", "pan de pita"], ["Stangenbrot", "barra de pan"]
  ] },
  { type: "vollbrot", fresh: false, vollkorn: true, toppings: BREAD_TOPPINGS, bases: [
    ["Vollkornbrot", "pan integral"], ["Vollkornbrötchen", "panecillo integral"], ["Roggenbrot", "pan de centeno"],
    ["Dinkelbrot", "pan de espelta"], ["Vollkornfladenbrot", "pan de pita integral"], ["Körnerbrot", "pan de semillas"],
    ["Vollkorntoast", "pan de molde integral"], ["Vollkornbaguette", "baguette integral"], ["Mehrkornbrot", "pan multicereal"],
    ["Vollkornwrap", "wrap integral"]
  ] },
  { type: "vollreis", fresh: false, vollkorn: true, toppings: PASTA_TOPPINGS, bases: [
    ["Vollkornreis", "arroz integral"], ["Naturreis", "arroz natural"], ["Braunreis", "arroz moreno"],
    ["Vollkorn-Couscous", "cuscús integral"], ["Vollkorn-Bulgur", "bulgur integral"]
  ] }
];

// ----- Verdura cruda (R6) y verdura cocida -----
const RAW_BASES = [
  ["Karottensticks", "bastones de zanahoria"], ["Gurkenscheiben", "rodajas de pepino"], ["Paprikastreifen", "tiras de pimiento"],
  ["Kohlrabistifte", "bastones de colinabo"], ["Radieschen", "rábanos"], ["Cocktailtomaten", "tomatitos cherry"],
  ["Rohkostteller", "plato de verdura cruda"], ["Krautsalat", "ensalada de col"], ["Gurkensalat", "ensalada de pepino"],
  ["Tomatensalat", "ensalada de tomate"], ["Karottensalat", "ensalada de zanahoria"], ["Eisbergsalat", "ensalada de lechuga"],
  ["Feldsalat", "ensalada de canónigos"], ["Rucola-Salat", "ensalada de rúcula"], ["Rote-Bete-Salat", "ensalada de remolacha"],
  ["Kohlrabisalat", "ensalada de colinabo"], ["Sellerie-Sticks", "bastones de apio"], ["Blattsalat", "ensalada verde"],
  ["Bunter Salat", "ensalada variada"], ["Coleslaw", "coleslaw"], ["Chinakohlsalat", "ensalada de col china"],
  ["Zucchinirohkost", "calabacín crudo"], ["Fenchelsalat", "ensalada de hinojo"], ["Radiesalat", "ensalada de rábanos"],
  ["Gemischter Salat", "ensalada mixta"]
];
const RAW_VARIANTS = [["", ""], [" mit Joghurt-Dressing", " con aliño de yogur"], [" mit Kräuterdip", " con salsa de hierbas"]];

const COOKED_BASES = [
  ["Karotten", "zanahorias"], ["Erbsen", "guisantes"], ["Grüne Bohnen", "judías verdes"], ["Brokkoli", "brócoli"],
  ["Blumenkohl", "coliflor"], ["Rosenkohl", "coles de Bruselas"], ["Spinat", "espinacas"], ["Mangold", "acelgas"],
  ["Kohlrabi", "colinabo"], ["Zucchini", "calabacín"], ["Fenchel", "hinojo"], ["Lauch", "puerro"], ["Rotkohl", "lombarda"],
  ["Wirsing", "col rizada"], ["Sauerkraut", "chucrut"], ["Grünkohl", "col verde"], ["Spargel", "espárragos"],
  ["Pilze", "setas"], ["Paprika", "pimiento"], ["Kürbis", "calabaza"], ["Mais", "maíz"], ["Rote Bete", "remolacha"],
  ["Gemüsemischung", "mezcla de verduras"]
];
const COOKED_VARIANTS = [[" (gedünstet)", " (al vapor)"], [" (gekocht)", " (cocidas)"], [" (überbacken)", " (gratinadas)"]];

// ----- Postre: fruta fresca (R5) y postres sin fruta fresca -----
const FRUIT_BASES = [
  ["Apfelstücke", "trozos de manzana"], ["Birnenstücke", "trozos de pera"], ["Banane", "plátano"], ["Erdbeeren", "fresas"],
  ["Weintrauben", "uvas"], ["Orangenspalten", "gajos de naranja"], ["Mandarine", "mandarina"], ["Kiwi", "kiwi"],
  ["Melone", "melón"], ["Wassermelone", "sandía"], ["Himbeeren", "frambuesas"], ["Heidelbeeren", "arándanos"],
  ["Pflaumen", "ciruelas"], ["Kirschen", "cerezas"], ["Nektarine", "nectarina"], ["Pfirsich", "melocotón"],
  ["Ananasstücke", "trozos de piña"], ["Mango", "mango"], ["Granatapfel", "granada"], ["Apfelspalten", "gajos de manzana"],
  ["Obstsalat", "macedonia"], ["Clementinen", "clementinas"], ["Aprikosen", "albaricoques"], ["Stachelbeeren", "grosellas espinosas"],
  ["Johannisbeeren", "grosellas"], ["Brombeeren", "moras"], ["Grapefruit", "pomelo"], ["Papaya", "papaya"],
  ["Apfel-Banane", "manzana y plátano"], ["Trauben-Mix", "mezcla de uvas"], ["Apfelschnitze", "gajos de manzana"],
  ["Kirsch-Mix", "mezcla de cerezas"], ["Obstspieße", "pinchos de fruta"], ["Birnen", "peras"], ["Äpfel", "manzanas"],
  ["Apfel-Birne", "manzana y pera"], ["Erdbeer-Banane", "fresa y plátano"], ["Kiwi-Mango", "kiwi y mango"],
  ["Beeren-Mix", "mezcla de bayas"], ["Orangen-Mix", "mezcla de cítricos"]
];
const FRUIT_VARIANTS = [["", ""], [" mit Joghurt", " con yogur"]];

const DESSERT_LIST = [
  ["Pudding (Vanille)", "pudin de vainilla"], ["Pudding (Schoko)", "pudin de chocolate"], ["Pudding (Erdbeer)", "pudin de fresa"],
  ["Grießbrei", "sémola con leche"], ["Milchreis", "arroz con leche"], ["Joghurt natur", "yogur natural"],
  ["Joghurt (Erdbeer)", "yogur de fresa"], ["Joghurt (Vanille)", "yogur de vainilla"], ["Quark mit Honig", "requesón con miel"],
  ["Obstkompott aus der Dose", "compota de fruta de bote"], ["Obstsalat aus der Dose", "macedonia de bote"],
  ["Fruchtmus", "puré de fruta"], ["Apfelmus (Glas)", "compota de manzana (tarro)"],
  ["Kirschkompott (Dose)", "compota de cerezas (bote)"], ["Pfirsichkompott (Dose)", "compota de melocotón (bote)"],
  ["Ananas aus der Dose", "piña de bote"], ["Mandarinen aus der Dose", "mandarinas de bote"], ["Götterspeise", "gelatina"],
  ["Pudding mit Sahne", "pudin con nata"], ["Vanilleeis", "helado de vainilla"], ["Schokoladenpudding", "pudin de chocolate"],
  ["Kekse", "galletas"], ["Kuchen", "bizcocho"], ["Muffin", "muffin"], ["Reiswaffel", "tortita de arroz"],
  ["Pfannkuchen (süß)", "crepe dulce"], ["Keks mit Milch", "galleta con leche"], ["Zwieback", "biscote"],
  ["Gelee mit Vanillesauce", "gelatina con salsa de vainilla"]
];

// ----- Construcción del catálogo -----
const MAIN_MEAT_DISHES = MEAT_LIST.map(([de, es]) => ({ de, es, slot: "main", kind: "meat", leg: false }));
const MAIN_FISH_DISHES = FISH_LIST.map(([de, es]) => ({ de, es, slot: "main", kind: "fish", leg: false }));

const CARB_DISHES = [];
CARB_GROUPS.forEach(g => {
  g.bases.forEach(([de, es]) => {
    const base = { slot: "carb", type: g.type, id: g.type, fresh: g.fresh, vollkorn: g.vollkorn };
    CARB_DISHES.push({ ...base, de, es });
    g.toppings.forEach(([td, tes]) => CARB_DISHES.push({ ...base, de: `${de} ${td}`, es: `${es} ${tes}` }));
  });
});

const RAW_DISHES = [];
RAW_BASES.forEach(([de, es]) => {
  RAW_VARIANTS.forEach(([vd, ves]) => RAW_DISHES.push({ de: de + vd, es: es + ves, slot: "raw", raw: true }));
});
const COOKED_DISHES = [];
COOKED_BASES.forEach(([de, es]) => {
  COOKED_VARIANTS.forEach(([vd, ves]) => COOKED_DISHES.push({ de: de + vd, es: es + ves, slot: "raw", raw: false }));
});

const FRUIT_DISHES = [];
FRUIT_BASES.forEach(([de, es]) => {
  FRUIT_VARIANTS.forEach(([vd, ves]) => FRUIT_DISHES.push({ de: de + vd, es: es + ves, slot: "dessert", fruit: true }));
});
const DESSERT_DISHES = DESSERT_LIST.map(([de, es]) => ({ de, es, slot: "dessert", fruit: false }));

// Un mismo nombre alemán solo aparece una vez
function dedupeDishes(list) {
  const seen = new Set();
  return list.filter(d => {
    if (seen.has(d.de)) return false;
    seen.add(d.de);
    return true;
  });
}

// Componentes sueltos: principales, guarniciones, verduras y postres
const FOOD_COMPONENTS = dedupeDishes([
  ...VEG_MAINS,
  ...MAIN_MEAT_DISHES,
  ...MAIN_FISH_DISHES,
  ...CARB_DISHES,
  ...RAW_DISHES,
  ...COOKED_DISHES,
  ...FRUIT_DISHES,
  ...DESSERT_DISHES
]);

const FOOD_MAIN_POOL = {
  veg: FOOD_COMPONENTS.filter(d => d.slot === "main" && d.kind === "veg"),
  meat: FOOD_COMPONENTS.filter(d => d.slot === "main" && d.kind === "meat"),
  fish: FOOD_COMPONENTS.filter(d => d.slot === "main" && d.kind === "fish")
};
const FOOD_CARB_POOL = FOOD_COMPONENTS.filter(d => d.slot === "carb");
// Sin aderezo (sin " mit "), para que el nombre del plato sea corto
const FOOD_CARB_BASE_POOL = FOOD_CARB_POOL.filter(d => !d.de.includes(" mit "));
const FOOD_RAW_POOL = FOOD_COMPONENTS.filter(d => d.slot === "raw" && d.raw);
const FOOD_RAW_BASE_POOL = FOOD_RAW_POOL.filter(d => !d.de.includes(" mit "));
const FOOD_COOKED_POOL = FOOD_COMPONENTS.filter(d => d.slot === "raw" && !d.raw);
const FOOD_FRUIT_POOL = FOOD_COMPONENTS.filter(d => d.slot === "dessert" && d.fruit);
const FOOD_DESSERT_POOL = FOOD_COMPONENTS.filter(d => d.slot === "dessert" && !d.fruit);

// Postres para el examen (con fruta fresca y sin fruta fresca)
const FOOD_DESSERT_CATALOG = [...FOOD_FRUIT_POOL, ...FOOD_DESSERT_POOL];

// Sin cereal ni patata (fallo R8a)
const FOOD_CARB_NONE = { id: "none", de: "—", es: "sin cereal ni patata", fresh: false, vollkorn: false };

// ----- Platos: mezcla de principal, guarnición y verdura -----

// Generador determinista: el catálogo es el mismo en cada carga
function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Nombre de un plato según los componentes que tenga (cualquiera puede faltar)
function plateName(main, carb, raw) {
  const sides = [carb, raw].filter(x => x && x.id !== "none");
  if (main && sides.length) {
    return {
      de: `${main.de} mit ${sides.map(s => s.de).join(" und ")}`,
      es: `${main.es} con ${sides.map(s => s.es).join(" y ")}`
    };
  }
  if (main) return { de: main.de, es: main.es };
  return { de: sides.map(s => s.de).join(" und "), es: sides.map(s => s.es).join(" y ") };
}

function makePlate(main, carb, raw) {
  const name = plateName(main, carb, raw);
  return {
    slot: "plato",
    de: name.de,
    es: name.es,
    main: main ? { ...main } : null,
    carb: carb && carb.id !== "none" ? { ...carb } : null,
    raw: raw ? { ...raw } : null
  };
}

// Catálogo de platos completos o parciales (~1000), generado a partir de los componentes
function buildPlateCatalog() {
  const rnd = seededRandom(20261105);
  const pick = list => list[Math.floor(rnd() * list.length)];
  const veggies = FOOD_RAW_BASE_POOL.concat(FOOD_COOKED_POOL);
  const out = [];
  [...FOOD_MAIN_POOL.veg, ...FOOD_MAIN_POOL.meat, ...FOOD_MAIN_POOL.fish].forEach(main => {
    out.push(makePlate(main, pick(FOOD_CARB_BASE_POOL), pick(veggies)));   // principal, guarnición y verdura
    out.push(makePlate(main, pick(FOOD_CARB_BASE_POOL), null));            // principal y guarnición
    out.push(makePlate(main, null, pick(FOOD_RAW_BASE_POOL)));             // principal y verdura
  });
  for (let i = 0; i < 120; i++) {
    out.push(makePlate(null, pick(FOOD_CARB_BASE_POOL), pick(veggies)));   // guarnición y verdura, sin principal
  }
  return dedupeDishes(out);
}

const FOOD_PLATE_CATALOG = buildPlateCatalog();
// ----- Funciones auxiliares -----

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFrom(pool) {
  return { ...randomPick(pool) };
}

// Índice aleatorio de los días que cumplen el predicado, o -1
function pickIndex(plan, pred) {
  const idx = [];
  plan.forEach((d, i) => { if (pred(d)) idx.push(i); });
  return idx.length ? randomPick(idx) : -1;
}

// Plato principal de un tipo ("veg", "meat" o "fish"); leg filtra por legumbres si se indica
function pickMain(kind, leg) {
  const list = leg === undefined ? FOOD_MAIN_POOL[kind] : FOOD_MAIN_POOL[kind].filter(x => x.leg === leg);
  return { ...randomPick(list) };
}

// Guarnición de una familia concreta (kart_frisch, kart_sobre, reis, nudeln, vollnudeln, brot, vollbrot, vollreis)
function carbOfType(type) {
  return pickFrom(FOOD_CARB_POOL.filter(c => c.type === type));
}

function ruleById(id) {
  return FOOD_RULES.find(r => r.id === id);
}

// Devuelve los ids en el orden de FOOD_RULES
function sortRules(ids) {
  return FOOD_RULES.map(r => r.id).filter(id => ids.includes(id));
}

function sameSet(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

// Comprueba el plan y devuelve las reglas que incumple (ids de FOOD_RULES).
// Un plato sin principal cuenta como vegetariano. Un plato puede no llevar guarnición o verdura:
// si un día no tiene cereal ni patata, incumple R8a.
function checkPlan(plan) {
  const broken = [];
  const count = pred => plan.filter(pred).length;
  if (count(d => !d.main || d.main.kind === "veg") < 3) broken.push("R1");
  if (count(d => d.main && (d.main.kind === "meat" || d.main.kind === "fish")) !== 1) broken.push("R2");
  const fruit = count(d => d.dessert.fruit);
  if (fruit < 2 || fruit > 3) broken.push("R5");
  const raw = count(d => d.raw && d.raw.raw);
  if (raw < 2 || raw > 3) broken.push("R6");
  if (!plan.some(d => d.main && d.main.leg)) broken.push("R7");
  if (plan.some(d => !d.carb || d.carb.id === "none")) broken.push("R8a");
  if (count(d => d.carb && d.carb.fresh) < 2) broken.push("R8b");
  if (!plan.some(d => d.carb && d.carb.vollkorn)) broken.push("R8c");
  return sortRules(broken);
}
// ----- Catálogo de fallos -----
// Cada fallo cambia exactamente UN día de la semana (una celda) y rompe sus reglas (rules).
// apply(p) crea el fallo sobre la copia p (o devuelve null si no es posible en ese plan).
// fix(p) lo corrige; solo se usa para comprobar el generador.
const FOOD_ERRORS = [
  {
    id: "F1", rules: ["R2"],
    apply(p) {
      // Se cambia un plato vegetariano por carne, sin tocar el único plato con legumbres (para no romper R7)
      const legs = p.filter(d => d.main.leg).length;
      const i = pickIndex(p, d => d.main.kind === "veg" && !(d.main.leg && legs === 1));
      if (i < 0) return null;
      p[i].main = pickMain("meat");
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => d.main.kind === "meat");
      const needLeg = !p.some(d => d.main.leg);
      p[i].main = pickMain("veg", needLeg ? true : undefined);
      return p;
    }
  },
  {
    id: "F2", rules: ["R2"],
    // Ningún plato de carne o pescado: el único pasa a vegetariano
    apply(p) {
      const i = pickIndex(p, d => d.main.kind === "fish" || d.main.kind === "meat");
      if (i < 0) return null;
      p[i].main = pickMain("veg");
      return p;
    },
    fix(p) {
      let i = pickIndex(p, d => d.main.kind === "veg" && !d.main.leg);
      if (i < 0) i = pickIndex(p, d => d.main.kind === "veg");
      p[i].main = pickMain("fish");
      return p;
    }
  },
  {
    id: "F4", rules: ["R5"],
    // Solo 2 días con fruta: se quita uno
    apply(p) {
      if (p.filter(d => d.dessert.fruit).length !== 2) return null;
      const i = pickIndex(p, d => d.dessert.fruit);
      p[i].dessert = pickFrom(FOOD_DESSERT_POOL);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => !d.dessert.fruit);
      p[i].dessert = pickFrom(FOOD_FRUIT_POOL);
      return p;
    }
  },
  {
    id: "F6", rules: ["R5"],
    // 3 días con fruta: se añade un cuarto
    apply(p) {
      if (p.filter(d => d.dessert.fruit).length !== 3) return null;
      const i = pickIndex(p, d => !d.dessert.fruit);
      p[i].dessert = pickFrom(FOOD_FRUIT_POOL);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => d.dessert.fruit);
      p[i].dessert = pickFrom(FOOD_DESSERT_POOL);
      return p;
    }
  },
  {
    id: "F7", rules: ["R6"],
    // Solo 2 días con verdura cruda: se cambia uno por verdura cocida
    apply(p) {
      if (p.filter(d => d.raw.raw).length !== 2) return null;
      const i = pickIndex(p, d => d.raw.raw);
      p[i].raw = pickFrom(FOOD_COOKED_POOL);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => !d.raw.raw);
      p[i].raw = pickFrom(FOOD_RAW_POOL);
      return p;
    }
  },
  {
    id: "F9", rules: ["R6"],
    // 3 días con verdura cruda: se añade un cuarto
    apply(p) {
      if (p.filter(d => d.raw.raw).length !== 3) return null;
      const i = pickIndex(p, d => !d.raw.raw);
      p[i].raw = pickFrom(FOOD_RAW_POOL);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => d.raw.raw);
      p[i].raw = pickFrom(FOOD_COOKED_POOL);
      return p;
    }
  },
  {
    id: "F10", rules: ["R7"],
    // Solo un plato con legumbres: se cambia por un vegetariano sin legumbres
    apply(p) {
      if (p.filter(d => d.main.leg).length !== 1) return null;
      const i = pickIndex(p, d => d.main.leg);
      p[i].main = pickMain("veg", false);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => d.main.kind === "veg" && !d.main.leg);
      p[i].main = pickMain("veg", true);
      return p;
    }
  },
  {
    id: "F11", rules: ["R8b"],
    // Solo 2 días con patata fresca: uno pasa a patata de sobre
    apply(p) {
      if (p.filter(d => d.carb.fresh).length !== 2) return null;
      const i = pickIndex(p, d => d.carb.fresh);
      p[i].carb = carbOfType("kart_sobre");
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => !d.carb.fresh && !d.carb.vollkorn && d.carb.id !== "none");
      p[i].carb = carbOfType("kart_frisch");
      return p;
    }
  },
  {
    id: "F13", rules: ["R8a"],
    // Un día sin cereal ni patata
    apply(p) {
      const i = pickIndex(p, d => !d.carb.fresh && !d.carb.vollkorn);
      if (i < 0) return null;
      p[i].carb = { ...FOOD_CARB_NONE };
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => d.carb.id === "none");
      p[i].carb = carbOfType("reis");
      return p;
    }
  },
  {
    id: "F14", rules: ["R8c"],
    // Solo un día con cereal integral: se cambia por la versión blanca
    apply(p) {
      if (p.filter(d => d.carb.vollkorn).length !== 1) return null;
      const toWhite = { vollnudeln: "nudeln", vollbrot: "brot", vollreis: "reis" };
      const i = pickIndex(p, d => d.carb.vollkorn);
      p[i].carb = carbOfType(toWhite[p[i].carb.type]);
      return p;
    },
    fix(p) {
      const i = pickIndex(p, d => !d.carb.fresh && !d.carb.vollkorn && d.carb.id !== "none");
      p[i].carb = carbOfType("vollbrot");
      return p;
    }
  }
];

// ----- Frecuencia de consumo (juego ¿Con qué frecuencia?) -----
// Frecuencia recomendada por grupo; las excepciones (por nombre alemán) van después.
const FOOD_FREQS = [
  { id: "diario", de: "Täglich", es: "Todos los días" },
  { id: "cuatro", de: "4–5 × pro Woche", es: "4–5 veces por semana" },
  { id: "dos", de: "2–3 × pro Woche", es: "2–3 veces por semana" },
  { id: "una", de: "1 × pro Woche", es: "1 vez por semana" },
  { id: "menos", de: "Seltener als 1 × pro Woche", es: "Menos de 1 vez por semana" }
];

const FOOD_FREQ_GROUP = {
  obst: "diario",
  getreide: "diario",
  milch: "diario",
  getraenke: "diario",
  oele: "diario",
  protein: "dos",
  extras: "menos"
};

const FOOD_FREQ_EXCEPTIONS = {
  // Lácteos
  "Käse": "cuatro",
  "Frischkäse": "cuatro",
  "Mozzarella": "cuatro",
  "Feta": "dos",
  "Ricotta": "dos",
  "Parmesan": "dos",
  "Hüttenkäse": "dos",
  "Kakao (mit Milch)": "dos",
  // Aceites, frutos secos y nata
  "Sahne": "una",
  "Avocado": "una",
  "Walnüsse": "dos",
  "Mandeln": "dos",
  "Haselnüsse": "dos",
  "Sonnenblumenkerne": "dos",
  "Erdnussbutter": "dos",
  // Bebidas
  "Apfelschorle (1:3 verdünnt)": "una",
  // Pescado: 1 vez por semana
  "Lachs": "una",
  "Thunfisch": "una",
  "Kabeljau": "una",
  "Seelachs": "una",
  "Forelle": "una",
  "Garnelen": "una",
  "Fischstäbchen": "una",
  // Extras: algunos dulces 1 vez por semana
  "Schokolade": "una",
  "Kekse": "una",
  "Kuchen": "una",
  "Speiseeis": "una",
  "Marmelade": "una"
};

// Frecuencia recomendada de un alimento del catálogo FOOD_ITEMS
function foodFreqOf(item) {
  return FOOD_FREQ_EXCEPTIONS[item.de] || FOOD_FREQ_GROUP[item.g];
}