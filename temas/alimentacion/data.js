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

// ----- Menú: platos sencillos, tres casillas por día (Vorspeise, Mittagessen, Nachspeise) -----
// al = alérgenos con las letras de FOOD_LEGEND (como en el Speisenplan).
// Vorspeise: raw = verdura cruda o ensalada (R6).
// Mittagessen: kind = "veg" | "meat" | "fish"; leg = legumbres (R7); carb = guarnición del plato (R8a, R8b, R8c) o null.
// Nachspeise: fruit = fruta fresca (R5).

// Leyenda de alérgenos (la misma del Speisenplan)
const FOOD_LEGEND = [
  ["A", "Glutenhaltiges Getreide"],
  ["B", "Krebstiere"],
  ["C", "Eier"],
  ["D", "Fisch"],
  ["E", "Erdnüsse"],
  ["F", "Soja"],
  ["G", "Milch"],
  ["H", "Schalenfrüchte"],
  ["I", "Sellerie"],
  ["J", "Senf"],
  ["K", "Sesam"],
  ["L", "Schwefeldioxid/Sulfite"],
  ["M", "Lupinen"],
  ["N", "Weichtiere"]
];

function foodDish(course, de, es, al, props) {
  return Object.assign({ course, de, es, al: al || "" }, props || {});
}

const FOOD_STARTERS = [
  foodDish("starter", "Rohkost", "Verdura cruda", "", { raw: true }),
  foodDish("starter", "Bunter Salat", "Ensalada variada", "J", { raw: true }),
  foodDish("starter", "Krautsalat", "Ensalada de col", "J", { raw: true }),
  foodDish("starter", "Rohkost mit Quark-Dipp", "Verdura cruda con dip de quark", "G", { raw: true }),
  foodDish("starter", "Möhrensalat", "Ensalada de zanahoria", "J", { raw: true }),
  foodDish("starter", "Tomaten-Gurken-Salat", "Ensalada de tomate y pepino", "", { raw: true }),
  foodDish("starter", "Rohkost mit Joghurt-Dressing", "Verdura cruda con aliño de yogur", "G", { raw: true }),
  foodDish("starter", "Apfel-Möhren-Salat", "Ensalada de manzana y zanahoria", "G", { raw: true }),
  foodDish("starter", "Gurkensalat mit Dill", "Ensalada de pepino con eneldo", "", { raw: true }),
  foodDish("starter", "Rotkohlsalat", "Ensalada de lombarda", "J", { raw: true }),
  foodDish("starter", "Paprikastreifen mit Hummus", "Tiras de pimiento con hummus", "K", { raw: true }),
  foodDish("starter", "Rucola-Salat mit Birne", "Ensalada de rúcula con pera", "", { raw: true }),
  foodDish("starter", "Feldsalat mit Gurke", "Ensalada de canónigos con pepino", "", { raw: true }),
  foodDish("starter", "Radieschen-Rohkost", "Verdura cruda de rábanos", "", { raw: true }),
  foodDish("starter", "Selleriesalat mit Apfel", "Ensalada de apio con manzana", "I", { raw: true }),
  foodDish("starter", "Chinakohlsalat", "Ensalada de col china", "J, K", { raw: true }),
  foodDish("starter", "Kohlrabi-Rohkost", "Verdura cruda de colirrábano", "", { raw: true }),
  foodDish("starter", "Gemischter Blattsalat", "Ensalada de hojas variadas", "J", { raw: true }),
  foodDish("starter", "Tomatensalat mit Basilikum", "Ensalada de tomate con albahaca", "", { raw: true }),
  foodDish("starter", "Fenchelsalat mit Orange", "Ensalada de hinojo con naranja", "", { raw: true }),
  foodDish("starter", "Gemüsesuppe", "Sopa de verduras", "", { raw: false }),
  foodDish("starter", "Kürbissuppe", "Crema de calabaza", "G", { raw: false }),
  foodDish("starter", "Gedünsteter Brokkoli", "Brócoli al vapor", "", { raw: false }),
  foodDish("starter", "Gedünstete Karotten", "Zanahorias al vapor", "", { raw: false }),
  foodDish("starter", "Blumenkohl mit Käsesoße", "Coliflor con salsa de queso", "G", { raw: false }),
  foodDish("starter", "Erbsensuppe", "Sopa de guisantes", "", { raw: false }),
  foodDish("starter", "Tomatensuppe", "Sopa de tomate", "G", { raw: false }),
  foodDish("starter", "Kartoffelsuppe", "Sopa de patata", "G", { raw: false }),
  foodDish("starter", "Karottensuppe", "Crema de zanahoria", "G", { raw: false }),
  foodDish("starter", "Spinatpüree", "Puré de espinacas", "G", { raw: false }),
  foodDish("starter", "Gedünsteter Blumenkohl", "Coliflor al vapor", "", { raw: false }),
  foodDish("starter", "Gedünsteter Fenchel", "Hinojo al vapor", "", { raw: false }),
  foodDish("starter", "Ofengemüse", "Verduras al horno", "", { raw: false }),
  foodDish("starter", "Gedünsteter Lauch", "Puerro al vapor", "", { raw: false }),
  foodDish("starter", "Gemüsebrühe mit Nudeln", "Caldo de verduras con fideos", "A, I", { raw: false }),
  foodDish("starter", "Ofenkürbis", "Calabaza al horno", "", { raw: false }),
  foodDish("starter", "Zucchini-Gemüse", "Calabacín salteado", "", { raw: false })
];

