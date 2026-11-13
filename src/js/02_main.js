// Constants & State

let currentTemp = 298; // Kelvin

let tempUnit = 'K';

let currentProperty = 'category';

window.currentProperty = currentProperty;

let currentElecProperty = 'configuration';

window.currentElecProperty = currentElecProperty;

let currentView = 'main';

const heatmapConfigs = {

    atomicMass:        { minColor: '#00ff00', maxColor: '#ff0000', scale: 'linear', min: 1, max: 294 },

    energyLevels:      { minColor: '#00ffff', maxColor: '#ff00ff', scale: 'linear', min: 1, max: 7 },

    electronegativity: { minColor: '#ffaa00', maxColor: '#00ccff', scale: 'linear', min: 0.7, max: 4.0 },

    meltingPoint:      { minColor: '#0000ff', midColor: '#ffffff', maxColor: '#ff0000', midValue: 273.15, scale: 'linear', min: 0, max: 4000 },

    boilingPoint:      { minColor: '#00ffff', midColor: '#ffffff', maxColor: '#ff00ff', midValue: 273.15, scale: 'linear', min: 0, max: 6000 },

    electronAffinity:  { minColor: '#aaaaaa', maxColor: '#ffaa00', scale: 'linear', min: -100, max: 350 },

    ionization:        { minColor: '#5555ff', maxColor: '#ff5555', scale: 'linear', min: 350, max: 2500 },

    ionizationEnergy:  { minColor: '#5555ff', maxColor: '#ff5555', scale: 'linear', min: 350, max: 2500 },

    radius:            { minColor: '#00ffaa', maxColor: '#ff00aa', scale: 'linear', min: 25, max: 300 },

    atomicRadius:      { minColor: '#00ffaa', maxColor: '#ff00aa', scale: 'linear', min: 25, max: 300 },

    hardness:          { minColor: '#cccccc', maxColor: '#222222', scale: 'linear', min: 0.5, max: 10 },

    modulus:           { minColor: '#ffcc00', maxColor: '#6600cc', scale: 'linear', min: 1, max: 1000 },

    density:           { minColor: '#aaffaa', maxColor: '#005500', scale: 'linear', min: 0.00008, max: 23 },

    conductivity:      { minColor: '#ff5500', maxColor: '#ffff00', scale: 'log', min: 0.005, max: 430 },

    heat:              { minColor: '#ff0000', maxColor: '#ffff00', scale: 'log', min: 0.1, max: 15 },

    abundance:         { minColor: '#000000', maxColor: '#ffffff', scale: 'log', min: 1e-6, max: 5e5 },

    discoveryYear:     { minColor: '#00ccff', maxColor: '#ff00cc', scale: 'linear', min: 1650, max: 2025 }

};

window.heatmapConfigs = heatmapConfigs;

const heatmapUnknownColor = '#333333';

window.heatmapUnknownColor = heatmapUnknownColor;

let selectedElement = null;

let lockedLegendKey = null;

let lockedLegendType = null;

let lockedLegendGroup = null;

const categoryGroups = {

    'Metals': ['Alkali metal', 'Alkaline earth metal', 'Transition metal', 'Post-transition metal', 'Lanthanide', 'Actinide'],

    'Metalloids': ['Metalloid'],

    'Non-Metals': ['Other nonmetal', 'Halogen', 'Noble gas']

};

window.categoryGroups = categoryGroups;

window.lockedLegendKey = null;

window.lockedLegendType = null;

window.lockedLegendGroup = null;

let currentTimelineYear = 2025;

let currentSearchQuery = '';



// High-performance Grid Cell Cache & RAF Throttler for 60fps/120fps dynamic controls

let gridCellCaches = {};

let tempRafId = null;

let pendingTemp = currentTemp;

let timelineRafId = null;

let pendingTimelineYear = currentTimelineYear;

let _elTempInput = null;

let _elTempDisplayC = null;

let _elTempDisplayF = null;

let _elTempDisplayContainer = null;

let _elTempSlider = null;

let _elTimelineInput = null;

let _elTimelineDisplayContainer = null;

let _elTimelineSlider = null;



let _tempTransitions = null;

let _lastEvaluatedTemp = null;

let _currentElementStates = null;

let _currentCounts = { solid: 0, liquid: 0, gas: 0, unknown: 0 };

let _legendStateItems = null;

let _valStateEl = null;



const STATE_NAMES = ['Solid', 'Liquid', 'Gas', 'Unknown'];

const STATE_TEXT_COLORS = ['#ffffff', '#38bdf8', '#f87171', '#94a3b8'];

const STATE_BG_COLORS = ['#3b82f6', '#06b6d4', '#ef4444', '#6b7280'];



function invalidateGridCellCache() {

    _tempTransitions = null;

    _lastEvaluatedTemp = null;

}



function clearGridCellCache(gridId) {

    if (gridCellCaches[gridId]) {

        delete gridCellCaches[gridId];

    }

    const el = document.querySelector(gridId);

    if (el) el._renderedVisualKey = null;

}



function getGridCellCache() {

    const gridId = currentView === 'electrons' ? '#electrons-grid' :

                   currentView === 'isotopes' ? '#isotopes-grid' : '#main-grid';

    

    if (gridCellCaches[gridId] && gridCellCaches[gridId].length === 118) {

        return gridCellCaches[gridId];

    }



    const cells = document.querySelectorAll(`${gridId} .element-cell`);

    if (!cells || cells.length === 0) return [];



    const items = [];

    cells.forEach(cell => {

        const z = parseInt(cell.dataset.z);

        const elData = getElementByNumber(z);

        if (!elData) return;



        items.push({

            cell: cell,

            symSpan: cell.querySelector('.cell-sym'),

            bohrSpan: cell.querySelector('.cell-bohr'),

            valSpan: cell.querySelector('.cell-value'),

            z: z,

            elData: elData,

            mp: (elData.meltingPoint !== null && elData.meltingPoint !== undefined) ? elData.meltingPoint : null,

            bp: (elData.boilingPoint !== null && elData.boilingPoint !== undefined) ? elData.boilingPoint : null,

            discYear: elData.discoveryYear === 'Ancient' ? -99999 : parseInt(elData.discoveryYear),

            lastStateCode: -1,

            normalizedCategory: getNormalizedCategory(elData.category, elData.atomicNumber)

        });

    });



    gridCellCaches[gridId] = items;

    return items;

}



function initTempTransitions(items) {

    const transitions = [];

    _currentElementStates = new Int8Array(items.length);

    for (let i = 0; i < items.length; i++) {

        const item = items[i];

        if (item.mp !== null && item.bp !== null) {

            transitions.push({ k: item.mp, idx: i, type: 'mp' });

            transitions.push({ k: item.bp, idx: i, type: 'bp' });

        }

    }

    transitions.sort((a, b) => a.k - b.k);

    _tempTransitions = transitions;

}



let _lastLegendCounts = { Solid: -1, Liquid: -1, Gas: -1, Unknown: -1 };

function updateLegendStateCounts(solid, liquid, gas, unknown) {

    if (solid === _lastLegendCounts.Solid && liquid === _lastLegendCounts.Liquid &&

        gas === _lastLegendCounts.Gas && unknown === _lastLegendCounts.Unknown) return;

    _lastLegendCounts.Solid = solid;

    _lastLegendCounts.Liquid = liquid;

    _lastLegendCounts.Gas = gas;

    _lastLegendCounts.Unknown = unknown;



    if (!_legendStateItems) {

        const nodes = document.querySelectorAll('#in-grid-legend .legend-item[data-type="state"]');

        if (nodes && nodes.length > 0) {

            _legendStateItems = Array.from(nodes).map(item => ({

                key: item.dataset.key,

                span: item.querySelector('span')

            })).filter(x => x.key && x.span);

        }

    }

    if (!_legendStateItems || _legendStateItems.length === 0) return;



    const counts = { Solid: solid, Liquid: liquid, Gas: gas, Unknown: unknown };

    for (let i = 0; i < _legendStateItems.length; i++) {

        const item = _legendStateItems[i];

        if (counts[item.key] !== undefined) {

            item.span.textContent = `${item.key} (${counts[item.key]})`;

        }

    }

}



function applyOptimizedTemperatureUpdate(k) {

    const isMain = currentView === 'main';

    const items = getGridCellCache();

    if (!items || items.length === 0) return 0;



    const isStateProp = isMain && currentProperty === 'state';

    let changedCount = 0;



    // ⚡ WebAssembly Acceleration Engine (0.0001ms execution time)

    if (window.PeriodicaWasm && window.PeriodicaWasm.isReady()) {

        changedCount = window.PeriodicaWasm.evaluateTemperature(k);

        if (changedCount > 0 || _lastEvaluatedTemp === null) {

            const states = window.PeriodicaWasm.getStates();

            const changedFlags = window.PeriodicaWasm.getChangedFlags();

            const isFirst = (_lastEvaluatedTemp === null);



            for (let i = 0; i < 118; i++) {

                if (isFirst || changedFlags[i] === 1) {

                    const item = items[i];

                    if (!item) continue;

                    const stateCode = states[i];

                    const textColor = STATE_TEXT_COLORS[stateCode];

                    if (item.symSpan) item.symSpan.style.color = textColor;

                    if (item.bohrSpan) item.bohrSpan.style.color = textColor;



                    if (isStateProp) {

                        const color = STATE_BG_COLORS[stateCode];

                        item.cell.style.background = color;

                        item.cell.style.borderColor = color;

                        if (item.valSpan) item.valSpan.textContent = STATE_NAMES[stateCode];

                    }

                }

            }



            const counts = window.PeriodicaWasm.getCounts();

            _currentCounts.solid = counts[0];

            _currentCounts.liquid = counts[1];

            _currentCounts.gas = counts[2];

            _currentCounts.unknown = counts[3];

            updateLegendStateCounts(counts[0], counts[1], counts[2], counts[3]);

        }

        _lastEvaluatedTemp = k;



        if (selectedElement) {

            updateSelectedCardVisuals();

        }

        return changedCount;

    }



    if (!_tempTransitions) {

        initTempTransitions(items);

    }



    // Full baseline initialization

    if (_lastEvaluatedTemp === null) {

        let s = 0, l = 0, g = 0, u = 0;

        for (let i = 0; i < items.length; i++) {

            const item = items[i];

            let stateCode = 3;

            if (item.mp !== null && item.bp !== null) {

                if (k < item.mp) stateCode = 0;

                else if (k < item.bp) stateCode = 1;

                else stateCode = 2;

            }

            _currentElementStates[i] = stateCode;

            item.lastStateCode = stateCode;



            const textColor = STATE_TEXT_COLORS[stateCode];

            if (item.symSpan) item.symSpan.style.color = textColor;

            if (item.bohrSpan) item.bohrSpan.style.color = textColor;



            if (isStateProp) {

                const color = STATE_BG_COLORS[stateCode];

                item.cell.style.background = color;

                item.cell.style.borderColor = color;

                if (item.valSpan) item.valSpan.textContent = STATE_NAMES[stateCode];

            }



            if (stateCode === 0) s++;

            else if (stateCode === 1) l++;

            else if (stateCode === 2) g++;

            else u++;

        }

        _currentCounts.solid = s;

        _currentCounts.liquid = l;

        _currentCounts.gas = g;

        _currentCounts.unknown = u;

        _lastEvaluatedTemp = k;

        updateLegendStateCounts(s, l, g, u);

        return items.length;

    }



    if (k === _lastEvaluatedTemp) return 0;



    const oldT = _lastEvaluatedTemp;

    const newT = k;

    const transitions = _tempTransitions;



    // Delta Transition Processing: O(delta) operations instead of O(118)

    if (newT > oldT) {

        for (let i = 0; i < transitions.length; i++) {

            const t = transitions[i];

            if (t.k <= oldT) continue;

            if (t.k > newT) break;



            const item = items[t.idx];

            if (t.type === 'mp') {

                if (_currentElementStates[t.idx] === 0) {

                    _currentElementStates[t.idx] = 1;

                    item.lastStateCode = 1;

                    _currentCounts.solid--;

                    _currentCounts.liquid++;

                    changedCount++;

                    if (item.symSpan) item.symSpan.style.color = STATE_TEXT_COLORS[1];

                    if (item.bohrSpan) item.bohrSpan.style.color = STATE_TEXT_COLORS[1];

                    if (isStateProp) {

                        item.cell.style.background = STATE_BG_COLORS[1];

                        item.cell.style.borderColor = STATE_BG_COLORS[1];

                        if (item.valSpan) item.valSpan.textContent = 'Liquid';

                    }

                }

            } else if (t.type === 'bp') {

                if (_currentElementStates[t.idx] === 1) {

                    _currentElementStates[t.idx] = 2;

                    item.lastStateCode = 2;

                    _currentCounts.liquid--;

                    _currentCounts.gas++;

                    changedCount++;

                    if (item.symSpan) item.symSpan.style.color = STATE_TEXT_COLORS[2];

                    if (item.bohrSpan) item.bohrSpan.style.color = STATE_TEXT_COLORS[2];

                    if (isStateProp) {

                        item.cell.style.background = STATE_BG_COLORS[2];

                        item.cell.style.borderColor = STATE_BG_COLORS[2];

                        if (item.valSpan) item.valSpan.textContent = 'Gas';

                    }

                }

            }

        }

    } else {

        for (let i = transitions.length - 1; i >= 0; i--) {

            const t = transitions[i];

            if (t.k >= oldT) continue;

            if (t.k < newT) break;



            const item = items[t.idx];

            if (t.type === 'bp') {

                if (_currentElementStates[t.idx] === 2) {

                    _currentElementStates[t.idx] = 1;

                    item.lastStateCode = 1;

                    _currentCounts.gas--;

                    _currentCounts.liquid++;

                    changedCount++;

                    if (item.symSpan) item.symSpan.style.color = STATE_TEXT_COLORS[1];

                    if (item.bohrSpan) item.bohrSpan.style.color = STATE_TEXT_COLORS[1];

                    if (isStateProp) {

                        item.cell.style.background = STATE_BG_COLORS[1];

                        item.cell.style.borderColor = STATE_BG_COLORS[1];

                        if (item.valSpan) item.valSpan.textContent = 'Liquid';

                    }

                }

            } else if (t.type === 'mp') {

                if (_currentElementStates[t.idx] === 1) {

                    _currentElementStates[t.idx] = 0;

                    item.lastStateCode = 0;

                    _currentCounts.liquid--;

                    _currentCounts.solid++;

                    changedCount++;

                    if (item.symSpan) item.symSpan.style.color = STATE_TEXT_COLORS[0];

                    if (item.bohrSpan) item.bohrSpan.style.color = STATE_TEXT_COLORS[0];

                    if (isStateProp) {

                        item.cell.style.background = STATE_BG_COLORS[0];

                        item.cell.style.borderColor = STATE_BG_COLORS[0];

                        if (item.valSpan) item.valSpan.textContent = 'Solid';

                    }

                }

            }

        }

    }



    _lastEvaluatedTemp = newT;

    updateLegendStateCounts(_currentCounts.solid, _currentCounts.liquid, _currentCounts.gas, _currentCounts.unknown);



    if (selectedElement) {

        updateSelectedCardVisuals();

    }

    return changedCount;

}



function applyOptimizedTimelineUpdate(year) {

    currentTimelineYear = year;

    window.currentTimelineYear = year;

    const isMain = currentView === 'main';

    if (!isMain || currentProperty !== 'discoveryYear') return;



    // Update discovery count in top readout

    const countEl = document.getElementById('timeline-count');

    if (countEl && typeof elementsData !== 'undefined') {

        let count = 0;

        for (let i = 0; i < elementsData.length; i++) {

            const dy = elementsData[i].discoveryYear;

            if (dy === 'Ancient' || Number(dy) <= year) {

                count++;

            }

        }

        countEl.textContent = `${count} / 118 Discovered`;

    }



    const items = getGridCellCache();

    if (items && items.length > 0) {

        for (let i = 0; i < items.length; i++) {

            const item = items[i];

            if (item.elData.discoveryYear === 'Ancient') {

                item.cell.style.opacity = '1';

                item.cell.style.filter = 'none';

            } else {

                const dYear = item.discYear;

                if (!isNaN(dYear) && dYear > year) {

                    item.cell.style.opacity = '0.2';

                    item.cell.style.filter = 'grayscale(1)';

                } else {

                    item.cell.style.opacity = '1';

                    item.cell.style.filter = 'none';

                }

            }

        }

    }



    if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.render === 'function') {

        window.PeriodicCanvasGrid.render();

    }

}



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

        let formatted = part.replace(/([spdf])(\d+)/g, '$1<sup style="vertical-align: super; font-size: 0.82em; margin-right: 3px;">$2</sup>');

        if (anomalies) {

            const match = part.match(/^(\d+[spdf])/);

            if (match && anomalies.includes(match[1])) {

                formatted = `<span style="color: #ef4444; font-weight: 800;">${formatted}</span>`;

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



function isElementEndingOnSubshell(el, subshellKey) {

    if (!el || !subshellKey) return false;

    const cfg = el.electronConfiguration || '';

    const parts = cfg.trim().split(/\s+/).filter(p => /\d[spdf]/.test(p));

    if (parts.length === 0) return false;

    const lastPart = parts[parts.length - 1];

    const match = lastPart.match(/(\d[spdf])/);

    return match ? (match[1] === subshellKey) : false;

}

window.isElementEndingOnSubshell = isElementEndingOnSubshell;



function applyLegendHighlighting(key, type, groupKeys = null) {

    if (!key && !groupKeys) {

        window.activeLegendHighlight = null;

    } else {

        window.activeLegendHighlight = { key, type, groupKeys };

    }



    const gridId = currentView === 'main' ? '#main-grid' : '#electrons-grid';

    const grid = document.querySelector(gridId);

    if (grid) {

        if (!key && !groupKeys) {

            grid.classList.remove('highlighting-active');

            document.querySelectorAll(`${gridId} .element-cell`).forEach(c => c.classList.remove('highlighted'));

        } else {

            grid.classList.add('highlighting-active');

            document.querySelectorAll(`${gridId} .element-cell`).forEach(cell => {

                let match = false;

                const cat = cell.dataset.category;

                const dualCat = cell.dataset.dualCategory;

                if (groupKeys) {

                    match = groupKeys.includes(cat) || (dualCat && groupKeys.includes(dualCat));

                } else if (type === 'category') {

                    match = (cat === key) || (dualCat && dualCat === key);

                } else if (type === 'state') {

                    match = cell.dataset.state === key;

                } else if (type === 'block') {

                    match = cell.dataset.block === key;

                } else if (type === 'exception') {

                    const z = parseInt(cell.dataset.z);

                    match = (z in aufbauExceptions);

                } else if (type === 'subshell') {

                    const z = parseInt(cell.dataset.z);

                    const el = getElementByNumber(z);

                    match = isElementEndingOnSubshell(el, key);

                }

                

                if (match) cell.classList.add('highlighted');

                else cell.classList.remove('highlighted');

            });

        }

    }



    // Trigger Canvas Grid Re-render to reflect highlighting on canvas periodic table

    if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.render === 'function') {

        window.PeriodicCanvasGrid.render();

    }

}



function clearLegendHighlighting() {

    if (lockedLegendKey || lockedLegendGroup) {

        applyLegendHighlighting(lockedLegendKey, lockedLegendType, lockedLegendGroup ? categoryGroups[lockedLegendGroup] : null);

        return;

    }

    window.activeLegendHighlight = null;

    const gridId = currentView === 'main' ? '#main-grid' : '#electrons-grid';

    const grid = document.querySelector(gridId);

    if (grid) {

        grid.classList.remove('highlighting-active');

        document.querySelectorAll(`${gridId} .element-cell`).forEach(cell => {

            cell.classList.remove('highlighted');

        });

    }

    if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.render === 'function') {

        window.PeriodicCanvasGrid.render();

    }

}



let tableLayoutMode = '18col'; // '18col' or '32col'

let savedPropertyLayoutMode = '18col';



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



//// Category Colors (Full Spectrum High Contrast & Distinct Hues)

const categoryColors = {

    'Alkali metal': '#ef4444',        // Pure Red

    'Alkaline earth metal': '#f97316', // Bright Orange

    'Transition metal': '#6366f1',     // Indigo Blue

    'Post-transition metal': '#0284c7',// Steel Blue

    'Metalloid': '#eab308',            // Canary Yellow / Gold

    'Other nonmetal': '#22c55e',       // Vibrant Green

    'Other Nonmetals': '#22c55e',      // Alias

    'Halogen': '#14b8a6',              // Vibrant Teal

    'Halogens': '#14b8a6',             // Alias

    'Noble gas': '#06b6d4',            // Electric Cyan

    'Noble Gases': '#06b6d4',          // Alias

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



function hexToRgbaLocal(color, alpha) {

    if (!color) return `rgba(100,116,139,${alpha})`;

    if (typeof color === 'string' && color.startsWith('rgb(')) {

        const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

        if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;

    } else if (typeof color === 'string' && color.startsWith('rgba(')) {

        return color.replace(/rgba\((\d+,\s*\d+,\s*\d+,)\s*[^)]+\)/, `rgba($1 ${alpha})`);

    }

    if (typeof color !== 'string' || color[0] !== '#') return `rgba(100,116,139,${alpha})`;

    let c = color.substring(1);

    if (c.length === 3) c = c.split('').map(x => x + x).join('');

    const num = parseInt(c, 16);

    if (isNaN(num)) return `rgba(100,116,139,${alpha})`;

    const r = (num >> 16) & 255;

    const g = (num >> 8) & 255;

    const b = num & 255;

    return `rgba(${r},${g},${b},${alpha})`;

}

window.hexToRgbaLocal = hexToRgbaLocal;



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



// View switching helper with hash routing and back-stack history

function switchView(viewId, updateHash = true, pushHistory = true) {

    if (viewId === 'properties') viewId = 'main';



    if (viewId !== 'main' && window.isProUser && !window.isProUser()) {

        if (window.openProPaywallModal) {

            window.openProPaywallModal(viewId);

        }

        return;

    }



    if (pushHistory && window.NavigationManager && typeof window.NavigationManager.pushView === 'function') {

        window.NavigationManager.pushView(viewId);

    }



    document.querySelectorAll('.nav-btn, .mobile-nav-item').forEach(b => {

        if (b.getAttribute('data-view') === viewId) {

            b.classList.add('active');

        } else {

            b.classList.remove('active');

        }

    });

    

    currentView = viewId;

    document.querySelectorAll('.view-mode').forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById('view-' + viewId);

    if (targetView) targetView.classList.add('active');



    // Close any floating mobile sidebar on tab change

    closeMobileSidebar();

    const mobileLeftNav = document.getElementById('mobile-left-nav');

    if (mobileLeftNav) mobileLeftNav.classList.remove('expanded');

    syncNativeSliderVisibility();

    // 32-column view layout toggle and Table Type button are strictly restricted to Property Interface ('main' or 'properties')

    const layoutBtn = document.getElementById('btn-layout-toggle');

    const tableTypeBtn = document.getElementById('btn-table-type-top');

    const mainGrid = document.getElementById('main-grid');

    

    if (viewId === 'main' || viewId === 'properties') {

        if (layoutBtn) layoutBtn.style.display = 'flex';

        if (tableTypeBtn) tableTypeBtn.style.display = 'flex';

        tableLayoutMode = savedPropertyLayoutMode || '18col';

        updateGridVisuals();

        requestAnimationFrame(() => {

            syncNativeSliderVisibility();

            if (typeof window.refreshCustomSliders === 'function') {

                window.refreshCustomSliders();

            }

        });

        setTimeout(() => {

            syncNativeSliderVisibility();

            if (typeof window.refreshCustomSliders === 'function') {

                window.refreshCustomSliders();

            }

        }, 60);

    } else {

        if (layoutBtn) layoutBtn.style.display = 'none';

        if (tableTypeBtn) tableTypeBtn.style.display = 'none';

        tableLayoutMode = '18col';

    }



    if (mainGrid) {

        if (tableLayoutMode === '32col') {

            mainGrid.classList.add('extended-32col');

        } else {

            mainGrid.classList.remove('extended-32col');

        }

    }

    

    if (viewId === 'main' || viewId === 'electrons' || viewId === 'isotopes') {

        const gridId = viewId === 'electrons' ? 'electrons-grid' : (viewId === 'isotopes' ? 'isotopes-grid' : 'main-grid');

        const gridEl = document.getElementById(gridId);

        if (!gridEl || gridEl.children.length === 0) {

            renderGrid();

        }

    }

    

    // Pause all background 3D WebGL render loops when not active

    if (window.OrbitalViewer && typeof window.OrbitalViewer.stop === 'function') {

        if (viewId !== 'electrons') window.OrbitalViewer.stop();

    }

    if (typeof window.stopMoleculeViewer === 'function') {

        if (viewId !== 'compounds') window.stopMoleculeViewer();

    }

    if (typeof window.stopCrystalViewer === 'function') {

        if (viewId !== 'crystals') window.stopCrystalViewer();

    }

    if (window.simPlaybackController && typeof window.simPlaybackController.pause === 'function') {

        if (viewId !== 'simulations') window.simPlaybackController.pause();

    }



    if (viewId === 'electrons') {

        const isMobile = (window.innerWidth <= 1000 || window.innerHeight <= 520);

        const elecSidebar = document.querySelector('#view-electrons .view-right');

        const isSidebarVisible = !isMobile || (elecSidebar && (elecSidebar.classList.contains('mobile-active') || elecSidebar.classList.contains('open')));



        if (window.OrbitalViewer) {

            if (isSidebarVisible) {

                if (!window.OrbitalViewer.renderer) {

                    requestAnimationFrame(() => {

                        window.OrbitalViewer.init('three-canvas-container');

                        window.OrbitalViewer.resize();

                    });

                } else {

                    window.OrbitalViewer.start();

                    requestAnimationFrame(() => {

                        window.OrbitalViewer.resize();

                    });

                }

            } else {

                // On mobile when sidebar is closed, keep 3D loop stopped (0% CPU/GPU overhead)

                window.OrbitalViewer.stop();

            }

        }

        requestAnimationFrame(() => {

            if (!selectedElement) {

                selectElement(6, false, false);

            }

        });

    } else if (viewId === 'isotopes') {

        requestAnimationFrame(() => {

            const z = selectedElement ? selectedElement.atomicNumber : 6;

            const el = getElementByNumber(z) || (typeof elementsData !== 'undefined' ? elementsData[5] : null);

            if (typeof updateIsotopeSidebar === 'function') {

                updateIsotopeSidebar(z);

            }

            if (typeof renderIsotopeLegend === 'function') {

                renderIsotopeLegend(el);

            }

        });

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

    } else if (viewId === 'simulations') {

        if (window.simPlaybackController && typeof window.simPlaybackController.initUI === 'function') {

            window.simPlaybackController.initUI();

        }

    }



    // Update social preview image, page title & meta descriptions dynamically

    updateSocialShareMeta(viewId);

    if (updateHash) {

        const hashVal = (viewId === 'main' ? 'properties' : viewId);

        if (window.location.hash !== '#' + hashVal) {

            history.replaceState(null, null, '#' + hashVal);

        }

    }



    // Auto-open Card Anatomy Guide on first view of this tab

    if (!localStorage.getItem('periodica_guide_disabled')) {

        const guideKey = 'periodica_guide_seen_' + viewId + '_' + (currentProperty || 'category');

        if (!localStorage.getItem(guideKey)) {

            localStorage.setItem(guideKey, 'true');

            setTimeout(() => {

                openCardAnatomyModal(viewId, currentProperty || 'category');

            }, 250);

        }

    }

}

