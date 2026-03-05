import { fetchPets } from '../../lib/scraper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { name } = req.query;
  if (!name) return res.status(400).json({ success: false, error: 'Missing pet name' });

  try {
    const pets = await fetchPets();
    const q = decodeURIComponent(name).toLowerCase().trim();

    let pet = pets.find(p => p.name.toLowerCase() === q);
    if (!pet) pet = pets.find(p => p.name.toLowerCase().includes(q));

    if (!pet) {
      return res.status(404).json({ success: false, error: `Pet "${name}" not found` });
    }

    return res.status(200).json({
      success: true,
      name: pet.name,
      origin: pet.origin,

      regular:    pet.r,
      fly:        pet.f,
      neon:       pet.nr,
      neonfly:    pet.nf,
      mega:       pet.mr,
      megafly:    pet.mf,

      np_regular: pet.np_r,
      np_neon:    pet.np_nr,
      np_mega:    pet.np_mr,

      regular_demand: pet.r_demand,
      neon_demand:    pet.nr_demand,
      mega_demand:    pet.mr_demand,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
