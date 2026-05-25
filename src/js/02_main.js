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

// Grid layout mapping
function getGridPosition(z) {
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

// Category Colors
const categoryColors = {
    'Alkali metal': '#ff6666',
    'Alkaline earth metal': '#ffdead',
    'Transition metal': '#ffc0c0',
    'Post-transition metal': '#cccccc',
    'Metalloid': '#cccc99',
    'Reactive nonmetal': '#a0ffa0',
    'Noble gas': '#c0ffff',
    'Lanthanide': '#ffbfff',
    'Actinide': '#ff99cc',
    'Unknown': '#e8e8e8'
};

// State Colors for Background
const stateColors = {
    'Solid': '#3b82f6', // Blue
    'Liquid': '#f59e0b', // Amber
    'Gas': '#ef4444', // Red
    'Unknown': '#6b7280' // Gray
};

// State Colors for Text
const stateTextColors = {
    'Solid': '#e2e8f0', // Standard White
    'Liquid': '#00d4ff', // Cyan
    'Gas': '#ef4444', // Red
    'Unknown': '#94a3b8' // Gray
};

// UI Setup
function setupUI() {
    // Mode toggle
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const viewId = e.target.dataset.view;
            currentView = viewId;
            document.querySelectorAll('.view-mode').forEach(v => v.classList.remove('active'));
            document.getElementById('view-' + viewId).classList.add('active');
            
            renderGrid();
            if (selectedElement) {
                selectElement(selectedElement.atomicNumber);
            }
            if (viewId === 'electrons') {
                if (window.OrbitalViewer) {
                    // Small delay to ensure CSS display:block has taken effect
                    setTimeout(() => window.OrbitalViewer.resize(), 50);
                }
            }
        });
    });
    
    // Property Sidebar selection
    document.querySelectorAll('.prop-item:not(.non-interactive):not(.elec-prop-item)').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'option') return;
            document.querySelectorAll('.prop-item:not(.elec-prop-item)').forEach(p => p.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentProperty = target.dataset.prop;
            updateGridVisuals();
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
    if (k < 273) {
        const pct = k / 273;
        return `rgb(0, ${Math.round(255 * pct)}, 255)`;
    } else if (k < 1000) {
        const pct = (k - 273) / (1000 - 273);
        return `rgb(${Math.round(255 * pct)}, 255, ${Math.round(255 * (1 - pct))})`;
    } else if (k < 3000) {
        const pct = (k - 1000) / (3000 - 1000);
        return `rgb(255, ${Math.round(255 - 119 * pct)}, 0)`;
    } else {
        const pct = Math.min(1, (k - 3000) / (6000 - 3000));
        return `rgb(255, ${Math.round(136 * (1 - pct))}, 0)`;
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
    const color = getTempColor(k);
    
    displayContainer.style.color = color;
    displayContainer.style.textShadow = `0 0 8px ${color.replace('rgb', 'rgba').replace(')', ', 0.5)')}`;
    
    const slider = document.getElementById('temp-slider');
    
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
    const gridId = currentView === 'electrons' ? 'electrons-grid' : 'main-grid';
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = '';
    
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
    }
    
    for (let i = 1; i <= 118; i++) {
        const elData = getElementByNumber(i);
        const pos = getGridPosition(i);
        
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.dataset.z = i;
        cell.style.gridColumn = pos.col;
        cell.style.gridRow = pos.row;
        
        let bohrHtml = '';
        if (currentView === 'electrons' && elData) {
            bohrHtml = `
                <div class="cell-bohr" id="bohr-mini-${i}" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; opacity:0.25; pointer-events:none; display:flex; align-items:center; justify-content:center; color: inherit;">
                    ${generateMiniBohrSVG(elData.electronsPerShell)}
                </div>
            `;
        }

        if (currentView === 'main' || elData) {
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
    if (cat === 'Diatomic nonmetal' || cat === 'Polyatomic nonmetal') return 'Reactive nonmetal';
    if (cat.toLowerCase().includes('unknown')) return 'Unknown';
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
    const gridId = isMain ? '#main-grid' : '#electrons-grid';
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
    const blockColors = { s: '#0d5f66', p: '#4a5c00', d: '#5d0f40', f: '#0022a1' };

    cells.forEach(cell => {
        const z = parseInt(cell.dataset.z);
        const elData = getElementByNumber(z);
        if (!elData) return;
        const normalizedCategory = getNormalizedCategory(elData.category);
        
        // 1. Determine State at currentTemp for text color (always active)
        let currentState = 'Unknown';
        if (elData.meltingPoint && elData.boilingPoint) {
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
            symSpan.style.textShadow = '0 0 4px rgba(0,0,0,0.8)'; // Ensure legibility
        }

        if (currentView === 'electrons') {
            const bohrWrapper = cell.querySelector('.cell-bohr');
            if (bohrWrapper) {
                bohrWrapper.style.color = stateTextColors[currentState];
                bohrWrapper.style.textShadow = '0 0 4px rgba(0,0,0,0.8)';
            }
        }

        // 2. Determine Background/Border/Value
        let color = '#333';
        let valText = '';

        if (isMain) {
            if (currentProperty === 'category') {
                color = categoryColors[normalizedCategory] || '#333';
                valText = elData.atomicMass ? elData.atomicMass.toFixed(3) : '';
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
                if (isException) {
                    color = '#aa0000'; // Dark red background for exception in view
                } else {
                    color = blockColors[elData.block] || '#333';
                }
                
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
                
                valText = formatElectronConfigHTML(displayStr, 0); // 0 atomicNumber means no red text coloring on the grid itself, since bg is red
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
        cell.style.borderColor = color;

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
        
        const normalizedCategory = getNormalizedCategory(el.category);
        const card = document.getElementById('elec-element-card');
        if (card) {
            card.style.background = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
            card.style.borderColor = categoryColors[normalizedCategory] || 'rgba(0,212,255,0.3)';
        }
        
        const symEl = document.getElementById('elec-symbol');
        if (symEl) {
            let currentState = 'Unknown';
            if (el.meltingPoint && el.boilingPoint) {
                if (currentTemp < el.meltingPoint) currentState = 'Solid';
                else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
                else currentState = 'Gas';
            }
            symEl.style.color = stateTextColors[currentState] || '#e2e8f0';
        }
        
        if (window.OrbitalViewer) {
            window.OrbitalViewer.setElement(el);
        }
        renderAufbauDiagram(el.electronConfiguration);
        drawLargeBohrModel(el);
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
        [null, '7p', '6d', '5f'],
        ['7s', '6p', '5d', '4f'],
        ['6s', '5p', '4d', null],
        ['5s', '4p', '3d', null],
        ['4s', '3p', null, null],
        ['3s', '2p', null, null],
        ['2s', null, null, null],
        ['1s', null, null, null]
    ];

    const blockCap = { s: 1, p: 3, d: 5, f: 7 }; // number of orbitals
    const blockColorClass = { s: 's-block', p: 'p-block', d: 'd-block', f: 'f-block' };
    
    // Track the highest filled subshell to mark as active
    let lastFilledSubshell = parts.length > 0 ? parts[parts.length-1].match(/(\d[spdf])/)?.[1] : null;

    const blockColors = { s: '#0d5f66', p: '#4a5c00', d: '#5d0f40', f: '#0022a1' };
    let html = `
    <div class="legend-box aufbau-box" style="display: flex; flex-direction: column;">
        <div class="legend-box-title">Electron Configuration</div>
        <div class="legend-box-content" style="gap: 20px;">
            <div class="aufbau-diagram-container" style="margin: 0; align-items: flex-end; padding: 0;">
                <div class="aufbau-legend" style="margin-bottom: 0;">
                    <div class="legend-item" data-key="s" data-type="block" style="background: ${getGlossyBackground(blockColors.s)}; border: 1px solid ${blockColors.s}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">s-block</div>
                    <div class="legend-item" data-key="p" data-type="block" style="background: ${getGlossyBackground(blockColors.p)}; border: 1px solid ${blockColors.p}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">p-block</div>
                    <div class="legend-item" data-key="d" data-type="block" style="background: ${getGlossyBackground(blockColors.d)}; border: 1px solid ${blockColors.d}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">d-block</div>
                    <div class="legend-item" data-key="f" data-type="block" style="background: ${getGlossyBackground(blockColors.f)}; border: 1px solid ${blockColors.f}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">f-block</div>
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
        row.forEach((subshell, colIndex) => {
            const blockType = ['s', 'p', 'd', 'f'][colIndex];
            
            if (!subshell) {
                html += `<div class="subshell-group block-type-${blockType}"></div>`;
                return;
            }

            const nValue = parseInt(subshell[0]);
            const lValue = getLValue(subshell[1]);
            const block = subshell[1];
            const numOrbitals = blockCap[block];
            const numElectrons = configMap[subshell] || 0;
            const bgClass = blockColorClass[block];
            const isActive = subshell === lastFilledSubshell;
            
            html += `<div class="subshell-group interactive-subshell" data-key="${subshell}" data-type="subshell" data-n="${nValue}" data-l="${lValue}" style="cursor: pointer; padding: 2px; border-radius: 4px; transition: transform 0.1s;">`;
            
            html += `<div class="subshell-label">${subshell}</div><div class="orbital-boxes">`;
            
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
                if (electronsInThisOrbital === 1) arrows = '<span class="arrow-up">&#x21BF;</span>';
                if (electronsInThisOrbital === 2) arrows = '<span class="arrow-up">&#x21BF;</span><span class="arrow-down">&#x21C2;</span>';
                
                let isLastOrbital = false;
                if (isActive) {
                    if (numElectrons <= numOrbitals && i === numElectrons - 1) isLastOrbital = true;
                    if (numElectrons > numOrbitals && i === numElectrons - numOrbitals - 1) isLastOrbital = true;
                }
                const activeClass = isLastOrbital ? 'active-orbital' : '';
                
                const boxColor = blockColors[blockType] || '#444';
                const glossyBg = getGlossyBackground(boxColor);
                
                const mVal = mValues[i] !== undefined ? mValues[i] : 0;
                
                html += `<div class="orbital-box interactive-box ${activeClass}" data-m="${mVal}" style="background: ${glossyBg}; border: 1px solid ${boxColor}; border-radius: 2px; transition: transform 0.1s, box-shadow 0.1s;">${arrows}</div>`;
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
    
    let currentState = 'Unknown';
    if (el.meltingPoint && el.boilingPoint) {
        if (currentTemp < el.meltingPoint) currentState = 'Solid';
        else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
        else currentState = 'Gas';
    }
    document.getElementById('val-state').innerText = currentState;

    // Apply styling to element detail card
    const normalizedCategory = getNormalizedCategory(el.category);
    const card = document.getElementById('element-detail-card');
    if (card) {
        card.style.background = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
        card.style.borderColor = categoryColors[normalizedCategory] || 'rgba(0,212,255,0.3)';
    }

    const symEl = document.getElementById('dh-symbol');
    if (symEl) {
        symEl.style.color = stateTextColors[currentState] || '#e2e8f0';
    }

    const bohrEl = document.getElementById('dh-bohr');
    if (bohrEl) {
        bohrEl.innerHTML = generateMiniBohrSVG(el.electronsPerShell);
        bohrEl.style.color = stateTextColors[currentState] || '#e2e8f0';
    }

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

// Init
window.addEventListener('DOMContentLoaded', () => {
    setupUI();
    renderGrid(); // Initial render for main view
    
    // Check if three-canvas-container exists and initialize
    if (document.getElementById('three-canvas-container')) {
        if (window.OrbitalViewer) window.OrbitalViewer.init('three-canvas-container');
    }
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


