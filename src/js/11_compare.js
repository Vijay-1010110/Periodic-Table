/**
 * 11_compare.js
 * Element Side-by-Side Comparison Tool & Radar Chart Visualizer
 */

let selectedCompareElements = [1, 6]; // Default: Hydrogen (1) and Carbon (6)
let compareViewInitialized = false;

// Table category colors mapping aligned with main periodic table
function getCompareCategoryColor(category) {
    if (!category) return '#64748b';
    if (typeof categoryColors !== 'undefined') {
        const norm = (typeof normalizeCategory === 'function') ? normalizeCategory(category) : category;
        if (categoryColors[norm]) return categoryColors[norm];
        if (categoryColors[category]) return categoryColors[category];
    }
    const c = category.toLowerCase();
    if (c.includes('alkali') && !c.includes('earth')) return '#ef4444'; // Red
    if (c.includes('alkaline') || c.includes('earth')) return '#f97316'; // Orange
    if (c.includes('transition')) return '#6366f1'; // Indigo
    if (c.includes('post-transition')) return '#0284c7'; // Steel blue
    if (c.includes('metalloid')) return '#eab308'; // Canary yellow
    if (c.includes('halogen')) return '#14b8a6'; // Teal
    if (c.includes('noble')) return '#06b6d4'; // Cyan
    if (c.includes('lanthanide')) return '#ec4899'; // Hot pink
    if (c.includes('actinide')) return '#a855f7'; // Deep violet
    if (c.includes('nonmetal')) return '#22c55e'; // Green
    return '#64748b';
}

const compareBlockColors = {
    's': '#00f0ff',
    'p': '#22c55e',
    'd': '#6366f1',
    'f': '#ec4899'
};

function getCompareGlossyBg(catColor, category) {
    if (typeof getGlossyBackground === 'function') {
        return getGlossyBackground(catColor, category);
    }
    return `linear-gradient(135deg, ${hexToRgbaLocal(catColor, 0.75)} 0%, ${hexToRgbaLocal(catColor, 0.25)} 60%, rgba(9, 14, 26, 0.95) 100%)`;
}

function getComparePropertyValue(el, key) {
    if (!el) return '-';
    if (key === 'density') {
        if (typeof el.density === 'object' && el.density !== null) {
            return (el.density.stp !== null && el.density.stp !== undefined) ? el.density.stp : (el.density.liquid ?? '-');
        }
        return el.density ?? '-';
    }
    const val = el[key];
    if (val === null || val === undefined) return '-';
    return val;
}

function initCompareView() {
    if (!compareViewInitialized) {
        setupCompareUI();
        renderCompareControls();
        renderComparison();
        compareViewInitialized = true;
    }
}

function setupCompareUI() {
    const sel1 = document.getElementById('compare-select-1');
    const sel2 = document.getElementById('compare-select-2');
    const sel3 = document.getElementById('compare-select-3');

    if (sel1 && sel2 && sel3 && typeof elementsData !== 'undefined') {
        populateElementDropdown(sel1, selectedCompareElements[0]);
        populateElementDropdown(sel2, selectedCompareElements[1]);
        populateElementDropdown(sel3, selectedCompareElements[2] || 0);
        updateCompareTriggers();

        sel1.onchange = (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) selectedCompareElements[0] = val;
            else selectedCompareElements.splice(0, 1);
            syncCompareDropdowns();
            renderComparison();
        };
        sel2.onchange = (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) {
                if (selectedCompareElements.length === 0) selectedCompareElements[0] = val;
                else selectedCompareElements[1] = val;
            } else {
                if (selectedCompareElements.length > 1) selectedCompareElements.splice(1, 1);
            }
            syncCompareDropdowns();
            renderComparison();
        };
        sel3.onchange = (e) => {
            const val = parseInt(e.target.value, 10);
            if (val > 0) {
                selectedCompareElements[2] = val;
            } else {
                if (selectedCompareElements.length > 2) selectedCompareElements.splice(2, 1);
            }
            syncCompareDropdowns();
            renderComparison();
        };

        const radarBtn = document.getElementById('btn-toggle-radar');
        if (radarBtn) {
            radarBtn.onclick = () => {
                const sb = document.getElementById('compare-sidebar');
                if (sb) {
                    const isOpen = sb.classList.contains('mobile-active');
                    if (isOpen) {
                        sb.classList.remove('open', 'mobile-active');
                    } else {
                        sb.classList.add('open', 'mobile-active', 'pos-right');
                        const list = selectedCompareElements.map(z => elementsData[z - 1]).filter(Boolean);
                        renderRadarChart(list);
                    }
                }
            };
        }
    }
}

