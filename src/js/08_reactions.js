/**
 * 08_reactions.js
 * Chemical Reaction Balancer Engine, Stoichiometry Calculator, Atom Conservation Inventory,
 * and Interactive Practice Balancer Challenge Mode
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

var reactionsViewInitialized = false;
var selectedReactionCategory = 'All';
var currentReactionMode = 'solver'; // 'solver' | 'practice'

// Practice Mode State
var practiceReactionIndex = 0;
var practiceScore = 0;
var practiceTargetReaction = null;
var practiceUserR = [];
var practiceUserP = [];
var practiceTargetR = [];
var practiceTargetP = [];
var practiceReactantStrs = [];
var practiceProductStrs = [];
var practiceElements = [];

function initReactionsView() {
    if (!reactionsViewInitialized) {
        setupReactionsUI();
        renderReactionPresets();
        // Default test balancing
        balanceEquation('CH4 + O2 -> CO2 + H2O');
        reactionsViewInitialized = true;
    }
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

// Mode Toggle: 'solver' vs 'practice'
function setReactionMode(mode) {
    currentReactionMode = mode;
    const solverBtn = document.getElementById('rxn-mode-solver-btn');
    const practiceBtn = document.getElementById('rxn-mode-practice-btn');
    const solverContainer = document.getElementById('rxn-solver-container');
    const practiceContainer = document.getElementById('rxn-practice-container');
    const presetsSection = document.querySelector('.reaction-presets-section');

    if (mode === 'solver') {
        if (solverBtn) solverBtn.classList.add('active');
        if (practiceBtn) practiceBtn.classList.remove('active');
        if (solverContainer) solverContainer.style.display = 'block';
        if (practiceContainer) practiceContainer.style.display = 'none';
        if (presetsSection) presetsSection.style.display = 'block';

        const input = document.getElementById('reaction-input');
        if (input) balanceEquation(input.value || 'CH4 + O2 -> CO2 + H2O');
    } else {
        if (solverBtn) solverBtn.classList.remove('active');
        if (practiceBtn) practiceBtn.classList.add('active');
        if (solverContainer) solverContainer.style.display = 'none';
        if (practiceContainer) practiceContainer.style.display = 'block';
        if (presetsSection) presetsSection.style.display = 'none';

        if (!practiceTargetReaction) {
            loadNewPracticeChallenge();
        } else {
            renderPracticeEquation();
            updatePracticeAtomMeters();
        }
    }
}
window.setReactionMode = setReactionMode;

// Shortcut ribbon helpers
function insertReactionSymbol(sym) {
    const input = document.getElementById('reaction-input');
    if (!input) return;
    const start = input.selectionStart || input.value.length;
    const end = input.selectionEnd || input.value.length;
    const val = input.value;
    input.value = val.substring(0, start) + sym + val.substring(end);
    input.focus();
    input.setSelectionRange(start + sym.length, start + sym.length);
}
window.insertReactionSymbol = insertReactionSymbol;

function clearReactionInput() {
    const input = document.getElementById('reaction-input');
    if (input) {
        input.value = '';
        input.focus();
    }
}
window.clearReactionInput = clearReactionInput;

function setReactionPresetSample(eq) {
    const input = document.getElementById('reaction-input');
    if (input) {
        input.value = eq;
        balanceEquation(eq);
    }
}
window.setReactionPresetSample = setReactionPresetSample;

function renderReactionPresets() {
    const container = document.getElementById('reaction-presets-grid');
    if (!container) return;

    container.innerHTML = '';

    const filtered = presetReactions.filter(r => selectedReactionCategory === 'All' || r.category === selectedReactionCategory);

    filtered.forEach((r, idx) => {
        const card = document.createElement('div');
        card.className = 'reaction-preset-card';
        card.innerHTML = `
            <div class="preset-name">${r.name}</div>
            <div class="preset-eq">${r.equation}</div>
            <span class="preset-badge">${r.category}</span>
        `;
        card.onclick = () => {
            if (currentReactionMode === 'practice') {
                const globalIdx = presetReactions.indexOf(r);
                loadNewPracticeChallenge(globalIdx >= 0 ? globalIdx : 0);
            } else {
                const input = document.getElementById('reaction-input');
                if (input) input.value = r.equation;
                balanceEquation(r.equation);
            }
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
        let i = 0;
        while (i < str.length) {
            if (str[i] === '(') {
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

function getFormulaMolarMass(formula) {
    const counts = parseFormula(formula);
    let totalMass = 0;
    for (const sym in counts) {
        const el = (typeof elementsData !== 'undefined') ? elementsData.find(e => e.symbol === sym) : null;
        const atomicMass = el ? el.atomicMass : 0;
        totalMass += counts[sym] * atomicMass;
    }
    return totalMass;
}

/**
 * Main Balancing Algorithm using Gaussian Elimination over Rationals
 */