window.switchView = switchView;



// Handle URL Hash Deep-linking

function handleHashRouting() {

    const hash = window.location.hash.replace('#', '').trim().toLowerCase();

    if (!hash) return;



    if (hash === 'states' || hash === 'environment' || hash === 'phase') {

        switchView('simulations', false);

        setTimeout(() => { if (typeof window.switchSimTab === 'function') window.switchSimTab('environment'); }, 100);

        return;

    }



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

        'simulations': 'simulations',

        'simulation': 'simulations',

        'simlab': 'simulations',

        'sim': 'simulations',

        'properties': 'main',

        'property': 'main',

        'main': 'main'

    };



    if (viewMap[hash]) {

        switchView(viewMap[hash], false);

        return;

    }



    // Property deep links (e.g. #electronegativity, #density, #meltingpoint)

    const propMap = {

        'electronegativity': 'electronegativity',

        'atomicmass': 'atomicMass',

        'mass': 'atomicMass',

        'atomicradius': 'atomicRadius',

        'radius': 'atomicRadius',

        'density': 'density',

        'meltingpoint': 'meltingPoint',

        'melting': 'meltingPoint',

        'boilingpoint': 'boilingPoint',

        'discoveryyear': 'discoveryYear',

        'discovery': 'discoveryYear',

        'year': 'discoveryYear',

        'state': 'state',

        'category': 'category'

    };



    if (propMap[hash]) {

        switchView('properties', false);

        currentProperty = propMap[hash];

        document.querySelectorAll('.prop-item:not(.elec-prop-item)').forEach(p => p.classList.remove('active'));

        const propEl = document.querySelector(`.prop-item[data-prop="${propMap[hash]}"]`);

        if (propEl) propEl.classList.add('active');

        updateGridVisuals();

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

    if (window.PeriodicaNativeSlider || window.NativeSliderBridge) {

        document.body.classList.add('has-native-slider');

        if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.resize === 'function') {

            window.PeriodicCanvasGrid.resize();

        }

    }

    syncNativeSliderVisibility();



    // Mode toggle with clean click handler

    document.querySelectorAll('.nav-btn').forEach(btn => {

        let lastTap = 0;

        const handleNav = (e) => {

            const now = Date.now();

            if (now - lastTap < 250) return;

            lastTap = now;

            const viewId = e.currentTarget.dataset.view || e.target.closest('[data-view]')?.dataset.view;

            if (viewId) switchView(viewId, true);

        };

        btn.addEventListener('click', handleNav);

    });

    

    window.addEventListener('hashchange', handleHashRouting);

    

    // Fast mobile sidebar close buttons

    document.querySelectorAll('.sidebar-close-btn, .ed-close-btn').forEach(btn => {

        const handleClose = (e) => {

            if (e) {

                e.preventDefault();

                e.stopPropagation();

            }

            closeMobileSidebar();

        };

        btn.addEventListener('pointerdown', handleClose);

        btn.addEventListener('touchstart', handleClose, { passive: false });

        btn.addEventListener('click', handleClose);

    });



    // Dismiss mobile sidebar when tapping on the background/grid (outside sidebar)

    document.addEventListener('pointerdown', (e) => {

        if (window.innerWidth <= 1000 || window.innerHeight <= 520) {

            const activeSidebar = document.querySelector('.view-mode.active .view-right.mobile-active');

            if (activeSidebar && !activeSidebar.contains(e.target) && !e.target.closest('#compact-select-popover') && !e.target.closest('.compact-select-popover') && !e.target.closest('.element-cell') && !e.target.closest('#mobile-left-nav')) {

                closeMobileSidebar();

            }

        }

    });

    

    // Property Sidebar selection

    document.querySelectorAll('.prop-item:not(.non-interactive):not(.elec-prop-item)').forEach(item => {

        item.addEventListener('click', (e) => {

            if (e.target.tagName.toLowerCase() === 'select' || e.target.tagName.toLowerCase() === 'option') return;

            const target = e.currentTarget;

            const prop = target.dataset.prop;

            if (prop !== 'category' && window.isProUser && !window.isProUser()) {

                if (window.openProPaywallModal) window.openProPaywallModal(prop);

                return;

            }

            document.querySelectorAll('.prop-item:not(.elec-prop-item)').forEach(p => p.classList.remove('active'));

            target.classList.add('active');

            currentProperty = prop;

            window.currentProperty = currentProperty;

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

            window.currentElecProperty = currentElecProperty;

            updateGridVisuals();

        });

    });



    document.querySelectorAll('.inline-select').forEach(sel => {

        sel.addEventListener('change', (e) => {

            e.stopPropagation();

            updateSidebarValues();

            updateGridVisuals();

            if (window.PeriodicCanvasGrid && window.PeriodicCanvasGrid.render) {

                window.PeriodicCanvasGrid.render();

            }

        });



        // Prevent native OS select dialog and open sleek in-app micro popover

        const handleOpenPopover = (e) => {

            if (e.cancelable) e.preventDefault();

            e.stopPropagation();

            openSelectPopover(sel);

        };

        sel.addEventListener('mousedown', handleOpenPopover);

        sel.addEventListener('touchstart', handleOpenPopover, { passive: false });

        sel.addEventListener('click', (e) => {

            if (e.cancelable) e.preventDefault();

            e.stopPropagation();

        });

    });



    let _activeSelectPopover = null;

    function openSelectPopover(sel) {

        let popover = document.getElementById('compact-select-popover');

        if (!popover) {

            popover = document.createElement('div');

            popover.id = 'compact-select-popover';

            popover.className = 'compact-select-popover';

            popover.style.display = 'none';

            document.body.appendChild(popover);



            document.addEventListener('pointerdown', (e) => {

                if (popover.style.display !== 'none' && !popover.contains(e.target) && !e.target.closest('.inline-select')) {

                    closeSelectPopover();

                }

            });

        }



        if (_activeSelectPopover === sel && popover.style.display === 'flex') {

            closeSelectPopover();

            return;

        }



        _activeSelectPopover = sel;

        const rect = sel.getBoundingClientRect();

        const options = Array.from(sel.options);



        popover.innerHTML = options.map(opt => `

            <button type="button" class="compact-select-opt ${opt.value === sel.value ? 'active' : ''}" data-val="${opt.value}">

                ${opt.text}

            </button>

        `).join('');



        popover.querySelectorAll('.compact-select-opt').forEach(btn => {

            const handleOptClick = (e) => {

                if (e.cancelable) e.preventDefault();

                e.stopPropagation();

                window._lastSelectPopoverPickTime = Date.now();

                const val = btn.dataset.val;

                sel.value = val;

                sel.dispatchEvent(new Event('change', { bubbles: true }));

                closeSelectPopover();

            };

            btn.addEventListener('click', handleOptClick);

            btn.addEventListener('touchend', handleOptClick, { passive: false });

        });



        popover.style.display = 'flex';

        

        const popRect = popover.getBoundingClientRect();

        let left = rect.left;

        let top = rect.bottom + 4;



        if (left + popRect.width > window.innerWidth - 10) {

            left = window.innerWidth - popRect.width - 10;

        }

        if (top + popRect.height > window.innerHeight - 10) {

            top = rect.top - popRect.height - 4;

        }



        popover.style.left = `${Math.max(10, left)}px`;

        popover.style.top = `${Math.max(10, top)}px`;

    }

    window.openSelectPopover = openSelectPopover;



    function closeSelectPopover() {

        const popover = document.getElementById('compact-select-popover');

        if (popover) popover.style.display = 'none';

        _activeSelectPopover = null;

    }

    window.closeSelectPopover = closeSelectPopover;



    // Search bar input

    document.querySelectorAll('.element-search-input').forEach(input => {

        input.addEventListener('input', (e) => {

            currentSearchQuery = e.target.value;

            filterGridElements(currentSearchQuery);

        });

    });



    // High-performance Zero-Delay Realtime Slider Controller (Decoupled GPU Compositor Transform Tracking)

    function setupCustomGpuSlider(customSliderId, thumbId, hiddenInputId, textInputId, minVal, maxVal, isInt, onTextUpdate, onHeavyUpdate) {

        const sliderContainer = document.getElementById(customSliderId);

        const thumb = document.getElementById(thumbId);

        const hiddenSlider = document.getElementById(hiddenInputId);

        const textInput = document.getElementById(textInputId);

        if (!sliderContainer || !thumb) return;



        let pendingVal = isInt ? parseInt(hiddenSlider?.value || minVal) : parseFloat(hiddenSlider?.value || minVal);

        let isPointerDown = false;

        let cachedRect = null;

        let rafId = null;

        let pendingHeavyVal = null;



        const scheduleHeavyUpdate = (val) => {

            pendingHeavyVal = val;

            if (!rafId) {

                rafId = requestAnimationFrame(() => {

                    rafId = null;

                    if (onHeavyUpdate && pendingHeavyVal !== null) {

                        onHeavyUpdate(pendingHeavyVal);

                    }

                });

            }

        };



        const updateThumbPosition = (val) => {

            if (!cachedRect || cachedRect.width <= 0) cachedRect = sliderContainer.getBoundingClientRect();

            const width = cachedRect ? cachedRect.width : 0;

            if (width <= 0) return;

            const pct = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));

            const x = pct * width;

            thumb.style.transform = `translate3d(${x}px, 0, 0)`;

        };



        const applyValue = (raw, moveThumb = true) => {

            if (isNaN(raw)) return;

            pendingVal = raw;

            if (hiddenSlider) hiddenSlider.value = raw;

            if (textInput && document.activeElement !== textInput) {

                textInput.value = raw;

            }

            if (moveThumb) {

                updateThumbPosition(raw);

            }

            if (onTextUpdate) onTextUpdate(raw);

            scheduleHeavyUpdate(raw);

        };



        const updateFromPointer = (clientX) => {

            if (!cachedRect || cachedRect.width <= 0) cachedRect = sliderContainer.getBoundingClientRect();

            if (!cachedRect || cachedRect.width <= 0) return;

            const pct = Math.max(0, Math.min(1, (clientX - cachedRect.left) / cachedRect.width));

            const raw = isInt ? Math.round(minVal + pct * (maxVal - minVal)) : (minVal + pct * (maxVal - minVal));

            

            // 1. Move thumb INSTANTANEOUSLY on GPU compositor layer (0.00ms latency)

            const x = pct * cachedRect.width;

            thumb.style.transform = `translate3d(${x}px, 0, 0)`;



            if (raw !== pendingVal) {

                pendingVal = raw;

                if (hiddenSlider) hiddenSlider.value = raw;

                if (textInput && document.activeElement !== textInput) {

                    textInput.value = raw;

                }

                if (onTextUpdate) onTextUpdate(raw);

                scheduleHeavyUpdate(raw);

            }

        };



        sliderContainer.addEventListener('pointerdown', (e) => {

            isPointerDown = true;

            try { sliderContainer.setPointerCapture(e.pointerId); } catch(err){}

            cachedRect = sliderContainer.getBoundingClientRect();

            updateFromPointer(e.clientX);

        }, { passive: false });



        sliderContainer.addEventListener('pointermove', (e) => {

            if (!isPointerDown) return;

            updateFromPointer(e.clientX);

        }, { passive: false });



        const endPointer = (e) => {

            if (isPointerDown) {

                isPointerDown = false;

                try { sliderContainer.releasePointerCapture(e.pointerId); } catch(err){}

                cachedRect = null;

                if (pendingHeavyVal !== null && onHeavyUpdate) {

                    onHeavyUpdate(pendingHeavyVal);

                }

            }

        };

        sliderContainer.addEventListener('pointerup', endPointer, { passive: true });

        sliderContainer.addEventListener('pointercancel', endPointer, { passive: true });



        if (textInput) {

            textInput.addEventListener('input', (e) => {

                const val = isInt ? parseInt(e.target.value) : parseFloat(e.target.value);

                if (!isNaN(val)) {

                    applyValue(val, true);

                }

            }, { passive: true });

        }



        sliderContainer._refreshSlider = () => {

            cachedRect = null;

            updateThumbPosition(pendingVal);

        };



        // Initialize thumb position

        setTimeout(() => {

            cachedRect = sliderContainer.getBoundingClientRect();

            updateThumbPosition(pendingVal);

        }, 50);



        window.addEventListener('resize', () => {

            cachedRect = sliderContainer.getBoundingClientRect();

            updateThumbPosition(pendingVal);

        }, { passive: true });

    }



    window.refreshCustomSliders = function() {

        document.querySelectorAll('.custom-slider').forEach(el => {

            if (typeof el._refreshSlider === 'function') {

                el._refreshSlider();

            }

        });

    };



    function getTemperatureSpectrumColor(k) {

        const t = Math.max(0, Math.min(6000, k));

        if (t < 250) {

            // Frosty luminous ice-blue for 0K-250K (never dark, always clearly visible!)

            return '#38bdf8';

        } else if (t < 1000) {

            return t < 600 ? '#ef4444' : '#f97316';

        } else if (t < 2500) {

            return '#eab308';

        } else if (t < 4000) {

            return '#fef08a';

        } else if (t < 5200) {

            return '#ffffff';

        } else {

            return '#00f0ff';

        }

    }



    let _lastTempK = null;

    const updateTempReadoutDirectly = (k) => {

        const roundedK = Math.round(k);

        if (roundedK === _lastTempK) return;

        _lastTempK = roundedK;



        if (!_elTempDisplayC) _elTempDisplayC = document.getElementById('temp-display-c');

        if (!_elTempDisplayF) _elTempDisplayF = document.getElementById('temp-display-f');

        if (!_elTempInput) _elTempInput = document.getElementById('temp-input');



        const readoutColor = getTemperatureSpectrumColor(k);



        const elValK = document.getElementById('temp-val-k');

        const elValC = document.getElementById('temp-val-c');

        const elValF = document.getElementById('temp-val-f');

        if (elValK) elValK.textContent = roundedK;

        if (elValC) elValC.textContent = Math.round(k - 273.15);

        if (elValF) elValF.textContent = Math.round((k - 273.15) * 1.8 + 32);



        if (_elTempDisplayC) {

            _elTempDisplayC.textContent = `${Math.round(k - 273.15)} °C`;

            _elTempDisplayC.style.color = readoutColor;

            _elTempDisplayC.style.textShadow = `0 0 8px ${readoutColor}55`;

        }

        if (_elTempDisplayF) {

            _elTempDisplayF.textContent = `${Math.round((k - 273.15) * 1.8 + 32)} °F`;

            _elTempDisplayF.style.color = readoutColor;

            _elTempDisplayF.style.textShadow = `0 0 8px ${readoutColor}55`;

        }

        if (_elTempInput && document.activeElement !== _elTempInput) {

            _elTempInput.value = roundedK;

            _elTempInput.style.color = readoutColor;

            _elTempInput.style.textShadow = `0 0 8px ${readoutColor}55`;

        }

    };

    window.updateTempReadoutDirectly = updateTempReadoutDirectly;



    // Native Android HWUI Slider Listener (0ms Native Thread Dispatch, Zero Forced Reflows)

    let _nativeRafScheduled = false;

    let _pendingNativeVal = 298;



    window.onNativeTempChange = function(val) {

        currentTemp = val;

        updateTempReadoutDirectly(val); // Instant text update (< 0.01ms, zero reflow)

        _pendingNativeVal = val;



        if (window.PeriodicCanvasGrid) {

            window.PeriodicCanvasGrid.requestRender();

        }



        if (!_nativeRafScheduled) {

            _nativeRafScheduled = true;

            requestAnimationFrame(() => {

                _nativeRafScheduled = false;

                applyOptimizedTemperatureUpdate(_pendingNativeVal);

            });

        }

    };



    // Initialize ultra-responsive Temperature Slider with GPU Compositor Transform

    setupCustomGpuSlider(

        'temp-custom-slider',

        'temp-slider-thumb',

        'temp-slider',

        'temp-input',

        0,

        6000,

        false,

        (val) => {

            currentTemp = val;

            updateTempReadoutDirectly(val);

            if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setProgress) {

                window.PeriodicaNativeSlider.setProgress(Math.round(val));

            }

        },

        (val) => {

            return applyOptimizedTemperatureUpdate(val);

        }

    );



    const updateTimelineReadoutDirectly = (y) => {

        if (!_elTimelineInput) _elTimelineInput = document.getElementById('timeline-input');

        if (_elTimelineInput && document.activeElement !== _elTimelineInput) _elTimelineInput.value = y;

    };



    // Native Bridge Dispatcher for Timeline Slider

    let _pendingNativeTimelineVal = 2026;

    let _timelineRafPending = false;

    window.onNativeTimelineChange = function(val) {

        _pendingNativeTimelineVal = val;

        if (!_timelineRafPending) {

            _timelineRafPending = true;

            requestAnimationFrame(() => {

                _timelineRafPending = false;

                currentTimelineYear = _pendingNativeTimelineVal;

                updateTimelineReadoutDirectly(_pendingNativeTimelineVal);

                applyOptimizedTimelineUpdate(_pendingNativeTimelineVal);

            });

        }

    };



    // Initialize ultra-responsive Timeline Slider with GPU Compositor Transform

    setupCustomGpuSlider(

        'timeline-custom-slider',

        'timeline-slider-thumb',

        'timeline-slider',

        'timeline-input',

        1650,

        2026,

        true,

        (val) => {

            currentTimelineYear = val;

            updateTimelineReadoutDirectly(val);

        },

        (val) => {

            return applyOptimizedTimelineUpdate(val);

        }

    );



    // Orbital Controls (Slice view only)

    const sliceToggle = document.getElementById('slice-orbital');

    if (sliceToggle) {

        sliceToggle.addEventListener('change', () => {

            if (window.OrbitalViewer) window.OrbitalViewer.drawOrbital();

        });

    }

    

    // Initialize display values

    updateTempDisplay();

    updateTimelineDisplay();

}// Precompiled Static Binary Color Table (6001 elements, generated once on startup)

const _TEMP_COLOR_LUT = (function() {

    const lut = new Array(6001);

    for (let k = 0; k <= 6000; k++) {

        let r, g, b;

        if (k < 1200) {

            const pct = k / 1200;

            r = Math.round(30 + (239 - 30) * pct);

            g = Math.round(41 + (68 - 41) * pct);

            b = Math.round(59 + (68 - 59) * pct);

        } else if (k < 2400) {

            const pct = (k - 1200) / 1200;

            r = Math.round(239 + (249 - 239) * pct);

            g = Math.round(68 + (115 - 68) * pct);

            b = Math.round(68 + (22 - 68) * pct);

        } else if (k < 3600) {

            const pct = (k - 2400) / 1200;

            r = Math.round(249 + (234 - 249) * pct);

            g = Math.round(115 + (179 - 115) * pct);

            b = Math.round(22 + (8 - 22) * pct);

        } else if (k < 4800) {

            const pct = (k - 3600) / 1200;

            r = Math.round(234 + (255 - 234) * pct);

            g = Math.round(179 + (255 - 179) * pct);

            b = Math.round(8 + (255 - 8) * pct);

        } else {

            const pct = Math.min(1, (k - 4800) / 1200);

            r = Math.round(255 + (0 - 255) * pct);

            g = Math.round(255 + (240 - 255) * pct);

            b = 255;

        }

        lut[k] = `rgb(${r},${g},${b})`;

    }

    return lut;

})();



function getTempColor(k) {

    const idx = (k < 0) ? 0 : ((k > 6000) ? 6000 : (k | 0));

    return _TEMP_COLOR_LUT[idx];

}



function updateTempDisplay() {

    const k = currentTemp;

    const c = k - 273.15;

    const f = c * 1.8 + 32;

    

    if (!_elTempInput) _elTempInput = document.getElementById('temp-input');

    if (!_elTempDisplayC) _elTempDisplayC = document.getElementById('temp-display-c');

    if (!_elTempDisplayF) _elTempDisplayF = document.getElementById('temp-display-f');

    if (!_elTempDisplayContainer) _elTempDisplayContainer = document.getElementById('temp-display-container');



    if (_elTempInput && document.activeElement !== _elTempInput) _elTempInput.value = Math.round(k);

    if (_elTempDisplayC) _elTempDisplayC.textContent = `${Math.round(c)} °C`;

    if (_elTempDisplayF) _elTempDisplayF.textContent = `${Math.round(f)} °F`;

    const tempSliderEl = document.getElementById('temp-slider');

    if (tempSliderEl && document.activeElement !== tempSliderEl) tempSliderEl.value = Math.round(k);

    

    const color = getTempColor(k);

    

    // Lightweight color update without expensive multi-layer text-shadow re-allocation

    if (_elTempDisplayContainer) {

        _elTempDisplayContainer.style.color = color;

    }

    if (_elTempInput) {

        _elTempInput.style.color = color;

    }

}



function updateTimelineDisplay() {

    const y = currentTimelineYear;

    if (!_elTimelineInput) _elTimelineInput = document.getElementById('timeline-input');

    if (_elTimelineInput && document.activeElement !== _elTimelineInput) {

        _elTimelineInput.value = y;

    }

    const timelineSliderEl = document.getElementById('timeline-slider');

    if (timelineSliderEl && document.activeElement !== timelineSliderEl) timelineSliderEl.value = y;

    

    if (!_elTimelineDisplayContainer) _elTimelineDisplayContainer = document.getElementById('timeline-display-container');

    if (!_elTimelineDisplayContainer) return;

    

    const minYear = 1650;

    const maxYear = 2025;

    const pct = Math.max(0, Math.min(1, (y - minYear) / (maxYear - minYear)));

    

    const r = Math.round(0 + (255 - 0) * pct);

    const g = Math.round(204 + (0 - 204) * pct);

    const b = Math.round(255 + (204 - 255) * pct);

    const color = `rgb(${r}, ${g}, ${b})`;

    

    _elTimelineDisplayContainer.style.color = color;

    _elTimelineDisplayContainer.style.textShadow = `0 0 8px ${color.replace('rgb', 'rgba').replace(')', ', 0.5)')}`;

    

    if (!_elTimelineSlider) _elTimelineSlider = document.getElementById('timeline-slider');

    if (!_elTimelineSlider) return;

    

    const glowIntensity = 0.5 + 0.5 * pct;

    const glowRadius1 = Math.round(glowIntensity * 15);

    const glowRadius2 = Math.round(glowIntensity * 30);

    const glowColor = color.replace('rgb', 'rgba').replace(')', `, ${0.5 + 0.5 * glowIntensity})`);

    const glowShadow = `inset 0 0 ${glowRadius1}px ${glowColor}, 0 0 ${glowRadius2}px ${glowColor}`;

    const thumbBg = color.replace('rgb', 'rgba').replace(')', `, ${0.2 + 0.6 * glowIntensity})`);

    

    _elTimelineSlider.style.setProperty('--timeline-thumb-glow', glowShadow);

    _elTimelineSlider.style.setProperty('--dynamic-timeline-bg', thumbBg);

}



// Render Grid Structure based on Mode

