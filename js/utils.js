// Utilidades compartidas por los temas: mezclar listas y comparar respuestas en alemán.

function shuffleList(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Normaliza para comparar: sin mayúsculas, con ä/ö/ü/ß escritas como ae/oe/ue/ss o sin diacrítico
function germanForms(s) {
  const base = s.trim().toLowerCase().replace(/ß/g, "ss");
  const withAe = base.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue");
  const plain = base.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
  return [withAe, plain];
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

// Devuelve si la respuesta vale: exacta (sin importar mayúsculas y umlauts) o con una errata en palabras largas
function checkGerman(typed, target) {
  const t = germanForms(typed);
  const g = germanForms(target);
  for (const a of t) {
    for (const b of g) {
      if (a === b) return { ok: true, typo: false };
    }
  }
  const tLong = t[0];
  const gLong = g[0];
  if (gLong.length >= 6 && levenshtein(tLong, gLong) <= 1) return { ok: true, typo: true };
  return { ok: false, typo: false };
}