// Comidas principales con guarnición (todas llevan cereal o patata)
const FOOD_MAINS = [
  foodDish("main", "Vollkornnudeln mit Tomatensoße", "Pasta integral con salsa de tomate", "A", { kind: "veg", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Nudeln mit Tomatensoße", "Pasta con salsa de tomate", "A", { kind: "veg", leg: false, carb: "nudeln" }),
  foodDish("main", "Gefüllte Paprika mit Reis", "Pimientos rellenos con arroz", "G", { kind: "veg", leg: false, carb: "reis" }),
  foodDish("main", "Schupfnudel-Pfanne mit Gemüse", "Salteado de Schupfnudeln con verduras", "A, C", { kind: "veg", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Pizza Margherita", "Pizza margarita", "A, G", { kind: "veg", leg: false, carb: "brot" }),
  foodDish("main", "Vollkornpizza mit Gemüse", "Pizza integral con verduras", "A, G", { kind: "veg", leg: false, carb: "vollbrot" }),
  foodDish("main", "Kartoffelecken mit Kräuterquark", "Gajos de patata con requesón de hierbas", "G", { kind: "veg", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Kartoffelpüree mit Gemüsesoße", "Puré de patata con salsa de verduras", "G", { kind: "veg", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Gemüsepfanne mit Reis", "Salteado de verduras con arroz", "", { kind: "veg", leg: false, carb: "reis" }),
  foodDish("main", "Vollkornreis mit Gemüse", "Arroz integral con verduras", "", { kind: "veg", leg: false, carb: "vollreis" }),
  foodDish("main", "Käse-Lauch-Auflauf mit Nudeln", "Gratinado de queso y puerro con pasta", "A, C, G", { kind: "veg", leg: false, carb: "nudeln" }),
  foodDish("main", "Spinat-Lasagne", "Lasaña de espinacas", "A, C, G", { kind: "veg", leg: false, carb: "nudeln" }),
  foodDish("main", "Gemüse-Risotto", "Risotto de verduras", "G", { kind: "veg", leg: false, carb: "reis" }),
  foodDish("main", "Tortellini mit Tomatensoße", "Tortellini con salsa de tomate", "A, C", { kind: "veg", leg: false, carb: "nudeln" }),
  foodDish("main", "Vollkornspaghetti mit Pesto", "Espaguetis integrales con pesto", "A, G, H", { kind: "veg", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Reispfanne mit Paprika", "Salteado de arroz con pimiento", "", { kind: "veg", leg: false, carb: "reis" }),
  foodDish("main", "Bunter Reis mit Gemüse", "Arroz de colores con verduras", "", { kind: "veg", leg: false, carb: "reis" }),
  foodDish("main", "Kartoffelbrei mit Spinat", "Puré de patata con espinacas", "G", { kind: "veg", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Ofenkartoffeln mit Quark", "Patatas al horno con quark", "G", { kind: "veg", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Pellkartoffeln mit Kräuterquark", "Patatas con piel y requesón de hierbas", "G", { kind: "veg", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Kartoffel-Gemüse-Eintopf", "Guiso de patata y verduras", "", { kind: "veg", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Vollkornnudeln mit Pilzsoße", "Pasta integral con salsa de champiñones", "A, G", { kind: "veg", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Gnocchi mit Tomatensoße", "Ñoquis con salsa de tomate", "A, C", { kind: "veg", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Rösti mit Apfelmus", "Röstis con compota de manzana", "", { kind: "veg", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Pita mit Gemüsefüllung", "Pan pita relleno de verduras", "A", { kind: "veg", leg: false, carb: "brot" }),
  foodDish("main", "Linsen-Curry mit Reis", "Curry de lentejas con arroz", "", { kind: "veg", leg: true, carb: "reis" }),
  foodDish("main", "Kichererbsen-Curry mit Vollkornreis", "Curry de garbanzos con arroz integral", "", { kind: "veg", leg: true, carb: "vollreis" }),
  foodDish("main", "Bohnen-Chili mit Vollkornreis", "Chili de alubias con arroz integral", "", { kind: "veg", leg: true, carb: "vollreis" }),
  foodDish("main", "Linseneintopf mit Kartoffeln", "Potaje de lentejas con patatas", "", { kind: "veg", leg: true, carb: "kart_frisch" }),
  foodDish("main", "Erbseneintopf mit frischen Kartoffeln", "Guiso de guisantes con patatas frescas", "", { kind: "veg", leg: true, carb: "kart_frisch" }),
  foodDish("main", "Bohnen-Gemüse-Pfanne mit Reis", "Salteado de judías verdes con arroz", "", { kind: "veg", leg: true, carb: "reis" }),
  foodDish("main", "Linsen-Bolognese mit Nudeln", "Boloñesa de lentejas con pasta", "A", { kind: "veg", leg: true, carb: "nudeln" }),
  foodDish("main", "Kichererbsen-Gemüse mit Vollkornnudeln", "Garbanzos con verduras y pasta integral", "A", { kind: "veg", leg: true, carb: "vollnudeln" }),
  foodDish("main", "Erbsen-Kartoffel-Eintopf", "Guiso de guisantes y patata", "", { kind: "veg", leg: true, carb: "kart_frisch" }),
  foodDish("main", "Tofu-Gemüse-Pfanne mit Reis", "Salteado de tofu y verduras con arroz", "F", { kind: "veg", leg: true, carb: "reis" }),
  foodDish("main", "Hähnchen-Nuggets mit Kartoffelpüree", "Nuggets de pollo con puré de patata", "A, G", { kind: "meat", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Frikadellen mit Kartoffelecken", "Hamburguesas con gajos de patata", "A, C", { kind: "meat", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Hackbällchen mit Nudeln", "Albóndigas con pasta", "A, C", { kind: "meat", leg: false, carb: "nudeln" }),
  foodDish("main", "Hack-Lasagne", "Lasaña de carne picada", "A, C, G", { kind: "meat", leg: false, carb: "nudeln" }),
  foodDish("main", "Putenschnitzel mit Vollkornnudeln", "Escalope de pavo con pasta integral", "A, C", { kind: "meat", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Rindergulasch mit Reis", "Gulasch de ternera con arroz", "", { kind: "meat", leg: false, carb: "reis" }),
  foodDish("main", "Hähnchenbrust mit Vollkornreis", "Pechuga de pollo con arroz integral", "", { kind: "meat", leg: false, carb: "vollreis" }),
  foodDish("main", "Hähnchen-Geschnetzeltes mit Reis", "Pollo en tiras con arroz", "G", { kind: "meat", leg: false, carb: "reis" }),
  foodDish("main", "Putenbolognese mit Vollkornnudeln", "Boloñesa de pavo con pasta integral", "A", { kind: "meat", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Chili con Carne mit Reis", "Chili con carne con arroz", "", { kind: "meat", leg: true, carb: "reis" }),
  foodDish("main", "Rinderroulade mit Kartoffelbrei", "Rollitos de ternera con puré de patata", "G", { kind: "meat", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Hähnchenkeule mit Kartoffelecken", "Muslo de pollo con gajos de patata", "", { kind: "meat", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Frikassee mit Vollkornreis", "Fricasé con arroz integral", "G", { kind: "meat", leg: false, carb: "vollreis" }),
  foodDish("main", "Kartoffelauflauf mit Hack", "Pastel de patata con carne picada", "C, G", { kind: "meat", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Hackbraten mit Kartoffelpüree", "Pastel de carne con puré de patata", "A, C, G", { kind: "meat", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Hähnchen-Wrap", "Wrap de pollo", "A, G", { kind: "meat", leg: false, carb: "brot" }),
  foodDish("main", "Pizza mit Hähnchen", "Pizza de pollo", "A, G", { kind: "meat", leg: false, carb: "brot" }),
  foodDish("main", "Fischstäbchen mit Kartoffelpüree", "Palitos de pescado con puré de patata", "A, D, G", { kind: "fish", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Fischfrikadellen mit Kartoffelecken", "Hamburguesas de pescado con gajos de patata", "A, C, D", { kind: "fish", leg: false, carb: "kart_frisch" }),
  foodDish("main", "Lachs mit Vollkornreis", "Salmón con arroz integral", "D", { kind: "fish", leg: false, carb: "vollreis" }),
  foodDish("main", "Fischnudeln mit Vollkornnudeln", "Pasta integral con pescado", "A, D", { kind: "fish", leg: false, carb: "vollnudeln" }),
  foodDish("main", "Thunfisch-Nudeln", "Pasta con atún", "A, D, G", { kind: "fish", leg: false, carb: "nudeln" }),
  foodDish("main", "Fischstäbchen mit Reis", "Palitos de pescado con arroz", "A, D", { kind: "fish", leg: false, carb: "reis" }),
  foodDish("main", "Seelachs mit Kartoffelpüree", "Abadejo con puré de patata", "D, G", { kind: "fish", leg: false, carb: "kart_sobre" }),
  foodDish("main", "Fischfilet mit Vollkornreis", "Filete de pescado con arroz integral", "D", { kind: "fish", leg: false, carb: "vollreis" }),
  foodDish("main", "Fischburger mit Vollkornbrötchen", "Hamburguesa de pescado en pan integral", "A, C, D", { kind: "fish", leg: false, carb: "vollbrot" }),
  foodDish("main", "Thunfisch-Reis-Pfanne", "Salteado de atún con arroz", "D", { kind: "fish", leg: false, carb: "reis" }),
  foodDish("main", "Fischpizza", "Pizza de pescado", "A, D, G", { kind: "fish", leg: false, carb: "brot" }),
  foodDish("main", "Lachsnudeln mit Sahnesoße", "Pasta con salmón y salsa de nata", "A, D, G", { kind: "fish", leg: false, carb: "nudeln" }),
  foodDish("main", "Kabeljau mit Kartoffelecken", "Bacalao con gajos de patata", "D", { kind: "fish", leg: false, carb: "kart_frisch" })
];

// Comidas vegetarianas sin guarnición: solo se usan para crear el fallo de R8a
const FOOD_MAINS_SIN_GUARNICION = [
  foodDish("main", "Gemüsesuppe mit Kräutern", "Sopa de verduras con hierbas", "", { kind: "veg", leg: false, carb: null }),
  foodDish("main", "Käse-Gemüse-Auflauf", "Gratinado de verduras y queso", "C, G", { kind: "veg", leg: false, carb: null }),
  foodDish("main", "Gemüseomelett", "Tortilla de verduras", "C, G", { kind: "veg", leg: false, carb: null }),
  foodDish("main", "Quark-Gemüse-Bällchen", "Bolitas de quark con verduras", "C, G", { kind: "veg", leg: false, carb: null })
];

const FOOD_DESSERTS = [
  foodDish("dessert", "Obst", "Fruta", "", { fruit: true }),
  foodDish("dessert", "Apfelspalten", "Gajos de manzana", "", { fruit: true }),
  foodDish("dessert", "Birnen", "Peras", "", { fruit: true }),
  foodDish("dessert", "Bananen", "Plátanos", "", { fruit: true }),
  foodDish("dessert", "Weintrauben", "Uvas", "", { fruit: true }),
  foodDish("dessert", "Orangen", "Naranjas", "", { fruit: true }),
  foodDish("dessert", "Erdbeeren", "Fresas", "", { fruit: true }),
  foodDish("dessert", "Kiwi", "Kiwi", "", { fruit: true }),
  foodDish("dessert", "Melone", "Melón", "", { fruit: true }),
  foodDish("dessert", "Mandarinen", "Mandarinas", "", { fruit: true }),
  foodDish("dessert", "Pfirsichstücke", "Melocotón en trozos", "", { fruit: true }),
  foodDish("dessert", "Himbeeren", "Frambuesas", "", { fruit: true }),
  foodDish("dessert", "Heidelbeeren", "Arándanos", "", { fruit: true }),
  foodDish("dessert", "Ananasstücke", "Piña en trozos", "", { fruit: true }),
  foodDish("dessert", "Apfelkuchen", "Tarta de manzana", "A, C, G", { fruit: false }),
  foodDish("dessert", "Obstkompott aus der Dose", "Compota de fruta de bote", "", { fruit: false }),
  foodDish("dessert", "Vanillepudding", "Natillas de vainilla", "G", { fruit: false }),
  foodDish("dessert", "Milchreis mit Zimt", "Arroz con leche y canela", "G", { fruit: false }),
  foodDish("dessert", "Joghurt mit Honig", "Yogur con miel", "G", { fruit: false }),
  foodDish("dessert", "Quarkspeise", "Postre de quark", "C, G", { fruit: false }),
  foodDish("dessert", "Butterkekse", "Galletas de mantequilla", "A, C, G", { fruit: false }),
  foodDish("dessert", "Schokopudding", "Pudin de chocolate", "G", { fruit: false }),
  foodDish("dessert", "Grießbrei mit Zimt", "Sémola con canela", "G", { fruit: false }),
  foodDish("dessert", "Apfelmus", "Compota de manzana", "", { fruit: false }),
  foodDish("dessert", "Vollkornkekse", "Galletas integrales", "A, C, G", { fruit: false }),
  foodDish("dessert", "Schokomousse", "Mousse de chocolate", "C, G", { fruit: false }),
  foodDish("dessert", "Quarkbällchen", "Bolitas de quark", "C, G", { fruit: false }),
  foodDish("dessert", "Karottenkuchen", "Tarta de zanahoria", "A, C, G, H", { fruit: false }),
  foodDish("dessert", "Zitronenjoghurt", "Yogur de limón", "G", { fruit: false }),
  foodDish("dessert", "Pfannkuchen mit Zucker", "Tortitas con azúcar", "A, C, G", { fruit: false })
];

// Catálogo de sustitución del examen (por casilla)
const FOOD_CATALOG = { starter: FOOD_STARTERS, main: FOOD_MAINS, dessert: FOOD_DESSERTS };

// ----- Auxiliares -----
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFrom(list) {
  return { ...randomPick(list) };
}

function pickDish(list, pred) {
  const c = list.filter(pred);
  return c.length ? { ...randomPick(c) } : null;
}

// Índice aleatorio de un día del menú que cumple pred (o -1)
function pickDay(plan, pred) {
  const idx = [];
  plan.forEach((d, i) => { if (pred(d)) idx.push(i); });
  return idx.length ? randomPick(idx) : -1;
}

function carbIsFresh(c) {
  return c === "kart_frisch";
}

function carbIsVollkorn(c) {
  return c === "vollnudeln" || c === "vollbrot" || c === "vollreis";
}

// Versión blanca y versión integral de cada guarnición de cereal
const FOOD_WHITE_OF = { vollnudeln: "nudeln", vollbrot: "brot", vollreis: "reis" };
const FOOD_VOLL_OF = { nudeln: "vollnudeln", brot: "vollbrot", reis: "vollreis" };

function ruleById(id) {
  return FOOD_RULES.find(r => r.id === id);
}

// Ids de reglas en el orden de FOOD_RULES
function sortRules(ids) {
  return FOOD_RULES.map(r => r.id).filter(id => ids.includes(id));
}

function sameSet(a, b) {
  return a.length === b.length && a.every(x => b.includes(x));
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

// ----- Reglas: se comprueban sobre el menú completo (5 días) -----
// Devuelve las reglas que incumple el menú (ids de FOOD_RULES).
function checkPlan(plan) {
  const broken = [];
  const count = pred => plan.filter(pred).length;
  if (count(d => d.main.kind === "veg") < 3) broken.push("R1");
  if (count(d => d.main.kind !== "veg") !== 1) broken.push("R2");
  const fruit = count(d => d.dessert.fruit);
  if (fruit < 2 || fruit > 3) broken.push("R5");
  const raw = count(d => d.starter.raw);
  if (raw < 2 || raw > 3) broken.push("R6");
  if (!plan.some(d => d.main.leg)) broken.push("R7");
  if (plan.some(d => !d.main.carb)) broken.push("R8a");
  if (count(d => carbIsFresh(d.main.carb)) < 2) broken.push("R8b");
  if (!plan.some(d => carbIsVollkorn(d.main.carb))) broken.push("R8c");
  return sortRules(broken);
}

// ----- Catálogo de fallos -----
// Cada fallo cambia exactamente UNA casilla (un plato) y rompe sus reglas (rules).
// apply(p) crea el fallo sobre la copia p (o devuelve null si no es posible).
// fix(p) lo corrige; solo se usa para comprobar el generador.
const FOOD_FAULTS = [
  {
    id: "R2a", rules: ["R2"],
    // Un plato vegetariano pasa a carne o pescado: hay dos
    apply(p) {
      const i = pickDay(p, d => d.main.kind === "veg");
      if (i < 0) return null;
      const carb = p[i].main.carb;
      const dish = pickDish(FOOD_MAINS, m => m.kind !== "veg" && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind !== "veg");
      if (!dish) return null;
      p[i].main = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.main.kind !== "veg");
      const carb = p[i].main.carb;
      p[i].main = pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg);
      return p;
    }
  },
  {
    id: "R2b", rules: ["R2"],
    // El único plato de carne o pescado pasa a vegetariano: no hay ninguno
    apply(p) {
      const i = pickDay(p, d => d.main.kind !== "veg");
      if (i < 0) return null;
      const carb = p[i].main.carb;
      const dish = pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg);
      if (!dish) return null;
      p[i].main = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.main.kind === "veg" && !d.main.leg);
      const carb = p[i].main.carb;
      p[i].main = pickDish(FOOD_MAINS, m => m.kind !== "veg" && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind !== "veg");
      return p;
    }
  },
  {
    id: "R5a", rules: ["R5"],
    // Solo 2 días con fruta fresca: uno pasa a postre sin fruta
    apply(p) {
      if (p.filter(d => d.dessert.fruit).length !== 2) return null;
      const i = pickDay(p, d => d.dessert.fruit);
      const dish = pickDish(FOOD_DESSERTS, x => !x.fruit);
      if (!dish) return null;
      p[i].dessert = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => !d.dessert.fruit);
      p[i].dessert = pickDish(FOOD_DESSERTS, x => x.fruit);
      return p;
    }
  },
  {
    id: "R5b", rules: ["R5"],
    // 3 días con fruta fresca: un cuarto día con fruta
    apply(p) {
      if (p.filter(d => d.dessert.fruit).length !== 3) return null;
      const i = pickDay(p, d => !d.dessert.fruit);
      const dish = pickDish(FOOD_DESSERTS, x => x.fruit);
      if (!dish) return null;
      p[i].dessert = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.dessert.fruit);
      p[i].dessert = pickDish(FOOD_DESSERTS, x => !x.fruit);
      return p;
    }
  },
  {
    id: "R6a", rules: ["R6"],
    // Solo 2 días con verdura cruda: uno pasa a verdura cocida
    apply(p) {
      if (p.filter(d => d.starter.raw).length !== 2) return null;
      const i = pickDay(p, d => d.starter.raw);
      const dish = pickDish(FOOD_STARTERS, x => !x.raw);
      if (!dish) return null;
      p[i].starter = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => !d.starter.raw);
      p[i].starter = pickDish(FOOD_STARTERS, x => x.raw);
      return p;
    }
  },
  {
    id: "R6b", rules: ["R6"],
    // 3 días con verdura cruda: un cuarto día con verdura cruda
    apply(p) {
      if (p.filter(d => d.starter.raw).length !== 3) return null;
      const i = pickDay(p, d => !d.starter.raw);
      const dish = pickDish(FOOD_STARTERS, x => x.raw);
      if (!dish) return null;
      p[i].starter = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.starter.raw);
      p[i].starter = pickDish(FOOD_STARTERS, x => !x.raw);
      return p;
    }
  },
  {
    id: "R7", rules: ["R7"],
    // Solo un plato con legumbres: pasa a un vegetariano sin legumbres
    apply(p) {
      if (p.filter(d => d.main.leg).length !== 1) return null;
      const i = pickDay(p, d => d.main.leg);
      const carb = p[i].main.carb;
      const dish = pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg);
      if (!dish) return null;
      p[i].main = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.main.kind === "veg" && !d.main.leg);
      const carb = p[i].main.carb;
      p[i].main = pickDish(FOOD_MAINS, m => m.kind === "veg" && m.leg && m.carb === carb) || pickDish(FOOD_MAINS, m => m.kind === "veg" && m.leg);
      return p;
    }
  },
  {
    id: "R8a", rules: ["R8a"],
    // Un día sin cereal ni patata: el plato vegetariano pasa a uno sin guarnición
    apply(p) {
      const i = pickDay(p, d => d.main.kind === "veg" && !carbIsFresh(d.main.carb) && !carbIsVollkorn(d.main.carb));
      if (i < 0) return null;
      p[i].main = pickFrom(FOOD_MAINS_SIN_GUARNICION);
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => !d.main.carb);
      p[i].main = pickDish(FOOD_MAINS, m => m.kind === "veg" && !m.leg && m.carb === "reis") || pickDish(FOOD_MAINS, m => m.kind === "veg");
      return p;
    }
  },
  {
    id: "R8b", rules: ["R8b"],
    // Solo 2 días con patata fresca: uno pasa a patata de sobre (mismo tipo de plato)
    apply(p) {
      if (p.filter(d => carbIsFresh(d.main.carb)).length !== 2) return null;
      const i = pickDay(p, d => carbIsFresh(d.main.carb));
      const cur = p[i].main;
      const dish = pickDish(FOOD_MAINS, m => m.kind === cur.kind && m.leg === cur.leg && !carbIsFresh(m.carb) && !carbIsVollkorn(m.carb));
      if (!dish) return null;
      p[i].main = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => d.main.carb === "kart_sobre");
      const cur = p[i].main;
      p[i].main = pickDish(FOOD_MAINS, m => m.kind === cur.kind && m.leg === cur.leg && carbIsFresh(m.carb)) || cur;
      return p;
    }
  },
  {
    id: "R8c", rules: ["R8c"],
    // Solo un día con cereal integral: pasa a la versión blanca
    apply(p) {
      if (p.filter(d => carbIsVollkorn(d.main.carb)).length !== 1) return null;
      const i = pickDay(p, d => carbIsVollkorn(d.main.carb));
      const cur = p[i].main;
      const dish = pickDish(FOOD_MAINS, m => m.kind === cur.kind && m.leg === cur.leg && m.carb === FOOD_WHITE_OF[cur.carb]);
      if (!dish) return null;
      p[i].main = dish;
      return p;
    },
    fix(p) {
      const i = pickDay(p, d => FOOD_VOLL_OF[d.main.carb] !== undefined);
      const cur = p[i].main;
      p[i].main = pickDish(FOOD_MAINS, m => m.kind === cur.kind && m.leg === cur.leg && m.carb === FOOD_VOLL_OF[cur.carb]) || cur;
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
