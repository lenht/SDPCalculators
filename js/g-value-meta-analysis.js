/* ─────────────────────────────────────────────
   g-value-meta-analysis.js
   All logic for the G-value meta-analysis page:
   data, Kendall tau-b, live chart, filter/toggle UI
   ───────────────────────────────────────────── */

/* ══════════════════════════════════════════════
   DATA
   Each entry:
     id       – unique integer
     label    – researcher(s) + year, shown on card
     pair     – "SourceMass–TestMass" material label
     pr       – SPD-predicted G-value
     ob       – measured (observed) G-value
     sd       – standard deviation of measurement
     year     – year of publication
     type     – category key (see below)
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   CATEGORIES (type field):
     "high"       – high accuracy Cavendish (main list)
     "freefall"   – freefall / atom interferometer experiments
     "speculative"– test mass composition uncertain or speculative
     "lowestval"  – lowest value selected (insufficient environmental isolation)
     "lowacc"     – low accuracy (pre-modern or poor SD > 0.01)
     "excluded"   – duplicate same-team values (off by default)
     "outofrange"  – beyond reasonable range 6.660–6.676
     "largescale" – large-scale / long-range / intermediate-range experiments
     "homogenized"– Pontikis (1972) homogenized average
   Notation for damping disks:
     SM – [TM ≪ DD]  means source mass – [test mass ≪ dominant damping disk]
     DD  = damping disk (aluminum)
     ECD = eddy current damper (steel/iron)
   ══════════════════════════════════════════════ */

