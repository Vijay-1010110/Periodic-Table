/**
 * 05_isotopes.js
 * Handles the logic for the Isotopes interface.
 */

// Global state for isotopes view
let currentIsotopeData = [];
let currentIsotopeIndex = 0;
let currentAtomicNumber = 1;

function getDecayColor(mode) {
    if (!mode) return '#888888';
    if (mode === 'Stable' || mode === '-') return '#4ade80';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return '#facc15';
    if (mode.includes('B-')) return '#38bdf8';
    if (mode.includes('B+') || mode.includes('EC')) return '#c084fc';
    if (mode.includes('SF')) return '#f87171';
    if (/\bp\b/.test(mode)) return '#fb923c';
    if (/\bn\b/.test(mode)) return '#2dd4bf';
    return '#94a3b8';
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
                { name: 'Stable', color: '#4ade80' },
                { name: 'Alpha (α)', color: '#facc15' },
                { name: 'Beta- (β-)', color: '#38bdf8' },
                { name: 'Beta+ / EC', color: '#c084fc' },
                { name: 'Spontaneous Fission', color: '#f87171' },
                { name: 'Proton Emission', color: '#fb923c' },
                { name: 'Neutron Emission', color: '#2dd4bf' }
            ];
            
            window.activeIsotopeFilter = null;
            
            legendModes.forEach(mode => {
                const p = document.createElement('div');
                p.style.cssText = `position: relative; overflow: hidden; padding: 4px 10px; border-radius: 6px; border: 1px solid ${mode.color}; background: ${getGlossyBackground(mode.color, 'metal')}; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; font-weight: 500; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; user-select: none;`;
                p.innerHTML = `<div style="position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%); pointer-events: none; border-radius: 6px 6px 0 0;"></div><span style="position:relative; z-index:1;">${mode.name}</span>`;
                
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

                    document.querySelectorAll('.iso-list-item').forEach(el => {
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

                    document.querySelectorAll('.iso-list-item').forEach(el => {
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
    
    currentIsotopeData.forEach((iso, index) => {
        const item = document.createElement('div');
        item.className = 'iso-list-item';
        const dColor = getDecayColor(iso.decayMode);
        item.dataset.decayColor = dColor;
        item.dataset.searchKey = `${iso.massNumber} ${elData.symbol}-${iso.massNumber} ${iso.isStable ? 'stable' : ''} ${iso.decayMode || ''}`.toLowerCase();
        
        item.style.background = 'rgba(15, 23, 42, 0.75)';
        item.style.border = `1px solid rgba(255, 255, 255, 0.12)`;
        item.style.borderRadius = '10px';
        item.style.padding = '10px 12px';
        item.style.boxSizing = 'border-box';
        item.style.cursor = 'pointer';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.justifyContent = 'space-between';
        item.style.gap = '6px';
        item.style.transition = 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.order = '1';
        
        const Z = elData.atomicNumber;
        const N = iso.massNumber - Z;
        const hlStr = iso.isStable ? 'Stable' : (iso.halfLife ? formatHalfLife(iso.halfLife, iso.halfLifeUnit) : 'Unstable');
        const modeBadge = iso.isStable 
            ? '<span style="background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); padding: 2px 6px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;">STABLE</span>' 
            : `<span style="background: ${dColor}22; color: ${dColor}; border: 1px solid ${dColor}44; padding: 2px 6px; border-radius: 12px; font-size: 0.65rem; font-weight: 700;">${iso.decayMode ? iso.decayMode.split(' ')[0] : 'DECAY'}</span>`;

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div style="display: flex; align-items: baseline; gap: 3px;">
                    <sup style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: #00d4ff;">${iso.massNumber}</sup>
                    <span style="font-size: 1.25rem; font-family: var(--font-mono); font-weight: 700; color: #fff; line-height: 1;">${elData.symbol}</span>
                </div>
                <span style="font-size: 0.68rem; font-family: var(--font-mono); color: ${iso.isStable ? '#4ade80' : '#facc15'}; text-align: right; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${hlStr}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 2px;">
                ${modeBadge}
                <span style="font-size: 0.65rem; font-family: var(--font-mono); color: rgba(255,255,255,0.5);">N=${N}</span>
            </div>
        `;
        
        item.onmouseenter = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                item.style.transform = 'translateY(-2px)';
                item.style.background = 'rgba(20, 30, 55, 0.85)';
            }
        };
        item.onmouseleave = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                item.style.transform = 'translateY(0)';
                item.style.background = 'rgba(15, 23, 42, 0.75)';
            }
        };
        
        item.onclick = () => {
            document.querySelectorAll('.iso-list-item').forEach(el => {
                el.classList.remove('selected');
                el.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                el.style.boxShadow = 'none';
                el.style.background = 'rgba(15, 23, 42, 0.75)';
                el.style.transform = 'translateY(0)';
            });
            item.classList.add('selected');
            item.style.borderColor = '#00d4ff';
            item.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4), inset 0 0 10px rgba(0, 212, 255, 0.1)';
            item.style.background = 'rgba(10, 25, 45, 0.9)';
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
            document.querySelectorAll('.iso-list-item').forEach(el => {
                if (!query || el.dataset.searchKey.includes(query)) {
                    el.style.display = 'flex';
                } else {
                    el.style.display = 'none';
                }
            });
        };
    }
    
    // Default select first
    const firstItem = listContainer.querySelector('.iso-list-item');
    if (firstItem) {
        firstItem.classList.add('selected');
        firstItem.style.borderColor = '#00d4ff';
        firstItem.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)';
        firstItem.style.background = 'rgba(10, 25, 45, 0.9)';
    }
    renderIsotopeDetails(0);
    
    // Handle Modal Animation
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    const cell = document.querySelector(`.view-mode.active .element-cell[data-z="${atomicNumber}"]`);
    
    if (cell && modal) {
        const rect = cell.getBoundingClientRect();
        // Calculate center of cell relative to window
        const cellCenterX = rect.left + rect.width / 2;
        const cellCenterY = rect.top + rect.height / 2;
        
        // Modal is centered in overlay, so its natural top/left is:
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Calculate transform origin as percentage of modal
        const originX = (cellCenterX / winW) * 100;
        const originY = (cellCenterY / winH) * 100;
        
        modal.style.transformOrigin = `${originX}% ${originY}%`;
    }
    
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.style.opacity = '1';
        if (modal) modal.style.transform = 'scale(1)';
    }, 10);
}

/**
 * Format half-life values nicely.
 */
function formatHalfLife(val, unit) {
    if (val === null || val === undefined) return '-';
    if (val > 1e6) {
        return val.toExponential(2) + ' ' + unit;
    }
    // Limit decimals for small numbers
    const numStr = val % 1 === 0 ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '');
    return numStr + ' ' + unit;
}

function renderIsotopeDetails(index) {
    if (!currentIsotopeData || !currentIsotopeData[index]) return;
    const iso = currentIsotopeData[index];
    
    // Set Element info in left pane header (only needs doing once but fine here)
    const elData = elementsData[currentAtomicNumber - 1];
    
    const isoCard = document.getElementById('modal-iso-card');
    if (isoCard && elData) {
        const dColor = getDecayColor(iso.decayMode);
        const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#e2e8f0';
        isoCard.style.display = 'flex';
        isoCard.style.background = getGlossyBackground(dColor, 'metal');
        isoCard.style.border = `1px solid ${dColor}`;
        const Z = elData.atomicNumber;
        const N = iso.massNumber - Z;
        
        let isoName = `${elData.name}-${iso.massNumber}`;
        if (Z === 1 && iso.massNumber === 1) isoName = 'Protium';
        if (Z === 1 && iso.massNumber === 2) isoName = 'Deuterium';
        if (Z === 1 && iso.massNumber === 3) isoName = 'Tritium';
        
        const massStr = iso.mass ? iso.mass.toFixed(4) : iso.massNumber;
        const statusHtml = iso.isStable ? '<span style="color: #4ade80;">Stable Isotope</span>' : `<span style="color: ${dColor};">${iso.decayMode || 'Unstable'} Decay</span>`;

        isoCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1;">
                    <span style="font-size: 0.85rem; font-family: var(--font-mono); color: #ddd; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${iso.massNumber}</span>
                    <span style="font-size: 0.85rem; font-family: var(--font-mono); color: #ddd; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${Z}</span>
                </div>
                <div style="font-size: 2.5rem; font-family: var(--font-mono); font-weight: 600; color: ${stateColor}; text-shadow: 0 1px 3px rgba(0,0,0,0.8); line-height: 1;">${elData.symbol}</div>
                <div style="display: flex; flex-direction: column; margin-left: 10px;">
                    <span style="font-size: 1.4rem; font-weight: 600; font-family: var(--font-ui); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${isoName}</span>
                    <span style="font-size: 0.9rem; font-family: var(--font-ui); text-shadow: 0 1px 2px rgba(0,0,0,0.8); font-weight: bold;">${statusHtml}</span>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <div style="font-size: 0.85rem; color: #ccc; font-family: var(--font-mono); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Mass: <span style="color:#fff">${massStr} u</span></div>
                <div style="font-size: 0.85rem; color: #ccc; font-family: var(--font-mono); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Neutrons: <span style="color:#fff">${N}</span></div>
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
            elCard.style.border = `1px solid ${catColor}`;
            elCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 48px; height: 48px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <span style="position: absolute; top: 2px; left: 4px; font-size: 0.55rem; font-family: var(--font-mono); color: rgba(255,255,255,0.7);">${elData.atomicNumber}</span>
                        <span style="font-size: 1.5rem; font-family: var(--font-mono); font-weight: 700; color: ${stateColor}; line-height: 1;">${elData.symbol}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-ui); color: #fff; line-height: 1.1;">${elData.name}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.68rem; color: #00d4ff; font-weight: 600; font-family: var(--font-ui); text-transform: uppercase;">${catName}</span>
                            <span style="font-size: 0.72rem; color: rgba(255,255,255,0.6); font-family: var(--font-mono);">${elData.atomicMass ? elData.atomicMass.toFixed(3) + ' u' : ''}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px; font-family: var(--font-mono); font-size: 0.72rem;">
                    <span style="background: rgba(0,0,0,0.35); padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: #00d4ff;">Z = ${elData.atomicNumber}</span>
                    <span style="background: rgba(0,0,0,0.35); padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8);">Avg N = ${defaultN}</span>
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
        if (iso.isStable) {
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
    
    // Write-up link
    if (elData && elData.name) {
        document.getElementById('m-iso-wiki').innerHTML = `<button onclick="window.openWikiModal('${elData.name}', ${iso.massNumber})" style="background: rgba(59,130,246,0.2); border: 1px solid #3b82f6; color: #60a5fa; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-family: var(--font-ui); font-size: 0.85rem; transition: all 0.2s;">Read Wikipedia ↗</button>`;
    } else {
        document.getElementById('m-iso-wiki').textContent = '-';
    }
    
    document.getElementById('m-iso-mass').innerHTML = (iso.mass ? format(iso.mass, 6) : iso.massNumber) + ' <span style="font-size: 0.8em; color: #888;">u</span>';
    document.getElementById('m-iso-excess').innerHTML = iso.massExcess !== null ? format(iso.massExcess, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-binding').innerHTML = iso.bindingEnergy !== null ? format(iso.bindingEnergy, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-abundance').innerHTML = iso.abundance !== null ? format(iso.abundance, 4) + ' <span style="font-size: 0.8em; color: #888;">%</span>' : '-';
    
    let hlText = '-';
    if (iso.isStable) {
        hlText = '<span style="color: #4ade80;">Stable</span>';
    } else if (iso.halfLife !== null) {
        hlText = formatHalfLife(iso.halfLife, iso.halfLifeUnit);
    }
    document.getElementById('m-iso-halflife').innerHTML = hlText;
    document.getElementById('m-iso-decay').textContent = iso.decayMode || '-';
    
    document.getElementById('m-iso-width').innerHTML = iso.decayWidth !== null ? formatExp(iso.decayWidth, 4) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-activity').innerHTML = iso.specificActivity !== null ? formatExp(iso.specificActivity, 2) + ' <span style="font-size: 0.8em; color: #888;">Bq/g</span>' : '-';
    document.getElementById('m-iso-magnetic').innerHTML = iso.magneticMoment !== null ? format(iso.magneticMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">μN</span>' : '-';
    // Render Detailed Scientific Infographic
    const infoContainer = document.getElementById('decay-infographic-container');
    if (infoContainer && elData) {
        if (iso.isStable) {
            infoContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #4ade80 0%, #166534 100%); box-shadow: 0 0 30px rgba(74, 222, 128, 0.4), inset 0 0 20px rgba(255,255,255,0.3); display: flex; justify-content: center; align-items: center; border: 2px solid #86efac;">
                        <span style="font-size: 2.5rem; font-family: var(--font-mono); font-weight: bold; color: #fff; text-shadow: 0 2px 5px rgba(0,0,0,0.5);">${elData.symbol}</span>
                    </div>
                    <div style="font-size: 1.5rem; font-family: var(--font-ui); font-weight: bold; color: #4ade80; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 2px 10px rgba(74,222,128,0.5);">Stable Isotope (Valley of Stability)</div>
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

            const getSym = (targetZ) => {
                if (window.elementsData) {
                    const el = window.elementsData.find(e => e.atomicNumber === targetZ);
                    if (el) return el.symbol;
                }
                return '?';
            };

            const getName = (targetZ) => {
                if (window.elementsData) {
                    const el = window.elementsData.find(e => e.atomicNumber === targetZ);
                    if (el) return el.name;
                }
                return 'Unknown';
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
            
            let html = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; width: 100%; height: 100%; position: relative; font-family: var(--font-ui); background: rgba(5, 12, 25, 0.9); border-radius: 12px; color: #fff; overflow: hidden; border: 1px solid rgba(0, 212, 255, 0.15);">
                    
                    <!-- Header Title -->
                    <div style="position: absolute; top: 0; left: 0; background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(2, 132, 199, 0.3) 100%); border: 1px solid rgba(0, 212, 255, 0.4); color: #00d4ff; padding: 6px 22px 6px 16px; font-weight: bold; font-size: 0.95rem; border-bottom-right-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                        ${dMode} DECAY OF ${elData.name.toUpperCase()}-${A}
                    </div>

                    <!-- Legend Key -->
                    <div style="position: absolute; top: 12px; right: 15px; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 8px 12px; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                        <div style="font-weight: bold; text-align: center; margin-bottom: 4px; color: rgba(255,255,255,0.6); font-size: 0.72rem; text-transform: uppercase;">Key</div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 600; color: #38bdf8;"><div style="width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #60a5fa 0%, #1d4ed8 100%); box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);"></div> Proton (p⁺)</div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 0.78rem; font-weight: 600; color: #f472b6;"><div style="width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f472b6 0%, #be185d 100%); box-shadow: 0 0 8px rgba(244, 114, 182, 0.6);"></div> Neutron (n⁰)</div>
                    </div>

                    <!-- Parent Nucleus -->
                    <div style="display: flex; flex-direction: column; align-items: center; width: 140px; margin-top: 25px;">
                        <div style="color: #38bdf8; font-weight: bold; text-align: center; line-height: 1.1; font-size: 0.95rem;">Parent Nucleus<br><span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">(${elData.name}-${A})</span></div>
                        <div style="width: 110px; height: 110px; margin: 8px 0;">${parentSvg}</div>
                        <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 2.2rem; font-family: var(--font-mono);">
                            <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.95rem; line-height: 1; margin-right: 5px; color: #00d4ff;">
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
                    <div style="display: flex; flex-direction: column; align-items: center; position: relative; width: 100px; height: 180px; margin-top: 25px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #facc15; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.7); border: 1px solid #facc15; border-radius: 8px; padding: 6px 10px; font-size: 0.8rem; line-height: 1.1; box-shadow: 0 0 15px rgba(250, 204, 21, 0.3);">Nuclear<br>Fission</div>
                        <svg width="100" height="180" style="position: absolute; top: 0; left: 0;">
                            <path d="M 0,90 L 90,40" stroke="#facc15" stroke-width="3" marker-end="url(#arrow)" />
                            <path d="M 0,90 L 90,140" stroke="#facc15" stroke-width="3" marker-end="url(#arrow)" />
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Fragments) -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 15px; height: 100%; width: 200px; margin-top: 25px;">
                        <!-- Fragment 1 -->
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 60px; height: 60px;">${genNuc(pA)}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.8rem; font-family: var(--font-mono);">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.85rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${getSym(pZ)}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.8rem;">Fragment 1 (${pNameFragment}-${pA})</div>
                            </div>
                        </div>

                        <!-- Fragment 2 -->
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 60px; height: 60px;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.8rem; font-family: var(--font-mono);">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.85rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.8rem;">Fragment 2 (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <!-- Center Arrow -->
                    <div style="display: flex; flex-direction: column; align-items: center; position: relative; width: 100px; height: 180px; margin-top: 25px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #4ade80; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.7); border: 1px solid #4ade80; border-radius: 8px; padding: 6px 10px; font-size: 0.8rem; line-height: 1.1; box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);">Decay<br>Event</div>
                        <svg width="100" height="180" style="position: absolute; top: 0; left: 0;">
                            <path d="M 0,90 L 90,40" stroke="#4ade80" stroke-width="3" marker-end="url(#arrow)" />
                            <path d="M 0,90 L 90,140" stroke="#4ade80" stroke-width="3" marker-end="url(#arrow)" />
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Products) -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 15px; height: 100%; width: 200px; margin-top: 25px;">
                        
                        <!-- Emitted Particle (Top) -->
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 44px; height: 44px;">${particleSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.8rem; font-family: var(--font-mono);">
                                    ${pA ? `
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.85rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    ` : ''}
                                    <span style="line-height: 1;">${pSym}</span>
                                </div>
                                <div style="color: #facc15; font-weight: 600; line-height: 1.1; font-size: 0.8rem;">Emitted ${pName} (${pFullName})</div>
                            </div>
                        </div>

                        <!-- Daughter Nucleus (Bottom) -->
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 60px; height: 60px;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.8rem; font-family: var(--font-mono);">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.85rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.8rem;">Daughter Nucleus (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            infoContainer.innerHTML = html;
        }
    }
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

function closeIsotopeModal() {
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    
    if (overlay) overlay.style.opacity = '0';
    if (modal) modal.style.transform = 'scale(0)';
    
    setTimeout(() => {
        if (overlay) overlay.classList.add('hidden');
    }, 400);
}

// Setup close button and keyboard/backdrop shortcuts
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
});
