/**
 * 05_isotopes.js
 * Handles the logic for the Isotopes interface.
 */

// Global state for isotopes view
let currentIsotopeData = [];
let currentIsotopeIndex = 0;
let currentAtomicNumber = 1;

function isActuallyStable(iso) {
    if (!iso) return false;
    if (iso.decayMode && iso.decayMode !== 'Stable' && iso.decayMode !== '-') return false;
    return !!iso.isStable;
}

function getDecayColor(mode) {
    if (!mode) return '#888888';
    if (mode === 'Stable' || mode === '-') return '#4ade80';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return '#facc15';
    if (mode.includes('B-')) return '#38bdf8';
    if (mode.includes('B+') || mode.includes('EC')) return '#c084fc';
    if (mode.includes('SF')) return '#f87171';
    if (/\bp\b/.test(mode)) return '#fb923c';
    return '#94a3b8';
}

function getDecayCompactTag(mode, isStable) {
    if (isStable || !mode || mode === 'Stable' || mode === '-') return 'STABLE';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return 'α';
    if (mode.includes('B-') || mode.includes('2B-')) return 'β⁻';
    if (mode.includes('B+') || mode.includes('EC')) return 'β⁺/EC';
    if (mode.includes('SF')) return 'SF';
    if (/\bp\b/.test(mode)) return 'p⁺';
    if (/\bn\b/.test(mode)) return 'n⁰';
    return mode.split(' ')[0] || 'DEC';
}

function getDecayModeLabel(mode, isStable) {
    if (isStable || !mode || mode === 'Stable' || mode === '-') return 'STABLE';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return 'α ALPHA';
    if (mode.includes('B-') || mode.includes('2B-')) return 'β⁻ BETA-';
    if (mode.includes('B+') || mode.includes('EC')) return 'β⁺/EC';
    if (mode.includes('SF')) return 'SF FISSION';
    if (/\bp\b/.test(mode)) return 'p PROTON';
    if (/\bn\b/.test(mode)) return 'n NEUTRON';
    return mode.split(' ')[0] || 'UNSTABLE';
}

function formatCompactHalfLife(iso) {
    if (isActuallyStable(iso)) return 'Stable';
    if (!iso.halfLife) return 'Unstable';
    const val = iso.halfLife;
    let unit = iso.halfLifeUnit || '';
    
    unit = unit.replace('billion years', 'B yr')
               .replace('billion year', 'B yr')
               .replace('million years', 'M yr')
               .replace('million year', 'M yr')
               .replace('Gyears', 'B yr')
               .replace('Gyear', 'B yr')
               .replace('Myears', 'M yr')
               .replace('Myear', 'M yr')
               .replace('kyears', 'k yr')
               .replace('kyear', 'k yr')
               .replace('years', 'yr')
               .replace('year', 'yr')
               .replace('days', 'd')
               .replace('day', 'd')
               .replace('hours', 'h')
               .replace('hour', 'h')
               .replace('minutes', 'm')
               .replace('minute', 'm')
               .replace('seconds', 's')
               .replace('second', 's')
               .replace('msec', 'ms')
               .replace('usec', 'μs')
               .replace('nsec', 'ns');
               
    const numStr = val % 1 === 0 ? val.toString() : (val >= 100 ? val.toFixed(0) : (val >= 10 ? val.toFixed(1) : val.toFixed(2).replace(/\.?0+$/, '')));
    return `${numStr} ${unit}`;
}

/**
 * Main update function called when an element is selected
 * or when switching to the isotopes view.
 */