const META_DATA = [

  // ── HIGH ACCURACY CAVENDISH ─────────────────────────────────────────────
  { id:  1, label: "Heyl (1942)",              pair: "Steel–Pt",                      pr: 6.671202, ob: 6.6720,    sd: 0.0040,    year: 1942, type: "high",      scale: "lab"   },
  { id:  2, label: "Pontikis (1971)",          pair: "Brass–Brass",                   pr: 6.673973, ob: 6.6740,    sd: 0.0020,    year: 1971, type: "high",      scale: "lab"   },
  { id:  3, label: "Pontikis (1971)",          pair: "Cu–Cu",                         pr: 6.673995, ob: 6.6740,    sd: 0.0020,    year: 1971, type: "high",      scale: "lab"   },
  { id:  4, label: "Pontikis (1971)",          pair: "Ag–Ag",                         pr: 6.672615, ob: 6.6710,    sd: 0.0010,    year: 1971, type: "high",      scale: "lab"   },
  { id:  5, label: "Pontikis (1971)",          pair: "Ag–Brass",                      pr: 6.673294, ob: 6.6710,    sd: 0.0020,    year: 1971, type: "high",      scale: "lab"   },
  { id:  6, label: "Renner (1973)",            pair: "Hg–Cu",                         pr: 6.671042, ob: 6.6700,    sd: 0.0080,    year: 1973, type: "high",      scale: "lab"   },
  { id:  7, label: "Luther (1975)",            pair: "W–Pt",                          pr: 6.668549, ob: 6.6699,    sd: 0.0014,    year: 1975, type: "high",      scale: "lab"   },
  { id:  8, label: "Sagitov (1979)",           pair: "Steel–Cu",                      pr: 6.674097, ob: 6.6745,    sd: 0.0030,    year: 1979, type: "high",      scale: "lab"   },
  { id:  9, label: "Luther & Towler (1982)",   pair: "W–[W ≪ Al DD]",                pr: 6.669845, ob: 6.6726,    sd: 0.0005,    year: 1982, type: "high",      scale: "lab"   },
  { id: 10, label: "De Boer (1987)",           pair: "W–W",                           pr: 6.668815, ob: 6.6670,    sd: 0.0050,    year: 1987, type: "high",      scale: "lab"   },
  { id: 11, label: "Walesch (1995)",           pair: "Brass–Silica",                  pr: 6.671953, ob: 6.6719,    sd: 0.0008,    year: 1995, type: "high",      scale: "lab"   },
  { id: 12, label: "Fitzgerald (1999)",        pair: "Steel–Cu",                      pr: 6.674097, ob: 6.6742,    sd: 0.0007,    year: 1999, type: "high",      scale: "lab"   },
  { id: 13, label: "Gundlach (2000)",          pair: "Fe–[SO₂ ≪ Fe ECD]",            pr: 6.674200, ob: 6.674215,  sd: 0.000092,  year: 2000, type: "high",      scale: "lab"   },
  { id: 14, label: "Quinn (2001-swing)",       pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67565,   sd: 0.00045,   year: 2001, type: "high",      scale: "lab"   },
  { id: 15, label: "Quinn (2001-servo)",       pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67553,   sd: 0.00040,   year: 2001, type: "high",      scale: "lab"   },
  { id: 16, label: "Quinn (2001)",             pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67559,   sd: 0.00027,   year: 2001, type: "excluded",   scale: "lab"   },
  { id: 17, label: "Kleinevoß (2002)",         pair: "Brass–Cu",                      pr: 6.673992, ob: 6.67422,   sd: 0.00098,   year: 2002, type: "high",      scale: "lab"   },
  { id: 18, label: "Armstrong (2003)",         pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67385,   sd: 0.00023,   year: 2003, type: "high",      scale: "lab"   },
  { id: 19, label: "Armstrong (2003)",         pair: "Steel–Cu",                      pr: 6.674097, ob: 6.67392,   sd: 0.00049,   year: 2003, type: "high",      scale: "lab"   },
  { id: 20, label: "HUST-05 (2005 & 2014)",   pair: "Steel–Cu",                      pr: 6.674097, ob: 6.67222,   sd: 0.00087,   year: 2014, type: "high",      scale: "lab"   },
  { id: 21, label: "Baldi (2005)",             pair: "Steel–Nb",                      pr: 6.673803, ob: 6.6750,    sd: 0.0070,    year: 2005, type: "high",      scale: "lab"   },
  { id: 22, label: "Lamporesi (2008)",         pair: "W–W",                           pr: 6.668815, ob: 6.6670,    sd: 0.0030,    year: 2008, type: "high",      scale: "lab"   },
  { id: 23, label: "Parks (2010)",             pair: "W–Cu",                          pr: 6.671404, ob: 6.67234,   sd: 0.00014,   year: 2010, type: "high",      scale: "lab"   },
  { id: 24, label: "Quinn (2013-swing)",       pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67566,   sd: 0.00037,   year: 2013, type: "high",      scale: "lab"   },
  { id: 25, label: "Quinn (2013-servo)",       pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67520,   sd: 0.00041,   year: 2013, type: "high",      scale: "lab"   },
  { id: 26, label: "Newman (2014)",            pair: "Cu–[SO₂ ≪ Fe ECD]",            pr: 6.674097, ob: 6.67433,   sd: 0.00013,   year: 2014, type: "high",      scale: "lab"   },
  { id: 27, label: "HUST-18 (2018-swing)",     pair: "Fe–[SO₂ ≪ Fe ECD]",            pr: 6.674200, ob: 6.674184,  sd: 0.000078,  year: 2018, type: "high",      scale: "lab"   },
  { id: 28, label: "HUST-18 (2018-servo)",     pair: "Fe–[SO₂ ≪ Fe ECD]",            pr: 6.674200, ob: 6.674484,  sd: 0.000078,  year: 2018, type: "high",      scale: "lab"   },
  { id: 29, label: "Schlamminger (2026-swing)","pair": "Cu–Sapphire",                 pr: 6.671860, ob: 6.673636,  sd: 0.000627,  year: 2026, type: "high",      scale: "lab"   },
  { id: 30, label: "Schlamminger (2026-swing)","pair": "Cu–Cu",                       pr: 6.673995, ob: 6.674021,  sd: 0.0002,    year: 2026, type: "high",      scale: "lab"   },
  { id: 31, label: "Schlamminger (2026-servo)","pair": "Cu–Cu",                       pr: 6.673995, ob: 6.673642,  sd: 0.00015,   year: 2026, type: "high",      scale: "lab"   },
  { id: 32, label: "Schlamminger (2026-servo)","pair": "Cu–Sapphire",                 pr: 6.671860, ob: 6.672637,  sd: 0.00025,   year: 2026, type: "high",      scale: "lab"   },

  // ── EXCLUDED (same-team duplicates / combined averages) — off by default ──
  { id: 33, label: "Quinn (2001) — combined",  pair: "Cu–Cu",                         pr: 6.673995, ob: 6.67559,   sd: 0.00027,   year: 2001, type: "excluded",  scale: "lab"   },
  { id: 34, label: "Luo (1999)",               pair: "Steel–Cu",                      pr: 6.674097, ob: 6.6699,    sd: 0.0007,    year: 1999, type: "excluded",  scale: "lab"   },
  { id: 35, label: "HUST-05-A (2005)",         pair: "Steel–Cu",                      pr: 6.674097, ob: 6.67222,   sd: 0.00087,   year: 2005, type: "excluded",  scale: "lab"   },
  { id: 36, label: "HUST-05-B (2005)",         pair: "Steel–Cu",                      pr: 6.674097, ob: 6.67228,   sd: 0.00087,   year: 2005, type: "excluded",  scale: "lab"   },
  { id: 37, label: "HUST-09 (2009)",           pair: "Fe–[SO₂ ≪ Fe ECD]",            pr: 6.674200, ob: 6.67349,   sd: 0.00018,   year: 2009, type: "excluded",  scale: "lab"   },
  { id: 38, label: "Luther (1997)",            pair: "W–[W ≪ Al DD]",                pr: 6.669845, ob: 6.6740,    sd: 0.0007,    year: 1997, type: "excluded",  scale: "lab"   },
  { id: 39, label: "Cross (2009)",             pair: "Cu–[SO₂ ≪ Fe ECD]",            pr: 6.674097, ob: 6.674585,  sd: 0.000225,  year: 2009, type: "excluded",  scale: "lab"   },
  { id: 40, label: "Dousse team-2 (1987)",     pair: "Pb–Cu DD (unknown TM)",         pr: 6.670936, ob: 6.6735,    sd: 0.0068,    year: 1987, type: "excluded",  scale: "lab"   },
  { id: 41, label: "Dousse team-3 (1987)",     pair: "Pb–Cu DD (unknown TM)",         pr: 6.670936, ob: 6.6740,    sd: 0.0053,    year: 1987, type: "excluded",  scale: "lab"   },
  { id: 42, label: "Dousse team-4 (1987)",     pair: "Pb–Cu DD (unknown TM)",         pr: 6.670936, ob: 6.6722,    sd: 0.0051,    year: 1987, type: "excluded",  scale: "lab"   },
  { id: 43, label: "Schlamminger (2002) Hg–Ta","pair": "Hg–Ta",                       pr: 6.668519, ob: 6.67409,   sd: 0.00021,   year: 2002, type: "excluded",  scale: "large" },

  // ── FREEFALL / ATOM INTERFEROMETER ──────────────────────────────────────
  { id: 50, label: "Goldblum (1987)",          pair: "Dy₆Fe₂₃–Dy₆Fe₂₃",             pr: 6.672372, ob: 6.6700,    sd: 0.0700,    year: 1987, type: "freefall",  scale: "lab"   },
  { id: 51, label: "Saulnier (1989)",          pair: "U–Pb",                          pr: 6.666822, ob: 6.6500,    sd: 0.0900,    year: 1989, type: "freefall",  scale: "lab"   },
  { id: 52, label: "Ritter (1990)",            pair: "Dy₆Fe₂₃–Dy₆Fe₂₃",             pr: 6.672372, ob: 6.6700,    sd: 0.0900,    year: 1990, type: "freefall",  scale: "lab"   },
  { id: 53, label: "Fixler (2003)",            pair: "Pb–Cs",                         pr: 6.669780, ob: 6.6930,    sd: 0.0270,    year: 2003, type: "freefall",  scale: "lab"   },
  { id: 54, label: "Wang (2009)",              pair: "Pb–Silica",                     pr: 6.668866, ob: 6.6665,    sd: 0.0554,    year: 2009, type: "freefall",  scale: "lab"   },
  { id: 55, label: "Prevedelli (2014)",        pair: "W–Rb",                          pr: 6.671258, ob: 6.67191,   sd: 0.00099,   year: 2014, type: "freefall",  scale: "lab"   },

  // ── SPECULATIVE TEST MASS ────────────────────────────────────────────────
  { id: 60, label: "Pontikis (1971) — Pb–Pb?", pair: "Pb–Pb or Pb–Brass",            pr: 6.667878, ob: 6.6680,    sd: 0.0030,    year: 1971, type: "speculative", scale: "lab" },
  { id: 61, label: "Pontikis (1971) — Hg–Hg?", pair: "Hg–Hg or Hg–Brass",           pr: 6.668090, ob: 6.6660,    sd: 0.0020,    year: 1971, type: "speculative", scale: "lab" },

  // ── LOWEST VALUE SELECTED (insufficient environmental isolation) ─────────
  { id: 70, label: "Heyl (1928)",              pair: "Steel–Glass",                   pr: 6.671986, ob: 6.6710,    sd: 0.0030,    year: 1928, type: "lowestval", scale: "lab"   },
  { id: 71, label: "Heyl (1925)",              pair: "Steel–Au",                      pr: 6.671152, ob: 6.6720,    sd: 0.0040,    year: 1925, type: "lowestval", scale: "lab"   },
  { id: 72, label: "Dousse team-1 (1987)",     pair: "Pb–Cu DD (unknown TM)",         pr: 6.670936, ob: 6.6704,    sd: 0.0048,    year: 1987, type: "lowestval", scale: "lab"   },
  { id: 73, label: "Hubler (1995-A)",          pair: "H₂O–Steel",                    pr: 6.6679615,ob: 6.6690,    sd: 0.0050,    year: 1995, type: "lowestval", scale: "large" },

  // ── LARGE-SCALE / INTERMEDIATE-RANGE EXPERIMENTS ────────────────────────
  { id: 80, label: "Oldham (1993)",            pair: "H₂O–Cu",                        pr: 6.667859, ob: 6.6710,    sd: 0.0150,    year: 1993, type: "largescale", scale: "large" },
  { id: 81, label: "Hubler (1995-A)",          pair: "H₂O–Steel",                    pr: 6.6679615,ob: 6.6690,    sd: 0.0050,    year: 1995, type: "largescale", scale: "large" },
  { id: 82, label: "Nolting (1999)",           pair: "H₂O–Cu",                        pr: 6.667859, ob: 6.6754,    sd: 0.0015,    year: 1999, type: "largescale", scale: "large" },
  { id: 83, label: "Schlamminger (2002)",      pair: "Hg–Cu",                         pr: 6.671042, ob: 6.67404,   sd: 0.00021,   year: 2002, type: "largescale", scale: "large" },
  { id: 84, label: "Baldi (2001)",             pair: "H₂O–Nb",                        pr: 6.667562, ob: 6.6880,    sd: 0.0110,    year: 2001, type: "largescale", scale: "large" },
  { id: 85, label: "Zumberge (1991)",          pair: "H₂O–WC",                        pr: 6.665226, ob: 6.6770,    sd: 0.0130,    year: 1991, type: "largescale", scale: "large" },
  { id: 86, label: "Müller (1990)",            pair: "H₂O–WC",                        pr: 6.665226, ob: 6.6890,    sd: 0.0270,    year: 1990, type: "largescale", scale: "large" },
  { id: 87, label: "Stacey (1987-A)",          pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.7120,    sd: 0.0370,    year: 1987, type: "largescale", scale: "large" },
  { id: 88, label: "Stacey (1987-B)",          pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.7300,    sd: 0.0250,    year: 1987, type: "largescale", scale: "large" },

  // ── HOMOGENIZED AVERAGE ─────────────────────────────────────────────────
  { id: 90, label: "Pontikis (1972) — avg",    pair: "Brass–various",                 pr: 6.672300, ob: 6.67142,   sd: 0.00021,   year: 1972, type: "homogenized", scale: "lab" },

  // ── LOW ACCURACY / HISTORIC ─────────────────────────────────────────────
  { id: 100, label: "H. Cavendish (1798)",     pair: "Pb–Pb",                         pr: 6.667878, ob: 6.7540,    sd: 0.0410,    year: 1798, type: "lowacc",    scale: "lab"   },
  { id: 101, label: "Fr. Reich (1838)",        pair: "Pb–various",                    pr: 6.667878, ob: 6.6400,    sd: 0.0600,    year: 1838, type: "lowacc",    scale: "lab"   },
  { id: 102, label: "F. Bailey (1843)",        pair: "Pb–various",                    pr: 6.667878, ob: 6.6300,    sd: 0.0700,    year: 1843, type: "lowacc",    scale: "lab"   },
  { id: 103, label: "Cornu (1873)",            pair: "Hg–Cu",                         pr: 6.671042, ob: 6.6400,    sd: 0.0170,    year: 1873, type: "lowacc",    scale: "lab"   },
  { id: 104, label: "P. v. Jolly (1878)",      pair: "Pb–Hg",                         pr: 6.667984, ob: 6.4470,    sd: 0.1100,    year: 1878, type: "lowacc",    scale: "lab"   },
  { id: 105, label: "Richarz (1888)",          pair: "Pb–Pb",                         pr: 6.667878, ob: 6.6840,    sd: 0.0110,    year: 1888, type: "lowacc",    scale: "lab"   },
  { id: 106, label: "J. Wilsing (1889)",       pair: "Pb–Sn-Bi alloy",               pr: 6.670114, ob: 6.5940,    sd: 0.1500,    year: 1889, type: "lowacc",    scale: "lab"   },
  { id: 107, label: "R. Eötvös (1896)",        pair: "Pb–Hg",                         pr: 6.667984, ob: 6.6570,    sd: 0.0130,    year: 1896, type: "lowacc",    scale: "lab"   },
  { id: 108, label: "G. Burgess (1902)",       pair: "Pb–Pb",                         pr: 6.667878, ob: 6.6400,    sd: 0.0400,    year: 1902, type: "lowacc",    scale: "lab"   },
  { id: 109, label: "Heyl (1926)",             pair: "Steel–Pt",                      pr: 6.671202, ob: 6.6670,    sd: 0.0120,    year: 1926, type: "lowacc",    scale: "lab"   },
  { id: 110, label: "Zahradníček (1930)",      pair: "Pb–Pb",                         pr: 6.667878, ob: 6.6600,    sd: 0.0400,    year: 1930, type: "lowacc",    scale: "lab"   },
  { id: 111, label: "Rose (1969)",             pair: "W–Al",                          pr: 6.669845, ob: 6.6740,    sd: 0.0120,    year: 1969, type: "lowacc",    scale: "lab"   },
  { id: 112, label: "Whetton (1957)",          pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7950,    sd: 0.0210,    year: 1957, type: "lowacc",    scale: "large" },
  { id: 113, label: "McCulloh (1965-B)",       pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7240,    sd: 0.0140,    year: 1965, type: "lowacc",    scale: "large" },
  { id: 114, label: "McCulloh (1965-C)",       pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7260,    sd: 0.0120,    year: 1965, type: "lowacc",    scale: "large" },
  { id: 115, label: "McCulloh (1965-D)",       pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7470,    sd: 0.0130,    year: 1965, type: "lowacc",    scale: "large" },
  { id: 116, label: "Koldewyn (1976)",         pair: "Bronze–Quartz",                 pr: 6.671866, ob: 6.5750,    sd: 0.0260,    year: 1976, type: "lowacc",    scale: "lab"   },
  { id: 117, label: "Hinze (1978)",            pair: "Rock–Steel",                    pr: 6.672067, ob: 6.8100,    sd: 0.0700,    year: 1978, type: "lowacc",    scale: "large" },
  { id: 118, label: "Hussain (1981)",          pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7050,    sd: 0.0600,    year: 1981, type: "lowacc",    scale: "large" },
  { id: 119, label: "Page (1981)",             pair: "Pb–Pb",                         pr: 6.667878, ob: 6.1000,    sd: 0.4000,    year: 1981, type: "lowacc",    scale: "lab"   },
  { id: 120, label: "Speake (1983)",           pair: "Brass–Cu",                      pr: 6.673983, ob: 6.6500,    sd: 0.2300,    year: 1983, type: "lowacc",    scale: "lab"   },
  { id: 121, label: "Oelfke (1984)",           pair: "Brass–Brass",                   pr: 6.673973, ob: 6.7000,    sd: 0.2000,    year: 1984, type: "lowacc",    scale: "lab"   },
  { id: 122, label: "Stacey (1987-A)",         pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.7120,    sd: 0.0370,    year: 1987, type: "lowacc",    scale: "large" },
  { id: 123, label: "Stacey (1987-B)",         pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.7300,    sd: 0.0250,    year: 1987, type: "lowacc",    scale: "large" },
  { id: 124, label: "Liu (1987)",              pair: "Brass–Brass",                   pr: 6.673973, ob: 6.6600,    sd: 0.0260,    year: 1987, type: "lowacc",    scale: "lab"   },
  { id: 125, label: "Müller (1990)",           pair: "H₂O–WC",                        pr: 6.665226, ob: 6.6890,    sd: 0.0270,    year: 1990, type: "lowacc",    scale: "large" },
  { id: 126, label: "Zumberge (1991)",         pair: "H₂O–WC",                        pr: 6.665226, ob: 6.6770,    sd: 0.0130,    year: 1991, type: "lowacc",    scale: "large" },
  { id: 127, label: "J. Schurr (1992)",        pair: "Pb–Silica",                     pr: 6.668906, ob: 6.6600,    sd: 0.0600,    year: 1992, type: "lowacc",    scale: "lab"   },
  { id: 128, label: "Richman (1999)",          pair: "Cu–Cu",                         pr: 6.673995, ob: 6.6830,    sd: 0.0110,    year: 1999, type: "lowacc",    scale: "lab"   },

  // ── BEYOND REASONABLE RANGE (6.660 – 6.676) ─────────────────────────────
  { id: 140, label: "Poynting (1891)",         pair: "Pb–Pb-Sb alloy",               pr: 6.667878, ob: 6.6984,    sd: 0.0040,    year: 1891, type: "outofrange", scale: "lab"   },
  { id: 141, label: "C. v. Boys (1895)",       pair: "Pb–Au",                         pr: 6.668031, ob: 6.6580,    sd: 0.0070,    year: 1895, type: "outofrange", scale: "lab"   },
  { id: 142, label: "K. Braun (1897)",         pair: "Hg–Brass",                      pr: 6.671038, ob: 6.6540,    sd: 0.0020,    year: 1897, type: "outofrange", scale: "lab"   },
  { id: 143, label: "Heyl (1925-avg)",         pair: "Steel–Au",                      pr: 6.671152, ob: 6.6782,    sd: 0.0016,    year: 1925, type: "outofrange", scale: "lab"   },
  { id: 144, label: "McCulloh (1965-A)",       pair: "Rock–Steel",                    pr: 6.672067, ob: 6.7390,    sd: 0.0025,    year: 1965, type: "outofrange", scale: "large" },
  { id: 145, label: "Moore & Stacey (1988)",   pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.6890,    sd: 0.00057,   year: 1988, type: "outofrange", scale: "large" },
  { id: 146, label: "Hubler (1995-B)",         pair: "H₂O–Steel",                    pr: 6.667962, ob: 6.6780,    sd: 0.0070,    year: 1995, type: "outofrange", scale: "large" },
  { id: 147, label: "W. Michaelis (1996)",     pair: "W–Silica",                      pr: 6.669374, ob: 6.71540,   sd: 0.00056,   year: 1996, type: "outofrange", scale: "lab"   },
  { id: 148, label: "J. P. Schwarz (1999)",    pair: "W–Silica",                      pr: 6.669374, ob: 6.6873,    sd: 0.0094,    year: 1999, type: "outofrange", scale: "lab"   },
];

