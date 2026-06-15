"""
Curated database of common skincare/haircare ingredients (INCI names)
with effects per skin/hair type.

v2 changes (recognition + personalization):
  - Greatly expanded INCI coverage (~200+ entries).
  - Added optional fields per ingredient:
        "comedogenic":  0-5  (pore-clogging risk; higher = worse for acne-prone)
        "type_notes":   {type: short personalized message}
  - FAMILY_RULES: suffix/keyword fallbacks so unknown INCI names still get
        a sensible category + generic note (silicones, parabens, PEGs,
        sulfates, hydrolyzed proteins, plant oils, etc.).
  - TYPE_RULE_PACKS: per skin/hair type lists of patterns to auto-flag
        as "avoid" or "great" even without an exact DB hit.
"""

# ---------------------------------------------------------------------------
# INGREDIENT_DB
# ---------------------------------------------------------------------------
#  category options:
#    actives, hydrators, emollients, preservatives, ph_adjusters,
#    fragrance_related, silicones, natural_extracts, surfactants,
#    emulsifiers, uv_filters, proteins, antioxidants, additive, other
#  good_for / caution_for: list of skin or hair types (lowercase).
#    "all" applies broadly.
#  comedogenic: optional 0-5
#  type_notes:  optional dict {skin_or_hair_type: "personal note"}
# ---------------------------------------------------------------------------

