// Constants & State
let currentTemp = 298; // Kelvin
let tempUnit = 'K';
let currentProperty = 'category';
let currentElecProperty = 'oxidation';
let currentView = 'main';
const heatmapConfigs = {
    atomicMass:        { minColor: '#00ff00', maxColor: '#ff0000', scale: 'linear', min: 1, max: 294 },
    energyLevels:      { minColor: '#00ffff', maxColor: '#ff00ff', scale: 'linear', min: 1, max: 7 },
    electronegativity: { minColor: '#ffaa00', maxColor: '#00ccff', scale: 'linear', min: 0.7, max: 4.0 },
    meltingPoint:      { minColor: '#0000ff', midColor: '#ffffff', maxColor: '#ff0000', midValue: 273.15, scale: 'linear', min: 0, max: 4000 },
    boilingPoint:      { minColor: '#00ffff', midColor: '#ffffff', maxColor: '#ff00ff', midValue: 273.15, scale: 'linear', min: 0, max: 6000 },
    electronAffinity:  { minColor: '#aaaaaa', maxColor: '#ffaa00', scale: 'linear', min: -100, max: 350 },
    ionization:        { minColor: '#5555ff', maxColor: '#ff5555', scale: 'linear', min: 350, max: 2500 },
    radius:            { minColor: '#00ffaa', maxColor: '#ff00aa', scale: 'linear', min: 25, max: 300 },
    hardness:          { minColor: '#cccccc', maxColor: '#222222', scale: 'linear', min: 0.5, max: 10 },
    modulus:           { minColor: '#ffcc00', maxColor: '#6600cc', scale: 'linear', min: 1, max: 1000 },
    density:           { minColor: '#aaffaa', maxColor: '#005500', scale: 'linear', min: 0.00008, max: 23 },
    conductivity:      { minColor: '#ff5500', maxColor: '#ffff00', scale: 'log', min: 0.005, max: 430 },
    heat:              { minColor: '#ff0000', maxColor: '#ffff00', scale: 'log', min: 0.1, max: 15 },
    abundance:         { minColor: '#000000', maxColor: '#ffffff', scale: 'log', min: 1e-6, max: 5e5 },
    discoveryYear:     { minColor: '#00ccff', maxColor: '#ff00cc', scale: 'linear', min: 1650, max: 2025 }
};
const heatmapUnknownColor = '#333333';
let selectedElement = null;
let lockedLegendKey = null;
let lockedLegendType = null;
let lockedLegendGroup = null;
let currentTimelineYear = 2025;
let currentSearchQuery = '';
const aufbauExceptions = {
    24: ['4s', '3d'],    // Cr
    29: ['4s', '3d'],    // Cu
    41: ['5s', '4d'],    // Nb
    42: ['5s', '4d'],    // Mo
    44: ['5s', '4d'],    // Ru
    45: ['5s', '4d'],    // Rh
    46: ['5s', '4d'],    // Pd
    47: ['5s', '4d'],    // Ag
    57: ['4f', '5d'],    // La
    58: ['4f', '5d'],    // Ce
    64: ['4f', '5d'],    // Gd
    78: ['6s', '5d'],    // Pt
    79: ['6s', '5d'],    // Au
    89: ['5f', '6d'],    // Ac
    90: ['5f', '6d'],    // Th
    91: ['5f', '6d'],    // Pa
    92: ['5f', '6d'],    // U
    93: ['5f', '6d'],    // Np
    96: ['5f', '6d'],    // Cm
    103: ['6d', '7p']    // Lr
};

function formatElectronConfigHTML(configString, atomicNumber) {
    if (!configString) return '';
    const anomalies = aufbauExceptions[atomicNumber];
    
    const parts = configString.split(' ').map(part => {
        let formatted = part.replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>');
        if (anomalies) {
            const match = part.match(/^(\d+[spdf])/);
            if (match && anomalies.includes(match[1])) {
                formatted = `<span style="color: #ff4444">${formatted}</span>`;
            }
        }
        return formatted;
    });
    
    return parts.join(' ');
}

function sortElectronConfig(configString) {
    if (!configString) return '';
    const parts = configString.split(' ');
    const core = parts.filter(p => p.startsWith('['));
    const orbitals = parts.filter(p => !p.startsWith('['));
    
    orbitals.sort((a, b) => {
        const matchA = a.match(/^(\d+)([spdf])/);
        const matchB = b.match(/^(\d+)([spdf])/);
        if (!matchA || !matchB) return 0;
        
        const nA = parseInt(matchA[1]);
        const lA = {'s':0, 'p':1, 'd':2, 'f':3}[matchA[2]];
        const nB = parseInt(matchB[1]);
        const lB = {'s':0, 'p':1, 'd':2, 'f':3}[matchB[2]];
        
        const energyA = nA + lA;
        const energyB = nB + lB;
        
        if (energyA !== energyB) {
            return energyA - energyB;
        }
        return nA - nB;
    });
    
    return [...core, ...orbitals].join(' ');
}

function getQuantumNumbers(configString) {
    if (!configString) return { n: '-', l: '-', m: '-', s: '-' };
    const parts = configString.split(' ');
    const lastTerm = parts[parts.length - 1];
    if (!lastTerm) return { n: '-', l: '-', m: '-', s: '-' };
    
    const match = lastTerm.match(/^(\d+)([spdf])(\d+)$/);
    if (!match) return { n: '-', l: '-', m: '-', s: '-' };
    
    const n = parseInt(match[1]);
    const orbital = match[2];
    const electrons = parseInt(match[3]);
    
    let l = 0;
    if (orbital === 's') l = 0;
    else if (orbital === 'p') l = 1;
    else if (orbital === 'd') l = 2;
    else if (orbital === 'f') l = 3;
    
    const numOrbitals = 2 * l + 1;
    let m;
    let s;
    
    if (electrons <= numOrbitals) {
        m = -l + (electrons - 1);
        s = '+1/2';
    } else {
        m = -l + (electrons - numOrbitals - 1);
        s = '-1/2';
    }
    
    return { n, l, m, s };
}

function applyLegendHighlighting(key, type, groupKeys = null) {
    const gridId = currentView === 'main' ? '#main-grid' : '#electrons-grid';
    const grid = document.querySelector(gridId);
    if (!grid) return;

    if (!key && !groupKeys) {
        grid.classList.remove('highlighting-active');
        document.querySelectorAll(`${gridId} .element-cell`).forEach(c => c.classList.remove('highlighted'));
        return;
    }

    grid.classList.add('highlighting-active');
    document.querySelectorAll(`${gridId} .element-cell`).forEach(cell => {
        let match = false;
        if (groupKeys) {
            match = groupKeys.includes(cell.dataset.category);
        } else if (type === 'category') {
            match = cell.dataset.category === key;
        } else if (type === 'state') {
            match = cell.dataset.state === key;
        } else if (type === 'block') {
            match = cell.dataset.block === key;
        } else if (type === 'subshell') {
            const z = parseInt(cell.dataset.z);
            const el = getElementByNumber(z);
            match = el && el.electronConfiguration && el.electronConfiguration.includes(key);
        }
        
        if (match) cell.classList.add('highlighted');
        else cell.classList.remove('highlighted');
    });
}