function balanceEquation(rawInput) {
    const errorEl = document.getElementById('reaction-error');
    const balanceBtn = document.getElementById('balance-btn');

    if (errorEl) errorEl.style.display = 'none';

    // Animate button solving state
    if (balanceBtn) {
        balanceBtn.classList.add('is-solving');
        balanceBtn.innerHTML = 'Solving... ⚡';
    }

    if (!rawInput || (!rawInput.includes('->') && !rawInput.includes('='))) {
        if (errorEl) {
            errorEl.textContent = 'Please enter a valid reaction equation with "->" or "=" (e.g. H2 + O2 -> H2O)';
            errorEl.style.display = 'block';
        }
        if (balanceBtn) {
            balanceBtn.classList.remove('is-solving');
            balanceBtn.innerHTML = 'Balance ⚡';
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
        if (balanceBtn) {
            balanceBtn.classList.remove('is-solving');
            balanceBtn.innerHTML = 'Balance ⚡';
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

        // Success Haptic & Button Feedback
        if (window.NativeServices?.Haptics) {
            window.NativeServices.Haptics.impact('MEDIUM');
        }

        if (balanceBtn) {
            balanceBtn.classList.remove('is-solving');
            balanceBtn.classList.add('is-success');
            balanceBtn.innerHTML = 'Balanced! ✅';
            setTimeout(() => {
                balanceBtn.classList.remove('is-success');
                balanceBtn.innerHTML = 'Balance ⚡';
            }, 1400);
        }

    } catch (err) {
        if (errorEl) {
            errorEl.textContent = err.message || 'Error balancing reaction equation.';
            errorEl.style.display = 'block';
        }
        if (balanceBtn) {
            balanceBtn.classList.remove('is-solving');
            balanceBtn.innerHTML = 'Balance ⚡';
        }
    }
}
window.balanceEquation = balanceEquation;

function solveMatrixNullspace(matrix, cols) {
    const rows = matrix.length;
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

        const temp = M[i];
        M[i] = M[r];
        M[r] = temp;

        const pivot = M[r][lead];
        for (let j = 0; j < cols; j++) {
            M[r][j] = divFrac(M[r][j], pivot);
        }

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

    const freeVarCol = cols - 1;
    const solution = [];
    for (let r = 0; r < cols - 1; r++) {
        let val = [0, 1];
        if (r < rows && M[r][r][0] === 1) {
            val = subFrac([0, 1], M[r][freeVarCol]);
        }
        solution.push(val);
    }
    solution.push([1, 1]);

    let commonDenom = 1;
    solution.forEach(f => {
        commonDenom = (commonDenom * f[1]) / gcd(commonDenom, f[1]);
    });

    const intCoeffs = solution.map(f => Math.round((f[0] * commonDenom) / f[1]));
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

    // Build HTML for balanced equation with bouncy highlight
    const rHtml = reactantStrs.map((str, i) => {
        const coeff = `<span class="coeff-highlight ${rCoeffs[i] > 1 ? 'large' : 'unit'}">${rCoeffs[i]}</span>`;
        return `${coeff}&nbsp;${formatSubscripts(str)}`;
    }).join(' &nbsp;+&nbsp; ');

    const pHtml = productStrs.map((str, i) => {
        const coeff = `<span class="coeff-highlight ${pCoeffs[i] > 1 ? 'large' : 'unit'}">${pCoeffs[i]}</span>`;
        return `${coeff}&nbsp;${formatSubscripts(str)}`;
    }).join(' &nbsp;+&nbsp; ');

    balancedEqEl.innerHTML = `${rHtml} &nbsp;&nbsp;<span style="color:#00d4ff; font-weight:800;">➔</span>&nbsp;&nbsp; ${pHtml}`;

    // Determine Reaction Type
    const rCount = reactantStrs.length;
    const pCount = productStrs.length;
    let rxnType = 'Chemical Reaction';

    if (rCount > 1 && pCount === 1) rxnType = 'Synthesis (Combination)';
    else if (rCount === 1 && pCount > 1) rxnType = 'Decomposition';
    else if (rCount === 2 && pCount === 2) rxnType = 'Displacement / Exchange';
    
    if (reactantStrs.some(s => s.includes('O2')) && productStrs.some(s => s.includes('CO2') || s.includes('H2O'))) {
        rxnType = 'Combustion';
    } else if (reactantStrs.some(s => s.includes('H') && (s.includes('Cl') || s.includes('SO4') || s.includes('NO3'))) &&
               reactantStrs.some(s => s.includes('OH'))) {
        rxnType = 'Acid-Base Neutralization';
    }

    if (typeBadge) typeBadge.textContent = rxnType;

    // Calculate Molar Masses
    let totalReactantMass = 0;
    let totalProductMass = 0;
    reactantStrs.forEach((str, i) => {
        totalReactantMass += rCoeffs[i] * getFormulaMolarMass(str);
    });
    productStrs.forEach((str, i) => {
        totalProductMass += pCoeffs[i] * getFormulaMolarMass(str);
    });

    // Inline Stoichiometry for Direct Mobile Visibility
    const inlineStoich = document.getElementById('reaction-inline-stoich');
    const inlineHtml = `
        <div class="inline-stoich-row">
            <div class="stoich-pill">
                <span class="stoich-pill-lbl">Molar Ratio:</span>
                <span class="stoich-pill-val cyan">
                    ${rCoeffs.join(' : ')} &nbsp;➔&nbsp; ${pCoeffs.join(' : ')}
                </span>
            </div>
            <div class="stoich-pill">
                <span class="stoich-pill-lbl">Mass Balance:</span>
                <span class="stoich-pill-val green">
                    ${totalReactantMass.toFixed(2)} g/mol &nbsp;=&nbsp; ${totalProductMass.toFixed(2)} g/mol (Δ0.00)
                </span>
            </div>
        </div>
    `;
    if (inlineStoich) inlineStoich.innerHTML = inlineHtml;

    // Render Atom Conservation & Inventory Matrix
    renderAtomInventory(reactantStrs, productStrs, rCoeffs, pCoeffs, elements, reactants, products);

    // Sidebar Stoichiometry Ratios Table (if opened)
    if (stoichContainer) {
        stoichContainer.innerHTML = `
            <div class="stoich-card">
                <h5>Molar Ratio</h5>
                <div class="stoich-value">${rCoeffs.join(' : ')} &nbsp;➔&nbsp; ${pCoeffs.join(' : ')}</div>
            </div>
            <div class="stoich-card">
                <h5>Total Mass Conserved</h5>
                <div class="stoich-value" style="color:#4ade80;">${totalReactantMass.toFixed(2)} g/mol</div>
            </div>
            <div class="stoich-card">
                <h5>Conserved Elements</h5>
                <div class="stoich-chips">${elements.map(e => `<span class="e-chip">${e}</span>`).join('')}</div>
            </div>
        `;
    }
}

function renderAtomInventory(reactantStrs, productStrs, rCoeffs, pCoeffs, elements, reactants, products) {
    const section = document.getElementById('atom-inventory-section');
    if (!section) return;

    let rowsHtml = '';
    elements.forEach(elem => {
        let rTotal = 0;
        let pTotal = 0;

        reactantStrs.forEach((str, i) => {
            const count = (reactants[i][elem] || 0) * rCoeffs[i];
            if (count > 0) {
                rTotal += count;
            }
        });

        productStrs.forEach((str, i) => {
            const count = (products[i][elem] || 0) * pCoeffs[i];
            if (count > 0) {
                pTotal += count;
            }
        });

        const isBalanced = rTotal === pTotal;
        const elemData = (typeof elementsData !== 'undefined') ? elementsData.find(e => e.symbol === elem) : null;
        const elemName = elemData ? elemData.name : elem;

        rowsHtml += `
            <div class="atom-inv-row">
                <div class="atom-inv-cell elem">
                    <span class="atom-sym-badge">${elem}</span>
                    <span class="atom-elem-name">${elemName}</span>
                </div>
                <div class="atom-inv-cell left">
                    <span class="atom-count-pill">${rTotal}</span>
                </div>
                <div class="atom-inv-cell center">
                    <span class="atom-equals-badge">${isBalanced ? '=' : '≠'}</span>
                </div>
                <div class="atom-inv-cell right">
                    <span class="atom-count-pill">${pTotal}</span>
                </div>
                <div class="atom-inv-cell status">
                    <span class="atom-status-badge ${isBalanced ? 'balanced' : 'unbalanced'}">
                        ${isBalanced ? '✅ Conserved' : '❌ Unbalanced'}
                    </span>
                </div>
            </div>
        `;
    });

    section.innerHTML = `
        <div class="atom-inventory-card">
            <div class="atom-inventory-header">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">⚖️</span>
                    <span style="font-weight:700; color:#38bdf8; font-size:0.9rem;">Atom Conservation Matrix</span>
                </div>
                <span class="atom-all-balanced-badge">✅ All Atoms Conserved (Law of Conservation of Mass)</span>
            </div>
            <div class="atom-inv-table-wrap">
                <div class="atom-inv-head-row">
                    <span class="head-col">Element</span>
                    <span class="head-col">Reactants (Left)</span>
                    <span class="head-col"></span>
                    <span class="head-col">Products (Right)</span>
                    <span class="head-col">Conservation</span>
                </div>
                ${rowsHtml}
            </div>
        </div>
    `;
}

// ===================== PRACTICE / CHALLENGE BALANCER MODE =====================

function loadNewPracticeChallenge(chosenIndex) {
    let rObj;
    if (typeof chosenIndex === 'number' && presetReactions[chosenIndex]) {
        practiceReactionIndex = chosenIndex;
        rObj = presetReactions[chosenIndex];
    } else {
        practiceReactionIndex = Math.floor(Math.random() * presetReactions.length);
        rObj = presetReactions[practiceReactionIndex];
    }

    practiceTargetReaction = rObj;
    const arrow = rObj.equation.includes('->') ? '->' : '=';
    const parts = rObj.equation.split(arrow);
    practiceReactantStrs = parts[0].split('+').map(s => s.trim()).filter(Boolean);
    practiceProductStrs = parts[1].split('+').map(s => s.trim()).filter(Boolean);

    // Parse formulas
    const reactants = practiceReactantStrs.map(parseFormula);
    const products = practiceProductStrs.map(parseFormula);

    const allElementsSet = new Set();
    reactants.forEach(r => Object.keys(r).forEach(e => allElementsSet.add(e)));
    products.forEach(p => Object.keys(p).forEach(e => allElementsSet.add(e)));
    practiceElements = Array.from(allElementsSet);

    // Solve for target solution
    const totalSpecies = reactants.length + products.length;
    const matrix = practiceElements.map(elem => {
        const row = [];
        reactants.forEach(r => row.push(r[elem] || 0));
        products.forEach(p => row.push(-(p[elem] || 0)));
        return row;
    });

    const targetCoeffs = solveMatrixNullspace(matrix, totalSpecies);
    practiceTargetR = targetCoeffs.slice(0, reactants.length);
    practiceTargetP = targetCoeffs.slice(reactants.length);

    // Initialize user coefficients to 1
    practiceUserR = practiceReactantStrs.map(() => 1);
    practiceUserP = practiceProductStrs.map(() => 1);

    const titleEl = document.getElementById('practice-target-name');
    if (titleEl) titleEl.textContent = rObj.name;

    const feedbackMsg = document.getElementById('practice-feedback-msg');
    if (feedbackMsg) {
        feedbackMsg.className = 'practice-feedback-msg';
        feedbackMsg.textContent = 'Adjust coefficients using [+] and [-] until all atoms balance!';
    }

    renderPracticeEquation();
    updatePracticeAtomMeters();
}
window.loadNewPracticeChallenge = loadNewPracticeChallenge;

function renderPracticeEquation() {
    const wrap = document.getElementById('practice-equation-wrap');
    if (!wrap) return;

    const rHtml = practiceReactantStrs.map((str, i) => `
        <div class="practice-term">
            <div class="stepper-wrap">
                <button type="button" class="stepper-btn" onclick="adjustPracticeCoeff('R', ${i}, -1)">−</button>
                <span class="stepper-val" id="stepper-r-${i}">${practiceUserR[i]}</span>
                <button type="button" class="stepper-btn" onclick="adjustPracticeCoeff('R', ${i}, 1)">+</button>
            </div>
            <span class="practice-formula">${formatSubscripts(str)}</span>
        </div>
    `).join('<span class="practice-op">+</span>');

    const pHtml = practiceProductStrs.map((str, i) => `
        <div class="practice-term">
            <div class="stepper-wrap">
                <button type="button" class="stepper-btn" onclick="adjustPracticeCoeff('P', ${i}, -1)">−</button>
                <span class="stepper-val" id="stepper-p-${i}">${practiceUserP[i]}</span>
                <button type="button" class="stepper-btn" onclick="adjustPracticeCoeff('P', ${i}, 1)">+</button>
            </div>
            <span class="practice-formula">${formatSubscripts(str)}</span>
        </div>
    `).join('<span class="practice-op">+</span>');

    wrap.innerHTML = `
        <div class="practice-side reactants">${rHtml}</div>
        <div class="practice-arrow">➔</div>
        <div class="practice-side products">${pHtml}</div>
    `;
}

function adjustPracticeCoeff(side, idx, delta) {
    if (side === 'R') {
        practiceUserR[idx] = Math.max(1, Math.min(20, practiceUserR[idx] + delta));
    } else {
        practiceUserP[idx] = Math.max(1, Math.min(20, practiceUserP[idx] + delta));
    }

    // Update displayed coefficient
    const valEl = document.getElementById(side === 'R' ? `stepper-r-${idx}` : `stepper-p-${idx}`);
    if (valEl) valEl.textContent = side === 'R' ? practiceUserR[idx] : practiceUserP[idx];

    if (window.NativeServices?.Haptics) {
        window.NativeServices.Haptics.impact('LIGHT');
    }

    updatePracticeAtomMeters();
}
window.adjustPracticeCoeff = adjustPracticeCoeff;

function updatePracticeAtomMeters() {
    const reactants = practiceReactantStrs.map(parseFormula);
    const products = practiceProductStrs.map(parseFormula);

    const section = document.getElementById('atom-inventory-section');
    if (!section) return;

    let allBalanced = true;
    let rowsHtml = '';

    practiceElements.forEach(elem => {
        let rCount = 0;
        let pCount = 0;

        reactants.forEach((r, i) => {
            rCount += (r[elem] || 0) * practiceUserR[i];
        });

        products.forEach((p, i) => {
            pCount += (p[elem] || 0) * practiceUserP[i];
        });

        const isBal = rCount === pCount;
        if (!isBal) allBalanced = false;

        const delta = pCount - rCount;
        let deltaText = 'Balanced ✅';
        if (delta < 0) deltaText = `Need ${Math.abs(delta)} more on Products ⚠️`;
        if (delta > 0) deltaText = `Need ${delta} more on Reactants ⚠️`;

        rowsHtml += `
            <div class="atom-inv-row ${isBal ? 'is-balanced' : 'is-unbalanced'}">
                <div class="atom-inv-cell elem">
                    <span class="atom-sym-badge">${elem}</span>
                </div>
                <div class="atom-inv-cell left">
                    <span class="atom-count-pill ${isBal ? 'good' : 'warn'}">${rCount}</span>
                </div>
                <div class="atom-inv-cell center">
                    <span class="atom-equals-badge">${isBal ? '=' : '≠'}</span>
                </div>
                <div class="atom-inv-cell right">
                    <span class="atom-count-pill ${isBal ? 'good' : 'warn'}">${pCount}</span>
                </div>
                <div class="atom-inv-cell status">
                    <span class="atom-status-badge ${isBal ? 'balanced' : 'unbalanced'}">${deltaText}</span>
                </div>
            </div>
        `;
    });

    section.innerHTML = `
        <div class="atom-inventory-card">
            <div class="atom-inventory-header">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem;">⚖️</span>
                    <span style="font-weight:700; color:#38bdf8; font-size:0.9rem;">Live Practice Atom Scales</span>
                </div>
                <span class="atom-all-balanced-badge ${allBalanced ? 'balanced' : 'unbalanced'}">
                    ${allBalanced ? '🎉 All Atoms Balanced!' : '⚠️ Still Unbalanced'}
                </span>
            </div>
            <div class="atom-inv-table-wrap">
                <div class="atom-inv-head-row">
                    <span class="head-col">Element</span>
                    <span class="head-col">Reactants</span>
                    <span class="head-col"></span>
                    <span class="head-col">Products</span>
                    <span class="head-col">Status</span>
                </div>
                ${rowsHtml}
            </div>
        </div>
    `;

    return allBalanced;
}

function checkPracticeBalance() {
    const isBalanced = updatePracticeAtomMeters();
    const feedbackMsg = document.getElementById('practice-feedback-msg');
    const scoreBadge = document.getElementById('practice-score-badge');

    if (isBalanced) {
        practiceScore += 20;
        if (scoreBadge) scoreBadge.textContent = `Score: ${practiceScore}`;
        if (feedbackMsg) {
            feedbackMsg.className = 'practice-feedback-msg success';
            feedbackMsg.innerHTML = `🎉 <strong>Perfect!</strong> You balanced <em>${practiceTargetReaction.name}</em>! (+20 pts)`;
        }
        if (window.NativeServices?.Haptics) {
            window.NativeServices.Haptics.notification('SUCCESS');
        }
    } else {
        if (feedbackMsg) {
            feedbackMsg.className = 'practice-feedback-msg error';
            feedbackMsg.innerHTML = `❌ <strong>Not quite balanced yet.</strong> Look at the atom scales below to see which side is missing atoms!`;
        }
        if (window.NativeServices?.Haptics) {
            window.NativeServices.Haptics.notification('WARNING');
        }
    }
}
window.checkPracticeBalance = checkPracticeBalance;

function revealPracticeSolution() {
    practiceUserR = [...practiceTargetR];
    practiceUserP = [...practiceTargetP];
    renderPracticeEquation();
    updatePracticeAtomMeters();

    const feedbackMsg = document.getElementById('practice-feedback-msg');
    if (feedbackMsg) {
        feedbackMsg.className = 'practice-feedback-msg info';
        feedbackMsg.innerHTML = `💡 <strong>Solution Revealed:</strong> Molar ratio is ${practiceTargetR.join(':')} ➔ ${practiceTargetP.join(':')}`;
    }
}
window.revealPracticeSolution = revealPracticeSolution;

function formatSubscripts(formulaStr) {
    if (!formulaStr) return '';
    const safeStr = window.escapeHtml ? window.escapeHtml(formulaStr) : formulaStr.replace(/[&<>"']/g, '');
    return safeStr.replace(/(\d+)/g, '<sub>$1</sub>');
}