INGREDIENT_DB = {
    # ── Solvents / base ────────────────────────────────────────────────
    "water": {
        "synonyms": ["aqua", "eau", "purified water"],
        "category": "other",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Solvent base of most formulas.",
        "concerns": "None.",
    },

    # ── Humectants / hydrators ─────────────────────────────────────────
    "glycerin": {
        "synonyms": ["glycerine", "glycerol"],
        "category": "hydrators",
        "good_for": ["all", "dry", "sensitive"], "caution_for": [],
        "benefits": "Humectant — pulls moisture into skin/hair. Gentle.",
        "concerns": "None significant.",
    },
    "hyaluronic acid": {
        "synonyms": ["sodium hyaluronate", "hydrolyzed hyaluronic acid", "sodium acetylated hyaluronate"],
        "category": "hydrators",
        "good_for": ["all", "dry", "sensitive", "acne-prone"], "caution_for": [],
        "benefits": "Deeply hydrates, plumps skin.",
        "concerns": "None significant.",
    },
    "panthenol": {
        "synonyms": ["provitamin b5", "d-panthenol", "panthenyl"],
        "category": "hydrators",
        "good_for": ["dry", "damaged hair", "sensitive", "all"], "caution_for": [],
        "benefits": "Moisturizes, soothes, strengthens hair.",
        "concerns": "None significant.",
    },
    "butylene glycol": {
        "synonyms": ["pentylene glycol", "propanediol", "1,2-hexanediol"],
        "category": "hydrators",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Lightweight humectant and solvent.",
        "concerns": "Rarely irritating to very sensitive skin.",
    },
    "urea": {
        "synonyms": [],
        "category": "hydrators",
        "good_for": ["dry", "all"], "caution_for": ["sensitive"],
        "benefits": "Humectant + mild keratolytic; great for very dry skin.",
        "concerns": "Can sting on broken/compromised skin.",
    },
    "sorbitol": {
        "synonyms": ["xylitol", "maltitol"],
        "category": "hydrators",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Sugar-derived humectant.",
        "concerns": "None significant.",
    },
    "aloe": {
        "synonyms": ["aloe barbadensis", "aloe vera"],
        "category": "natural_extracts",
        "good_for": ["all", "sensitive", "dry"], "caution_for": [],
        "benefits": "Soothing, hydrating, calms irritation.",
        "concerns": "None significant.",
    },

    # ── Emollients / oils / butters ────────────────────────────────────
    "shea butter": {
        "synonyms": ["butyrospermum parkii"],
        "category": "emollients",
        "comedogenic": 0,
        "good_for": ["dry", "damaged hair", "all"], "caution_for": ["fine hair"],
        "type_notes": {"fine hair": "Heavy butter — can weigh down fine strands."},
        "benefits": "Rich moisturizer, soothes and nourishes dry skin.",
        "concerns": "May feel heavy on very oily skin or fine hair.",
    },
    "cocoa butter": {
        "synonyms": ["theobroma cacao"],
        "category": "emollients",
        "comedogenic": 4,
        "good_for": ["dry"], "caution_for": ["acne-prone", "oily", "fine hair"],
        "type_notes": {"acne-prone": "Highly comedogenic (4/5) — likely to clog pores."},
        "benefits": "Rich occlusive, locks in moisture.",
        "concerns": "Highly pore-clogging on acne-prone skin.",
    },
    "coconut oil": {
        "synonyms": ["cocos nucifera"],
        "category": "emollients",
        "comedogenic": 4,
        "good_for": ["dry", "damaged hair"], "caution_for": ["acne-prone", "oily", "fine hair"],
        "type_notes": {
            "acne-prone": "Comedogenic 4/5 — strongly linked to breakouts on the face.",
            "fine hair": "Can cause protein-style buildup on fine strands.",
        },
        "benefits": "Deeply moisturizing; coats and protects hair shaft.",
        "concerns": "Comedogenic — avoid on acne-prone facial skin.",
    },
    "jojoba": {
        "synonyms": ["simmondsia chinensis", "jojoba oil"],
        "category": "emollients",
        "comedogenic": 2,
        "good_for": ["all", "oily", "dry", "acne-prone"], "caution_for": [],
        "benefits": "Mimics skin sebum, balances oil, generally non-comedogenic.",
        "concerns": "None significant.",
    },
    "squalane": {
        "synonyms": ["squalene"],
        "category": "emollients",
        "comedogenic": 1,
        "good_for": ["all", "dry", "sensitive", "acne-prone"], "caution_for": [],
        "benefits": "Lightweight, skin-identical emollient.",
        "concerns": "None significant.",
    },
    "sweet almond oil": {
        "synonyms": ["prunus amygdalus dulcis"],
        "category": "emollients",
        "comedogenic": 2,
        "good_for": ["dry", "normal"], "caution_for": ["acne-prone"],
        "benefits": "Moisturizing, rich in vitamin E and fatty acids.",
        "concerns": "Can clog pores on acne-prone skin.",
    },
    "sunflower oil": {
        "synonyms": ["helianthus annuus"],
        "category": "emollients",
        "comedogenic": 0,
        "good_for": ["dry", "sensitive", "all"], "caution_for": [],
        "benefits": "Lightweight, linoleic-rich — supports skin barrier.",
        "concerns": "None significant.",
    },
    "argan oil": {
        "synonyms": ["argania spinosa"],
        "category": "emollients",
        "comedogenic": 0,
        "good_for": ["dry", "damaged hair", "frizzy hair"], "caution_for": [],
        "benefits": "Nourishing oil — smooths hair, softens skin.",
        "concerns": "None significant.",
    },
    "rosehip oil": {
        "synonyms": ["rosa canina", "rosa moschata"],
        "category": "emollients",
        "comedogenic": 1,
        "good_for": ["dry", "normal", "combination"], "caution_for": [],
        "benefits": "Rich in linoleic acid + vitamin A precursors.",
        "concerns": "None significant.",
    },
    "marula oil": {
        "synonyms": ["sclerocarya birrea"],
        "category": "emollients",
        "comedogenic": 1,
        "good_for": ["dry", "all"], "caution_for": [],
        "benefits": "Lightweight, antioxidant-rich oil.",
        "concerns": "None significant.",
    },
    "isopropyl myristate": {
        "synonyms": ["isopropyl palmitate", "isopropyl isostearate"],
        "category": "emollients",
        "comedogenic": 5,
        "good_for": [], "caution_for": ["acne-prone", "oily"],
        "type_notes": {"acne-prone": "Highest comedogenic rating (5/5) — strong pore-clogger."},
        "benefits": "Gives slip and silky feel.",
        "concerns": "Notoriously pore-clogging on acne-prone skin.",
    },
    "petrolatum": {
        "synonyms": ["petroleum jelly", "vaseline"],
        "category": "emollients",
        "comedogenic": 0,
        "good_for": ["dry", "sensitive", "damaged hair"], "caution_for": ["oily"],
        "benefits": "Strong occlusive — seals in moisture.",
        "concerns": "Heavy feel; not ideal on already oily skin.",
    },
    "mineral oil": {
        "synonyms": ["paraffinum liquidum"],
        "category": "emollients",
        "comedogenic": 0,
        "good_for": ["dry", "sensitive"], "caution_for": ["oily"],
        "benefits": "Inert occlusive, prevents water loss.",
        "concerns": "Heavy on oily skin.",
    },
    "lanolin": {
        "synonyms": [],
        "category": "emollients",
        "comedogenic": 4,
        "good_for": ["dry"], "caution_for": ["acne-prone", "sensitive"],
        "benefits": "Mimics skin lipids, very moisturizing.",
        "concerns": "Comedogenic + common allergen.",
    },
    "caprylic/capric triglyceride": {
        "synonyms": ["caprylic capric triglyceride", "c8-10 triglyceride"],
        "category": "emollients",
        "comedogenic": 1,
        "good_for": ["all", "dry"], "caution_for": [],
        "benefits": "Lightweight coconut-derived emollient.",
        "concerns": "None significant.",
    },

    # ── Silicones ──────────────────────────────────────────────────────
    "dimethicone": {
        "synonyms": ["dimethiconol", "phenyl trimethicone", "polysilicone"],
        "category": "silicones",
        "comedogenic": 1,
        "good_for": ["dry", "frizzy hair", "damaged hair", "all"],
        "caution_for": ["acne-prone", "fine hair"],
        "type_notes": {
            "fine hair": "Can cause buildup on fine strands without sulfate cleansing.",
        },
        "benefits": "Smooths skin/hair, locks in moisture.",
        "concerns": "Can trap sweat/oil and contribute to buildup.",
    },
    "cyclopentasiloxane": {
        "synonyms": ["cyclomethicone", "cyclohexasiloxane"],
        "category": "silicones",
        "good_for": ["dry", "all"], "caution_for": ["acne-prone"],
        "benefits": "Lightweight silicone — silky feel, fast absorption.",
        "concerns": "May contribute to pore congestion for some users.",
    },
    "amodimethicone": {
        "synonyms": [],
        "category": "silicones",
        "good_for": ["damaged hair", "frizzy hair", "color-treated hair"],
        "caution_for": ["fine hair"],
        "benefits": "Conditioning silicone that targets damaged areas of hair.",
        "concerns": "Heavy buildup risk on fine hair.",
    },

    # ── Preservatives ──────────────────────────────────────────────────
    "phenoxyethanol": {
        "synonyms": [],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Safe broad-spectrum preservative.",
        "concerns": "Rarely mild irritation in very sensitive skin.",
    },
    "parabens": {
        "synonyms": ["methylparaben", "propylparaben", "ethylparaben", "butylparaben"],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Effective preservatives at very low concentrations.",
        "concerns": "Debated endocrine concerns; well-tolerated by most.",
    },
    "benzyl alcohol": {
        "synonyms": ["benzoic acid", "benzyl benzoate", "benzyl salicylate"],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Preservative; prevents microbial growth.",
        "concerns": "Listed EU fragrance allergen — caution if fragrance-sensitive.",
    },
    "methylisothiazolinone": {
        "synonyms": ["methylchloroisothiazolinone", "mit", "cmit"],
        "category": "preservatives",
        "good_for": [], "caution_for": ["sensitive", "all"],
        "benefits": "Strong preservative.",
        "concerns": "High allergy and contact-dermatitis rate. Best avoided.",
    },
    "dmdm hydantoin": {
        "synonyms": ["diazolidinyl urea", "imidazolidinyl urea", "quaternium-15"],
        "category": "preservatives",
        "good_for": [], "caution_for": ["sensitive", "all"],
        "benefits": "Effective preservative.",
        "concerns": "Formaldehyde-releaser — can sensitize over time.",
    },
    "sodium benzoate": {
        "synonyms": ["potassium sorbate"],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Gentle food-grade preservative.",
        "concerns": "None significant.",
    },
    "ethylhexylglycerin": {
        "synonyms": [],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Preservative booster, also conditioning.",
        "concerns": "None significant.",
    },
    "bht": {
        "synonyms": ["bha (antioxidant)", "tbhq"],
        "category": "preservatives",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Antioxidant preservative.",
        "concerns": "Low-risk at cosmetic concentrations.",
    },

    # ── pH adjusters ───────────────────────────────────────────────────
    "citric acid": {
        "synonyms": [],
        "category": "ph_adjusters",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Balances product pH.",
        "concerns": "Can sting compromised skin.",
    },
    "sodium hydroxide": {
        "synonyms": ["potassium hydroxide", "triethanolamine", "tea", "tromethamine"],
        "category": "ph_adjusters",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Adjusts pH of formula.",
        "concerns": "Inert at use levels.",
    },

    # ── Actives ────────────────────────────────────────────────────────
    "retinol": {
        "synonyms": ["retinyl palmitate", "retinaldehyde", "retinyl retinoate", "hydroxypinacolone retinoate"],
        "category": "actives",
        "good_for": ["normal", "oily", "combination"], "caution_for": ["sensitive", "dry"],
        "type_notes": {
            "sensitive": "Strong active — can cause redness and stinging. Patch test, start 1–2x/week.",
            "dry": "Can worsen dryness; pair with a barrier moisturizer.",
        },
        "benefits": "Reduces fine lines, boosts cell turnover, improves texture.",
        "concerns": "Causes sun sensitivity. Always use SPF.",
    },
    "bakuchiol": {
        "synonyms": [],
        "category": "actives",
        "good_for": ["sensitive", "dry", "all"], "caution_for": [],
        "benefits": "Gentle retinol-alternative for fine lines.",
        "concerns": "None significant.",
    },
    "niacinamide": {
        "synonyms": ["nicotinamide"],
        "category": "actives",
        "good_for": ["all", "oily", "acne-prone", "sensitive"], "caution_for": [],
        "benefits": "Reduces redness, controls oil, minimizes pores, brightens.",
        "concerns": "Rare flushing at high concentrations.",
    },
    "salicylic acid": {
        "synonyms": ["bha (acid)", "willow bark extract", "salix alba"],
        "category": "actives",
        "good_for": ["oily", "combination", "acne-prone"], "caution_for": ["dry", "sensitive"],
        "type_notes": {
            "dry": "Exfoliating BHA — can worsen dryness if overused.",
            "sensitive": "Can sting/redden sensitive skin.",
        },
        "benefits": "Unclogs pores, exfoliates, reduces acne.",
        "concerns": "Avoid stacking with other exfoliants.",
    },
    "glycolic acid": {
        "synonyms": ["aha", "lactic acid", "mandelic acid", "tartaric acid", "malic acid"],
        "category": "actives",
        "good_for": ["normal", "oily", "combination"], "caution_for": ["sensitive", "dry"],
        "benefits": "Surface exfoliant — smooths and brightens.",
        "concerns": "Sun sensitivity; can irritate sensitive skin.",
    },
    "azelaic acid": {
        "synonyms": [],
        "category": "actives",
        "good_for": ["acne-prone", "sensitive", "all"], "caution_for": [],
        "benefits": "Calms redness, fades post-acne marks, gentle.",
        "concerns": "Mild tingling at first use.",
    },
    "benzoyl peroxide": {
        "synonyms": [],
        "category": "actives",
        "good_for": ["acne-prone", "oily"], "caution_for": ["sensitive", "dry"],
        "benefits": "Kills acne-causing bacteria.",
        "concerns": "Drying; bleaches fabric.",
    },
    "vitamin c": {
        "synonyms": ["ascorbic acid", "l-ascorbic acid", "ascorbyl glucoside",
                     "magnesium ascorbyl phosphate", "sodium ascorbyl phosphate",
                     "ethyl ascorbic acid", "tetrahexyldecyl ascorbate"],
        "category": "actives",
        "good_for": ["all", "normal", "combination"], "caution_for": ["sensitive"],
        "benefits": "Brightens, antioxidant, evens tone.",
        "concerns": "L-ascorbic acid can sting sensitive skin.",
    },
    "peptides": {
        "synonyms": ["palmitoyl tripeptide", "palmitoyl pentapeptide", "matrixyl",
                     "copper peptides", "acetyl hexapeptide", "argireline"],
        "category": "actives",
        "good_for": ["all", "dry", "sensitive"], "caution_for": [],
        "benefits": "Supports collagen and skin barrier.",
        "concerns": "None significant.",
    },
    "ceramides": {
        "synonyms": ["ceramide np", "ceramide ap", "ceramide eop", "phytosphingosine"],
        "category": "actives",
        "good_for": ["all", "dry", "sensitive"], "caution_for": [],
        "benefits": "Rebuilds skin barrier; great for dry/sensitive skin.",
        "concerns": "None significant.",
    },
    "centella asiatica": {
        "synonyms": ["cica", "madecassoside", "asiaticoside"],
        "category": "actives",
        "good_for": ["sensitive", "all", "dry"], "caution_for": [],
        "benefits": "Soothes redness, supports healing.",
        "concerns": "None significant.",
    },
    "allantoin": {
        "synonyms": [],
        "category": "actives",
        "good_for": ["sensitive", "all"], "caution_for": [],
        "benefits": "Soothes and softens.",
        "concerns": "None significant.",
    },
    "tranexamic acid": {
        "synonyms": [],
        "category": "actives",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Fades dark spots and post-acne marks.",
        "concerns": "None significant.",
    },

    # ── UV filters ─────────────────────────────────────────────────────
    "zinc oxide": {
        "synonyms": ["titanium dioxide"],
        "category": "uv_filters",
        "good_for": ["all", "sensitive", "acne-prone"], "caution_for": [],
        "benefits": "Mineral SPF — broad spectrum, gentle.",
        "concerns": "Can leave a white cast.",
    },
    "avobenzone": {
        "synonyms": ["octocrylene", "homosalate", "octisalate"],
        "category": "uv_filters",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Chemical UV filter.",
        "concerns": "Some can irritate sensitive skin.",
    },
    "ethylhexyl methoxycinnamate": {
        "synonyms": ["octinoxate"],
        "category": "uv_filters",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Chemical UV filter.",
        "concerns": "Hormone-disruption concerns; reef-banned in some regions.",
    },

    # ── Surfactants / cleansers ────────────────────────────────────────
    "sulfates": {
        "synonyms": ["sodium lauryl sulfate", "sodium laureth sulfate",
                     "sls", "sles", "ammonium lauryl sulfate"],
        "category": "surfactants",
        "good_for": ["oily"],
        "caution_for": ["dry", "sensitive", "color-treated hair", "curly", "damaged hair"],
        "type_notes": {
            "color-treated hair": "Sulfates strip color faster — choose sulfate-free.",
            "curly": "Strips natural oils curls need; can cause frizz.",
            "damaged hair": "Too harsh for compromised cuticle — opt for sulfate-free.",
        },
        "benefits": "Deep cleansing, strong lather.",
        "concerns": "Strips natural oils; can fade hair color.",
    },
    "cocamidopropyl betaine": {
        "synonyms": ["coco-betaine", "cocamide mea", "cocamide dea", "decyl glucoside",
                     "coco-glucoside", "lauryl glucoside"],
        "category": "surfactants",
        "good_for": ["all", "sensitive"], "caution_for": [],
        "benefits": "Mild cleanser; sulfate-free alternative.",
        "concerns": "Rare sensitization.",
    },

    # ── Emulsifiers ────────────────────────────────────────────────────
    "cetearyl alcohol": {
        "synonyms": ["cetyl alcohol", "stearyl alcohol", "behenyl alcohol", "myristyl alcohol"],
        "category": "emulsifiers",
        "good_for": ["all", "dry"], "caution_for": [],
        "benefits": "Fatty alcohol — emulsifies and softens (NOT drying like SD alcohol).",
        "concerns": "None significant.",
    },
    "polysorbate": {
        "synonyms": ["polysorbate 20", "polysorbate 60", "polysorbate 80"],
        "category": "emulsifiers",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Helps oil and water mix; solubilizer.",
        "concerns": "None significant.",
    },
    "peg": {
        "synonyms": ["peg-40", "peg-100", "peg-7", "ppg-", "peg-150"],
        "category": "emulsifiers",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Polyethylene glycol derivative — emulsifier/solubilizer.",
        "concerns": "Purity can vary; generally low risk.",
    },
    "xanthan gum": {
        "synonyms": ["carbomer", "acrylates copolymer", "sodium polyacrylate",
                     "hydroxyethylcellulose", "guar gum"],
        "category": "other",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Thickener/stabilizer.",
        "concerns": "None significant.",
    },

    # ── Proteins (hair) ────────────────────────────────────────────────
    "hydrolyzed protein": {
        "synonyms": ["hydrolyzed keratin", "hydrolyzed wheat protein",
                     "hydrolyzed silk", "hydrolyzed quinoa", "hydrolyzed soy protein",
                     "hydrolyzed rice protein", "hydrolyzed collagen"],
        "category": "proteins",
        "good_for": ["damaged hair", "color-treated hair", "fine hair"],
        "caution_for": [],
        "benefits": "Reinforces damaged cuticle; adds strength.",
        "concerns": "Overuse can leave hair feeling stiff (protein overload).",
    },

    # ── Antioxidants ───────────────────────────────────────────────────
    "tocopherol": {
        "synonyms": ["vitamin e", "tocopheryl acetate", "tocotrienol"],
        "category": "antioxidants",
        "good_for": ["all", "dry"], "caution_for": [],
        "benefits": "Antioxidant; protects against environmental damage.",
        "concerns": "None significant.",
    },
    "green tea extract": {
        "synonyms": ["camellia sinensis", "epigallocatechin gallate", "egcg"],
        "category": "antioxidants",
        "good_for": ["all", "oily", "acne-prone", "sensitive"], "caution_for": [],
        "benefits": "Soothing antioxidant.",
        "concerns": "None significant.",
    },
    "resveratrol": {
        "synonyms": ["ferulic acid"],
        "category": "antioxidants",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Antioxidant, brightening.",
        "concerns": "None significant.",
    },

    # ── Drying / irritating alcohols ───────────────────────────────────
    "alcohol denat": {
        "synonyms": ["denatured alcohol", "sd alcohol", "alcohol denatured",
                     "ethanol", "isopropyl alcohol"],
        "category": "other",
        "good_for": ["oily"], "caution_for": ["dry", "sensitive", "curly", "damaged hair"],
        "type_notes": {
            "dry": "Drying alcohol — can disrupt the skin barrier.",
            "sensitive": "Frequent stinging trigger.",
            "curly": "Strips curls of moisture — avoid in leave-ins.",
        },
        "benefits": "Fast absorption; oil control.",
        "concerns": "Drying with repeat use; not a fatty alcohol.",
    },

    # ── Fragrance / allergens ──────────────────────────────────────────
    "fragrance": {
        "synonyms": ["parfum", "fragrance (parfum)", "aroma"],
        "category": "fragrance_related",
        "good_for": [], "caution_for": ["sensitive", "all"],
        "type_notes": {"sensitive": "Top allergy trigger — choose fragrance-free if reactive."},
        "benefits": "Provides scent.",
        "concerns": "Common irritant and allergen.",
    },
    "linalool": {
        "synonyms": ["geraniol", "citronellol", "hydroxycitronellal",
                     "hexyl cinnamal", "limonene", "citral", "eugenol",
                     "isoeugenol", "coumarin", "farnesol"],
        "category": "fragrance_related",
        "good_for": [], "caution_for": ["sensitive"],
        "benefits": "Naturally occurring fragrance compound.",
        "concerns": "EU-listed common fragrance allergen.",
    },
    "essential oil": {
        "synonyms": ["lavender oil", "tea tree oil", "peppermint oil",
                     "citrus oil", "lemon oil", "bergamot", "ylang ylang",
                     "rosemary oil", "eucalyptus"],
        "category": "fragrance_related",
        "good_for": [], "caution_for": ["sensitive", "acne-prone"],
        "benefits": "Natural scent + some bioactivity.",
        "concerns": "Common irritants; citrus oils can be photosensitizing.",
    },
    "menthol": {
        "synonyms": ["camphor", "methyl salicylate"],
        "category": "fragrance_related",
        "good_for": [], "caution_for": ["sensitive"],
        "benefits": "Cooling sensation.",
        "concerns": "Can irritate compromised barriers.",
    },
    "witch hazel": {
        "synonyms": ["hamamelis virginiana"],
        "category": "natural_extracts",
        "good_for": ["oily"], "caution_for": ["dry", "sensitive"],
        "benefits": "Astringent; reduces shine.",
        "concerns": "Often distilled with alcohol — drying.",
    },

    # ── Common plant extracts ──────────────────────────────────────────
    "rosemary leaf extract": {
        "synonyms": ["rosmarinus officinalis"],
        "category": "natural_extracts",
        "good_for": ["all", "oily"], "caution_for": ["sensitive"],
        "benefits": "Antioxidant, antimicrobial.",
        "concerns": "Can irritate at high concentrations.",
    },
    "chamomile": {
        "synonyms": ["chamomilla recutita", "anthemis nobilis", "bisabolol"],
        "category": "natural_extracts",
        "good_for": ["sensitive", "all"], "caution_for": [],
        "benefits": "Calming, anti-inflammatory.",
        "concerns": "Rare allergy.",
    },
    "carrot root extract": {
        "synonyms": ["daucus carota sativa", "beta-carotene"],
        "category": "natural_extracts",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Antioxidant nourishment.",
        "concerns": "None significant.",
    },

    # ── Chelators / misc ───────────────────────────────────────────────
    "edta": {
        "synonyms": ["disodium edta", "tetrasodium edta"],
        "category": "other",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Chelator — stabilizes the formula.",
        "concerns": "None significant.",
    },
    "silica": {
        "synonyms": ["kaolin", "bentonite", "mica"],
        "category": "other",
        "good_for": ["oily"], "caution_for": ["dry"],
        "benefits": "Mattifies and absorbs oil.",
        "concerns": "Can feel drying on dry skin.",
    },

    # ── Hair-specific conditioning agents ──────────────────────────────
    "behentrimonium": {
        "synonyms": ["behentrimonium methosulfate", "behentrimonium chloride",
                     "cetrimonium chloride", "stearamidopropyl dimethylamine"],
        "category": "emulsifiers",
        "good_for": ["dry", "damaged hair", "curly", "frizzy hair"], "caution_for": [],
        "benefits": "Detangling conditioning agent — gentle quat.",
        "concerns": "None significant.",
    },
}