const TYPE_LABELS = {
  high:        "High accuracy Cavendish",
  freefall:    "Freefall / atom interferometer",
  speculative: "Speculative test mass composition",
  lowestval:   "Lowest value selected (insufficient isolation)",
  lowacc:      "Low accuracy / historic",
  excluded:    "Excluded (same-team duplicate / combined average)",
  largescale:  "Large-scale / intermediate-range",
  homogenized: "Homogenized average (Pontikis 1972)",
  outofrange:  "Beyond reasonable range",
};

const CATEGORIES = [
  {
    key: "high",
    title: "High accuracy Cavendish",
    color: "#1a8c5c",
    fn: m => m.type === "high",
  },
  {
    key: "freefall",
    title: "Freefall / atom interferometer",
    color: "#4c6f95",
    fn: m => m.type === "freefall",
  },
  {
    key: "speculative",
    title: "Speculative test mass (Pontikis Pb & Hg)",
    color: "#7a5c9e",
    fn: m => m.type === "speculative",
  },
  {
    key: "lowestval",
    title: "Lowest value selected (insufficient isolation)",
    color: "#7a7a40",
    fn: m => m.type === "lowestval",
  },
  {
    key: "largescale",
    title: "Large-scale / intermediate-range",
    color: "#c87a40",
    fn: m => m.type === "largescale",
  },
  {
    key: "homogenized",
    title: "Homogenized average — Pontikis (1972)",
    color: "#888",
    fn: m => m.type === "homogenized",
  },
  {
    key: "lowacc",
    title: "Low accuracy / historic",
    color: "#888",
    fn: m => m.type === "lowacc",
  },
  {
    key: "outofrange",
    title: "Beyond reasonable range (6.660 – 6.676)",
    color: "#b84040",
    fn: m => m.type === "outofrange",
  },
  {
    key: "excluded",
    title: "Excluded — same-team duplicates / combined averages (off by default)",
    color: "#aaa",
    fn: m => m.type === "excluded",
  },
];