function clearLegendHighlighting() {
    if (lockedLegendKey || lockedLegendGroup) {
        applyLegendHighlighting(lockedLegendKey, lockedLegendType, lockedLegendGroup ? categoryGroups[lockedLegendGroup] : null);
        return;
    }
    const gridId = currentView === 'main' ? '#main-grid' : '#electrons-grid';
    const grid = document.querySelector(gridId);
    if (!grid) return;
    grid.classList.remove('highlighting-active');
    document.querySelectorAll(`${gridId} .element-cell`).forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

let tableLayoutMode = '18col'; // '18col' or '32col'

// Grid layout mapping
function getGridPosition(z) {
    if (tableLayoutMode === '32col') {
        // Period 1 (Z=1..2): H(1) in col 1 | He(2) in col 32
        if (z === 1) return { col: 1, row: 1 };
        if (z === 2) return { col: 32, row: 1 };
        
        // Period 2 (Z=3..10): Li(3), Be(4) in cols 1..2 | B(5)..Ne(10) in cols 27..32
        if (z >= 3 && z <= 4) return { col: z - 2, row: 2 };
        if (z >= 5 && z <= 10) return { col: z + 22, row: 2 };
        
        // Period 3 (Z=11..18): Na(11), Mg(12) in cols 1..2 | Al(13)..Ar(18) in cols 27..32
        if (z >= 11 && z <= 12) return { col: z - 10, row: 3 };
        if (z >= 13 && z <= 18) return { col: z + 14, row: 3 };
        
        // Period 4 (Z=19..36): K(19), Ca(20) in cols 1..2 | Sc(21) in col 3 | Ti(22)..Zn(30) in cols 18..26 | Ga(31)..Kr(36) in cols 27..32
        if (z >= 19 && z <= 20) return { col: z - 18, row: 4 }; // 19->1, 20->2
        if (z === 21) return { col: 3, row: 4 };                // 21(Sc)->3
        if (z >= 22 && z <= 30) return { col: z - 4, row: 4 };   // 22(Ti)->18, 30(Zn)->26
        if (z >= 31 && z <= 36) return { col: z - 4, row: 4 };   // 31(Ga)->27, 36(Kr)->32
        
        // Period 5 (Z=37..54): Rb(37), Sr(38) in cols 1..2 | Y(39) in col 3 | Zr(40)..Cd(48) in cols 18..26 | In(49)..Xe(54) in cols 27..32
        if (z >= 37 && z <= 38) return { col: z - 36, row: 5 }; // 37->1, 38->2
        if (z === 39) return { col: 3, row: 5 };                // 39(Y)->3
        if (z >= 40 && z <= 48) return { col: z - 22, row: 5 };  // 40(Zr)->18, 48(Cd)->26
        if (z >= 49 && z <= 54) return { col: z - 22, row: 5 };  // 49(In)->27, 54(Xe)->32
        
        // Period 6 (Z=55..86): Cs(55), Ba(56) in cols 1..2 | La(57)..Lu(71) in cols 3..17 | Hf(72)..Hg(80) in cols 18..26 | Tl(81)..Rn(86) in cols 27..32
        if (z >= 55 && z <= 56) return { col: z - 54, row: 6 };  // 55->1, 56->2
        if (z >= 57 && z <= 71) return { col: z - 54, row: 6 };  // 57->3 ... 71->17
        if (z >= 72 && z <= 80) return { col: z - 54, row: 6 };  // 72->18 ... 80->26
        if (z >= 81 && z <= 86) return { col: z - 54, row: 6 };  // 81->27 ... 86->32
        
        // Period 7 (Z=87..118): Fr(87), Ra(88) in cols 1..2 | Ac(89)..Lr(103) in cols 3..17 | Rf(104)..Cn(112) in cols 18..26 | Nh(113)..Og(118) in cols 27..32
        if (z >= 87 && z <= 88) return { col: z - 86, row: 7 };  // 87->1, 88->2
        if (z >= 89 && z <= 103) return { col: z - 86, row: 7 }; // 89->3 ... 103->17
        if (z >= 104 && z <= 112) return { col: z - 86, row: 7 };// 104->18 ... 112->26
        if (z >= 113 && z <= 118) return { col: z - 86, row: 7 };// 113->27 ... 118->32
    }

    if (z === 1) return { col: 1, row: 1 };
    if (z === 2) return { col: 18, row: 1 };
    if (z >= 3 && z <= 4) return { col: z - 2, row: 2 };
    if (z >= 5 && z <= 10) return { col: z + 8, row: 2 };
    if (z >= 11 && z <= 12) return { col: z - 10, row: 3 };
    if (z >= 13 && z <= 18) return { col: z + 0, row: 3 };
    if (z >= 19 && z <= 36) return { col: z - 18, row: 4 };
    if (z >= 37 && z <= 54) return { col: z - 36, row: 5 };
    if (z >= 55 && z <= 56) return { col: z - 54, row: 6 };
    if (z >= 72 && z <= 86) return { col: z - 68, row: 6 };
    if (z >= 87 && z <= 88) return { col: z - 86, row: 7 };
    if (z >= 104 && z <= 118) return { col: z - 100, row: 7 };
    
    // Lanthanides
    if (z >= 57 && z <= 71) return { col: z - 53, row: 9 };
    // Actinides
    if (z >= 89 && z <= 103) return { col: z - 85, row: 10 };
    
    return { col: 1, row: 1 }; // Fallback
}

// Category Colors (Full Spectrum High Contrast & Distinct Hues)
const categoryColors = {
    'Alkali metal': '#ef4444',        // Pure Red
    'Alkaline earth metal': '#f97316', // Bright Orange
    'Transition metal': '#6366f1',     // Indigo Blue
    'Post-transition metal': '#0284c7',// Steel Blue
    'Metalloid': '#eab308',            // Canary Yellow / Gold
    'Reactive nonmetal': '#22c55e',    // Lime Green
    'Noble gas': '#06b6d4',            // Electric Cyan
    'Lanthanide': '#ec4899',           // Hot Pink / Magenta
    'Actinide': '#a855f7',             // Deep Violet Purple
    'Unknown': '#64748b'              // Slate Gray
};

// Unified State Colors (Distinct Neon Hues 100% Matched to Legend & Symbol Text)
const stateColors = {
    'Solid': '#ffffff',   // Crisp Pure White
    'Liquid': '#00f0ff',  // Electric Neon Cyan (Liquid)
    'Gas': '#ff0055',     // Vibrant Neon Pink-Red (Gas)
    'Unknown': '#a1a1aa'  // Cool Translucent Silver (Unknown)
};

const stateTextColors = {
    'Solid': '#ffffff',   // Crisp Pure White
    'Liquid': '#00f0ff',  // Electric Neon Cyan (Liquid)
    'Gas': '#ff0055',     // Vibrant Neon Pink-Red (Gas)
    'Unknown': '#a1a1aa'  // Cool Translucent Silver (Unknown)
};

// Dynamic Social Share Meta Updater (OG image, Twitter cards, document title)
function updateSocialShareMeta(viewId) {
    const metaMap = {
        'properties': {
            title: 'PeriodicaX - Definitive 3D Interactive Periodic Table',
            desc: 'Explore all 118 chemical elements with high-density property matrices, Bohr models, and state filters.',
            img: 'assets/showcase/main_interface.png'
        },
        'electrons': {
            title: '3D Electron Orbitals Visualizer | PeriodicaX',
            desc: 'Interactive 3D quantum mechanical electron orbital probability density visualizers for atomic s, p, d, f orbitals.',
            img: 'assets/showcase/orbitals.png'
        },
        'isotopes': {
            title: 'Nuclear Isotopes & Half-Life Simulator | PeriodicaX',
            desc: 'Simulate nuclear half-life decay with an interactive 100-atom particle chamber for stable and radioactive isotopes.',
            img: 'assets/showcase/isotopes.png'
        },
        'compounds': {
            title: 'Chemical Compounds Database & 3D Molecules | PeriodicaX',
            desc: 'Interactive database of chemical compounds, IUPAC naming, molecular weights, and 3D structural formulas.',
            img: 'assets/showcase/compounds.png'
        },
        'reactions': {
            title: 'Chemical Reaction Balancer & Thermodynamics | PeriodicaX',
            desc: 'Instant chemical equation balancer with stoichiometric coefficient calculations and reaction energy states.',
            img: 'assets/showcase/compounds.png'
        },
        'crystals': {
            title: '3D Crystal Lattice Structures & Unit Cells | PeriodicaX',
            desc: 'Interactive 3D crystal structure visualizer for FCC, BCC, HCP, diamond cubic, and ionic crystal lattices.',
            img: 'assets/showcase/crystals.png'
        },
        'compare': {
            title: 'Side-by-Side Element Comparison Matrix | PeriodicaX',
            desc: 'Compare physical and chemical properties of multiple elements side-by-side with interactive radar charts.',
            img: 'assets/showcase/main_interface.png'
        },
        'quiz': {
            title: 'Interactive Chemistry & Periodic Table Quiz | PeriodicaX',
            desc: 'Test your knowledge of chemical elements, electron configurations, and periodic trends with interactive quizzes.',
            img: 'assets/showcase/main_interface.png'
        }
    };

    const config = metaMap[viewId] || metaMap['properties'];
    document.title = config.title;

    try {
        const origin = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '/');
        const fullImgUrl = new URL(config.img, origin).href;

        const setMeta = (selector, content) => {
            let tag = document.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                if (selector.includes('property=')) {
                    const prop = selector.match(/property="(.*?)"/)[1];
                    tag.setAttribute('property', prop);
                } else if (selector.includes('name=')) {
                    const name = selector.match(/name="(.*?)"/)[1];
                    tag.setAttribute('name', name);
                }
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        setMeta('meta[property="og:title"]', config.title);
        setMeta('meta[property="og:description"]', config.desc);
        setMeta('meta[property="og:image"]', fullImgUrl);
        setMeta('meta[property="twitter:title"]', config.title);
        setMeta('meta[property="twitter:description"]', config.desc);
        setMeta('meta[property="twitter:image"]', fullImgUrl);
    } catch (e) {
        console.warn('Social meta update skipped:', e);
    }
}

// View switching helper with hash routing
function switchView(viewId, updateHash = true) {
    const btn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);
    if (!btn) return;
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    currentView = viewId;
    document.querySelectorAll('.view-mode').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) targetView.classList.add('active');
    
    renderGrid();
    if (selectedElement) {
        selectElement(selectedElement.atomicNumber);
    }
    
    if (viewId === 'electrons') {
        if (window.OrbitalViewer) {
            setTimeout(() => window.OrbitalViewer.resize(), 50);
        }
    } else if (viewId === 'compounds') {
        if (typeof initCompoundsView === 'function') initCompoundsView();
    } else if (viewId === 'reactions') {
        if (typeof initReactionsView === 'function') initReactionsView();
    } else if (viewId === 'crystals') {
        if (typeof initCrystalsView === 'function') initCrystalsView();
    } else if (viewId === 'compare') {
        if (typeof initCompareView === 'function') initCompareView();
    } else if (viewId === 'quiz') {
        if (typeof initQuizView === 'function') initQuizView();
    }

    // Update social preview image, page title & meta descriptions dynamically
    updateSocialShareMeta(viewId);

    if (updateHash) {
        if (window.location.hash !== '#' + viewId) {
            history.replaceState(null, null, '#' + viewId);
        }
    }
}

// Handle URL Hash Deep-linking
function handleHashRouting() {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (!hash) return;

    const viewMap = {
        'isotopes': 'isotopes',
        'isotope': 'isotopes',
        'compounds': 'compounds',
        'compound': 'compounds',
        'orbitals': 'electrons',
        'orbital': 'electrons',
        'electrons': 'electrons',
        'reactions': 'reactions',
        'reaction': 'reactions',
        'crystals': 'crystals',
        'crystal': 'crystals',
        'compare': 'compare',
        'quiz': 'quiz',
        'properties': 'properties',
        'property': 'properties',
        'main': 'properties'
    };

    if (viewMap[hash]) {
        switchView(viewMap[hash], false);
        return;
    }

    // Direct element or isotope deep link (e.g. #isotope-carbon, #element-6, #gold, #fe)
    if (hash.startsWith('isotope-')) {
        const query = hash.replace('isotope-', '');
        switchView('isotopes', false);
        openElementOrIsotopeByQuery(query, true);
    } else if (hash.startsWith('element-')) {
        const query = hash.replace('element-', '');
        openElementOrIsotopeByQuery(query, false);
    } else {
        openElementOrIsotopeByQuery(hash, false);
    }
}

function openElementOrIsotopeByQuery(query, isIsotopeModal = false) {
    if (typeof elementsData === 'undefined') return;
    let target = null;
    const qLower = query.toLowerCase();

    const num = parseInt(query, 10);
    if (!isNaN(num) && num >= 1 && num <= 118) {
        target = elementsData.find(e => e.atomicNumber === num);
    } else {
        target = elementsData.find(e => e.symbol.toLowerCase() === qLower || e.name.toLowerCase() === qLower);
    }

    if (target) {
        if (isIsotopeModal && typeof openIsotopeModal === 'function') {
            openIsotopeModal(target.atomicNumber);
        } else {
            selectElement(target.atomicNumber);
        }
    }
}