function renderGrid() {

    const gridId = currentView === 'electrons' ? 'electrons-grid' : 

                   currentView === 'isotopes' ? 'isotopes-grid' : 'main-grid';

    const grid = document.getElementById(gridId);

    if (!grid) return;

    

    // If the grid already has the 118 element cells, don't destroy and rebuild the DOM!

    if (grid.children.length >= 118) {

        updateGridVisuals();

        return;

    }

    

    // We are destroying the grid DOM! Clear its element cache

    clearGridCellCache('#' + gridId);

    invalidateGridCellCache();



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

    } else if (currentView === 'isotopes') {

        const legendDiv = document.createElement('div');

        legendDiv.id = 'iso-in-grid-legend';

        legendDiv.className = 'in-grid-legend';

        grid.appendChild(legendDiv);

        setTimeout(() => {

            if (typeof renderIsotopeLegend === 'function') {

                renderIsotopeLegend(selectedElement || elementsData[5]);

            }

        }, 0);

    }

    

    for (let i = 1; i <= 118; i++) {

        const elData = getElementByNumber(i);

        const pos = getGridPosition(i);

        

        const cell = document.createElement('div');

        cell.className = 'element-cell';

        cell.dataset.z = i;



        let col = pos.col;

        let row = pos.row;

        if (currentView === 'electrons' && i === 2) {

            col = 2;

        }

        if (row === 8.5) row = 9;

        else if (row === 9.5) row = 10;

        else if (currentView !== 'electrons' && currentView !== 'isotopes') {

            row = pos.row + 1;

        }



        cell.style.gridColumn = col;

        cell.style.gridRow = row;

        

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

                <span class="cell-num">${i}</span>

                <span class="cell-sym">${elData ? elData.symbol : '?'}</span>

                <span class="cell-name">${elData ? elData.name : ''}</span>

                <span class="cell-value" id="cell-val-${i}"></span>

            `;

        } else {

            cell.innerHTML = `<span class="cell-num">${i}</span>`;

        }

        

        if (!elData) cell.style.opacity = '0.2';

        else cell.addEventListener('click', () => selectElement(i, true, true));

        

        grid.appendChild(cell);

    }

    

    // Render Lanthanides & Actinides Placeholders in 18-column mode

    grid.querySelectorAll('.fblock-placeholder-cell, .in-grid-ctrl-box').forEach(el => el.remove());

    if (tableLayoutMode === '18col') {

        const isDomGrid = (currentView === 'electrons' || currentView === 'isotopes');

        const lanthRow = isDomGrid ? 6 : 7;

        const actRow = isDomGrid ? 7 : 8;



        // Lanthanide Placeholder

        const lanthPlaceholder = document.createElement('div');

        lanthPlaceholder.className = 'element-cell fblock-placeholder-cell lanth-placeholder';

        lanthPlaceholder.style.cssText = `

            grid-column: 3;

            grid-row: ${lanthRow};

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



        // Actinide Placeholder

        const actPlaceholder = document.createElement('div');

        actPlaceholder.className = 'element-cell fblock-placeholder-cell act-placeholder';

        actPlaceholder.style.cssText = `

            grid-column: 3;

            grid-row: ${actRow};

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



        // In-grid Buttons for DOM Tables (Electrons & Isotopes)

        if (isDomGrid) {

            const isElec = (currentView === 'electrons');

            const mainLabel = isElec ? 'Configuration' : 'Decay Modes';

            const subLabel = isElec ? 'ELECTRON VIEW TYPE' : 'ISOTOPE VIEW TYPE';



            // Type Switch Box (Row 9, Col 1-2)

            const typeBox = document.createElement('div');

            typeBox.className = 'in-grid-ctrl-box table-type-box';

            typeBox.style.cssText = `

                grid-column: 1 / 3;

                grid-row: 9;

                background: rgba(9, 14, 26, 0.95);

                border: 1.5px solid #00d4ff;

                border-radius: 6px;

                display: flex;

                flex-direction: column;

                justify-content: center;

                align-items: center;

                cursor: pointer;

                box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);

                box-sizing: border-box;

                padding: 2px 4px;

                z-index: 10;

                user-select: none;

            `;

            typeBox.innerHTML = `

                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 2px;">

                    <span style="font-size: 0.46rem; font-weight: 800; color: #00d4ff; letter-spacing: 0.5px;">☷ VIEW</span>

                    <span style="font-size: 0.40rem; color: #94a3b8; font-weight: 700;">▾ SWITCH</span>

                </div>

                <span class="table-type-title" style="font-size: 0.72rem; font-weight: 900; color: #ffffff; line-height: 1.1; margin: 1px 0;">${mainLabel}</span>

                <span style="font-size: 0.38rem; color: #94a3b8; letter-spacing: 0.3px; font-weight: 700;">${subLabel}</span>

            `;

            let _lastTypeTap = 0;

            const handleTypeTap = (e) => {

                const now = Date.now();

                if (now - _lastTypeTap < 250) return;

                _lastTypeTap = now;

                if (e) { e.preventDefault(); e.stopPropagation(); }

                if (window.NativeServices?.Haptics) window.NativeServices.Haptics.selection();

                if (window.openTableTypeModal) window.openTableTypeModal();

            };

            typeBox.addEventListener('click', handleTypeTap);

            typeBox.addEventListener('touchend', handleTypeTap);

            grid.appendChild(typeBox);



            // Fit Mode Box (Row 10, Col 1-2)

            const fitBox = document.createElement('div');

            fitBox.className = 'in-grid-ctrl-box fit-mode-box';

            fitBox.style.cssText = `

                grid-column: 1 / 3;

                grid-row: 10;

                background: rgba(9, 14, 26, 0.95);

                border: 1.5px solid #00d4ff;

                border-radius: 6px;

                display: flex;

                flex-direction: column;

                justify-content: center;

                align-items: center;

                cursor: pointer;

                box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);

                box-sizing: border-box;

                padding: 2px 4px;

                z-index: 10;

                user-select: none;

            `;

            fitBox.innerHTML = `

                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 2px;">

                    <span style="font-size: 0.46rem; font-weight: 800; color: #00d4ff; letter-spacing: 0.5px;">↔ FIT</span>

                    <span class="fit-pct-tag" style="font-size: 0.40rem; color: #94a3b8; font-weight: 700;">100%</span>

                </div>

                <span class="fit-mode-title" style="font-size: 0.72rem; font-weight: 900; color: #ffffff; line-height: 1.1; margin: 1px 0;">Fit: H-Fill</span>

                <span style="font-size: 0.38rem; color: #94a3b8; letter-spacing: 0.3px; font-weight: 700;">VIEWPORT SCALE</span>

            `;

            let _lastFitTap = 0;

            const handleFitTap = (e) => {

                const now = Date.now();

                if (now - _lastFitTap < 250) return;

                _lastFitTap = now;

                if (e) { e.preventDefault(); e.stopPropagation(); }

                if (window.NativeServices?.Haptics) window.NativeServices.Haptics.selection();

                cycleDomFitMode();

            };

            fitBox.addEventListener('click', handleFitTap);

            fitBox.addEventListener('touchend', handleFitTap);

            grid.appendChild(fitBox);

        }

    }

    

    updateGridVisuals();

}



// Fit modes for DOM Grids (Electrons & Isotopes)

let currentDomFitMode = 'hfill'; // 'hfill' | 'square' | 'whole'

function cycleDomFitMode() {

    if (currentDomFitMode === 'hfill') currentDomFitMode = 'square';

    else if (currentDomFitMode === 'square') currentDomFitMode = 'whole';

    else currentDomFitMode = 'hfill';

    applyDomFitMode(currentDomFitMode);

}

window.cycleDomFitMode = cycleDomFitMode;



function applyDomFitMode(mode) {

    const grids = ['electrons-grid', 'isotopes-grid'];

    grids.forEach(id => {

        const g = document.getElementById(id);

        if (g) {

            g.classList.remove('fit-hfill', 'fit-square', 'fit-whole');

            g.classList.add('fit-' + mode);

        }

    });

    const labelMap = {

        'hfill': 'Fit: H-Fill',

        'square': 'Fit: Square',

        'whole': 'Fit: Whole'

    };

    const pctMap = {

        'hfill': '100%',

        'square': '92%',

        'whole': '86%'

    };

    document.querySelectorAll('.fit-mode-title').forEach(el => {

        el.textContent = labelMap[mode] || 'Fit: H-Fill';

    });

    document.querySelectorAll('.fit-pct-tag').forEach(el => {

        el.textContent = pctMap[mode] || '100%';

    });

}

window.applyDomFitMode = applyDomFitMode;



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

    if (propName === 'ionization' || propName === 'ionizationEnergy') dataKey = 'ionizationEnergies';

    if (propName === 'energyLevels') return el.period;

    if (propName === 'radius' || propName === 'atomicRadius') dataKey = 'radius';

    

    let val = el[dataKey];

    if (val === undefined || val === null) return null;

    

    // Check if there is a sub-select for this property

    const subSelect = document.getElementById(`sub-${propName}`) ||

        ((propName === 'ionization' || propName === 'ionizationEnergy') ? document.getElementById('sub-ionization') : null) ||

        ((propName === 'radius' || propName === 'atomicRadius') ? document.getElementById('sub-radius') : null) ||

        document.getElementById(`sub-${dataKey}`);



    if (Array.isArray(val)) {

        let idx = 0;

        if (subSelect && subSelect.value !== undefined) {

            const parsed = parseInt(subSelect.value, 10);

            if (!isNaN(parsed) && parsed >= 0) idx = parsed;

        }

        return (val[idx] !== undefined && val[idx] !== null) ? val[idx] : (val[0] !== undefined ? val[0] : null);

    }

    if (typeof val === 'object' && val !== null) {

        let key = (subSelect && subSelect.value !== undefined) ? subSelect.value : Object.keys(val)[0];

        return val[key] !== undefined ? val[key] : (val[Object.keys(val)[0]] !== undefined ? val[Object.keys(val)[0]] : null);

    }

    

    return val;

}



function getNormalizedCategory(cat, z = null) {

    if (z) {

        if (z === 85) return 'Metalloid';

        if (z === 9 || z === 17 || z === 35 || z === 53 || z === 117) return 'Halogen';

        if (z === 2 || z === 10 || z === 18 || z === 36 || z === 54 || z === 86 || z === 118) return 'Noble gas';

        if (z === 1 || z === 6 || z === 7 || z === 8 || z === 15 || z === 16 || z === 34) return 'Other nonmetal';

        if (z === 5 || z === 14 || z === 32 || z === 33 || z === 51 || z === 52) return 'Metalloid';

    }

    if (!cat) return 'Unknown';

    const lowerCat = cat.toLowerCase();

    if (lowerCat.includes('halogen')) return 'Halogen';

    if (lowerCat.includes('noble gas')) return 'Noble gas';

    if (lowerCat.includes('nonmetal') || lowerCat === 'diatomic nonmetal' || lowerCat === 'polyatomic nonmetal' || lowerCat === 'reactive nonmetal') return 'Other nonmetal';

    if (lowerCat.includes('transition metal') && !lowerCat.includes('post')) return 'Transition metal';

    if (lowerCat.includes('post-transition metal')) return 'Post-transition metal';

    if (lowerCat.includes('metalloid')) return 'Metalloid';

    if (lowerCat.includes('alkali metal') && !lowerCat.includes('alkaline')) return 'Alkali metal';

    if (lowerCat.includes('alkaline earth metal')) return 'Alkaline earth metal';

    if (lowerCat.includes('lanthanide')) return 'Lanthanide';

    if (lowerCat.includes('actinide')) return 'Actinide';

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

    let pKey = propName;

    if (pKey === 'ionizationEnergy') pKey = 'ionization';

    if (pKey === 'atomicRadius') pKey = 'radius';

    const config = heatmapConfigs[pKey] || heatmapConfigs[propName];

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

window.getPropertyValue = getPropertyValue;

window.getGradientColor = getGradientColor;



const _glossyBgCache = new Map();



function getGlossyBackground(colorStr, category = '') {

    if (!colorStr) return 'rgba(255,255,255,0.02)';

    const cacheKey = colorStr + '|' + category;

    const cached = _glossyBgCache.get(cacheKey);

    if (cached) return cached;

    

    const cat = category.toLowerCase();

    const isMetal = cat.includes('metal') || cat.includes('lanthanide') || cat.includes('actinide');

    const isGas = cat.includes('gas') || cat.includes('diatomic') || cat.includes('reactive nonmetal'); 



    let baseHsl = '';

    let baseRgb = '';



    if (colorStr.startsWith('hsl')) {

        baseHsl = colorStr.replace('hsl(', '').replace(')', '');

    } else if (colorStr.startsWith('rgb')) {

        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

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



    let res = '';

    if (isMetal) {

        // Metallic: Hard diagonal gradient of the SAME color, from bright to dark

        if (baseHsl) {

            res = `linear-gradient(135deg, hsla(${baseHsl}, 0.8) 0%, hsla(${baseHsl}, 0.1) 50%, hsla(${baseHsl}, 0.3) 100%)`;

        } else {

            res = `linear-gradient(135deg, rgba(${baseRgb}, 0.8) 0%, rgba(${baseRgb}, 0.1) 50%, rgba(${baseRgb}, 0.3) 100%)`;

        }

    } 

    else if (isGas) {

        // Gaseous: Bright center, fading to dark edges

        if (baseHsl) {

            res = `radial-gradient(circle at 50% 50%, hsla(${baseHsl}, 0.8) 0%, hsla(${baseHsl}, 0.1) 80%)`;

        } else {

            res = `radial-gradient(circle at 50% 50%, rgba(${baseRgb}, 0.8) 0%, rgba(${baseRgb}, 0.1) 80%)`;

        }

    } 

    else {

        // Matte / Solid Non-metal: Smooth top-to-bottom

        if (baseHsl) {

            res = `linear-gradient(180deg, hsla(${baseHsl}, 0.6) 0%, hsla(${baseHsl}, 0.1) 100%)`;

        } else {

            res = `linear-gradient(180deg, rgba(${baseRgb}, 0.6) 0%, rgba(${baseRgb}, 0.1) 100%)`;

        }

    }



    _glossyBgCache.set(cacheKey, res);

    return res;

}



function updateGridVisuals(force = false) {

    const isMain = currentView === 'main';

    const isIsotopes = currentView === 'isotopes';

    const gridId = isMain ? '#main-grid' : 

                   isIsotopes ? '#isotopes-grid' : '#electrons-grid';

    const activeProp = isMain ? currentProperty : currentElecProperty;

    

    const tempWrapper = document.getElementById('temp-controller-wrapper');

    const timelineWrapper = document.getElementById('timeline-controller-wrapper');

    const tempDisplay = document.getElementById('temp-display-container');

    const timelineDisplay = document.getElementById('timeline-display-container');

    if (tempWrapper && timelineWrapper) {

        if (isMain && currentProperty === 'discoveryYear') {

            tempWrapper.classList.add('hidden');

            tempWrapper.style.display = 'none';

            if (tempDisplay) { tempDisplay.classList.add('hidden'); tempDisplay.style.display = 'none'; }

            timelineWrapper.classList.remove('hidden');

            timelineWrapper.style.display = 'flex';

            timelineWrapper.style.visibility = 'visible';

            if (timelineDisplay) { timelineDisplay.classList.remove('hidden'); timelineDisplay.style.display = 'flex'; timelineDisplay.style.visibility = 'visible'; }

        } else if (isMain) {

            tempWrapper.classList.remove('hidden');

            tempWrapper.style.display = 'flex';

            tempWrapper.style.visibility = 'visible';

            if (tempDisplay) { tempDisplay.classList.remove('hidden'); tempDisplay.style.display = 'flex'; tempDisplay.style.visibility = 'visible'; }

            timelineWrapper.classList.add('hidden');

            timelineWrapper.style.display = 'none';

            if (timelineDisplay) { timelineDisplay.classList.add('hidden'); timelineDisplay.style.display = 'none'; }

        } else {

            tempWrapper.classList.add('hidden');

            tempWrapper.style.display = 'none';

            if (tempDisplay) { tempDisplay.classList.add('hidden'); tempDisplay.style.display = 'none'; }

            timelineWrapper.classList.add('hidden');

            timelineWrapper.style.display = 'none';

            if (timelineDisplay) { timelineDisplay.classList.add('hidden'); timelineDisplay.style.display = 'none'; }

        }

    }



    // High-performance visual cache: check if active grid is already styled

    const gridEl = document.querySelector(gridId);

    const curT = typeof currentTemp !== 'undefined' ? Math.round(currentTemp) : 298;

    const curY = typeof currentTimelineYear !== 'undefined' ? currentTimelineYear : 2026;

    const visualKey = `${currentView}_${activeProp}_${curT}_${curY}`;



    if (!force && gridEl && gridEl._renderedVisualKey === visualKey && gridEl.children.length >= 118) {

        return; // Fast path: Grid visuals already up-to-date! Skip heavy DOM iterations.

    }

    if (gridEl) gridEl._renderedVisualKey = visualKey;

     // Rebuild cache for the current active grid

    const cachedItems = getGridCellCache();

    

    let solidCount = 0, liquidCount = 0, gasCount = 0, unknownCount = 0;

    const blockColors = {

        s: '#00d4ff', // Cyan (s-block)

        p: '#22c55e', // Emerald Green (p-block)

        d: '#6366f1', // Indigo / Purple (d-block)

        f: '#a855f7'  // Vibrant Purple (f-block, distinct from red exceptions)

    };



    cachedItems.forEach(item => {

        const cell = item.cell;

        const elData = item.elData;

        if (!elData) return;

        const normalizedCategory = getNormalizedCategory(elData.category, elData.atomicNumber);

        

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



        const symSpan = item.symSpan;

        if (symSpan) {

            if (!isMain && !isIsotopes && (activeProp === 'configuration' || activeProp === 'expanded')) {

                const isException = (elData.atomicNumber in aufbauExceptions);

                symSpan.style.color = isException ? '#ef4444' : '#ffffff';

            } else {

                symSpan.style.color = stateTextColors[currentState];

            }

        }



        if (currentView === 'electrons') {

            const bohrWrapper = item.bohrSpan;

            if (bohrWrapper) {

                bohrWrapper.style.color = stateTextColors[currentState];

            }

        }



        // 2. Determine Background/Border/Value

        let color = '#333';

        let valText = '';



        if (isMain || isIsotopes) {

            if (isIsotopes || currentProperty === 'category' || currentProperty === 'wiki') {

                color = categoryColors[normalizedCategory] || '#333';

                if (isIsotopes) {

                    valText = (typeof isotopeData !== 'undefined' && isotopeData[item.z]) ? `${isotopeData[item.z].length} iso` : '0';

                } else if (currentProperty === 'wiki') {

                    valText = `<span style="font-size: 0.55rem; text-decoration: underline; cursor: pointer; color: rgba(255,255,255,0.8); display: inline-block; margin-top: 1px;" onclick="event.stopPropagation(); if (window.openWikiModal) window.openWikiModal('${elData.name}')">Wiki ↗</span>`;

                } else {

                    valText = elData.atomicMass ? elData.atomicMass.toFixed(3) : '';

                }

            } else if (currentProperty === 'state') {

                color = stateColors[currentState] || '#6b7280';

                valText = currentState;

            } else if (currentProperty === 'block') {

                const bColors = { s: '#00d4ff', p: '#22c55e', d: '#6366f1', f: '#a855f7' };

                color = bColors[elData.block] || '#64748b';

                valText = elData.block ? elData.block.toUpperCase() + '-block' : '';

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

                    valText = '-';

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



        if (currentView === 'electrons' || currentView === 'isotopes') {

            const isSel = (selectedElement && selectedElement.atomicNumber === item.z);

            cell.style.background = `linear-gradient(180deg, ${hexToRgbaLocal(color, isSel ? 0.85 : 0.54)} 0%, ${hexToRgbaLocal(color, isSel ? 0.70 : 0.40)} 40%, ${hexToRgbaLocal(color, isSel ? 0.55 : 0.28)} 100%)`;

            cell.style.border = isSel ? '2px solid #00f0ff' : `1px solid ${hexToRgbaLocal(color, 0.65)}`;

            cell.style.boxShadow = isSel ? '0 0 10px rgba(0, 240, 255, 0.8)' : 'none';

            cell.style.borderRadius = '4px';

        } else {

            cell.style.background = getGlossyBackground(color, normalizedCategory);

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

        let dualCat = elData.dualCategory || '';

        if (elData.atomicNumber === 85) {

            dualCat = normalizedCategory === 'Metalloid' ? 'Halogen' : 'Metalloid';

        } else if (elData.atomicNumber === 84) {

            dualCat = normalizedCategory === 'Metalloid' ? 'Post-transition metal' : 'Metalloid';

        }

        cell.dataset.dualCategory = dualCat;

        cell.dataset.state = currentState;

        cell.dataset.block = elData.block || '';



        const valSpan = item.valSpan;

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

    if (window.PeriodicCanvasGrid) {

        window.PeriodicCanvasGrid.requestRender();

    }

}



let _isFilterActive = false;



function filterGridElements(rawQuery) {

    const q = (rawQuery || '').trim().toLowerCase();

    

    // Sync all search inputs across tabs

    document.querySelectorAll('.element-search-input').forEach(input => {

        if (input.value !== (rawQuery || '')) input.value = rawQuery || '';

    });



    if (!q && !_isFilterActive) return;



    if (!q) {

        _isFilterActive = false;

        document.querySelectorAll('.element-cell').forEach(cell => {

            cell.style.opacity = '1';

            cell.style.filter = 'none';

            cell.style.transform = 'none';

            cell.style.zIndex = '1';

            cell.style.pointerEvents = 'auto';

        });

        return;

    }



    _isFilterActive = true;

    const activeView = document.querySelector('.view-mode.active');

    if (!activeView) return;



    activeView.querySelectorAll('.element-cell').forEach(cell => {

        const z = cell.dataset.z;

        if (!z) return;

        const el = getElementByNumber(parseInt(z));

        if (!el) return;



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

    const normalizedCategory = getNormalizedCategory(el.category, el.atomicNumber);

    

    let currentState = 'Unknown';

    if (el.meltingPoint !== null && el.meltingPoint !== undefined && el.boilingPoint !== null && el.boilingPoint !== undefined) {

        if (currentTemp < el.meltingPoint) currentState = 'Solid';

        else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';

        else currentState = 'Gas';

    }

    

    let color = '#00d4ff';

    const activeProp = (currentView === 'electrons') ? currentElecProperty : currentProperty;

    

    if (activeProp === 'category' || activeProp === 'wiki') {

        color = categoryColors[normalizedCategory] || '#00d4ff';

    } else if (activeProp === 'state') {

        color = stateColors[currentState] || '#6b7280';

    } else if (activeProp === 'oxidation') {

        const statesStr = el.oxidationStates || '';

        const states = statesStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        if (states.length > 0) {

            const primary = states[0];

            if (primary < 0) color = getHeatmapColor(primary, { minColor: '#ff0000', maxColor: '#ffffff', scale: 'linear', min: -4, max: 0 });

            else if (primary > 0) color = getHeatmapColor(primary, { minColor: '#ffffff', maxColor: '#00ff00', scale: 'linear', min: 0, max: 8 });

            else color = '#ffffff';

        } else { color = '#00d4ff'; }

    } else if (activeProp === 'configuration' || activeProp === 'expanded') {

        const blockColors = { s: '#00d4ff', p: '#84cc16', d: '#d946ef', f: '#3b82f6' };

        color = blockColors[el.block] || categoryColors[normalizedCategory] || '#00d4ff';

    } else if (activeProp === 'energyLevel') {

        const shells = el.electronsPerShell ? el.electronsPerShell.length : 1;

        color = getHeatmapColor(shells, heatmapConfigs.energyLevels);

    } else if (activeProp === 'quantum') {

        const qn = getQuantumNumbers(el.electronConfiguration);

        const lColors = {0: '#ff6b6b', 1: '#4ecdc4', 2: '#feca57', 3: '#a29bfe'};

        color = lColors[qn.l] || '#00d4ff';

    } else if (heatmapConfigs[activeProp]) {

        const numValue = getPropertyValue(el, activeProp);

        if (activeProp === 'discoveryYear' && el.discoveryYear === 'Ancient') {

            color = '#ffffff';

        } else if (numValue !== null && numValue !== undefined && !isNaN(numValue)) {

            color = getGradientColor(numValue, activeProp);

        } else {

            color = heatmapUnknownColor;

        }

    } else {

        color = categoryColors[normalizedCategory] || '#00d4ff';

    }



    const glossBg = (activeProp === 'category' || activeProp === 'wiki') ? 

        getGlossyBackground(color, normalizedCategory) : 

        getGlossyBackground(color, '');



    // 1. Update Property Interface card background & border (Matches Element Box)

    const mainCard = document.getElementById('element-detail-card');

    if (mainCard) {

        mainCard.style.setProperty('background', glossBg, 'important');

        mainCard.style.setProperty('border-color', color || '#00d4ff', 'important');

    }



    // 2. Update Electrons & Orbitals card background & border

    const elecCard = document.getElementById('elec-element-card');

    if (elecCard) {

        elecCard.style.setProperty('background', glossBg, 'important');

        elecCard.style.setProperty('border-color', color || '#00d4ff', 'important');

    }



    const isoCard = document.getElementById('iso-element-card');

    if (isoCard) {

        isoCard.style.setProperty('background', glossBg, 'important');

        isoCard.style.setProperty('border-color', color || '#00d4ff', 'important');

    }



    // 3. Dynamic Temperature State Pill, Dot & Text Reflection

    const curK = Math.round(currentTemp || 298);

    const stateText = `${currentState} (${curK} K)`;



    const stateDotColors = {

        'Solid': '#ffffff',   // Crisp Pure White for solid state

        'Liquid': '#00f0ff',  // Electric Neon Cyan for liquid

        'Gas': '#ff0055',     // Vibrant Neon Pink-Red for gas

        'Unknown': '#94a3b8'  // Muted Slate Silver for unknown

    };

    const curDotColor = stateDotColors[currentState] || '#ffffff';

    const stateGlow = (currentState === 'Solid') ? '0 0 7px rgba(255, 255, 255, 0.9)' :

                      (currentState === 'Liquid') ? '0 0 7px #00f0ff' :

                      (currentState === 'Gas') ? '0 0 7px #ff0055' : '0 0 4px #94a3b8';

    const statePillBorder = (currentState === 'Solid') ? 'rgba(255, 255, 255, 0.45)' :

                            (currentState === 'Liquid') ? 'rgba(0, 240, 255, 0.55)' :

                            (currentState === 'Gas') ? 'rgba(255, 0, 85, 0.55)' : 'rgba(148, 163, 184, 0.35)';

    const statePillBg = (currentState === 'Solid') ? 'rgba(255, 255, 255, 0.12)' :

                        (currentState === 'Liquid') ? 'rgba(0, 240, 255, 0.14)' :

                        (currentState === 'Gas') ? 'rgba(255, 0, 85, 0.14)' : 'rgba(148, 163, 184, 0.10)';



    const statePills = [

        { dot: document.getElementById('dh-state-dot'), text: document.getElementById('dh-state-text'), pill: document.getElementById('dh-state-pill') },

        { dot: document.getElementById('elec-state-dot'), text: document.getElementById('elec-state-text'), pill: document.getElementById('elec-state-pill') },

        { dot: document.getElementById('iso-state-dot'), text: document.getElementById('iso-state-text'), pill: document.getElementById('iso-state-pill') }

    ];



    statePills.forEach(group => {

        if (group.dot) {

            group.dot.style.setProperty('background', curDotColor, 'important');

            group.dot.style.setProperty('box-shadow', stateGlow, 'important');

        }

        if (group.text) {

            group.text.textContent = stateText;

            group.text.style.setProperty('color', curDotColor, 'important');

            group.text.style.setProperty('text-shadow', `0 0 6px ${statePillBorder}`, 'important');

        }

        if (group.pill) {

            group.pill.style.setProperty('border-color', statePillBorder, 'important');

            group.pill.style.setProperty('background', statePillBg, 'important');

        }

    });



    // 4. Update Header Badges for Metal / Non-metal Category

    const catColor = categoryColors[normalizedCategory] || '#00d4ff';

    const catText = (el.category || normalizedCategory).toUpperCase();

    const badgeHtml = `<span class="ed-series-dot" style="width: 5px; height: 5px; border-radius: 50%; background: ${catColor}; box-shadow: 0 0 5px ${catColor}; display: inline-block; flex-shrink: 0;"></span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${catText}</span>`;



    [document.getElementById('dh-series-badge'), document.getElementById('elec-series-badge'), document.getElementById('iso-series-badge')].forEach(badge => {

        if (badge) {

            badge.innerHTML = badgeHtml;

            badge.style.setProperty('color', '#ffffff', 'important');

            badge.style.setProperty('border-color', catColor, 'important');

            const bgGrad = `linear-gradient(135deg, ${window.hexToRgba ? window.hexToRgba(catColor, 0.42) : hexToRgbaLocal(catColor, 0.42)} 0%, ${window.hexToRgba ? window.hexToRgba(catColor, 0.18) : hexToRgbaLocal(catColor, 0.18)} 100%)`;

            badge.style.setProperty('background', bgGrad, 'important');

            const glow = window.hexToRgba ? window.hexToRgba(catColor, 0.50) : hexToRgbaLocal(catColor, 0.50);

            badge.style.setProperty('box-shadow', `0 0 8px ${glow}`, 'important');

        }

    });



    const valState = document.getElementById('val-state');

    if (valState) {

        valState.textContent = currentState;

        valState.style.setProperty('color', curDotColor, 'important');

    }



    let symbolColor = stateTextColors[currentState] || '#ffffff';

    let symbolShadow = '0 0 5px #000, 0 1px 3px #000';



    if (activeProp === 'configuration' || activeProp === 'expanded') {

        const isException = (el.atomicNumber in aufbauExceptions);

        if (isException) {

            symbolColor = '#ef4444';

            symbolShadow = '0 0 10px rgba(239, 68, 68, 0.95), 0 0 4px #000';

        } else if (currentView === 'electrons') {

            symbolColor = '#ffffff';

        }

    }



    const dhSym = document.getElementById('dh-symbol');

    if (dhSym) {

        dhSym.style.color = symbolColor;

        dhSym.style.textShadow = symbolShadow;

    }



    const dhName = document.getElementById('dh-name');

    if (dhName) {

        dhName.innerText = el.name;

        dhName.style.color = '#ffffff';

    }



    const elecSym = document.getElementById('elec-symbol');

    if (elecSym) {

        elecSym.style.color = symbolColor;

        elecSym.style.textShadow = symbolShadow;

    }



    const elecName = document.getElementById('elec-name');

    if (elecName) {

        elecName.innerText = el.name;

        elecName.style.color = '#ffffff';

    }

}



function renderLegend() {

    const legendContainer = document.getElementById('in-grid-legend');

    if (!legendContainer) return;



    let propKey = currentProperty;

    if (propKey === 'ionizationEnergy') propKey = 'ionization';

    if (propKey === 'atomicRadius') propKey = 'radius';

    const pConf = heatmapConfigs[propKey] || heatmapConfigs[currentProperty];



    if (pConf) {

        const isLog = pConf.scale === 'log';

        const isIonization = (currentProperty === 'ionization' || currentProperty === 'ionizationEnergy');

        const subIonEl = document.getElementById('sub-ionization');

        const currentSubIonIdx = subIonEl ? parseInt(subIonEl.value, 10) || 0 : 0;



        const midRowHtml = pConf.midColor ? `

                            <div class="hm-row" style="margin-top: 10px;">

                                <span>Zero (0°C)</span>

                                <input type="color" id="hm-mid" value="${pConf.midColor}">

                            </div>` : '';

        const maxMargin = pConf.midColor ? '10px' : '20px';

        const gradString = pConf.midColor ? `linear-gradient(to bottom, ${pConf.minColor}, ${pConf.midColor}, ${pConf.maxColor})` : `linear-gradient(to bottom, ${pConf.minColor}, ${pConf.maxColor})`;



        const ionSubRowHtml = isIonization ? `

            <div class="hm-row" style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; gap: 4px;">

                <span style="color:#00d4ff; font-weight:700; font-size:0.42rem;">Level</span>

                <div class="ion-pill-group">

                    <button class="ion-pill ${currentSubIonIdx === 0 ? 'active' : ''}" data-idx="0">1st</button>

                    <button class="ion-pill ${currentSubIonIdx === 1 ? 'active' : ''}" data-idx="1">2nd</button>

                    <button class="ion-pill ${currentSubIonIdx === 2 ? 'active' : ''}" data-idx="2">3rd</button>

                    <button class="ion-pill ${currentSubIonIdx === 3 ? 'active' : ''}" data-idx="3">4th</button>

                </div>

            </div>` : '';



        legendContainer.innerHTML = `

            <div class="legend-box heatmap-controller">

                <div class="heatmap-section">

                    <div class="legend-box-title">${isIonization ? 'Ionization Energy' : 'Color'}</div>

                    ${ionSubRowHtml}

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



        if (isIonization) {

            legendContainer.querySelectorAll('.ion-pill').forEach(pill => {

                pill.addEventListener('click', (e) => {

                    e.stopPropagation();

                    const idx = pill.dataset.idx;

                    const subSelect = document.getElementById('sub-ionization');

                    if (subSelect) subSelect.value = idx;

                    legendContainer.querySelectorAll('.ion-pill').forEach(p => p.classList.remove('active'));

                    pill.classList.add('active');

                    updateGridVisuals();

                    if (window.PeriodicCanvasGrid && window.PeriodicCanvasGrid.render) {

                        window.PeriodicCanvasGrid.render();

                    }

                });

            });

        }



        document.getElementById('hm-min').addEventListener('input', (e) => { pConf.minColor = e.target.value; updateGridVisuals(); });

        document.getElementById('hm-max').addEventListener('input', (e) => { pConf.maxColor = e.target.value; updateGridVisuals(); });

        const hmMid = document.getElementById('hm-mid');

        if (hmMid) hmMid.addEventListener('input', (e) => { pConf.midColor = e.target.value; updateGridVisuals(); });

        document.getElementById('hm-unk').addEventListener('input', (e) => { heatmapUnknownColor = e.target.value; updateGridVisuals(); });

        document.getElementById('hm-linear').addEventListener('click', () => { pConf.scale = 'linear'; updateGridVisuals(); });

        document.getElementById('hm-log').addEventListener('click', () => { pConf.scale = 'log'; updateGridVisuals(); });

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

    const sColors = {

        'Solid': '#ffffff',     // Pure Crisp White

        'Liquid': '#00f0ff',    // Electric Neon Cyan

        'Gas': '#f87171',       // Neon Coral Red

        'Unknown': '#94a3b8'    // Slate Gray

    };

    window.sColors = sColors;



    function hexToRgbaLocal(color, alpha) {

        if (!color) return `rgba(100,116,139,${alpha})`;

        if (typeof color === 'string' && color.startsWith('rgb(')) {

            const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

            if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;

        } else if (typeof color === 'string' && color.startsWith('rgba(')) {

            return color.replace(/rgba\((\d+,\s*\d+,\s*\d+,)\s*[^)]+\)/, `rgba($1 ${alpha})`);

        }

        if (typeof color !== 'string' || color[0] !== '#') return `rgba(100,116,139,${alpha})`;

        let c = color.substring(1);

        if (c.length === 3) c = c.split('').map(x => x + x).join('');

        const num = parseInt(c, 16);

        if (isNaN(num)) return `rgba(100,116,139,${alpha})`;

        const r = (num >> 16) & 255;

        const g = (num >> 8) & 255;

        const b = num & 255;

        return `rgba(${r},${g},${b},${alpha})`;

    }



    function updateLegendIndicatorUI() {

        const allItems = document.querySelectorAll('#in-grid-legend .legend-item, #elec-in-grid-legend .legend-item');

        const allSuper = document.querySelectorAll('#in-grid-legend .interactive-super, #elec-in-grid-legend .interactive-super');

        const isAnyActive = !!(lockedLegendKey || lockedLegendGroup);



        allItems.forEach(item => {

            const key = item.dataset.key;

            const type = item.dataset.type;

            const isMatched = (lockedLegendKey === key && lockedLegendType === type) ||

                              (lockedLegendGroup && categoryGroups[lockedLegendGroup] && categoryGroups[lockedLegendGroup].includes(key));



            if (isMatched) {

                item.classList.add('legend-item-active');

                item.classList.remove('legend-item-dimmed');

                if (type === 'state') {

                    if (key === 'Unknown') {

                        item.style.setProperty('box-shadow', '0 0 14px rgba(148, 163, 184, 0.8), inset 0 0 8px rgba(148, 163, 184, 0.4)', 'important');

                        item.style.setProperty('border', '2px dashed #ffffff', 'important');

                        item.style.setProperty('background', 'rgba(51, 65, 85, 0.95)', 'important');

                    } else if (key === 'Solid') {

                        item.style.setProperty('box-shadow', '0 0 16px #ffffff, 0 0 4px #ffffff, inset 0 0 8px rgba(255,255,255,0.8)', 'important');

                        item.style.setProperty('border', '2px solid #ffffff', 'important');

                        item.style.setProperty('background', 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)', 'important');

                    } else {

                        const color = sColors[key] || '#ffffff';

                        item.style.setProperty('box-shadow', `0 0 16px ${color}, 0 0 4px #ffffff, inset 0 0 8px ${color}`, 'important');

                        item.style.setProperty('border', `2px solid #ffffff`, 'important');

                        item.style.setProperty('background', `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.65)} 0%, ${hexToRgbaLocal(color, 0.45)} 100%)`, 'important');

                    }

                    item.style.setProperty('transform', 'scale(1.08)', 'important');

                    item.style.setProperty('z-index', '15', 'important');

                    item.style.setProperty('opacity', '1', 'important');

                    item.style.setProperty('filter', 'none', 'important');

                } else {

                    const color = categoryColors[key] || '#00d4ff';

                    item.style.setProperty('box-shadow', `0 0 16px ${color}, 0 0 4px #ffffff, inset 0 0 8px ${color}`, 'important');

                    item.style.setProperty('border', `2px solid #ffffff`, 'important');

                    item.style.setProperty('background', `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.95)} 0%, ${hexToRgbaLocal(color, 0.75)} 50%, ${hexToRgbaLocal(color, 0.55)} 100%)`, 'important');

                    item.style.setProperty('transform', 'scale(1.08)', 'important');

                    item.style.setProperty('z-index', '15', 'important');

                    item.style.setProperty('opacity', '1', 'important');

                    item.style.setProperty('filter', 'none', 'important');

                }

            } else if (isAnyActive) {

                item.classList.remove('legend-item-active');

                item.classList.add('legend-item-dimmed');

                item.style.setProperty('box-shadow', 'none', 'important');

                item.style.setProperty('transform', 'scale(0.97)', 'important');

                item.style.setProperty('z-index', '1', 'important');

                item.style.setProperty('opacity', '0.35', 'important');

                item.style.setProperty('filter', 'brightness(0.65)', 'important');

            } else {

                item.classList.remove('legend-item-active');

                item.classList.remove('legend-item-dimmed');

                if (type === 'state') {

                    if (key === 'Unknown') {

                        item.style.setProperty('background', 'rgba(30, 41, 59, 0.55)', 'important');

                        item.style.setProperty('border', '1px dashed rgba(148, 163, 184, 0.7)', 'important');

                        item.style.setProperty('box-shadow', 'none', 'important');

                    } else if (key === 'Solid') {

                        const solidBg = `linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(226, 232, 240, 0.65) 50%, rgba(203, 213, 225, 0.45) 100%)`;

                        item.style.setProperty('background', solidBg, 'important');

                        item.style.setProperty('border', '1px solid #ffffff', 'important');

                        item.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 4px rgba(0, 0, 0, 0.5)', 'important');

                    } else {

                        const color = sColors[key] || '#ffffff';

                        const stateBg = `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.42)} 0%, ${hexToRgbaLocal(color, 0.25)} 50%, ${hexToRgbaLocal(color, 0.12)} 100%)`;

                        item.style.setProperty('background', stateBg, 'important');

                        item.style.setProperty('border', `1px solid ${color}`, 'important');

                        item.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 3px rgba(0, 0, 0, 0.4)', 'important');

                    }

                } else {

                    if (currentProperty === 'state') {

                        item.style.setProperty('background', 'rgba(30, 41, 59, 0.40)', 'important');

                        item.style.setProperty('border', '1px solid rgba(148, 163, 184, 0.25)', 'important');

                        item.style.setProperty('box-shadow', 'none', 'important');

                        const span = item.querySelector('span');

                        if (span) {

                            span.style.setProperty('color', '#94a3b8', 'important');

                            span.style.setProperty('text-shadow', 'none', 'important');

                            span.style.setProperty('font-weight', '600', 'important');

                        }

                    } else {

                        const color = categoryColors[key] || '#00d4ff';

                        const glossBg = `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.82)} 0%, ${hexToRgbaLocal(color, 0.60)} 50%, ${hexToRgbaLocal(color, 0.40)} 100%)`;

                        item.style.setProperty('background', glossBg, 'important');

                        item.style.setProperty('border', `1px solid ${color}`, 'important');

                        item.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4)', 'important');

                        const span = item.querySelector('span');

                        if (span) {

                            span.style.setProperty('color', '#ffffff', 'important');

                            span.style.setProperty('text-shadow', '0 1px 2px rgba(0,0,0,0.85)', 'important');

                            span.style.setProperty('font-weight', '800', 'important');

                        }

                    }

                }

                item.style.setProperty('transform', 'none', 'important');

                item.style.setProperty('z-index', '1', 'important');

                item.style.setProperty('opacity', '1', 'important');

                item.style.setProperty('filter', 'none', 'important');

            }

        });



        allSuper.forEach(item => {

            const grp = item.dataset.group;

            const isMatched = (lockedLegendGroup === grp);

            if (isMatched) {

                item.classList.add('super-active');

                item.classList.remove('super-dimmed');

                item.style.setProperty('box-shadow', '0 0 16px rgba(0, 240, 255, 0.95), inset 0 0 8px rgba(0, 240, 255, 0.45)', 'important');

                item.style.setProperty('border-radius', '4px', 'important');

                item.style.setProperty('background', 'rgba(0, 212, 255, 0.35)', 'important');

                item.style.setProperty('color', '#ffffff', 'important');

                item.style.setProperty('transform', 'scale(1.05)', 'important');

                item.style.setProperty('opacity', '1', 'important');

            } else if (isAnyActive) {

                item.classList.remove('super-active');

                item.classList.add('super-dimmed');

                item.style.boxShadow = '';

                item.style.borderRadius = '';

                item.style.background = '';

                item.style.color = '';

                item.style.transform = '';

                item.style.opacity = '0.40';

            } else {

                item.classList.remove('super-active');

                item.classList.remove('super-dimmed');

                item.style.boxShadow = '';

                item.style.borderRadius = '';

                item.style.background = '';

                item.style.color = '';

                item.style.transform = '';

                item.style.opacity = '';

            }

        });

    }

    window.updateLegendIndicatorUI = updateLegendIndicatorUI;



    window.clearLegendHighlightingForce = function() {

        lockedLegendKey = null;

        lockedLegendType = null;

        lockedLegendGroup = null;

        window.lockedLegendKey = null;

        window.lockedLegendType = null;

        window.lockedLegendGroup = null;

        window.activeLegendHighlight = null;

        updateLegendIndicatorUI();

        applyLegendHighlighting(null, null, null);

        if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.render === 'function') {

            window.PeriodicCanvasGrid.render();

        }

    };



    window.handleLegendClick = function(item, e) {

        if (e && e.stopPropagation) e.stopPropagation();

        if (!item) return;

        const key = item.dataset.key;

        const type = item.dataset.type;

        if (lockedLegendKey === key && lockedLegendType === type) {

            window.clearLegendHighlightingForce();

        } else {

            lockedLegendKey = key;

            lockedLegendType = type;

            lockedLegendGroup = null;

            window.lockedLegendKey = key;

            window.lockedLegendType = type;

            window.lockedLegendGroup = null;

            window.activeLegendHighlight = { key, type, groupKeys: null };

            updateLegendIndicatorUI();

            applyLegendHighlighting(key, type, null);

        }

    };



    window.handleSuperLegendClick = function(item, e) {

        if (e && e.stopPropagation) e.stopPropagation();

        if (!item) return;

        const groupName = item.dataset.group;

        if (lockedLegendGroup === groupName) {

            window.clearLegendHighlightingForce();

        } else {

            lockedLegendGroup = groupName;

            lockedLegendKey = null;

            lockedLegendType = null;

            window.lockedLegendGroup = groupName;

            window.lockedLegendKey = null;

            window.lockedLegendType = null;

            const grpKeys = categoryGroups[groupName] || [];

            window.activeLegendHighlight = { key: null, type: null, groupKeys: grpKeys };

            updateLegendIndicatorUI();

            applyLegendHighlighting(null, null, grpKeys);

        }

    };



    if (currentProperty === 'state') {

        legendContainer.className = 'in-grid-legend state-view';

    } else {

        legendContainer.className = 'in-grid-legend';

    }



    function makeLegendItem(key, type = 'category', customLabel = null) {

        const label = customLabel || key;

        if (type === 'category') {

            if (currentProperty === 'state') {

                return `

                    <div class="legend-item legend-item-muted" data-key="${key}" data-type="category" style="background: rgba(30, 41, 59, 0.35); border: 1px solid rgba(148, 163, 184, 0.2); box-shadow: none;">

                        <span style="color: #94a3b8 !important; font-weight: 600; text-shadow: none;">${label}</span>

                    </div>

                `;

            }

            const color = categoryColors[key] || '#00d4ff';

            const glossBg = `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.82)} 0%, ${hexToRgbaLocal(color, 0.60)} 50%, ${hexToRgbaLocal(color, 0.40)} 100%)`;

            return `

                <div class="legend-item" data-key="${key}" data-type="category" style="background: ${glossBg}; border: 1px solid ${color}; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4);">

                    <span style="color: #ffffff !important; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.85);">${label}</span>

                </div>

            `;

        } else if (key === 'Unknown') {

            const countStr = (window.lastStateCounts && window.lastStateCounts[key] !== undefined) ? ` (${window.lastStateCounts[key]})` : '';

            return `

                <div class="legend-item" data-key="${key}" data-type="state" style="background: rgba(30, 41, 59, 0.55); border: 1px dashed rgba(148, 163, 184, 0.7); color: #94a3b8; box-shadow: none;">

                    <span style="color: #94a3b8 !important; font-weight: 700; font-style: italic; text-shadow: 0 1px 2px rgba(0,0,0,0.9);">${label}${countStr}</span>

                </div>

            `;

        } else if (key === 'Solid') {

            const countStr = (window.lastStateCounts && window.lastStateCounts[key] !== undefined) ? ` (${window.lastStateCounts[key]})` : '';

            const solidBg = `linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(226, 232, 240, 0.65) 50%, rgba(203, 213, 225, 0.45) 100%)`;

            return `

                <div class="legend-item" data-key="${key}" data-type="state" style="background: ${solidBg}; border: 1px solid #ffffff; color: #0f172a; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 4px rgba(0, 0, 0, 0.5);">

                    <span style="color: #0f172a !important; font-weight: 800; text-shadow: 0 1px 0 rgba(255,255,255,0.4);">${label}${countStr}</span>

                </div>

            `;

        } else {

            const color = sColors[key] || '#ffffff';

            const countStr = (window.lastStateCounts && window.lastStateCounts[key] !== undefined) ? ` (${window.lastStateCounts[key]})` : '';

            const stateBg = `linear-gradient(180deg, ${hexToRgbaLocal(color, 0.42)} 0%, ${hexToRgbaLocal(color, 0.25)} 50%, ${hexToRgbaLocal(color, 0.12)} 100%)`;

            return `

                <div class="legend-item" data-key="${key}" data-type="state" style="background: ${stateBg}; border: 1px solid ${color}; color: ${color}; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 3px rgba(0, 0, 0, 0.4);">

                    <span style="color: ${color} !important; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.9);">${label}${countStr}</span>

                </div>

            `;

        }

    }



    let html = `

        <div class="legend-box category-box">

            <div class="legend-box-title" onclick="openCardAnatomyModal()" title="Click to view Element Box Guide">Element Series ℹ️</div>

            <div class="legend-box-content">

                <!-- Column 1: Metals (70%) -->

                <div class="legend-col-metals">

                    <div class="legend-group-title interactive-super" data-group="Metals">Metals</div>

                    <div class="metals-layout-grid">

                        <div class="metals-top-row">

                            <div class="metals-col-sblock">

                                ${makeLegendItem('Alkali metal', 'category', 'Alkali')}

                                ${makeLegendItem('Alkaline earth metal', 'category', 'Alkaline Earth')}

                            </div>

                            <div class="metals-col-dblock">

                                ${makeLegendItem('Transition metal', 'category', 'Transition')}

                            </div>

                            <div class="metals-col-pblock">

                                ${makeLegendItem('Post-transition metal', 'category', 'Post-Transition')}

                            </div>

                        </div>

                        <div class="metals-bottom-row">

                            ${makeLegendItem('Lanthanide', 'category', 'Lanthanides')}

                        </div>

                        <div class="metals-bottom-row">

                            ${makeLegendItem('Actinide', 'category', 'Actinides')}

                        </div>

                    </div>

                </div>



                <!-- Column 2: Metalloids (10%) -->

                <div class="legend-col-metalloids">

                    <div class="legend-group-title interactive-super" data-group="Metalloids">Metalloids</div>

                    <div class="metalloids-items">

                        ${makeLegendItem('Metalloid')}

                    </div>

                </div>



                <!-- Column 3: Non-Metals (20%) -->

                <div class="legend-col-nonmetals">

                    <div class="legend-group-title interactive-super" data-group="Non-Metals">Non-Metals</div>

                    <div class="nonmetals-items">

                        ${makeLegendItem('Other nonmetal', 'category', 'Other Nonmetals')}

                        ${makeLegendItem('Halogen', 'category', 'Halogens')}

                        ${makeLegendItem('Noble gas', 'category', 'Noble Gases')}

                    </div>

                </div>

            </div>

        </div>

        

        <div class="legend-box state-box">

            <div class="legend-box-title" onclick="openCardAnatomyModal()" title="Click to view Element Box Guide">State of Matter ℹ️</div>

            <div class="legend-box-content">

                <div class="legend-group legend-group-states">

                    <div class="legend-group-items">

                        ${makeLegendItem('Solid', 'state')}

                        ${makeLegendItem('Liquid', 'state')}

                        ${makeLegendItem('Gas', 'state')}

                        ${makeLegendItem('Unknown', 'state')}

                    </div>

                </div>

            </div>

        </div>

    `;

    

    legendContainer.innerHTML = html;

    _legendStateItems = null;

    _lastLegendCounts = { Solid: -1, Liquid: -1, Gas: -1, Unknown: -1 };

    updateLegendIndicatorUI();



    // Interactions for individual items (Tap = highlight/toggle; Long-press = concept modal)

    document.querySelectorAll('#in-grid-legend .legend-item').forEach(item => {

        item.addEventListener('mouseenter', (e) => {

            if (lockedLegendKey || lockedLegendGroup) return;

            const key = e.currentTarget.dataset.key;

            const type = e.currentTarget.dataset.type;

            applyLegendHighlighting(key, type);

        });

        item.addEventListener('mouseleave', () => clearLegendHighlighting());



        if (typeof window.bindLongPress === 'function') {

            window.bindLongPress(

                item,

                (el) => {

                    const key = el.dataset.key;

                    const type = el.dataset.type;

                    if (window.openLegendConceptModal) window.openLegendConceptModal(key, type);

                },

                (el, e) => {

                    window.handleLegendClick(el, e);

                }

            );

        } else {

            item.addEventListener('click', (e) => window.handleLegendClick(item, e));

        }

    });



    // Interactions for super categories (Tap = highlight group; Long-press = concept modal)

    document.querySelectorAll('#in-grid-legend .interactive-super').forEach(item => {

        item.addEventListener('mouseenter', (e) => {

            if (lockedLegendKey || lockedLegendGroup) return;

            const groupName = e.currentTarget.dataset.group;

            applyLegendHighlighting(null, null, categoryGroups[groupName]);

        });

        item.addEventListener('mouseleave', () => clearLegendHighlighting());



        if (typeof window.bindLongPress === 'function') {

            window.bindLongPress(

                item,

                (el) => {

                    const groupName = el.dataset.group;

                    if (window.openLegendConceptModal) window.openLegendConceptModal(groupName, 'category');

                },

                (el, e) => {

                    window.handleSuperLegendClick(el, e);

                }

            );

        } else {

            item.addEventListener('click', (e) => window.handleSuperLegendClick(item, e));

        }

    });

}



