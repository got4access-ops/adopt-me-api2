const AMVGG_URL = 'https://amvgg.com/values/pets?_rsc=19zvn';

export async function fetchPets() {

  const res = await fetch(AMVGG_URL, {
    headers: { RSC: '1' },
  });

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  const text = await res.text();

  const petsStart = text.indexOf('"pets":[{');
  if (petsStart === -1) throw new Error('Could not find pets array in response');

  const arrayStart = petsStart + 7;
  let depth = 0, i = arrayStart, inStr = false, escape = false;

  for (; i < text.length; i++) {
    const c = text[i];
    if (escape) { escape = false; continue; }
    if (c === '\\' && inStr) { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (c === '[' || c === '{') depth++;
      if (c === ']' || c === '}') { depth--; if (depth === 0) break; }
    }
  }

  const raw = JSON.parse(text.substring(arrayStart, i + 1));

  const pets = raw.map(p => ({
    id: p.id,
    name: p.name,
    origin: p.origin || null,
    category: p.category,
    lastUpdated: p.lastUpdatedAt,

    // Normal variants
    r:   toNum(p.regularValue),     // Regular
    f:   toNum(p.fValue),           // Fly
    nr:  toNum(p.neonValue),        // Neon Regular
    nf:  toNum(p.nfValue),          // Neon Fly
    mr:  toNum(p.megaValue),        // Mega Regular
    mf:  toNum(p.mfValue),          // Mega Fly

    // No-potion variants
    np_r:  toNum(p.npRegularValue),
    np_nr: toNum(p.npNeonValue),
    np_mr: toNum(p.npMegaValue),

    // Demand
    r_demand:  p.regularDemand  || null,
    f_demand:  p.fDemand        || null,
    nr_demand: p.neonDemand     || null,
    nf_demand: p.nfDemand       || null,
    mr_demand: p.megaDemand     || null,
    mf_demand: p.mfDemand       || null,
  }));

  return pets;
}

function toNum(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}