// UI Setup
function setupUI() {
    // Mode toggle
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewId = e.target.dataset.view;
            switchView(viewId, true);
        });
    });
    
    window.addEventListener('hashchange', handleHashRouting);
    
    // Property Sidebar selection
    document.querySelectorAll('.prop-item:not(.non-interactive):not(.elec-prop-item)').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'option') return;
            document.querySelectorAll('.prop-item:not(.elec-prop-item)').forEach(p => p.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentProperty = target.dataset.prop;
            updateGridVisuals();
            
            const wikiViewBtn = document.getElementById('wiki-writeup-view');
            if (wikiViewBtn) {
                if (currentProperty === 'wiki') wikiViewBtn.classList.remove('hidden');
                else wikiViewBtn.classList.add('hidden');
            }
        });
    });

    // Electron Interface Property selection
    document.querySelectorAll('.elec-prop-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.elec-prop-item').forEach(p => p.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentElecProperty = target.dataset.prop;
            updateGridVisuals();
        });
    });

    document.querySelectorAll('.inline-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            e.stopPropagation();
            updateSidebarValues();
            updateGridVisuals();
        });
        // Prevent click from bubbling to prop-item
        sel.addEventListener('click', e => e.stopPropagation());
    });

    // Universal Element Search across all grid tabs
    document.querySelectorAll('.element-search-input').forEach(input => {
        input.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            filterGridElements(currentSearchQuery);
        });
    });

    // Temp slider & input
    const tempSlider = document.getElementById('temp-slider');
    const tempInput = document.getElementById('temp-input');
    
    const handleTempChange = (val) => {
        let parsed = parseFloat(val);
        if (isNaN(parsed)) return;
        if (parsed < 0) parsed = 0;
        if (parsed > 6000) parsed = 6000;
        currentTemp = parsed;
        
        // Sync the other control
        tempSlider.value = currentTemp;
        tempInput.value = Math.round(currentTemp);
        
        updateTempDisplay();
        if (currentProperty === 'category' || currentProperty === 'state') updateGridVisuals();
        updateSidebarValues();
    };

    tempSlider.addEventListener('input', (e) => handleTempChange(e.target.value));
    tempInput.addEventListener('input', (e) => handleTempChange(e.target.value));

    function handleTimelineChange(val) {
        currentTimelineYear = parseInt(val);
        updateTimelineDisplay();
        if (currentProperty === 'discoveryYear') updateGridVisuals();
    }

    const timelineSlider = document.getElementById('timeline-slider');
    const timelineInput = document.getElementById('timeline-input');
    if (timelineSlider && timelineInput) {
        timelineSlider.addEventListener('input', (e) => handleTimelineChange(e.target.value));
        timelineInput.addEventListener('input', (e) => handleTimelineChange(e.target.value));
    }
    
    // Orbital Controls (Slice view only)
    document.getElementById('slice-orbital').addEventListener('change', () => { if (window.OrbitalViewer) window.OrbitalViewer.drawOrbital(); });
    
    // Initialize display values
    updateTempDisplay();
    updateTimelineDisplay();
}