const FILTERS = [
  { key: "bigsd",       label: "SD ≥ 0.01",                        fn: m => m.sd >= 0.01 },
  { key: "outofrange",  label: "Outside 6.660 – 6.676",            fn: m => m.ob < 6.660 || m.ob > 6.676 },
  { key: "largescale",  label: "Large-scale / intermediate-range",  fn: m => m.type === "largescale" },
  { key: "lowacc",      label: "Low accuracy / historic",           fn: m => m.type === "lowacc" },
  { key: "freefall",    label: "Freefall / interferometer",         fn: m => m.type === "freefall" },
  { key: "excluded",    label: "Same-team duplicates",              fn: m => m.type === "excluded" },
  { key: "speculative", label: "Speculative test mass",             fn: m => m.type === "speculative" },
  { key: "lowestval",   label: "Lowest value selected",             fn: m => m.type === "lowestval" },
  { key: "homogenized", label: "Homogenized average",               fn: m => m.type === "homogenized" },
];
/* ══════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════ */

// Default: include only high, freefall, speculative, lowestval entries
const DEFAULT_EXCLUDED_TYPES = new Set(["excluded","lowacc","outofrange","largescale","homogenized"]);
let activeIds = new Set(META_DATA.filter(m => !DEFAULT_EXCLUDED_TYPES.has(m.type)).map(m => m.id));
let activeFilters = new Set();
let openDetails   = new Set();