function updateCentralHeroInspector(z) {

    const container = document.getElementById('central-hero-inspector');

    if (!container) return;



    const el = z ? getElementByNumber(z) : (selectedElement || null);



    if (!el) {

        // Default Key Guide (Carbon reference)

        const refEl = getElementByNumber(6) || {

            atomicNumber: 6,

            symbol: 'C',

            name: 'Carbon',

            atomicMass: 12.011,

            category: 'Reactive nonmetal',

            electronConfigurationNoble: '[He] 2s² 2p²',

            electronegativity: 2.55

        };

        const catColor = (typeof categoryColors !== 'undefined' && categoryColors['Reactive nonmetal']) ? categoryColors['Reactive nonmetal'] : '#059669';

        container.innerHTML = `

            <div class="legend-box-title" onclick="openCardAnatomyModal()" title="Click to view full anatomy guide">

                <span>🔍 Element Key / Anatomy</span>

                <span class="legend-title-help">ℹ️ Guide</span>

            </div>

            <div class="hero-inspector-body hero-anatomy-mode">

                <div class="hero-card-tile" style="border-color: ${catColor}; box-shadow: 0 0 14px rgba(5, 150, 105, 0.45);">

                    <div class="hero-tile-top">

                        <span class="hero-tile-z" title="Atomic Number (Z)">6</span>

                        <span class="hero-tile-mass" title="Standard Atomic Weight">12.011 u</span>

                    </div>

                    <div class="hero-tile-sym" style="color: #ffffff;" title="Chemical Symbol (White = Solid at 298 K)">C</div>

                    <div class="hero-tile-name">Carbon</div>

                    <div class="hero-tile-config">[He] 2s² 2p²</div>

                </div>

                <div class="hero-anatomy-callouts">

                    <div class="anatomy-callout-row"><span class="callout-tag">Z:</span> Atomic Number</div>

                    <div class="anatomy-callout-row"><span class="callout-tag" style="color: #00f0ff;">Sym:</span> State Color (298 K)</div>

                    <div class="anatomy-callout-row"><span class="callout-tag">u:</span> Atomic Mass</div>

                    <div class="anatomy-callout-hint">Hover or tap any element to inspect</div>

                </div>

            </div>

        `;

        return;

    }



    const zNum = el.atomicNumber;

    const cat = getNormalizedCategory(el.category, zNum);

    const catColor = (typeof categoryColors !== 'undefined' && categoryColors[cat]) ? categoryColors[cat] : '#00d4ff';



    let state = 'Unknown';

    if (el.meltingPoint !== null && el.meltingPoint !== undefined && el.boilingPoint !== null && el.boilingPoint !== undefined) {

        const curK = typeof currentTemp !== 'undefined' ? currentTemp : 298;

        if (curK < el.meltingPoint) state = 'Solid';

        else if (curK < el.boilingPoint) state = 'Liquid';

        else state = 'Gas';

    }

    const stateColor = (typeof stateTextColors !== 'undefined' && stateTextColors[state]) ? stateTextColors[state] : '#ffffff';

    const massStr = el.atomicMass ? (typeof el.atomicMass === 'number' ? el.atomicMass.toFixed(3) : el.atomicMass) : '-';

    const enStr = el.electronegativity ? `${el.electronegativity}` : '-';

    const cfgStr = el.electronConfigurationNoble || el.electronConfiguration || '-';

    const densityStr = el.density ? `${el.density} g/cm³` : '-';

    const mpStr = el.meltingPoint ? `${Math.round(el.meltingPoint)} K` : '-';

    const bpStr = el.boilingPoint ? `${Math.round(el.boilingPoint)} K` : '-';



    container.innerHTML = `

        <div class="legend-box-title" style="border-color: ${catColor};">

            <span style="color: ${catColor}; font-weight: 800;">${el.name.toUpperCase()} (#${zNum})</span>

            <span class="hero-cat-pill" style="background: ${catColor}33; border: 1px solid ${catColor}; color: #ffffff;">${cat}</span>

        </div>

        <div class="hero-inspector-body hero-live-mode">

            <div class="hero-card-tile" style="border-color: ${catColor}; box-shadow: 0 0 16px ${catColor}66;">

                <div class="hero-tile-top">

                    <span class="hero-tile-z">${zNum}</span>

                    <span class="hero-tile-mass">${massStr} u</span>

                </div>

                <div class="hero-tile-sym" style="color: ${stateColor}; text-shadow: 0 0 10px ${stateColor};">${el.symbol}</div>

                <div class="hero-tile-name">${el.name}</div>

                <div class="hero-tile-config">${cfgStr}</div>

            </div>

            <div class="hero-live-details">

                <div class="hero-prop-row">

                    <span class="hero-prop-lbl">State:</span>

                    <span class="hero-prop-val" style="color: ${stateColor}; font-weight: 800;">${state}</span>

                </div>

                <div class="hero-prop-row">

                    <span class="hero-prop-lbl">Electroneg:</span>

                    <span class="hero-prop-val">${enStr}</span>

                </div>

                <div class="hero-prop-row">

                    <span class="hero-prop-lbl">Melting Pt:</span>

                    <span class="hero-prop-val">${mpStr}</span>

                </div>

                <div class="hero-prop-row">

                    <span class="hero-prop-lbl">Boiling Pt:</span>

                    <span class="hero-prop-val">${bpStr}</span>

                </div>

                <div class="hero-prop-row">

                    <span class="hero-prop-lbl">Density:</span>

                    <span class="hero-prop-val">${densityStr}</span>

                </div>

            </div>

        </div>

    `;

}