function getTempColor(k) {
    if (k < 1200) {
        // 0K to 1200K: Dark Cold Slate (30,41,59) -> Glowing Red (239,68,68)
        const pct = Math.max(0, Math.min(1, k / 1200));
        const r = Math.round(30 + (239 - 30) * pct);
        const g = Math.round(41 + (68 - 41) * pct);
        const b = Math.round(59 + (68 - 59) * pct);
        return `rgb(${r}, ${g}, ${b})`;
    } else if (k < 2400) {
        // 1200K to 2400K: Glowing Red -> Fiery Orange (249,115,22)
        const pct = (k - 1200) / (2400 - 1200);
        const r = Math.round(239 + (249 - 239) * pct);
        const g = Math.round(68 + (115 - 68) * pct);
        const b = Math.round(68 + (22 - 68) * pct);
        return `rgb(${r}, ${g}, ${b})`;
    } else if (k < 3600) {
        // 2400K to 3600K: Fiery Orange -> Golden Yellow (234,179,8)
        const pct = (k - 2400) / (3600 - 2400);
        const r = Math.round(249 + (234 - 249) * pct);
        const g = Math.round(115 + (179 - 115) * pct);
        const b = Math.round(22 + (8 - 22) * pct);
        return `rgb(${r}, ${g}, ${b})`;
    } else if (k < 4800) {
        // 3600K to 4800K: Golden Yellow -> White-Hot (255,255,255)
        const pct = (k - 3600) / (4800 - 3600);
        const r = Math.round(234 + (255 - 234) * pct);
        const g = Math.round(179 + (255 - 179) * pct);
        const b = Math.round(8 + (255 - 8) * pct);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // 4800K to 6000K: White-Hot -> Electric Blue-Hot (0,240,255)
        const pct = Math.min(1, (k - 4800) / (6000 - 4800));
        const r = Math.round(255 + (0 - 255) * pct);
        const g = Math.round(255 + (240 - 255) * pct);
        const b = 255;
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function updateTempDisplay() {
    const k = currentTemp;
    const c = k - 273.15;
    const f = c * 9/5 + 32;
    const cStr = String(Math.round(c)).padStart(5, '\u00A0');
    const fStr = String(Math.round(f)).padStart(5, '\u00A0');
    
    document.getElementById('temp-input').value = Math.round(k);
    document.getElementById('temp-display-c').innerText = `${cStr} °C`;
    document.getElementById('temp-display-f').innerText = `${fStr} °F`;
    
    const displayContainer = document.getElementById('temp-display-container');
    const tempInput = document.getElementById('temp-input');
    const slider = document.getElementById('temp-slider');
    const color = getTempColor(k);
    
    // Dynamically color all text values to match the temperature meter 1:1
    if (displayContainer) {
        displayContainer.style.color = color;
        displayContainer.style.textShadow = `0 0 10px ${color.replace('rgb', 'rgba').replace(')', ', 0.6)')}`;
    }
    if (tempInput) {
        tempInput.style.color = color;
        tempInput.style.borderColor = color.replace('rgb', 'rgba').replace(')', ', 0.4)');
    }
    
    // Dynamic glow for the thumb
    const glowIntensity = Math.min(1, k / 6000); // 0 to 1
    let glowShadow = 'none';
    let thumbBg = 'transparent';
    if (glowIntensity > 0.05) {
        const glowRadius1 = Math.round(glowIntensity * 15);
        const glowRadius2 = Math.round(glowIntensity * 30);
        const glowColor = color.replace('rgb', 'rgba').replace(')', `, ${0.5 + 0.5 * glowIntensity})`);
        glowShadow = `inset 0 0 ${glowRadius1}px ${glowColor}, 0 0 ${glowRadius2}px ${glowColor}`;
        thumbBg = color.replace('rgb', 'rgba').replace(')', `, ${0.2 + 0.6 * glowIntensity})`);
    }
    
    slider.style.setProperty('--temp-thumb-glow', glowShadow);
    slider.style.setProperty('--dynamic-temp-bg', thumbBg);
}

function updateTimelineDisplay() {
    const y = currentTimelineYear;
    const inputEl = document.getElementById('timeline-input');
    if (inputEl && document.activeElement !== inputEl) {
        inputEl.value = y;
    }
    
    const displayContainer = document.getElementById('timeline-display-container');
    if (!displayContainer) return;
    
    const minYear = 1650;
    const maxYear = 2025;
    const pct = Math.max(0, Math.min(1, (y - minYear) / (maxYear - minYear)));
    
    const r = Math.round(0 + (255 - 0) * pct);
    const g = Math.round(204 + (0 - 204) * pct);
    const b = Math.round(255 + (204 - 255) * pct);
    const color = `rgb(${r}, ${g}, ${b})`;
    
    displayContainer.style.color = color;
    displayContainer.style.textShadow = `0 0 8px ${color.replace('rgb', 'rgba').replace(')', ', 0.5)')}`;
    
    const slider = document.getElementById('timeline-slider');
    if (!slider) return;
    
    const glowIntensity = 0.5 + 0.5 * pct;
    const glowRadius1 = Math.round(glowIntensity * 15);
    const glowRadius2 = Math.round(glowIntensity * 30);
    const glowColor = color.replace('rgb', 'rgba').replace(')', `, ${0.5 + 0.5 * glowIntensity})`);
    const glowShadow = `inset 0 0 ${glowRadius1}px ${glowColor}, 0 0 ${glowRadius2}px ${glowColor}`;
    const thumbBg = color.replace('rgb', 'rgba').replace(')', `, ${0.2 + 0.6 * glowIntensity})`);
    
    slider.style.setProperty('--time-thumb-glow', glowShadow);
    slider.style.setProperty('--dynamic-time-bg', thumbBg);
}



// Render Grid Structure based on Mode
function renderGrid() {
    const gridId = currentView === 'electrons' ? 'electrons-grid' : 
                   currentView === 'isotopes' ? 'isotopes-grid' : 'main-grid';
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    // Save table controls before clearing grid
    let tableControls = grid.querySelector('.table-controls');
    
    grid.innerHTML = '';
    
    // Restore table controls
    if (tableControls) {
        grid.appendChild(tableControls);
    }
    
    if (currentView === 'main') {
        const legendDiv = document.createElement('div');
        legendDiv.id = 'in-grid-legend';
        legendDiv.className = 'in-grid-legend';
        grid.appendChild(legendDiv);
    } else if (currentView === 'electrons') {
        const legendDiv = document.createElement('div');
        legendDiv.id = 'elec-in-grid-legend';
        legendDiv.className = 'in-grid-legend';
        grid.appendChild(legendDiv);
        const configStr = selectedElement ? selectedElement.electronConfiguration : "";
        setTimeout(() => renderAufbauDiagram(configStr), 0);
    } else if (currentView === 'isotopes') {
        const legendDiv = document.createElement('div');
        legendDiv.id = 'iso-in-grid-legend';
        legendDiv.className = 'in-grid-legend';
        
        // Static Decay Mode Legend
        const decayModes = [
            { name: 'Stable', color: '#4ade80' },
            { name: 'Alpha Decay', color: '#facc15' },
            { name: 'Beta- Decay', color: '#38bdf8' },
            { name: 'Positron Emission / EC', color: '#c084fc' },
            { name: 'Spontaneous Fission', color: '#f87171' },
            { name: 'Proton Emission', color: '#fb923c' },
            { name: 'Neutron Emission', color: '#2dd4bf' }
        ];
        
        let html = '<div class="legend-group" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px;">';
        decayModes.forEach(mode => {
            html += `<div class="legend-item" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #fff; cursor: default;">
                <div style="width: 12px; height: 12px; background: ${mode.color}; border: 1px solid rgba(255,255,255,0.2);"></div>
                ${mode.name}
            </div>`;
        });
        html += '</div>';
        
        legendDiv.innerHTML = html;
        grid.appendChild(legendDiv);
    }
    
    for (let i = 1; i <= 118; i++) {
        const elData = getElementByNumber(i);
        const pos = getGridPosition(i);
        
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.dataset.z = i;
        cell.style.gridColumn = pos.col;
        cell.style.gridRow = pos.row + 1;
        
        let bohrHtml = '';
        if (currentView === 'electrons' && elData) {
            bohrHtml = `
                <div class="cell-bohr" id="bohr-mini-${i}" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; opacity:0.25; pointer-events:none; display:flex; align-items:center; justify-content:center; color: inherit;">
                    ${generateMiniBohrSVG(elData.electronsPerShell)}
                </div>
            `;
        }

        if (currentView === 'main' || currentView === 'isotopes' || elData) {
            cell.innerHTML = `
                ${bohrHtml}
                <span class="cell-num" style="z-index:1; position:relative;">${i}</span>
                <span class="cell-sym" style="z-index:1; position:relative;">${elData ? elData.symbol : '?'}</span>
                <span class="cell-name" style="z-index:1; position:relative;">${elData ? elData.name : ''}</span>
                <span class="cell-value" id="cell-val-${i}" style="z-index:1; position:relative;"></span>
            `;
        } else {
            cell.innerHTML = `<span class="cell-num">${i}</span>`;
        }
        
        if (!elData) cell.style.opacity = '0.2';
        else cell.addEventListener('click', () => selectElement(i));
        
        grid.appendChild(cell);
    }
    
    // Render Lanthanides & Actinides Placeholders in 18-column mode
    grid.querySelectorAll('.fblock-placeholder-cell').forEach(el => el.remove());
    if (tableLayoutMode === '18col') {
        const isMain = (gridId === 'main-grid' || gridId === '#main-grid');
        
        // Lanthanide Placeholder (Row 6, Col 3)
        const lanthPlaceholder = document.createElement('div');
        lanthPlaceholder.className = 'element-cell fblock-placeholder-cell lanth-placeholder';
        lanthPlaceholder.style.cssText = `
            grid-column: 3;
            grid-row: ${isMain ? 7 : 6};
            border: 2px dashed #e879f9 !important;
            background: rgba(168, 85, 247, 0.45) !important;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #ffffff;
            transition: all 0.25s ease;
            box-shadow: inset 0 0 15px rgba(232, 121, 249, 0.4), 0 0 12px rgba(168, 85, 247, 0.5);
            user-select: none;
            overflow: hidden;
            position: relative;
            z-index: 5;
            padding: 2px;
        `;
        lanthPlaceholder.innerHTML = `
            <span style="font-size: 0.55rem; font-family: var(--font-mono); font-weight: 900; background: #e879f9; color: #0f172a; padding: 1px 4px; border-radius: 3px; margin-bottom: 2px; text-transform: uppercase;">f-Block</span>
            <span style="font-size: 0.95rem; font-family: var(--font-mono); font-weight: 900; line-height: 1; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">57–71</span>
            <span style="font-size: 0.55rem; font-family: var(--font-ui); font-weight: 800; text-transform: uppercase; color: #f5d0fe; letter-spacing: 0.3px; margin-top: 2px;">Lanthanides</span>
        `;
        lanthPlaceholder.onclick = () => {
            highlightCategory('Lanthanide');
            const targetCell = document.querySelector(`${gridId} .element-cell[data-z="57"]`);
            if (targetCell) targetCell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        grid.appendChild(lanthPlaceholder);

        // Actinide Placeholder (Row 7, Col 3)
        const actPlaceholder = document.createElement('div');
        actPlaceholder.className = 'element-cell fblock-placeholder-cell act-placeholder';
        actPlaceholder.style.cssText = `
            grid-column: 3;
            grid-row: ${isMain ? 8 : 7};
            border: 2px dashed #a855f7 !important;
            background: rgba(168, 85, 247, 0.45) !important;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #ffffff;
            transition: all 0.25s ease;
            box-shadow: inset 0 0 15px rgba(168, 85, 247, 0.4), 0 0 12px rgba(168, 85, 247, 0.5);
            user-select: none;
            overflow: hidden;
            position: relative;
            z-index: 5;
            padding: 2px;
        `;
        actPlaceholder.innerHTML = `
            <span style="font-size: 0.55rem; font-family: var(--font-mono); font-weight: 900; background: #a855f7; color: #ffffff; padding: 1px 4px; border-radius: 3px; margin-bottom: 2px; text-transform: uppercase;">f-Block</span>
            <span style="font-size: 0.95rem; font-family: var(--font-mono); font-weight: 900; line-height: 1; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">89–103</span>
            <span style="font-size: 0.55rem; font-family: var(--font-ui); font-weight: 800; text-transform: uppercase; color: #e9d5ff; letter-spacing: 0.3px; margin-top: 2px;">Actinides</span>
        `;
        actPlaceholder.onclick = () => {
            highlightCategory('Actinide');
            const targetCell = document.querySelector(`${gridId} .element-cell[data-z="89"]`);
            if (targetCell) targetCell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
        grid.appendChild(actPlaceholder);
    }
    
    updateGridVisuals();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getPropertyValue(el, propName) {
    if (!el) return null;
    let dataKey = propName;
    if (propName === 'ionization') dataKey = 'ionizationEnergies';
    if (propName === 'energyLevels') return el.period;
    
    let val = el[dataKey];
    if (val === undefined) return null;
    
    // Check if there is a sub-select for this property
    const subSelect = document.getElementById(`sub-${propName}`);
    if (subSelect && typeof val === 'object' && val !== null) {
        // If it's an array (like ionizationEnergies)
        if (Array.isArray(val)) {
            const idx = parseInt(subSelect.value, 10);
            return val[idx] !== undefined ? val[idx] : null;
        }
        // If it's an object (like density.stp, hardness.mohs)
        return val[subSelect.value] !== undefined ? val[subSelect.value] : null;
    }
    
    return val;
}

function getNormalizedCategory(cat) {
    if (!cat) return 'Unknown';
    const lowerCat = cat.toLowerCase();
    if (lowerCat === 'diatomic nonmetal' || lowerCat === 'polyatomic nonmetal') return 'Reactive nonmetal';
    if (lowerCat.includes('unknown')) {
        if (lowerCat.includes('transition metal')) return 'Transition metal';
        if (lowerCat.includes('post-transition metal')) return 'Post-transition metal';
        if (lowerCat.includes('metalloid')) return 'Metalloid';
        if (lowerCat.includes('noble gas')) return 'Noble gas';
        if (lowerCat.includes('alkali metal')) return 'Alkali metal';
        if (lowerCat.includes('alkaline earth metal')) return 'Alkaline earth metal';
        return 'Unknown';
    }
    return cat;
}

function getHeatmapColor(value, config) {
    if (value === null || value === undefined || isNaN(value)) return heatmapUnknownColor;
    let cMin = config.min;
    let cMax = config.max;
    let minR = hexToRgb(config.minColor);
    let maxR = hexToRgb(config.maxColor);
    let pct;
    if (config.scale === 'log') {
        const safeValue = Math.max(0.000001, value);
        const safeMin = Math.max(0.000001, cMin);
        const safeMax = Math.max(0.000001, cMax);
        pct = (Math.log(safeValue) - Math.log(safeMin)) / (Math.log(safeMax) - Math.log(safeMin));
    } else {
        pct = (value - cMin) / (cMax - cMin);
    }
    pct = Math.max(0, Math.min(1, pct || 0));
    const r = Math.round(minR.r + (maxR.r - minR.r) * pct);
    const g = Math.round(minR.g + (maxR.g - minR.g) * pct);
    const b = Math.round(minR.b + (maxR.b - minR.b) * pct);
    return `rgb(${r}, ${g}, ${b})`;
}

function getGradientColor(value, propName) {
    const config = heatmapConfigs[propName];
    if (!config || value === null || value === undefined || isNaN(value)) return heatmapUnknownColor;
    
    let cMin = config.min;
    let cMax = config.max;
    let minR = hexToRgb(config.minColor);
    let maxR = hexToRgb(config.maxColor);
    
    if (config.midColor && config.midValue !== undefined) {
        if (value <= config.midValue) {
            cMax = config.midValue;
            maxR = hexToRgb(config.midColor);
        } else {
            cMin = config.midValue;
            minR = hexToRgb(config.midColor);
        }
    }
    
    let pct;
    if (config.scale === 'log') {
        const safeValue = Math.max(0.000001, value);
        const safeMin = Math.max(0.000001, cMin);
        const safeMax = Math.max(0.000001, cMax);
        pct = (Math.log(safeValue) - Math.log(safeMin)) / (Math.log(safeMax) - Math.log(safeMin));
    } else {
        pct = (value - cMin) / (cMax - cMin);
    }
    
    pct = Math.max(0, Math.min(1, pct || 0));
    
    if (!minR || !maxR) return heatmapUnknownColor;

    const r = Math.round(minR.r + (maxR.r - minR.r) * pct);
    const g = Math.round(minR.g + (maxR.g - minR.g) * pct);
    const b = Math.round(minR.b + (maxR.b - minR.b) * pct);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function getGlossyBackground(colorStr, category = '') {
    if (!colorStr) return 'rgba(255,255,255,0.02)';
    
    const cat = category.toLowerCase();
    const isMetal = cat.includes('metal') || cat.includes('lanthanide') || cat.includes('actinide');
    const isGas = cat.includes('gas') || cat.includes('diatomic') || cat.includes('reactive nonmetal'); 

    let baseHsl = '';
    let baseRgb = '';

    if (colorStr.startsWith('hsl')) {
        baseHsl = colorStr.replace('hsl(', '').replace(')', '');
    } else if (colorStr.startsWith('rgb')) {
        const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            baseRgb = `${match[1]},${match[2]},${match[3]}`;
        }
    } else {
        let hex = colorStr.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        baseRgb = `${r},${g},${b}`;
    }

    if (isMetal) {
        // Metallic: Hard diagonal gradient of the SAME color, from bright to dark
        if (baseHsl) {
            return `linear-gradient(135deg, hsla(${baseHsl}, 0.8) 0%, hsla(${baseHsl}, 0.1) 50%, hsla(${baseHsl}, 0.3) 100%)`;
        } else {
            return `linear-gradient(135deg, rgba(${baseRgb}, 0.8) 0%, rgba(${baseRgb}, 0.1) 50%, rgba(${baseRgb}, 0.3) 100%)`;
        }
    } 
    else if (isGas) {
        // Gaseous: Bright center, fading to dark edges
        if (baseHsl) {
            return `radial-gradient(circle at 50% 50%, hsla(${baseHsl}, 0.8) 0%, hsla(${baseHsl}, 0.1) 80%)`;
        } else {
            return `radial-gradient(circle at 50% 50%, rgba(${baseRgb}, 0.8) 0%, rgba(${baseRgb}, 0.1) 80%)`;
        }
    } 
    else {
        // Matte / Solid Non-metal: Smooth top-to-bottom
        if (baseHsl) {
            return `linear-gradient(180deg, hsla(${baseHsl}, 0.6) 0%, hsla(${baseHsl}, 0.1) 100%)`;
        } else {
            return `linear-gradient(180deg, rgba(${baseRgb}, 0.6) 0%, rgba(${baseRgb}, 0.1) 100%)`;
        }
    }
}

function updateGridVisuals() {
    const isMain = currentView === 'main';
    const isIsotopes = currentView === 'isotopes';
    const gridId = isMain ? '#main-grid' : 
                   isIsotopes ? '#isotopes-grid' : '#electrons-grid';
    const activeProp = isMain ? currentProperty : currentElecProperty;
    
    // Toggle controllers
    const tempWrapper = document.getElementById('temp-controller-wrapper');
    const timelineWrapper = document.getElementById('timeline-controller-wrapper');
    if (tempWrapper && timelineWrapper) {
        if (isMain && currentProperty === 'discoveryYear') {
            tempWrapper.classList.add('hidden');
            tempWrapper.style.display = 'none';
            timelineWrapper.classList.remove('hidden');
            timelineWrapper.style.display = 'flex';
        } else if (isMain && ['category', 'state', 'meltingPoint', 'boilingPoint'].includes(currentProperty)) {
            tempWrapper.classList.remove('hidden');
            tempWrapper.style.display = 'flex';
            timelineWrapper.classList.add('hidden');
            timelineWrapper.style.display = 'none';
        } else {
            tempWrapper.classList.add('hidden');
            tempWrapper.style.display = 'none';
            timelineWrapper.classList.add('hidden');
            timelineWrapper.style.display = 'none';
        }
    }

    const cells = document.querySelectorAll(`${gridId} .element-cell`);
    let solidCount = 0, liquidCount = 0, gasCount = 0, unknownCount = 0;
    const blockColors = { s: '#00d4ff', p: '#84cc16', d: '#d946ef', f: '#3b82f6' };

    cells.forEach(cell => {
        const z = parseInt(cell.dataset.z);
        const elData = getElementByNumber(z);
        if (!elData) return;
        const normalizedCategory = getNormalizedCategory(elData.category);
        
        // 1. Determine State at currentTemp for text color (always active)
        let currentState = 'Unknown';
        if (elData.meltingPoint !== null && elData.meltingPoint !== undefined && elData.boilingPoint !== null && elData.boilingPoint !== undefined) {
            if (currentTemp < elData.meltingPoint) currentState = 'Solid';
            else if (currentTemp >= elData.meltingPoint && currentTemp < elData.boilingPoint) currentState = 'Liquid';
            else currentState = 'Gas';
        }
        
        if (currentState === 'Solid') solidCount++;
        else if (currentState === 'Liquid') liquidCount++;
        else if (currentState === 'Gas') gasCount++;
        else unknownCount++;

        const symSpan = cell.querySelector('.cell-sym');
        if (symSpan) {
            symSpan.style.color = stateTextColors[currentState];
            symSpan.style.textShadow = '0 0 5px #000, 0 1px 3px #000, 0 0 8px rgba(0,0,0,0.9)'; // Maximum contrast over all categories
        }

        if (currentView === 'electrons') {
            const bohrWrapper = cell.querySelector('.cell-bohr');
            if (bohrWrapper) {
                bohrWrapper.style.color = stateTextColors[currentState];
                bohrWrapper.style.textShadow = '0 0 5px #000, 0 1px 3px #000, 0 0 8px rgba(0,0,0,0.9)';
            }
        }

        // 2. Determine Background/Border/Value
        let color = '#333';
        let valText = '';

        if (isMain || isIsotopes) {
            if (isIsotopes || currentProperty === 'category' || currentProperty === 'wiki') {
                color = categoryColors[normalizedCategory] || '#333';
                if (isIsotopes) {
                    valText = (typeof isotopeData !== 'undefined' && isotopeData[z]) ? isotopeData[z].length.toString() : '0';
                } else if (currentProperty === 'wiki') {
                    valText = `<span style="font-size: 0.55rem; text-decoration: underline; cursor: pointer; color: rgba(255,255,255,0.8); display: inline-block; margin-top: 1px;" onclick="event.stopPropagation(); if (window.openWikiModal) window.openWikiModal('${elData.name}')">Wiki ↗</span>`;
                } else {
                    valText = elData.atomicMass ? elData.atomicMass.toFixed(3) : '';
                }
            } else if (currentProperty === 'state') {
                color = stateColors[currentState] || '#6b7280';
                valText = currentState;
            } else if (heatmapConfigs[currentProperty]) {
                const numValue = getPropertyValue(elData, currentProperty);
                if (currentProperty === 'discoveryYear' && elData.discoveryYear === 'Ancient') {
                    color = '#ffffff';
                    valText = 'Ancient';
                } else if (numValue !== null && numValue !== undefined && !isNaN(numValue)) {
                    color = getGradientColor(numValue, currentProperty);
                    valText = Number(numValue);
                    if (!Number.isInteger(valText)) valText = (valText > 100 || valText < -100) ? Math.round(valText) : Number(valText.toPrecision(3)).toString();
                } else {
                    color = heatmapUnknownColor;
                }
            }
        } else {
            // Electron view property mapping
            if (activeProp === 'oxidation') {
                const statesStr = elData.oxidationStates || '';
                const states = statesStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                if (states.length > 0) {
                    const primary = states[0];
                    if (primary < 0) color = getHeatmapColor(primary, { minColor: '#ff0000', maxColor: '#ffffff', scale: 'linear', min: -4, max: 0 });
                    else if (primary > 0) color = getHeatmapColor(primary, { minColor: '#ffffff', maxColor: '#00ff00', scale: 'linear', min: 0, max: 8 });
                    else color = '#ffffff';
                } else { color = '#333'; }
                valText = elData.oxidationStates || '';
            } else if (activeProp === 'configuration' || activeProp === 'expanded') {
                const isException = (elData.atomicNumber in aufbauExceptions);
                color = blockColors[elData.block] || '#333';
                
                let rawConfig = (activeProp === 'configuration' ? elData.electronConfigurationNoble : elData.electronConfiguration) || '';
                rawConfig = sortElectronConfig(rawConfig);
                const parts = rawConfig.split(' ');
                
                // If it's an exception, try to pick out the anomalous terms for the grid cell instead of blindly picking the last two
                let displayStr = '';
                if (isException) {
                    const anomalies = aufbauExceptions[elData.atomicNumber];
                    const anomalousParts = parts.filter(p => {
                        const m = p.match(/^(\d+[spdf])/);
                        return m && anomalies.includes(m[1]);
                    });
                    displayStr = anomalousParts.length > 0 ? anomalousParts.join(' ') : parts.slice(Math.max(0, parts.length - 2)).join(' ');
                } else {
                    displayStr = parts.slice(Math.max(0, parts.length - 2)).join(' ');
                }
                
                valText = formatElectronConfigHTML(displayStr, elData.atomicNumber);
            } else if (activeProp === 'energyLevel') {
                const shells = elData.electronsPerShell ? elData.electronsPerShell.length : 1;
                color = getHeatmapColor(shells, heatmapConfigs.energyLevels);
                valText = elData.electronsPerShell ? elData.electronsPerShell.join(',') : '';
            } else if (activeProp === 'quantum') {
                const qn = getQuantumNumbers(elData.electronConfiguration);
                const lColors = {0: '#ff6b6b', 1: '#4ecdc4', 2: '#feca57', 3: '#a29bfe'};
                color = lColors[qn.l] || '#333';
                valText = `n=${qn.n} l=${qn.l} m=${qn.m}`;
            }
        }

        cell.style.background = getGlossyBackground(color, normalizedCategory);
        
        if (!isMain && (activeProp === 'configuration' || activeProp === 'expanded') && (elData.atomicNumber in aufbauExceptions)) {
            cell.style.borderColor = '#ef4444';
            cell.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.95), inset 0 0 6px rgba(239, 68, 68, 0.5)';
        } else {
            cell.style.borderColor = color;
            cell.style.boxShadow = '';
        }

        // Timeline opacity logic
        if (isMain && currentProperty === 'discoveryYear') {
            if (elData.discoveryYear === 'Ancient') {
                cell.style.opacity = '1';
                cell.style.filter = 'none';
            } else {
                const dYear = parseInt(elData.discoveryYear);
                if (!isNaN(dYear) && dYear > currentTimelineYear) {
                    cell.style.opacity = '0.2';
                    cell.style.filter = 'grayscale(1)';
                } else {
                    cell.style.opacity = '1';
                    cell.style.filter = 'none';
                }
            }
        } else {
            cell.style.opacity = '1';
            cell.style.filter = 'none';
        }

        cell.dataset.category = normalizedCategory;
        cell.dataset.state = currentState;
        cell.dataset.block = elData.block || '';

        const valSpan = cell.querySelector('.cell-value');
        if(valSpan) {
            if (currentView === 'electrons' && (activeProp === 'configuration' || activeProp === 'expanded' || activeProp === 'energyLevel' || activeProp === 'quantum')) {
                valSpan.innerHTML = valText;
                valSpan.style.fontSize = activeProp === 'quantum' ? '0.48rem' : '0.55rem';
            } else {
                valSpan.innerHTML = valText;
                valSpan.style.fontSize = ''; // Reset
            }
        }
    });
    window.lastStateCounts = { Solid: solidCount, Liquid: liquidCount, Gas: gasCount, Unknown: unknownCount };
    
    clearLegendHighlighting();
    if (isMain) {
        renderLegend();
    }
    updateSelectedCardVisuals();
    filterGridElements(currentSearchQuery);
}

function filterGridElements(rawQuery) {
    const q = (rawQuery || '').trim().toLowerCase();
    
    // Sync all search inputs across tabs
    document.querySelectorAll('.element-search-input').forEach(input => {
        if (input.value !== (rawQuery || '')) input.value = rawQuery || '';
    });

    document.querySelectorAll('.element-cell').forEach(cell => {
        const z = cell.dataset.z;
        if (!z) return;
        const el = getElementByNumber(parseInt(z));
        if (!el) return;

        if (!q) {
            cell.style.opacity = '1';
            cell.style.filter = 'none';
            cell.style.transform = 'none';
            cell.style.zIndex = '1';
            cell.style.pointerEvents = 'auto';
            return;
        }

        const nameMatch = el.name.toLowerCase().includes(q);
        const symbolMatch = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
        const zMatch = String(el.atomicNumber) === q;
        const catMatch = el.category ? el.category.toLowerCase().includes(q) : false;

        if (nameMatch || symbolMatch || zMatch || catMatch) {
            cell.style.opacity = '1';
            cell.style.filter = 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.9))';
            cell.style.transform = 'scale(1.06)';
            cell.style.zIndex = '10';
            cell.style.pointerEvents = 'auto';
        } else {
            cell.style.opacity = '0.15';
            cell.style.filter = 'grayscale(0.8)';
            cell.style.transform = 'scale(0.95)';
            cell.style.zIndex = '1';
        }
    });
}

function updateSelectedCardVisuals() {
    if (!selectedElement) return;
    const el = selectedElement;
    const normalizedCategory = getNormalizedCategory(el.category);
    
    let currentState = 'Unknown';
    if (el.meltingPoint !== null && el.meltingPoint !== undefined && el.boilingPoint !== null && el.boilingPoint !== undefined) {
        if (currentTemp < el.meltingPoint) currentState = 'Solid';
        else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
        else currentState = 'Gas';
    }
    
    let color = '#333';
    const activeProp = (currentView === 'electrons') ? currentElecProperty : currentProperty;
    
    if (activeProp === 'category' || activeProp === 'wiki') {
        color = categoryColors[normalizedCategory] || '#333';
    } else if (activeProp === 'state') {
        color = stateColors[currentState] || '#6b7280';
    } else if (heatmapConfigs[activeProp]) {
        const numValue = getPropertyValue(el, activeProp);
        if (activeProp === 'discoveryYear' && el.discoveryYear === 'Ancient') {
            color = '#ffffff';
        } else if (numValue === null || numValue === undefined || isNaN(numValue)) {
            color = heatmapUnknownColor;
        } else {
            color = getGradientColor(numValue, activeProp);
        }
    } else if (currentView === 'electrons') {
        const blockColors = { s: '#00d4ff', p: '#84cc16', d: '#d946ef', f: '#3b82f6' };
        color = blockColors[el.block] || categoryColors[normalizedCategory] || '#333';
    } else {
        color = categoryColors[normalizedCategory] || '#333';
    }

    const glossBg = (activeProp === 'category' || activeProp === 'wiki') ? 
        getGlossyBackground(color, normalizedCategory) : 
        getGlossyBackground(color, '');

    // 1. Update Property Interface card
    const mainCard = document.getElementById('element-detail-card');
    if (mainCard) {
        mainCard.style.background = glossBg;
        mainCard.style.borderColor = color || 'rgba(0,212,255,0.3)';
    }

    // 2. Update Electrons & Orbitals card
    const elecCard = document.getElementById('elec-element-card');
    if (elecCard) {
        elecCard.style.background = glossBg;
        elecCard.style.borderColor = color || 'rgba(0,212,255,0.3)';
    }

    const stateColor = stateTextColors[currentState] || '#ffffff';

    const dhSym = document.getElementById('dh-symbol');
    if (dhSym) dhSym.style.color = stateColor;

    const dhName = document.getElementById('dh-name');
    if (dhName) {
        dhName.innerText = el.name;
        dhName.style.color = '#ffffff';
    }

    const elecSym = document.getElementById('elec-symbol');
    if (elecSym) elecSym.style.color = stateColor;

    const elecName = document.getElementById('elec-name');
    if (elecName) {
        elecName.innerText = el.name;
        elecName.style.color = '#ffffff';
    }

    const dhBohr = document.getElementById('dh-bohr');
    if (dhBohr) dhBohr.style.color = stateColor;
}

function renderLegend() {
    const legendContainer = document.getElementById('in-grid-legend');
    if (!legendContainer) return;

    const pConf = heatmapConfigs[currentProperty];
    if (pConf) {
        const isLog = pConf.scale === 'log';
        const midRowHtml = pConf.midColor ? `
                            <div class="hm-row" style="margin-top: 10px;">
                                <span>Zero (0°C)</span>
                                <input type="color" id="hm-mid" value="${pConf.midColor}">
                            </div>` : '';
        const maxMargin = pConf.midColor ? '10px' : '20px';
        const gradString = pConf.midColor ? `linear-gradient(to bottom, ${pConf.minColor}, ${pConf.midColor}, ${pConf.maxColor})` : `linear-gradient(to bottom, ${pConf.minColor}, ${pConf.maxColor})`;

        legendContainer.innerHTML = `
            <div class="legend-box heatmap-controller">
                <div class="heatmap-section">
                    <div class="legend-box-title">Color</div>
                    <div class="heatmap-colors">
                        <div class="hm-controls">
                            <div class="hm-row">
                                <span>Minimum</span>
                                <input type="color" id="hm-min" value="${pConf.minColor}">
                            </div>${midRowHtml}
                            <div class="hm-row" style="margin-top: ${maxMargin};">
                                <span>Maximum</span>
                                <input type="color" id="hm-max" value="${pConf.maxColor}">
                            </div>
                            <div class="hm-row hm-unknown">
                                <span style="color: #888">Unknown</span>
                                <input type="color" id="hm-unk" value="${heatmapUnknownColor}">
                            </div>
                        </div>
                        <div class="hm-bars">
                            <div class="hm-gradient" style="background: ${gradString}"></div>
                            <div class="hm-unk-box" style="background: ${heatmapUnknownColor}"></div>
                        </div>
                    </div>
                </div>
                <div class="heatmap-section">
                    <div class="legend-box-title">Scale</div>
                    <div class="heatmap-scale">
                        <button class="scale-btn ${!isLog ? 'active' : ''}" id="hm-linear">
                            <svg viewBox="0 0 100 100" width="40" height="40">
                                <line x1="20" y1="80" x2="80" y2="80" stroke="#aaa" stroke-width="3" marker-end="url(#arrowhead)"/>
                                <line x1="20" y1="80" x2="20" y2="20" stroke="#aaa" stroke-width="3" marker-end="url(#arrowhead)"/>
                                <line x1="25" y1="75" x2="70" y2="30" stroke="#eee" stroke-width="3"/>
                            </svg>
                            Linear
                        </button>
                        <button class="scale-btn ${isLog ? 'active' : ''}" id="hm-log">
                            <svg viewBox="0 0 100 100" width="40" height="40">
                                <line x1="20" y1="80" x2="80" y2="80" stroke="#aaa" stroke-width="3" marker-end="url(#arrowhead)"/>
                                <line x1="20" y1="80" x2="20" y2="20" stroke="#aaa" stroke-width="3" marker-end="url(#arrowhead)"/>
                                <path d="M 25 75 Q 30 30 70 25" fill="none" stroke="#eee" stroke-width="3"/>
                            </svg>
                            Logarithmic
                        </button>
                    </div>
                </div>
                <svg width="0" height="0">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#aaa" />
                        </marker>
                    </defs>
                </svg>
            </div>
        `;

        document.getElementById('hm-min').addEventListener('input', (e) => { heatmapConfigs[currentProperty].minColor = e.target.value; updateGridVisuals(); });
        document.getElementById('hm-max').addEventListener('input', (e) => { heatmapConfigs[currentProperty].maxColor = e.target.value; updateGridVisuals(); });
        const hmMid = document.getElementById('hm-mid');
        if (hmMid) hmMid.addEventListener('input', (e) => { heatmapConfigs[currentProperty].midColor = e.target.value; updateGridVisuals(); });
        document.getElementById('hm-unk').addEventListener('input', (e) => { heatmapUnknownColor = e.target.value; updateGridVisuals(); });
        document.getElementById('hm-linear').addEventListener('click', () => { heatmapConfigs[currentProperty].scale = 'linear'; updateGridVisuals(); });
        document.getElementById('hm-log').addEventListener('click', () => { heatmapConfigs[currentProperty].scale = 'log'; updateGridVisuals(); });
        return;
    }
    
    if (currentProperty !== 'category' && currentProperty !== 'state') {
        legendContainer.innerHTML = '';
        return;
    }
    
    const categoryGroups = {
        'Metals': ['Alkali metal', 'Alkaline earth metal', 'Transition metal', 'Post-transition metal', 'Lanthanide', 'Actinide'],
        'Metalloids': ['Metalloid'],
        'Non-Metals': ['Reactive nonmetal', 'Noble gas']
    };
    const stateGroups = {
        'State': ['Solid', 'Liquid', 'Gas', 'Unknown']
    };

    let html = `
        <div class="legend-box category-box">
            <div class="legend-box-title">Element Series</div>
            <div class="legend-box-content">
    `;
    
    for (const [groupName, keys] of Object.entries(categoryGroups)) {
        html += `<div class="legend-group"><div class="legend-group-title interactive-super" data-group="${groupName}">${groupName}</div>`;
        for (const key of keys) {
            const color = categoryColors[key];
            if (color) {
                const glossBg = getGlossyBackground(color, key);
                html += `
                    <div class="legend-item" data-key="${key}" data-type="category" style="background: ${glossBg}; border: 1px solid ${color}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">
                        <span style="color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); font-weight: 500;">${key}</span>
                    </div>
                `;
            }
        }
        html += `</div>`;
    }
    html += `</div></div>`;
    
    html += `
        <div class="legend-box state-box">
            <div class="legend-box-title">State at Current Temp</div>
            <div class="legend-box-content">
    `;
    
    for (const [groupName, keys] of Object.entries(stateGroups)) {
        html += `<div class="legend-group">`;
        for (const key of keys) {
            const color = stateColors[key];
            if (color) {
                const countStr = (window.lastStateCounts && window.lastStateCounts[key] !== undefined) ? ` (${window.lastStateCounts[key]})` : '';
                const glossBg = getGlossyBackground(color, '');
                html += `
                    <div class="legend-item" data-key="${key}" data-type="state" style="background: transparent; border: 1px solid ${color}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">
                        <span style="color: ${color}; font-weight: 600;">${key}${countStr}</span>
                    </div>
                `;
            }
        }
        html += `</div>`;
    }
    html += `</div></div>`;
    
    legendContainer.innerHTML = html;
    
    // Interactions for individual items
    document.querySelectorAll('#in-grid-legend .legend-item').forEach(item => {
        // Restore box-shadow if this item is currently locked
        if (item.dataset.key === lockedLegendKey && item.dataset.type === lockedLegendType) {
            item.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
        }
        
        item.addEventListener('mouseenter', (e) => {
            if (lockedLegendKey || lockedLegendGroup) return;
            const key = e.currentTarget.dataset.key;
            const type = e.currentTarget.dataset.type;
            applyLegendHighlighting(key, type);
        });
        item.addEventListener('mouseleave', () => clearLegendHighlighting());
        item.addEventListener('click', (e) => {
            const key = e.currentTarget.dataset.key;
            const type = e.currentTarget.dataset.type;
            if (lockedLegendKey === key) {
                lockedLegendKey = null;
                lockedLegendType = null;
                lockedLegendGroup = null;
                e.currentTarget.style.boxShadow = '';
            } else {
                lockedLegendKey = key;
                lockedLegendType = type;
                lockedLegendGroup = null;
                document.querySelectorAll('#in-grid-legend .legend-item, #in-grid-legend .interactive-super').forEach(el => el.style.boxShadow = '');
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
            }
            clearLegendHighlighting();
        });
    });

    // Interactions for super categories
    document.querySelectorAll('#in-grid-legend .interactive-super').forEach(item => {
        item.addEventListener('mouseenter', (e) => {
            if (lockedLegendKey || lockedLegendGroup) return;
            const groupName = e.currentTarget.dataset.group;
            applyLegendHighlighting(null, null, categoryGroups[groupName]);
        });
        item.addEventListener('mouseleave', () => clearLegendHighlighting());
        item.addEventListener('click', (e) => {
            const groupName = e.currentTarget.dataset.group;
            if (lockedLegendGroup === groupName) {
                lockedLegendKey = null;
                lockedLegendType = null;
                lockedLegendGroup = null;
                e.currentTarget.style.boxShadow = '';
            } else {
                lockedLegendKey = null;
                lockedLegendType = null;
                lockedLegendGroup = groupName;
                document.querySelectorAll('#in-grid-legend .legend-item, #in-grid-legend .interactive-super').forEach(el => el.style.boxShadow = '');
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
            }
            clearLegendHighlighting();
        });
    });
}

// Select Element
function selectElement(z) {
    const el = getElementByNumber(z);
    if (!el) return;
    
    selectedElement = el;
    
    // Highlight in current grid
    document.querySelectorAll('.element-cell').forEach(c => c.classList.remove('selected'));
    const cell = document.querySelector(`.view-mode.active .element-cell[data-z="${z}"]`);
    if (cell) cell.classList.add('selected');
    
    // Open sidebar on mobile when element is clicked
    document.querySelectorAll('.view-right.sidebar').forEach(sb => sb.classList.add('open'));
    
    if (currentView === 'main') {
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('element-detail-card').classList.remove('hidden');
        
        document.getElementById('dh-number').innerText = el.atomicNumber;
        document.getElementById('dh-mass').innerText = el.atomicMass;
        document.getElementById('dh-symbol').innerText = el.symbol;
        document.getElementById('dh-name').innerText = el.name;
        
        updateSidebarValues();
    } else if (currentView === 'electrons') {
        document.getElementById('elec-empty-state').classList.add('hidden');
        document.getElementById('elec-element-card').classList.remove('hidden');
        document.getElementById('elec-details').classList.remove('hidden');
        
        document.getElementById('elec-number').innerText = el.atomicNumber;
        document.getElementById('elec-mass').innerText = el.atomicMass;
        document.getElementById('elec-symbol').innerText = el.symbol;
        document.getElementById('elec-name').innerText = el.name;
        
        document.getElementById('val-oxidation').innerText = el.oxidationStates || 'Unknown';
        
        const sortedNoble = sortElectronConfig(el.electronConfigurationNoble);
        const sortedExpanded = sortElectronConfig(el.electronConfiguration);
        
        document.getElementById('val-config').innerHTML = formatElectronConfigHTML(sortedNoble, el.atomicNumber);
        document.getElementById('val-config-exp').innerHTML = formatElectronConfigHTML(sortedExpanded, el.atomicNumber);
        document.getElementById('val-energy-level').innerText = el.electronsPerShell ? el.electronsPerShell.join(', ') : '-';
        
        const qn = getQuantumNumbers(sortedExpanded);
        document.getElementById('val-quantum').innerText = `n=${qn.n}, l=${qn.l}, m=${qn.m}`;
        
        updateSelectedCardVisuals();
        
        if (window.OrbitalViewer) {
            window.OrbitalViewer.setElement(el);
        }
        renderAufbauDiagram(el.electronConfiguration);
        drawLargeBohrModel(el);
    } else if (currentView === 'isotopes') {
        if (typeof updateIsotopesView === 'function') {
            updateIsotopesView(z);
        }
    }
}

function renderAufbauDiagram(configStr) {
    const gridContainer = document.getElementById('elec-in-grid-legend');
    if (!gridContainer) return;
    
    const parts = configStr ? configStr.split(' ') : [];
    const configMap = {};
    parts.forEach(p => {
        const match = p.match(/(\d[spdf])(\d+)/);
        if (match) configMap[match[1]] = parseInt(match[2]);
    });    
    const rows = [
        ['1s', '2s', '3s', '4s', '5s', '6s', '7s'],
        ['2p', '3p', '4p', '5p', '6p', '7p'],
        ['3d', '4d', '5d', '6d'],
        ['4f', '5f']
    ];

    const blockCap = { s: 1, p: 3, d: 5, f: 7 }; // number of orbitals
    const blockColorClass = { s: 's-block', p: 'p-block', d: 'd-block', f: 'f-block' };
    
    // Track the highest filled subshell to mark as active
    let lastFilledSubshell = parts.length > 0 ? parts[parts.length-1].match(/(\d[spdf])/)?.[1] : null;

    const blockColors = {
        s: '#00d4ff', // Vibrant Electric Cyan
        p: '#84cc16', // Vibrant Neon Lime Green
        d: '#d946ef', // Vibrant Saturated Neon Magenta
        f: '#3b82f6'  // Vibrant Electric Sapphire Blue
    };
    let html = `
    <div class="legend-box aufbau-box" style="display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; padding: 10px 16px; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 15px rgba(0,212,255,0.15);">
        <div class="legend-box-title" style="color: #00d4ff; font-weight: 800; letter-spacing: 1px; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid rgba(0, 212, 255, 0.25); padding-bottom: 4px;">Electron Configuration</div>
        <div class="legend-box-content" style="gap: 20px;">
            <div class="aufbau-diagram-container" style="margin: 0; align-items: flex-start; padding: 0;">
                <div class="aufbau-legend" style="margin-bottom: 0; gap: 6px;">
                    <div class="legend-item" data-key="s" data-type="block" style="background: rgba(0, 212, 255, 0.2); border: 1.5px solid #00d4ff; color: #00d4ff; font-weight: 700; border-radius: 6px; padding: 4px 10px; margin-bottom: 4px; box-shadow: 0 0 8px rgba(0, 212, 255, 0.3);">s-block</div>
                    <div class="legend-item" data-key="p" data-type="block" style="background: rgba(132, 204, 22, 0.2); border: 1.5px solid #84cc16; color: #84cc16; font-weight: 700; border-radius: 6px; padding: 4px 10px; margin-bottom: 4px; box-shadow: 0 0 8px rgba(132, 204, 22, 0.3);">p-block</div>
                    <div class="legend-item" data-key="d" data-type="block" style="background: rgba(217, 70, 239, 0.2); border: 1.5px solid #d946ef; color: #d946ef; font-weight: 700; border-radius: 6px; padding: 4px 10px; margin-bottom: 4px; box-shadow: 0 0 8px rgba(217, 70, 239, 0.3);">d-block</div>
                    <div class="legend-item" data-key="f" data-type="block" style="background: rgba(59, 130, 246, 0.2); border: 1.5px solid #3b82f6; color: #3b82f6; font-weight: 700; border-radius: 6px; padding: 4px 10px; margin-bottom: 4px; box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);">f-block</div>
                </div>
                <div class="aufbau-grid">
    `;

    const getLValue = (block) => {
        if (block === 's') return 0;
        if (block === 'p') return 1;
        if (block === 'd') return 2;
        if (block === 'f') return 3;
        return 0;
    };

    rows.forEach(row => {
        html += `<div class="aufbau-row">`;
        row.forEach((subshell) => {
            const blockType = subshell[1];
            
            const nValue = parseInt(subshell[0]);
            const lValue = getLValue(subshell[1]);
            const block = subshell[1];
            const numOrbitals = blockCap[block];
            const numElectrons = configMap[subshell] || 0;
            const bgClass = blockColorClass[block];
            const isActive = subshell === lastFilledSubshell;
            
            html += `<div class="subshell-group interactive-subshell" data-key="${subshell}" data-type="subshell" data-n="${nValue}" data-l="${lValue}" style="cursor: pointer; padding: 2px; border-radius: 4px; transition: transform 0.1s;">`;
            
            html += `<div class="subshell-label" style="font-weight: bold; color: #ffffff; text-shadow: 0 0 4px rgba(0,0,0,0.8);">${subshell}</div><div class="orbital-boxes">`;
            
            // Map box index to m values
            // For s: 0. For p: -1, 0, 1. For d: -2, -1, 0, 1, 2.
            let mValues = [];
            for (let m = -lValue; m <= lValue; m++) {
                mValues.push(m);
            }
            
            for (let i = 0; i < numOrbitals; i++) {
                let electronsInThisOrbital = 0;
                if (numElectrons > i) {
                    electronsInThisOrbital = 1; 
                    if (numElectrons > numOrbitals + i) electronsInThisOrbital = 2; 
                }
                
                let arrows = '';
                if (electronsInThisOrbital === 1) arrows = '<span class="arrow-up" style="color: #ffffff; font-weight: bold; text-shadow: 0 0 5px rgba(255,255,255,0.9);">&#x21BF;</span>';
                if (electronsInThisOrbital === 2) arrows = '<span class="arrow-up" style="color: #ffffff; font-weight: bold; text-shadow: 0 0 5px rgba(255,255,255,0.9);">&#x21BF;</span><span class="arrow-down" style="color: #00ffff; font-weight: bold; text-shadow: 0 0 5px rgba(0,255,255,0.9);">&#x21C2;</span>';
                
                let isLastOrbital = false;
                if (isActive) {
                    if (numElectrons <= numOrbitals && i === numElectrons - 1) isLastOrbital = true;
                    if (numElectrons > numOrbitals && i === numElectrons - numOrbitals - 1) isLastOrbital = true;
                }
                const activeClass = isLastOrbital ? 'active-orbital' : '';
                
                const boxColor = blockColors[blockType] || '#444';
                const hasElectrons = electronsInThisOrbital > 0;
                const glossyBg = hasElectrons ? getGlossyBackground(boxColor) : 'rgba(15, 23, 42, 0.65)';
                const boxBorder = hasElectrons ? `1.5px solid ${boxColor}` : '1px solid rgba(255, 255, 255, 0.12)';
                const boxGlow = hasElectrons ? `0 0 8px ${boxColor}` : 'none';
                
                const mVal = mValues[i] !== undefined ? mValues[i] : 0;
                
                html += `<div class="orbital-box interactive-box ${activeClass}" data-m="${mVal}" style="background: ${glossyBg}; border: ${boxBorder}; box-shadow: ${boxGlow}; border-radius: 3px; transition: transform 0.1s, box-shadow 0.1s;">${arrows}</div>`;
            }
            html += `</div></div>`; // close orbital-boxes and subshell-group
        });
        html += `</div>`;
    });

    html += `</div></div></div></div>`; // close grid, container, content, box
    gridContainer.innerHTML = html;

    // Bind event listeners for block legend ONLY (s, p, d, f indicators)
    document.querySelectorAll('#elec-in-grid-legend .legend-item').forEach(item => {
        if (item.dataset.key === lockedLegendKey && item.dataset.type === lockedLegendType) {
            item.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
        }
        
        item.addEventListener('mouseenter', (e) => {
            if (lockedLegendKey || lockedLegendGroup) return;
            const key = e.currentTarget.dataset.key;
            const type = e.currentTarget.dataset.type;
            applyLegendHighlighting(key, type);
        });
        item.addEventListener('mouseleave', (e) => {
            if (lockedLegendKey || lockedLegendGroup) return;
            clearLegendHighlighting();
        });
        item.addEventListener('click', (e) => {
            const key = e.currentTarget.dataset.key;
            const type = e.currentTarget.dataset.type;
            
            if (lockedLegendKey === key && lockedLegendType === type) {
                lockedLegendKey = null;
                lockedLegendType = null;
                e.currentTarget.style.boxShadow = 'none';
                clearLegendHighlighting();
            } else {
                document.querySelectorAll('#elec-in-grid-legend .legend-item').forEach(el => {
                    el.style.boxShadow = 'none';
                });
                lockedLegendKey = key;
                lockedLegendType = type;
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)';
                applyLegendHighlighting(key, type);
            }
        });
    });

    // Add specific interaction handlers for 3D orbital viewer
    document.querySelectorAll('.interactive-subshell').forEach(subshell => {
        subshell.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        });
        subshell.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'transparent';
        });
        subshell.addEventListener('click', (e) => {
            // Clicking the group means we want 'all' orientations
            const n = parseInt(e.currentTarget.dataset.n);
            const l = parseInt(e.currentTarget.dataset.l);
            if (window.OrbitalViewer) {
                window.OrbitalViewer.drawOrbital(n, l, 'all');
            }
        });
    });

    document.querySelectorAll('.interactive-box').forEach(box => {
        box.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
            e.currentTarget.style.boxShadow = '0 0 5px rgba(255,255,255,0.8)';
            e.currentTarget.style.zIndex = '10';
        });
        box.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.zIndex = '1';
        });
        box.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the subshell group click
            const group = e.currentTarget.closest('.interactive-subshell');
            if (group) {
                const n = parseInt(group.dataset.n);
                const l = parseInt(group.dataset.l);
                const m = parseInt(e.currentTarget.dataset.m);
                if (window.OrbitalViewer) {
                    window.OrbitalViewer.drawOrbital(n, l, m);
                }
            }
        });
    });

    // Automatically show the valence shell in 3D viewer when Aufbau is rendered
    if (window.OrbitalViewer && lastFilledSubshell) {
        const nMatch = parseInt(lastFilledSubshell[0]);
        const lMatch = getLValue(lastFilledSubshell[1]);
        window.OrbitalViewer.drawOrbital(nMatch, lMatch, 'all');
    }
}