function updateIsotopesView(atomicNumber) {
    if (!atomicNumber || atomicNumber < 1 || atomicNumber > 118) return;
    
    currentAtomicNumber = atomicNumber;
    
    // Retrieve element info from 01_data.js
    const elData = elementsData[atomicNumber - 1];
    if (!elData) return;
    
    // Retrieve isotope data
    if (typeof isotopeData !== 'undefined' && isotopeData[atomicNumber]) {
        const legendContainer = document.getElementById('modal-decay-legend');
        if (legendContainer && legendContainer.children.length === 0) {
            const legendModes = [
                { name: 'Stable', shortName: 'Stable', color: '#4ade80' },
                { name: 'α Alpha', shortName: 'α', color: '#facc15' },
                { name: 'β⁻ Beta-', shortName: 'β⁻', color: '#38bdf8' },
                { name: 'β⁺ / EC', shortName: 'β⁺', color: '#c084fc' },
                { name: 'SF Fission', shortName: 'SF', color: '#f87171' },
                { name: 'p Proton', shortName: 'p', color: '#fb923c' },
                { name: 'n Neutron', shortName: 'n', color: '#2dd4bf' }
            ];
            
            window.activeIsotopeFilter = null;
            
            legendModes.forEach(mode => {
                const p = document.createElement('div');
                p.className = 'iso-legend-chip';
                p.style.cssText = `position: relative; overflow: hidden; padding: 3px 8px; border-radius: 6px; border: 1px solid ${mode.color}; background: ${getGlossyBackground(mode.color, 'metal')}; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; user-select: none; flex-shrink: 0; white-space: nowrap; font-size: 0.68rem;`;
                p.innerHTML = `<div style="position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%); pointer-events: none; border-radius: 6px 6px 0 0;"></div><span class="chip-text-full" style="position:relative; z-index:1;">${mode.name}</span><span class="chip-text-short" style="position:relative; z-index:1; display:none;">${mode.shortName}</span>`;
                
                const applyFilter = (mode) => {
                    const divM = document.getElementById('iso-div-matched');
                    const divO = document.getElementById('iso-div-other');
                    if (divM) {
                        divM.style.display = 'block';
                        divM.style.color = mode.color;
                        divM.style.borderBottomColor = mode.color;
                        divM.textContent = mode.name;
                    }
                    if (divO) divO.style.display = 'block';

                    document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                        if (el.dataset.decayColor !== mode.color) {
                            el.style.order = '3';
                            el.style.opacity = '0.2';
                        } else {
                            el.style.order = '1';
                            el.style.opacity = '1';
                        }
                    });
                };

                const clearFilter = () => {
                    const divM = document.getElementById('iso-div-matched');
                    const divO = document.getElementById('iso-div-other');
                    if (divM) divM.style.display = 'none';
                    if (divO) divO.style.display = 'none';

                    document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                        el.style.order = '1';
                        el.style.opacity = '1';
                    });
                };

                p.onmouseover = () => {
                    if (window.activeIsotopeFilter) return;
                    applyFilter(mode);
                };
                p.onmouseout = () => {
                    if (window.activeIsotopeFilter) return;
                    clearFilter();
                };
                p.onclick = () => {
                    if (window.activeIsotopeFilter === mode.color) {
                        window.activeIsotopeFilter = null;
                        clearFilter();
                        p.style.transform = 'scale(1)';
                        p.style.boxShadow = 'none';
                    } else {
                        window.activeIsotopeFilter = mode.color;
                        applyFilter(mode);
                        Array.from(legendContainer.children).forEach(l => {
                            l.style.transform = 'scale(1)';
                            l.style.boxShadow = 'none';
                        });
                        p.style.transform = 'scale(1.05)';
                        p.style.boxShadow = `0 0 15px ${mode.color}`;
                    }
                };
                
                legendContainer.appendChild(p);
            });
        }
        
        currentIsotopeData = isotopeData[atomicNumber];
    } else {
        currentIsotopeData = [];
    }
    
    // Sort isotopes: stable first, then by abundance, then by mass
    currentIsotopeData.sort((a, b) => {
        if (a.isStable && !b.isStable) return -1;
        if (!a.isStable && b.isStable) return 1;
        if (a.abundance !== null && b.abundance === null) return -1;
        if (a.abundance === null && b.abundance !== null) return 1;
        if (a.abundance !== null && b.abundance !== null && a.abundance !== b.abundance) {
            return b.abundance - a.abundance;
        }
        return a.massNumber - b.massNumber;
    });
    

    if (currentIsotopeData.length === 0) {
        document.getElementById('modal-isotope-count').textContent = '0 isotopes';
        return;
    }
    
    document.getElementById('modal-isotope-count').textContent = `${currentIsotopeData.length} isotopes`;
    
    // Populate Isotope List in Left Pane
    const listContainer = document.getElementById('modal-isotope-list');
    listContainer.innerHTML = '';
    
    // Create dividers for filtering
    const divMatched = document.createElement('div');
    divMatched.id = 'iso-div-matched';
    divMatched.style.cssText = 'grid-column: 1 / -1; font-family: var(--font-ui); font-size: 0.9rem; font-weight: bold; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.2); margin-bottom: 4px; display: none; order: 0; text-transform: uppercase; letter-spacing: 1px; width: 100%;';
    
    const divOther = document.createElement('div');
    divOther.id = 'iso-div-other';
    divOther.style.cssText = 'grid-column: 1 / -1; font-family: var(--font-ui); font-size: 0.9rem; font-weight: bold; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.2); margin-top: 10px; margin-bottom: 4px; display: none; order: 2; text-transform: uppercase; letter-spacing: 1px; color: #888; width: 100%;';
    divOther.textContent = 'Other Isotopes';

    listContainer.appendChild(divMatched);
    listContainer.appendChild(divOther);
    
    const formatValue = (val) => val !== null && val !== undefined ? val.toFixed(4) : '-';
    const formatExp = (val, dec = 2) => {
        if (val === null || val === undefined) return '-';
        if (Math.abs(val) > 10000 || (Math.abs(val) < 0.001 && val !== 0)) return val.toExponential(dec);
        return val.toFixed(dec);
    };
    
    const catName = getNormalizedCategory(elData.category);
    const catColor = categoryColors[catName] || '#38bdf8';

    currentIsotopeData.forEach((iso, index) => {
        const item = document.createElement('div');
        item.className = 'element-cell iso-element-cell';
        const isStable = isActuallyStable(iso);
        const dColor = getDecayColor(iso.decayMode);
        const indicatorColor = isStable ? '#4ade80' : dColor;
        item.dataset.mainColor = indicatorColor;
        item.dataset.catColor = catColor;
        item.dataset.decayColor = dColor;
        item.dataset.searchKey = `${iso.massNumber} ${elData.symbol}-${iso.massNumber} ${isStable ? 'stable' : ''} ${iso.decayMode || ''}`.toLowerCase();
        
        // Exact same glossy background as periodic table elements
        item.style.background = getGlossyBackground(indicatorColor, catName);
        item.style.borderColor = indicatorColor;
        
        const Z = elData.atomicNumber;
        const decayBadge = getDecayCompactTag(iso.decayMode, isStable);
        const compactHalfLife = formatCompactHalfLife(iso);
        const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#ffffff';

        item.innerHTML = `
            <span class="cell-num">${iso.massNumber}</span>
            <span class="cell-decay-tag" style="border: 1px solid ${indicatorColor}88; color: ${indicatorColor};">${decayBadge}</span>
            <span class="cell-sym" style="color: ${stateColor};">${elData.symbol}</span>
            <span class="cell-name">${elData.name}-${iso.massNumber}</span>
            <span class="cell-value" style="color: #ffffff;">${compactHalfLife}</span>
        `;
        
        item.onmouseenter = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = '#00d4ff';
                item.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.6), 0 8px 18px rgba(0, 212, 255, 0.4), inset 0 0 10px ${indicatorColor}33`;
                item.style.transform = 'scale(1.08) translateY(-2px)';
                item.style.zIndex = '10';
            }
        };
        item.onmouseleave = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = indicatorColor;
                item.style.boxShadow = '';
                item.style.transform = 'none';
                item.style.zIndex = '1';
            }
        };
        
        item.onclick = () => {
            document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                el.classList.remove('selected');
                const mColor = el.dataset.mainColor || 'rgba(255, 255, 255, 0.2)';
                el.style.borderColor = mColor;
                el.style.boxShadow = '';
                el.style.transform = 'none';
                el.style.zIndex = '1';
            });
            item.classList.add('selected');
            item.style.borderColor = '#00d4ff';
            item.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.8), 0 0 22px #00d4ff, inset 0 0 12px rgba(0, 212, 255, 0.3)`;
            item.style.transform = 'scale(1.04)';
            item.style.zIndex = '8';
            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            renderIsotopeDetails(index);
        };
        
        listContainer.appendChild(item);
    });
    
    // Setup Search Filter Input
    const searchInput = document.getElementById('iso-search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = () => {
            const query = searchInput.value.trim().toLowerCase();
            document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                if (!query || el.dataset.searchKey.includes(query)) {
                    el.style.display = 'flex';
                } else {
                    el.style.display = 'none';
                }
            });
        };
    }
    
    // Default select first
    const firstItem = listContainer.querySelector('.iso-element-cell, .iso-list-item');
    if (firstItem) {
        firstItem.classList.add('selected');
        firstItem.style.borderColor = '#00d4ff';
        firstItem.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.8), 0 0 22px #00d4ff, inset 0 0 12px rgba(0, 212, 255, 0.3)`;
        firstItem.style.transform = 'scale(1.04)';
    }
    renderIsotopeDetails(0);
    
    // Handle Modal Animation
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    const cell = document.querySelector(`.view-mode.active .element-cell[data-z="${atomicNumber}"]`) || document.querySelector(`.element-cell[data-z="${atomicNumber}"]`);
    
    if (cell && modal) {
        const rect = cell.getBoundingClientRect();
        const cellCenterX = rect.left + rect.width / 2;
        const cellCenterY = rect.top + rect.height / 2;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const originX = (cellCenterX / winW) * 100;
        const originY = (cellCenterY / winH) * 100;
        modal.style.transformOrigin = `${originX}% ${originY}%`;
    } else if (modal) {
        modal.style.transformOrigin = 'center center';
    }
    
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            overlay.style.opacity = '1';
            if (modal) modal.style.transform = 'scale(1)';
        }, 10);
    }
}

