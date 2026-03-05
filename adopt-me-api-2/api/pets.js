import { fetchPets } from '../lib/scraper.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const pets = await fetchPets();

    const { name, origin, demand } = req.query;
    let result = pets;

    if (name) {
      const q = name.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    if (origin) {
      const q = origin.toLowerCase();
      result = result.filter(p => p.origin?.toLowerCase().includes(q));
    }
    if (demand) {
      const q = demand.toLowerCase();
      result = result.filter(p =>
        [p.r_demand, p.nr_demand, p.mr_demand].some(d => d?.toLowerCase() === q)
      );
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      pets: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
