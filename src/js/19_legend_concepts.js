/**
 * Legend Concept Inspector & Visual Scientific Diagrams (19_legend_concepts.js)
 * Educational modal system providing in-depth definitions and animated/clean SVG
 * diagrams when long-pressing any legend item, series, state, orbital, or decay mode.
 */

window.LEGEND_CONCEPTS = {
    // =========================================================================
    // 1. STATES OF MATTER
    // =========================================================================
    'Solid': {
        title: 'Solid State',
        badge: 'State of Matter • Condensed Phase',
        color: '#ffffff',
        definition: 'A state of matter characterized by structural rigidity and resistance to changes in shape or volume. Atoms or molecules are tightly packed in a fixed crystalline lattice or amorphous network, vibrating about fixed equilibrium positions.',
        characteristics: [
            'Fixed volume and definite geometric shape',
            'Strong intermolecular or interatomic attractive forces',
            'Low kinetic energy relative to binding energy; particles vibrate in place',
            'Very low compressibility and high density compared to gases'
        ],
        examples: ['Iron (Fe)', 'Carbon / Diamond (C)', 'Gold (Au)', 'Silicon (Si)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="solidSphere" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="50%" stop-color="#cbd5e1"/>
                    <stop offset="100%" stop-color="#475569"/>
                </radialGradient>
                <filter id="glowWhite" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="glow"/>
                    <feComposite in="SourceGraphic" in2="glow" operator="over"/>
                </filter>
            </defs>
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(255,255,255,0.15)"/>
            <g stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="3 3">
                <line x1="80" y1="40" x2="240" y2="40"/>
                <line x1="80" y1="85" x2="240" y2="85"/>
                <line x1="80" y1="130" x2="240" y2="130"/>
                <line x1="80" y1="40" x2="80" y2="130"/>
                <line x1="133" y1="40" x2="133" y2="130"/>
                <line x1="186" y1="40" x2="186" y2="130"/>
                <line x1="240" y1="40" x2="240" y2="130"/>
            </g>
            <g filter="url(#glowWhite)">
                <circle cx="80" cy="40" r="11" fill="url(#solidSphere)"/>
                <circle cx="133" cy="40" r="11" fill="url(#solidSphere)"/>
                <circle cx="186" cy="40" r="11" fill="url(#solidSphere)"/>
                <circle cx="240" cy="40" r="11" fill="url(#solidSphere)"/>
                <circle cx="80" cy="85" r="11" fill="url(#solidSphere)"/>
                <circle cx="133" cy="85" r="11" fill="url(#solidSphere)"/>
                <circle cx="186" cy="85" r="11" fill="url(#solidSphere)"/>
                <circle cx="240" cy="85" r="11" fill="url(#solidSphere)"/>
                <circle cx="80" cy="130" r="11" fill="url(#solidSphere)"/>
                <circle cx="133" cy="130" r="11" fill="url(#solidSphere)"/>
                <circle cx="186" cy="130" r="11" fill="url(#solidSphere)"/>
                <circle cx="240" cy="130" r="11" fill="url(#solidSphere)"/>
            </g>
            <text x="160" y="165" fill="#94a3b8" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Ordered Crystalline Lattice • Fixed Vibrations</text>
        </svg>`
    },

    'Liquid': {
        title: 'Liquid State',
        badge: 'State of Matter • Fluid Phase',
        color: '#00f0ff',
        definition: 'A nearly incompressible fluid that conforms to the shape of its container but retains a constant volume independent of pressure. Particles possess sufficient kinetic energy to slide past one another while remaining bound by cohesive forces.',
        characteristics: [
            'Fixed volume with no fixed shape (takes container form)',
            'Molecules slide and tumble continuously with short-range order',
            'Exhibits surface tension, viscosity, and capillary action',
            'Higher kinetic energy than solids, but lower than gases'
        ],
        examples: ['Mercury (Hg, Z=80)', 'Bromine (Br, Z=35)', 'Water (H₂O)', 'Gallium (melts at 29.76°C)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="liquidDrop" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#a5f3fc"/>
                    <stop offset="50%" stop-color="#06b6d4"/>
                    <stop offset="100%" stop-color="#083344"/>
                </radialGradient>
            </defs>
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(0,240,255,0.2)"/>
            <!-- Container contour -->
            <path d="M 60 40 L 60 140 Q 60 150 70 150 L 250 150 Q 260 150 260 140 L 260 40" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
            <!-- Liquid wave surface -->
            <path d="M 60 85 Q 110 75 160 85 T 260 85 L 260 148 L 60 148 Z" fill="rgba(6,182,212,0.18)"/>
            <!-- Particles -->
            <circle cx="85" cy="115" r="10" fill="url(#liquidDrop)"/>
            <circle cx="115" cy="130" r="10" fill="url(#liquidDrop)"/>
            <circle cx="140" cy="105" r="10" fill="url(#liquidDrop)"/>
            <circle cx="170" cy="125" r="10" fill="url(#liquidDrop)"/>
            <circle cx="200" cy="100" r="10" fill="url(#liquidDrop)"/>
            <circle cx="230" cy="125" r="10" fill="url(#liquidDrop)"/>
            <circle cx="100" cy="95" r="10" fill="url(#liquidDrop)"/>
            <circle cx="180" cy="140" r="10" fill="url(#liquidDrop)"/>
            <!-- Fluid velocity arrows -->
            <path d="M 125 110 Q 135 105 145 110" fill="none" stroke="#67e8f9" stroke-width="1.5" stroke-dasharray="2 2"/>
            <path d="M 185 130 Q 195 125 205 130" fill="none" stroke="#67e8f9" stroke-width="1.5" stroke-dasharray="2 2"/>
            <text x="160" y="168" fill="#67e8f9" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Dynamic Fluid Flow • Short-Range Cohesion</text>
        </svg>`
    },

    'Gas': {
        title: 'Gas State',
        badge: 'State of Matter • Dispersed Phase',
        color: '#f87171',
        definition: 'A state of matter that has neither defined shape nor fixed volume. Gas molecules possess large amounts of kinetic energy, moving randomly at high velocities with vast intermolecular spacing compared to their molecular diameters.',
        characteristics: [
            'Expands spontaneously to fill the entire volume of any container',
            'Highly compressible under pressure',
            'Intermolecular attraction is negligible compared to kinetic energy',
            'Rapid diffusion and continuous chaotic molecular collisions'
        ],
        examples: ['Hydrogen (H₂)', 'Helium (He)', 'Nitrogen (N₂)', 'Oxygen (O₂)', 'Neon (Ne)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="gasSphere" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#fca5a5"/>
                    <stop offset="50%" stop-color="#ef4444"/>
                    <stop offset="100%" stop-color="#450a0a"/>
                </radialGradient>
            </defs>
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(248,113,113,0.2)"/>
            <rect x="50" y="25" width="220" height="120" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
            <!-- Gas particles with velocity vectors -->
            <g>
                <circle cx="85" cy="55" r="7" fill="url(#gasSphere)"/>
                <line x1="85" y1="55" x2="105" y2="40" stroke="#f87171" stroke-width="1.5"/>
                
                <circle cx="160" cy="45" r="7" fill="url(#gasSphere)"/>
                <line x1="160" y1="45" x2="185" y2="60" stroke="#f87171" stroke-width="1.5"/>

                <circle cx="230" cy="70" r="7" fill="url(#gasSphere)"/>
                <line x1="230" y1="70" x2="210" y2="90" stroke="#f87171" stroke-width="1.5"/>

                <circle cx="90" cy="115" r="7" fill="url(#gasSphere)"/>
                <line x1="90" y1="115" x2="110" y2="130" stroke="#f87171" stroke-width="1.5"/>

                <circle cx="150" cy="100" r="7" fill="url(#gasSphere)"/>
                <line x1="150" y1="100" x2="130" y2="80" stroke="#f87171" stroke-width="1.5"/>

                <circle cx="215" cy="120" r="7" fill="url(#gasSphere)"/>
                <line x1="215" y1="120" x2="240" y2="105" stroke="#f87171" stroke-width="1.5"/>
            </g>
            <text x="160" y="165" fill="#fca5a5" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">High Kinetic Energy • Random Molecular Collisions</text>
        </svg>`
    },

    'Unknown': {
        title: 'Unknown / Synthetic Phase',
        badge: 'Synthetic Element • High Z Relativistic State',
        color: '#94a3b8',
        definition: 'Superheavy synthetic elements produced only a few atoms at a time with lifetimes ranging from milliseconds to microseconds. Their macroscopic phase cannot be measured directly, though theoretical calculations suggest relativistic quantum effects alter their expected phase.',
        characteristics: [
            'Produced artificially via heavy-ion fusion reactions in particle accelerators',
            'Extremely short nuclear half-lives prevent macroscopic observation',
            'Strong relativistic electron contraction alters standard periodic trends',
            'Copernicium (Cn) and Flerovium (Fl) are predicted to exhibit volatile semi-gas behavior'
        ],
        examples: ['Oganesson (118 Og)', 'Tennessine (117 Ts)', 'Flerovium (114 Fl)', 'Copernicium (112 Cn)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(148,163,184,0.3)"/>
            <circle cx="160" cy="85" r="42" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>
            <circle cx="160" cy="85" r="24" fill="rgba(148,163,184,0.15)" stroke="#64748b" stroke-width="1.5"/>
            <text x="160" y="93" fill="#cbd5e1" font-size="24" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">?</text>
            <path d="M 90 85 L 115 85" stroke="#94a3b8" stroke-width="2"/>
            <path d="M 230 85 L 205 85" stroke="#94a3b8" stroke-width="2"/>
            <path d="M 160 25 L 160 40" stroke="#94a3b8" stroke-width="2"/>
            <path d="M 160 145 L 160 130" stroke="#94a3b8" stroke-width="2"/>
            <text x="160" y="165" fill="#94a3b8" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Transient Superheavy Nuclei • Relativistic Dirac Regime</text>
        </svg>`
    },

    // =========================================================================
    // 2. SUPER-CATEGORIES & CHEMICAL SERIES
    // =========================================================================
    'Metals': {
        title: 'Metals (Supercategory)',
        badge: 'Supercategory • Conductive Electropositive Elements',
        color: '#00d4ff',
        definition: 'Elements characterized by high electrical and thermal conductivity, lustrous metallic sheen, malleability, and ductility. Their valence electrons are delocalized into a shared "electron sea" surrounding positively charged atomic cores.',
        characteristics: [
            'Delocalized electron sea model allows high electrical & thermal conduction',
            'Malleable (can be hammered into sheets) and ductile (drawn into wires)',
            'Form basic or amphoteric oxides in chemical reactions',
            'Typically high melting and boiling points (except Hg, Ga, Cs)'
        ],
        examples: ['Copper (Cu)', 'Iron (Fe)', 'Aluminium (Al)', 'Titanium (Ti)', 'Gold (Au)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(0,212,255,0.25)"/>
            <!-- Electron Sea -->
            <rect x="50" y="30" width="220" height="110" rx="8" fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.3)"/>
            <!-- Cations -->
            <g fill="#0284c7" stroke="#38bdf8" stroke-width="2">
                <circle cx="85" cy="55" r="14"/><text x="85" y="59" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
                <circle cx="160" cy="55" r="14"/><text x="160" y="59" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
                <circle cx="235" cy="55" r="14"/><text x="235" y="59" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
                <circle cx="85" cy="115" r="14"/><text x="85" y="119" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
                <circle cx="160" cy="115" r="14"/><text x="160" y="119" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
                <circle cx="235" cy="115" r="14"/><text x="235" y="119" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">+</text>
            </g>
            <!-- Delocalized electrons -->
            <g fill="#facc15">
                <circle cx="120" cy="45" r="4"/><circle cx="200" cy="45" r="4"/>
                <circle cx="120" cy="85" r="4"/><circle cx="200" cy="85" r="4"/>
                <circle cx="120" cy="125" r="4"/><circle cx="200" cy="125" r="4"/>
                <circle cx="65" cy="85" r="4"/><circle cx="255" cy="85" r="4"/>
            </g>
            <text x="160" y="165" fill="#38bdf8" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Fixed Metal Cations in Delocalized Electron Sea (e⁻)</text>
        </svg>`
    },

    'Metalloids': {
        title: 'Metalloids (Semimetals)',
        badge: 'Chemical Series • Intermediate Valence Elements',
        color: '#fbbf24',
        definition: 'Elements possessing properties intermediate between metals and nonmetals. They are semiconductors whose electrical conductivity increases with temperature or dopant concentration, forming the foundation of modern solid-state microelectronics.',
        characteristics: [
            'Electrical conductivity increases with temperature (opposite of pure metals)',
            'Brittle and semi-lustrous metallic appearance with intermediate electronegativity',
            'Form amphoteric or weakly acidic oxides',
            'Astatine (85 At) shows dual character: group 17 halogen + relativistic metalloid'
        ],
        examples: ['Silicon (Si)', 'Germanium (Ge)', 'Boron (B)', 'Arsenic (As)', 'Astatine (At - Dual Classified)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(251,191,36,0.25)"/>
            <!-- Energy Band Diagram -->
            <rect x="50" y="110" width="220" height="30" rx="4" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="1.5"/>
            <text x="160" y="128" fill="#e0f2fe" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">Valence Band (Filled)</text>
            
            <rect x="50" y="40" width="220" height="30" rx="4" fill="rgba(251,191,36,0.25)" stroke="#fbbf24" stroke-width="1.5"/>
            <text x="160" y="58" fill="#fef3c7" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">Conduction Band</text>

            <!-- Band gap with arrow -->
            <line x1="160" y1="108" x2="160" y2="72" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3"/>
            <text x="165" y="93" fill="#facc15" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700">Eg ≈ 1.1 eV (Narrow Gap)</text>
            <text x="160" y="165" fill="#fde68a" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Semiconductor Bandgap • Thermal Electron Excitation</text>
        </svg>`
    },

    'Non-Metals': {
        title: 'Non-Metals (Supercategory)',
        badge: 'Supercategory • High Electronegativity Elements',
        color: '#22c55e',
        definition: 'Elements lacking metallic attributes, characterized by high ionization energies and electronegativities. They readily gain or share valence electrons to form covalent bonds or anions, playing central roles in organic chemistry and life.',
        characteristics: [
            'Poor electrical and thermal conductors (high insulators, except graphite carbon)',
            'High ionization energy and electronegativity',
            'Form acidic or neutral oxides (e.g. CO₂, SO₂, NO₂)',
            'Exist across all STP phases: gases (O₂, N₂), liquid (Br₂), and solids (C, P, S)'
        ],
        examples: ['Carbon (C)', 'Oxygen (O)', 'Nitrogen (N)', 'Phosphorus (P)', 'Sulfur (S)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(34,197,94,0.25)"/>
            <!-- Covalent Molecule Cl2 or O2 sharing electrons -->
            <circle cx="120" cy="85" r="42" fill="none" stroke="#22c55e" stroke-width="2"/>
            <circle cx="200" cy="85" r="42" fill="none" stroke="#22c55e" stroke-width="2"/>
            <!-- Shared electron pair in intersection -->
            <circle cx="160" cy="73" r="5" fill="#facc15"/>
            <circle cx="160" cy="97" r="5" fill="#facc15"/>
            <!-- Nuclei -->
            <circle cx="120" cy="85" r="14" fill="#15803d"/>
            <text x="120" y="89" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">O</text>
            <circle cx="200" cy="85" r="14" fill="#15803d"/>
            <text x="200" y="89" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">O</text>
            <text x="160" y="165" fill="#86efac" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Localized Covalent Electron Sharing (Strong Bonds)</text>
        </svg>`
    },

    'Alkali metal': {
        title: 'Alkali Metals (Group 1)',
        badge: 'Group 1 • s¹ Valence Configuration',
        color: '#f97316',
        definition: 'Extremely reactive, soft, silvery metals occupying Group 1 of the periodic table with a single s¹ valence electron. They readily lose this electron to form stable +1 cations, reacting vigorously with water to release hydrogen gas and form basic hydroxides.',
        characteristics: [
            'Very low densities (Lithium, Sodium, Potassium float on water)',
            'React violently with moisture: 2M + 2H₂O → 2MOH + H₂↑',
            'Must be stored under inert mineral oil or argon',
            'Flame test colors: Li (Crimson), Na (Yellow), K (Lilac)'
        ],
        examples: ['Lithium (Li)', 'Sodium (Na)', 'Potassium (K)', 'Rubidium (Rb)', 'Cesium (Cs)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(249,115,22,0.3)"/>
            <circle cx="140" cy="85" r="38" fill="none" stroke="#ea580c" stroke-width="2"/>
            <circle cx="140" cy="85" r="16" fill="#c2410c"/>
            <text x="140" y="90" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">Na⁺</text>
            <!-- Lost valence electron leaving -->
            <path d="M 180 85 Q 215 65 240 85" fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="245" cy="85" r="6" fill="#facc15"/>
            <text x="245" y="70" fill="#facc15" font-size="10" font-weight="bold" text-anchor="middle">e⁻</text>
            <text x="160" y="165" fill="#fdba74" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Rapid Loss of Single Valence Electron (s¹ → [Noble] + e⁻)</text>
        </svg>`
    },

    'Alkaline earth metal': {
        title: 'Alkaline Earth Metals (Group 2)',
        badge: 'Group 2 • s² Valence Configuration',
        color: '#eab308',
        definition: 'Electropositive reactive metals in Group 2 with two valence electrons in their outermost s-subshell (ns²). They readily lose both electrons to achieve noble gas configuration as divalent cations (M²⁺).',
        characteristics: [
            'Divalent cations with +2 oxidation state in all standard compounds',
            'Higher melting points, boiling points, and densities than alkali metals',
            'Magnesium and Calcium are vital structural elements in biology',
            'Radium (Ra) is intensely radioactive with historical luminescent applications'
        ],
        examples: ['Beryllium (Be)', 'Magnesium (Mg)', 'Calcium (Ca)', 'Strontium (Sr)', 'Barium (Ba)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(234,179,8,0.3)"/>
            <circle cx="135" cy="85" r="40" fill="none" stroke="#ca8a04" stroke-width="2"/>
            <circle cx="135" cy="85" r="16" fill="#a16207"/>
            <text x="135" y="90" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">Ca²⁺</text>
            <!-- Two electrons lost -->
            <circle cx="230" cy="65" r="5" fill="#facc15"/><text x="245" y="68" fill="#fef08a" font-size="10">e⁻</text>
            <circle cx="230" cy="105" r="5" fill="#facc15"/><text x="245" y="108" fill="#fef08a" font-size="10">e⁻</text>
            <text x="160" y="165" fill="#fef08a" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Dual Electron Loss forming Divalent Cation (M²⁺)</text>
        </svg>`
    },

    'Transition metal': {
        title: 'Transition Metals (d-block)',
        badge: 'Groups 3–12 • Partially Filled d-Orbitals',
        color: '#6366f1',
        definition: 'Metals that possess partially filled d-orbitals in either their elemental state or common oxidation states. They bridge the electropositive s-block and electronegative p-block, displaying rich variable oxidation states and colorful coordination complexes.',
        characteristics: [
            'Multiple stable oxidation states (e.g. Fe²⁺, Fe³⁺, Mn²⁺ to Mn⁷⁺)',
            'Formation of intensely colored coordination compounds via d-d orbital splitting',
            'High tensile strength, high melting points, and catalytic properties',
            'Paramagnetism due to unpaired d electrons'
        ],
        examples: ['Iron (Fe)', 'Copper (Cu)', 'Platinum (Pt)', 'Titanium (Ti)', 'Chromium (Cr)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(99,102,241,0.3)"/>
            <!-- Crystal field d-orbital splitting (t2g and eg) -->
            <g stroke="#818cf8" stroke-width="2">
                <line x1="80" y1="85" x2="120" y2="85"/>
                <line x1="120" y1="85" x2="170" y2="50"/>
                <line x1="120" y1="85" x2="170" y2="120"/>
                <!-- eg level (upper 2) -->
                <line x1="170" y1="50" x2="230" y2="50"/>
                <!-- t2g level (lower 3) -->
                <line x1="170" y1="120" x2="230" y2="120"/>
            </g>
            <text x="245" y="54" fill="#a5b4fc" font-size="11" font-weight="bold">eg (dx²-y², dz²)</text>
            <text x="245" y="124" fill="#a5b4fc" font-size="11" font-weight="bold">t2g (dxy, dyz, dxz)</text>
            <text x="160" y="165" fill="#c7d2fe" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Crystal Field d-Orbital Splitting • Vivid Colored Complexes</text>
        </svg>`
    },

    'Post-transition metal': {
        title: 'Post-Transition Metals (Poor Metals)',
        badge: 'Groups 13–16 • Completed d-Subshells',
        color: '#0284c7',
        definition: 'Metallic elements positioned between the transition metals and metalloids in the p-block. Their d-orbitals are completely filled, leaving them softer, more ductile, and with lower melting points than transition metals.',
        characteristics: [
            'Lower melting and boiling points compared to transition metals',
            'Relatively high electronegativity for metals and covalent compound tendencies',
            'Inert pair effect leads to oxidation states 2 lower than group number (e.g. Tl⁺, Pb²⁺, Bi³⁺)',
            'Polonium (Po) displays dual post-transition and metalloid behavior'
        ],
        examples: ['Aluminium (Al)', 'Gallium (Ga)', 'Tin (Sn)', 'Lead (Pb)', 'Bismuth (Bi)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(2,132,199,0.3)"/>
            <text x="160" y="45" fill="#38bdf8" font-size="12" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">Inert Pair Relativistic Effect</text>
            <g transform="translate(60, 60)">
                <rect x="0" y="0" width="80" height="40" rx="4" fill="rgba(2,132,199,0.2)" stroke="#0284c7" stroke-width="1.5"/>
                <text x="40" y="24" fill="#bae6fd" font-size="10" text-anchor="middle" font-weight="600">6s² Inert Pair</text>
                <text x="100" y="24" fill="#38bdf8" font-size="14" font-weight="bold">➔</text>
                <rect x="120" y="0" width="80" height="40" rx="4" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" stroke-width="1.5"/>
                <text x="160" y="24" fill="#ffffff" font-size="10" text-anchor="middle" font-weight="700">Pb²⁺ Stable</text>
            </g>
            <text x="160" y="165" fill="#bae6fd" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Relativistic Contraction of Outer s-Electrons</text>
        </svg>`
    },

    'Lanthanide': {
        title: 'Lanthanides (Rare Earth Elements)',
        badge: 'Period 6 • 4f-Subshell Filling (Z=57–71)',
        color: '#8b5cf6',
        definition: 'A series of 15 metallic elements spanning Lanthanum (57) through Lutetium (71) defined by progressive filling of the deep 4f electron subshell. They share very similar chemical properties and dominate high-tech permanent magnets and photonics.',
        characteristics: [
            'Progressive Lanthanide Contraction systematically shrinks ionic radii across the series',
            'Uniform +3 oxidation state dominates aqueous chemistry',
            'Essential for powerful neodymium-iron-boron (NdFeB) permanent magnets',
            'Spectacular sharp 4f-4f electronic transitions utilized in phosphors and lasers'
        ],
        examples: ['Neodymium (Nd)', 'Europium (Eu)', 'Gadolinium (Gd)', 'Lutetium (Lu)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(139,92,246,0.3)"/>
            <!-- Lanthanide contraction curve -->
            <path d="M 60 70 Q 150 95 260 120" fill="none" stroke="#a78bfa" stroke-width="3"/>
            <circle cx="60" cy="70" r="16" fill="#6d28d9" stroke="#c4b5fd" stroke-width="1.5"/>
            <text x="60" y="74" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">La³⁺ 103pm</text>
            <circle cx="260" cy="120" r="11" fill="#6d28d9" stroke="#c4b5fd" stroke-width="1.5"/>
            <text x="260" y="124" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle">Lu³⁺ 86pm</text>
            <text x="160" y="165" fill="#ddd6fe" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Lanthanide Contraction • Poor 4f Nuclear Shielding</text>
        </svg>`
    },

    'Actinide': {
        title: 'Actinides (Transuranics)',
        badge: 'Period 7 • 5f-Subshell Filling (Z=89–103)',
        color: '#ec4899',
        definition: 'A family of 15 radioactive heavy elements spanning Actinium (89) through Lawrencium (103) where the 5f subshell is progressively filled. All isotopes of all actinides are inherently radioactive, with Thorium and Uranium being primordial.',
        characteristics: [
            'All actinides are radioactive with spontaneous decay or fission pathways',
            '5f electrons extend further radially than 4f, allowing variable oxidation states (+3 to +7)',
            'Uranium-235 and Plutonium-239 sustain nuclear fission chain reactions',
            'Americium-241 powers household ionizing smoke detectors'
        ],
        examples: ['Thorium (Th)', 'Uranium (U)', 'Plutonium (Pu)', 'Americium (Am)', 'Curium (Cm)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(236,72,153,0.3)"/>
            <circle cx="160" cy="85" r="32" fill="#831843" stroke="#ec4899" stroke-width="2"/>
            <text x="160" y="82" fill="#fff" font-size="11" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">²³⁵U</text>
            <text x="160" y="96" fill="#fbcfe8" font-size="9" text-anchor="middle">Z=92</text>
            <!-- Fission arrows -->
            <path d="M 120 75 L 70 45" stroke="#f472b6" stroke-width="2" marker-end="url(#arrowhead)"/>
            <path d="M 200 75 L 250 45" stroke="#f472b6" stroke-width="2" marker-end="url(#arrowhead)"/>
            <text x="60" y="40" fill="#f472b6" font-size="9" font-weight="700">¹⁴¹Ba</text>
            <text x="260" y="40" fill="#f472b6" font-size="9" font-weight="700">⁹²Kr</text>
            <text x="160" y="165" fill="#fbcfe8" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Induced & Spontaneous Fission • 5f Radial Extension</text>
        </svg>`
    },

    'Other nonmetal': {
        title: 'Reactive Nonmetals (Biogenic Elements)',
        badge: 'Groups 14–16 • Nonmetallic Main-Group',
        color: '#16a34a',
        definition: 'Electronegative nonmetals encompassing the organic life elements (C, N, O, P, S, Se). They exhibit diverse allotropes (like graphite vs diamond in carbon) and form strong covalent networks essential for biochemical macromolecules.',
        characteristics: [
            'Foundational building blocks of proteins, nucleic acids (DNA/RNA), and lipids',
            'Display vast allotropy (e.g. O₂ dioxygen vs O₃ ozone; red vs white phosphorus)',
            'High electronegativity with strong tendency to form acidic oxides',
            'Crucial in life metabolism: cellular respiration (O₂), photosynthesis (CO₂)'
        ],
        examples: ['Carbon (C)', 'Nitrogen (N)', 'Oxygen (O)', 'Phosphorus (P)', 'Sulfur (S)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(22,163,74,0.3)"/>
            <!-- Benzene / Carbon Ring Backbone -->
            <polygon points="160,45 195,65 195,105 160,125 125,105 125,65" fill="none" stroke="#22c55e" stroke-width="2.5"/>
            <circle cx="160" cy="85" r="22" fill="none" stroke="#86efac" stroke-width="1.5" stroke-dasharray="3 3"/>
            <text x="160" y="89" fill="#fff" font-size="12" font-weight="900" text-anchor="middle">C₆</text>
            <text x="160" y="165" fill="#86efac" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Organic Backbone • Covalent Delocalized pi-Bonding</text>
        </svg>`
    },

    'Halogen': {
        title: 'Halogens (Group 17)',
        badge: 'Group 17 • p⁵ Valence Configuration',
        color: '#06b6d4',
        definition: 'Highly reactive nonmetallic elements with seven valence electrons (s² p⁵) that require only one additional electron to complete an octet. They form salts (halides) with metals and exhibit all three fundamental states of matter at room temperature.',
        characteristics: [
            'Highest electronegativities on the table (Fluorine = 3.98 Pauling)',
            'Exist as diatomic molecules: F₂ (gas), Cl₂ (gas), Br₂ (liquid), I₂ (solid)',
            'React violently with alkali metals to produce crystalline halide salts (e.g. NaCl)',
            'Astatine (85 At) shows dual character: group 17 halogen + relativistic metalloid'
        ],
        examples: ['Fluorine (F)', 'Chlorine (Cl)', 'Bromine (Br)', 'Iodine (I)', 'Astatine (At - Dual Classified)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(6,182,212,0.3)"/>
            <!-- Diatomic molecule Cl2 with single bond -->
            <circle cx="115" cy="85" r="32" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" stroke-width="2"/>
            <text x="115" y="90" fill="#cffafe" font-size="14" font-weight="bold" text-anchor="middle">Cl</text>
            <circle cx="205" cy="85" r="32" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" stroke-width="2"/>
            <text x="205" y="90" fill="#cffafe" font-size="14" font-weight="bold" text-anchor="middle">Cl</text>
            <line x1="147" y1="85" x2="173" y2="85" stroke="#22d3ee" stroke-width="3"/>
            <text x="160" y="165" fill="#a5f3fc" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Diatomic Covalent Pair (X₂) • One Electron Short of Octet</text>
        </svg>`
    },

    'Noble gas': {
        title: 'Noble Gases (Group 18)',
        badge: 'Group 18 • Full Valence Octet (s² p⁶)',
        color: '#a855f7',
        definition: 'Odorless, colorless, monatomic gases in Group 18 possessing completely filled outer valence electron shells (octet s² p⁶, except Helium 1s²). Because of their zero electron affinity and exceptionally high ionization energies, they are chemically inert.',
        characteristics: [
            'Extremely unreactive monatomic gases with very weak London dispersion forces',
            'Lowest boiling and melting points of any element groups (Helium never solidifies at 1 atm)',
            'Distinctive glowing gas-discharge emission spectra: Ne (Red-Orange), Ar (Violet), He (Gold)',
            'Xenon and Krypton can form true chemical compounds with fluorine and oxygen (e.g. XeF₄)'
        ],
        examples: ['Helium (He)', 'Neon (Ne)', 'Argon (Ar)', 'Krypton (Kr)', 'Xenon (Xe)', 'Radon (Rn)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(168,85,247,0.3)"/>
            <circle cx="160" cy="85" r="42" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="2"/>
            <circle cx="160" cy="85" r="16" fill="#7e22ce"/>
            <text x="160" y="90" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">Ne</text>
            <!-- 8 octet valence electrons -->
            <circle cx="160" cy="43" r="4.5" fill="#d8b4fe"/><circle cx="160" cy="127" r="4.5" fill="#d8b4fe"/>
            <circle cx="118" cy="85" r="4.5" fill="#d8b4fe"/><circle cx="202" cy="85" r="4.5" fill="#d8b4fe"/>
            <circle cx="130" cy="55" r="4.5" fill="#d8b4fe"/><circle cx="190" cy="55" r="4.5" fill="#d8b4fe"/>
            <circle cx="130" cy="115" r="4.5" fill="#d8b4fe"/><circle cx="190" cy="115" r="4.5" fill="#d8b4fe"/>
            <text x="160" y="165" fill="#e9d5ff" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Closed Full Valence Octet (s² p⁶) • Chemical Inertness</text>
        </svg>`
    },

    // =========================================================================
    // 3. ORBITAL BLOCKS (s, p, d, f) & AUFBAU EXCEPTIONS
    // =========================================================================
    's-block': {
        title: 's-Block Orbitals',
        badge: 'Orbital Subshell • Spherical Symmetry (l=0)',
        color: '#00d4ff',
        definition: 'Elements whose outermost highest-energy electron occupies an s-orbital. The s-subshell has azimuthal quantum number l=0, corresponding to a single spherically symmetrical orbital holding a maximum of 2 electrons.',
        characteristics: [
            'Includes Group 1 (Alkali metals), Group 2 (Alkaline earth metals), plus Hydrogen and Helium',
            'Spherically symmetrical electron density with zero angular nodes',
            'Strongly electropositive; forms ionic bonds readily',
            'High chemical reactivity and lowest first ionization energies'
        ],
        examples: ['Hydrogen (1s¹)', 'Helium (1s²)', 'Sodium ([Ne] 3s¹)', 'Calcium ([Ar] 4s²)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(0,212,255,0.3)"/>
            <circle cx="160" cy="85" r="45" fill="rgba(0,212,255,0.22)" stroke="#00d4ff" stroke-width="2"/>
            <circle cx="160" cy="85" r="28" fill="rgba(0,212,255,0.35)" stroke="#38bdf8" stroke-width="1.5"/>
            <circle cx="160" cy="85" r="4" fill="#ffffff"/>
            <text x="160" y="165" fill="#7dd3fc" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Spherically Symmetrical • l=0 • Max 2 Electrons</text>
        </svg>`
    },

    'p-block': {
        title: 'p-Block Orbitals',
        badge: 'Orbital Subshell • Dumbbell Geometry (l=1)',
        color: '#22c55e',
        definition: 'Elements where valence electrons occupy p-orbitals (l=1). A p-subshell comprises three mutually orthogonal dumbbell-shaped orbitals (px, py, pz) aligned along the Cartesian axes, holding a maximum of 6 electrons.',
        characteristics: [
            'Includes Groups 13 to 18; only block containing metals, metalloids, and nonmetals',
            'Dumbbell-shaped lobes with a planar nodal plane passing through the nucleus',
            'Capable of directional sigma (σ) and pi (π) bonding',
            'Determines organic molecular geometries (sp³, sp², sp hybridization)'
        ],
        examples: ['Carbon (2p²)', 'Nitrogen (2p³)', 'Oxygen (2p⁴)', 'Neon (2p⁶)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(34,197,94,0.3)"/>
            <!-- Dumbbell lobes px -->
            <ellipse cx="120" cy="85" rx="30" ry="18" fill="rgba(34,197,94,0.35)" stroke="#22c55e" stroke-width="1.5"/>
            <ellipse cx="200" cy="85" rx="30" ry="18" fill="rgba(34,197,94,0.35)" stroke="#22c55e" stroke-width="1.5"/>
            <line x1="60" y1="85" x2="260" y2="85" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
            <line x1="160" y1="25" x2="160" y2="145" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
            <circle cx="160" cy="85" r="3" fill="#fff"/>
            <text x="160" y="165" fill="#86efac" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Dumbbell Lobes • 1 Nodal Plane • Max 6 Electrons (px, py, pz)</text>
        </svg>`
    },

    'd-block': {
        title: 'd-Block Orbitals',
        badge: 'Orbital Subshell • Cloverleaf Geometry (l=2)',
        color: '#6366f1',
        definition: 'Elements where incoming electrons fill the (n-1)d subshell. With azimuthal quantum number l=2, there are 5 d-orbitals (dxy, dyz, dxz, dx²-y², dz²) accommodating up to 10 electrons and forming transition metal chemistry.',
        characteristics: [
            'Encompasses Groups 3 to 12 (Transition Metals)',
            'Four cloverleaf shapes with two angular nodal cones plus a toroidal dz² donut',
            'Splits under electrostatic crystal fields into t2g and eg energy levels',
            'Enables multiple stable oxidation states and catalytic coordination sites'
        ],
        examples: ['Titanium (3d²)', 'Iron (3d⁶)', 'Nickel (3d⁸)', 'Zinc (3d¹⁰)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(99,102,241,0.3)"/>
            <!-- Cloverleaf 4 lobes -->
            <g fill="rgba(99,102,241,0.4)" stroke="#818cf8" stroke-width="1.5">
                <ellipse cx="130" cy="55" rx="22" ry="14" transform="rotate(-45 130 55)"/>
                <ellipse cx="190" cy="55" rx="22" ry="14" transform="rotate(45 190 55)"/>
                <ellipse cx="130" cy="115" rx="22" ry="14" transform="rotate(45 130 115)"/>
                <ellipse cx="190" cy="115" rx="22" ry="14" transform="rotate(-45 190 115)"/>
            </g>
            <circle cx="160" cy="85" r="3" fill="#fff"/>
            <text x="160" y="165" fill="#a5b4fc" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Four-Lobed Cloverleaf • 2 Nodal Planes • Max 10 Electrons</text>
        </svg>`
    },

    'f-block': {
        title: 'f-Block Orbitals',
        badge: 'Orbital Subshell • Multi-Lobed Geometry (l=3)',
        color: '#a855f7',
        definition: 'Elements with valence electrons filling (n-2)f subshells (Lanthanides and Actinides). With azimuthal quantum number l=3, there are 7 complex multi-lobed f-orbitals accommodating up to 14 electrons.',
        characteristics: [
            'Includes Lanthanide (4f) and Actinide (5f) series',
            'Seven distinct spatial orbitals with three angular nodal surfaces each',
            'Deeply buried inside outer valence shells, shielding them from chemical environments',
            'Provides the physical basis for rare-earth supermagnets and phosphors'
        ],
        examples: ['Cerium (4f¹)', 'Neodymium (4f⁴)', 'Europium (4f⁷)', 'Uranium (5f³)', 'Plutonium (5f⁶)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(168,85,247,0.3)"/>
            <!-- Multi-lobed rosette -->
            <g fill="rgba(168,85,247,0.55)" stroke="#c084fc" stroke-width="1">
                <circle cx="135" cy="65" r="16"/><circle cx="185" cy="65" r="16"/>
                <circle cx="135" cy="105" r="16"/><circle cx="185" cy="105" r="16"/>
                <circle cx="160" cy="50" r="13"/><circle cx="160" cy="120" r="13"/>
            </g>
            <circle cx="160" cy="85" r="3" fill="#fff"/>
            <text x="160" y="165" fill="#d8b4fe" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Multi-Lobed Rosette • 3 Nodal Planes • Max 14 Electrons</text>
        </svg>`
    },

    'Exceptions': {
        title: 'Aufbau Electron Exceptions',
        badge: 'Quantum Chemistry • Exchange Energy & Subshell Stability',
        color: '#ef4444',
        definition: 'Elements that deviate from the standard Madelung Aufbau (n+l) rule because half-filled (d⁵, f⁷) and completely filled (d¹⁰, f¹⁴) subshells possess heightened thermodynamic stability from electron exchange energy and minimized inter-electronic repulsion.',
        characteristics: [
            'Chromium ([Ar] 3d⁵ 4s¹) and Copper ([Ar] 3d¹⁰ 4s¹) promote one 4s electron to 3d',
            'Palladium ([Kr] 4d¹⁰ 5s⁰) promotes both 5s electrons to achieve a closed 4d shell',
            'Occurs primarily in d-block (transition metals) and f-block (lanthanides/actinides)',
            'Driven by exchange energy stabilization (K) proportional to n(n-1)/2 parallel electron spins'
        ],
        examples: ['Chromium (24 Cr)', 'Copper (29 Cu)', 'Palladium (46 Pd)', 'Silver (47 Ag)', 'Gold (79 Au)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(239,68,68,0.35)"/>
            <text x="160" y="30" fill="#f87171" font-size="12" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">Chromium (Z=24): [Ar] 3d⁵ 4s¹</text>
            <g transform="translate(45, 55)">
                <!-- 4s box -->
                <rect x="0" y="15" width="30" height="30" fill="rgba(0,212,255,0.15)" stroke="#00d4ff" stroke-width="1.5" rx="3"/>
                <text x="15" y="60" fill="#94a3b8" font-size="10" text-anchor="middle" font-weight="600">4s</text>
                <text x="15" y="36" fill="#fff" font-size="16" font-weight="900" text-anchor="middle">&#x21BF;</text>
                <!-- Arrow transferring -->
                <path d="M 35 25 Q 50 5 65 25" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 2"/>
                <!-- 3d boxes (5 boxes) -->
                <g transform="translate(70, 15)">
                    <rect x="0" y="0" width="28" height="30" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5" rx="2"/>
                    <text x="14" y="21" fill="#fff" font-size="14" font-weight="900" text-anchor="middle">&#x21BF;</text>
                    <rect x="30" y="0" width="28" height="30" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5" rx="2"/>
                    <text x="44" y="21" fill="#fff" font-size="14" font-weight="900" text-anchor="middle">&#x21BF;</text>
                    <rect x="60" y="0" width="28" height="30" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5" rx="2"/>
                    <text x="74" y="21" fill="#fff" font-size="14" font-weight="900" text-anchor="middle">&#x21BF;</text>
                    <rect x="90" y="0" width="28" height="30" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1.5" rx="2"/>
                    <text x="104" y="21" fill="#fff" font-size="14" font-weight="900" text-anchor="middle">&#x21BF;</text>
                    <rect x="120" y="0" width="28" height="30" fill="rgba(239,68,68,0.35)" stroke="#ef4444" stroke-width="2" rx="2"/>
                    <text x="134" y="21" fill="#fbbf24" font-size="14" font-weight="900" text-anchor="middle">&#x21BF;</text>
                    <text x="74" y="45" fill="#fca5a5" font-size="10" text-anchor="middle" font-weight="700">3d⁵ (Half-Filled Stable)</text>
                </g>
            </g>
            <text x="160" y="165" fill="#fca5a5" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Symmetrical Exchange Stability • 20 Anomalous Elements</text>
        </svg>`
    },

    // =========================================================================
    // 4. NUCLEAR STABILITY & RADIOACTIVE DECAY MODES
    // =========================================================================
    'Stable': {
        title: 'Stable Nuclides',
        badge: 'Nuclear Stability • Valley of Stability',
        color: '#10b981',
        definition: 'Nuclides whose nuclear binding energy per nucleon is high enough that they do not undergo spontaneous radioactive decay. They reside firmly within the "Valley of Stability" where strong attractive nuclear forces cleanly counter electrostatic proton repulsion.',
        characteristics: [
            'Half-life is effectively infinite or far exceeds the age of the Universe',
            '252 naturally occurring stable nuclides known to science',
            'Lead-208 (²⁰⁸Pb) is the heaviest known stable nuclide (doubly magic)',
            'Stable light elements have neutron-to-proton ratio N/Z ≈ 1.0; heavy stable elements reach N/Z ≈ 1.5'
        ],
        examples: ['Carbon-12 (¹²C)', 'Oxygen-16 (¹⁶O)', 'Iron-56 (⁵⁶Fe)', 'Lead-208 (²⁰⁸Pb)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(16,185,129,0.3)"/>
            <circle cx="160" cy="85" r="34" fill="#065f46" stroke="#10b981" stroke-width="2"/>
            <text x="160" y="85" fill="#fff" font-size="12" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">⁵⁶₂₆Fe</text>
            <text x="160" y="100" fill="#6ee7b7" font-size="9" text-anchor="middle">Max Binding Energy</text>
            <circle cx="160" cy="85" r="48" fill="none" stroke="rgba(16,185,129,0.4)" stroke-width="1.5" stroke-dasharray="4 3"/>
            <text x="160" y="165" fill="#6ee7b7" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Balanced Nuclear Binding • Zero Spontaneous Decay</text>
        </svg>`
    },

    'Radioactive': {
        title: 'Radioisotopes & Nuclear Instability',
        badge: 'Nuclear Physics • Spontaneous Radioactive Decay',
        color: '#ef4444',
        definition: 'Nuclides possessing an imbalance between protons and neutrons or excess nuclear excitation energy, causing them to spontaneously transform towards the Valley of Stability by emitting ionizing radiation (α, β⁻, β⁺, γ, or nucleons).',
        characteristics: [
            'Characterized by a unique radioactive half-life (t₁/₂), ranging from fractions of a nanosecond to billions of years',
            'Over 2,900 identified radioisotopes across the nuclide chart',
            'All elements with atomic number Z ≥ 83 (Bismuth onward) have exclusively radioactive isotopes',
            'Vital in medicine (cancer radiotherapy, radiotracers), archaeology, astrophysics, and clean energy'
        ],
        examples: ['Uranium-235 (t₁/₂ = 704M yrs)', 'Carbon-14 (t₁/₂ = 5,730 yrs)', 'Technetium-99m (t₁/₂ = 6 hrs)', 'Cobalt-60 (t₁/₂ = 5.27 yrs)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(239,68,68,0.3)"/>
            <circle cx="160" cy="85" r="32" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
            <text x="160" y="85" fill="#fff" font-size="13" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">☢️</text>
            <text x="160" y="100" fill="#fca5a5" font-size="8" text-anchor="middle">Unstable Parent</text>
            <g stroke="#f59e0b" stroke-width="1.5">
                <line x1="120" y1="60" x2="70" y2="35"/>
                <line x1="200" y1="60" x2="250" y2="35"/>
                <line x1="120" y1="110" x2="70" y2="135"/>
                <line x1="200" y1="110" x2="250" y2="135"/>
            </g>
            <text x="55" y="30" fill="#f59e0b" font-size="9" font-family="'IBM Plex Mono', monospace" font-weight="700">α</text>
            <text x="260" y="30" fill="#60a5fa" font-size="9" font-family="'IBM Plex Mono', monospace" font-weight="700">β⁻</text>
            <text x="55" y="145" fill="#c084fc" font-size="9" font-family="'IBM Plex Mono', monospace" font-weight="700">γ</text>
            <text x="260" y="145" fill="#22d3ee" font-size="9" font-family="'IBM Plex Mono', monospace" font-weight="700">β⁺</text>
            <text x="160" y="165" fill="#fca5a5" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Exponential Decay • N(t) = N₀ · e^(-λt)</text>
        </svg>`
    },

    'Alpha': {
        title: 'Alpha (α) Decay',
        badge: 'Nuclear Physics • Particle Ejection',
        color: '#facc15',
        definition: 'A radioactive decay process where an unstable heavy atomic nucleus ejects an alpha particle consisting of two protons and two neutrons (a helium-4 nucleus, ⁴₂He²⁺). This decreases the parent atomic number Z by 2 and mass number A by 4.',
        characteristics: [
            'Nuclear transformation: ᴬ_Z X → ᴬ⁻⁴_(Z-2) Y + ⁴₂He²⁺',
            'Common in heavy nuclei above Lead (Z > 82)',
            'High ionization energy but low penetration depth (stopped by paper or skin)',
            'Basis of smoke detectors (Americium-241) and RTG space generators (Plutonium-238)'
        ],
        examples: ['Uranium-238 → Thorium-234 + α', 'Radium-226 → Radon-222 + α', 'Polonium-210 → Lead-206 + α'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(250,204,21,0.3)"/>
            <circle cx="110" cy="85" r="32" fill="#78350f" stroke="#facc15" stroke-width="2"/>
            <text x="110" y="85" fill="#fff" font-size="12" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">²³⁸U</text>
            <text x="110" y="100" fill="#fde68a" font-size="9" text-anchor="middle">Z=92</text>
            <line x1="145" y1="85" x2="225" y2="85" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3"/>
            <g transform="translate(235, 75)">
                <circle cx="8" cy="8" r="7" fill="#ef4444"/>
                <circle cx="18" cy="8" r="7" fill="#3b82f6"/>
                <circle cx="8" cy="18" r="7" fill="#3b82f6"/>
                <circle cx="18" cy="18" r="7" fill="#ef4444"/>
            </g>
            <text x="250" y="112" fill="#facc15" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">⁴₂He²⁺ (α)</text>
            <text x="160" y="165" fill="#fef08a" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Emission of ⁴₂He Nucleus • Z decreases by 2, A by 4</text>
        </svg>`
    },

    'Beta-minus': {
        title: 'Beta-Minus (β⁻) Decay',
        badge: 'Nuclear Physics • Weak Nuclear Force',
        color: '#38bdf8',
        definition: 'A radioactive decay in neutron-rich nuclei where a down-quark in a neutron transforms into an up-quark via the weak interaction, converting the neutron into a proton and emitting a high-speed electron (β⁻ particle) and an electron antineutrino (ν̄_e).',
        characteristics: [
            'Nuclear transformation: n → p + e⁻ + ν̄_e',
            'Atomic number Z increases by 1; mass number A remains unchanged',
            'Occurs when the neutron-to-proton ratio (N/Z) is too high for stability',
            'Moderate penetration power; stopped by a thin sheet of aluminium'
        ],
        examples: ['Carbon-14 → Nitrogen-14 + β⁻ (radiocarbon dating)', 'Tritium (³H) → ³He + β⁻', 'Iodine-131 → Xenon-131 + β⁻'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(56,189,248,0.3)"/>
            <circle cx="100" cy="85" r="28" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
            <text x="100" y="85" fill="#e0f2fe" font-size="11" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">¹⁴₆C</text>
            <text x="100" y="98" fill="#bae6fd" font-size="8" text-anchor="middle">8 neutrons</text>
            <line x1="135" y1="75" x2="220" y2="55" stroke="#38bdf8" stroke-width="2"/>
            <circle cx="225" cy="55" r="5" fill="#38bdf8"/>
            <text x="245" y="58" fill="#38bdf8" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700">e⁻ (β⁻)</text>
            <line x1="135" y1="95" x2="220" y2="115" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3 2"/>
            <text x="245" y="118" fill="#c084fc" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700">ν̄_e</text>
            <text x="160" y="165" fill="#bae6fd" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Neutron → Proton • Z increases by 1, A unchanged</text>
        </svg>`
    },

    'Beta-plus': {
        title: 'Beta-Plus (β⁺) Decay & Electron Capture',
        badge: 'Nuclear Physics • Positron Emission',
        color: '#c084fc',
        definition: 'A decay mode in proton-rich nuclei where a proton transforms into a neutron, ejecting a positron (e⁺, the antimatter counterpart of an electron) and an electron neutrino (ν_e), or capturing an inner orbital atomic electron (EC).',
        characteristics: [
            'Nuclear transformation: p → n + e⁺ + ν_e',
            'Atomic number Z decreases by 1; mass number A remains unchanged',
            'Ejected positron annihilates instantly upon colliding with an electron, emitting two 511 keV gamma rays',
            'Foundation of medical Positron Emission Tomography (PET imaging)'
        ],
        examples: ['Fluorine-18 → Oxygen-18 + e⁺ (clinical PET tracer)', 'Carbon-11 → Boron-11 + e⁺', 'Potassium-40 → Argon-40 (via Electron Capture)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(192,132,252,0.3)"/>
            <circle cx="100" cy="85" r="28" fill="#7e22ce" stroke="#c084fc" stroke-width="2"/>
            <text x="100" y="85" fill="#f3e8ff" font-size="11" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">¹⁸₉F</text>
            <text x="100" y="98" fill="#e9d5ff" font-size="8" text-anchor="middle">9 protons</text>
            <line x1="135" y1="75" x2="220" y2="55" stroke="#c084fc" stroke-width="2"/>
            <circle cx="225" cy="55" r="5" fill="#c084fc"/>
            <text x="245" y="58" fill="#c084fc" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700">e⁺ (β⁺)</text>
            <text x="160" y="165" fill="#f3e8ff" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Proton → Neutron • Z decreases by 1 • PET Imaging</text>
        </svg>`
    },

    'Spontaneous fission': {
        title: 'Spontaneous Fission (SF)',
        badge: 'Nuclear Physics • Heavy Fragmentation',
        color: '#f87171',
        definition: 'A form of radioactive decay found only in very heavy nuclei (such as Californium-252) where the nucleus quantum-mechanically tunnels through the fission barrier without external bombardment, splitting spontaneously into two lighter daughter nuclei and 2 to 4 prompt neutrons.',
        characteristics: [
            'Spontaneous splitting without requiring incident neutron capture',
            'Releases massive kinetic energy (~200 MeV per fission event)',
            'Emits multiple high-energy prompt neutrons',
            'Used as reliable portable neutron sources for startup of nuclear reactors and contraband detection'
        ],
        examples: ['Californium-252 (3.1% SF branch)', 'Plutonium-240', 'Curium-250', 'Fermium-256'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(248,113,113,0.3)"/>
            <circle cx="95" cy="85" r="22" fill="#991b1b" stroke="#f87171" stroke-width="2"/>
            <text x="95" y="89" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">²⁵²Cf</text>
            <path d="M120 78 L200 48" stroke="#f87171" stroke-width="2"/>
            <circle cx="215" cy="42" r="14" fill="#b91c1c" stroke="#fca5a5" stroke-width="1.5"/>
            <text x="215" y="46" fill="#fff" font-size="9" text-anchor="middle">¹⁴⁰Xe</text>
            <path d="M120 92 L200 122" stroke="#f87171" stroke-width="2"/>
            <circle cx="215" cy="128" r="14" fill="#b91c1c" stroke="#fca5a5" stroke-width="1.5"/>
            <text x="215" y="132" fill="#fff" font-size="9" text-anchor="middle">¹⁰⁸Ru</text>
            <!-- Prompt neutrons -->
            <circle cx="170" cy="80" r="3.5" fill="#facc15"/><text x="180" y="83" fill="#fde047" font-size="9">3-4 n⁰</text>
            <text x="160" y="165" fill="#fca5a5" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Spontaneous Quantum Tunneling Split • Heavy Daughter Fragments</text>
        </svg>`
    },

    'Proton': {
        title: 'Proton (p) Emission',
        badge: 'Nuclear Physics • Proton Drip Line Decay',
        color: '#fb923c',
        definition: 'A rare radioactive decay mode where an extremely proton-rich nucleus beyond the proton drip line spontaneously ejects a free proton (¹₁p). This decreases atomic number Z by 1 and mass number A by 1 without emission of a beta particle.',
        characteristics: [
            'Nuclear transformation: ᴬ_Z X → ᴬ⁻¹_(Z-1) Y + ¹₁p',
            'Occurs only in synthetic isotopes on the extreme proton drip line',
            'Proton tunnels through the electrostatic Coulomb barrier with half-lives down to microseconds',
            'Direct probe of single-particle nuclear wavefunctions and shell structure'
        ],
        examples: ['Cobalt-53m (isomer proton emission)', 'Lutetium-151 → Ytterbium-150 + p', 'Thulium-147 → Erbium-146 + p'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(251,146,60,0.3)"/>
            <circle cx="100" cy="85" r="28" fill="#7c2d12" stroke="#fb923c" stroke-width="2"/>
            <text x="100" y="85" fill="#fff" font-size="11" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">¹⁵¹Lu</text>
            <text x="100" y="98" fill="#fdba74" font-size="8" text-anchor="middle">Z=71</text>
            <line x1="135" y1="85" x2="215" y2="85" stroke="#fb923c" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="230" cy="85" r="9" fill="#ea580c" stroke="#fed7aa" stroke-width="1.5"/>
            <text x="230" y="89" fill="#fff" font-size="9" font-weight="900" text-anchor="middle">p⁺</text>
            <text x="230" y="112" fill="#fb923c" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">¹₁p Emission</text>
            <text x="160" y="165" fill="#fed7aa" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Proton Drip Line • Z decreases by 1, A by 1</text>
        </svg>`
    },

    'Neutron': {
        title: 'Neutron (n) Emission',
        badge: 'Nuclear Physics • Neutron Drip Line Decay',
        color: '#2dd4bf',
        definition: 'A decay mode found in extremely neutron-rich isotopes where an unbound or highly excited nucleus spontaneously ejects a free neutron (¹₀n). This leaves the atomic number Z unchanged while mass number A decreases by 1.',
        characteristics: [
            'Nuclear transformation: ᴬ_Z X → ᴬ⁻¹_Z X + ¹₀n',
            'No Coulomb barrier inhibits neutron ejection; takes place in ~10⁻²² seconds once unbound',
            'Crucial in nuclear fission reactors as delayed neutrons for safe reactor control (Beryllium-13, Helium-5)',
            'Marks the astrophysical r-process limit and neutron star crust physics'
        ],
        examples: ['Beryllium-13 → Beryllium-12 + n', 'Helium-5 → Helium-4 + n', 'Krypton-87 (delayed neutron emission)'],
        svg: `<svg viewBox="0 0 320 180" class="concept-svg" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="180" rx="10" fill="#090e1a" stroke="rgba(45,212,191,0.3)"/>
            <circle cx="100" cy="85" r="28" fill="#134e4a" stroke="#2dd4bf" stroke-width="2"/>
            <text x="100" y="85" fill="#fff" font-size="11" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">⁵He</text>
            <text x="100" y="98" fill="#99f6e4" font-size="8" text-anchor="middle">Unbound</text>
            <line x1="135" y1="85" x2="215" y2="85" stroke="#2dd4bf" stroke-width="2" stroke-dasharray="3 3"/>
            <circle cx="230" cy="85" r="9" fill="#0f766e" stroke="#5eead4" stroke-width="1.5"/>
            <text x="230" y="89" fill="#fff" font-size="9" font-weight="900" text-anchor="middle">n⁰</text>
            <text x="230" y="112" fill="#2dd4bf" font-size="10" font-family="'IBM Plex Mono', monospace" font-weight="700" text-anchor="middle">¹₀n Emission</text>
            <text x="160" y="165" fill="#99f6e4" font-size="10" font-family="'IBM Plex Mono', monospace" text-anchor="middle" font-weight="600">Zero Coulomb Barrier • Z unchanged, A decreases by 1</text>
        </svg>`
    }
};

/**
 * Universal Long-Press & Tap Binder
 * Dispatches onLongPress when held >= 450ms (with haptic feedback on mobile)
 * Dispatches onClick when tapped < 450ms without moving > 12px
 * Prevents ghost click collisions between touch and mouse
 */
window.bindLongPress = function(el, onLongPress, onClick, longPressDuration = 450) {
    if (!el) return;
    let timer = null;
    let isLongPress = false;
    let startX = 0, startY = 0;
    let touchActive = false;

    function cancelTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    // Touch events for mobile
    el.addEventListener('touchstart', (e) => {
        touchActive = true;
        isLongPress = false;
        if (e.touches && e.touches[0]) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
        cancelTimer();
        timer = setTimeout(() => {
            isLongPress = true;
            if (window.NativeServices?.Haptics) {
                window.NativeServices.Haptics.impact('MEDIUM');
            }
            if (typeof onLongPress === 'function') {
                onLongPress(el, e);
            }
        }, longPressDuration);
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
        if (!timer) return;
        if (e.touches && e.touches[0]) {
            const dist = Math.hypot(e.touches[0].clientX - startX, e.touches[0].clientY - startY);
            if (dist > 12) {
                cancelTimer();
            }
        }
    }, { passive: true });

    el.addEventListener('touchend', (e) => {
        cancelTimer();
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            // Normal fast tap
            e.preventDefault();
            e.stopPropagation();
            if (typeof onClick === 'function') {
                onClick(el, e);
            }
        }
        setTimeout(() => { touchActive = false; }, 300);
    }, { passive: false });

    el.addEventListener('touchcancel', () => {
        cancelTimer();
        touchActive = false;
        isLongPress = false;
    });

    // Mouse events for desktop/browser
    el.addEventListener('mousedown', (e) => {
        if (touchActive) return;
        if (e.button !== 0) return;
        isLongPress = false;
        startX = e.clientX;
        startY = e.clientY;
        cancelTimer();
        timer = setTimeout(() => {
            isLongPress = true;
            if (typeof onLongPress === 'function') {
                onLongPress(el, e);
            }
        }, longPressDuration);
    });

    el.addEventListener('mousemove', (e) => {
        if (touchActive || !timer) return;
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 12) cancelTimer();
    });

    el.addEventListener('mouseup', (e) => {
        if (touchActive) return;
        cancelTimer();
    });

    el.addEventListener('click', (e) => {
        if (touchActive) return;
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            isLongPress = false;
            return;
        }
        if (typeof onClick === 'function') {
            onClick(el, e);
        }
    });
};

/**
 * Open Legend Concept Inspector Modal
 */
window.openLegendConceptModal = function(key, type = 'category') {
    const modal = document.getElementById('legend-concept-modal');
    if (!modal) return;

    let concept = window.LEGEND_CONCEPTS[key];
    if (!concept) {
        // Alias mapping
        const aliases = {
            's': 's-block',
            'p': 'p-block',
            'd': 'd-block',
            'f': 'f-block',
            'exception': 'Exceptions',
            'Exceptions': 'Exceptions',
            'Exceptions (20)': 'Exceptions',
            'Alpha': 'Alpha',
            'Beta-': 'Beta-minus',
            'Beta+': 'Beta-plus',
            'SF': 'Spontaneous fission',
            'Proton': 'Proton',
            'Neutron': 'Neutron',
            'Radioactive': 'Radioactive',
            'Halogens': 'Halogen',
            'Noble Gases': 'Noble gas',
            'Other Nonmetals': 'Other nonmetal',
            'Lanthanides': 'Lanthanide',
            'Actinides': 'Actinide',
            'Metals': 'Metals',
            'Metalloids': 'Metalloids',
            'Non-Metals': 'Non-Metals'
        };
        const mapped = aliases[key] || (typeof key === 'string' && aliases[key.trim()]);
        if (mapped) concept = window.LEGEND_CONCEPTS[mapped];
    }

    if (!concept) {
        console.log(`[ConceptInspector] No concept found for key: ${key}`);
        return;
    }

    const titleEl = document.getElementById('lcm-title');
    const badgeEl = document.getElementById('lcm-badge');
    const defEl = document.getElementById('lcm-definition');
    const svgWrap = document.getElementById('lcm-svg-container');
    const charList = document.getElementById('lcm-characteristics-list');
    const exList = document.getElementById('lcm-examples-list');
    const headerEl = modal.querySelector('.legend-concept-header');

    if (titleEl) titleEl.textContent = concept.title;
    if (badgeEl) {
        badgeEl.textContent = concept.badge;
        badgeEl.style.color = concept.color;
        badgeEl.style.borderColor = concept.color;
    }
    if (headerEl) {
        headerEl.style.borderBottomColor = concept.color;
    }
    if (defEl) defEl.textContent = concept.definition;
    if (svgWrap) svgWrap.innerHTML = concept.svg;

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    if (charList) {
        charList.innerHTML = (concept.characteristics || []).map(c => `<li>${esc(c)}</li>`).join('');
    }

    if (exList) {
        exList.innerHTML = (concept.examples || []).map(ex => `<span class="concept-example-chip">${esc(ex)}</span>`).join('');
    }

    if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {
        window.PeriodicaNativeSlider.setVisibility(false);
    }

    modal.style.display = 'flex';
};

window.closeLegendConceptModal = function() {
    const modal = document.getElementById('legend-concept-modal');
    if (modal) modal.style.display = 'none';

    if (typeof syncNativeSliderVisibility === 'function') {
        syncNativeSliderVisibility();
    }
};
