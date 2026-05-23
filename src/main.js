// Constants & State
let currentTemp = 298; // Kelvin
let tempUnit = 'K';
let currentProperty = 'category';
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

function applyLegendHighlighting(key, type, keys = null) {
    const grid = document.getElementById('main-grid');
    if (!grid) return;
    grid.classList.add('highlighting-active');
    
    document.querySelectorAll('#main-grid .element-cell').forEach(cell => {
        if (keys) {
            if (keys.includes(cell.dataset.category)) cell.classList.add('highlighted');
            else cell.classList.remove('highlighted');
        } else {
            const elProp = type === 'state' ? cell.dataset.state : cell.dataset.category;
            if (elProp === key) cell.classList.add('highlighted');
            else cell.classList.remove('highlighted');
        }
    });
}

function clearLegendHighlighting() {
    if (lockedLegendKey || lockedLegendGroup) {
        applyLegendHighlighting(lockedLegendKey, lockedLegendType, lockedLegendGroup ? categoryGroups[lockedLegendGroup] : null);
        return;
    }
    const grid = document.getElementById('main-grid');
    if (!grid) return;
    grid.classList.remove('highlighting-active');
    document.querySelectorAll('#main-grid .element-cell').forEach(cell => {
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
        });
    });
    
    // Property Sidebar selection
    document.querySelectorAll('.prop-item:not(.non-interactive)').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'option') return;
            document.querySelectorAll('.prop-item').forEach(p => p.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            currentProperty = target.dataset.prop;
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

    // Temp slider
    const tempSlider = document.getElementById('temp-slider');
    tempSlider.addEventListener('input', (e) => {
        currentTemp = parseFloat(e.target.value);
        updateTempDisplay();
        if (currentProperty === 'category' || currentProperty === 'state') updateGridVisuals();
        updateSidebarValues();
    });

    // Timeline slider
    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider) {
        timelineSlider.addEventListener('input', (e) => {
            currentTimelineYear = parseInt(e.target.value);
            document.getElementById('timeline-display').innerText = currentTimelineYear;
            if (currentProperty === 'discoveryYear') updateGridVisuals();
        });
    }
    // Orbital Controls
    document.getElementById('orbital-n').addEventListener('change', drawOrbital);
    document.getElementById('orbital-l').addEventListener('change', () => {
        updateMlOptions();
        drawOrbital();
    });
    document.getElementById('orbital-ml').addEventListener('change', drawOrbital);
}

function updateMlOptions() {
    const lSelect = document.getElementById('orbital-l');
    const mlSelect = document.getElementById('orbital-ml');
    const l = parseInt(lSelect.value);
    
    mlSelect.innerHTML = '';
    for (let ml = -l; ml <= l; ml++) {
        mlSelect.innerHTML += `<option value="${ml}">m=${ml}</option>`;
    }
}

function updateTempDisplay() {
    const k = currentTemp;
    const c = k - 273.15;
    const f = c * 9/5 + 32;
    document.getElementById('temp-display').innerText = `${Math.round(k)} K  |  ${Math.round(c)} °C  |  ${Math.round(f)} °F`;
}