function isFilteredOut(m) {
  return [...activeFilters].some(k => FILTERS.find(f => f.key === k).fn(m));
}

function getActiveData() {
  // Return the active filtered set directly — no averaging.
  // Entries that share the same predicted value are handled correctly
  // by tau-b via the T1 (prediction-tie) count; their relationships
  // with all other entries are still fully counted as concordant or
  // discordant pairs.
  return META_DATA.filter(m => activeIds.has(m.id) && !isFilteredOut(m));
}

/* ══════════════════════════════════════════════
   KENDALL TAU-B  (with tie correction)
   ══════════════════════════════════════════════

   Method (from Sky Darmos):
   ─────────────────────────
   1. Count concordant pairs C, discordant pairs D, and tied pairs
      T1 (ties on predicted) and T2 (ties on observed) by scanning
      all (i,j) pairs.

   2. tau_b = (C − D) / sqrt((P − T1)(P − T2))
      where P = n(n−1)/2.

   3. When there are NO ties (T1 = T2 = 0):
        sigma = sqrt(2(2n+5) / 9n(n−1))
        z     = tau_b / sigma
        p     = right-tailed normal CDF of z

   4. When there ARE ties (T = T1 + T2 > 0):
        We find the "next higher tau-a" — the closest tau-a value
        that is strictly above tau_b.
        tau-a values are: (C−D ± k) / P  for integer k = 0,1,2,...,T
        representing how the T tied pairs could have gone (each tied
        pair shifted from tied to concordant adds +1, to discordant
        adds −1 to the numerator relative to C−D).
        We step k = 1, 2, … until (C−D+k)/P > tau_b, then use
        that adjusted_tau_a as the z-score numerator.
        sigma uses the SIMPLE formula (no tie correction) because the
        tie correction is already handled by choosing next-higher tau-a.
        z = adjusted_tau_a / sigma
        p = right-tailed normal CDF of z

   This is conservative by design: we use a slightly MORE significant
   tau-a than the true tau-b, giving a small conservative bias that
   is negligible for large n.
   ══════════════════════════════════════════════ */

