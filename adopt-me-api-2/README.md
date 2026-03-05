# Adopt Me Values API

Serverless API hosted on Vercel that scrapes pet values from amvgg.com and serves them as JSON. Built for use with Lua scripts.

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

That's it. No env vars needed.

---

## Endpoints

### `GET /api/pets`
Returns all 700+ pets.

**Query params (all optional):**
- `?name=cow` — filter by name (partial match)
- `?origin=farm egg` — filter by origin
- `?demand=high` — filter by demand level

```json
{
  "success": true,
  "count": 1,
  "pets": [{
    "name": "Cow",
    "origin": "Farm Egg",
    "r": 0.1475,
    "f": 0.1425,
    "nr": 0.33,
    "nf": 0.325,
    "mr": 1.125,
    "mf": 1.15,
    "np_r": 0.1325,
    "np_nr": 0.345,
    "np_mr": 1.375,
    "r_demand": "High",
    "nr_demand": "High",
    "mr_demand": "High"
  }]
}
```

---

### `GET /api/pet/:name`
Get a single pet by name (exact or partial match).

```
/api/pet/Bat Dragon
/api/pet/bat dragon
/api/pet/bat
```

---

### `GET /api/value/:name`
Lua-friendly flat response with just values + demand.

```
/api/value/Cow
/api/value/shadow dragon
```

```json
{
  "success": true,
  "name": "Cow",
  "origin": "Farm Egg",
  "regular": 0.1475,
  "fly": 0.1425,
  "neon": 0.33,
  "neonfly": 0.325,
  "mega": 1.125,
  "megafly": 1.15,
  "np_regular": 0.1325,
  "np_neon": 0.345,
  "np_mega": 1.375,
  "regular_demand": "High",
  "neon_demand": "High",
  "mega_demand": "High"
}
```

**`null`** means that variant doesn't have a tracked value (e.g. pets that can't fly).

---

## Lua Usage Examples

### Basic value lookup (HttpService)

```lua
local HttpService = game:GetService("HttpService")

local BASE = "https://your-app.vercel.app"

local function getPetValue(petName, variant)
    -- variant: "regular", "fly", "neon", "neonfly", "mega", "megafly"
    local url = BASE .. "/api/value/" .. HttpService:UrlEncode(petName)
    local ok, res = pcall(function()
        return HttpService:GetAsync(url)
    end)
    if not ok then return nil, "Request failed" end

    local data = HttpService:JSONDecode(res)
    if not data.success then return nil, data.error end

    return data[variant or "regular"], data
end

-- Examples:
local cowValue = getPetValue("Cow", "mega")
print("Mega Cow:", cowValue) -- 1.125

local batR, batFull = getPetValue("Bat Dragon", "regular")
print("Bat Dragon R:", batR)          -- 2.91
print("Bat Dragon demand:", batFull.regular_demand)  -- High
```

### Check if a trade is fair

```lua
local function isFairTrade(yourPets, theirPets)
    local function totalValue(pets)
        local total = 0
        for _, entry in ipairs(pets) do
            local val = getPetValue(entry.name, entry.variant or "regular")
            total = total + (val or 0)
        end
        return total
    end

    local yourTotal = totalValue(yourPets)
    local theirTotal = totalValue(theirPets)
    local ratio = yourTotal / theirTotal

    -- Fair if within 10%
    return ratio >= 0.9 and ratio <= 1.1, yourTotal, theirTotal
end

local fair, mine, theirs = isFairTrade(
    { {name="Cow", variant="mega"} },
    { {name="Parrot", variant="regular"}, {name="Crow", variant="regular"} }
)
print("Fair trade?", fair, "| You:", mine, "| Them:", theirs)
```

### Fetch all high-demand pets

```lua
local function getHighDemandPets()
    local url = BASE .. "/api/pets?demand=High"
    local res = HttpService:GetAsync(url)
    local data = HttpService:JSONDecode(res)
    return data.pets
end
```

---

## Caching

Data is cached for **30 minutes** server-side, so your Lua scripts won't hammer amvgg.com. Vercel also CDN-caches responses for 30 minutes.

## Value fields reference

| Field | Meaning |
|-------|---------|
| `r` / `regular` | Regular (no potion) |
| `f` / `fly` | Fly potion applied |
| `nr` / `neon` | Neon Regular |
| `nf` / `neonfly` | Neon Fly |
| `mr` / `mega` | Mega Regular |
| `mf` / `megafly` | Mega Fly |
| `np_r` / `np_regular` | No-potion Regular |
| `np_nr` / `np_neon` | No-potion Neon |
| `np_mr` / `np_mega` | No-potion Mega |
