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
        // Give it the exact same class as periodic table cells
        item.className = 'iso-list-item element-cell';
        const dColor = getDecayColor(iso.decayMode);
        item.dataset.decayColor = dColor;
        
        // Use the glossy metallic background style
        item.style.background = getGlossyBackground(dColor, 'metal');
        item.style.border = `1px solid ${dColor}`;
        item.style.aspectRatio = '0.8';
        item.style.minHeight = '90px'; // Prevent grid from squishing height
        item.style.width = '100%';
        item.style.order = '1'; // Default order
        
        const Z = elData.atomicNumber;
        const N = iso.massNumber - Z;
        
        let isoName = `${elData.name}-${iso.massNumber}`;
        if (Z === 1 && iso.massNumber === 1) isoName = 'Protium';
        if (Z === 1 && iso.massNumber === 2) isoName = 'Deuterium';
        if (Z === 1 && iso.massNumber === 3) isoName = 'Tritium';
        
        const massStr = iso.mass ? iso.mass.toFixed(4) : iso.massNumber;

        item.innerHTML = `
            <span style="position:absolute; top:4px; left:6px; font-size:0.65rem; font-family:var(--font-mono); color:#ddd; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${Z}</span>
            <span style="position:absolute; top:4px; right:6px; font-size:0.65rem; font-family:var(--font-mono); color:#ddd; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${N}</span>
            
            <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:1; margin-top: 8px;">
                <span style="font-size:1.6rem; font-family:var(--font-mono); font-weight:600; text-shadow: 0 1px 3px rgba(0,0,0,0.8); line-height: 1.1;">${elData.symbol}</span>
                <span style="font-size:0.5rem; color: ${iso.isStable ? '#4ade80' : '#ddd'}; text-shadow: 0 1px 2px rgba(0,0,0,0.8); letter-spacing:0.5px; text-transform: uppercase;">${isoName}</span>
            </div>
            
            <div style="width:100%; display:flex; justify-content:center; align-items:center; padding-bottom: 6px; box-sizing:border-box; z-index:1;">
                <span style="font-size:0.55rem; font-family:var(--font-mono); color:#bbb; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">${massStr} u</span>
            </div>
        `;
        
        // No need for custom hover logic, .element-cell:hover handles it
        
        item.onclick = () => {
            document.querySelectorAll('.iso-list-item').forEach((el, i) => {
                el.classList.remove('selected');
                el.style.borderColor = getDecayColor(currentIsotopeData[i].decayMode);
            });
            item.classList.add('selected');
            item.style.borderColor = '#00d4ff'; // Cyan active border
            renderIsotopeDetails(index);
        };
        
        listContainer.appendChild(item);
    });
    
    // Default select first
    const firstItem = listContainer.querySelector('.iso-list-item');
    if (firstItem) {
        firstItem.classList.add('selected');
        firstItem.style.borderColor = '#00d4ff';
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
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 2.5rem; font-family: var(--font-mono); font-weight: 600; color: ${stateColor}; text-shadow: 0 1px 3px rgba(0,0,0,0.8); line-height: 1;">${elData.symbol}</div>
                    <div style="display: flex; flex-direction: column; margin-left: 10px;">
                        <span style="font-size: 1.4rem; font-weight: 600; font-family: var(--font-ui); text-shadow: 0 1px 2px rgba(0,0,0,0.8); line-height: 1.2;">${elData.name}</span>
                        <span style="font-size: 0.85rem; color: #ddd; text-shadow: 0 1px 2px rgba(0,0,0,0.8); letter-spacing: 0.5px;">Atomic No. ${elData.atomicNumber} &mdash; ${elData.atomicMass ? elData.atomicMass.toFixed(3) + ' u' : ''}</span>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <div style="font-size: 0.85rem; color: #ccc; font-family: var(--font-mono); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Protons (Z): <span style="color:#fff">${elData.atomicNumber}</span></div>
                    <div style="font-size: 0.85rem; color: #ccc; font-family: var(--font-mono); text-shadow: 0 1px 2px rgba(0,0,0,0.8);">Neutrons (N): <span style="color:#fff">${defaultN}</span></div>
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
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100%; position: relative; font-family: var(--font-ui); background: #ffffff; border-radius: 10px; color: #333; overflow: hidden;">
                    
                    <!-- Header Title -->
                    <div style="position: absolute; top: 0; left: 0; background: #86198f; color: #fff; padding: 5px 20px 5px 15px; font-weight: bold; font-size: 1.1rem; border-bottom-right-radius: 20px; text-transform: uppercase;">
                        ${dMode} DECAY OF ${elData.name.toUpperCase()} ${A}
                    </div>

                    <!-- Legend Key -->
                    <div style="position: absolute; top: 15px; right: 15px; background: #fef08a; border: 1px solid #ca8a04; border-radius: 8px; padding: 10px; color: #000; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="font-weight: bold; text-align: center; margin-bottom: 5px; color: #854d0e; font-size: 0.9rem;">Key</div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: bold; color: #4338ca;"><div style="width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #60a5fa 0%, #1d4ed8 100%); box-shadow: inset -2px -2px 4px rgba(0,0,0,0.3);"></div> Proton</div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; font-size: 0.8rem; font-weight: bold; color: #9d174d;"><div style="width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f472b6 0%, #be185d 100%); box-shadow: inset -2px -2px 4px rgba(0,0,0,0.3);"></div> Neutron</div>
                    </div>

                    <!-- Parent Nucleus -->
                    <div style="display: flex; flex-direction: column; align-items: center; width: 150px; margin-top: 30px;">
                        <div style="color: #9333ea; font-weight: bold; text-align: center; line-height: 1.1; font-size: 1.1rem;">Parent<br>nucleus<br><span style="font-size: 0.9rem; color: #a855f7;">(${elData.name}-${A})</span></div>
                        <div style="width: 120px; height: 120px; margin: 10px 0;">${parentSvg}</div>
                        <div style="display: flex; align-items: center; font-weight: bold; color: #9333ea; font-size: 3rem;">
                            <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 1.2rem; line-height: 1; margin-right: 5px;">
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
                    <div style="display: flex; flex-direction: column; align-items: center; position: relative; width: 120px; height: 200px; margin-top: 30px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #9333ea; font-weight: bold; text-align: center; z-index: 2; background: radial-gradient(circle, #fef08a 0%, #fef08a 40%, transparent 70%); padding: 25px; font-size: 1.1rem; line-height: 1.1;">Decay<br>event</div>
                        <svg width="120" height="200" style="position: absolute; top: 0; left: 0;">
                            <path d="M 0,100 L 100,50" stroke="#84cc16" stroke-width="4" marker-end="url(#arrow)" />
                            <path d="M 0,100 L 100,150" stroke="#84cc16" stroke-width="4" marker-end="url(#arrow)" />
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#84cc16" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Fragments) -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 20px; height: 100%; width: 220px; margin-top: 30px;">
                        <!-- Fragment 1 -->
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 70px; height: 70px;">${genNuc(pA)}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #9333ea; font-size: 2.2rem;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 1rem; line-height: 1; margin-right: 5px;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${getSym(pZ)}</span>
                                </div>
                                <div style="color: #9333ea; font-weight: bold; line-height: 1.1; font-size: 0.95rem; text-align: center;">Fragment 1<br><span style="font-size: 0.8rem; color: #a855f7;">(${pNameFragment}-${pA})</span></div>
                            </div>
                        </div>

                        <!-- Fragment 2 -->
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 70px; height: 70px;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="color: #9333ea; font-weight: bold; line-height: 1.1; font-size: 0.95rem; text-align: center;">Fragment 2<br><span style="font-size: 0.8rem; color: #a855f7;">(${dName}-${dA})</span></div>
                                <div style="display: flex; align-items: center; font-weight: bold; color: #9333ea; font-size: 2.2rem;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 1rem; line-height: 1; margin-right: 5px;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <!-- Center Arrow -->
                    <div style="display: flex; flex-direction: column; align-items: center; position: relative; width: 120px; height: 200px; margin-top: 30px;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #9333ea; font-weight: bold; text-align: center; z-index: 2; background: radial-gradient(circle, #fef08a 0%, #fef08a 40%, transparent 70%); padding: 25px; font-size: 1.1rem; line-height: 1.1;">Decay<br>event</div>
                        <svg width="120" height="200" style="position: absolute; top: 0; left: 0;">
                            <path d="M 0,100 L 100,50" stroke="#84cc16" stroke-width="4" marker-end="url(#arrow)" />
                            <path d="M 0,100 L 100,150" stroke="#84cc16" stroke-width="4" marker-end="url(#arrow)" />
                            <defs>
                                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#84cc16" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Products) -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 20px; height: 100%; width: 220px; margin-top: 30px;">
                        
                        <!-- Emitted Particle (Top) -->
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 50px; height: 50px;">${particleSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #9333ea; font-size: 2.5rem;">
                                    ${pA ? `
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 1rem; line-height: 1; margin-right: 5px;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    ` : ''}
                                    <span style="line-height: 1;">${pSym}</span>
                                </div>
                                <div style="color: #9333ea; font-weight: bold; line-height: 1.1; font-size: 1.05rem;">Emitted ${pName}<br>particle<br><span style="font-size: 0.9rem; color: #a855f7;">(${pFullName})</span></div>
                            </div>
                        </div>

                        <!-- Daughter Nucleus (Bottom) -->
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 90px; height: 90px;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="color: #9333ea; font-weight: bold; line-height: 1.1; font-size: 1.05rem;">Daughter<br>nucleus<br><span style="font-size: 0.9rem; color: #a855f7;">(${dName}-${dA})</span></div>
                                <div style="display: flex; align-items: center; font-weight: bold; color: #9333ea; font-size: 2.5rem;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 1rem; line-height: 1; margin-right: 5px;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
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
    modal.style.display = 'flex';
    iframe.srcdoc = '<div style="font-family: sans-serif; padding: 40px; text-align: center; color: #333;">Loading Wikipedia article...</div>';
    
    // Use Wikipedia's mobile-html REST API to fetch a fully rendered page that avoids X-Frame-Options
    const exactPage = `${elName}-${massNum}`;
    fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${exactPage}`)
        .then(res => {
            if (res.ok) return res.text();
            // Fallback
            return fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/Isotopes_of_${elName.toLowerCase()}`).then(r => r.text());
        })
        .then(html => {
            // Inject base URL so images and styles load correctly
            const injectedHtml = html.replace('<head>', '<head><base href="https://en.wikipedia.org/wiki/">');
            iframe.srcdoc = injectedHtml;
        })
        .catch(err => {
            iframe.srcdoc = '<div style="font-family: sans-serif; padding: 40px; color: red;">Failed to load Wikipedia article.</div>';
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

// Setup close button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeIsotopeModal);
});