# ---------------------------------------------------------------------------
# HIGH_CONCERN_INGREDIENTS — flagged with strongest visual treatment
# ---------------------------------------------------------------------------
HIGH_CONCERN_INGREDIENTS = {
    "fragrance",
    "linalool",
    "essential oil",
    "alcohol denat",
    "sulfates",
    "methylisothiazolinone",
    "dmdm hydantoin",
    "ethylhexyl methoxycinnamate",
    "lanolin",
    "isopropyl myristate",
    "cocoa butter",
    "coconut oil",
}

# ---------------------------------------------------------------------------
# FRAGRANCE_COMPONENTS — consolidated under "fragrance" for non-perfumes
# ---------------------------------------------------------------------------
FRAGRANCE_COMPONENTS = {
    "fragrance", "linalool", "essential oil", "menthol",
    "benzyl alcohol",
    # raw allergen names (synonyms of "linalool" entry)
    "geraniol", "citronellol", "hydroxycitronellal", "hexyl cinnamal",
    "limonene", "citral", "eugenol", "isoeugenol", "coumarin", "farnesol",
    "benzyl benzoate", "benzyl salicylate",
}

# ---------------------------------------------------------------------------
# FAMILY_RULES — fallback classifier so UNKNOWN ingredients still get
# a category + sensible per-type verdict. Each rule:
#   pattern (substring, lowercase) -> dict with category + optional
#   good_for / caution_for / benefits / concerns
# Order matters; first match wins.
# ---------------------------------------------------------------------------
FAMILY_RULES = [
    # silicones
    (("siloxane", "methicone", "silsesquioxane"), {
        "category": "silicones",
        "good_for": ["dry", "frizzy hair", "damaged hair"],
        "caution_for": ["acne-prone", "fine hair"],
        "benefits": "Silicone — smooths surface, locks in moisture.",
        "concerns": "Can build up on hair; may congest acne-prone skin.",
    }),
    # parabens
    (("paraben",), {
        "category": "preservatives",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Paraben preservative.",
        "concerns": "Debated; well-tolerated by most.",
    }),
    # formaldehyde releasers / strong preservatives
    (("dmdm hydantoin", "imidazolidinyl", "diazolidinyl", "quaternium-15",
      "isothiazolinone"), {
        "category": "preservatives",
        "good_for": [], "caution_for": ["sensitive", "all"],
        "benefits": "Strong preservative.",
        "concerns": "Higher sensitization risk — caution if reactive.",
    }),
    # PEG / PPG family
    (("peg-", "ppg-", "peg/ppg", "polyethylene glycol"), {
        "category": "emulsifiers",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Polyethylene-glycol derivative — emulsifier/solubilizer.",
        "concerns": "Purity-dependent; generally low risk.",
    }),
    # sulfates
    (("lauryl sulfate", "laureth sulfate", " sulfate"), {
        "category": "surfactants",
        "good_for": ["oily"],
        "caution_for": ["dry", "sensitive", "color-treated hair", "curly", "damaged hair"],
        "benefits": "Sulfate surfactant — strong cleansing.",
        "concerns": "Can strip oils and fade hair color.",
    }),
    # hydrolyzed proteins
    (("hydrolyzed",), {
        "category": "proteins",
        "good_for": ["damaged hair", "color-treated hair", "fine hair"],
        "caution_for": [],
        "benefits": "Hydrolyzed protein — strengthens damaged hair.",
        "concerns": "Overuse can cause stiffness (protein overload).",
    }),
    # fatty alcohols (NOT drying — explicit allow)
    (("cetyl alcohol", "stearyl alcohol", "cetearyl alcohol",
      "behenyl alcohol", "myristyl alcohol"), {
        "category": "emulsifiers",
        "good_for": ["all", "dry"], "caution_for": [],
        "benefits": "Fatty alcohol — emulsifies + softens (not drying).",
        "concerns": "None significant.",
    }),
    # drying alcohols
    (("alcohol denat", "denatured alcohol", "sd alcohol", "isopropyl alcohol",
      "ethanol"), {
        "category": "other",
        "good_for": ["oily"], "caution_for": ["dry", "sensitive", "curly"],
        "benefits": "Helps absorption / oil control.",
        "concerns": "Drying with repeat use.",
    }),
    # plant oils (generic)
    ((" oil", "seed oil", "fruit oil", "kernel oil"), {
        "category": "emollients",
        "good_for": ["dry", "damaged hair"], "caution_for": ["acne-prone", "oily"],
        "benefits": "Plant-derived emollient oil.",
        "concerns": "Some plant oils are comedogenic — patch test on acne-prone skin.",
    }),
    # butters
    ((" butter",), {
        "category": "emollients",
        "good_for": ["dry"], "caution_for": ["acne-prone", "fine hair"],
        "benefits": "Rich butter — moisturizing and occlusive.",
        "concerns": "Heavy texture; can clog pores or weigh hair down.",
    }),
    # waxes
    ((" wax", "cera "), {
        "category": "emollients",
        "good_for": ["dry"], "caution_for": ["acne-prone"],
        "benefits": "Occlusive wax — protects against moisture loss.",
        "concerns": "Heavy on oily/acne-prone skin.",
    }),
    # esters (often -ate)
    (("palmitate", "stearate", "myristate", "laurate", "oleate", "linoleate"), {
        "category": "emollients",
        "good_for": ["dry", "all"], "caution_for": ["acne-prone"],
        "benefits": "Fatty-acid ester — emollient slip.",
        "concerns": "Some esters (e.g. isopropyl myristate) are pore-clogging.",
    }),
    # gums / thickeners
    (("xanthan", "carbomer", "cellulose", "guar"), {
        "category": "other",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Thickener / stabilizer.",
        "concerns": "None significant.",
    }),
    # vitamins
    (("tocopher", "ascorbyl", "retinyl", "retinoid", "niacin", "panthen"), {
        "category": "actives",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Vitamin derivative — supports skin function.",
        "concerns": "Retinoids can irritate sensitive skin.",
    }),
    # extracts
    (("extract",), {
        "category": "natural_extracts",
        "good_for": ["all"], "caution_for": ["sensitive"],
        "benefits": "Plant extract.",
        "concerns": "Botanicals are a common sensitizer for reactive skin.",
    }),
    # colorants
    (("ci 7", "ci 1", "ci 4", "ci 6", "iron oxide", "mica"), {
        "category": "other",
        "good_for": ["all"], "caution_for": [],
        "benefits": "Colorant.",
        "concerns": "None significant at cosmetic levels.",
    }),
]