window.updateCentralHeroInspector = updateCentralHeroInspector;



// Select Element

function selectElement(z, isUserClick = false, openSidebar = true) {

    const el = getElementByNumber(z);

    if (!el) return;

    if (isUserClick && typeof window.trackElementInspection === 'function') {

        window.trackElementInspection();

    }



    if (!isUserClick && selectedElement && selectedElement.atomicNumber === z && window._lastSelectedView === currentView) {

        return; // Fast path: Element already selected and styled for this view!

    }

    window._lastSelectedView = currentView;



    // Native Haptic Feedback & Interstitial Trigger (only on direct user click)

    if (isUserClick) {

        if (window.NativeServices?.Haptics) {

            window.NativeServices.Haptics.selection();

        }

        if (window.NativeServices?.Ads) {

            window.NativeServices.Ads.showInterstitial();

        }

    }

    

    selectedElement = el;

    updateCentralHeroInspector(z);

    

    // Position sidebar immediately before updating DOM content

    const activeView = document.querySelector('.view-mode.active');

    const cell = activeView ? activeView.querySelector(`.element-cell[data-z="${z}"]`) : null;

    if (openSidebar && isUserClick) {

        positionMobileSidebar(cell, el);

    }



    // Highlight in active view only

    if (activeView) {

        activeView.querySelectorAll('.element-cell.selected').forEach(c => c.classList.remove('selected'));

        if (cell) {

            cell.classList.add('selected');

        }

    }

    

    if (currentView === 'main') {

        const emptyState = document.getElementById('empty-state');

        const detailCard = document.getElementById('element-detail-card');

        if (emptyState) emptyState.classList.add('hidden');

        if (detailCard) detailCard.classList.remove('hidden');

        

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

        

        updateSidebarValues();

        updateSelectedCardVisuals();

        

        if (window.OrbitalViewer) {

            window.OrbitalViewer.setElement(el);

            const isMobile = (window.innerWidth <= 1000 || window.innerHeight <= 520);

            const elecSidebar = document.querySelector('#view-electrons .view-right');

            const isSidebarVisible = !isMobile || (elecSidebar && (elecSidebar.classList.contains('mobile-active') || elecSidebar.classList.contains('open')));

            if (isSidebarVisible) {

                if (!window.OrbitalViewer.renderer) {

                    window.OrbitalViewer.init('three-canvas-container');

                }

                window.OrbitalViewer.start();

                window.OrbitalViewer.resize();

            }

        }

        renderAufbauDiagram(el.electronConfiguration);

        drawLargeBohrModel(el);

    } else if (currentView === 'isotopes') {

        if (typeof updateIsotopeSidebar === 'function') {

            updateIsotopeSidebar(z);

        }

        updateSelectedCardVisuals();

        if (typeof renderIsotopeLegend === 'function') {

            renderIsotopeLegend(el);

        }

    }

}



