# PC Parts Price Tracker — Algeria

Automated daily scraper that monitors PC component prices across Algerian retailers, cleans and organizes the data, and publishes a comparison website via GitHub Pages.

[![Scraper](https://github.com/YOUR_USERNAME/pc-parts-scraper/actions/workflows/scrape.yml/badge.svg)](https://github.com/YOUR_USERNAME/pc-parts-scraper/actions/workflows/scrape.yml)

## Scraped Retailers

| Retailer | Method | Categories |
|----------|--------|------------|
| [LICB Plus](https://www.licbplus.com.dz) | Static HTML (requests) | CPU, GPU, RAM, Monitor, Storage, Motherboard, PSU, Case, Cooling, Peripherals |
| [WIFI Djelfa](https://wifidjelfa.com) | Stealth Browser (Scrapling) | CPU, GPU, RAM, Monitor, Storage, Motherboard, PSU, Case, Cooling, Peripherals |

## Project Structure

```
pc-parts-scraper/
├── .github/workflows/scrape.yml    # GitHub Actions — daily scraper
├── scraper/
│   ├── base.py                      # Base scraper class
│   └── sites/
│       ├── licbplus.py              # LICB Plus scraper (static)
│       └── wifidjelfa.py            # WIFI Djelfa scraper (stealth)
├── core/
│   ├── models.py                    # Data models (Product, PricePoint, Match)
│   └── categorizer.py               # AI-free categorizer & spec extractor
├── data/
│   ├── raw/                         # Raw scraped data (per-site, per-day)
│   └── history/                     # Archived product snapshots
├── docs/                            # GitHub Pages frontend
│   ├── data/                        # JSON output (products, comparisons, stats)
│   └── index.html                   # Frontend UI
├── run.py                           # Main orchestrator
├── requirements.txt
└── README.md
```

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/pc-parts-scraper.git
cd pc-parts-scraper
pip install -r requirements.txt
scrapling install chromium
```

### 2. Run Scraper Locally

```bash
# Scrape all sites, all categories
python run.py

# Scrape specific site only
python run.py --sites licbplus
python run.py --sites wifidjelfa

# Scrape specific categories
python run.py --cats cpu gpu ram

# Process existing data without scraping
python run.py --dry-run
```

### 3. View Results

After running, open `docs/index.html` in your browser to see the organized data.

## How It Works

### Scraping Layer

| Site | Technique | Why |
|------|-----------|-----|
| **LICB Plus** | `requests` + `BeautifulSoup` | Static HTML, no JS needed. Fast & lightweight. |
| **WIFI Djelfa** | `Scrapling.StealthyFetcher` | Cloudflare-protected. Real browser with fingerprint spoofing. |

### Data Cleaning Engine

The `core/categorizer.py` module handles all data processing with **zero AI dependencies**:

```
Raw Product Name
      |
      v
+-------------------+     +------------------+     +----------------+
| detect_category() | --> | extract_specs()  | --> | detect_brand() |
| (regex scoring)   |     | (pattern match)  |     | (keyword dict) |
+-------------------+     +------------------+     +----------------+
      |                         |                         |
      v                         v                         v
 category: "cpu"         specs: {cores: 16,       brand: "AMD"
                         threads: 32,
                         base_clock: "5.7 GHz",
                         socket: "AM5",
                         cache: "128 MB"}
```

**Supported categories:** CPU, GPU, RAM, Monitor, Storage, Motherboard, PSU, Case, Cooling, Keyboard, Mouse, Headset

**Extracted specs per category:**
- **CPU**: cores, threads, base/boost clock, cache, socket, generation, iGPU
- **GPU**: chipset, VRAM, boost clock, manufacturer variant
- **RAM**: type (DDR4/DDR5), capacity, speed, CAS latency, kit configuration, RGB
- **Monitor**: size, refresh rate, resolution, panel type, response time
- **Storage**: capacity, type (NVMe/SATA/HDD), read speed, PCIe generation
- **Motherboard**: chipset, memory type, socket, form factor, WiFi
- **PSU**: wattage, efficiency rating, modularity

### Cross-Retailer Matching

Products are matched across retailers using:
1. **Model key extraction** (e.g., `i9-14900K`, `RTX4070`, `7800X3D`)
2. **Brand confirmation**
3. **Word overlap scoring**

Results in a comparison table showing the same product's price at multiple stores.

## GitHub Actions Setup

The scraper runs automatically every day at 3:00 AM UTC.

### To enable:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/docs`
4. Your tracker will be live at `https://YOUR_USERNAME.github.io/pc-parts-scraper/`

### Manual trigger:

Go to **Actions → Daily PC Parts Scraper → Run workflow**

## Output Files

| File | Description |
|------|-------------|
| `docs/data/products.json` | All cleaned products |
| `docs/data/comparisons.json` | Cross-retailer price comparisons |
| `docs/data/stats.json` | Daily statistics |
| `docs/data/cpu.json` | Products filtered by category |
| `docs/data/gpu.json` | Products filtered by category |
| `docs/data/monitor.json` | Products filtered by category |
| `data/raw/*.json` | Raw scraped data per site |
| `data/history/*.json` | Timestamped archives |

## License

MIT — Free to use and modify.

## Credits

- Built with [Scrapling](https://github.com/D4Vinci/Scrapling) by @D4Vinci for anti-bot scraping
- Data engine uses pure regex/pattern matching — no AI APIs required