def classify_unknown_ingredient(name: str):
    """
    Best-effort classification for an ingredient that is NOT in INGREDIENT_DB.
    Returns a dict shaped like an INGREDIENT_DB entry, or None.
    """
    n = " " + name.lower().strip() + " "  # pad so " oil" matches "argan oil"
    for patterns, data in FAMILY_RULES:
        if any(p in n for p in patterns):
            return {
                "synonyms": [],
                "category": data.get("category", "other"),
                "good_for": list(data.get("good_for", [])),
                "caution_for": list(data.get("caution_for", [])),
                "benefits": data.get("benefits", ""),
                "concerns": data.get("concerns", ""),
                "matched_by": "family_rule",
            }
    return None


# ---------------------------------------------------------------------------
# TYPE_RULE_PACKS — per skin/hair type, additional auto-flag patterns.
# Used to upgrade a "neutral" verdict to "avoid"/"caution"/"great".
# ---------------------------------------------------------------------------
TYPE_RULE_PACKS = {
    "acne-prone": {
        "avoid_patterns": [
            "coconut oil", "cocoa butter", "isopropyl myristate",
            "isopropyl palmitate", "lanolin", "algae extract",
            "wheat germ oil", "linseed oil",
        ],
        "caution_patterns": ["mineral oil", "petrolatum"],
        "great_patterns": [
            "niacinamide", "salicylic acid", "azelaic acid",
            "benzoyl peroxide", "zinc oxide", "green tea",
        ],
        "headline": "Acne-prone skin needs low-comedogenic, pore-friendly ingredients.",
    },
    "sensitive": {
        "avoid_patterns": [
            "fragrance", "parfum", "essential oil", "menthol",
            "methylisothiazolinone", "dmdm hydantoin",
            "alcohol denat", "denatured alcohol",
            "limonene", "linalool", "geraniol", "citronellol",
            "cinnamal", "eugenol",
        ],
        "caution_patterns": ["citric acid", "witch hazel", "salicylic acid", "glycolic acid"],
        "great_patterns": ["centella", "panthenol", "allantoin", "ceramide", "bisabolol", "chamomile"],
        "headline": "Sensitive skin reacts to fragrance, essential oils, and harsh actives.",
    },
    "dry": {
        "avoid_patterns": ["alcohol denat", "denatured alcohol", "sd alcohol",
                           "lauryl sulfate", "laureth sulfate"],
        "caution_patterns": ["salicylic acid", "glycolic acid", "retinol", "witch hazel"],
        "great_patterns": ["hyaluronic", "glycerin", "ceramide", "squalane", "shea butter", "panthenol"],
        "headline": "Dry skin needs humectants + occlusives; avoid drying alcohols and strong exfoliants.",
    },
    "oily": {
        "avoid_patterns": ["coconut oil", "cocoa butter", "petrolatum", "mineral oil", "lanolin"],
        "caution_patterns": ["shea butter", "isopropyl myristate"],
        "great_patterns": ["niacinamide", "salicylic acid", "zinc", "silica", "kaolin", "clay"],
        "headline": "Oily skin benefits from lightweight, non-comedogenic, mattifying ingredients.",
    },
    "combination": {
        "avoid_patterns": ["coconut oil", "isopropyl myristate"],
        "caution_patterns": ["alcohol denat"],
        "great_patterns": ["niacinamide", "hyaluronic", "salicylic acid"],
        "headline": "Combination skin does best with balancing humectants + gentle exfoliants.",
    },
    "normal": {
        "avoid_patterns": ["methylisothiazolinone"],
        "caution_patterns": [],
        "great_patterns": ["niacinamide", "hyaluronic", "vitamin c", "peptide"],
        "headline": "Normal skin tolerates most ingredients — focus on prevention.",
    },

    # ── Hair types ────────────────────────────────────────────────────
    "curly": {
        "avoid_patterns": ["lauryl sulfate", "laureth sulfate", "alcohol denat", "denatured alcohol"],
        "caution_patterns": ["dimethicone", "cyclopentasiloxane"],
        "great_patterns": ["glycerin", "shea butter", "argan", "panthenol", "behentrimonium"],
        "headline": "Curly hair needs moisture; avoid sulfates and drying alcohols.",
    },
    "frizzy hair": {
        "avoid_patterns": ["lauryl sulfate", "laureth sulfate", "alcohol denat"],
        "caution_patterns": [],
        "great_patterns": ["argan", "dimethicone", "amodimethicone", "shea butter", "panthenol"],
        "headline": "Frizz-prone hair benefits from smoothing silicones and rich emollients.",
    },
    "damaged hair": {
        "avoid_patterns": ["lauryl sulfate", "laureth sulfate", "alcohol denat"],
        "caution_patterns": [],
        "great_patterns": ["hydrolyzed", "keratin", "panthenol", "ceramide", "argan", "amodimethicone"],
        "headline": "Damaged hair needs proteins, bond-builders, and gentle cleansers.",
    },
    "color-treated hair": {
        "avoid_patterns": ["lauryl sulfate", "laureth sulfate", "ammonium lauryl sulfate"],
        "caution_patterns": ["alcohol denat"],
        "great_patterns": ["hydrolyzed", "panthenol", "argan", "amodimethicone"],
        "headline": "Color-treated hair needs sulfate-free cleansers to extend color.",
    },
    "fine hair": {
        "avoid_patterns": ["coconut oil", "shea butter", "cocoa butter"],
        "caution_patterns": ["dimethicone", "amodimethicone", "petrolatum"],
        "great_patterns": ["hydrolyzed", "panthenol"],
        "headline": "Fine hair gets weighed down by heavy oils, butters, and silicones.",
    },
    "dry hair": {
        "avoid_patterns": ["lauryl sulfate", "laureth sulfate", "alcohol denat"],
        "caution_patterns": [],
        "great_patterns": ["glycerin", "shea butter", "argan", "panthenol", "behentrimonium"],
        "headline": "Dry hair needs sulfate-free cleansing and rich conditioners.",
    },
    "oily hair": {
        "avoid_patterns": ["coconut oil", "shea butter", "petrolatum"],
        "caution_patterns": ["dimethicone", "amodimethicone"],
        "great_patterns": ["green tea", "tea tree", "salicylic acid"],
        "headline": "Oily hair needs lightweight, buildup-free formulas.",
    },
}