let activePickerSlot = 0;
let activePickerCategory = 'All';
let activePickerSearch = '';

function updateCompareTriggers() {
    for (let i = 0; i < 3; i++) {
        const trigger = document.getElementById(`compare-trigger-${i + 1}`);
        if (!trigger) continue;
        const z = selectedCompareElements[i];
        const el = (z && typeof elementsData !== 'undefined') ? elementsData[z - 1] : null;
        if (el) {
            const catColor = getCompareCategoryColor(el.category);
            trigger.innerHTML = `
                <div class="compare-select-trigger-content">
                    <span class="compare-trigger-z" style="border: 1px solid ${catColor}; color: #ffffff; background: rgba(0,0,0,0.6);">${el.atomicNumber}</span>
                    <span class="compare-trigger-sym" style="color: #ffffff; text-shadow: 0 0 10px ${catColor};">${el.symbol}</span>
                    <div class="compare-trigger-info">
                        <span class="compare-trigger-name">${el.name}</span>
                        <span class="compare-trigger-cat" style="color: ${hexToRgbaLocal(catColor, 0.95)};">${el.category}</span>
                    </div>
                </div>
                <span class="compare-trigger-chevron">▼</span>
            `;
            trigger.style.borderColor = catColor;
            trigger.style.boxShadow = `0 0 14px ${hexToRgbaLocal(catColor, 0.35)}`;
        } else {
            trigger.innerHTML = `
                <div class="compare-select-trigger-content is-empty">
                    <span class="compare-trigger-empty-icon">+</span>
                    <span class="compare-trigger-placeholder">Select Element ${i + 1}${i === 2 ? ' (Optional)' : ''}...</span>
                </div>
                <span class="compare-trigger-chevron">▼</span>
            `;
            trigger.style.borderColor = 'rgba(0, 212, 255, 0.45)';
            trigger.style.boxShadow = 'none';
        }
    }
}
window.updateCompareTriggers = updateCompareTriggers;

function syncCompareDropdowns() {
    const sel1 = document.getElementById('compare-select-1');
    const sel2 = document.getElementById('compare-select-2');
    const sel3 = document.getElementById('compare-select-3');
    if (sel1) sel1.value = selectedCompareElements[0] || 0;
    if (sel2) sel2.value = selectedCompareElements[1] || 0;
    if (sel3) sel3.value = selectedCompareElements[2] || 0;
    updateCompareTriggers();
}

function removeCompareElement(z) {
    const idx = selectedCompareElements.indexOf(z);
    if (idx !== -1) {
        selectedCompareElements.splice(idx, 1);
    }
    syncCompareDropdowns();
    renderComparison();
}
window.removeCompareElement = removeCompareElement;

function clearAllCompareElements() {
    selectedCompareElements = [];
    syncCompareDropdowns();
    renderComparison();
}
window.clearAllCompareElements = clearAllCompareElements;

function focusNextCompareSelect() {
    if (!selectedCompareElements[0]) {
        openCompareElementPicker(0);
    } else if (!selectedCompareElements[1]) {
        openCompareElementPicker(1);
    } else {
        openCompareElementPicker(2);
    }
}
window.focusNextCompareSelect = focusNextCompareSelect;

function openCompareElementPicker(slotIndex) {
    activePickerSlot = slotIndex;
    const modal = document.getElementById('compare-element-picker-modal');
    if (!modal) return;

    const badge = document.getElementById('compare-picker-slot-badge');
    if (badge) {
        badge.textContent = `Slot ${slotIndex + 1}`;
    }

    activePickerSearch = '';
    activePickerCategory = 'All';
    const searchInput = document.getElementById('compare-picker-search');
    if (searchInput) searchInput.value = '';

    renderPickerCategoryPills();
    renderPickerElementsGrid();

    modal.classList.add('active');
    if (searchInput) {
        setTimeout(() => searchInput.focus(), 150);
    }
}
window.openCompareElementPicker = openCompareElementPicker;

function closeCompareElementPicker() {
    const modal = document.getElementById('compare-element-picker-modal');
    if (modal) modal.classList.remove('active');
}
window.closeCompareElementPicker = closeCompareElementPicker;

function clearCurrentPickerSlot() {
    if (activePickerSlot < selectedCompareElements.length) {
        selectedCompareElements.splice(activePickerSlot, 1);
    }
    closeCompareElementPicker();
    syncCompareDropdowns();
    renderComparison();
}
window.clearCurrentPickerSlot = clearCurrentPickerSlot;