/**
 * Format half-life values nicely.
 */
function formatHalfLife(val, unit) {
    if (val === null || val === undefined) return '-';
    if (unit === 'Gyears' || unit === 'Gyear') unit = 'billion years';
    if (unit === 'Myears' || unit === 'Myear') unit = 'million years';
    if (val > 1e6) {
        return val.toExponential(2) + ' ' + unit;
    }
    const numStr = val % 1 === 0 ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '');
    return numStr + ' ' + unit;
}

/**
 * Render comprehensive details for selected isotope
 */
function renderIsotopeDetails(index) {
    if (!currentIsotopeData || !currentIsotopeData[index]) return;
    
    const iso = currentIsotopeData[index];
    const elData = elementsData[currentAtomicNumber - 1];
    const isStable = isActuallyStable(iso);
    
    const isoCard = document.getElementById('modal-iso-card');
    if (isoCard && elData) {
        const dColor = isStable ? '#4ade80' : getDecayColor(iso.decayMode);
        const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#e2e8f0';
        isoCard.style.display = 'flex';
        isoCard.style.background = getGlossyBackground(dColor, 'metal');
        isoCard.style.border = `1.5px solid ${dColor}`;
        const Z = elData.atomicNumber;
        const N = iso.massNumber - Z;
        
        let isoName = `${elData.name}-${iso.massNumber}`;
        if (Z === 1 && iso.massNumber === 1) isoName = 'Protium';
        if (Z === 1 && iso.massNumber === 2) isoName = 'Deuterium';
        if (Z === 1 && iso.massNumber === 3) isoName = 'Tritium';
        
        const massStr = iso.mass ? iso.mass.toFixed(4) : iso.massNumber;
        const statusHtml = isStable ? '<span style="color: #4ade80;">Stable Isotope</span>' : `<span style="color: ${dColor};">${iso.decayMode || 'Unstable'} Decay</span>`;
        const compactHalfLife = formatCompactHalfLife(iso);
        const halfLifeBadge = isStable ? 'Half-life: ∞' : `t½: ${compactHalfLife}`;

        isoCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 18px;">
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; line-height: 1.05; font-family: var(--font-mono);">
                    <span style="font-size: 1.35rem; font-weight: 800; color: #00d4ff; text-shadow: 0 0 10px rgba(0,212,255,0.4);">${iso.massNumber}</span>
                    <span style="font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.7);">${Z}</span>
                </div>
                <div style="font-size: 3.2rem; font-family: var(--font-mono); font-weight: 800; color: ${stateColor}; text-shadow: 0 2px 8px rgba(0,0,0,0.9); line-height: 1;">${elData.symbol}</div>
                <div style="display: flex; flex-direction: column; justify-content: center; gap: 5px; line-height: 1.15;">
                    <span style="font-size: 1.55rem; font-weight: 800; font-family: var(--font-ui); text-shadow: 0 2px 4px rgba(0,0,0,0.8); color: #fff; letter-spacing: -0.2px;">${isoName}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.85rem; font-family: var(--font-ui); text-shadow: 0 1px 2px rgba(0,0,0,0.8); font-weight: 700; padding: 3px 12px; border-radius: 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); letter-spacing: 0.3px;">${statusHtml}</span>
                        <span style="font-size: 0.82rem; font-family: var(--font-mono); color: rgba(255,255,255,0.85); background: rgba(0,0,0,0.35); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">${halfLifeBadge}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 6px; line-height: 1.25; font-family: var(--font-mono);">
                <div style="font-size: 0.95rem; color: rgba(255,255,255,0.75);">Mass: <strong style="color:#fff; font-size: 1.05rem; font-weight: 800;">${massStr} u</strong></div>
                <div style="font-size: 0.95rem; color: rgba(255,255,255,0.75);">Neutrons: <strong style="color:#00d4ff; font-size: 1.05rem; font-weight: 800;">${N}</strong></div>
            </div>
        `;
    }

    if (elData) {
        const elCard = document.getElementById('modal-el-card');
        if (elCard) {
            const catName = getNormalizedCategory(elData.category);
            const catColor = categoryColors[catName] || '#333';
            const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#e2e8f0';
            const defaultN = Math.round(elData.atomicMass) - elData.atomicNumber;
            elCard.style.background = getGlossyBackground(catColor, catName);
            elCard.style.border = `1.5px solid ${catColor}`;
            elCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 64px; height: 64px; background: rgba(0,0,0,0.35); border: 1.5px solid rgba(255,255,255,0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; flex-shrink: 0; box-shadow: inset 0 1px 3px rgba(255,255,255,0.3);">
                        <span style="position: absolute; top: 3px; left: 5px; font-size: 0.68rem; font-family: var(--font-mono); color: rgba(255,255,255,0.75); font-weight: 700;">${elData.atomicNumber}</span>
                        <span style="font-size: 2.2rem; font-family: var(--font-mono); font-weight: 800; color: ${stateColor}; line-height: 1;">${elData.symbol}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; line-height: 1.15;">
                        <span style="font-size: 1.45rem; font-weight: 800; font-family: var(--font-ui); color: #fff; letter-spacing: -0.2px;">${elData.name}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.72rem; color: #00d4ff; font-weight: 700; font-family: var(--font-ui); text-transform: uppercase; background: rgba(0,212,255,0.12); border: 1px solid rgba(0,212,255,0.3); padding: 1px 6px; border-radius: 6px;">${catName}</span>
                            <span style="font-size: 0.78rem; color: rgba(255,255,255,0.75); font-family: var(--font-mono);">${elData.atomicMass ? elData.atomicMass.toFixed(3) + ' u' : ''}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 5px; font-family: var(--font-mono); font-size: 0.78rem; flex-shrink: 0;">
                    <span style="background: rgba(0,0,0,0.45); padding: 3px 9px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); color: #00d4ff; font-weight: 700;">Z = ${elData.atomicNumber}</span>
                    <span style="background: rgba(0,0,0,0.45); padding: 3px 9px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); font-weight: 700;">Avg N = ${defaultN}</span>
                </div>
            `;
        }
    }
    
    const isoTitle = document.getElementById('modal-iso-title');
    if (isoTitle) {
        isoTitle.innerHTML = `<sup>${iso.massNumber}</sup>${elData ? elData.symbol : ''}`;
    }
    
    // Status text
    const statusEl = document.getElementById('modal-iso-status');
    if (statusEl) {
        if (isStable) {
            statusEl.innerHTML = '<span style="color: #4ade80;">Stable Isotope</span>';
        } else {
            statusEl.innerHTML = `<span style="color: ${getDecayColor(iso.decayMode)};">${iso.decayMode || 'Unstable'} Decay</span>`;
        }
    }
    
    // Helper to format values
    const format = (val, dec = 4) => (val !== null && val !== undefined) ? val.toFixed(dec) : '-';
    const formatExp = (val, dec = 4) => {
        if (val === null || val === undefined) return '-';
        if (Math.abs(val) > 10000 || (Math.abs(val) < 0.001 && val !== 0)) return val.toExponential(dec);
        return val.toFixed(dec);
    };
    
    // Abundance percentage helper (raw abundance is parts per 10,000, i.e. 10,000 = 100%)
    const rawAbund = iso.abundance;
    const abundPct = rawAbund !== null && rawAbund !== undefined ? (rawAbund > 100 ? rawAbund / 100 : rawAbund) : null;

    // Write-up link
    if (elData && elData.name) {
        document.getElementById('m-iso-wiki').innerHTML = `<button onclick="window.openWikiModal('${elData.name}', ${iso.massNumber})" style="background: rgba(59,130,246,0.2); border: 1px solid #3b82f6; color: #60a5fa; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-family: var(--font-ui); font-size: 0.85rem; transition: all 0.2s;">Read Wikipedia ↗</button>`;
    } else {
        document.getElementById('m-iso-wiki').textContent = '-';
    }
    
    document.getElementById('m-iso-mass').innerHTML = (iso.mass ? format(iso.mass, 6) : iso.massNumber) + ' <span style="font-size: 0.8em; color: #888;">u</span>';
    document.getElementById('m-iso-excess').innerHTML = iso.massExcess !== null ? format(iso.massExcess, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-binding').innerHTML = iso.bindingEnergy !== null ? format(iso.bindingEnergy, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-abundance').innerHTML = abundPct !== null ? format(abundPct, 4) + ' <span style="font-size: 0.8em; color: #888;">%</span>' : '-';
    
    let hlText = '-';
    if (isStable) {
        hlText = '<span style="color: #4ade80;">Stable</span>';
    } else if (iso.halfLife !== null) {
        hlText = formatHalfLife(iso.halfLife, iso.halfLifeUnit);
    }
    document.getElementById('m-iso-halflife').innerHTML = hlText;
    document.getElementById('m-iso-decay').textContent = iso.decayMode || '-';
    
    // Calculate fallback values for Decay Width and Specific Activity mathematically
    let calcWidth = iso.decayWidth;
    let calcActivity = iso.specificActivity;
    
    if (!isStable && iso.halfLife !== null && (calcWidth === null || calcActivity === null)) {
        let t_sec = null;
        const val = iso.halfLife;
        const unit = (iso.halfLifeUnit || '').toLowerCase();
        
        let mult = 1;
        if (unit.includes('ysec')) mult = 1e-24;
        else if (unit.includes('zsec')) mult = 1e-21;
        else if (unit.includes('asec')) mult = 1e-18;
        else if (unit.includes('fsec')) mult = 1e-15;
        else if (unit.includes('psec')) mult = 1e-12;
        else if (unit.includes('nsec')) mult = 1e-9;
        else if (unit.includes('usec') || unit.includes('μs')) mult = 1e-6;
        else if (unit.includes('msec')) mult = 1e-3;
        else if (unit === 'sec' || unit === 's') mult = 1;
        else if (unit.includes('min')) mult = 60;
        else if (unit.includes('hour') || unit === 'h') mult = 3600;
        else if (unit.includes('day') || unit === 'd') mult = 86400;
        else if (unit === 'year' || unit === 'y' || unit === 'yr' || unit === 'years') mult = 31557600;
        else if (unit.includes('kyear') || unit.includes('kyr')) mult = 31557600 * 1e3;
        else if (unit.includes('myear') || unit.includes('myr')) mult = 31557600 * 1e6;
        else if (unit.includes('gyear') || unit.includes('gyr')) mult = 31557600 * 1e9;
        else if (unit.includes('tyear')) mult = 31557600 * 1e12;
        else if (unit.includes('pyear')) mult = 31557600 * 1e15;
        else if (unit.includes('eyear')) mult = 31557600 * 1e18;
        else if (unit.includes('zyear')) mult = 31557600 * 1e21;
        else if (unit.includes('yyear')) mult = 31557600 * 1e24;
        
        t_sec = val * mult;
        
        if (t_sec > 0) {
            if (calcWidth === null) calcWidth = 4.56229e-22 / t_sec;
            if (calcActivity === null) {
                const M = iso.mass || iso.massNumber;
                calcActivity = 4.174e23 / (t_sec * M);
            }
        }
    }
    
    document.getElementById('m-iso-width').innerHTML = calcWidth !== null ? formatExp(calcWidth, 4) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-activity').innerHTML = calcActivity !== null ? formatExp(calcActivity, 2) + ' <span style="font-size: 0.8em; color: #888;">Bq/g</span>' : '-';
    document.getElementById('m-iso-magnetic').innerHTML = iso.magneticMoment !== null ? format(iso.magneticMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">μN</span>' : '-';
    document.getElementById('m-iso-quadrupole').innerHTML = iso.quadrupoleMoment !== null ? format(iso.quadrupoleMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">eb</span>' : '-';
    
    let spinParity = '-';
    if (iso.spin !== null && iso.spin !== '') {
        spinParity = iso.spin;
        if (iso.parity !== null && iso.parity !== '') spinParity += ' ' + iso.parity;
    } else if (iso.parity !== null && iso.parity !== '') {
        spinParity = iso.parity;
    }
    document.getElementById('m-iso-spin').textContent = spinParity;

    // Render Detailed Scientific Infographic
    const infoContainer = document.getElementById('decay-infographic-container');
    if (infoContainer && elData) {
        if (isStable) {
            const Z = elData.atomicNumber;
            const A = iso.massNumber;
            const N = A - Z;
            const ratioNZ = (N / Math.max(1, Z)).toFixed(2);
            const magicNumbers = [2, 8, 20, 28, 50, 82, 126];
            const isMagicZ = magicNumbers.includes(Z);
            const isMagicN = magicNumbers.includes(N);
            const isDoublyMagic = isMagicZ && isMagicN;
            
            let magicBadge = '';
            if (isDoublyMagic) {
                magicBadge = `<span style="background: rgba(250, 204, 21, 0.2); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.5); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; box-shadow: 0 0 10px rgba(250, 204, 21, 0.3);">✨ Doubly Magic Nucleus (Z=${Z}, N=${N})</span>`;
            } else if (isMagicZ || isMagicN) {
                magicBadge = `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">⭐ Magic Shell (${isMagicZ ? 'Z=' + Z : 'N=' + N})</span>`;
            } else {
                magicBadge = `<span style="background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">🟢 Optimal N/Z Ratio (${ratioNZ})</span>`;
            }

            const abundStr = abundPct !== null ? `${abundPct.toFixed(2)}%` : 'Observationally Stable';
            const bindingStr = iso.bindingEnergy !== null && iso.bindingEnergy !== undefined ? `${(iso.bindingEnergy / A).toFixed(2)} MeV/A` : 'High (Valley Base)';

            infoContainer.innerHTML = `
                <div class="iso-decay-stage" style="flex-direction: column; justify-content: space-between; padding: 16px 14px; box-sizing: border-box; width: 100%; height: 100%;">
                    
                    <!-- Header Banner -->
                    <div class="iso-decay-banner-title" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 101, 52, 0.35) 100%); border-color: rgba(74, 222, 128, 0.5); color: #4ade80; margin: 0 auto; max-width: 90%;">
                        VALLEY OF NUCLEAR STABILITY &bull; ${elData.name.toUpperCase()}-${A}
                    </div>

                    <!-- Top Stability Indicator -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; z-index: 2; flex-wrap: wrap;">
                        ${magicBadge}
                        <span style="background: rgba(0, 0, 0, 0.5); color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.15); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-family: var(--font-mono);">Half-life: ∞ (Stable)</span>
                    </div>

                    <!-- Center 3-Column Visualizer (Responsive flex with auto-scaling) -->
                    <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; width: 100%; max-width: 860px; margin: 8px auto; gap: clamp(10px, 2.5vw, 24px); z-index: 2; box-sizing: border-box;">
                        
                        <!-- Left Stats Card -->
                        <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(74, 222, 128, 0.35); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 230px; min-width: 160px; box-sizing: border-box;">
                            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Nucleon Composition</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem;">
                                <span style="color: #38bdf8;">Protons (Z):</span>
                                <strong style="color: #fff;">${Z}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem;">
                                <span style="color: #f472b6;">Neutrons (N):</span>
                                <strong style="color: #fff;">${N}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                                <span style="color: #a78bfa;">Total Mass (A):</span>
                                <strong style="color: #00d4ff;">${A}</strong>
                            </div>
                        </div>

                        <!-- Center Glowing Nucleus Stage -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0;">
                            <div style="width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #4ade80 0%, #15803d 60%, #052e16 100%); box-shadow: 0 0 45px rgba(74, 222, 128, 0.45), inset 0 0 20px rgba(255,255,255,0.4); display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2.5px solid #86efac; position: relative;">
                                <span style="font-size: 2.4rem; font-family: var(--font-mono); font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8); line-height: 1;">${elData.symbol}</span>
                                <span style="font-size: 0.78rem; font-family: var(--font-mono); color: #dcfce7; font-weight: 700; margin-top: 2px;">A = ${A}</span>
                            </div>
                            <div style="font-size: 0.85rem; font-family: var(--font-ui); font-weight: 800; color: #4ade80; text-transform: uppercase; letter-spacing: 1.2px; text-shadow: 0 0 12px rgba(74,222,128,0.6);">Zero Radioactivity</div>
                        </div>

                        <!-- Right Stats Card -->
                        <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(74, 222, 128, 0.35); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 240px; min-width: 170px; box-sizing: border-box;">
                            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Stability Parameters</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; gap: 6px;">
                                <span style="color: rgba(255,255,255,0.7); flex-shrink: 0;">Abundance:</span>
                                <strong style="color: #4ade80; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${abundStr}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; gap: 6px;">
                                <span style="color: rgba(255,255,255,0.7); flex-shrink: 0;">Binding (B/A):</span>
                                <strong style="color: #facc15; text-align: right; white-space: nowrap;">${bindingStr}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                                <span style="color: rgba(255,255,255,0.7);">Nuclear Force:</span>
                                <strong style="color: #38bdf8;">Equilibrium</strong>
                            </div>
                        </div>

                    </div>

                    <!-- Bottom Summary Banner -->
                    <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 14px; font-size: 0.72rem; color: rgba(255,255,255,0.7); text-align: center; z-index: 2; margin: 0 auto; max-width: 90%;">
                        The strong nuclear force completely balances electrostatic proton repulsion. No spontaneous decay will ever occur.
                    </div>
                </div>
            `;
        } else {
            const dMode = iso.decayMode || '';
            const Z = elData.atomicNumber;
            const A = iso.massNumber;
            
            let dZ = Z, dA = A;
            let pZ = '', pA = '', pSym = '', pName = '', pFullName = '';
            let particleSvg = '';
            let isSpontaneousFission = false;
            let hasParticle = true;
            
            if (/\bA\b/.test(dMode) || dMode.includes('Alpha')) {
                dZ = Z - 2; dA = A - 4;
                pZ = '2'; pA = '4'; pSym = 'He'; pName = 'α'; pFullName = 'Alpha particle';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="pGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient><radialGradient id="nGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs><circle cx="15" cy="15" r="8" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="25" cy="15" r="8" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="15" cy="25" r="8" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="25" cy="25" r="8" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /></svg>`;
            } else if (dMode.includes('B-')) {
                dZ = Z + 1; dA = A;
                pZ = '-1'; pA = '0'; pSym = 'e'; pName = 'β⁻'; pFullName = 'Electron';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="eGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#0284c7" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#eGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">e⁻</text></svg>`;
            } else if (dMode.includes('B+') || dMode.includes('EC')) {
                dZ = Z - 1; dA = A;
                pZ = '+1'; pA = '0'; pSym = 'e'; pName = dMode.includes('B+') ? 'β⁺' : 'ν'; pFullName = dMode.includes('B+') ? 'Positron' : 'Neutrino';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="posGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#c084fc" /><stop offset="100%" stop-color="#7e22ce" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#posGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">e⁺</text></svg>`;
            } else if (dMode.includes('SF')) {
                isSpontaneousFission = true;
                dZ = Math.floor(Z / 2); dA = Math.floor(A / 2);
                pZ = Math.ceil(Z / 2); pA = Math.ceil(A / 2);
            } else if (/\bp\b/.test(dMode)) {
                dZ = Z - 1; dA = A - 1;
                pZ = '1'; pA = '1'; pSym = 'p'; pName = 'Proton'; pFullName = 'Proton';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="pGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">p⁺</text></svg>`;
            } else if (/\bn\b/.test(dMode)) {
                dZ = Z; dA = A - 1;
                pZ = '0'; pA = '1'; pSym = 'n'; pName = 'Neutron'; pFullName = 'Neutron';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="nGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">n⁰</text></svg>`;
            } else {
                hasParticle = false;
            }

            const getElementByZ = (targetZ) => {
                const list = (typeof elementsData !== 'undefined') ? elementsData : (window.elementsData || []);
                if (!list || !list.length) return null;
                return list.find(e => e.atomicNumber === targetZ) || list[targetZ - 1] || null;
            };

            const getSym = (targetZ) => {
                const el = getElementByZ(targetZ);
                return el ? el.symbol : '?';
            };

            const getName = (targetZ) => {
                const el = getElementByZ(targetZ);
                return el ? el.name : 'Unknown';
            };
            
            const dSym = getSym(dZ);
            const dName = getName(dZ);
            const pNameFragment = getName(pZ);
            
            const genNuc = (mass) => {
                const numSpheres = Math.min(mass, 80);
                let svg = `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="pGradN" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient><radialGradient id="nGradN" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs>`;
                const spheres = [];
                for (let i = 0; i < numSpheres; i++) {
                    const u = Math.random();
                    const v = Math.random();
                    const theta = u * 2 * Math.PI;
                    const phi = Math.acos(2 * v - 1);
                    const r = Math.cbrt(Math.random()) * 25; // 3D spherical volume distribution
                    const cx = 50 + r * Math.sin(phi) * Math.cos(theta);
                    const cy = 50 + r * Math.sin(phi) * Math.sin(theta);
                    const z = r * Math.cos(phi);
                    const fill = Math.random() > 0.5 ? 'url(#pGradN)' : 'url(#nGradN)';
                    spheres.push({ cx, cy, z, fill });
                }
                spheres.sort((a, b) => a.z - b.z); // Sort by Z depth!
                for (const s of spheres) {
                    svg += `<circle cx="${s.cx}" cy="${s.cy}" r="9" fill="${s.fill}" stroke="rgba(0,0,0,0.4)" stroke-width="0.8" />`;
                }
                svg += `</svg>`;
                return svg;
            };

            const parentSvg = genNuc(A);
            const daughterSvg = genNuc(dA);
            const dColor = getDecayColor(dMode);
            
            let html = `
                <div class="iso-decay-stage">
                    
                    <!-- Header Title -->
                    <div class="iso-decay-banner-title">
                        ${dMode} DECAY OF ${elData.name.toUpperCase()}-${A}
                    </div>

                    <!-- Legend Key -->
                    <div class="iso-decay-legend-key">
                        <div style="font-weight: bold; text-align: center; margin-bottom: 2px; color: rgba(255,255,255,0.6); font-size: 0.68rem; text-transform: uppercase;">Key</div>
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 600; color: #38bdf8;"><div style="width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #60a5fa 0%, #1d4ed8 100%); box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);"></div> Proton (p⁺)</div>
                        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 0.72rem; font-weight: 600; color: #f472b6;"><div style="width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f472b6 0%, #be185d 100%); box-shadow: 0 0 6px rgba(244, 114, 182, 0.6);"></div> Neutron (n⁰)</div>
                    </div>

                    <!-- Parent Nucleus -->
                    <div class="iso-decay-parent">
                        <div style="color: #38bdf8; font-weight: bold; text-align: center; line-height: 1.2; font-size: 0.95rem;">Parent Nucleus<br><span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">(${elData.name}-${A})</span></div>
                        <div class="parent-svg-wrap" style="width: 100px; height: 100px; margin: 8px 0;">${parentSvg}</div>
                        <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 2.2rem; font-family: var(--font-mono);">
                            <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.95rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                <span>${A}</span>
                                <span>${Z}</span>
                            </div>
                            <span style="line-height: 1;">${elData.symbol}</span>
                        </div>
                    </div>
            `;

            if (isSpontaneousFission || !hasParticle) {
                html += `
                    <!-- Center Arrow -->
                    <div class="iso-decay-arrow-wrap">
                        <div class="decay-badge-center" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #facc15; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.85); border: 1px solid #facc15; border-radius: 8px; padding: 4px 8px; font-size: 0.72rem; line-height: 1.1; box-shadow: 0 0 12px rgba(250, 204, 21, 0.35); white-space: nowrap;">Nuclear<br>Fission</div>
                        <svg width="100%" height="100%" viewBox="0 0 80 150" style="position: absolute; inset: 0;" preserveAspectRatio="none">
                            <path d="M 5,75 C 35,75 45,25 75,25" stroke="#facc15" stroke-width="2.5" fill="none" marker-end="url(#arrow-fiss)" />
                            <path d="M 5,75 C 35,75 45,125 75,125" stroke="#facc15" stroke-width="2.5" fill="none" marker-end="url(#arrow-fiss)" />
                            <defs>
                                <marker id="arrow-fiss" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#facc15" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Fragments) -->
                    <div class="iso-decay-products">
                        <!-- Fragment 1 -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${genNuc(pA)}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${getSym(pZ)}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Fragment 1 (${pNameFragment}-${pA})</div>
                            </div>
                        </div>

                        <!-- Fragment 2 -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Fragment 2 (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <!-- Center Arrow -->
                    <div class="iso-decay-arrow-wrap">
                        <div class="decay-badge-center" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${dColor}; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.85); border: 1px solid ${dColor}; border-radius: 8px; padding: 4px 8px; font-size: 0.72rem; line-height: 1.1; box-shadow: 0 0 12px ${dColor}44; white-space: nowrap;">${dMode || 'Decay'}<br>Event</div>
                        <svg width="100%" height="100%" viewBox="0 0 80 150" style="position: absolute; inset: 0;" preserveAspectRatio="none">
                            <path d="M 5,75 C 35,75 45,25 75,25" stroke="${dColor}" stroke-width="2.5" fill="none" marker-end="url(#arrow-prod)" />
                            <path d="M 5,75 C 35,75 45,125 75,125" stroke="${dColor}" stroke-width="2.5" fill="none" marker-end="url(#arrow-prod)" />
                            <defs>
                                <marker id="arrow-prod" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1 L 9 5 L 0 9 z" fill="${dColor}" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Products) -->
                    <div class="iso-decay-products">
                        
                        <!-- Emitted Particle (Top) -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 40px; height: 40px; flex-shrink: 0;">${particleSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    ${pA ? `
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    ` : ''}
                                    <span style="line-height: 1;">${pSym}</span>
                                </div>
                                <div style="color: #facc15; font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Emitted ${pName} (${pFullName})</div>
                            </div>
                        </div>

                        <!-- Daughter Nucleus (Bottom) -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Daughter Nucleus (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            infoContainer.innerHTML = html;
        }
    }
    
    // Initialize Half-Life Simulator for this selected isotope
    initHalfLifeSimulator(iso);
}

// Wiki Modal Logic
window.openWikiModal = function(elName, massNum) {
    const modal = document.getElementById('wiki-modal');
    const iframe = document.getElementById('wiki-iframe');
    const loaderOverlay = document.getElementById('wiki-loader-overlay');
    const header = document.getElementById('wiki-modal-header');
    const symbolSpan = document.getElementById('wiki-modal-symbol');
    const iconSvg = document.getElementById('wiki-modal-icon');
    
    // Style the modal header if element data is available
    let el = null;
    if (typeof elementsData !== 'undefined') {
        el = elementsData.find(e => e.name === elName);
    }
    if (el && header) {
        const normalizedCategory = getNormalizedCategory(el.category);
        header.style.background = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
        header.style.borderBottom = `1px solid ${categoryColors[normalizedCategory] || 'rgba(255,255,255,0.2)'}`;
        if (symbolSpan && iconSvg) {
            symbolSpan.innerHTML = massNum ? `<sup>${massNum}</sup>${el.symbol}` : el.symbol;
            symbolSpan.style.display = 'inline';
            iconSvg.style.display = 'none';
        }
    } else if (header) {
        header.style.background = 'rgba(255,255,255,0.05)';
        header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        if (symbolSpan && iconSvg) {
            symbolSpan.style.display = 'none';
            iconSvg.style.display = 'inline';
        }
    }
    
    let pageName = elName;
    if (massNum) {
        pageName = `${elName}-${massNum}`;
    }
    
    // Reset states
    if (loaderOverlay) {
        loaderOverlay.style.display = 'flex';
        loaderOverlay.style.opacity = '1';
    }
    iframe.style.opacity = '0';
    iframe.srcdoc = '';
    
    modal.style.display = 'flex';
    
    // Use the official Wikimedia REST API to get a mobile-friendly HTML page that doesn't set X-Frame-Options
    const url = `https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(pageName)}`;
    
    // Once the iframe has finished rendering the injected HTML (including CSS!)
    iframe.onload = () => {
        if (iframe.srcdoc) {
            if (loaderOverlay) loaderOverlay.style.opacity = '0';
            iframe.style.opacity = '1';
            setTimeout(() => {
                if (loaderOverlay) loaderOverlay.style.display = 'none';
            }, 300);
        }
    };
    
    fetch(url)
        .then(res => {
            if (!res.ok) {
                if (!massNum) return fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(elName)}`).then(r => r.text());
                throw new Error('Network error');
            }
            return res.text();
        })
        .then(html => {
            // Inject custom CSS to style the Wikipedia Infobox table headers!
            let injectedCss = '';
            if (el) {
                const normalizedCategory = getNormalizedCategory(el.category);
                const bgColor = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory).replace(/"/g, "'");
                const borderColor = categoryColors[normalizedCategory] || 'rgba(255,255,255,0.2)';
                
                injectedCss = `
                <style>
                    table.infobox th.infobox-header {
                        background: ${bgColor} !important;
                        color: white !important;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
                        border-bottom: 2px solid ${borderColor} !important;
                    }
                    /* Also style the title caption */
                    table.infobox caption.infobox-title {
                        background: ${bgColor} !important;
                        color: white !important;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
                        border-bottom: 2px solid ${borderColor} !important;
                    }
                </style>`;
            }

            // Wikipedia mobile HTML API returns a full HTML document, but we inject a base tag to ensure all relative links and resources resolve to Wikipedia domain.
            const injectedHtml = html.replace('<head>', '<head><base href="https://en.wikipedia.org/wiki/">' + injectedCss);
            iframe.srcdoc = injectedHtml;
        })
        .catch(err => {
            iframe.srcdoc = `<html style="background:#0f172a;"><body style="color:red;padding:20px;font-family:sans-serif;background:#0f172a;">Error loading Wikipedia page.</body></html>`;
        });
};