def get_type_rule_pack(target_type: str) -> dict:
    """Return the rule pack for a skin/hair type, or empty dict."""
    if not target_type:
        return {}
    t = target_type.lower().strip()
    if t in TYPE_RULE_PACKS:
        return TYPE_RULE_PACKS[t]
    # also accept "dry" matching "dry hair" for hair flows
    if t == "dry" and "dry hair" in TYPE_RULE_PACKS:
        return TYPE_RULE_PACKS["dry"]
    return {}


def get_category_specific_concerns(product_type: str) -> dict:
    """Per product-type concern weighting (unchanged from v1)."""
    concerns_map = {
        "skincare": {
            "concern_multiplier": 1.5,
            "focus_categories": ["actives", "hydrators", "preservatives"],
            "de_emphasize": ["fragrance_related"],
        },
        "haircare": {
            "concern_multiplier": 1.0,
            "focus_categories": ["emollients", "hydrators", "silicones", "proteins"],
            "de_emphasize": [],
        },
        "perfume": {
            "concern_multiplier": 0.5,
            "focus_categories": ["fragrance_related"],
            "de_emphasize": [],
        },
        "bodycare": {
            "concern_multiplier": 1.0,
            "focus_categories": ["emollients", "hydrators", "fragrance_related"],
            "de_emphasize": [],
        },
    }
    return concerns_map.get(
        product_type.lower(),
        {"concern_multiplier": 1.0, "focus_categories": [], "de_emphasize": []},
    )