function updateSidebarValues() {
    if (!selectedElement) return;
    const el = selectedElement;
    
    document.getElementById('val-category').innerText = el.category;
    document.getElementById('val-atomicMass').innerText = el.atomicMass;
    document.getElementById('val-energyLevels').innerText = el.electronsPerShell ? el.electronsPerShell.join(', ') : '-';
    document.getElementById('val-electronegativity').innerText = el.electronegativity || '-';
    document.getElementById('val-discovered').innerText = el.discoveryYear || '-';
    
    const wikiBtn = document.getElementById('val-wiki');
    if (wikiBtn) {
        wikiBtn.parentElement.onclick = () => {
            // Let the prop-item click handler do its thing to set it as active,
            // but also we can directly open the modal if we want.
            // Wait, if they just want it to be a normal property row, it will get selected by the prop-item listener.
        };
        wikiBtn.onclick = (e) => {
            e.stopPropagation(); // prevent row click
            if (window.openWikiModal) window.openWikiModal(el.name);
        };
    }
    
    const wikiViewBtn = document.getElementById('wiki-writeup-view');
    if (wikiViewBtn) {
        if (currentProperty === 'wiki') {
            wikiViewBtn.classList.remove('hidden');
        } else {
            wikiViewBtn.classList.add('hidden');
        }
        const nameEl = document.getElementById('wiki-element-name');
        if (nameEl) nameEl.innerText = el.name;
    }
    
    let currentState = 'Unknown';
    if (el.meltingPoint !== null && el.meltingPoint !== undefined && el.boilingPoint !== null && el.boilingPoint !== undefined) {
        if (currentTemp < el.meltingPoint) currentState = 'Solid';
        else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
        else currentState = 'Gas';
    }
    document.getElementById('val-state').innerText = currentState;

    const bohrEl = document.getElementById('dh-bohr');
    if (bohrEl) {
        bohrEl.innerHTML = generateMiniBohrSVG(el.electronsPerShell);
    }

    // Apply dynamic card styling matching the current table view mode
    updateSelectedCardVisuals();

    const fmt = (val, dec) => (val === null || val === undefined) ? 'N/A' : Number(val).toLocaleString(undefined, {maximumFractionDigits: dec});

    // Temp logic
    const convertTemp = (k, unit) => {
        if (!k) return null;
        if (unit === 'C') return k - 273.15;
        if (unit === 'F') return (k - 273.15) * 9/5 + 32;
        return k;
    };
    
    const uTemp1 = document.getElementById('unit-temp1').value;
    document.getElementById('val-meltingPoint').innerText = fmt(convertTemp(el.meltingPoint, uTemp1), 1);
    
    const uTemp2 = document.getElementById('unit-temp2').value;
    document.getElementById('val-boilingPoint').innerText = fmt(convertTemp(el.boilingPoint, uTemp2), 1);

    // Energy logic (1 kJ/mol = 0.010364 eV)
    const convertEnergy = (kj, unit) => {
        if (kj === null || kj === undefined) return null;
        return unit === 'eV' ? kj * 0.010364 : kj;
    };
    const uAffinity = document.getElementById('unit-affinity').value;
    document.getElementById('val-electronAffinity').innerText = fmt(convertEnergy(el.electronAffinity, uAffinity), 1);

    const subIon = parseInt(document.getElementById('sub-ionization').value);
    const uIon = document.getElementById('unit-ionization').value;
    const ionVal = el.ionizationEnergies && el.ionizationEnergies.length > subIon ? el.ionizationEnergies[subIon] : null;
    document.getElementById('val-ionization').innerText = fmt(convertEnergy(ionVal, uIon), 1);

    // Radius (1 pm = 0.01 A)
    const subRad = document.getElementById('sub-radius').value;
    const uRad = document.getElementById('unit-radius').value;
    const radVal = el.radius && el.radius[subRad] !== undefined ? el.radius[subRad] : null;
    document.getElementById('val-radius').innerText = fmt(uRad === 'A' && radVal ? radVal * 0.01 : radVal, uRad === 'A' ? 3 : 0);

    // Hardness
    const subHard = document.getElementById('sub-hardness').value;
    const hardVal = el.hardness && el.hardness[subHard] !== undefined ? el.hardness[subHard] : null;
    document.getElementById('val-hardness').innerText = fmt(hardVal, 1);
    document.getElementById('unit-hardness-span').innerText = subHard === 'mohs' ? '' : 'MPa';

    // Modulus
    const subMod = document.getElementById('sub-modulus').value;
    const modVal = el.modulus && el.modulus[subMod] !== undefined ? el.modulus[subMod] : null;
    document.getElementById('val-modulus').innerText = fmt(modVal, 1);

    // Density (stored as kg/m3 except maybe gases. wait, H is 0.08988 kg/m3. 1 kg/m3 = 0.001 g/cm3)
    const subDen = document.getElementById('sub-density').value;
    const uDen = document.getElementById('unit-density').value;
    const denVal = el.density && el.density[subDen] !== undefined ? el.density[subDen] : null;
    document.getElementById('val-density').innerText = fmt(uDen === 'g/cm3' && denVal ? denVal * 0.001 : denVal, 4);

    // Conductivity
    const subCond = document.getElementById('sub-conductivity').value;
    const condVal = el.conductivity && el.conductivity[subCond] !== undefined ? el.conductivity[subCond] : null;
    document.getElementById('val-conductivity').innerText = fmt(condVal, 4);
    document.getElementById('unit-conductivity-span').innerText = subCond === 'thermal' ? 'W/mK' : 'MS/m';

    // Heat
    const subHeat = document.getElementById('sub-heat').value;
    const heatVal = el.heat && el.heat[subHeat] !== undefined ? el.heat[subHeat] : null;
    document.getElementById('val-heat').innerText = fmt(heatVal, 4);
    document.getElementById('unit-heat-span').innerText = subHeat === 'specific' ? 'J/kgK' : 'kJ/mol';

    // Abundance
    const subAbund = document.getElementById('sub-abundance').value;
    const abundVal = el.abundance && el.abundance[subAbund] !== undefined ? el.abundance[subAbund] : null;
    document.getElementById('val-abundance').innerText = fmt(abundVal, 8);
}