function renderAufbauDiagram(configStr) {

    const gridContainer = document.getElementById('elec-in-grid-legend');

    if (!gridContainer) return;



    const selEl = (typeof selectedElement !== 'undefined' && selectedElement) ? selectedElement : null;

    const activeLabel = selEl ? `${selEl.symbol} (${selEl.atomicNumber})` : 'All Elements';



    if (gridContainer._renderedConfig === configStr && gridContainer._renderedLabel === activeLabel && gridContainer.children.length > 0) {

        return; // Fast path: Aufbau diagram is already up-to-date!

    }

    gridContainer._renderedConfig = configStr;

    gridContainer._renderedLabel = activeLabel;

    

    const parts = configStr ? configStr.split(' ') : [];

    const configMap = {};

    parts.forEach(p => {

        const match = p.match(/(\d[spdf])(\d+)/);

        if (match) configMap[match[1]] = parseInt(match[2]);

    });    



    const blockRows = [

        {

            key: 's',

            label: 's-Block',

            count: '14',

            color: '#00d4ff',

            subshells: ['1s', '2s', '3s', '4s', '5s', '6s', '7s']

        },

        {

            key: 'p',

            label: 'p-Block',

            count: '36',

            color: '#22c55e',

            subshells: ['2p', '3p', '4p', '5p', '6p', '7p']

        },

        {

            key: 'd',

            label: 'd-Block',

            count: '40',

            color: '#6366f1',

            subshells: ['3d', '4d', '5d', '6d']

        },

        {

            key: 'f',

            label: 'f-Block',

            count: '28',

            color: '#a855f7',

            subshells: ['4f', '5f']

        }

    ];



    const blockCap = { s: 1, p: 3, d: 5, f: 7 }; // number of orbitals

    

    // Track the highest filled subshell to mark as active

    let lastFilledSubshell = parts.length > 0 ? parts[parts.length-1].match(/(\d[spdf])/)?.[1] : null;



    const getLValue = (block) => {

        if (block === 's') return 0;

        if (block === 'p') return 1;

        if (block === 'd') return 2;

        if (block === 'f') return 3;

        return 0;

    };



    let html = `

    <div class="legend-box unified-aufbau-panel" style="width: 100%; height: 100%; max-height: 100%; padding: 2px 6px; box-sizing: border-box; background: rgba(9, 14, 26, 0.96); border: 1.2px solid rgba(0, 212, 255, 0.35); border-radius: 6px; box-shadow: 0 4px 16px rgba(0,0,0,0.85); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">

        

        <!-- Header Row -->

        <div class="aufbau-header-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0, 212, 255, 0.22); padding-bottom: 1.5px; margin-bottom: 1.5px; width: 100%;">

            <div style="display: flex; align-items: center; gap: 6px;">

                <span class="legend-box-title" style="color: #00d4ff; font-weight: 800; font-size: 0.48rem; letter-spacing: 0.5px; text-transform: uppercase;">

                    Blocks & Aufbau Orbital Order

                </span>

            </div>

            

            <div style="display: flex; align-items: center; gap: 8px;">

                <!-- Separate Exceptions Indicator: Red border and red text ONLY -->

                <div class="legend-item exception-indicator-item" data-key="exception" data-type="exception" style="border: 1.2px solid #ef4444; color: #ef4444; background: transparent; border-radius: 4px; padding: 1px 6px; font-size: 0.40rem; font-weight: 800; display: flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.15s ease;">

                    <span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 5px #ef4444;"></span>

                    <span>Exceptions (20)</span>

                </div>



                <!-- Target Element Badge -->

                <div style="font-size: 0.40rem; color: #ffffff; font-family: var(--font-mono); font-weight: 800; display: flex; align-items: center; gap: 3px;">

                    <span style="color: #94a3b8; font-size: 0.34rem; text-transform: uppercase;">Target:</span>

                    <span style="color: #00f0ff; background: rgba(0,240,255,0.15); padding: 0.5px 5px; border-radius: 3px; border: 1px solid rgba(0,240,255,0.4);">${activeLabel}</span>

                </div>

            </div>

        </div>



        <!-- 4-Row Stacked Grid (s, p, d, f aligned with their subshell sequences) -->

        <div class="aufbau-diagram-container" style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; width: 100%; min-height: 0; padding: 1px 0; gap: 2px;">

    `;



    const blockBgGradients = {

        s: 'linear-gradient(135deg, rgba(0, 212, 255, 0.88), rgba(2, 132, 199, 0.95))',

        p: 'linear-gradient(135deg, rgba(34, 197, 94, 0.88), rgba(22, 163, 74, 0.95))',

        d: 'linear-gradient(135deg, rgba(99, 102, 241, 0.88), rgba(79, 70, 229, 0.95))',

        f: 'linear-gradient(135deg, rgba(168, 85, 247, 0.88), rgba(147, 51, 234, 0.95))'

    };



    blockRows.forEach(bRow => {

        html += `

        <div class="aufbau-block-row" style="display: flex; align-items: stretch; gap: 5px; width: 100%; flex: 1; min-height: 0;">

            <!-- Block Pill on Left: Colored background with crisp white text -->

            <div class="legend-item elec-block-item" data-key="${bRow.key}" data-type="block" style="flex: 0 0 52px; height: 100%; background: ${blockBgGradients[bRow.key]}; border: 1.2px solid ${bRow.color}; color: #ffffff; border-radius: 4px; padding: 0 4px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.4); box-sizing: border-box;">

                <span style="font-size: 0.44rem; font-weight: 900; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.6);">${bRow.label}</span>

                <span style="font-size: 0.38rem; font-weight: 800; color: #ffffff; opacity: 0.95; font-family: monospace; background: rgba(0,0,0,0.25); padding: 0.5px 3px; border-radius: 2.5px;">${bRow.count}</span>

            </div>



            <!-- Divider Line between Block buttons and Subshell Grid -->

            <div class="aufbau-row-divider"></div>



            <!-- Subshells for this Block on Right -->

            <div class="aufbau-subshell-track" style="flex: 1; display: flex; align-items: center; gap: 4px; justify-content: flex-start; overflow: hidden; height: 100%;">

        `;



        bRow.subshells.forEach(subshell => {

            const blockType = subshell[1];

            const nValue = parseInt(subshell[0]);

            const lValue = getLValue(subshell[1]);

            const numOrbitals = blockCap[blockType];

            const numElectrons = configMap[subshell] || 0;

            const isActive = subshell === lastFilledSubshell;

            const hasElectrons = numElectrons > 0;



            const superscripts = { '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '10': '¹⁰', '11': '¹¹', '12': '¹²', '13': '¹³', '14': '¹⁴' };

            const countSup = hasElectrons ? (superscripts[numElectrons] || numElectrons) : '';

            const capsuleClass = `subshell-group interactive-subshell ${hasElectrons ? 'has-electrons' : ''} ${isActive ? 'active-valence' : ''}`;



            html += `<div class="${capsuleClass}" data-key="${subshell}" data-type="subshell" data-n="${nValue}" data-l="${lValue}" title="${subshell}${hasElectrons ? ' (' + numElectrons + 'e⁻)' : ''} - Tap to highlight elements or click box to inspect 3D">`;

            html += `<div class="subshell-label" style="color: ${bRow.color};">${subshell}${countSup ? `<sup style="font-size: 0.36rem; color: #ffffff; text-shadow: 0 0 3px ${bRow.color}; margin-left: 0.5px;">${countSup}</sup>` : ''}</div><div class="orbital-boxes">`;



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

                if (electronsInThisOrbital === 1) arrows = '<span class="arrow-up" style="color: #ffffff; font-weight: 900; text-shadow: 0 0 4px rgba(255,255,255,0.9);">&#x21BF;</span>';

                if (electronsInThisOrbital === 2) arrows = '<span class="arrow-up" style="color: #ffffff; font-weight: 900; text-shadow: 0 0 4px rgba(255,255,255,0.9);">&#x21BF;</span><span class="arrow-down" style="color: #00ffff; font-weight: 900; text-shadow: 0 0 4px rgba(0,255,255,0.9);">&#x21C2;</span>';

                

                let isLastOrbital = false;

                if (isActive) {

                    if (numElectrons <= numOrbitals && i === numElectrons - 1) isLastOrbital = true;

                    if (numElectrons > numOrbitals && i === numElectrons - numOrbitals - 1) isLastOrbital = true;

                }

                const activeClass = isLastOrbital ? 'active-orbital' : '';

                

                const boxColor = bRow.color;

                const hasE = electronsInThisOrbital > 0;

                const glossyBg = hasE ? getGlossyBackground(boxColor) : 'rgba(15, 23, 42, 0.65)';

                const boxBorder = hasE ? `1.2px solid ${boxColor}` : '1px solid rgba(255, 255, 255, 0.14)';

                const boxGlow = hasE ? `0 0 6px ${boxColor}` : 'none';

                

                const mVal = mValues[i] !== undefined ? mValues[i] : 0;

                

                html += `<div class="orbital-box interactive-box ${activeClass}" data-m="${mVal}" title="Click to inspect 3D Orbital" style="background: ${glossyBg}; border: ${boxBorder}; box-shadow: ${boxGlow};">${arrows}</div>`;

            }



            html += `</div></div>`; // close orbital-boxes and subshell-group

        });



        html += `</div></div>`; // close aufbau-subshell-track and aufbau-block-row

    });



    html += `</div></div>`; // close aufbau-diagram-container and unified-aufbau-panel

    gridContainer.innerHTML = html;



    // Bind event listeners for block legend (s, p, d, f indicators and exceptions)

    document.querySelectorAll('#elec-in-grid-legend .legend-item').forEach(item => {

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

        if (typeof window.bindLongPress === 'function') {

            window.bindLongPress(

                item,

                (el) => {

                    const key = el.dataset.key;

                    const type = el.dataset.type;

                    if (window.openLegendConceptModal) window.openLegendConceptModal(key, type);

                },

                (el, e) => {

                    const key = el.dataset.key;

                    const type = el.dataset.type;

                    if (lockedLegendKey === key && lockedLegendType === type) {

                        window.clearLegendHighlightingForce();

                    } else {

                        lockedLegendKey = key;

                        lockedLegendType = type;

                        lockedLegendGroup = null;

                        window.lockedLegendKey = key;

                        window.lockedLegendType = type;

                        window.lockedLegendGroup = null;

                        window.activeLegendHighlight = { key, type, groupKeys: null };

                        updateLegendIndicatorUI();

                        applyLegendHighlighting(key, type, null);

                    }

                }

            );

        } else {

            item.addEventListener('click', (e) => {

                e.stopPropagation();

                const key = e.currentTarget.dataset.key;

                const type = e.currentTarget.dataset.type;

                

                if (lockedLegendKey === key && lockedLegendType === type) {

                    window.clearLegendHighlightingForce();

                } else {

                    lockedLegendKey = key;

                    lockedLegendType = type;

                    lockedLegendGroup = null;

                    window.lockedLegendKey = key;

                    window.lockedLegendType = type;

                    window.lockedLegendGroup = null;

                    window.activeLegendHighlight = { key, type, groupKeys: null };

                    updateLegendIndicatorUI();

                    applyLegendHighlighting(key, type, null);

                }

            });

        }

    });



    // Subshell Capsule Click -> Highlight elements ending on this subshell + update sidebar 3D

    document.querySelectorAll('.interactive-subshell').forEach(subshell => {

        subshell.addEventListener('mouseenter', (e) => {

            if (lockedLegendKey || lockedLegendGroup) return;

            const key = e.currentTarget.dataset.key;

            applyLegendHighlighting(key, 'subshell');

        });

        subshell.addEventListener('mouseleave', (e) => {

            if (lockedLegendKey || lockedLegendGroup) return;

            clearLegendHighlighting();

        });

        subshell.addEventListener('click', (e) => {

            e.stopPropagation();

            const key = e.currentTarget.dataset.key;

            const n = parseInt(e.currentTarget.dataset.n);

            const l = parseInt(e.currentTarget.dataset.l);

            

            if (window.OrbitalViewer) {

                window.OrbitalViewer.drawOrbital(n, l, 'all');

            }



            if (lockedLegendKey === key && lockedLegendType === 'subshell') {

                window.clearLegendHighlightingForce();

            } else {

                lockedLegendKey = key;

                lockedLegendType = 'subshell';

                lockedLegendGroup = null;

                window.lockedLegendKey = key;

                window.lockedLegendType = 'subshell';

                window.lockedLegendGroup = null;

                window.activeLegendHighlight = { key, type: 'subshell', groupKeys: null };

                updateLegendIndicatorUI();

                applyLegendHighlighting(key, 'subshell', null);

            }

        });

    });



    // Orbital Box Click -> Open Dedicated 3D Orbital Visualizer Modal

    document.querySelectorAll('.interactive-box').forEach(box => {

        box.addEventListener('mouseenter', (e) => {

            e.currentTarget.style.transform = 'scale(1.2)';

            e.currentTarget.style.boxShadow = '0 0 8px rgba(0,240,255,0.9)';

            e.currentTarget.style.zIndex = '10';

        });

        box.addEventListener('mouseleave', (e) => {

            e.currentTarget.style.transform = 'scale(1)';

            e.currentTarget.style.boxShadow = 'none';

            e.currentTarget.style.zIndex = '1';

        });

        box.addEventListener('click', (e) => {

            e.stopPropagation();

            const group = e.currentTarget.closest('.interactive-subshell');

            if (group) {

                const n = parseInt(group.dataset.n);

                const l = parseInt(group.dataset.l);

                const m = parseInt(e.currentTarget.dataset.m);

                if (window.OrbitalViewer) {

                    window.OrbitalViewer.drawOrbital(n, l, m);

                    if (typeof window.OrbitalViewer.openModal === 'function') {

                        window.OrbitalViewer.openModal(n, l, m);

                    }

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



function updateSidebarValues(force = false) {

    if (!selectedElement) return;

    const el = selectedElement;

    if (!force && window._renderedSidebarElZ === el.atomicNumber) {

        return;

    }

    window._renderedSidebarElZ = el.atomicNumber;

    const normalizedCategory = getNormalizedCategory(el.category, el.atomicNumber);

    

    const catColor = categoryColors[normalizedCategory] || '#00d4ff';

    const catText = (el.category || normalizedCategory).toUpperCase();

    

    const valCat = document.getElementById('val-category');

    if (valCat) {

        if (el.dualCategory) {

            valCat.innerHTML = `<span style="color: ${catColor}; font-weight:700;">${el.category || normalizedCategory}</span> <span style="color: #94a3b8; font-size:0.6rem; font-weight:400;">/</span> <span style="color: #38bdf8; font-weight:700;">${el.dualCategory}</span> <span title="Dual classification: displays intermediate chemical behavior" style="font-size: 0.62rem; cursor:pointer;">ℹ️</span>`;

        } else {

            valCat.innerText = el.category || normalizedCategory;

            valCat.style.setProperty('color', catColor, 'important');

        }

    }



    const noteCallout = document.getElementById('val-classification-callout');

    if (noteCallout) {

        if (el.classificationNote) {

            noteCallout.innerHTML = `<span style="font-weight:700; color:#38bdf8;">Dual Nature:</span> ${el.classificationNote}`;

            noteCallout.style.display = 'block';

        } else {

            noteCallout.style.display = 'none';

        }

    }



    const valMass = document.getElementById('val-atomicMass');

    if (valMass) valMass.innerText = el.atomicMass;

    const valEnergy = document.getElementById('val-energyLevels');

    if (valEnergy) valEnergy.innerText = el.electronsPerShell ? el.electronsPerShell.join(', ') : '-';

    const valElNeg = document.getElementById('val-electronegativity');

    if (valElNeg) valElNeg.innerText = el.electronegativity || '-';

    const valDisc = document.getElementById('val-discovered');

    if (valDisc) valDisc.innerText = el.discoveryYear || '-';

    

    // Top Card Header Badges

    let badgeHtml = `<span class="ed-series-dot" style="width: 5px; height: 5px; border-radius: 50%; background: ${catColor}; box-shadow: 0 0 5px ${catColor}; display: inline-block; flex-shrink: 0;"></span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${catText}</span>`;

    if (el.dualCategory) {

        const dualColor = categoryColors[el.dualCategory] || '#38bdf8';

        badgeHtml += ` <span style="color:rgba(255,255,255,0.4); font-size:0.45rem;">•</span> <span style="color:${dualColor}; font-size:0.42rem; font-weight:800; border-left: 1px solid rgba(255,255,255,0.25); padding-left: 4px;">${el.dualCategory.toUpperCase()}</span>`;

    }



    [document.getElementById('dh-series-badge'), document.getElementById('elec-series-badge'), document.getElementById('iso-series-badge')].forEach(badge => {

        if (badge) {

            badge.innerHTML = badgeHtml;

            badge.style.setProperty('color', '#ffffff', 'important');

            badge.style.setProperty('border-color', catColor, 'important');

            const bgGrad = `linear-gradient(135deg, ${window.hexToRgba ? window.hexToRgba(catColor, 0.42) : hexToRgbaLocal(catColor, 0.42)} 0%, ${window.hexToRgba ? window.hexToRgba(catColor, 0.18) : hexToRgbaLocal(catColor, 0.18)} 100%)`;

            badge.style.setProperty('background', bgGrad, 'important');

            const glow = window.hexToRgba ? window.hexToRgba(catColor, 0.50) : hexToRgbaLocal(catColor, 0.50);

            badge.style.setProperty('box-shadow', `0 0 8px ${glow}`, 'important');

        }

    });



    // Top Card Quick Stats

    const sortedNoble = sortElectronConfig(el.electronConfigurationNoble || el.electronConfiguration);

    const dhConfig = document.getElementById('dh-config-text');

    if (dhConfig) dhConfig.textContent = sortedNoble || '-';

    const elecConfig = document.getElementById('elec-config-text');

    if (elecConfig) elecConfig.textContent = sortedNoble || '-';



    const tagsStr = `Grp ${el.group || '-'} • Per ${el.period || '-'} • ${el.block || '-'}-block`;

    const dhTags = document.getElementById('dh-tags-text');

    if (dhTags) dhTags.textContent = tagsStr;

    const elecTags = document.getElementById('elec-tags-text');

    if (elecTags) elecTags.textContent = tagsStr;



    const wikiBtn = document.getElementById('val-wiki');

    if (wikiBtn) {

        wikiBtn.parentElement.onclick = () => {

            // Let the prop-item click handler do its thing

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

    if (!container || !el || !el.electronsPerShell) return;

    

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

        if (currentView !== 'main' && currentView !== 'properties') return;



        savedPropertyLayoutMode = savedPropertyLayoutMode === '18col' ? '32col' : '18col';

        tableLayoutMode = savedPropertyLayoutMode;

        

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



async function toggleLandscapeFullscreenMode(forceEnable = false) {

    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);

    if (!isFS || forceEnable) {

        try {

            const docEl = document.documentElement;

            if (docEl.requestFullscreen) {

                await docEl.requestFullscreen().catch(() => {});

            } else if (docEl.webkitRequestFullscreen) {

                await docEl.webkitRequestFullscreen().catch(() => {});

            }

        } catch (e) {}



        if (screen.orientation && screen.orientation.lock) {

            screen.orientation.lock('landscape').catch(() => {});

        }

    } else {

        try {

            if (document.exitFullscreen) {

                await document.exitFullscreen().catch(() => {});

            } else if (document.webkitExitFullscreen) {

                await document.webkitExitFullscreen().catch(() => {});

            }

        } catch (e) {}



        if (screen.orientation && screen.orientation.unlock) {

            screen.orientation.unlock();

        }

    }

}



function updateRotateBtnUI() {

    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);

    const rotateBtn = document.getElementById('btn-mobile-rotate');

    if (rotateBtn) {

        const textSpan = rotateBtn.querySelector('.nav-text');

        const iconSpan = rotateBtn.querySelector('.nav-icon');

        if (textSpan) textSpan.textContent = isFS ? 'Exit Landscape' : 'Full Landscape';

        if (iconSpan) iconSpan.textContent = isFS ? '📱↩️' : '📱🔄';

    }

}



document.addEventListener('fullscreenchange', updateRotateBtnUI);

document.addEventListener('webkitfullscreenchange', updateRotateBtnUI);



let mobileLandscapeAutoTriggered = false;

function autoActivateMobileLandscape() {

    if (mobileLandscapeAutoTriggered || window.Platform?.isNative) return;

    if (window.innerWidth <= 1000 || 'ontouchstart' in window) {

        mobileLandscapeAutoTriggered = true;

        toggleLandscapeFullscreenMode(true);

    }

}



document.addEventListener('touchstart', autoActivateMobileLandscape, { passive: true });

document.addEventListener('click', autoActivateMobileLandscape, { passive: true });



// Init

window.addEventListener('DOMContentLoaded', () => {

    // Initialize WebAssembly Thermodynamic Engine (696 bytes)

    if (window.PeriodicaWasm && typeof window.PeriodicaWasm.initSync === 'function') {

        window.PeriodicaWasm.initSync(elementsData);

    }

    setupPerfModeOnLoad();

    setupUI();

    setupLayoutToggle();

    setupMobileLeftNav();

    setupPinchToZoom();

    

    // Pre-render all grids to prevent DOM creation lag during tab switching

    const originalView = currentView;

    

    currentView = 'main';

    renderGrid();

    

    currentView = 'electrons';

    renderGrid();

    updateGridVisuals(true);

    

    currentView = 'isotopes';

    renderGrid();

    updateGridVisuals(true);

    

    currentView = originalView;

    updateGridVisuals(true);



    // Initialize Hardware-Accelerated Canvas 2D Periodic Grid Engine

    if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.init === 'function') {

        window.PeriodicCanvasGrid.init();

    }

    

    // Pre-warm OrbitalViewer & Carbon (Z=6) defaults during idle time after startup

    const prewarmOrbitalViewer = () => {

        // Pre-warm browser layout for electron view offscreen so first user tap has 0ms layout lag

        const elecView = document.getElementById('view-electrons');

        if (elecView && !elecView.classList.contains('active')) {

            elecView.style.position = 'absolute';

            elecView.style.visibility = 'hidden';

            elecView.style.display = 'flex';

            elecView.style.left = '-9999px';

            void elecView.offsetHeight; // Force browser to compute initial layout offscreen

            elecView.style.display = '';

            elecView.style.position = '';

            elecView.style.visibility = '';

            elecView.style.left = '';

        }



        if (window.OrbitalViewer && !window.OrbitalViewer.renderer) {

            window.OrbitalViewer.init('three-canvas-container');

            if (window.OrbitalViewer.renderer && currentView !== 'electrons') {

                window.OrbitalViewer.stop(); // Keep render loop paused until electrons view is active

            }

        }

        // Pre-warm electron sidebar for default Carbon (Z=6)

        if (typeof selectElement === 'function') {

            const savedV = currentView;

            currentView = 'electrons';

            selectElement(6, false, false);

            currentView = savedV;

        }

    };

    if (typeof requestIdleCallback !== 'undefined') {

        requestIdleCallback(prewarmOrbitalViewer, { timeout: 2500 });

    } else {

        setTimeout(prewarmOrbitalViewer, 1500);

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



let currentSidebarSide = null; // 'pos-left' or 'pos-right'



// Smart Mobile Floating Panel Positioning & Control

function positionMobileSidebar(cell, el) {

    if (currentView !== 'main' && currentView !== 'electrons' && currentView !== 'isotopes') {

        closeMobileSidebar();

        return;

    }



    const sidebar = document.querySelector('.view-mode.active .view-right');

    if (!sidebar) return;



    if (window.innerWidth <= 1000 || window.innerHeight <= 520) {

        let isLeftHalf = false;

        if (cell) {

            const rect = cell.getBoundingClientRect();

            if (rect.width > 0) {

                const cellCenterX = rect.left + rect.width / 2;

                isLeftHalf = cellCenterX < (window.innerWidth / 2);

            }

        } else if (window.PeriodicCanvasGrid?.getElementScreenPos && el) {

            const screenPos = window.PeriodicCanvasGrid.getElementScreenPos(el.atomicNumber || el.z);

            if (screenPos) {

                isLeftHalf = screenPos.x < (window.innerWidth / 2);

            } else {

                const pos = (typeof getGridPosition === 'function') ? getGridPosition(el.atomicNumber || el.z) : { col: el.group || 1 };

                isLeftHalf = (pos.col <= 9);

            }

        } else if (el) {

            const z = el.atomicNumber || el.z;

            if (typeof getGridPosition === 'function' && z) {

                const pos = getGridPosition(z);

                isLeftHalf = (pos.col <= 9);

            } else {

                isLeftHalf = (el.group || 1) <= 9;

            }

        }



        const targetSide = isLeftHalf ? 'pos-right' : 'pos-left';

        const otherSide = isLeftHalf ? 'pos-left' : 'pos-right';



        if (sidebar.classList.contains('mobile-active') && currentSidebarSide && currentSidebarSide !== targetSide) {

            // Switching to other side: close current side and open on new side

            sidebar.classList.remove('mobile-active', 'open', otherSide);

            currentSidebarSide = targetSide;

            sidebar.classList.add(targetSide);

            void sidebar.offsetWidth; // Force synchronous reflow

            sidebar.classList.add('mobile-active');

        } else {

            // Within same side: keep same panel open in-place and replace values

            currentSidebarSide = targetSide;

            sidebar.classList.remove(otherSide);

            sidebar.classList.add(targetSide);

            sidebar.classList.add('mobile-active');

        }

    } else {

        sidebar.classList.remove('mobile-active', 'pos-left', 'pos-right');

        currentSidebarSide = null;

    }

}



function closeMobileSidebar() {

    const activeSidebar = document.querySelector('.view-mode.active .view-right.mobile-active, .view-right.mobile-active');

    if (!activeSidebar && !currentSidebarSide && !selectedElement) {

        return; // Fast path: Sidebar is already closed! Skip heavy DOM queries and canvas redraw.

    }

    document.querySelectorAll('.view-right.mobile-active, .view-right.open').forEach(sb => {

        sb.classList.remove('mobile-active', 'open', 'pos-left', 'pos-right', 'is-extended');

    });

    currentSidebarSide = null;

    document.querySelectorAll('.element-cell.selected').forEach(c => c.classList.remove('selected'));

    selectedElement = null;

    if (typeof closeIsotopeDetailPanel === 'function') {

        closeIsotopeDetailPanel();

    }

    if (window.OrbitalViewer && typeof window.OrbitalViewer.stop === 'function') {

        window.OrbitalViewer.stop();

    }

    if (currentView === 'main' && window.PeriodicCanvasGrid) {

        window.PeriodicCanvasGrid.render();

    }

}

window.closeMobileSidebar = closeMobileSidebar;

window.dismissDetailSidebar = closeMobileSidebar;



window.addEventListener('resize', () => {

    if (window.innerWidth > 1000 && window.innerHeight > 520) {

        document.querySelectorAll('.view-right').forEach(sb => {

            sb.classList.remove('mobile-active', 'pos-left', 'pos-right');

        });

    }

});



document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {

        closeMobileSidebar();

        const mobileLeftNav = document.getElementById('mobile-left-nav');

        if (mobileLeftNav) mobileLeftNav.classList.remove('expanded');

    }

});



let _tableTypeModalOpenTime = 0;

function openTableTypeModal() {

    const modal = document.getElementById('table-type-modal');

    if (!modal) return;

    _tableTypeModalOpenTime = Date.now();

    document.querySelectorAll('.table-type-opt').forEach(opt => {

        if (opt.dataset.prop === currentProperty) {

            opt.classList.add('active');

        } else {

            opt.classList.remove('active');

        }

    });

    const bridge = window.PeriodicaNativeSlider || window.NativeSliderBridge;

    if (bridge && typeof bridge.setVisibility === 'function') {

        bridge.setVisibility(false);

    }

    modal.style.display = 'flex';

}

window.openTableTypeModal = openTableTypeModal;



function closeTableTypeModal(e) {

    if (Date.now() - _tableTypeModalOpenTime < 350) {

        return;

    }

    const modal = document.getElementById('table-type-modal');

    if (modal) modal.style.display = 'none';

    syncNativeSliderVisibility();

}

window.closeTableTypeModal = closeTableTypeModal;



function openCardAnatomyModal(viewId, propKey) {

    const v = viewId || currentView || 'main';

    const p = propKey || currentProperty || 'category';



    const modal = document.getElementById('card-anatomy-modal');

    if (!modal) return;



    // Temporarily hide native slider while modal is open

    const bridge = window.PeriodicaNativeSlider || window.NativeSliderBridge;

    if (bridge && typeof bridge.setVisibility === 'function') {

        bridge.setVisibility(false);

    }



    const titleEl = document.getElementById('anatomy-modal-title');

    const cardDemo = document.getElementById('anatomy-card-demo');

    const detailsList = document.getElementById('anatomy-details-list');



    const propTitles = {

        'category': 'Standard Category View',

        'state': 'State of Matter View',

        'discoveryYear': 'Discovery Timeline View',

        'electronegativity': 'Electronegativity Heatmap',

        'atomicMass': 'Atomic Mass View',

        'atomicRadius': 'Atomic Radius Heatmap',

        'ionizationEnergy': 'Ionization Energy View',

        'electronAffinity': 'Electron Affinity View',

        'meltingPoint': 'Melting Point Thermal View',

        'boilingPoint': 'Boiling Point Thermal View',

        'density': 'Density Heatmap',

        'block': 'Orbital Block View'

    };



    let viewTitle = propTitles[p] || 'Periodic Table View';

    if (v === 'electrons') viewTitle = 'Electron Configuration & Orbitals View';

    else if (v === 'isotopes') viewTitle = 'Isotopes & Radioactivity View';

    else if (v === 'compounds') viewTitle = 'Compounds & Formulas View';

    else if (v === 'reactions') viewTitle = 'Chemical Reactions View';

    else if (v === 'crystals') viewTitle = 'Crystal Structures 3D View';

    else if (v === 'compare') viewTitle = 'Element Comparison View';

    else if (v === 'quiz') viewTitle = 'Periodic Chemistry Quiz View';



    if (titleEl) titleEl.innerHTML = `📖 ${viewTitle} — Element Box Anatomy`;



    function hexToRgbaLocalAnatomy(color, alpha) {

        if (!color) return `rgba(100,116,139,${alpha})`;

        if (typeof color === 'string' && color.startsWith('rgb(')) {

            const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);

            if (m) return `rgba(${m[1]},${m[2]},${m[3]},${alpha})`;

        } else if (typeof color === 'string' && color.startsWith('rgba(')) {

            return color.replace(/rgba\((\d+,\s*\d+,\s*\d+,)\s*[^)]+\)/, `rgba($1 ${alpha})`);

        }

        if (typeof color !== 'string' || color[0] !== '#') return `rgba(100,116,139,${alpha})`;

        let c = color.substring(1);

        if (c.length === 3) c = c.split('').map(x => x + x).join('');

        const num = parseInt(c, 16);

        if (isNaN(num)) return `rgba(100,116,139,${alpha})`;

        const r = (num >> 16) & 255;

        const g = (num >> 8) & 255;

        const b = num & 255;

        return `rgba(${r},${g},${b},${alpha})`;

    }



    // Build preview card & explanations tailored to the active view & property

    let demoNum = '6';

    let demoSym = 'C';

    let demoName = 'Carbon';

    let demoVal = '12.011';

    let demoBg = 'linear-gradient(180deg, #10b981 0%, #059669 100%)';

    let demoBorder = '2px solid #10b981';

    let demoNumColor = '#ffffff';

    let demoSymColor = '#ffffff';

    let demoNameColor = '#ffffff';

    let demoValColor = '#ffffff';

    let callouts = [];



    if (v === 'main' || v === 'properties') {

        if (p === 'category') {

            demoBg = 'linear-gradient(180deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.50) 100%)';

            demoBorder = '2px solid #10b981';

            demoSymColor = '#ffffff'; // White for solid state at STP

            demoVal = '12.011';

            callouts = [

                { badge: 'Background Color', color: '#10b981', text: '<strong>Element Series / Chemical Family:</strong> Categorizes elements into Alkali, Transition Metals, Lanthanides, Nonmetals, Halogens, Noble Gases, etc.' },

                { badge: 'Symbol Text Color', color: '#00d4ff', text: '<strong>Physical State at STP:</strong> <span style="color:#ffffff;">White = Solid</span>, <span style="color:#00f0ff;">Cyan = Liquid</span>, <span style="color:#ff0055;">Crimson Red = Gas</span>, <span style="color:#94a3b8;">Gray = Unknown</span>.' },

                { badge: 'Top-Left Number', color: '#a855f7', text: '<strong>Atomic Number (Z):</strong> Total number of protons in the nucleus (e.g. 6 for Carbon).' },

                { badge: 'Center Symbol & Name', color: '#38bdf8', text: '<strong>IUPAC Symbol & Name:</strong> Standard 1 or 2 letter chemical symbol and full English name.' },

                { badge: 'Bottom Value', color: '#fbbf24', text: '<strong>Standard Atomic Weight (u):</strong> Average mass of all naturally occurring isotopes in unified atomic mass units.' }

            ];

        } else if (p === 'state') {

            demoBg = 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)';

            demoBorder = '2px solid #ffffff';

            demoNumColor = '#0f172a';

            demoSymColor = '#0f172a';

            demoNameColor = '#1e293b';

            demoValColor = '#334155';

            demoVal = 'Solid';

            callouts = [

                { badge: 'Card Background', color: '#ffffff', text: '<strong>Physical State at Active Temperature:</strong> <span style="background:#ffffff; color:#0f172a; padding:1px 4px; border-radius:3px; font-weight:700;">White = Solid</span>, <span style="background:#0284c7; color:#fff; padding:1px 4px; border-radius:3px;">Cyan = Liquid</span>, <span style="background:#e11d48; color:#fff; padding:1px 4px; border-radius:3px;">Red = Gas</span>, <span style="background:#1e293b; color:#94a3b8; padding:1px 4px; border-radius:3px;">Smoky Slate = Unknown</span>.' },

                { badge: 'Bottom State Label', color: '#38bdf8', text: '<strong>Phase Status:</strong> Displays "Solid", "Liquid", "Gas", or "Unknown" based on current slider temperature.' },

                { badge: 'Top-Left Number', color: '#a855f7', text: '<strong>Atomic Number (Z):</strong> Number of protons in nucleus.' },

                { badge: 'Slider Control', color: '#f59e0b', text: '<strong>Thermal Phase Scrubbing:</strong> Use the top temperature bar to heat from 0 K up to 6,000 K and watch elements melt and vaporize in real-time!' }

            ];

        } else if (p === 'discoveryYear') {

            demoBg = 'linear-gradient(180deg, rgba(49, 46, 129, 0.85) 0%, rgba(6, 182, 212, 0.50) 100%)';

            demoBorder = '2px solid #06b6d4';

            demoVal = 'Ancient';

            callouts = [

                { badge: 'Card Illumination', color: '#06b6d4', text: '<strong>Discovery Timeline:</strong> Elements discovered on or before the selected timeline year shine brightly; undiscovered elements are dimmed.' },

                { badge: 'Bottom Value', color: '#10b981', text: '<strong>Discovery Year:</strong> Exact discovery year (or "Ancient" for prehistoric elements like Carbon, Gold, Copper).' },

                { badge: 'Timeline Scrubbing', color: '#ec4899', text: '<strong>Interactive Slider:</strong> Scrub the timeline track from 1650 to 2026 to watch humanity uncover the elements chronologically.' }

            ];

        } else {

            // Heatmap Property

            demoBg = 'linear-gradient(180deg, rgba(234, 179, 8, 0.85) 0%, rgba(202, 138, 4, 0.50) 100%)';

            demoBorder = '2px solid #eab308';

            demoVal = '2.55';

            callouts = [

                { badge: 'Heatmap Spectrum', color: '#eab308', text: `<strong>${viewTitle}:</strong> Card background color reflects relative numerical magnitude from Minimum (Cool Blue/Cyan) to Maximum (Warm Red/Amber).` },

                { badge: 'Bottom Numeric Value', color: '#38bdf8', text: '<strong>Physical Property Value:</strong> Exact scientific measurement with proper units displayed in the bottom footer.' },

                { badge: 'Void Legend Scale', color: '#a855f7', text: '<strong>Interactive Gradient:</strong> Switch between Linear and Logarithmic scale modes directly in the void legend.' }

            ];

        }

    } else if (v === 'electrons') {

        demoBg = 'linear-gradient(180deg, rgba(16, 185, 129, 0.85) 0%, rgba(5, 150, 105, 0.50) 100%)';

        demoBorder = '2px solid #10b981';

        demoVal = '[He] 2s² 2p²';

        callouts = [

            { badge: 'Orbital Subshells', color: '#00d4ff', text: '<strong>Electronic Configuration:</strong> Displays ground-state electron filling according to the Aufbau principle, Hund\'s rule, and Pauli exclusion.' },

            { badge: 'Interactive Subshell Matrix', color: '#a855f7', text: '<strong>Spin Orbital Boxes:</strong> Interactive 1s through 7s, 2p-6p, 3d-6d, 4f-5f quantum orbital diagram with live electron spin arrows (↑↓).' },

            { badge: 'Subshell Blocks', color: '#10b981', text: '<strong>s, p, d, f Blocks:</strong> Instant highlighting and valence shell breakdown.' }

        ];

    } else {

        demoBg = 'linear-gradient(180deg, rgba(0, 212, 255, 0.4) 0%, rgba(168, 85, 247, 0.3) 100%)';

        demoBorder = '2px solid #00d4ff';

        demoVal = viewTitle;

        callouts = [

            { badge: 'Tab Focus', color: '#00d4ff', text: `<strong>${viewTitle}:</strong> Dedicated specialized chemistry workspace for deep exploration.` },

            { badge: 'Interactive Models', color: '#a855f7', text: 'Tap any element in the periodic grid to instantly focus calculations, structures, and charts.' }

        ];

    }



    if (cardDemo) {

        cardDemo.innerHTML = `

            <div class="anatomy-card-preview" style="background: ${demoBg}; border: ${demoBorder};">

                <div class="anatomy-card-num" style="color: ${demoNumColor};">${demoNum}</div>

                <div class="anatomy-card-sym" style="color: ${demoSymColor};">${demoSym}</div>

                <div class="anatomy-card-name" style="color: ${demoNameColor};">${demoName}</div>

                <div class="anatomy-card-val" style="color: ${demoValColor};">${demoVal}</div>

            </div>

        `;

    }



    if (detailsList) {

        detailsList.innerHTML = callouts.map(c => `

            <div class="anatomy-callout-item">

                <span class="anatomy-callout-badge" style="background: ${hexToRgbaLocalAnatomy(c.color, 0.25)}; border: 1px solid ${c.color}; color: ${c.color};">${c.badge}</span>

                <span class="anatomy-callout-text">${c.text}</span>

            </div>

        `).join('');

    }



    const dontShowCheck = document.getElementById('anatomy-dont-show-again');

    if (dontShowCheck) {

        dontShowCheck.checked = !!localStorage.getItem('periodica_guide_disabled');

    }



    _cardAnatomyModalOpenTime = Date.now();

    modal.style.display = 'flex';

}

window.openCardAnatomyModal = openCardAnatomyModal;



let _cardAnatomyModalOpenTime = 0;

function closeCardAnatomyModal(e) {

    if (Date.now() - _cardAnatomyModalOpenTime < 350) {

        return;

    }

    const modal = document.getElementById('card-anatomy-modal');

    if (modal) modal.style.display = 'none';



    const dontShowCheck = document.getElementById('anatomy-dont-show-again');

    if (dontShowCheck && dontShowCheck.checked) {

        localStorage.setItem('periodica_guide_disabled', 'true');

    } else {

        localStorage.removeItem('periodica_guide_disabled');

    }



    syncNativeSliderVisibility();

}

window.closeCardAnatomyModal = closeCardAnatomyModal;



function isAnyModalOpen() {

    const modalIds = [

        'settings-modal', 'wiki-modal', 'legal-doc-modal', 'table-type-modal',

        'card-anatomy-modal', 'temp-converter-modal', 'rate-us-modal',

        'app-update-modal', 'orbital-visualizer-modal', 'decay-explanation-modal',

        'compare-element-picker-modal', 'legend-concept-modal', 'pro-paywall-modal',

        'env-pressure-modal'

    ];

    for (let i = 0; i < modalIds.length; i++) {

        const el = document.getElementById(modalIds[i]);

        if (el) {

            if (el.style.display && el.style.display !== 'none') return true;

            try {

                const style = window.getComputedStyle(el);

                if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0) {

                    return true;

                }

            } catch (err) {}

        }

    }

    return false;

}

window.isAnyModalOpen = isAnyModalOpen;



function openSettingsModal() {

    const modal = document.getElementById('settings-modal');

    if (!modal) return;

    modal.style.display = 'flex';

    if (typeof initPerfModeUI === 'function') initPerfModeUI();

    const bridge = window.PeriodicaNativeSlider || window.NativeSliderBridge;

    if (bridge && typeof bridge.setVisibility === 'function') {

        bridge.setVisibility(false);

    }

    syncNativeSliderVisibility();

}

window.openSettingsModal = openSettingsModal;



function closeSettingsModal() {

    const modal = document.getElementById('settings-modal');

    if (modal) modal.style.display = 'none';

    syncNativeSliderVisibility();

}

window.closeSettingsModal = closeSettingsModal;



let _modalObserverInitialized = false;

function initModalSliderObserver() {

    if (_modalObserverInitialized || !window.MutationObserver) return;

    _modalObserverInitialized = true;

    const modalIds = [

        'settings-modal', 'wiki-modal', 'legal-doc-modal', 'table-type-modal',

        'card-anatomy-modal', 'temp-converter-modal', 'rate-us-modal',

        'app-update-modal', 'orbital-visualizer-modal', 'decay-explanation-modal',

        'compare-element-picker-modal', 'legend-concept-modal', 'pro-paywall-modal',

        'env-pressure-modal'

    ];

    const observer = new MutationObserver(() => {

        syncNativeSliderVisibility();

    });

    modalIds.forEach(id => {

        const el = document.getElementById(id);

        if (el) {

            observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });

        }

    });

}

window.initModalSliderObserver = initModalSliderObserver;



function syncNativeSliderVisibility() {

    const isMainView = (currentView === 'main' || currentView === 'properties');

    const modalActive = isAnyModalOpen();

    const isTimelineProp = isMainView && !modalActive && (currentProperty === 'discoveryYear');

    const isTempProp = isMainView && !modalActive && !isTimelineProp;



    const tempDisplay = document.getElementById('temp-display-container');

    const timelineDisplay = document.getElementById('timeline-display-container');

    const tempWrapper = document.getElementById('temp-controller-wrapper');

    const timelineWrapper = document.getElementById('timeline-controller-wrapper');



    if (tempDisplay) {

        if (isTempProp) {

            tempDisplay.classList.remove('hidden');

            tempDisplay.style.display = 'flex';

            tempDisplay.style.visibility = 'visible';

        } else {

            tempDisplay.classList.add('hidden');

            tempDisplay.style.display = 'none';

        }

    }



    if (timelineDisplay) {

        if (isTimelineProp) {

            timelineDisplay.classList.remove('hidden');

            timelineDisplay.style.display = 'flex';

            timelineDisplay.style.visibility = 'visible';

        } else {

            timelineDisplay.classList.add('hidden');

            timelineDisplay.style.display = 'none';

        }

    }



    if (tempWrapper) {

        if (isTempProp) {

            tempWrapper.classList.remove('hidden');

            tempWrapper.style.display = 'flex';

            tempWrapper.style.visibility = 'visible';

        } else {

            tempWrapper.classList.add('hidden');

            tempWrapper.style.display = 'none';

        }

    }



    if (timelineWrapper) {

        if (isTimelineProp) {

            timelineWrapper.classList.remove('hidden');

            timelineWrapper.style.display = 'flex';

            timelineWrapper.style.visibility = 'visible';

        } else {

            timelineWrapper.classList.add('hidden');

            timelineWrapper.style.display = 'none';

        }

    }



    const bridge = window.PeriodicaNativeSlider || window.NativeSliderBridge;

    if (bridge) {

        if (typeof document !== 'undefined' && document.body) {

            document.body.classList.add('has-native-slider');

            if (window.PeriodicCanvasGrid && typeof window.PeriodicCanvasGrid.resize === 'function') {

                window.PeriodicCanvasGrid.resize();

            }

        }

        const mobileLeftNav = document.getElementById('mobile-left-nav');

        const isExpanded = !!(mobileLeftNav && mobileLeftNav.classList.contains('expanded'));



        if (isTimelineProp) {

            if (typeof bridge.setMode === 'function') bridge.setMode('timeline');

            if (typeof bridge.setVisibility === 'function') bridge.setVisibility(true);

            if (typeof bridge.setProgress === 'function') bridge.setProgress(currentTimelineYear || 2026);

        } else if (isTempProp) {

            if (typeof bridge.setMode === 'function') bridge.setMode('temp');

            if (typeof bridge.setVisibility === 'function') bridge.setVisibility(true);

            if (typeof bridge.setProgress === 'function') bridge.setProgress(Math.round(currentTemp || 298));

        } else {

            if (typeof bridge.setMode === 'function') bridge.setMode('none');

            if (typeof bridge.setVisibility === 'function') bridge.setVisibility(false);

        }



        if (typeof bridge.setDrawerExpanded === 'function') {

            bridge.setDrawerExpanded(isExpanded);

        }

    }



    if (typeof window.refreshCustomSliders === 'function') {

        window.refreshCustomSliders();

    }

}

window.syncNativeSliderVisibility = syncNativeSliderVisibility;



// Mobile Left Collapsible Sidebar Interactions

function setupMobileLeftNav() {

    const mobileLeftNav = document.getElementById('mobile-left-nav');

    const toggleBtn = document.getElementById('mobile-nav-toggle');

    if (!mobileLeftNav) return;



    if (toggleBtn) {

        toggleBtn.addEventListener('click', (e) => {

            e.stopPropagation();

            mobileLeftNav.classList.toggle('expanded');

            syncNativeSliderVisibility();

        });

    }



    // Mobile nav item clicks (single-fire clean handler)

    document.querySelectorAll('.mobile-nav-item').forEach(item => {

        let lastTap = 0;

        const handleMobileNav = (e) => {

            const now = Date.now();

            if (now - lastTap < 250) return;

            lastTap = now;

            if (e) e.stopPropagation();

            const view = item.dataset.view || item.closest('[data-view]')?.dataset.view;

            if (view) {

                if (view !== 'main' && window.isProUser && !window.isProUser()) {

                    if (mobileLeftNav) mobileLeftNav.classList.remove('expanded');

                    if (window.openProPaywallModal) window.openProPaywallModal(view);

                    return;

                }

                if (typeof switchView === 'function') {

                    switchView(view);

                }

            }

            // Sync active state with top nav buttons

            document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));

            item.classList.add('active');

            

            // Auto collapse when item clicked

            mobileLeftNav.classList.remove('expanded');

            syncNativeSliderVisibility();

        };

        item.addEventListener('click', handleMobileNav);

    });



    // Dedicated Mobile Fullscreen Landscape Toggle Button

    const rotateBtn = document.getElementById('btn-mobile-rotate');

    if (rotateBtn) {

        rotateBtn.addEventListener('click', async (e) => {

            e.stopPropagation();

            await toggleLandscapeFullscreenMode();

            mobileLeftNav.classList.remove('expanded');

            syncNativeSliderVisibility();

        });

    }



    // Auto collapse when clicking anywhere else on the page

    document.addEventListener('click', (e) => {

        if (mobileLeftNav.classList.contains('expanded') && !mobileLeftNav.contains(e.target)) {

            mobileLeftNav.classList.remove('expanded');

            syncNativeSliderVisibility();

        }

    });

}