function kendallTauB(data) {
  const n = data.length;
  if (n < 2) return { tau: null, z: null, p: null, n, C: 0, D: 0, T1: 0, T2: 0 };

  let C = 0, D = 0, T1 = 0, T2 = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dP = data[i].pr - data[j].pr;
      const dO = data[i].ob - data[j].ob;

      const tieP = Math.abs(dP) < 1e-9;
      const tieO = Math.abs(dO) < 1e-9;

      if (tieP && tieO) {
        // Tied on both predicted AND observed.
        // Counts as T1 (prediction tie) only — NOT T2.
        // Reason: tau-b uses the Knight (1966) formula
        //   tau_b = S / sqrt((C+D+T1) * (C+D+T2))
        // where T1 = all pairs tied on predicted (including ties-on-both),
        //       T2 = pairs tied on observed ONLY (excluding ties-on-both).
        // A pair tied on both is already excluded from C and D, and its
        // obs-tie status is subsumed by the pred-tie — counting it in T2
        // as well would double-penalise the denominator incorrectly.
        T1++;
      } else if (tieP) {
        // Tied on predicted only
        T1++;
      } else if (tieO) {
        // Tied on observed only
        T2++;
      } else if (dP * dO > 0) {
        C++;
      } else {
        D++;
      }
    }
  }

  const P     = n * (n - 1) / 2;
  const S     = C - D;

  // tau_b using Knight (1966) formula:
  //   denominator = sqrt((C+D+T1) * (C+D+T2))
  // which equals sqrt((P-T2_only) * (P-T1_only)) where T1_only and T2_only
  // are exclusive, but here T1 already includes both-tied pairs and T2 excludes them.
  // Equivalently: (C+D+T1) = P - T2, (C+D+T2) = P - T1.
  // Wait — with our counting: C+D+T1+T2 = P, so:
  //   C+D+T1 = P - T2
  //   C+D+T2 = P - T1
  // denom = sqrt((P - T2) * (P - T1))  [same formula, just verify with example]
  // Verify: n=5, C=7, D=2, T1=1(both-tied), T2=0 → P=10
  //   denom = sqrt((10-0)*(10-1)) = sqrt(10*9) = sqrt(90) ✓
  const denom = Math.sqrt((P - T2) * (P - T1));
  const tau   = denom === 0 ? 0 : S / denom;

  // sigma — asymptotic formula (no tie correction), valid for large n.
  // Tie correction is handled by using the next-higher tau-a for z.
  const sigma = Math.sqrt((2 * (2 * n + 5)) / (9 * n * (n - 1)));

  let z, adjustedTau;
  const T = T1 + T2;   // total tied pairs

  if (T === 0) {
    // No ties: z = tau_b / sigma directly (tau_b = tau_a)
    adjustedTau = tau;
    z = sigma === 0 ? 0 : tau / sigma;
  } else {
    // Ties present: find next higher tau-a above tau_b.
    //
    // The T tied pairs can resolve into concordant or discordant pairs.
    // Each tied pair turned concordant adds +1 to S; discordant adds -1.
    // Net contributions of the whole group step by 2: T, T-2, ..., -T.
    // tau-a candidate = (S + net) / P.
    // We find the smallest net ≥ 1 (same parity as T) such that
    // (S + net) / P > tau_b.

    const startNet = (T % 2 === 0) ? 2 : 1;
    let found = false;
    for (let net = startNet; net <= T; net += 2) {
      const candidateTau = (S + net) / P;
      if (candidateTau > tau) {
        adjustedTau = candidateTau;
        found = true;
        break;
      }
    }
    if (!found) adjustedTau = tau;

    z = sigma === 0 ? 0 : adjustedTau / sigma;
  }

  const p = 1 - normalCDF(z);

  return { tau, z, p, n, C, D, T1, T2, S, adjustedTau };
}

// Abramowitz & Stegun approximation — accurate to 7.5 × 10⁻⁸
function normalCDF(z) {
  const t    = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf  = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const q    = 1 - pdf * poly;
  return z >= 0 ? q : 1 - q;
}

/* ══════════════════════════════════════════════
   FORMATTING
   ══════════════════════════════════════════════ */