function selectComparePickerElement(z) {
    if (activePickerSlot >= selectedCompareElements.length) {
        selectedCompareElements.push(z);
    } else {
        selectedCompareElements[activePickerSlot] = z;
    }
    selectedCompareElements = [...new Set(selectedCompareElements)].filter(Boolean);
    closeCompareElementPicker();
    syncCompareDropdowns();
    renderComparison();
}
window.selectComparePickerElement = selectComparePickerElement;

const comparePickerCategories = [
    'All',
    'Alkali metal',
    'Alkaline earth metal',
    'Transition metal',
    'Post-transition metal',
    'Metalloid',
    'Other nonmetal',
    'Halogen',
    'Noble gas',
    'Lanthanide',
    'Actinide'
];

function renderPickerCategoryPills() {
    const pillsContainer = document.getElementById('compare-picker-cat-pills');
    if (!pillsContainer) return;
    pillsContainer.innerHTML = comparePickerCategories.map(cat => {
        const isActive = activePickerCategory === cat;
        const catColor = cat === 'All' ? '#00d4ff' : getCompareCategoryColor(cat);
        const style = isActive
            ? `background: ${hexToRgbaLocal(catColor, 0.25)}; border: 1.5px solid ${catColor}; color: ${catColor}; box-shadow: 0 0 10px ${hexToRgbaLocal(catColor, 0.4)};`
            : `border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7);`;
        return `<button type="button" class="compare-picker-pill ${isActive ? 'active' : ''}" style="${style}" onclick="setPickerCategory('${cat}')">${cat}</button>`;
    }).join('');
}
window.setPickerCategory = function(cat) {
    activePickerCategory = cat;
    renderPickerCategoryPills();
    renderPickerElementsGrid();
};

function filterComparePickerElements() {
    const input = document.getElementById('compare-picker-search');
    activePickerSearch = input ? input.value.trim().toLowerCase() : '';
    renderPickerElementsGrid();
}
window.filterComparePickerElements = filterComparePickerElements;

function clearComparePickerSearch() {
    const input = document.getElementById('compare-picker-search');
    if (input) input.value = '';
    activePickerSearch = '';
    renderPickerElementsGrid();
}
window.clearComparePickerSearch = clearComparePickerSearch;