// Multi-Finger Pinch-to-Zoom Gesture Support for Periodic Table Grid

function setupPinchToZoom() {

    const wrappers = document.querySelectorAll('.grid-wrapper');

    wrappers.forEach(wrapper => {

        let pinchStartDist = 0;

        let pinchStartScale = 1;

        let currentScale = 1;

        let pinching = false;



        // Cache grid reference; it may be dynamically re-rendered so re-query on touchstart

        let grid = null;



        wrapper.addEventListener('touchstart', (e) => {

            if (e.target.closest('.table-controls, input, button, select, .sidebar-close-btn, .view-right, #in-grid-legend, #elec-in-grid-legend, #iso-in-grid-legend')) return;

            grid = wrapper.querySelector('.periodic-grid');

            // CRITICAL: Never block compositor on single-finger touches (slider drags).

            // Only intercept 2-finger pinch gestures.

            if (e.touches.length === 2) {

                pinching = true;

                pinchStartDist = Math.hypot(

                    e.touches[0].clientX - e.touches[1].clientX,

                    e.touches[0].clientY - e.touches[1].clientY

                );

                pinchStartScale = currentScale;

            } else {

                pinching = false;

            }

        }, { passive: true });



        wrapper.addEventListener('touchmove', (e) => {

            if (!pinching || e.touches.length !== 2 || !grid) return;



            e.preventDefault(); // CRITICAL: blocks native scroll so pinch works



            const dist = Math.hypot(

                e.touches[0].clientX - e.touches[1].clientX,

                e.touches[0].clientY - e.touches[1].clientY

            );



            const ratio = dist / (pinchStartDist || 1);

            currentScale = Math.min(Math.max(pinchStartScale * ratio, 0.4), 3.0);



            // Compute midpoint of the two fingers in wrapper-local coords

            const wRect = wrapper.getBoundingClientRect();

            const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - wRect.left;

            const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - wRect.top;



            grid.style.transformOrigin = `${midX}px ${midY}px`;

            grid.style.transform = `scale(${currentScale})`;

        }, { passive: false });



        wrapper.addEventListener('touchend', (e) => {

            if (e.touches.length < 2) {

                pinching = false;

                pinchStartDist = 0;

            }

        }, { passive: true });

    });

}



function setTableProperty(propKey) {

    if (!propKey) return;

    if (propKey !== 'category' && window.isProUser && !window.isProUser()) {

        if (window.openProPaywallModal) window.openProPaywallModal(propKey);

        return;

    }

    currentProperty = propKey;

    window.currentProperty = propKey;

    if (typeof syncPropertyButtons === 'function') syncPropertyButtons();



    const propLabels = {

        'category': 'Category',

        'state': 'State',

        'discoveryYear': 'Discovery Year',

        'electronegativity': 'Electronegativity',

        'atomicMass': 'Atomic Mass',

        'atomicRadius': 'Atomic Radius',

        'ionizationEnergy': 'Ionization Energy',

        'electronAffinity': 'Electron Affinity',

        'meltingPoint': 'Melting Point',

        'boilingPoint': 'Boiling Point',

        'density': 'Density',

        'block': 'Orbital Block'

    };

    const label = propLabels[propKey] || propKey;



    const btnTop = document.getElementById('btn-table-type-top');

    if (btnTop) btnTop.innerHTML = `🎛️ ${label} ▾`;



    // Sync sidebar active property item if present

    document.querySelectorAll('.prop-item:not(.elec-prop-item)').forEach(p => {

        if (p.dataset.prop === propKey) p.classList.add('active');

        else p.classList.remove('active');

    });



    // Close Table Type modal

    const modal = document.getElementById('table-type-modal');

    if (modal) modal.style.display = 'none';



    // Update visuals & sync native slider

    updateGridVisuals();

    renderLegend();

    if (window.PeriodicCanvasGrid && window.PeriodicCanvasGrid.render) {

        window.PeriodicCanvasGrid.render();

    }

    syncNativeSliderVisibility();



    // Auto-open Card Anatomy Guide on first view of this property

    if (!localStorage.getItem('periodica_guide_disabled')) {

        const guideKey = 'periodica_guide_seen_' + (currentView || 'main') + '_' + propKey;

        if (!localStorage.getItem(guideKey)) {

            localStorage.setItem(guideKey, 'true');

            setTimeout(() => {

                openCardAnatomyModal(currentView || 'main', propKey);

            }, 100);

        }

    }

}

window.setTableProperty = setTableProperty;











// Multi-Finger Pinch-to-Zoom Gesture Support for Periodic Table Grid

function setupPinchToZoom() {

    const wrappers = document.querySelectorAll('.grid-wrapper');

    wrappers.forEach(wrapper => {

        let pinchStartDist = 0;

        let pinchStartScale = 1;

        let currentScale = 1;

        let pinching = false;



        // Cache grid reference; it may be dynamically re-rendered so re-query on touchstart

        let grid = null;



        wrapper.addEventListener('touchstart', (e) => {

            if (e.target.closest('.table-controls, input, button, select, .sidebar-close-btn, .view-right, #in-grid-legend, #elec-in-grid-legend, #iso-in-grid-legend')) return;

            grid = wrapper.querySelector('.periodic-grid');

            // CRITICAL: Never block compositor on single-finger touches (slider drags).

            // Only intercept 2-finger pinch gestures.

            if (e.touches.length === 2) {

                pinching = true;

                pinchStartDist = Math.hypot(

                    e.touches[0].clientX - e.touches[1].clientX,

                    e.touches[0].clientY - e.touches[1].clientY

                );

                pinchStartScale = currentScale;

            } else {

                pinching = false;

            }

        }, { passive: true });



        wrapper.addEventListener('touchmove', (e) => {

            if (!pinching || e.touches.length !== 2 || !grid) return;



            e.preventDefault(); // CRITICAL: blocks native scroll so pinch works



            const dist = Math.hypot(

                e.touches[0].clientX - e.touches[1].clientX,

                e.touches[0].clientY - e.touches[1].clientY

            );



            const ratio = dist / (pinchStartDist || 1);

            currentScale = Math.min(Math.max(pinchStartScale * ratio, 0.4), 3.0);



            // Compute midpoint of the two fingers in wrapper-local coords

            const wRect = wrapper.getBoundingClientRect();

            const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - wRect.left;

            const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - wRect.top;



            grid.style.transformOrigin = `${midX}px ${midY}px`;

            grid.style.transform = `scale(${currentScale})`;

        }, { passive: false });



        wrapper.addEventListener('touchend', (e) => {

            if (e.touches.length < 2) {

                pinching = false;

                pinchStartDist = 0;

            }

        }, { passive: true });

    });

}



// ==========================================================================

// DEVICE TIER DETECTION & PERFORMANCE MODE

// ==========================================================================



function detectDeviceTier() {

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||

                     ('ontouchstart' in window && window.innerWidth <= 1024);

    const cores = navigator.hardwareConcurrency || 0;

    const mem   = navigator.deviceMemory || 0; // GB (not available in all browsers)

    const gpu   = (() => {

        try {

            const c = document.createElement('canvas');

            const gl = c.getContext('webgl') || c.getContext('experimental-webgl');

            if (!gl) return 'unknown';

            const dbg = gl.getExtension('WEBGL_debug_renderer_info');

            const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown';

            const loseExt = gl.getExtension('WEBGL_lose_context');

            if (loseExt) loseExt.loseContext();

            return renderer;

        } catch { return 'unknown'; }

    })();



    let tier = 'high';

    if (isMobile) {

        tier = 'mobile'; // mobile always optimized

    } else if (cores > 0 && cores <= 4) {

        tier = 'budget';

    } else if (mem > 0 && mem <= 4) {

        tier = 'budget';

    } else if (cores <= 8 && (mem <= 8 || mem === 0)) {

        tier = 'mid';

    }



    return { tier, isMobile, cores, mem, gpu };

}



function applyPerfMode(enable, savePreference = false) {
    if (enable) {
        document.body.classList.add('perf-mode');
    } else {
        document.body.classList.remove('perf-mode');
    }

    // Update toggle UI
    const toggle = document.getElementById('perf-mode-toggle');
    if (toggle) toggle.checked = enable;

    const note = document.getElementById('perf-toggle-note');
    if (note) {
        note.textContent = enable
            ? 'Optimized visuals active: GPU blur and heavy shadows reduced for maximum 60fps smoothness.'
            : 'Full visuals active: glassmorphism, glow effects and shaders enabled.';
    }

    // Persist preference
    if (savePreference) {
        localStorage.setItem('perfModeOverride', enable ? '1' : '0');
    }
}
window.applyPerfMode = applyPerfMode;

function applyMcpMode(enable, savePreference = false) {
    const toggle = document.getElementById('mcp-mode-toggle');
    if (toggle) toggle.checked = enable;

    if (window.PeriodicaMCP && typeof window.PeriodicaMCP.toggle === 'function') {
        window.PeriodicaMCP.toggle(enable);
    } else if (savePreference) {
        localStorage.setItem('periodica_mcp_enabled', enable ? 'true' : 'false');
    }
}
window.applyMcpMode = applyMcpMode;

function initPerfModeUI() {
    const { tier, isMobile, cores, mem, gpu } = detectDeviceTier();

    // Badge
    const badge = document.getElementById('perf-tier-badge');
    if (badge) {
        const labels = { mobile: ['MOBILE', '#00d4ff', 'rgba(0,212,255,0.15)'],
                         budget: ['BUDGET', '#f59e0b', 'rgba(245,158,11,0.15)'],
                         mid:    ['MID-RANGE', '#a78bfa', 'rgba(167,139,250,0.15)'],
                         high:   ['HIGH-END', '#10b981', 'rgba(16,185,129,0.15)'] };
        const [label, color, bg] = labels[tier] || labels.high;
        badge.textContent = label;
        badge.style.cssText += `color:${color}; background:${bg}; border:1px solid ${color}44;`;
    }

    // Device info panel
    const infoEl = document.getElementById('device-info-list');
    if (infoEl) {
        const rows = [
            ['Device Type', isMobile ? 'Mobile / Tablet' : 'Desktop / Laptop'],
            ['CPU Cores', cores > 0 ? `${cores} logical cores` : 'Not available'],
            ['RAM', mem > 0 ? `~${mem} GB` : 'Not exposed by browser'],
            ['GPU', gpu !== 'unknown' ? gpu.substring(0, 60) : 'Not available'],
            ['Screen', `${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio}x`],
        ];
        infoEl.innerHTML = rows.map(([k, v]) =>
            `<div style="display:flex; gap:8px;"><span style="color:#64748b; min-width:90px;">${k}:</span><span style="color:#94a3b8; word-break:break-word;">${v}</span></div>`
        ).join('');
    }

    // Performance toggle — accessible & responsive on all devices!
    const toggle = document.getElementById('perf-mode-toggle');
    if (toggle) {
        toggle.disabled = false;
        const stored = localStorage.getItem('perfModeOverride');
        const isOn = stored !== null ? stored === '1' : (isMobile || tier === 'budget' || tier === 'mid');
        toggle.checked = isOn;
        applyPerfMode(isOn, false);
    }

    // MCP toggle — initialize to current MCP state
    const mcpToggle = document.getElementById('mcp-mode-toggle');
    if (mcpToggle) {
        const isMcpOn = localStorage.getItem('periodica_mcp_enabled') !== 'false';
        mcpToggle.checked = isMcpOn;
    }
}

function setupPerfModeOnLoad() {
    const { tier, isMobile } = detectDeviceTier();
    const stored = localStorage.getItem('perfModeOverride');
    if (stored !== null) {
        applyPerfMode(stored === '1');
        return;
    }
    applyPerfMode(isMobile || tier === 'budget' || tier === 'mid');
}



// In-App Legal & Compliance Document Viewer

function openLegalDoc(type) {

    const modal = document.getElementById('legal-doc-modal');

    const titleEl = document.getElementById('legal-modal-title');

    const bodyEl = document.getElementById('legal-modal-body');

    if (!modal || !titleEl || !bodyEl) return;



    if (window.NativeServices?.Haptics) {

        window.NativeServices.Haptics.selection();

    }



    if (type === 'privacy') {

        titleEl.innerHTML = '🔒 Privacy Policy';

        bodyEl.innerHTML = `

            <p><strong>Effective Date:</strong> August 23, 2026</p>

            <p>Periodica 3D is an offline-first educational chemistry application. We do <strong>not</strong> collect, store, or sell any personal identifiable information.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">1. Information We Collect</h4>

            <p>We do not collect names, emails, phone numbers, or contacts. User preferences and quiz high scores are stored strictly locally on your device.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">2. Third-Party Services</h4>

            <p>In ad-supported versions, Google Mobile Ads (AdMob) may receive standard anonymous device metrics and advertising IDs to serve relevant, non-intrusive ads in accordance with Google Play and COPPA policies.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">3. In-App Purchases & Subscriptions</h4>

            <p>All optional Pro subscriptions and "Remove Ads" purchases are processed directly by Google Play or Apple App Store. We do not process or store any financial or billing data.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">4. Contact</h4>

            <p>Questions or inquiries: <a href="mailto:periodicax.support@gmail.com" style="color:#00d4ff;">periodicax.support@gmail.com</a></p>

        `;

    } else if (type === 'terms') {

        titleEl.innerHTML = '📜 Terms of Use & Conditions';

        bodyEl.innerHTML = `

            <p><strong>Effective Date:</strong> September 2, 2026</p>

            <p>By downloading, installing, or using Periodica 3D, you agree to be bound by these Terms of Use.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">1. Educational & Reference License</h4>

            <p>You are granted a personal, non-exclusive license to use Periodica 3D for educational, reference, and personal study purposes.</p>

            <h4 style="color:#fbbf24; margin:16px 0 6px;">2. Scientific Data & Inaccuracy Disclaimer</h4>

            <p>Periodica 3D aggregates an extensive volume of chemical, physical, and nuclear data (118 elements, 3,000+ isotopes, crystal lattices, and reaction balances) compiled from IUPAC, NIST, and peer-reviewed literature.</p>

            <p><strong>Important Notice:</strong> While every effort has been made to verify accuracy, scientific measurements evolve, theoretical models differ (e.g. electronegativity/radii scales), and transactinide data (Z > 100) relies on quantum calculations. Data may contain unintentional inaccuracies, approximations, or typographical discrepancies. The application is provided "as is" without warranty.</p>

            <p><strong>Non-Suitability for High-Risk Use:</strong> NEVER use this app as a certified reference for hazardous chemical synthesis, laboratory safety manuals, medical treatment, or radiological protection.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">3. Subscriptions & In-App Purchases</h4>

            <p>Optional subscriptions and "Remove Ads" purchases are processed securely through Google Play Store or Apple App Store. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date in your app store account settings.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">4. Limitation of Liability</h4>

            <p>To the maximum extent permitted by law, the developers and distributors assume no liability for any direct or indirect damages, experimental failure, or laboratory incidents resulting from reliance on the data.</p>

            <h4 style="color:#00d4ff; margin:16px 0 6px;">5. Contact & Corrections</h4>

            <p>For inquiries or scientific data corrections: <a href="mailto:periodicax.support@gmail.com" style="color:#00d4ff;">periodicax.support@gmail.com</a></p>

        `;

    } else if (type === 'disclaimer') {

        titleEl.innerHTML = '⚠️ Scientific Data & Accuracy Disclaimer';

        bodyEl.innerHTML = `

            <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:10px; padding:12px 14px; margin-bottom:14px;">

                <p style="color:#fbbf24; font-weight:700; margin:0 0 4px; font-size:0.9rem;">⚠️ Comprehensive Data Notice</p>

                <p style="color:#cbd5e1; font-size:0.8rem; margin:0; line-height:1.5;">This application loads a massive volume of interconnected scientific data that may contain theoretical approximations, experimental uncertainties, or typographical inaccuracies.</p>

            </div>

            <h4 style="color:#00d4ff; margin:14px 0 6px;">1. Scale of the Scientific Dataset</h4>

            <p>Periodica 3D incorporates an extensive corpus of scientific information spanning:</p>

            <ul style="padding-left:18px; margin:6px 0; color:#94a3b8; font-size:0.8rem; line-height:1.6;">

                <li><strong>118 Chemical Elements:</strong> Atomic weights, oxidation states, electron configurations, ionization energies (levels 1-10), electronegativities, and lattice parameters.</li>

                <li><strong>3,000+ Isotopic Nuclides:</strong> Half-lives, decay modes (α, β⁻, β⁺, ε, fission), and isotopic abundances.</li>

                <li><strong>Quantum Mechanical Wavefunctions:</strong> Real-time 3D mathematical scalar-field evaluations of hydrogenic orbitals (1s through 7p).</li>

                <li><strong>Chemical Reaction Solver:</strong> Matrix equation balancing and stoichiometry.</li>

            </ul>

            <h4 style="color:#00d4ff; margin:14px 0 6px;">2. Experimental Uncertainty & Approximations</h4>

            <p>While data is sourced from established international organizations (IUPAC, NIST, Nubase, CRC Handbook), users should note:</p>

            <ul style="padding-left:18px; margin:6px 0; color:#94a3b8; font-size:0.8rem; line-height:1.6;">

                <li>Physical constants, isotope half-lives, and decay radiation evaluations are subject to periodic experimental revision by international committees.</li>

                <li>For synthetic superheavy elements (Z ≥ 104), reported properties often represent relativistic quantum calculations or single-atom estimates with inherent scientific uncertainty.</li>

                <li>Differing scientific references employ differing electronegativity scales (Pauling, Allen, Mulliken) and radius models (covalent, ionic, van der Waals).</li>

            </ul>

            <h4 style="color:#ef4444; margin:14px 0 6px;">3. Strictly Educational Use (Not for Critical / Lab Safety)</h4>

            <p><strong>PERIODICA 3D IS NOT A CERTIFIED SAFETY PROTOCOL OR CLINICAL TOOL.</strong></p>

            <p>Never rely on this application as a substitute for verified Material Safety Data Sheets (MSDS/SDS), certified laboratory safety procedures, medical diagnoses, chemical synthesis safety, or radiological protection.</p>

            <h4 style="color:#00d4ff; margin:14px 0 6px;">4. Report Data Inaccuracies</h4>

            <p>We welcome submissions from researchers and educators to continuously improve accuracy. Submit verified citations to: <a href="mailto:periodicax.support@gmail.com" style="color:#00d4ff; font-weight:600;">periodicax.support@gmail.com</a></p>

        `;

    } else if (type === 'licenses') {

        titleEl.innerHTML = '⚖️ Open Source & Third-Party Licenses';

        bodyEl.innerHTML = `

            <p style="color:#94a3b8; font-size:0.82rem; margin-bottom:14px;">Periodica 3D is built on open-source technologies and scientific data. Tap any item below to view its full license agreement:</p>



            <!-- Three.js -->

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(0,212,255,0.2); border-radius:10px; padding:12px 14px; margin-bottom:12px;">

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">

                    <div>

                        <span style="font-weight:700; color:#ffffff; font-size:0.9rem;">Three.js & OrbitControls</span>

                        <span style="font-size:0.75rem; color:#64748b; margin-left:6px;">(r128)</span>

                    </div>

                    <span style="background:rgba(0,212,255,0.15); color:#00d4ff; border:1px solid rgba(0,212,255,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:700; font-family:'IBM Plex Mono',monospace;">MIT License</span>

                </div>

                <p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 10px;">Copyright © 2010-2026 Three.js Authors. Hardware-accelerated WebGL 3D rendering library.</p>

                <button onclick="toggleLicenseText('lic-three')" style="padding:6px 12px; background:rgba(0,212,255,0.08); border:1px solid rgba(0,212,255,0.25); color:#00d4ff; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;"><span id="lic-three-arrow">▼ Read Full License</span></button>

                <div id="lic-three" style="display:none; margin-top:10px;">

                    <pre style="white-space:pre-wrap; font-family:'IBM Plex Mono',monospace; font-size:0.7rem; line-height:1.45; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); max-height:160px; overflow-y:auto; margin:0;">The MIT License



Copyright © 2010-2026 Three.js authors



Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:



The above copyright notice and this permission notice shall be included in

all copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

THE SOFTWARE.</pre>

                </div>

            </div>



            <!-- Capacitor -->

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(168,85,247,0.2); border-radius:10px; padding:12px 14px; margin-bottom:12px;">

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">

                    <div>

                        <span style="font-weight:700; color:#ffffff; font-size:0.9rem;">Ionic Capacitor</span>

                        <span style="font-size:0.75rem; color:#64748b; margin-left:6px;">(v7.0)</span>

                    </div>

                    <span style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:700; font-family:'IBM Plex Mono',monospace;">MIT License</span>

                </div>

                <p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 10px;">Copyright © 2026 Ionic. Cross-platform native mobile runtime and bridge plugins.</p>

                <button onclick="toggleLicenseText('lic-cap')" style="padding:6px 12px; background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.25); color:#c084fc; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;"><span id="lic-cap-arrow">▼ Read Full License</span></button>

                <div id="lic-cap" style="display:none; margin-top:10px;">

                    <pre style="white-space:pre-wrap; font-family:'IBM Plex Mono',monospace; font-size:0.7rem; line-height:1.45; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); max-height:160px; overflow-y:auto; margin:0;">The MIT License (MIT)



Copyright (c) 2017-present Drifty Co.



Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:



The above copyright notice and this permission notice shall be included in

all copies or substantial portions of the Software.



THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

THE SOFTWARE.</pre>

                </div>

            </div>



            <!-- Google Fonts -->

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(16,185,129,0.2); border-radius:10px; padding:12px 14px; margin-bottom:12px;">

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">

                    <div>

                        <span style="font-weight:700; color:#ffffff; font-size:0.9rem;">DM Sans, IBM Plex Mono, Source Serif 4</span>

                    </div>

                    <span style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:700; font-family:'IBM Plex Mono',monospace;">SIL OFL 1.1</span>

                </div>

                <p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 10px;">Copyright © Colophon Foundry, IBM, and Frank Grießhammer. High-legibility scientific typography.</p>

                <button onclick="toggleLicenseText('lic-fonts')" style="padding:6px 12px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); color:#34d399; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;"><span id="lic-fonts-arrow">▼ Read Full License</span></button>

                <div id="lic-fonts" style="display:none; margin-top:10px;">

                    <pre style="white-space:pre-wrap; font-family:'IBM Plex Mono',monospace; font-size:0.7rem; line-height:1.45; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); max-height:160px; overflow-y:auto; margin:0;">SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007



PREAMBLE

The goals of the Open Font License (OFL) are to stimulate worldwide

development of collaborative font projects, to support the font creation

efforts of academic and linguistic communities, and to provide a free and

open framework in which fonts may be shared and improved in partnership

with others.



PERMISSION & CONDITIONS

Permission is hereby granted, free of charge, to any person obtaining

a copy of the Font Software, to use, study, copy, merge, embed, modify,

redistribute, and sell modified and unmodified copies of the Font Software,

subject to the following conditions:



1) Neither the Font Software nor any of its individual components,

in Source or Binary forms, may be sold by itself.



2) Original or Modified Versions of the Font Software may be bundled,

redistributed and/or sold with any software, provided that each copy

contains the above copyright notice and this license.



3) No Modified Version of the Font Software may use the Reserved Font

Name(s) unless explicit written permission is granted by the corresponding

Copyright Holder.



4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font

Software shall not be used to promote, endorse or advertise any

Modified Version, except to acknowledge the contribution(s) of the

Copyright Holder(s) and the Author(s) or with their explicit written

permission.



5) The Font Software, modified or unmodified, in part or in whole,

must be distributed entirely under this license, and must not be

distributed under any other license.</pre>

                </div>

            </div>



            <!-- Scientific Data Attributions -->

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(245,158,11,0.2); border-radius:10px; padding:12px 14px;">

                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">

                    <div>

                        <span style="font-weight:700; color:#ffffff; font-size:0.9rem;">Scientific Data & Database Sources</span>

                    </div>

                    <span style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3); font-size:0.72rem; padding:2px 8px; border-radius:6px; font-weight:700; font-family:'IBM Plex Mono',monospace;">Open Data / CC BY-SA</span>

                </div>

                <p style="font-size:0.75rem; color:#94a3b8; margin:6px 0 10px;">Chemical and nuclear datasets utilized under standard international scientific attribution guidelines.</p>

                <button onclick="toggleLicenseText('lic-data')" style="padding:6px 12px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); color:#fbbf24; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;"><span id="lic-data-arrow">▼ View Data Sources</span></button>

                <div id="lic-data" style="display:none; margin-top:10px;">

                    <pre style="white-space:pre-wrap; font-family:'IBM Plex Mono',monospace; font-size:0.7rem; line-height:1.45; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); max-height:160px; overflow-y:auto; margin:0;">• IUPAC: Standard Atomic Weights, Periodic Table of Elements (IUPAC Commission on Isotopic Abundances and Atomic Weights).

• NIST: Physical Reference Data, Standard Reference Database 78 (Ground Levels & Ionization Energies).

• Nubase / Atomic Mass Data Center: Nuclear decay half-lives and decay modes.

• NCBI PubChem: Chemical structure nomenclature and molecular masses (U.S. National Library of Medicine, Public Domain).

• Wikipedia: Element overview articles and historical discovery summaries (Wikimedia Foundation, licensed under Creative Commons Attribution-ShareAlike 4.0 International License CC BY-SA 4.0).</pre>

                </div>

            </div>

        `;

    }



    modal.style.display = 'flex';

    syncNativeSliderVisibility();

}



window.toggleLicenseText = function(id) {

    if (window.NativeServices?.Haptics) {

        window.NativeServices.Haptics.selection();

    }

    const el = document.getElementById(id);

    const arrow = document.getElementById(id + '-arrow');

    if (!el) return;

    const isHidden = el.style.display === 'none';

    el.style.display = isHidden ? 'block' : 'none';

    if (arrow) {

        arrow.textContent = isHidden ? '▲ Hide Full License' : '▼ Read Full License';

    }

};



window.copyMcpConfig = function() {

    const config = {

        mcpServers: {

            "periodica": {

                "command": "node",

                "args": ["mcp-server/index.js"]

            }

        }

    };

    const jsonStr = JSON.stringify(config, null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(jsonStr).then(() => {

            if (typeof showToast === 'function') showToast('📋 MCP Config copied to clipboard!');

            else alert('MCP Config copied to clipboard!');

        }).catch(() => {

            prompt('Copy MCP Config:', jsonStr);

        });

    } else {

        prompt('Copy MCP Config:', jsonStr);

    }

    if (window.NativeServices?.Haptics) {

        window.NativeServices.Haptics.notification('SUCCESS');

    }

};



