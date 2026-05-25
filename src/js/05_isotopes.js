/**
 * 05_isotopes.js
 * Handles the logic for the Isotopes interface.
 */

// Global state for isotopes view
let currentIsotopeData = [];
let currentIsotopeIndex = 0;

/**
 * Main update function called when an element is selected
 * or when switching to the isotopes view.
 */
function updateIsotopesView(atomicNumber) {
    if (!atomicNumber || atomicNumber < 1 || atomicNumber > 118) return;
    
    // Toggle empty state
    document.getElementById('iso-empty-state').classList.add('hidden');
    document.getElementById('iso-details').classList.remove('hidden');
    
    // Retrieve element info from 01_data.js
    const elData = elementsData[atomicNumber - 1];
    if (!elData) return;
    
    // Set basic element card details
    document.getElementById('iso-number').textContent = elData.atomicNumber;
    document.getElementById('iso-symbol').textContent = elData.symbol;
    document.getElementById('iso-name').textContent = elData.name;
    document.getElementById('iso-mass').textContent = elData.atomicMass ? elData.atomicMass.toFixed(3) : '';
    
    // Set element card color based on category and state
    const card = document.getElementById('iso-element-card');
    const normalizedCategory = getNormalizedCategory(elData.category);
    card.style.background = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
    card.style.border = `1px solid ${categoryColors[normalizedCategory] || 'rgba(0,212,255,0.3)'}`;

    let currentState = 'Unknown';
    if (elData.meltingPoint && elData.boilingPoint) {
        if (currentTemp < elData.meltingPoint) currentState = 'Solid';
        else if (currentTemp >= elData.meltingPoint && currentTemp < elData.boilingPoint) currentState = 'Liquid';
        else currentState = 'Gas';
    }
    const symEl = document.getElementById('iso-symbol');
    if (symEl) {
        symEl.style.color = stateTextColors[currentState] || '#e2e8f0';
    }
    
    // Retrieve isotope data
    if (typeof isotopeData !== 'undefined' && isotopeData[atomicNumber]) {
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
    
    // Populate dropdown
    const selector = document.getElementById('iso-selector');
    selector.innerHTML = '';
    
    if (currentIsotopeData.length === 0) {
        // No data fallback
        const opt = document.createElement('option');
        opt.textContent = "No data";
        selector.appendChild(opt);
        clearIsotopeFields();
        document.getElementById('val-iso-count').textContent = '0 isotopes';
        return;
    }
    
    currentIsotopeData.forEach((iso, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        let label = `^${iso.massNumber}${elData.symbol}`;
        if (iso.isStable) label += " (Stable)";
        else if (iso.abundance) label += ` (${iso.abundance.toFixed(2)}%)`;
        else if (iso.halfLife) label += ` (~${formatHalfLife(iso.halfLife, iso.halfLifeUnit)})`;
        opt.textContent = label;
        selector.appendChild(opt);
    });
    
    document.getElementById('val-iso-count').textContent = `${currentIsotopeData.length} isotopes`;
    
    // Default select first (most stable/abundant)
    selector.value = 0;
    renderIsotopeDetails(0);
    
    // Add event listener (ensure it doesn't duplicate)
    selector.onchange = (e) => {
        renderIsotopeDetails(parseInt(e.target.value));
    };
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

/**
 * Render details for the specifically chosen isotope
 */
function renderIsotopeDetails(index) {
    if (!currentIsotopeData || !currentIsotopeData[index]) return;
    const iso = currentIsotopeData[index];
    
    // Helper to format values
    const format = (val, dec = 4) => (val !== null && val !== undefined) ? val.toFixed(dec) : '-';
    const formatExp = (val, dec = 4) => {
        if (val === null || val === undefined) return '-';
        if (Math.abs(val) > 10000 || Math.abs(val) < 0.001 && val !== 0) return val.toExponential(dec);
        return val.toFixed(dec);
    };
    
    document.getElementById('val-iso-writeup').textContent = "Wikipedia"; // Placeholder as requested
    
    document.getElementById('val-iso-mass-val').innerHTML = (iso.mass ? format(iso.mass, 6) : iso.massNumber) + ' <span style="font-size: 0.8em; color: #888;">u</span>';
    
    document.getElementById('val-iso-mass-excess').innerHTML = iso.massExcess !== null ? format(iso.massExcess, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    
    document.getElementById('val-iso-binding').innerHTML = iso.bindingEnergy !== null ? format(iso.bindingEnergy, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    
    document.getElementById('val-iso-abundance').innerHTML = iso.abundance !== null ? format(iso.abundance, 4) + ' <span style="font-size: 0.8em; color: #888;">%</span>' : '-';
    
    let hlText = '-';
    if (iso.isStable) {
        hlText = '<span style="color: #4ade80;">Stable</span>';
    } else if (iso.halfLife !== null) {
        hlText = formatHalfLife(iso.halfLife, iso.halfLifeUnit);
    }
    document.getElementById('val-iso-halflife').innerHTML = hlText;
    
    document.getElementById('val-iso-decay').textContent = iso.decayMode || '-';
    
    document.getElementById('val-iso-decay-width').innerHTML = iso.decayWidth !== null ? formatExp(iso.decayWidth, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    
    document.getElementById('val-iso-specific-activity').innerHTML = iso.specificActivity !== null ? formatExp(iso.specificActivity, 3) + ' <span style="font-size: 0.8em; color: #888;">Bq/g</span>' : '-';
    
    document.getElementById('val-iso-magnetic').innerHTML = iso.magneticMoment !== null ? format(iso.magneticMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">µN</span>' : '-';
    
    document.getElementById('val-iso-quadrupole').innerHTML = iso.quadrupoleMoment !== null ? format(iso.quadrupoleMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">b</span>' : '-';
}

function clearIsotopeFields() {
    const fields = ['writeup', 'mass-val', 'mass-excess', 'binding', 'abundance', 'halflife', 'decay', 'decay-width', 'specific-activity', 'magnetic', 'quadrupole'];
    fields.forEach(f => {
        document.getElementById('val-iso-' + f).textContent = '-';
    });
}