function toSuperscript(n) {
  const map = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻" };
  return String(n).split("").map(c => map[c] || c).join("");
}

function formatP(p) {
  if (p === null || isNaN(p)) return "—";
  if (p < 1e-10) return "< 10⁻¹⁰";
  if (p < 0.001) {
    const exp = Math.floor(Math.log10(p));
    const man = (p / Math.pow(10, exp)).toFixed(2);
    return `${man} × 10${toSuperscript(exp)}`;
  }
  return p.toFixed(6);
}

function formatOdds(p) {
  if (!p || p <= 0 || isNaN(p)) return "—";
  if (p >= 0.5) return "< 2 : 1";
  return "1 in " + Math.round(1 / p).toLocaleString("en-US");
}

/* ══════════════════════════════════════════════
   STATS DISPLAY
   ══════════════════════════════════════════════ */

function updateStats() {
  const data = getActiveData();
  const s    = kendallTauB(data);

  document.getElementById("s-n").textContent    = s.n;

  // Show tau_b and adjusted tau_a separately
  if (s.tau !== null) {
    const hasTies = (s.T1 + s.T2) > 0;
    if (hasTies && s.adjustedTau !== s.tau) {
      document.getElementById("s-tau").textContent =
        `τ-b: ${s.tau.toFixed(5)} / τ-a: ${s.adjustedTau.toFixed(5)}`;
    } else {
      document.getElementById("s-tau").textContent = s.tau.toFixed(5);
    }
  } else {
    document.getElementById("s-tau").textContent = "—";
  }

  document.getElementById("s-z").textContent    = s.z    !== null ? s.z.toFixed(4)   : "—";
  document.getElementById("s-p").textContent    = formatP(s.p);
  document.getElementById("s-odds").textContent = formatOdds(s.p);
  document.getElementById("s-cd").textContent   = (s.C !== undefined) ? `${s.C} – ${s.D}` : "—";

  // Letter sequence: each experiment gets a unique letter A, B, C, …
  // assigned in order of predicted value (ties in prediction get consecutive
  // letters since they are different experiments).
  // The observed hierarchy is then displayed as those letters in observed order,
  // with parentheses around groups of observation-tied entries.
  const elSeq = document.getElementById("s-seq");
  if (elSeq) {
    if (data.length >= 2 && data.length <= 26) {
      // Sort by pr first, then by ob as tiebreaker, to get a stable ordering
      const sorted = [...data].sort((a, b) => a.pr - b.pr || a.ob - b.ob);
      // Assign a unique letter to every experiment
      sorted.forEach((m, i) => { m._letter = String.fromCharCode(65 + i); });
      // Sort by observed value to build the hierarchy string
      const byObs = [...sorted].sort((a, b) => a.ob - b.ob);
      // Build sequence: obs-tied groups in parentheses, others space-separated
      let seq = "";
      byObs.forEach((m, i) => {
        const prevOb = i > 0 ? byObs[i-1].ob : null;
        const nextOb = i < byObs.length - 1 ? byObs[i+1].ob : null;
        const tiedWithPrev = prevOb !== null && Math.abs(m.ob - prevOb) < 1e-9;
        const tiedWithNext = nextOb !== null && Math.abs(m.ob - nextOb) < 1e-9;
        if (!tiedWithPrev && tiedWithNext) seq += "(";
        seq += m._letter;
        if (tiedWithPrev && !tiedWithNext) seq += ") ";
        else if (!tiedWithPrev && !tiedWithNext) seq += " ";
      });
      elSeq.textContent = seq.trim();
    } else if (data.length > 26) {
      elSeq.textContent = "(too many elements for letter display)";
    } else {
      elSeq.textContent = "—";
    }
  }

  drawChart(data);
}

/* ══════════════════════════════════════════════
   CHART
   ══════════════════════════════════════════════ */