function renderPickerElementsGrid() {
    const grid = document.getElementById('compare-picker-grid');
    if (!grid || typeof elementsData === 'undefined') return;

    const query = activePickerSearch;
    const catFilter = activePickerCategory;
    const currentZ = selectedCompareElements[activePickerSlot] || null;

    const filtered = elementsData.filter(el => {
        if (catFilter !== 'All') {
            const matchesCat = (el.category || '').toLowerCase() === catFilter.toLowerCase() ||
                (catFilter === 'Other nonmetal' && (el.category || '').toLowerCase().includes('nonmetal'));
            if (!matchesCat) return false;
        }
        if (query) {
            const nameMatch = (el.name || '').toLowerCase().includes(query);
            const symMatch = (el.symbol || '').toLowerCase().includes(query);
            const numMatch = String(el.atomicNumber).includes(query);
            if (!nameMatch && !symMatch && !numMatch) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: rgba(255,255,255,0.5);">
                <div style="font-size: 1.8rem; margin-bottom: 6px;">🔍</div>
                <div>No elements found matching "${query}"</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(el => {
        const isSelected = el.atomicNumber === currentZ;
        const isAlreadyInCompare = selectedCompareElements.includes(el.atomicNumber);
        const catColor = getCompareCategoryColor(el.category);
        const blockColor = compareBlockColors[el.block] || '#00d4ff';
        const glossBg = getCompareGlossyBg(catColor, el.category);

        return `
            <div class="compare-picker-tile ${isSelected ? 'is-selected' : ''}"
                 onclick="selectComparePickerElement(${el.atomicNumber})"
                 style="border: 1.5px solid ${catColor}; background: ${glossBg}; box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 10px ${hexToRgbaLocal(catColor, 0.25)};">
                <div class="cpt-top">
                    <span class="cpt-z" style="border: 1px solid ${catColor};">${el.atomicNumber}</span>
                    <span class="cpt-tag" style="${isSelected ? 'background: #22c55e; color: #ffffff; border: 1px solid #22c55e;' : (isAlreadyInCompare ? 'background: rgba(0,212,255,0.25); color: #00d4ff; border: 1px solid rgba(0,212,255,0.5);' : `color: ${blockColor};`)} font-family: var(--font-mono); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; padding: 1px 5px; border-radius: 4px;">${isSelected ? 'Selected' : (isAlreadyInCompare ? 'In Compare' : `${el.block}-block`)}</span>
                </div>
                <div class="cpt-sym" style="color: #ffffff; text-shadow: 0 0 12px ${catColor};">${el.symbol}</div>
                <div class="cpt-name">${el.name}</div>
                <div class="cpt-cat" style="color: ${hexToRgbaLocal(catColor, 0.95)};">${el.category}</div>
            </div>
        `;
    }).join('');
}

function populateElementDropdown(selectEl, selectedZ) {
    selectEl.innerHTML = '<option value="0">-- None / Select Element --</option>';
    elementsData.forEach(el => {
        const opt = document.createElement('option');
        opt.value = el.atomicNumber;
        opt.textContent = `${el.atomicNumber}. ${el.name} (${el.symbol}) • ${el.category}`;
        if (el.atomicNumber === selectedZ) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function renderCompareControls() {
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
            syncCompareDropdowns();
            renderComparison();
        };
        presetContainer.appendChild(btn);
    });
}

function containerPreset(c) { return !!c; }

function renderComparison() {
    const list = selectedCompareElements.map(z => elementsData[z - 1]).filter(Boolean);

    // Render Cards
    const cardsContainer = document.getElementById('compare-cards-header');
    if (cardsContainer) {
        if (list.length === 0) {
            cardsContainer.innerHTML = `
                <div class="compare-empty-state" onclick="focusNextCompareSelect()">
                    <div style="font-size: 2rem; margin-bottom: 6px;">⚖️</div>
                    <div style="font-weight: 700; color: #00d4ff; font-size: 1rem;">No Elements Selected for Comparison</div>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 4px;">Select up to 3 elements from the dropdowns above or tap here to begin.</div>
                </div>
            `;
        } else {
            let cardsHtml = list.map(el => {
                const catColor = getCompareCategoryColor(el.category);
                const blockColor = compareBlockColors[el.block] || '#00d4ff';
                const glossBg = getCompareGlossyBg(catColor, el.category);

                return `
                    <div class="compare-card-head" style="border: 1.5px solid ${catColor}; background: ${glossBg}; box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 16px ${hexToRgbaLocal(catColor, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.25);">
                        <div class="compare-card-top-bar">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="compare-z-badge" style="border: 1px solid ${catColor}; color: #ffffff;">${el.atomicNumber}</span>
                                <span class="compare-block-tag" style="border: 1px solid ${blockColor}; color: ${blockColor}; background: ${hexToRgbaLocal(blockColor, 0.25)};">${el.block}-block</span>
                            </div>
                            <button class="compare-card-remove-btn" onclick="removeCompareElement(${el.atomicNumber})" title="Remove ${el.name} from comparison">&times;</button>
                        </div>
                        <div class="compare-card-center">
                            <div class="compare-symbol" style="color: #ffffff; text-shadow: 0 0 16px ${catColor};">${el.symbol}</div>
                            <div class="compare-name">${el.name}</div>
                            <span class="compare-cat-pill" style="border: 1px solid ${catColor}; color: #ffffff; background: ${hexToRgbaLocal(catColor, 0.35)}; margin: 3px 0;">${el.category}</span>
                            <div class="compare-sub-meta" style="color: ${hexToRgbaLocal(catColor, 0.9)};">${el.atomicMass} u • ${el.phase || 'Solid'}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Add slot if less than 3
            if (list.length < 3) {
                cardsHtml += `
                    <div class="compare-card-add" onclick="focusNextCompareSelect()">
                        <div class="compare-add-icon">+</div>
                        <div class="compare-add-text">Add Element</div>
                        <div class="compare-add-sub">Compare up to 3</div>
                    </div>
                `;
            }
            cardsContainer.innerHTML = cardsHtml;
        }
    }

    // Render Properties Table
    const tableContainer = document.getElementById('compare-table-body');
    if (tableContainer) {
        if (list.length === 0) {
            tableContainer.innerHTML = `<div style="text-align:center; padding: 25px; color: rgba(255,255,255,0.4); font-size: 0.9rem;">Select elements above to compare their physical and chemical properties.</div>`;
        } else {
            const props = [
                { key: 'atomicMass', label: 'Atomic Mass', unit: 'u' },
                { key: 'category', label: 'Series / Category', unit: '' },
                { key: 'block', label: 'Periodic Block', unit: '-block' },
                { key: 'period', label: 'Period', unit: '' },
                { key: 'group', label: 'Group', unit: '' },
                { key: 'electronegativity', label: 'Electronegativity (Pauling)', unit: '' },
                { key: 'density', label: 'Density (STP)', unit: 'g/cm³' },
                { key: 'meltingPoint', label: 'Melting Point', unit: 'K' },
                { key: 'boilingPoint', label: 'Boiling Point', unit: 'K' },
                { key: 'ionizationEnergy', label: '1st Ionization Energy', unit: 'kJ/mol' },
                { key: 'atomicRadius', label: 'Atomic Radius', unit: 'pm' },
                { key: 'oxidationStates', label: 'Oxidation States', unit: '' }
            ];

            tableContainer.innerHTML = props.map(p => `
                <div class="compare-row">
                    <div class="compare-row-label">${p.label}</div>
                    <div class="compare-row-values">
                        ${list.map(el => {
                            const catColor = getCompareCategoryColor(el.category);
                            const val = getComparePropertyValue(el, p.key);
                            return `
                                <div class="compare-val-cell" style="border-left: 3px solid ${catColor};">
                                    <span class="val">${val}</span>
                                    ${p.unit ? `<span class="unit" style="color: ${hexToRgbaLocal(catColor, 0.85)};">${p.unit}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Radar / Spider Chart
    renderRadarChart(list);
}

function renderRadarChart(list) {
    const container = document.getElementById('compare-radar-container');
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `<div style="padding: 40px; text-align: center; color: rgba(255,255,255,0.5); font-size: 0.9rem;">Select elements to view property radar profile.</div>`;
        return;
    }

    const width = container.clientWidth || 340;
    const height = 280;
    const cx = width / 2;
    const cy = (height / 2) - 10;
    const radius = Math.min(cx, cy) - 36;

    const axes = [
        { key: 'atomicMass', label: 'Mass', max: 250 },
        { key: 'electronegativity', label: 'Electronegativity', max: 4.0 },
        { key: 'density', label: 'Density', max: 20 },
        { key: 'ionizationEnergy', label: 'Ionization', max: 2400 },
        { key: 'atomicRadius', label: 'Radius', max: 300 }
    ];

    const numAxes = axes.length;

    let svgHtml = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // Draw Grid Webs
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach(level => {
        const pts = [];
        for (let i = 0; i < numAxes; i++) {
            const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
            const r = radius * level;
            pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        svgHtml += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;
    });

    // Draw Axes Lines & Labels
    axes.forEach((axis, i) => {
        const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
        const ax = cx + radius * Math.cos(angle);
        const ay = cy + radius * Math.sin(angle);
        const lx = cx + (radius + 20) * Math.cos(angle);
        const ly = cy + (radius + 20) * Math.sin(angle);

        svgHtml += `<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />`;
        svgHtml += `<text x="${lx}" y="${ly}" fill="rgba(255,255,255,0.75)" font-size="10" font-family="sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>`;
    });

    // Draw Element Polygons using true table category colors!
    list.forEach((el) => {
        const catColor = getCompareCategoryColor(el.category);
        const pts = [];
        axes.forEach((axis, i) => {
            const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
            let rawVal = 0;
            if (axis.key === 'density') {
                if (typeof el.density === 'object' && el.density !== null) {
                    rawVal = el.density.stp ?? el.density.liquid ?? 0;
                } else {
                    rawVal = el.density ?? 0;
                }
            } else {
                rawVal = el[axis.key] ?? 0;
            }
            rawVal = parseFloat(rawVal) || 0;
            const normVal = Math.min(Math.max(rawVal / axis.max, 0.05), 1.0);
            const r = radius * normVal;
            pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        });

        svgHtml += `<polygon points="${pts.join(' ')}" fill="${hexToRgbaLocal(catColor, 0.28)}" stroke="${catColor}" stroke-width="2.5" />`;
        
        // Draw Dots
        pts.forEach(pt => {
            const [px, py] = pt.split(',');
            svgHtml += `<circle cx="${px}" cy="${py}" r="4.5" fill="${catColor}" stroke="#ffffff" stroke-width="1.5" />`;
        });
    });

    svgHtml += `</svg>`;

    // Add Legend underneath radar chart
    let legendHtml = `
        <div class="compare-radar-legend" style="display:flex; flex-direction:row; flex-wrap:wrap; justify-content:center; gap:12px; margin-top: 10px; padding: 6px 10px;">
            ${list.map(el => {
                const color = getCompareCategoryColor(el.category);
                return `
                    <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${color}; box-shadow:0 0 8px ${color}; display:inline-block;"></span>
                        <span style="color:#fff; font-weight:700;">${el.name} (${el.symbol})</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = svgHtml + legendHtml;
}