// Global document listener to clear active legend highlighting when tapping empty space outside components

document.addEventListener('pointerdown', (e) => {

    if (!window.lockedLegendKey && !window.lockedLegendGroup) return;

    if (e.target.closest('#in-grid-legend, #elec-in-grid-legend, #periodic-canvas-engine, .sidebar-drawer, .modal, button, input, select, .nav-btn, .theme-toggle, .badge-btn, .tab-btn')) {

        return;

    }

    if (typeof window.clearLegendHighlightingForce === 'function') {

        window.clearLegendHighlightingForce();

    }

}, { passive: true });



/* ==========================================================================

   Direct Temperature Converter & Input Manager

   ========================================================================== */

function openTempConverterModal() {

    const modal = document.getElementById('temp-converter-modal');

    if (!modal) return;



    if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {

        window.PeriodicaNativeSlider.setVisibility(false);

    }



    const curK = Math.max(0, Math.min(6000, currentTemp || 298));

    const inputK = document.getElementById('conv-input-k');

    const inputC = document.getElementById('conv-input-c');

    const inputF = document.getElementById('conv-input-f');



    if (inputK) inputK.value = Math.round(curK * 100) / 100;

    if (inputC) inputC.value = Math.round((curK - 273.15) * 100) / 100;

    if (inputF) inputF.value = Math.round(((curK - 273.15) * 1.8 + 32) * 100) / 100;



    updateConvStatePreview(curK);

    modal.style.display = 'flex';

}

window.openTempConverterModal = openTempConverterModal;



function closeTempConverterModal() {

    const modal = document.getElementById('temp-converter-modal');

    if (modal) modal.style.display = 'none';



    if (typeof syncNativeSliderVisibility === 'function') {

        syncNativeSliderVisibility();

    }

}

window.closeTempConverterModal = closeTempConverterModal;



function handleConvInput(sourceUnit) {

    const inputK = document.getElementById('conv-input-k');

    const inputC = document.getElementById('conv-input-c');

    const inputF = document.getElementById('conv-input-f');

    if (!inputK || !inputC || !inputF) return;



    let kVal = 298;

    if (sourceUnit === 'k') {

        const val = parseFloat(inputK.value);

        if (isNaN(val)) return;

        kVal = Math.max(0, Math.min(6000, val));

        inputC.value = Math.round((kVal - 273.15) * 100) / 100;

        inputF.value = Math.round(((kVal - 273.15) * 1.8 + 32) * 100) / 100;

    } else if (sourceUnit === 'c') {

        const val = parseFloat(inputC.value);

        if (isNaN(val)) return;

        kVal = Math.max(0, Math.min(6000, val + 273.15));

        inputK.value = Math.round(kVal * 100) / 100;

        inputF.value = Math.round((val * 1.8 + 32) * 100) / 100;

    } else if (sourceUnit === 'f') {

        const val = parseFloat(inputF.value);

        if (isNaN(val)) return;

        const cVal = (val - 32) / 1.8;

        kVal = Math.max(0, Math.min(6000, cVal + 273.15));

        inputK.value = Math.round(kVal * 100) / 100;

        inputC.value = Math.round(cVal * 100) / 100;

    }



    updateConvStatePreview(kVal);

}

window.handleConvInput = handleConvInput;



function applyTempPreset(presetK) {

    const inputK = document.getElementById('conv-input-k');

    if (inputK) {

        inputK.value = presetK;

        handleConvInput('k');

    }

}

window.applyTempPreset = applyTempPreset;



function updateConvStatePreview(k) {

    let solids = 0, liquids = 0, gases = 0, unknowns = 0;

    const data = typeof elementsData !== 'undefined' ? elementsData : [];

    for (let i = 0; i < data.length; i++) {

        const el = data[i];

        const m = el.meltingPoint;

        const b = el.boilingPoint;

        if (m === null && b === null) {

            unknowns++;

        } else if (m !== null && k < m) {

            solids++;

        } else if (b !== null && k > b) {

            gases++;

        } else if (m !== null && (b === null || k <= b)) {

            liquids++;

        } else {

            solids++;

        }

    }



    const cSolid = document.getElementById('conv-count-solid');

    const cLiquid = document.getElementById('conv-count-liquid');

    const cGas = document.getElementById('conv-count-gas');

    const cUnknown = document.getElementById('conv-count-unknown');



    if (cSolid) cSolid.textContent = solids;

    if (cLiquid) cLiquid.textContent = liquids;

    if (cGas) cGas.textContent = gases;

    if (cUnknown) cUnknown.textContent = unknowns;

}



function confirmTempConverter() {

    const inputK = document.getElementById('conv-input-k');

    if (inputK) {

        const kVal = Math.max(0, Math.min(6000, parseFloat(inputK.value) || 298));

        currentTemp = kVal;

        if (typeof window.updateTempReadoutDirectly === 'function') {

            window.updateTempReadoutDirectly(kVal);

        }



        if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setProgress) {

            window.PeriodicaNativeSlider.setProgress(Math.round(kVal));

        }



        const tempSlider = document.getElementById('temp-slider');

        if (tempSlider) tempSlider.value = Math.round(kVal);



        if (typeof applyOptimizedTemperatureUpdate === 'function') {

            applyOptimizedTemperatureUpdate(kVal);

        }



        if (window.PeriodicCanvasGrid) {

            window.PeriodicCanvasGrid.render();

        }

    }

    closeTempConverterModal();

}

window.confirmTempConverter = confirmTempConverter;



/* ==========================================================================

   Rate Us / In-App Review Manager

   ========================================================================== */

let selectedRatingStars = 5;



function openRateUsModal(forceUserTriggered = false) {

    const isPro = (typeof window.isProUser === 'function' && window.isProUser()) || localStorage.getItem('periodica_is_pro') === 'true' || localStorage.getItem('periodica_pro_tier') === 'lifetime';

    const neverShow = localStorage.getItem('periodica_rate_never') === 'true' || localStorage.getItem('periodica_rated') === 'true';



    // Never prompt automatically if the user is PRO or chose "Don't show again" / already rated

    if (!forceUserTriggered && (isPro || neverShow)) {

        return;

    }



    const modal = document.getElementById('rate-us-modal');

    if (!modal) return;



    if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {

        window.PeriodicaNativeSlider.setVisibility(false);

    }



    handleStarClick(5);

    modal.style.display = 'flex';

}

window.openRateUsModal = openRateUsModal;



function dismissRateUsNever() {

    localStorage.setItem('periodica_rate_never', 'true');

    localStorage.setItem('periodica_rated', 'true');

    closeRateUsModal();

}

window.dismissRateUsNever = dismissRateUsNever;



function closeRateUsModal() {

    const modal = document.getElementById('rate-us-modal');

    if (modal) modal.style.display = 'none';



    if (typeof syncNativeSliderVisibility === 'function') {

        syncNativeSliderVisibility();

    }

}

window.closeRateUsModal = closeRateUsModal;



function handleStarClick(stars) {

    selectedRatingStars = stars;

    const starBtns = document.querySelectorAll('#star-rating-container .star-btn');

    starBtns.forEach((btn, idx) => {

        if (idx < stars) {

            btn.classList.add('active');

        } else {

            btn.classList.remove('active');

        }

    });



    const feedbackArea = document.getElementById('rating-feedback-area');

    const actionMsg = document.getElementById('rating-action-text');

    const textareaWrap = document.getElementById('feedback-textarea-wrap');

    const submitBtn = document.getElementById('rate-submit-btn');



    if (feedbackArea) feedbackArea.style.display = 'block';



    if (stars >= 4) {

        if (actionMsg) actionMsg.textContent = '🎉 Thank you! Rate us 5 stars on Google Play to support development:';

        if (textareaWrap) textareaWrap.style.display = 'none';

        if (submitBtn) submitBtn.textContent = '⭐ Rate on Google Play';

    } else {

        if (actionMsg) actionMsg.textContent = 'We appreciate your honesty! How can we make Periodica 3D better?';

        if (textareaWrap) textareaWrap.style.display = 'block';

        if (submitBtn) submitBtn.textContent = 'Send Feedback';

    }

}

window.handleStarClick = handleStarClick;



function submitRating() {

    localStorage.setItem('periodica_rated', 'true');

    if (selectedRatingStars >= 4) {

        if (window.PeriodicaNativeReview && typeof window.PeriodicaNativeReview.requestInAppReview === 'function') {

            window.PeriodicaNativeReview.requestInAppReview();

        } else {

            const playUrl = 'https://play.google.com/store/apps/details?id=com.periodica.app';

            window.open(playUrl, '_system');

        }

    } else {

        // Direct feedback submission

        const feedbackInput = document.getElementById('feedback-input-text');

        const text = feedbackInput ? feedbackInput.value : '';

        if (text) {

            console.log('User Feedback:', text);

            // Optionally mailto

            window.open(`mailto:periodicax.support@gmail.com?subject=Periodica Feedback (${selectedRatingStars} Stars)&body=${encodeURIComponent(text)}`, '_system');

        }

    }

    closeRateUsModal();

}

window.submitRating = submitRating;



function dismissRateUsLater() {

    localStorage.setItem('periodica_rate_later_timestamp', Date.now().toString());

    closeRateUsModal();

}

window.dismissRateUsLater = dismissRateUsLater;



/* ==========================================================================

   App Update Manager (Mandatory & Optional In-App Updates + Push Alerts)

   ========================================================================== */

const APP_CURRENT_VERSION = window.AppConfig?.app?.version || '4.5.0';

const APP_VERSION_CODE = 4305;

window.isAppUpdateMandatory = false;

window.isAppUpdateActive = false;

let currentRemoteUpdateInfo = null;



function syncAppVersionUI() {

    const ver = APP_CURRENT_VERSION;

    document.querySelectorAll('.mobile-nav-version-footer').forEach(el => {

        el.textContent = `v${ver}`;

    });

    document.querySelectorAll('.version-badge').forEach(el => {

        el.textContent = `v${ver}`;

    });

    const curPill = document.getElementById('update-current-ver');

    if (curPill) curPill.textContent = `Current: v${ver}`;

}

window.syncAppVersionUI = syncAppVersionUI;

if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', syncAppVersionUI);

} else {

    syncAppVersionUI();

}



function parseSemVer(v) {

    if (!v) return [0, 0, 0];

    const cleaned = String(v).replace(/^v/i, '').trim();

    return cleaned.split('.').map(part => parseInt(part, 10) || 0);

}



function compareSemanticVersions(vNew, vCurrent) {

    const [n1, n2, n3] = parseSemVer(vNew);

    const [c1, c2, c3] = parseSemVer(vCurrent);

    if (n1 !== c1) return n1 - c1;

    if (n2 !== c2) return n2 - c2;

    return n3 - c3;

}



async function fetchRemoteVersionInfo() {

    const updateCfg = window.AppConfig?.updates || {};

    const remoteUrl = updateCfg.remoteVersionUrl;

    const localUrl = updateCfg.localFallbackUrl || 'version.json';



    // 1. Try Remote URL with strict 4s timeout

    if (remoteUrl) {

        try {

            const controller = new AbortController();

            const timeoutId = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(remoteUrl, { 

                cache: 'no-store',

                signal: controller.signal 

            });

            clearTimeout(timeoutId);

            if (res.ok) {

                const data = await res.json();

                console.log('[AppUpdate] Successfully fetched remote version:', data);

                return data;

            }

        } catch (err) {

            console.warn('[AppUpdate] Remote fetch failed or timed out:', err.message);

        }

    }



    // 2. Try Local Fallback JSON

    if (localUrl) {

        try {

            const res = await fetch(localUrl, { cache: 'no-store' });

            if (res.ok) {

                const data = await res.json();

                console.log('[AppUpdate] Loaded local version fallback:', data);

                return data;

            }

        } catch (err) {

            console.warn('[AppUpdate] Local fallback fetch error:', err.message);

        }

    }



    // 3. Embedded safe fallback

    return {

        latestVersion: '4.3.0',

        latestVersionCode: 4300,

        minRequiredVersionCode: 4200,

        isMandatory: false,

        releaseDate: 'September 2026',

        downloadSize: '~14 MB',

        changelog: [

            'Direct Multi-Unit Temperature Converter (Kelvin, Celsius, Fahrenheit)',

            'High-Precision 3D Electron Density & Orbital Slice Visualizer',

            'Refined Adaptive Icon branding & Android 66% safe zone calibration',

            'Instant zero-latency table rendering and memory optimizations'

        ],

        playStoreUrl: 'market://details?id=com.periodica.app',

        fallbackUrl: 'https://play.google.com/store/apps/details?id=com.periodica.app'

    };

}



async function checkAppUpdates(isManual = false) {

    try {

        const updateModal = document.getElementById('app-update-modal');

        const updateCard = updateModal?.querySelector('.app-update-modal-card');

        const currentVerEl = document.getElementById('update-current-ver');

        const latestVerEl = document.getElementById('update-latest-ver');

        const descEl = document.getElementById('update-modal-desc');

        const warningEl = document.getElementById('update-mandatory-warning');

        const dismissBtn = document.getElementById('update-dismiss-btn');

        const closeBtn = document.getElementById('update-modal-close-btn');

        const titleEl = document.getElementById('update-modal-title');

        const iconWrapEl = updateModal?.querySelector('.app-update-icon-wrap');

        const changelogList = document.getElementById('update-changelog-list');

        const storeBtn = document.getElementById('update-store-action-btn') || updateModal?.querySelector('.update-btn-store');



        if (currentVerEl) {

            currentVerEl.textContent = `Current: v${APP_CURRENT_VERSION}`;

        }



        const info = await fetchRemoteVersionInfo();

        currentRemoteUpdateInfo = info;



        const latestCode = info.latestVersionCode || 0;

        const minRequiredCode = info.minRequiredVersionCode || 0;

        const semverDiff = compareSemanticVersions(info.latestVersion, APP_CURRENT_VERSION);



        // Required / Mandatory condition:

        // - App version code is strictly below the minimum required version code, OR

        // - isMandatory flag is explicitly true

        const isMandatory = (APP_VERSION_CODE < minRequiredCode) || (info.isMandatory === true);

        const hasNewerVersion = (latestCode > APP_VERSION_CODE) || (semverDiff > 0) || isMandatory;



        if (hasNewerVersion) {

            // Optional update cooldown check for non-manual checks

            if (!isManual && !isMandatory) {

                const lastDismissed = localStorage.getItem('periodica_update_dismissed_time');

                const cooldownMs = (window.AppConfig?.updates?.dismissedCooldownHours || 24) * 3600 * 1000;

                if (lastDismissed && (Date.now() - parseInt(lastDismissed, 10) < cooldownMs)) {

                    console.log('[AppUpdate] Optional update prompt in cooldown. Skipping automatic modal.');

                    return;

                }

            }



            window.isAppUpdateMandatory = isMandatory;

            window.isAppUpdateActive = true;



            if (latestVerEl) {

                latestVerEl.textContent = `New: v${info.latestVersion}`;

            }



            // Populate dynamic changelog

            if (changelogList && Array.isArray(info.changelog)) {

                changelogList.innerHTML = info.changelog.map(item => `<li>${escapeHtml(item)}</li>`).join('');

            }



            // Update Metadata info

            const metaBadge = document.getElementById('update-meta-badge');

            if (metaBadge) {

                const parts = [];

                if (info.downloadSize) parts.push(`📦 ${info.downloadSize}`);

                if (info.releaseDate) parts.push(`📅 ${info.releaseDate}`);

                metaBadge.textContent = parts.join('  •  ');

                metaBadge.style.display = parts.length ? 'block' : 'none';

            }



            if (isMandatory) {

                // MANDATORY / REQUIRED MODE (Strict Non-Skippable)

                if (updateCard) {

                    updateCard.classList.add('mandatory');

                    updateCard.classList.remove('optional');

                }

                if (iconWrapEl) iconWrapEl.textContent = '🚨';

                if (titleEl) titleEl.textContent = 'Critical Update Required';

                if (warningEl) {

                    warningEl.style.display = 'block';

                    warningEl.innerHTML = '⚠️ <strong>Mandatory Update:</strong> You must update Periodica 3D to continue accessing quantum calculations and online chemistry services.';

                }

                if (descEl) {

                    descEl.textContent = `A critical update (v${info.latestVersion}) has been released with required security and structural formula improvements.`;

                }

                // Strictly hide all dismissal controls

                if (dismissBtn) dismissBtn.style.display = 'none';

                if (closeBtn) closeBtn.style.display = 'none';

                if (storeBtn) {

                    storeBtn.textContent = 'Update Now to Continue 🚀';

                    storeBtn.style.width = '100%';

                }

            } else {

                // OPTIONAL MODE (Flexible / Recommended)

                if (updateCard) {

                    updateCard.classList.add('optional');

                    updateCard.classList.remove('mandatory');

                }

                if (iconWrapEl) iconWrapEl.textContent = '🚀';

                if (titleEl) titleEl.textContent = 'Update Available';

                if (warningEl) warningEl.style.display = 'none';

                if (descEl) {

                    descEl.textContent = `Periodica 3D v${info.latestVersion} is available with new interactive features and performance optimizations.`;

                }

                // Show dismissal controls

                if (dismissBtn) {

                    dismissBtn.style.display = 'block';

                    dismissBtn.textContent = 'Later';

                }

                if (closeBtn) closeBtn.style.display = 'block';

                if (storeBtn) {

                    storeBtn.textContent = 'Update Now 🚀';

                    storeBtn.style.width = 'auto';

                }

            }



            // Hide native slider so it doesn't bleed through modal

            if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {

                window.PeriodicaNativeSlider.setVisibility(false);

            }



            if (updateModal) {

                updateModal.style.display = 'flex';

            }



            // Dispatch native push / local notification

            if (window.NativeServices?.Notifications?.sendUpdateNotification) {

                window.NativeServices.Notifications.sendUpdateNotification(info, isMandatory);

            }

        } else if (isManual) {

            const toast = document.createElement('div');

            toast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1px solid #00d4ff; color:#e2e8f0; font-family:var(--font-ui); font-size:0.85rem; padding:10px 20px; border-radius:24px; z-index:999999; box-shadow:0 4px 25px rgba(0,212,255,0.4); text-align:center;';

            toast.innerHTML = `✨ You are on the latest version of Periodica 3D (<strong>v${APP_CURRENT_VERSION}</strong>)!`;

            document.body.appendChild(toast);

            setTimeout(() => {

                toast.style.transition = 'opacity 0.4s ease';

                toast.style.opacity = '0';

                setTimeout(() => toast.remove(), 400);

            }, 2500);

        }

    } catch (err) {

        console.warn('[AppUpdate] Update check failed:', err);

        if (isManual) {

            alert(`You are running Periodica 3D v${APP_CURRENT_VERSION}.`);

        }

    }

}

window.checkAppUpdates = checkAppUpdates;



function openAppStoreForUpdate() {

    const playUrl = currentRemoteUpdateInfo?.playStoreUrl || 'market://details?id=com.periodica.app';

    const fallbackUrl = currentRemoteUpdateInfo?.fallbackUrl || 'https://play.google.com/store/apps/details?id=com.periodica.app';

    

    try {

        // Try opening market:// link directly on Android

        window.open(playUrl, '_system');

    } catch (e) {

        window.open(fallbackUrl, '_system');

    }



    // Only close if update is not mandatory

    if (!window.isAppUpdateMandatory) {

        closeAppUpdateModal();

    }

}

window.openAppStoreForUpdate = openAppStoreForUpdate;



function dismissAppUpdate() {

    if (window.isAppUpdateMandatory) {

        const warningToast = document.createElement('div');

        warningToast.style.cssText = 'position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(239,68,68,0.95); border:1px solid #ef4444; color:#fff; font-family:var(--font-ui); font-size:0.85rem; padding:10px 20px; border-radius:24px; z-index:999999; box-shadow:0 4px 25px rgba(239,68,68,0.5); text-align:center;';

        warningToast.textContent = '⚠️ This update is required to continue using Periodica 3D.';

        document.body.appendChild(warningToast);

        setTimeout(() => {

            warningToast.style.transition = 'opacity 0.3s ease';

            warningToast.style.opacity = '0';

            setTimeout(() => warningToast.remove(), 300);

        }, 2200);

        return;

    }

    localStorage.setItem('periodica_update_dismissed_time', Date.now().toString());

    closeAppUpdateModal();

}

window.dismissAppUpdate = dismissAppUpdate;



function closeAppUpdateModal() {

    if (window.isAppUpdateMandatory) {

        return; // Non-dismissible

    }

    const modal = document.getElementById('app-update-modal');

    if (modal) modal.style.display = 'none';

    window.isAppUpdateActive = false;



    if (typeof syncNativeSliderVisibility === 'function') {

        syncNativeSliderVisibility();

    }

}

window.closeAppUpdateModal = closeAppUpdateModal;



// Developer Test Function: Simulate Required or Optional Update

window.testAppUpdate = function(isMandatory = false) {

    const mockInfo = {

        latestVersion: isMandatory ? '5.0.0' : '4.3.0',

        latestVersionCode: isMandatory ? 5000 : 4300,

        minRequiredVersionCode: isMandatory ? 4500 : 4200,

        isMandatory: isMandatory,

        releaseDate: 'September 2026',

        downloadSize: '~14.2 MB',

        changelog: isMandatory ? [

            'CRITICAL: Quantum mechanics backend upgrade',

            'Required security patches and schema synchronisation',

            'Full compliance with IUPAC standard isotope table'

        ] : [

            'Direct Multi-Unit Temperature Converter (K, °C, °F)',

            'High-Precision 3D Electron Density & Orbital Slice Visualizer',

            'Instant zero-latency table rendering optimizations'

        ],

        playStoreUrl: 'market://details?id=com.periodica.app',

        fallbackUrl: 'https://play.google.com/store/apps/details?id=com.periodica.app'

    };



    currentRemoteUpdateInfo = mockInfo;

    const updateModal = document.getElementById('app-update-modal');

    const updateCard = updateModal?.querySelector('.app-update-modal-card');

    const currentVerEl = document.getElementById('update-current-ver');

    const latestVerEl = document.getElementById('update-latest-ver');

    const descEl = document.getElementById('update-modal-desc');

    const warningEl = document.getElementById('update-mandatory-warning');

    const dismissBtn = document.getElementById('update-dismiss-btn');

    const closeBtn = document.getElementById('update-modal-close-btn');

    const titleEl = document.getElementById('update-modal-title');

    const iconWrapEl = updateModal?.querySelector('.app-update-icon-wrap');

    const changelogList = document.getElementById('update-changelog-list');

    const storeBtn = document.getElementById('update-store-action-btn') || updateModal?.querySelector('.update-btn-store');



    window.isAppUpdateMandatory = isMandatory;

    window.isAppUpdateActive = true;



    if (currentVerEl) currentVerEl.textContent = `Current: v${APP_CURRENT_VERSION}`;

    if (latestVerEl) latestVerEl.textContent = `New: v${mockInfo.latestVersion}`;

    if (changelogList) {

        changelogList.innerHTML = mockInfo.changelog.map(item => `<li>${escapeHtml(item)}</li>`).join('');

    }



    const metaBadge = document.getElementById('update-meta-badge');

    if (metaBadge) {

        metaBadge.textContent = `📦 ${mockInfo.downloadSize}  •  📅 ${mockInfo.releaseDate}`;

        metaBadge.style.display = 'block';

    }



    if (isMandatory) {

        if (updateCard) {

            updateCard.classList.add('mandatory');

            updateCard.classList.remove('optional');

        }

        if (iconWrapEl) iconWrapEl.textContent = '🚨';

        if (titleEl) titleEl.textContent = 'Critical Update Required';

        if (warningEl) {

            warningEl.style.display = 'block';

            warningEl.innerHTML = '⚠️ <strong>Mandatory Update:</strong> You must update Periodica 3D to continue accessing quantum calculations and online chemistry services.';

        }

        if (descEl) descEl.textContent = 'A mandatory update is required to continue enjoying all Periodica 3D features and online services.';

        if (dismissBtn) dismissBtn.style.display = 'none';

        if (closeBtn) closeBtn.style.display = 'none';

        if (storeBtn) {

            storeBtn.textContent = 'Update Now to Continue 🚀';

            storeBtn.style.width = '100%';

        }

    } else {

        if (updateCard) {

            updateCard.classList.add('optional');

            updateCard.classList.remove('mandatory');

        }

        if (iconWrapEl) iconWrapEl.textContent = '🚀';

        if (titleEl) titleEl.textContent = 'Update Available';

        if (warningEl) warningEl.style.display = 'none';

        if (descEl) descEl.textContent = 'A new version of Periodica 3D is available with performance improvements and new interactive chemistry features!';

        if (dismissBtn) {

            dismissBtn.style.display = 'block';

            dismissBtn.textContent = 'Later';

        }

        if (closeBtn) closeBtn.style.display = 'block';

        if (storeBtn) {

            storeBtn.textContent = 'Update Now 🚀';

            storeBtn.style.width = 'auto';

        }

    }



    if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {

        window.PeriodicaNativeSlider.setVisibility(false);

    }

    if (updateModal) updateModal.style.display = 'flex';



    if (window.NativeServices?.Notifications?.sendUpdateNotification) {

        window.NativeServices.Notifications.sendUpdateNotification(mockInfo, isMandatory);

    }

    console.log(`[AppUpdate] Simulated ${isMandatory ? 'MANDATORY' : 'OPTIONAL'} update triggered.`);

};



// Trap Escape key for mandatory updates

window.addEventListener('keydown', (e) => {

    if (e.key === 'Escape' && window.isAppUpdateMandatory) {

        e.preventDefault();

        e.stopPropagation();

    }

});



// Splash Screen Failsafe Dismiss & Background Update Check on Startup

window.addEventListener('DOMContentLoaded', () => {

    initModalSliderObserver();

    syncNativeSliderVisibility();



    setTimeout(() => {

        if (typeof window.dismissSplashScreen === 'function') {

            window.dismissSplashScreen();

        }

        syncNativeSliderVisibility();

    }, 300);



    setTimeout(() => {

        syncNativeSliderVisibility();

    }, 800);



    // Automatic Startup Update Check

    setTimeout(() => {

        if (window.AppConfig?.features?.enableAppUpdates !== false) {

            checkAppUpdates(false);

        }

    }, window.AppConfig?.updates?.startupCheckDelayMs || 2500);

});



