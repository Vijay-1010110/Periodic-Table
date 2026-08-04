/**
 * 11_compare.js
 * Element Side-by-Side Comparison Tool & Radar Chart Visualizer
 */

let selectedCompareElements = [1, 6]; // Default: Hydrogen (1) and Carbon (6)

function initCompareView() {
    setupCompareUI();
    renderCompareControls();
    renderComparison();
}

function setupCompareUI() {
    const sel1 = document.getElementById('compare-select-1');
    const sel2 = document.getElementById('compare-select-2');
    const sel3 = document.getElementById('compare-select-3');

    if (sel1 && sel2 && sel3 && typeof elementsData !== 'undefined') {
        populateElementDropdown(sel1, selectedCompareElements[0]);
        populateElementDropdown(sel2, selectedCompareElements[1]);
        populateElementDropdown(sel3, selectedCompareElements[2] || 0);

        sel1.onchange = (e) => {
            selectedCompareElements[0] = parseInt(e.target.value, 10);
            renderComparison();
        };
        sel2.onchange = (e) => {
            selectedCompareElements[1] = parseInt(e.target.value, 10);
            renderComparison();
        };
        sel3.onchange = (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) selectedCompareElements[2] = val;
            else selectedCompareElements.splice(2, 1);
            renderComparison();
        };
    }
}

function populateElementDropdown(selectEl, selectedZ) {
    selectEl.innerHTML = '<option value="0">-- None --</option>';
    elementsData.forEach(el => {
        const opt = document.createElement('option');
        opt.value = el.atomicNumber;
        opt.textContent = `Atomic No. ${el.atomicNumber} - ${el.name} (${el.symbol})`;
        if (el.atomicNumber === selectedZ) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function renderCompareControls() {
    // Quick preset buttons
    const presetContainer = document.getElementById('compare-presets');
    if (!containerPreset(presetContainer)) return;

    const presets = [
        { label: 'H vs He (Period 1)', z: [1, 2] },
        { label: 'Li vs Na vs K (Alkali Metals)', z: [3, 11, 19] },
        { label: 'C vs Si (Group 14)', z: [6, 14] },
        { label: 'F vs Cl vs Br (Halogens)', z: [9, 17, 35] },
        { label: 'Fe vs Cu vs Au (Metals)', z: [26, 29, 79] }
    ];

    presetContainer.innerHTML = '';
    presets.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'compare-preset-btn';
        btn.textContent = p.label;
        btn.onclick = () => {
            selectedCompareElements = [...p.z];
            const sel1 = document.getElementById('compare-select-1');
            const sel2 = document.getElementById('compare-select-2');
            const sel3 = document.getElementById('compare-select-3');
            if (sel1) sel1.value = p.z[0] || 0;
            if (sel2) sel2.value = p.z[1] || 0;
            if (sel3) sel3.value = p.z[2] || 0;
            renderComparison();
        };
        presetContainer.appendChild(btn);
    });
}

function containerPreset(c) { return !!c; }

function renderComparison() {
    const list = selectedCompareElements.map(z => elementsData[z - 1]).filter(Boolean);
    if (list.length === 0) return;

    // Render Cards
    const cardsContainer = document.getElementById('compare-cards-header');
    if (cardsContainer) {
        cardsContainer.innerHTML = list.map(el => `
            <div class="compare-card-head" style="border-top: 3px solid ${getCategoryColor(el.category)}; background: ${getGlossyBackground(getCategoryColor(el.category), el.category)}; box-shadow: inset 0 0 20px rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3); border-radius: 12px; padding: 20px 15px;">
                <span class="compare-z">${el.atomicNumber}</span>
                <span class="compare-symbol">${el.symbol}</span>
                <div class="compare-name">${el.name}</div>
                <div class="compare-cat">${el.category}</div>
            </div>
        `).join('');
    }

    // Render Properties Table
    const tableContainer = document.getElementById('compare-table-body');
    if (tableContainer) {
        const props = [
            { key: 'atomicMass', label: 'Atomic Mass', unit: 'u' },
            { key: 'electronegativity', label: 'Electronegativity (Pauling)', unit: '' },
            { key: 'density', label: 'Density (STP)', unit: 'g/cm³' },
            { key: 'meltingPoint', label: 'Melting Point', unit: 'K' },
            { key: 'boilingPoint', label: 'Boiling Point', unit: 'K' },
            { key: 'ionizationEnergy', label: '1st Ionization Energy', unit: 'kJ/mol' },
            { key: 'atomicRadius', label: 'Atomic Radius', unit: 'pm' }
        ];

        tableContainer.innerHTML = props.map(p => `
            <div class="compare-row">
                <div class="compare-row-label">${p.label}</div>
                <div class="compare-row-values">
                    ${list.map(el => `
                        <div class="compare-val-cell">
                            <span class="val">${el[p.key] !== null && el[p.key] !== undefined ? el[p.key] : '-'}</span>
                            <span class="unit">${p.unit}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Render Radar / Spider Chart
    renderRadarChart(list);
}

function renderRadarChart(list) {
    const container = document.getElementById('compare-radar-container');
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = 300;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 40;

    const axes = [
        { key: 'atomicMass', label: 'Mass', max: 250 },
        { key: 'electronegativity', label: 'Electronegativity', max: 4.0 },
        { key: 'density', label: 'Density', max: 20 },
        { key: 'ionizationEnergy', label: 'Ionization', max: 2400 },
        { key: 'atomicRadius', label: 'Radius', max: 300 }
    ];

    const numAxes = axes.length;
    const colors = ['#00d4ff', '#facc15', '#c084fc'];

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // Draw Grid Webs
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(level => {
        const pts = [];
        for (let i = 0; i < numAxes; i++) {
            const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
            const r = radius * level;
            pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        svgHtml += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />`;
    });

    // Draw Axes Lines & Labels
    axes.forEach((axis, i) => {
        const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
        const ax = cx + radius * Math.cos(angle);
        const ay = cy + radius * Math.sin(angle);
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 20) * Math.sin(angle);

        svgHtml += `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />`;
        svgHtml += `<text x="${lx}" y="${ly}" fill="rgba(255,255,255,0.7)" font-size="11" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>`;
    });

    // Draw Element Polygons
    list.forEach((el, elIdx) => {
        const pts = [];
        axes.forEach((axis, i) => {
            const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
            const rawVal = parseFloat(el[axis.key]) || 0;
            const normVal = Math.min(Math.max(rawVal / axis.max, 0.05), 1.0);
            const r = radius * normVal;
            pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        });

        const color = colors[elIdx % colors.length];
        svgHtml += `<polygon points="${pts.join(' ')}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2" />`;
        
        // Draw Dots
        pts.forEach(pt => {
            const [px, py] = pt.split(',');
            svgHtml += `<circle cx="${px}" cy="${py}" r="4" fill="${color}" />`;
        });
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
}

function getCategoryColor(cat) {
    if (!cat) return '#94a3b8';
    if (cat.includes('alkali')) return '#f87171';
    if (cat.includes('alkaline')) return '#fb923c';
    if (cat.includes('transition')) return '#facc15';
    if (cat.includes('lanthanide')) return '#a3e635';
    if (cat.includes('actinide')) return '#34d399';
    if (cat.includes('metalloid')) return '#2dd4bf';
    if (cat.includes('nonmetal')) return '#38bdf8';
    if (cat.includes('halogen')) return '#818cf8';
    if (cat.includes('noble')) return '#c084fc';
    return '#94a3b8';
}