// Half-Life Simulator Logic
function initHalfLifeSimulator(iso) {
    const badge = document.getElementById('sim-halflife-badge');
    const daughterBadge = document.getElementById('sim-daughter-badge');
    const reactionEquation = document.getElementById('sim-reaction-equation');
    const decayTypeLabel = document.getElementById('sim-decay-type');
    const parentLabel = document.getElementById('sim-parent-label');
    const daughterLabel = document.getElementById('sim-daughter-label');
    const parentCountEl = document.getElementById('sim-parent-count');
    const daughterCountEl = document.getElementById('sim-daughter-count');
    const slider = document.getElementById('sim-time-slider');
    const textTime = document.getElementById('sim-time-text');
    const textAtoms = document.getElementById('sim-atoms-text');
    const chamber = document.getElementById('sim-atom-chamber');
    
    if (!badge || !slider || !chamber) return;
    
    const elData = elementsData[currentAtomicNumber - 1];
    const Z = elData.atomicNumber;
    const A = iso.massNumber;
    const mode = iso.decayMode || '';

    let dZ = Z;
    let dA = A;
    let particleStr = '';

    if (/\bA\b/.test(mode) || mode.includes('Alpha')) {
        dZ = Z - 2;
        dA = A - 4;
        particleStr = '+ ⁴₂α';
    } else if (mode.includes('B-') || mode.includes('2B-')) {
        dZ = Z + 1;
        dA = A;
        particleStr = '+ e⁻ + ν̄ₑ';
    } else if (mode.includes('B+') || mode.includes('EC')) {
        dZ = Z - 1;
        dA = A;
        particleStr = '+ e⁺ + νₑ';
    } else if (/\bp\b/.test(mode)) {
        dZ = Z - 1;
        dA = A - 1;
        particleStr = '+ p⁺';
    } else if (/\bn\b/.test(mode)) {
        dZ = Z;
        dA = A - 1;
        particleStr = '+ n⁰';
    } else if (mode.includes('SF')) {
        dZ = Math.max(1, Math.floor(Z / 2));
        dA = Math.max(1, Math.floor((A - 2) / 2));
        particleStr = '+ Fission Fragments';
    }

    const getElementByZ = (targetZ) => {
        const list = (typeof elementsData !== 'undefined') ? elementsData : (window.elementsData || []);
        if (!list || !list.length) return null;
        return list.find(e => e.atomicNumber === targetZ) || list[targetZ - 1] || null;
    };

    const getSym = (targetZ) => {
        const el = getElementByZ(targetZ);
        return el ? el.symbol : '?';
    };

    const getName = (targetZ) => {
        const el = getElementByZ(targetZ);
        return el ? el.name : 'Unknown';
    };

    const dSym = getSym(dZ);
    const dName = getName(dZ);
    const parentFullName = `${elData.name}-${A}`;
    const daughterFullName = iso.isStable ? 'Stable' : `${dName}-${dA}`;

    // Set simulator headers
    const hlStr = iso.isStable ? 'Stable (∞)' : (iso.halfLife ? formatHalfLife(iso.halfLife, iso.halfLifeUnit) : 'Unknown');
    badge.textContent = `T½ = ${hlStr}`;
    
    if (daughterBadge) {
        if (iso.isStable) {
            daughterBadge.style.background = 'rgba(74, 222, 128, 0.15)';
            daughterBadge.style.borderColor = 'rgba(74, 222, 128, 0.4)';
            daughterBadge.style.color = '#4ade80';
            daughterBadge.textContent = '🟢 Stable Nucleus (No Decay)';
        } else {
            daughterBadge.style.background = 'rgba(192, 132, 252, 0.15)';
            daughterBadge.style.borderColor = 'rgba(192, 132, 252, 0.4)';
            daughterBadge.style.color = '#c084fc';
            daughterBadge.textContent = `⚛️ Decays Into: ${dName}-${dA} (${dSym})`;
        }
    }

    if (reactionEquation) {
        if (iso.isStable) {
            reactionEquation.innerHTML = `<span style="color:#4ade80;"><sup>${A}</sup><sub>${Z}</sub>${elData.symbol}</span> &bull; Stable Isotope (No Decay Product)`;
        } else {
            reactionEquation.innerHTML = `<span style="color:#38bdf8;"><sup>${A}</sup><sub>${Z}</sub>${elData.symbol}</span> ➔ <span style="color:#c084fc;"><sup>${dA}</sup><sub>${dZ}</sub>${dSym}</span> ${particleStr}`;
        }
    }

    if (decayTypeLabel) {
        decayTypeLabel.textContent = iso.isStable ? 'STABLE' : `Mode: ${mode || 'Radioactive Decay'}`;
        decayTypeLabel.style.color = iso.isStable ? '#4ade80' : getDecayColor(mode);
    }

    if (parentLabel) parentLabel.textContent = parentFullName;
    if (daughterLabel) daughterLabel.textContent = daughterFullName;

    slider.value = 0;

    // Disable slider entirely for stable isotopes — no decay can happen
    slider.disabled = iso.isStable;
    slider.style.opacity = iso.isStable ? '0.35' : '1';
    slider.style.cursor  = iso.isStable ? 'not-allowed' : 'pointer';
    
    // Generate 100 atoms
    chamber.innerHTML = '';
    const decayOrder = Array.from({length: 100}, (_, i) => i);
    for (let i = decayOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [decayOrder[i], decayOrder[j]] = [decayOrder[j], decayOrder[i]];
    }

    for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.className = 'sim-atom-dot';
        dot.style.cssText = 'width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%); box-shadow: 0 0 8px rgba(74, 222, 128, 0.6); transition: all 0.3s ease;';
        chamber.appendChild(dot);
    }
    
    const updateSim = () => {
        // === STABLE ISOTOPE: nothing decays — lock everything to 100% parent ===
        if (iso.isStable) {
            slider.value = 0; // keep slider pinned at 0
            textTime.textContent = '0.0 Half-lives';
            textAtoms.textContent = '100 / 100 (100.0%)';
            if (parentCountEl)  parentCountEl.textContent  = 100;
            if (daughterCountEl) daughterCountEl.textContent = 0;

            // All dots stay green
            const dots = chamber.querySelectorAll('.sim-atom-dot');
            dots.forEach(dot => {
                dot.style.background  = 'radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%)';
                dot.style.boxShadow   = '0 0 8px rgba(74, 222, 128, 0.6)';
                dot.style.opacity     = '1';
                dot.style.transform   = 'scale(1)';
            });
            return;
        }

        // === RADIOACTIVE ISOTOPE: simulate exponential decay ===
        const tVal = parseFloat(slider.value);
        const fraction = Math.pow(0.5, tVal);
        const remainingCount = Math.round(100 * fraction);
        const decayedCount = 100 - remainingCount;
        
        let timeLabel = `${tVal.toFixed(1)} Half-lives`;
        if (iso.halfLife) {
            const realTime = (tVal * iso.halfLife);
            timeLabel += ` (${formatHalfLife(realTime, iso.halfLifeUnit)})`;
        }
        
        textTime.textContent = timeLabel;
        textAtoms.textContent = `${remainingCount} / 100 (${(fraction * 100).toFixed(1)}%)`;
        if (parentCountEl)  parentCountEl.textContent  = remainingCount;
        if (daughterCountEl) daughterCountEl.textContent = decayedCount;
        
        const activeIndices = new Set(decayOrder.slice(0, remainingCount));
        const dots = chamber.querySelectorAll('.sim-atom-dot');
        dots.forEach((dot, index) => {
            if (activeIndices.has(index)) {
                dot.style.background = 'radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%)';
                dot.style.boxShadow  = '0 0 8px rgba(74, 222, 128, 0.6)';
                dot.style.opacity    = '1';
                dot.style.transform  = 'scale(1)';
            } else {
                dot.style.background = 'radial-gradient(circle at 30% 30%, #a855f7 0%, #581c87 100%)';
                dot.style.boxShadow  = '0 0 4px rgba(168, 85, 247, 0.3)';
                dot.style.opacity    = '0.35';
                dot.style.transform  = 'scale(0.85)';
            }
        });
    };
    
    slider.oninput = updateSim;
    updateSim();
}

function closeIsotopeModal() {
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    
    if (overlay) overlay.style.opacity = '0';
    if (modal) modal.style.transform = 'scale(0.9)';
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }, 300);
}
window.closeIsotopeModal = closeIsotopeModal;

// Setup close button, tab switching, and keyboard/backdrop shortcuts
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeIsotopeModal);

    const overlay = document.getElementById('isotope-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeIsotopeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('isotope-modal-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                closeIsotopeModal();
            }
        }
    });

    // Setup Inspector Tab Switching
    document.querySelectorAll('.iso-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.iso-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.dataset.tab;
            document.querySelectorAll('.iso-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            const activeContent = document.getElementById(`iso-tab-${targetTab}`);
            if (activeContent) activeContent.style.display = 'flex';
        });
    });
});
