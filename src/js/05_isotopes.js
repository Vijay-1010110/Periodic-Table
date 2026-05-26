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
                
                p.onmouseover = () => {
                    if (window.activeIsotopeFilter) return;
                    document.querySelectorAll('.iso-list-item').forEach(el => {
                        if (el.dataset.decayColor !== mode.color) el.style.opacity = '0.2';
                        else el.style.opacity = '1';
                    });
                };
                p.onmouseout = () => {
                    if (window.activeIsotopeFilter) return;
                    document.querySelectorAll('.iso-list-item').forEach(el => el.style.opacity = '1');
                };
                p.onclick = () => {
                    if (window.activeIsotopeFilter === mode.color) {
                        window.activeIsotopeFilter = null;
                        document.querySelectorAll('.iso-list-item').forEach(el => el.style.opacity = '1');
                        p.style.transform = 'scale(1)';
                        p.style.boxShadow = 'none';
                    } else {
                        window.activeIsotopeFilter = mode.color;
                        document.querySelectorAll('.iso-list-item').forEach(el => {
                            if (el.dataset.decayColor !== mode.color) el.style.opacity = '0.2';
                            else el.style.opacity = '1';
                        });
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
    if (elData) {
        document.getElementById('modal-element-name').textContent = elData.name;
        document.getElementById('modal-element-meta').textContent = `Atomic No. ${elData.atomicNumber} — Symbol ${elData.symbol}`;
    }
    
    document.getElementById('modal-iso-title').innerHTML = `<sup>${iso.massNumber}</sup>${elData ? elData.symbol : ''}`;
    
    // Status text
    const statusEl = document.getElementById('modal-iso-status');
    if (iso.isStable) {
        statusEl.innerHTML = '<span style="color: #4ade80;">Stable Isotope</span>';
    } else {
        statusEl.innerHTML = `<span style="color: ${getDecayColor(iso.decayMode)};">${iso.decayMode || 'Unstable'} Decay</span>`;
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
        document.getElementById('m-iso-wiki').innerHTML = `<a href="https://en.wikipedia.org/wiki/${elData.name}-${iso.massNumber}" target="_blank" style="color: #3b82f6; text-decoration: none;">${elData.name}-${iso.massNumber} Wikipedia ↗</a>`;
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
    document.getElementById('m-iso-quadrupole').innerHTML = iso.quadrupoleMoment !== null ? format(iso.quadrupoleMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">b</span>' : '-';
    document.getElementById('m-iso-spin').textContent = iso.spin ? `${iso.spin}${iso.parity || ''}` : '-';
    
    // Trigger emulator rendering
    if (window.NuclearEmulator) {
        window.NuclearEmulator.loadIsotope(iso, elData);
    }
}

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