function drawLargeBohrModel(el) {
    const container = document.getElementById('bohr-reference');
    if (!el.electronsPerShell) return;
    
    let svg = `<svg viewBox="0 0 200 200" width="100%" height="100%">`;
    
    // Nucleus
    svg += `<circle cx="100" cy="100" r="12" fill="var(--accent-amber)" />`;
    svg += `<text x="100" y="104" fill="#000" font-size="12" text-anchor="middle" font-weight="bold" font-family="var(--font-mono)">${el.symbol}</text>`;
    
    const shells = el.electronsPerShell;
    
    for (let i = 0; i < shells.length; i++) {
        const r = 25 + i * (70 / Math.max(1, shells.length));
        const eCount = shells[i];
        
        // Orbital ring
        svg += `<circle cx="100" cy="100" r="${r}" stroke="rgba(0,212,255,0.3)" stroke-width="1.5" fill="none" />`;
        
        // Electrons (animated)
        for (let j = 0; j < eCount; j++) {
            const angleOffset = (360 / eCount) * j;
            const dur = (i + 1) * 4 + 2; // slower outer shells
            svg += `
            <g>
                <animateTransform attributeName="transform" type="rotate" from="${angleOffset} 100 100" to="${angleOffset + 360} 100 100" dur="${dur}s" repeatCount="indefinite" />
                <circle cx="${100 + r}" cy="100" r="3" fill="var(--accent-cyan)" />
            </g>
            `;
        }
    }
    
    svg += `</svg>`;
    container.innerHTML = svg;
}