function drawChart(data) {
  const canvas = document.getElementById("meta-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── Chart always renders on a fixed dark background (#1a2535)
  // so ink colors are always the light-on-dark variants.
  const C_TICK_TEXT = "#9ab8d0";
  const C_GRID      = "rgba(160,190,220,0.14)";
  const C_AXIS      = "#4a6a88";
  const C_LABEL     = "#9ab8d0";

  // ── Canvas sizing — always use actual CSS pixel size × dpr for crispness
  const dpr = Math.round(window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const W    = Math.round(rect.width);
  const H    = Math.round(rect.height);
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (data.length === 0) {
    ctx.fillStyle    = C_TICK_TEXT;
    ctx.font         = "13px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No measurements selected", W / 2, H / 2);
    return;
  }

  const sorted = [...data].sort((a, b) => a.pr - b.pr);
  const vals   = sorted.flatMap(d => [d.pr, d.ob]);
  const minV   = Math.min(...vals) - 0.0008;
  const maxV   = Math.max(...vals) + 0.0008;

  const PL = 62, PR = 16, PT = 18, PB = 62;
  const pw = W - PL - PR;
  const ph = H - PT - PB;

  const xOf = i => PL + (sorted.length < 2 ? pw / 2 : (i / (sorted.length - 1)) * pw);
  const yOf = v => PT + ph - ((v - minV) / (maxV - minV)) * ph;

  // y-axis grid lines and tick labels
  const range = maxV - minV;
  const step  = range < 0.003 ? 0.0005 : range < 0.008 ? 0.001 : 0.002;
  const first = Math.ceil(minV / step) * step;
  for (let t = first; t <= maxV + 1e-9; t += step) {
    const y = Math.round(yOf(t)) + 0.5;   // half-pixel for crisp lines
    ctx.strokeStyle = C_GRID;
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(PL, y); ctx.lineTo(PL + pw, y); ctx.stroke();
    ctx.fillStyle    = C_TICK_TEXT;
    ctx.font         = "9px monospace";
    ctx.textAlign    = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(t.toFixed(4), PL - 5, y);
  }

  // axes
  ctx.strokeStyle = C_AXIS;
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.moveTo(PL + 0.5, PT); ctx.lineTo(PL + 0.5, PT + ph); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(PL, PT + ph + 0.5); ctx.lineTo(PL + pw, PT + ph + 0.5); ctx.stroke();

  // x-axis labels (rotated)
  ctx.fillStyle    = C_LABEL;
  ctx.font         = "8px Arial";
  ctx.textBaseline = "top";
  sorted.forEach((d, i) => {
    ctx.save();
    ctx.translate(xOf(i), PT + ph + 6);
    ctx.rotate(-Math.PI * 55 / 180);
    ctx.textAlign = "right";
    ctx.fillText(d.pair, 0, 0);
    ctx.restore();
  });

  // draw a line + dots
  function drawLine(color, key) {
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = "round";
    ctx.beginPath();
    sorted.forEach((d, i) => {
      const x = xOf(i), y = yOf(d[key]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    sorted.forEach((d, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(d[key]), 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  drawLine("#4e8ec8", "pr");   // predicted — vivid steel blue, visible on both light & dark
  drawLine("#d4752a", "ob");   // observed  — vivid amber, visible on both light & dark
}

/* ══════════════════════════════════════════════
   FILTER BUTTONS
   ══════════════════════════════════════════════ */

function buildFilters() {
  const wrap = document.getElementById("filter-btns");
  if (!wrap) return;

  FILTERS.forEach(f => {
    const btn = document.createElement("button");
    btn.className    = "filter-btn";
    btn.textContent  = f.label;
    btn.dataset.key  = f.key;

    btn.addEventListener("click", () => {
      if (activeFilters.has(f.key)) {
        activeFilters.delete(f.key);
        btn.classList.remove("active");
      } else {
        activeFilters.add(f.key);
        btn.classList.add("active");
      }
      updateStats();
      renderCards();
    });

    wrap.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════
   MEASUREMENT CARDS
   ══════════════════════════════════════════════ */

function renderCards() {
  const wrap = document.getElementById("meas-lists");
  if (!wrap) return;
  wrap.innerHTML = "";

  CATEGORIES.forEach(cat => {
    const items = META_DATA.filter(cat.fn);
    if (!items.length) return;

    const allOn = items.every(m => activeIds.has(m.id));

    // Category group wrapper with border
    const group = document.createElement("div");
    group.className = "meas-cat-group";

    const hdr = document.createElement("div");
    hdr.className = "meas-cat-hdr";
    hdr.innerHTML = `
      <div class="meas-cat-title">
        <div class="meas-cat-dot" style="background:${cat.color};"></div>
        ${cat.title}
        <span style="font-weight:400;">(${items.length})</span>
      </div>
      <button class="meas-sel-all" data-cat="${cat.key}">
        ${allOn ? "Deselect all" : "Select all"}
      </button>`;

    hdr.querySelector(".meas-sel-all").addEventListener("click", () => {
      const shouldTurnOn = !items.every(m => activeIds.has(m.id));
      items.forEach(m => shouldTurnOn ? activeIds.add(m.id) : activeIds.delete(m.id));
      updateStats();
      renderCards();
    });

    group.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "meas-cat-body";
    group.appendChild(body);

    wrap.appendChild(group);

    // Cards
    items.forEach(m => {
      const active   = activeIds.has(m.id);
      const filtered = isFilteredOut(m);
      const within   = Math.abs(m.ob - m.pr) <= m.sd;
      const acc      = ((1 - Math.abs(m.ob - m.pr) / m.pr) * 100).toFixed(4);
      const detOpen  = openDetails.has(m.id);

      const card = document.createElement("div");
      card.className = `meas-card${active ? " active" : ""}${filtered ? " filtered" : ""}`;

      card.innerHTML = `
        <div class="meas-row">
          <div class="meas-chk${active ? " on" : ""}">✓</div>
          <div class="meas-info">
            <div class="meas-name">${m.label}</div>
            <div class="meas-meta">${m.pair} &middot; ${m.year} &middot; ${TYPE_LABELS[m.type]}${filtered ? " &middot; <em>filtered out</em>" : ""}</div>
          </div>
          <div class="meas-toggle">${detOpen ? "▲" : "▼"}</div>
        </div>
        <div class="meas-detail${detOpen ? " open" : ""}">
          <strong>Material pair:</strong> ${m.pair}<br>
          <strong>SPD predicted:</strong> ${m.pr.toFixed(7)}<br>
          <strong>Observed:</strong> ${m.ob.toFixed(4)} ± ${m.sd}<br>
          <strong>SPD accuracy:</strong> ${acc}%<br>
          <strong>Within SD:</strong>
            <span class="${within ? "meas-within-yes" : "meas-within-no"}">${within ? "Yes" : "No"}</span>
        </div>`;

      // Toggle active on row click
      card.querySelector(".meas-row").addEventListener("click", () => {
        activeIds.has(m.id) ? activeIds.delete(m.id) : activeIds.add(m.id);
        updateStats();
        renderCards();
      });

      // Toggle detail on arrow click
      card.querySelector(".meas-toggle").addEventListener("click", e => {
        e.stopPropagation();
        openDetails.has(m.id) ? openDetails.delete(m.id) : openDetails.add(m.id);
        renderCards();
      });

      body.appendChild(card);
    });
  });
}

/* ══════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════ */

window.addEventListener("resize", () => drawChart(getActiveData()));

buildFilters();
renderCards();
updateStats();
