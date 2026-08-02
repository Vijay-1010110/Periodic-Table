/**
 * 08_reactions.js
 * Chemical Reaction Balancer Engine, Stoichiometry Calculator, and UI Controller
 */

// Preset Chemical Reactions Database
const presetReactions = [
    { name: 'Photosynthesis', equation: 'CO2 + H2O -> C6H12O6 + O2', category: 'Biological' },
    { name: 'Cellular Respiration', equation: 'C6H12O6 + O2 -> CO2 + H2O', category: 'Biological' },
    { name: 'Combustion of Methane', equation: 'CH4 + O2 -> CO2 + H2O', category: 'Combustion' },
    { name: 'Combustion of Propane', equation: 'C3H8 + O2 -> CO2 + H2O', category: 'Combustion' },
    { name: 'Combustion of Ethanol', equation: 'C2H5OH + O2 -> CO2 + H2O', category: 'Combustion' },
    { name: 'Rusting of Iron', equation: 'Fe + O2 -> Fe2O3', category: 'Synthesis' },
    { name: 'Haber Process (Ammonia)', equation: 'N2 + H2 -> NH3', category: 'Synthesis' },
    { name: 'Water Synthesis', equation: 'H2 + O2 -> H2O', category: 'Synthesis' },
    { name: 'Decomposition of Hydrogen Peroxide', equation: 'H2O2 -> H2O + O2', category: 'Decomposition' },
    { name: 'Decomposition of Calcium Carbonate', equation: 'CaCO3 -> CaO + CO2', category: 'Decomposition' },
    { name: 'Acid-Base: HCl + NaOH', equation: 'HCl + NaOH -> NaCl + H2O', category: 'Acid-Base' },
    { name: 'Acid-Base: H2SO4 + NaOH', equation: 'H2SO4 + NaOH -> Na2SO4 + H2O', category: 'Acid-Base' },
    { name: 'Acid-Base: HNO3 + KOH', equation: 'HNO3 + KOH -> KNO3 + H2O', category: 'Acid-Base' },
    { name: 'Single Displacement: Zinc & HCl', equation: 'Zn + HCl -> ZnCl2 + H2', category: 'Displacement' },
    { name: 'Single Displacement: Copper & Silver Nitrate', equation: 'Cu + AgNO3 -> Cu(NO3)2 + Ag', category: 'Displacement' },
    { name: 'Redox: Potassium Permanganate & HCl', equation: 'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2', category: 'Redox' },
    { name: 'Redox: Thermite Reaction', equation: 'Al + Fe2O3 -> Al2O3 + Fe', category: 'Redox' },
    { name: 'Baking Soda & Vinegar', equation: 'NaHCO3 + HC2H3O2 -> NaC2H3O2 + H2O + CO2', category: 'Acid-Base' }
];

let selectedReactionCategory = 'All';

function initReactionsView() {
    setupReactionsUI();
    renderReactionPresets();
    // Default test balancing
    balanceEquation('CH4 + O2 -> CO2 + H2O');
}

function setupReactionsUI() {
    const input = document.getElementById('reaction-input');
    const balanceBtn = document.getElementById('balance-btn');

    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                balanceEquation(input.value);
            }
        });
    }

    if (balanceBtn) {
        balanceBtn.onclick = () => {
            if (input) balanceEquation(input.value);
        };
    }

    const catPills = document.querySelectorAll('.reaction-cat-btn');
    catPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            catPills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            selectedReactionCategory = e.target.dataset.cat || 'All';
            renderReactionPresets();
        });
    });
}

function renderReactionPresets() {
    const container = document.getElementById('reaction-presets-grid');
    if (!container) return;

    container.innerHTML = '';

    const filtered = presetReactions.filter(r => selectedReactionCategory === 'All' || r.category === selectedReactionCategory);

    filtered.forEach(r => {
        const card = document.createElement('div');
        card.className = 'reaction-preset-card';
        card.innerHTML = `
            <div class="preset-name">${r.name}</div>
            <div class="preset-eq">${r.equation}</div>
            <span class="preset-badge">${r.category}</span>
        `;
        card.onclick = () => {
            const input = document.getElementById('reaction-input');
            if (input) input.value = r.equation;
            balanceEquation(r.equation);
        };
        container.appendChild(card);
    });
}

/**
 * Parses chemical formula into element counts
 * Example: "Fe2(SO4)3" -> { Fe: 2, S: 3, O: 12 }
 */