function setupLayoutToggle() {
    const btn = document.getElementById('btn-layout-toggle');
    const grid = document.getElementById('main-grid');
    if (!btn || !grid) return;

    btn.onclick = () => {
        tableLayoutMode = tableLayoutMode === '18col' ? '32col' : '18col';
        
        if (tableLayoutMode === '32col') {
            grid.classList.add('extended-32col');
            btn.textContent = '↩️';
            btn.title = 'Switch to Standard 18-Col View';
            btn.style.background = 'rgba(74, 222, 128, 0.2)';
            btn.style.borderColor = '#4ade80';
            btn.style.color = '#4ade80';
            btn.style.boxShadow = '0 0 12px rgba(74, 222, 128, 0.35)';
        } else {
            grid.classList.remove('extended-32col');
            btn.textContent = '↔️';
            btn.title = 'Switch to Extended 32-Col View';
            btn.style.background = 'rgba(0, 212, 255, 0.1)';
            btn.style.borderColor = 'rgba(0, 212, 255, 0.35)';
            btn.style.color = '#00d4ff';
            btn.style.boxShadow = '0 0 8px rgba(0, 212, 255, 0.15)';
        }
        
        renderGrid();
    };
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupLayoutToggle();
    renderGrid(); // Initial render for main view
    
    // Check if three-canvas-container exists and initialize
    if (document.getElementById('three-canvas-container')) {
        if (window.OrbitalViewer) window.OrbitalViewer.init('three-canvas-container');
    }

    // Process deep-link URL hash if present
    handleHashRouting();
});

function generateMiniBohrSVG(shells) {
    if (!shells || shells.length === 0) return '';
    let svg = `<svg viewBox="0 0 100 100" width="100%" height="100%">`;
    svg += `<circle cx="50" cy="50" r="6" fill="var(--accent-amber)" />`;
    const step = 40 / Math.max(1, shells.length);
    for (let i = 0; i < shells.length; i++) {
        const r = 10 + i * step;
        svg += `<circle cx="50" cy="50" r="${r}" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />`;
    }
    svg += `</svg>`;
    return svg;
}