function generateMiniBohrSVG(shells) {
    if (!shells || shells.length === 0) return '';
    let svg = `<svg viewBox="0 0 100 100" width="100%" height="100%">`;
    svg += `<circle cx="50" cy="50" r="6" fill="var(--accent-amber)" />`;
    const step = 38 / Math.max(1, shells.length);
    for (let i = 0; i < shells.length; i++) {
        const r = 10 + i * step;
        svg += `<circle cx="50" cy="50" r="${r}" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none" />`;
    }
    const shellText = shells.join(', ');
    svg += `<text x="50" y="96" fill="currentColor" font-size="22" font-family="var(--font-mono)" text-anchor="middle" font-weight="bold">${shellText}</text>`;
    svg += `</svg>`;
    return svg;
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
    }
    
    for (let i = 1; i <= 118; i++) {
        const elData = getElementByNumber(i);
        const pos = getGridPosition(i);
        
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.dataset.z = i;
        cell.style.gridColumn = pos.col;
        cell.style.gridRow = pos.row;
        
        if (currentView === 'main') {
            cell.innerHTML = `
                <span class="cell-num">${i}</span>
                <span class="cell-sym">${elData ? elData.symbol : '?'}</span>
                <span class="cell-name">${elData ? elData.name : ''}</span>
                <span class="cell-value" id="cell-val-${i}"></span>
            `;
        } else if (currentView === 'electrons') {
            if (elData) {
                // Mini Bohr Model SVG
                cell.innerHTML = `
                    <span class="cell-num">${i}</span>
                    <span class="cell-sym" style="position:absolute; top:2px; right:4px; font-size:0.6rem;">${elData.symbol}</span>
                    <div class="cell-bohr" id="bohr-mini-${i}" style="color: inherit;">
                        ${generateMiniBohrSVG(elData.electronsPerShell)}
                    </div>
                `;
            } else {
                cell.innerHTML = `<span class="cell-num">${i}</span>`;
            }
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

// Update Grid Colors based on currentProperty
function updateGridVisuals() {
    if (currentView !== 'main') return;
    
    // Toggle controllers
    const tempWrapper = document.getElementById('temp-controller-wrapper');
    const timelineWrapper = document.getElementById('timeline-controller-wrapper');
    if (tempWrapper && timelineWrapper) {
        if (currentProperty === 'discoveryYear') {
            tempWrapper.classList.add('hidden');
            timelineWrapper.classList.remove('hidden');
            timelineWrapper.style.display = 'flex';
        } else {
            tempWrapper.classList.remove('hidden');
            tempWrapper.style.display = 'block'; // or flex, but default is usually block for div
            timelineWrapper.classList.add('hidden');
        }
    }

    const cells = document.querySelectorAll('#main-grid .element-cell');
    let solidCount = 0, liquidCount = 0, gasCount = 0;

    cells.forEach(cell => {
        const z = parseInt(cell.dataset.z);
        const el = getElementByNumber(z);
        if (!el) return;
        const normalizedCategory = getNormalizedCategory(el.category);
        
        // 1. Determine State at currentTemp for text color (always active)
        let currentState = 'Unknown';
        if (el.meltingPoint && el.boilingPoint) {
            if (currentTemp < el.meltingPoint) currentState = 'Solid';
            else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
            else currentState = 'Gas';
        }
        
        if (currentState === 'Solid') solidCount++;
        if (currentState === 'Liquid') liquidCount++;
        if (currentState === 'Gas') gasCount++;

        const symSpan = cell.querySelector('.cell-sym');
        if (symSpan) {
            symSpan.style.color = stateTextColors[currentState];
            symSpan.style.textShadow = '0 0 4px rgba(0,0,0,0.8)'; // Ensure legibility
        }

        if (currentView === 'electrons') {
            // Apply text color to bohr model wrapper
            const bohrWrapper = cell.querySelector('.cell-bohr');
            if (bohrWrapper) {
                bohrWrapper.style.color = stateTextColors[currentState];
                bohrWrapper.style.textShadow = '0 0 4px rgba(0,0,0,0.8)';
            }
        }

        // 2. Determine Background/Border based on selected property
        let bgStyle = 'rgba(255,255,255,0.05)';
        let borderColor = 'transparent';
        let valText = '';

        if (currentProperty === 'category') {
            bgStyle = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
            borderColor = categoryColors[normalizedCategory];
            valText = el.atomicMass ? el.atomicMass.toFixed(3) : '';
        }
        else if (currentProperty === 'state') {
            const stColor = stateColors[currentState] || '#6b7280';
            bgStyle = getGlossyBackground(stColor, normalizedCategory);
            borderColor = stColor;
            valText = currentState;
        }
        else if (heatmapConfigs[currentProperty]) {
            const numValue = getPropertyValue(el, currentProperty);
            
            // Special handling for discoveryYear 'Ancient'
            if (currentProperty === 'discoveryYear' && el.discoveryYear === 'Ancient') {
                bgStyle = getGlossyBackground('#ffffff', normalizedCategory);
                borderColor = '#ffffff';
                valText = 'Ancient';
            } else if (numValue !== null && numValue !== undefined && !isNaN(numValue)) {
                const color = getGradientColor(numValue, currentProperty);
                bgStyle = getGlossyBackground(color, normalizedCategory);
                borderColor = color || '#444';
                
                if (currentProperty === 'energyLevels' && el.electronsPerShell) {
                    valText = el.electronsPerShell.join(', ');
                } else if (currentProperty === 'discoveryYear') {
                    valText = numValue;
                } else {
                    let text = Number(numValue);
                    if (!Number.isInteger(text)) {
                        valText = (text > 100 || text < -100) ? Math.round(text) : Number(text.toPrecision(3)).toString();
                    } else {
                        valText = text;
                    }
                }
            } else {
                bgStyle = getGlossyBackground(heatmapUnknownColor, normalizedCategory);
                borderColor = heatmapUnknownColor;
                valText = '';
            }
        }

        cell.style.background = bgStyle;
        cell.style.borderColor = borderColor;

        // Timeline opacity logic
        if (currentProperty === 'discoveryYear') {
            if (el.discoveryYear === 'Ancient') {
                cell.style.opacity = '1';
                cell.style.filter = 'none';
            } else {
                const dYear = parseInt(el.discoveryYear);
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

        if (currentProperty === 'category') {
            const stateColor = stateTextColors[currentState] || '#e2e8f0';
            const sym = cell.querySelector('.cell-sym');
            if (sym) {
                sym.style.color = stateColor;
                sym.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
            }
        } else {
            const sym = cell.querySelector('.cell-sym');
            if (sym) {
                sym.style.color = '';
                sym.style.textShadow = '';
            }
        }
        
        // Add datasets for hover highlighting
        cell.dataset.category = normalizedCategory;
        cell.dataset.state = currentState;

        const valSpan = cell.querySelector('.cell-value');
        if(valSpan) valSpan.innerText = valText;
    });
    
    if (currentProperty === 'state') {
        document.getElementById('state-counter').innerText = `${solidCount} Solid / ${liquidCount} Liquid / ${gasCount} Gas`;
    } else {
        document.getElementById('state-counter').innerText = '';
    }
    
    // Reapply locks if any
    clearLegendHighlighting();
    renderLegend();
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
                const glossBg = getGlossyBackground(color, '');
                html += `
                    <div class="legend-item" data-key="${key}" data-type="state" style="background: transparent; border: 1px solid ${color}; border-radius: 4px; padding: 4px 8px; margin-bottom: 2px;">
                        <span style="color: ${color}; font-weight: 600;">${key}</span>
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
        
        document.getElementById('elec-sym').innerText = el.symbol;
        document.getElementById('elec-name').innerText = el.name;
        document.getElementById('elec-config').innerText = el.electronConfiguration;
        document.getElementById('elec-config-noble').innerText = el.electronConfigurationNoble;
        
        drawLargeBohrModel(el);
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

// Three.js Orbital Viewer Placeholder
let scene, camera, renderer, currentOrbitalGroup;
function initThreeJS() {
    const container = document.getElementById('three-canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0e1a');
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 2;
    camera.lookAt(0,0,0);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const light = new THREE.PointLight(0xffffff, 1.2, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    
    // Axes helper
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    window.addEventListener('resize', () => {
        if(container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
    
    animate();
}

function drawOrbital() {
    if (!scene) return;
    if (currentOrbitalGroup) scene.remove(currentOrbitalGroup);
    
    currentOrbitalGroup = new THREE.Group();
    
    const n = parseInt(document.getElementById('orbital-n').value);
    const l = parseInt(document.getElementById('orbital-l').value);
    const ml = parseInt(document.getElementById('orbital-ml').value || 0);

    const materialPos = new THREE.MeshPhongMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6, wireframe: false });
    const materialNeg = new THREE.MeshPhongMaterial({ color: 0xef4444, transparent: true, opacity: 0.6, wireframe: false });

    // Base scale on n
    const scale = 1 + (n * 0.2);

    if (l === 0) {
        // s-orbital: sphere
        const geometry = new THREE.SphereGeometry(1.5 * scale, 32, 32);
        const mesh = new THREE.Mesh(geometry, materialPos);
        currentOrbitalGroup.add(mesh);
    } 
    else if (l === 1) {
        // p-orbital: 2 lobes
        const lobeGeom = new THREE.SphereGeometry(1 * scale, 32, 32);
        lobeGeom.scale(1, 1.5, 1);
        
        const lobe1 = new THREE.Mesh(lobeGeom, materialPos);
        const lobe2 = new THREE.Mesh(lobeGeom, materialNeg);
        
        lobe1.position.y = 1.2 * scale;
        lobe2.position.y = -1.2 * scale;

        // Orient based on ml
        if (ml === 0) {
            // pz
            lobe1.rotation.x = Math.PI / 2;
            lobe2.rotation.x = Math.PI / 2;
            lobe1.position.set(0, 0, 1.2 * scale);
            lobe2.position.set(0, 0, -1.2 * scale);
        } else if (ml === 1) {
            // px
            lobe1.rotation.z = Math.PI / 2;
            lobe2.rotation.z = Math.PI / 2;
            lobe1.position.set(1.2 * scale, 0, 0);
            lobe2.position.set(-1.2 * scale, 0, 0);
        } else {
            // py
            // Already set
        }

        currentOrbitalGroup.add(lobe1);
        currentOrbitalGroup.add(lobe2);
    }
    // d and f orbitals would require more complex geometry or marching cubes
    else {
        // Placeholder for d/f
        const geometry = new THREE.TorusKnotGeometry(1 * scale, 0.3, 100, 16);
        const mesh = new THREE.Mesh(geometry, materialPos);
        currentOrbitalGroup.add(mesh);
    }
    
    scene.add(currentOrbitalGroup);
}

function animate() {
    requestAnimationFrame(animate);
    if (currentOrbitalGroup) {
        currentOrbitalGroup.rotation.y += 0.005;
        currentOrbitalGroup.rotation.x += 0.002;
    }
    renderer.render(scene, camera);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    setupUI();
    renderGrid(); // Initial render for main view
    
    // Check if three-canvas-container exists and initialize
    if (document.getElementById('three-canvas-container')) {
        initThreeJS();
        drawOrbital(); // Initial orbital draw
    }
});