function parseFormula(formula) {
    formula = formula.trim().replace(/\s+/g, '');
    const elementCounts = {};

    function parseSubFormula(str, multiplier = 1) {
        const regex = /([A-Z][a-z]*)(\d*)|(\()|(\))(\d*)/g;
        let match;
        const stack = [multiplier];

        let i = 0;
        while (i < str.length) {
            if (str[i] === '(') {
                // Find matching closing parenthesis
                let depth = 1;
                let j = i + 1;
                while (j < str.length && depth > 0) {
                    if (str[j] === '(') depth++;
                    if (str[j] === ')') depth--;
                    j++;
                }
                const subStr = str.substring(i + 1, j - 1);
                let numStr = '';
                while (j < str.length && /\d/.test(str[j])) {
                    numStr += str[j];
                    j++;
                }
                const subMult = (numStr ? parseInt(numStr, 10) : 1) * multiplier;
                parseSubFormula(subStr, subMult);
                i = j;
            } else {
                const atomMatch = /^([A-Z][a-z]*)(\d*)/.exec(str.substring(i));
                if (atomMatch) {
                    const elem = atomMatch[1];
                    const count = (atomMatch[2] ? parseInt(atomMatch[2], 10) : 1) * multiplier;
                    elementCounts[elem] = (elementCounts[elem] || 0) + count;
                    i += atomMatch[0].length;
                } else {
                    i++;
                }
            }
        }
    }

    parseSubFormula(formula, 1);
    return elementCounts;
}

/**
 * Main Balancing Algorithm using Gaussian Elimination over Rationals
 */
function balanceEquation(rawInput) {
    const errorEl = document.getElementById('reaction-error');
    const resultCard = document.getElementById('balanced-result-card');

    if (errorEl) errorEl.style.display = 'none';
    if (!rawInput || !rawInput.includes('->') && !rawInput.includes('=')) {
        if (errorEl) {
            errorEl.textContent = 'Please enter a valid reaction equation with "->" or "=" (e.g. H2 + O2 -> H2O)';
            errorEl.style.display = 'block';
        }
        return;
    }

    const arrow = rawInput.includes('->') ? '->' : '=';
    const parts = rawInput.split(arrow);
    const reactantStrs = parts[0].split('+').map(s => s.trim()).filter(Boolean);
    const productStrs = parts[1].split('+').map(s => s.trim()).filter(Boolean);

    if (reactantStrs.length === 0 || productStrs.length === 0) {
        if (errorEl) {
            errorEl.textContent = 'Both reactants and products are required.';
            errorEl.style.display = 'block';
        }
        return;
    }

    try {
        const reactants = reactantStrs.map(parseFormula);
        const products = productStrs.map(parseFormula);

        // Get unique elements
        const allElementsSet = new Set();
        reactants.forEach(r => Object.keys(r).forEach(e => allElementsSet.add(e)));
        products.forEach(p => Object.keys(p).forEach(e => allElementsSet.add(e)));
        const elements = Array.from(allElementsSet);

        // Build matrix
        // Reactants are positive coefficients, Products are negative
        const numReactants = reactants.length;
        const numProducts = products.length;
        const totalSpecies = numReactants + numProducts;

        const matrix = elements.map(elem => {
            const row = [];
            reactants.forEach(r => row.push(r[elem] || 0));
            products.forEach(p => row.push(-(p[elem] || 0)));
            return row;
        });

        // Solve matrix using Nullspace / Gaussian Elimination
        const coefficients = solveMatrixNullspace(matrix, totalSpecies);

        if (!coefficients || coefficients.some(c => c <= 0 || isNaN(c))) {
            throw new Error('Unable to balance reaction. Please check chemical formulas.');
        }

        const rCoeffs = coefficients.slice(0, numReactants);
        const pCoeffs = coefficients.slice(numReactants);

        renderBalancedResult(reactantStrs, productStrs, rCoeffs, pCoeffs, elements, reactants, products);

    } catch (err) {
        if (errorEl) {
            errorEl.textContent = err.message || 'Error balancing reaction equation.';
            errorEl.style.display = 'block';
        }
    }
}

function solveMatrixNullspace(matrix, cols) {
    const rows = matrix.length;
    // Clone matrix with fractions [numerator, denominator]
    const M = matrix.map(r => r.map(v => [v, 1]));

    let lead = 0;
    for (let r = 0; r < rows; r++) {
        if (lead >= cols) break;
        let i = r;
        while (M[i][lead][0] === 0) {
            i++;
            if (i === rows) {
                i = r;
                lead++;
                if (lead === cols) break;
            }
        }
        if (lead === cols) break;

        // Swap rows i and r
        const temp = M[i];
        M[i] = M[r];
        M[r] = temp;

        // Scale row r to have pivot 1
        const pivot = M[r][lead];
        for (let j = 0; j < cols; j++) {
            M[r][j] = divFrac(M[r][j], pivot);
        }

        // Eliminate column entries in other rows
        for (let k = 0; k < rows; k++) {
            if (k !== r) {
                const factor = M[k][lead];
                for (let j = 0; j < cols; j++) {
                    M[k][j] = subFrac(M[k][j], mulFrac(factor, M[r][j]));
                }
            }
        }
        lead++;
    }

    // Set free variable (last column) to 1, back substitute
    const solution = new Array(cols).fill(null).map(() => [0, 1]);
    solution[cols - 1] = [1, 1];

    for (let i = cols - 2; i >= 0; i--) {
        let sum = [0, 1];
        for (let j = i + 1; j < cols; j++) {
            if (i < rows) {
                sum = addFrac(sum, mulFrac(M[i][j], solution[j]));
            }
        }
        solution[i] = [ -sum[0], sum[1] ];
    }

    // Find LCM of denominators to make all integer
    let lcm = 1;
    solution.forEach(frac => {
        const den = Math.abs(frac[1]);
        lcm = (lcm * den) / gcd(lcm, den);
    });

    const intCoeffs = solution.map(frac => Math.round((frac[0] / frac[1]) * lcm));

    // Ensure all positive
    if (intCoeffs.some(c => c <= 0)) {
        intCoeffs.forEach((c, idx) => { intCoeffs[idx] = Math.abs(c); });
    }

    // Simplify by GCD of all coefficients
    let g = intCoeffs[0];
    intCoeffs.forEach(c => { g = gcd(g, c); });
    return intCoeffs.map(c => c / g);
}

// Fraction Helpers
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function addFrac(a, b) { return simplifyFrac([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]); }
function subFrac(a, b) { return simplifyFrac([a[0] * b[1] - b[0] * a[1], a[1] * b[1]]); }
function mulFrac(a, b) { return simplifyFrac([a[0] * b[0], a[1] * b[1]]); }
function divFrac(a, b) { return simplifyFrac([a[0] * b[1], a[1] * b[0]]); }
function simplifyFrac(f) {
    if (f[1] < 0) { f[0] = -f[0]; f[1] = -f[1]; }
    const g = gcd(f[0], f[1]);
    return [f[0] / g, f[1] / g];
}

function renderBalancedResult(reactantStrs, productStrs, rCoeffs, pCoeffs, elements, reactants, products) {
    const balancedEqEl = document.getElementById('balanced-equation-text');
    const typeBadge = document.getElementById('reaction-type-badge');
    const stoichContainer = document.getElementById('stoichiometry-breakdown');

    if (!balancedEqEl) return;

    // Build HTML for balanced equation
    const rHtml = reactantStrs.map((str, i) => {
        const coeff = rCoeffs[i] > 1 ? `<span class="coeff-highlight">${rCoeffs[i]}</span>` : '';
        return `${coeff}${formatSubscripts(str)}`;
    }).join(' + ');

    const pHtml = productStrs.map((str, i) => {
        const coeff = pCoeffs[i] > 1 ? `<span class="coeff-highlight">${pCoeffs[i]}</span>` : '';
        return `${coeff}${formatSubscripts(str)}`;
    }).join(' + ');

    balancedEqEl.innerHTML = `${rHtml} &nbsp;➔&nbsp; ${pHtml}`;

    // Determine Reaction Type
    const rCount = reactantStrs.length;
    const pCount = productStrs.length;
    let rxnType = 'Chemical Reaction';

    if (rCount > 1 && pCount === 1) rxnType = 'Synthesis (Combination)';
    else if (rCount === 1 && pCount > 1) rxnType = 'Decomposition';
    else if (rCount === 2 && pCount === 2) rxnType = 'Displacement / Exchange';
    
    if (reactantStrs.some(s => s.includes('O2')) && productStrs.some(s => s.includes('CO2') || s.includes('H2O'))) {
        rxnType = 'Combustion';
    }

    if (typeBadge) typeBadge.textContent = rxnType;

    // Stoichiometry Ratios Table
    if (stoichContainer) {
        stoichContainer.innerHTML = `
            <div class="stoich-card">
                <h5>Molar Ratio</h5>
                <div class="stoich-value">${rCoeffs.join(' : ')} &nbsp;➔&nbsp; ${pCoeffs.join(' : ')}</div>
            </div>
            <div class="stoich-card">
                <h5>Conserved Elements</h5>
                <div class="stoich-chips">${elements.map(e => `<span class="e-chip">${e}</span>`).join('')}</div>
            </div>
        `;
    }
}

function formatSubscripts(formulaStr) {
    return formulaStr.replace(/(\d+)/g, '<sub>$1</sub>');
}
