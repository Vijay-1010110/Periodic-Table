let currentCompoundViewerMode = '3d';
let selectedCompoundObj = null;
/**
 * 07_compounds.js
 * Controller for Compounds View, On-the-Fly Chemical Formula Synthesizer,
 * PubChem REST API Live Fetcher (110M+ Compounds), & 3D Molecule Renderer using Three.js
 */

let selectedCompoundId = 'water';
let compoundFilterType = 'All';
let compoundSearchQuery = '';
let pubChemSearchTimeout = null;

// Storage for dynamically parsed or PubChem-fetched compounds
const dynamicCompoundsList = [];

// Three.js Molecular Viewer globals
let molScene = null;
let molCamera = null;
let molRenderer = null;
let molGroup = null;
let isMolRotating = true;
let isDraggingMol = false;
let previousMousePosition = { x: 0, y: 0 };

let compoundsViewInitialized = false;

function initCompoundsView() {
    if (!compoundsViewInitialized) {
        setupCompoundsEvents();
        renderCompoundsGrid();
        initMoleculeViewer();
        selectCompound('water');
        compoundsViewInitialized = true;
    } else {
        if (typeof window.startMoleculeViewer === 'function') {
            window.startMoleculeViewer();
        }
    }
}

function setupCompoundsEvents() {
    const searchInput = document.getElementById('compound-search-bar');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            compoundSearchQuery = e.target.value.trim();
            renderCompoundsGrid();
            
            if (pubChemSearchTimeout) clearTimeout(pubChemSearchTimeout);
            if (compoundSearchQuery.length >= 2) {
                pubChemSearchTimeout = setTimeout(() => {
                    fetchPubChemCompound(compoundSearchQuery);
                }, 350);
            }
        });
    }

    const typePills = document.querySelectorAll('.compound-filter-btn');
    typePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            typePills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            compoundFilterType = e.target.dataset.type || 'All';
            renderCompoundsGrid();
        });
    });
}

function formatFormulaSubscript(str) {
    if (!str) return '';
    const subscripts = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
    return str.replace(/\d+/g, m => m.split('').map(d => subscripts[d] || d).join(''));
}

/**
 * On-the-Fly Chemical Formula Parser & Calculator Engine
 * Parses any valid chemical formula (e.g. K2Cr2O7, Fe3O4, CuSO4, C6H12O6, Mg(HCO3)2)
 */
function parseChemicalFormula(formulaStr) {
    if (!formulaStr) return null;
    const cleanStr = formulaStr.trim().replace(/\s+/g, '');
    if (cleanStr.length < 2) return null;

    // Expand parentheses: replace (OH)2 with O2H2 internally
    let expanded = cleanStr;
    const expandParen = (s) => {
        return s.replace(/\(([^()]+)\)(\d+)/g, (_, inner, mult) => {
            const m = parseInt(mult, 10);
            return inner.replace(/([A-Z][a-z]?)(\d*)/g, (__, sym, cnt) => {
                const c = (cnt ? parseInt(cnt, 10) : 1) * m;
                return sym + c;
            });
        });
    };

    for (let i = 0; i < 3; i++) {
        expanded = expandParen(expanded);
    }
    
    // Parse element counts
    const elementRegex = /([A-Z][a-z]?)(\d*)/g;
    const counts = {};
    let match;
    let totalAtomCount = 0;
    
    const elementsList = (typeof elementsData !== 'undefined') ? elementsData : (window.elementsData || []);
    if (!elementsList.length) return null;

    while ((match = elementRegex.exec(expanded)) !== null) {
        const sym = match[1];
        const count = match[2] ? parseInt(match[2], 10) : 1;
        
        const el = elementsList.find(e => e.symbol === sym);
        if (!el) return null; // Invalid element symbol!
        
        counts[sym] = (counts[sym] || 0) + count;
        totalAtomCount += count;
    }
    
    if (Object.keys(counts).length === 0) return null;

    // Calculate molar mass & element composition
    let totalMass = 0;
    const parsedElements = [];
    let containsMetal = false;
    let containsNonMetal = false;

    for (const [sym, count] of Object.entries(counts)) {
        const el = elementsList.find(e => e.symbol === sym);
        const atomicWeight = el ? (el.atomicMass || el.atomicWeight || 1.0) : 1.0;
        const elemMass = atomicWeight * count;
        totalMass += elemMass;

        const cat = (el ? el.category || '' : '').toLowerCase();
        if (cat.includes('metal') && !cat.includes('nonmetal') && !cat.includes('metalloid')) {
            containsMetal = true;
        } else {
            containsNonMetal = true;
        }

        parsedElements.push({
            symbol: sym,
            name: el ? el.name : sym,
            count: count,
            atomicNumber: el ? el.atomicNumber : 1,
            totalElemMass: elemMass
        });
    }

    parsedElements.forEach(item => {
        item.massPercent = parseFloat(((item.totalElemMass / totalMass) * 100).toFixed(1));
    });

    let bondingType = 'Covalent';
    if (containsMetal && containsNonMetal) {
        bondingType = 'Ionic';
    } else if (cleanStr.includes('C') && cleanStr.includes('H')) {
        bondingType = 'Organic';
    }

    // Generate 3D Spherical/Cluster Atom coordinates for Three.js
    const atoms3D = [];
    let idx = 0;
    parsedElements.forEach(item => {
        for (let i = 0; i < item.count; i++) {
            const radius = 0.8 + Math.floor(idx / 5) * 0.6;
            const angle = (idx % 5) * (Math.PI * 2 / 5);
            const offsetZ = (i % 2 === 0 ? 1 : -1) * (0.3 + (idx % 3) * 0.2);
            atoms3D.push({
                elem: item.atomicNumber,
                x: parseFloat((radius * Math.cos(angle)).toFixed(2)),
                y: parseFloat((radius * Math.sin(angle)).toFixed(2)),
                z: parseFloat(offsetZ.toFixed(2))
            });
            idx++;
        }
    });

    const compoundId = `synth_${cleanStr.toLowerCase()}`;
    return {
        id: compoundId,
        name: `${cleanStr} Compound`,
        formula: formatFormulaSubscript(cleanStr),
        rawFormula: cleanStr,
        iupacName: `Synthesized Formula: ${formatFormulaSubscript(cleanStr)}`,
        type: bondingType,
        molarMass: totalMass.toFixed(3),
        state: 'Solid',
        meltingPoint: 'N/A (Calculated on-the-fly)',
        boilingPoint: 'N/A (Calculated on-the-fly)',
        density: 'N/A',
        description: `Custom chemical compound synthesized on-the-fly from formula ${formatFormulaSubscript(cleanStr)}. Contains ${parsedElements.map(e => `${e.name} (${e.count})`).join(', ')} with total computed molar mass of ${totalMass.toFixed(3)} g/mol.`,
        elements: parsedElements,
        atoms: atoms3D,
        isSynthesized: true
    };
}

/**
 * PubChem REST API Live Compound Fetcher (Accesses 110M+ Compounds)
 */
async function fetchPubChemCompound(query) {
    if (!query || query.length < 2) return;
    const cleanQuery = query.trim();
    const lowerQuery = cleanQuery.toLowerCase();
    
    // Check if already in list
    const existing = compoundsData.find(c => c.name.toLowerCase() === lowerQuery || c.formula.toLowerCase() === lowerQuery)
        || dynamicCompoundsList.find(c => c.name.toLowerCase() === lowerQuery || c.formula.toLowerCase() === lowerQuery);
        
    if (existing) return;

    try {
        const url = `https://pubchem.ncbi.nlm.org/rest/pug/compound/name/${encodeURIComponent(cleanQuery)}/property/Title,IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        
        const props = data.PropertyTable && data.PropertyTable.Properties && data.PropertyTable.Properties[0];
        if (!props) return;

        const title = props.Title || cleanQuery;
        const formula = props.MolecularFormula || cleanQuery;
        const iupac = props.IUPACName || title;
        const weight = props.MolecularWeight ? parseFloat(props.MolecularWeight).toFixed(3) : 'N/A';
        const cid = props.CID;
        
        const parsed = parseChemicalFormula(formula);
        const compId = `pubchem_${cid || cleanQuery.toLowerCase()}`;
        
        const pubChemComp = {
            id: compId,
            name: title,
            formula: formatFormulaSubscript(formula),
            rawFormula: formula,
            iupacName: iupac,
            type: parsed ? parsed.type : (formula.includes('C') && formula.includes('H') ? 'Organic' : 'Covalent'),
            molarMass: weight !== 'N/A' ? weight : (parsed ? parsed.molarMass : 'N/A'),
            state: 'Solid',
            meltingPoint: 'See PubChem Entry',
            boilingPoint: 'See PubChem Entry',
            density: 'N/A',
            description: `Official chemical record retrieved live from NCBI PubChem database (CID: ${cid || 'N/A'}). IUPAC Name: ${iupac}. Molecular Weight: ${weight} g/mol.`,
            elements: parsed ? parsed.elements : [],
            atoms: parsed ? parsed.atoms : [],
            pubChemCid: cid,
            pubChemImg: cid ? `https://pubchem.ncbi.nlm.org/rest/pug/compound/cid/${cid}/PNG?image_size=300x300` : null,
            isPubChem: true
        };

        if (!dynamicCompoundsList.some(c => c.id === compId)) {
            dynamicCompoundsList.unshift(pubChemComp);
            if (dynamicCompoundsList.length > 15) dynamicCompoundsList.pop();
            renderCompoundsGrid();
            selectCompound(compId);
        }
    } catch (err) {
        console.warn('PubChem search live fetch silent fallback:', err);
    }
}

function getBondTheme(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('covalent')) return { color: '#00d4ff', bg: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(0, 212, 255, 0.4)', tagBg: 'rgba(0, 212, 255, 0.25)' };
    if (t.includes('ionic')) return { color: '#a855f7', bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(168, 85, 247, 0.4)', tagBg: 'rgba(168, 85, 247, 0.25)' };
    if (t.includes('organic')) return { color: '#10b981', bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(16, 185, 129, 0.4)', tagBg: 'rgba(16, 185, 129, 0.25)' };
    if (t.includes('acid')) return { color: '#ef4444', bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(239, 68, 68, 0.4)', tagBg: 'rgba(239, 68, 68, 0.25)' };
    if (t.includes('base')) return { color: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(245, 158, 11, 0.4)', tagBg: 'rgba(245, 158, 11, 0.25)' };
    return { color: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.85))', border: 'rgba(59, 130, 246, 0.4)', tagBg: 'rgba(59, 130, 246, 0.25)' };
}

function renderCompoundsGrid() {
    const gridContainer = document.getElementById('compounds-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    const lowerQuery = compoundSearchQuery.toLowerCase();

    // Check if query is a valid chemical formula to synthesize locally on-the-fly
    if (compoundSearchQuery && compoundSearchQuery.length >= 2) {
        const synthComp = parseChemicalFormula(compoundSearchQuery);
        if (synthComp) {
            if (!dynamicCompoundsList.some(c => c.id === synthComp.id)) {
                dynamicCompoundsList.unshift(synthComp);
            }
        }
    }

    // Combine static catalog + dynamic compounds
    const allCompounds = [...dynamicCompoundsList, ...compoundsData];

    // Deduplicate by ID
    const uniqueMap = new Map();
    allCompounds.forEach(c => {
        if (!uniqueMap.has(c.id)) uniqueMap.set(c.id, c);
    });
    const combinedList = Array.from(uniqueMap.values());

    const catalogFiltered = combinedList.filter(comp => {
        // Filter by Type
        if (compoundFilterType !== 'All') {
            if (compoundFilterType === 'Solid' || compoundFilterType === 'Liquid' || compoundFilterType === 'Gas') {
                if (comp.state !== compoundFilterType) return false;
            } else {
                if (comp.type !== compoundFilterType) return false;
            }
        }

        // Search Query
        if (compoundSearchQuery) {
            const matchName = comp.name.toLowerCase().includes(lowerQuery);
            const matchFormula = comp.formula.toLowerCase().includes(lowerQuery) || (comp.rawFormula && comp.rawFormula.toLowerCase().includes(lowerQuery));
            const matchIupac = comp.iupacName.toLowerCase().includes(lowerQuery);
            if (!matchName && !matchFormula && !matchIupac) return false;
        }

        return true;
    });

    if (catalogFiltered.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; color: rgba(255,255,255,0.7); background: rgba(15, 23, 42, 0.6); border-radius: 14px; border: 1px dashed rgba(0, 212, 255, 0.3);">
                <div style="font-size: 2.8rem; margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(0,212,255,0.4));">🧪</div>
                <div style="font-size: 1.15rem; font-family: var(--font-ui); font-weight: 700; color: #00d4ff;">Searching 110M+ PubChem Compounds...</div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 6px;">Searching live database for "${window.escapeHtml ? window.escapeHtml(compoundSearchQuery) : compoundSearchQuery}". If it's a valid chemical formula (e.g. K2Cr2O7), our engine will synthesize it on-the-fly!</div>
            </div>
        `;
    } else {
        catalogFiltered.forEach(comp => {
            const theme = getBondTheme(comp.type);
            const card = document.createElement('div');
            card.className = `compound-card ${selectedCompoundId === comp.id ? 'active' : ''}`;
            card.dataset.id = comp.id;
            
            card.style.background = theme.bg;
            card.style.borderColor = theme.border;

            const badgePrefix = comp.isPubChem ? '🌐 PubChem' : (comp.isSynthesized ? '✨ Synthesized' : comp.type);

            card.innerHTML = `
                <div class="compound-card-header">
                    <span class="compound-formula-badge" style="border-color: ${theme.color}; color: ${theme.color};">${comp.formula}</span>
                    <span class="compound-type-tag" style="background: ${theme.tagBg}; color: ${theme.color}; border: 1px solid ${theme.border};">${badgePrefix}</span>
                </div>
                <div class="compound-card-title">${comp.name}</div>
                <div class="compound-card-meta">
                    <span>Mass: ${comp.molarMass} g/mol</span>
                    <span class="compound-state-dot state-${comp.state.toLowerCase()}">${comp.state}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.compound-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                selectCompound(comp.id);
            });

            gridContainer.appendChild(card);
        });
    }
}

function selectCompound(id) {
    const comp = compoundsData.find(c => c.id === id) || dynamicCompoundsList.find(c => c.id === id);
    if (!comp) return;

    selectedCompoundId = id;

    // Open floating sidebar on mobile
    const sidebar = document.getElementById('compounds-sidebar');
    if (sidebar) {
        sidebar.classList.add('open', 'mobile-active', 'pos-right');
    }
    if (typeof window.startMoleculeViewer === 'function') {
        window.startMoleculeViewer();
    }
    if (typeof window.resizeMoleculeViewer === 'function') {
        setTimeout(window.resizeMoleculeViewer, 120);
    }

    // Update Header Card
    const nameEl = document.getElementById('comp-detail-name');
    const formulaEl = document.getElementById('comp-detail-formula');
    const iupacEl = document.getElementById('comp-detail-iupac');
    const massEl = document.getElementById('comp-detail-mass');
    const stateEl = document.getElementById('comp-detail-state');
    const descEl = document.getElementById('comp-detail-desc');
    const typeEl = document.getElementById('comp-detail-type');
    const wikiBtn = document.getElementById('comp-wiki-btn');

    if (nameEl) nameEl.textContent = comp.name;
    if (formulaEl) formulaEl.textContent = comp.formula;
    if (iupacEl) iupacEl.textContent = `IUPAC: ${comp.iupacName}`;
    if (massEl) massEl.textContent = `${comp.molarMass} g/mol`;
    if (stateEl) stateEl.textContent = comp.state;
    if (descEl) descEl.textContent = comp.description;
    if (typeEl) typeEl.textContent = comp.type;

    if (wikiBtn) {
        wikiBtn.onclick = () => {
            if (typeof openWikiModal === 'function') {
                openWikiModal(comp.name, comp.formula);
            } else {
                window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(comp.name)}`, '_blank');
            }
        };
    }

    // Physical Properties Table
    const mpEl = document.getElementById('comp-prop-mp');
    const bpEl = document.getElementById('comp-prop-bp');
    const densityEl = document.getElementById('comp-prop-density');
    if (mpEl) mpEl.textContent = comp.meltingPoint;
    if (bpEl) bpEl.textContent = comp.boilingPoint;
    if (densityEl) densityEl.textContent = comp.density;

    // Render Element Composition Bar
    renderElementComposition(comp);

    selectedCompoundObj = comp;

    // Render 3D Molecule
    render3DMolecule(comp);

    // Render Compound Bohr Model
    renderCompoundBohrModel(comp);
}

function renderElementComposition(comp) {
    const container = document.getElementById('comp-element-breakdown');
    if (!container) return;

    container.innerHTML = '';

    // Create stacked percentage bar
    const bar = document.createElement('div');
    bar.className = 'comp-bar-container';

    comp.elements.forEach(el => {
        const seg = document.createElement('div');
        seg.className = 'comp-bar-seg';
        seg.style.width = `${el.massPercent}%`;
        const color = CPK_COLORS[el.atomicNumber] || '#00d4ff';
        seg.style.backgroundColor = color;
        seg.title = `${el.symbol}: ${el.massPercent}% by mass`;
        bar.appendChild(seg);
    });

    container.appendChild(bar);

    // Create legend chips
    const legend = document.createElement('div');
    legend.className = 'comp-legend-chips';

    comp.elements.forEach(el => {
        const chip = document.createElement('div');
        chip.className = 'comp-chip';
        const color = CPK_COLORS[el.atomicNumber] || '#00d4ff';
        chip.innerHTML = `
            <span class="chip-color" style="background:${color};"></span>
            <span class="chip-label"><b>${el.symbol}</b> (${el.count}): ${el.massPercent}%</span>
        `;
        legend.appendChild(chip);
    });

    container.appendChild(legend);
}

function initMoleculeViewer() {
    const canvasContainer = document.getElementById('molecule-canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    canvasContainer.innerHTML = '';

    const width = canvasContainer.clientWidth || 300;
    const height = canvasContainer.clientHeight || 260;

    molScene = new THREE.Scene();
    molCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    molCamera.position.set(0, 0, 4.5);

    molRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    molRenderer.setSize(width, height);
    molRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(molRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    molScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    molScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d4ff, 0.4);
    dirLight2.position.set(-5, -5, -5);
    molScene.add(dirLight2);

    molGroup = new THREE.Group();
    molScene.add(molGroup);

    // Drag Interaction
    const dom = molRenderer.domElement;
    dom.addEventListener('mousedown', (e) => {
        isDraggingMol = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    dom.addEventListener('mousemove', (e) => {
        if (!isDraggingMol || !molGroup) return;
        const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };
        molGroup.rotation.y += deltaMove.x * 0.01;
        molGroup.rotation.x += deltaMove.y * 0.01;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDraggingMol = false; });

    // Touch support
    dom.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDraggingMol = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    dom.addEventListener('touchmove', (e) => {
        if (!isDraggingMol || !molGroup || e.touches.length !== 1) return;
        const deltaMove = { x: e.touches[0].clientX - previousMousePosition.x, y: e.touches[0].clientY - previousMousePosition.y };
        molGroup.rotation.y += deltaMove.x * 0.01;
        molGroup.rotation.x += deltaMove.y * 0.01;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    dom.addEventListener('touchend', () => { isDraggingMol = false; });

    let molRafId = null;
    let isMolRunning = false;

    window.startMoleculeViewer = function() {
        if (isMolRunning) return;
        isMolRunning = true;
        animate();
    };

    window.stopMoleculeViewer = function() {
        isMolRunning = false;
        if (molRafId) {
            cancelAnimationFrame(molRafId);
            molRafId = null;
        }
    };

    // Animation Loop
    function animate() {
        if (!isMolRunning) return;
        molRafId = requestAnimationFrame(animate);
        if (molGroup && isMolRotating && !isDraggingMol) {
            molGroup.rotation.y += 0.005;
        }
        if (molRenderer && molScene && molCamera) {
            molRenderer.render(molScene, molCamera);
        }
    }
    if (typeof currentView !== 'undefined' && currentView === 'compounds') {
        window.startMoleculeViewer();
    }

    function resizeMol() {
        if (!canvasContainer || !molRenderer || !molCamera) return;
        const w = canvasContainer.clientWidth;
        const h = canvasContainer.clientHeight;
        if (w > 0 && h > 0) {
            molCamera.aspect = w / h;
            molCamera.updateProjectionMatrix();
            molRenderer.setSize(w, h);
        }
    }
    window.resizeMoleculeViewer = resizeMol;
    window.addEventListener('resize', resizeMol);
}


/**
 * Analyze compound chemistry and return bond classification details
 */
function getCompoundBondDetails(comp) {
    if (!comp) return { type: 'single', title: '🔗 Single Covalent', badgeClass: 'covalent-single', defaultOrder: 1, desc: '' };
    const f = (comp.formula || '').toUpperCase();
    const id = (comp.id || '').toLowerCase();
    const type = (comp.type || '').toLowerCase();
    const isIonic = type.includes('ionic') || id === 'sodiumchloride' || id === 'magnesiumoxide' || id === 'ironiiioxide' || id === 'aluminumoxide' || id === 'zincoxide';

    if (isIonic) {
        return {
            type: 'ionic',
            title: '⚡ Ionic Bond (Ion Pair)',
            badgeClass: 'ionic',
            defaultOrder: 1,
            desc: 'Complete valence electron transfer: metal loses electron to non-metal, forming stable electrostatic octets.'
        };
    }
    if (f === 'N2' || f === 'CO' || f === 'HCN') {
        const bondTitle = f === 'N2' ? '🔗 Triple Covalent (1× N≡N Bond)' : (f === 'CO' ? '🔗 Triple Covalent (1× C≡O Bond)' : '🔗 Triple Covalent (1× C≡N Bond)');
        return {
            type: 'triple',
            title: bondTitle,
            badgeClass: 'covalent-triple',
            defaultOrder: 3,
            desc: 'Three shared electron pairs (6e⁻) in continuous overlapping σ and 2× π bonding molecular orbitals.'
        };
    }
    if (f === 'CO2' || f === 'O2' || f === 'SO2' || f === 'SO3' || f === 'CH2O' || f === 'C2H4') {
        const doubleCount = f === 'CO2' ? '2× C=O' : (f === 'O2' ? '1× O=O' : (f === 'SO2' ? '2× S=O' : (f === 'C2H4' ? '1× C=C' : '1× C=O')));
        return {
            type: 'double',
            title: `🔗 Double Covalent (${doubleCount} Bonds)`,
            badgeClass: 'covalent-double',
            defaultOrder: 2,
            desc: 'Two shared electron pairs (4e⁻ per double bond) forming continuous shared valence envelopes.'
        };
    }
    const isPolar = f === 'H2O' || f === 'NH3' || f === 'HCL';
    const numBonds = (comp.atoms && comp.atoms.length > 1) ? comp.atoms.length - 1 : 1;
    const bondName = f === 'CH4' ? '4× C–H' : (f === 'H2O' ? '2× O–H' : (f === 'NH3' ? '3× N–H' : (f === 'HCL' ? '1× H–Cl' : `${numBonds}×`)));
    return {
        type: 'single',
        title: isPolar ? `🔗 Polar Covalent (${bondName} Bonds)` : `🔗 Single Covalent (${bondName} Bonds)`,
        badgeClass: 'covalent-single',
        defaultOrder: 1,
        desc: `${numBonds} shared electron pair${numBonds > 1 ? 's' : ''} (2e⁻ each) in continuous shared valence shells.`
    };
}

/**
 * Determine bond order between two specific atoms in a compound
 */
function getBondOrderBetweenAtoms(comp, elemA, elemB, dist) {
    if (!comp) return 1;
    const f = (comp.formula || '').toUpperCase();
    const id = (comp.id || '').toLowerCase();
    const isIonic = (comp.type || '').toLowerCase().includes('ionic') || id === 'sodiumchloride' || id === 'magnesiumoxide';
    if (isIonic) return 1;

    // Hydrogen only ever forms single bonds
    if (elemA === 1 || elemB === 1) return 1;
    // Halogens (F, Cl, Br, I) form single bonds in typical compounds
    if ([9, 17, 35, 53].includes(elemA) || [9, 17, 35, 53].includes(elemB)) return 1;

    // Specific triple bond compounds: N2, CO, HCN
    if (f === 'N2') return 3;
    if (f === 'CO') return 3;
    if (f === 'HCN' && ((elemA === 6 && elemB === 7) || (elemA === 7 && elemB === 6))) return 3;

    // Specific double bond compounds:
    if (f === 'CO2' && ((elemA === 6 && elemB === 8) || (elemA === 8 && elemB === 6))) return 2;
    if (f === 'O2') return 2;
    if (f === 'SO2' && ((elemA === 16 && elemB === 8) || (elemA === 8 && elemB === 16))) return 2;
    if (f === 'SO3' && ((elemA === 16 && elemB === 8) || (elemA === 8 && elemB === 16))) return 2;
    if (f === 'CH2O' && ((elemA === 6 && elemB === 8) || (elemA === 8 && elemB === 6))) return 2;
    if (f === 'C2H4' && elemA === 6 && elemB === 6) return 2;
    if (f === 'CH3COCH3' && ((elemA === 6 && elemB === 8) || (elemA === 8 && elemB === 6))) return 2;
    if (f === 'CH3COOH' && ((elemA === 6 && elemB === 8) || (elemA === 8 && elemB === 6)) && dist < 1.35) return 2;
    if (f === 'CH4N2O' && ((elemA === 6 && elemB === 8) || (elemA === 8 && elemB === 6))) return 2;

    return 1;
}


function render3DMolecule(comp) {
    if (!molGroup || !comp || !comp.atoms) return;

    // Clear previous group
    while (molGroup.children.length > 0) {
        const obj = molGroup.children[0];
        molGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }

    const atoms = comp.atoms;
    const atomSpheres = [];
    const f = (comp.formula || '').toUpperCase();

    // Render Atom Spheres
    atoms.forEach(a => {
        const radius = a.elem === 1 ? 0.28 : (a.elem === 6 ? 0.42 : (a.elem === 8 ? 0.38 : (a.elem === 7 ? 0.40 : 0.45)));
        const geom = new THREE.SphereGeometry(radius, 32, 32);
        const hexColor = (typeof CPK_COLORS !== 'undefined' && CPK_COLORS[a.elem]) ? CPK_COLORS[a.elem] : '#00d4ff';
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(hexColor),
            roughness: 0.3,
            metalness: 0.2
        });

        const sphere = new THREE.Mesh(geom, mat);
        sphere.position.set(a.x, a.y, a.z);
        molGroup.add(sphere);
        atomSpheres.push({ mesh: sphere, pos: new THREE.Vector3(a.x, a.y, a.z), elem: a.elem });
    });

    // Render Bonds between nearby atoms with dynamic bond order (single, double, triple)
    for (let i = 0; i < atomSpheres.length; i++) {
        for (let j = i + 1; j < atomSpheres.length; j++) {
            const a1 = atomSpheres[i];
            const a2 = atomSpheres[j];

            // In chemistry, Hydrogens do not bond with other Hydrogens unless molecule is H2
            if (a1.elem === 1 && a2.elem === 1 && f !== 'H2') continue;

            const p1 = a1.pos;
            const p2 = a2.pos;
            const dist = p1.distanceTo(p2);

            // Connect within covalent bond threshold
            if (dist > 0.4 && dist < 2.05) {
                const order = getBondOrderBetweenAtoms(comp, a1.elem, a2.elem, dist);
                createBondCylinder(p1, p2, molGroup, order);
            }
        }
    }

    // Reset rotation
    molGroup.rotation.set(0, 0, 0);

    // Update 3D Top-Left Indicator Overlay (Color Legend & Bond Types)
    updateCompound3DLegend(comp);
}

/**
 * Render single, double (2 parallel cylinders), or triple (3 parallel cylinders) bond
 */
function createBondCylinder(p1, p2, group, order = 1) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const length = dir.length();
    if (length < 0.01) return;

    const dirNorm = dir.clone().normalize();
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Calculate orthogonal perpendicular vector for parallel cylinders
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(dirNorm.dot(up)) > 0.88) {
        up = new THREE.Vector3(1, 0, 0);
    }
    const perp = new THREE.Vector3().crossVectors(dirNorm, up).normalize();

    const mat = new THREE.MeshStandardMaterial({
        color: 0xdde6ed,
        roughness: 0.35,
        metalness: 0.2
    });

    if (order === 2) {
        // Double Bond: 2 parallel cylinders
        const geom = new THREE.CylinderGeometry(0.052, 0.052, length, 16);
        const offsets = [-0.088, 0.088];
        offsets.forEach(off => {
            const cylinder = new THREE.Mesh(geom, mat);
            cylinder.position.copy(mid).addScaledVector(perp, off);
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
            group.add(cylinder);
        });
    } else if (order === 3) {
        // Triple Bond: 3 parallel cylinders
        const geom = new THREE.CylinderGeometry(0.046, 0.046, length, 16);
        const offsets = [-0.125, 0, 0.125];
        offsets.forEach(off => {
            const cylinder = new THREE.Mesh(geom, mat);
            cylinder.position.copy(mid).addScaledVector(perp, off);
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
            group.add(cylinder);
        });
    } else {
        // Single Bond: 1 central cylinder
        const geom = new THREE.CylinderGeometry(0.075, 0.075, length, 16);
        const cylinder = new THREE.Mesh(geom, mat);
        cylinder.position.copy(mid);
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
        group.add(cylinder);
    }
}

/**
 * Top-left overlay for 3D Molecule View detailing element colors and bond types
 */
function updateCompound3DLegend(comp) {
    const container = document.getElementById('molecule-canvas-container');
    if (!container || !comp) return;

    let overlay = document.getElementById('comp-3d-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'comp-3d-overlay';
        overlay.className = 'comp-3d-overlay';
        container.appendChild(overlay);
    }

    const bond = getCompoundBondDetails(comp);
    const elements = comp.elements || [];

    // Element color chips
    const elChips = elements.map(el => {
        const info = getCompoundElementData(el.atomicNumber);
        const cpk = (typeof CPK_COLORS !== 'undefined' && CPK_COLORS[el.atomicNumber]) ? CPK_COLORS[el.atomicNumber] : '#00d4ff';
        return `
            <div class="comp-3d-el-chip" title="${info.name}">
                <span class="comp-3d-color-dot" style="background:${cpk}"></span>
                <span class="comp-3d-el-symbol">${el.symbol}</span>
                <span class="comp-3d-el-name">${info.name}</span>
            </div>
        `;
    }).join('');

    // Bond representations
    const hasDouble = bond.defaultOrder === 2;
    const hasTriple = bond.defaultOrder === 3;
    const isIonic = bond.type === 'ionic';

    let bondChips = '';
    if (isIonic) {
        bondChips = '<div class="comp-3d-bond-item"><span class="comp-3d-bond-icon ionic">⚡</span> Ionic Pair</div>';
    } else {
        bondChips += '<div class="comp-3d-bond-item"><span class="comp-3d-bond-icon single">━</span> Single (1 cyl)</div>';
        if (hasDouble) {
            bondChips += '<div class="comp-3d-bond-item"><span class="comp-3d-bond-icon double">═</span> Double (2 cyl)</div>';
        }
        if (hasTriple) {
            bondChips += '<div class="comp-3d-bond-item"><span class="comp-3d-bond-icon triple">☰</span> Triple (3 cyl)</div>';
        }
    }

    overlay.innerHTML = `
        <div class="comp-3d-badge ${bond.badgeClass}">${bond.title}</div>
        <div class="comp-3d-legend-group">
            <span class="comp-3d-group-label">ELEMENTS:</span>
            <div class="comp-3d-elements-row">${elChips}</div>
        </div>
        <div class="comp-3d-legend-group">
            <span class="comp-3d-group-label">BONDS:</span>
            <div class="comp-3d-bonds-row">${bondChips}</div>
        </div>
    `;
}


function switchCompoundViewer(mode) {
    currentCompoundViewerMode = mode;
    const tab3d = document.getElementById('comp-tab-3d');
    const tabBohr = document.getElementById('comp-tab-bohr');
    const container3d = document.getElementById('molecule-canvas-container');
    const containerBohr = document.getElementById('compound-bohr-container');
    const hint = document.getElementById('comp-viewer-hint');

    if (mode === 'bohr') {
        if (tab3d) tab3d.classList.remove('active');
        if (tabBohr) tabBohr.classList.add('active');
        if (container3d) container3d.style.display = 'none';
        if (containerBohr) containerBohr.style.display = 'flex';
        if (hint) {
            hint.textContent = 'Electron Shells & Bonding';
            hint.style.color = '#38bdf8';
        }
        if (selectedCompoundObj) {
            renderCompoundBohrModel(selectedCompoundObj);
        }
    } else {
        if (tab3d) tab3d.classList.add('active');
        if (tabBohr) tabBohr.classList.remove('active');
        if (container3d) container3d.style.display = 'block';
        if (containerBohr) containerBohr.style.display = 'none';
        if (hint) {
            hint.textContent = 'Drag to rotate';
            hint.style.color = '#38bdf8';
        }
        if (selectedCompoundObj) {
            render3DMolecule(selectedCompoundObj);
        }
        if (typeof window.startMoleculeViewer === 'function') {
            window.startMoleculeViewer();
        }
        if (typeof window.resizeMoleculeViewer === 'function') {
            window.resizeMoleculeViewer();
            setTimeout(window.resizeMoleculeViewer, 50);
        }
        if (typeof molRenderer !== 'undefined' && molScene && molCamera) {
            molRenderer.render(molScene, molCamera);
        }
    }
}
window.switchCompoundViewer = switchCompoundViewer;

/**
 * Helper to fetch element information from elementsData with robust fallback
 */
function getCompoundElementData(elem) {
    const z = typeof elem === 'number' ? elem : (parseInt(elem) || 0);
    if (typeof elementsData !== 'undefined' && Array.isArray(elementsData)) {
        const found = elementsData.find(e => e.atomicNumber === z || e.symbol === elem);
        if (found) return found;
    }
    // Periodic table fallback shells for common compound elements
    const FALLBACK_SHELLS = {
        1: { symbol: 'H', name: 'Hydrogen', z: 1, shells: [1] },
        6: { symbol: 'C', name: 'Carbon', z: 6, shells: [2, 4] },
        7: { symbol: 'N', name: 'Nitrogen', z: 7, shells: [2, 5] },
        8: { symbol: 'O', name: 'Oxygen', z: 8, shells: [2, 6] },
        9: { symbol: 'F', name: 'Fluorine', z: 9, shells: [2, 7] },
        11: { symbol: 'Na', name: 'Sodium', z: 11, shells: [2, 8, 1] },
        12: { symbol: 'Mg', name: 'Magnesium', z: 12, shells: [2, 8, 2] },
        13: { symbol: 'Al', name: 'Aluminium', z: 13, shells: [2, 8, 3] },
        14: { symbol: 'Si', name: 'Silicon', z: 14, shells: [2, 8, 4] },
        15: { symbol: 'P', name: 'Phosphorus', z: 15, shells: [2, 8, 5] },
        16: { symbol: 'S', name: 'Sulfur', z: 16, shells: [2, 8, 6] },
        17: { symbol: 'Cl', name: 'Chlorine', z: 17, shells: [2, 8, 7] },
        19: { symbol: 'K', name: 'Potassium', z: 19, shells: [2, 8, 8, 1] },
        20: { symbol: 'Ca', name: 'Calcium', z: 20, shells: [2, 8, 8, 2] },
        26: { symbol: 'Fe', name: 'Iron', z: 26, shells: [2, 8, 14, 2] },
        29: { symbol: 'Cu', name: 'Copper', z: 29, shells: [2, 8, 18, 1] },
        30: { symbol: 'Zn', name: 'Zinc', z: 30, shells: [2, 8, 18, 2] },
        35: { symbol: 'Br', name: 'Bromine', z: 35, shells: [2, 8, 18, 7] },
        47: { symbol: 'Ag', name: 'Silver', z: 47, shells: [2, 8, 18, 18, 1] },
        53: { symbol: 'I', name: 'Iodine', z: 53, shells: [2, 8, 18, 18, 7] }
    };
    const fb = FALLBACK_SHELLS[z] || { symbol: String(elem), name: 'Element', z: z || 1, shells: [1] };
    return {
        atomicNumber: fb.z,
        symbol: fb.symbol,
        name: fb.name,
        electronsPerShell: fb.shells
    };
}

/**
 * Render Interactive Bohr Model for Chemical Compounds
 * Features concentric energy levels (K, L, M, N), animated revolving electrons,
 * shared covalent bonding electron pairs in valence overlaps, and ionic electron transfer brackets.
 */

/**
 * Render Advanced Bohr Model for Chemical Compounds
 * Features continuous shared valence bonding shells (CH4 4-lobed contour, H2O bent envelope,
 * CO2 double bonds, N2/HCN triple bonds, and NaCl ionic transfer), clear high-contrast core orbits,
 * revolving core electrons, distinct shared pairs vs non-bonding lone pairs, and top-left bond indicators.
 */
function renderCompoundBohrModel(comp) {
    const container = document.getElementById('compound-bohr-container');
    if (!container || !comp) return;

    const atoms = comp.atoms || [];
    if (atoms.length === 0) {
        container.innerHTML = '<div class="comp-bohr-empty">No 2D atomic coordinates available for this compound.</div>';
        return;
    }

    const svgW = 380;
    const svgH = 220;
    const f = (comp.formula || '').toUpperCase();
    const id = (comp.id || '').toLowerCase();
    const bond = getCompoundBondDetails(comp);
    const isIonic = bond.type === 'ionic';

    let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" class="comp-bohr-svg" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
        <radialGradient id="bohr-bg-grad-${comp.id}" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stop-color="#0a192f" stop-opacity="0.88"/>
            <stop offset="100%" stop-color="#020617" stop-opacity="0.98"/>
        </radialGradient>
        <filter id="bohr-glow-${comp.id}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.0" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="bohr-valence-glow-${comp.id}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="bohr-arrow-${comp.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
    </defs>`;

    svg += `<rect width="${svgW}" height="${svgH}" fill="url(#bohr-bg-grad-${comp.id})" rx="9"/>`;

    // High-Precision Benchmark Layouts
    if (f === 'CH4') {
        const ccx = 205, ccy = 110;
        const hDist = 58;
        const hR = 17;
        const coreR = 20;

        // 1. Continuous 4-lobed Shared Valence Shell connecting Carbon with all 4 Hydrogens in one string
        const pathCH4 = `
            M ${ccx - hR} ${ccy - hDist}
            Q ${ccx} ${ccy - hDist - 20} ${ccx + hR} ${ccy - hDist}
            Q ${ccx + 28} ${ccy - 28} ${ccx + hDist} ${ccy - hR}
            Q ${ccx + hDist + 20} ${ccy} ${ccx + hDist} ${ccy + hR}
            Q ${ccx + 28} ${ccy + 28} ${ccx + hR} ${ccy + hDist}
            Q ${ccx} ${ccy + hDist + 20} ${ccx - hR} ${ccy + hDist}
            Q ${ccx - 28} ${ccy + 28} ${ccx - hDist} ${ccy + hR}
            Q ${ccx - hDist - 20} ${ccy} ${ccx - hDist} ${ccy - hR}
            Q ${ccx - 28} ${ccy - 28} ${ccx - hR} ${ccy - hDist}
            Z
        `.replace(/\s+/g, ' ');

        svg += `<path d="${pathCH4}" fill="rgba(0, 245, 212, 0.08)" stroke="#00f5d4" stroke-width="2.2" filter="url(#bohr-valence-glow-${comp.id})" />`;

        // 2. Carbon Core Orbit K (clearly visible & labeled)
        svg += `<circle cx="${ccx}" cy="${ccy}" r="${coreR}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
        svg += `<text x="${ccx}" y="${ccy - coreR - 3}" fill="#cbd5e1" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">K</text>`;
        for (let e = 0; e < 2; e++) {
            const a = e * 180;
            svg += `
                <g>
                    <animateTransform attributeName="transform" type="rotate" from="${a} ${ccx} ${ccy}" to="${a + 360} ${ccx} ${ccy}" dur="6s" repeatCount="indefinite" />
                    <circle cx="${ccx + coreR}" cy="${ccy}" r="2.8" fill="#e2e8f0" />
                </g>`;
        }

        // Carbon Nucleus
        svg += `<circle cx="${ccx}" cy="${ccy}" r="11" fill="#909090" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${ccx}" y="${ccy + 4}" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">C</text>`;
        svg += `<text x="${ccx}" y="${ccy + 19}" fill="#94a3b8" font-size="6.5" text-anchor="middle" font-family="monospace">6p⁺</text>`;

        // 4 Hydrogens & Shared Electron Pairs (2e⁻ in each lobe)
        const hAtoms = [
            { name: 'H1', cx: ccx, cy: ccy - hDist, angle: -Math.PI / 2 },
            { name: 'H2', cx: ccx + hDist, cy: ccy, angle: 0 },
            { name: 'H3', cx: ccx, cy: ccy + hDist, angle: Math.PI / 2 },
            { name: 'H4', cx: ccx - hDist, cy: ccy, angle: Math.PI }
        ];

        hAtoms.forEach(h => {
            // Nucleus
            svg += `<circle cx="${h.cx}" cy="${h.cy}" r="9" fill="#ffffff" stroke="#38bdf8" stroke-width="1.4" filter="url(#bohr-glow-${comp.id})" />`;
            svg += `<text x="${h.cx}" y="${h.cy + 3.5}" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">H</text>`;
            svg += `<text x="${h.cx}" y="${h.cy + (h.cy > ccy ? 17 : -12)}" fill="#94a3b8" font-size="6.5" text-anchor="middle" font-family="monospace">1p⁺</text>`;

            // Shared 2e⁻ pair in continuous valence lobe
            const mx = (ccx + h.cx) / 2;
            const my = (ccy + h.cy) / 2;
            const px = -Math.sin(h.angle) * 5;
            const py = Math.cos(h.angle) * 5;

            svg += `<circle cx="${mx + px}" cy="${my + py}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
            svg += `<circle cx="${mx - px}" cy="${my - py}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
        });

        svg += `<text x="${ccx}" y="19" fill="#00f5d4" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">Continuous 8e⁻ Shared Valence Shell (4× 2e⁻ Octet)</text>`;

    } else if (f === 'H2O') {
        const ocx = 205, ocy = 120;
        const h1x = 150, h1y = 72;
        const h2x = 260, h2y = 72;
        const coreR = 20;

        // Continuous 2-lobed shared valence shell with lower lone-pair dome
        const pathH2O = `
            M ${h1x - 16} ${h1y}
            Q ${h1x} ${h1y - 19} ${h1x + 16} ${h1y}
            Q ${ocx} ${ocy - 26} ${h2x - 16} ${h2y}
            Q ${h2x} ${h2y - 19} ${h2x + 16} ${h2y}
            Q ${ocx + 48} ${ocy} ${ocx + 38} ${ocy + 28}
            Q ${ocx} ${ocy + 48} ${ocx - 38} ${ocy + 28}
            Q ${ocx - 48} ${ocy} ${h1x - 16} ${h1y}
            Z
        `.replace(/\s+/g, ' ');

        svg += `<path d="${pathH2O}" fill="rgba(0, 245, 212, 0.08)" stroke="#00f5d4" stroke-width="2.2" filter="url(#bohr-valence-glow-${comp.id})" />`;

        // Oxygen Core Orbit K (clearly visible & labeled)
        svg += `<circle cx="${ocx}" cy="${ocy}" r="${coreR}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
        svg += `<text x="${ocx}" y="${ocy - coreR - 3}" fill="#cbd5e1" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">K</text>`;
        for (let e = 0; e < 2; e++) {
            const a = e * 180;
            svg += `
                <g>
                    <animateTransform attributeName="transform" type="rotate" from="${a} ${ocx} ${ocy}" to="${a + 360} ${ocx} ${ocy}" dur="6s" repeatCount="indefinite" />
                    <circle cx="${ocx + coreR}" cy="${ocy}" r="2.8" fill="#e2e8f0" />
                </g>`;
        }

        // Oxygen Nucleus
        svg += `<circle cx="${ocx}" cy="${ocy}" r="12" fill="#ff0d0d" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${ocx}" y="${ocy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">O</text>`;
        svg += `<text x="${ocx}" y="${ocy + 20}" fill="#94a3b8" font-size="6.5" text-anchor="middle" font-family="monospace">8p⁺</text>`;

        // Hydrogens & Shared electron pairs (2e⁻ each)
        [[h1x, h1y], [h2x, h2y]].forEach(([hx, hy]) => {
            svg += `<circle cx="${hx}" cy="${hy}" r="9" fill="#ffffff" stroke="#38bdf8" stroke-width="1.4" filter="url(#bohr-glow-${comp.id})" />`;
            svg += `<text x="${hx}" y="${hy + 3.5}" fill="#0f172a" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">H</text>`;
            svg += `<text x="${hx}" y="${hy - 13}" fill="#94a3b8" font-size="6.5" text-anchor="middle" font-family="monospace">1p⁺</text>`;

            const mx = (ocx + hx) / 2;
            const my = (ocy + hy) / 2;
            const dx = hx - ocx, dy = hy - ocy;
            const dist = Math.hypot(dx, dy);
            const px = (-dy / dist) * 5;
            const py = (dx / dist) * 5;

            svg += `<circle cx="${mx + px}" cy="${my + py}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
            svg += `<circle cx="${mx - px}" cy="${my - py}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
        });

        // 2 Non-bonding Lone Pairs on Oxygen's lower valence arc (in purple #c084fc)
        svg += `<circle cx="${ocx - 22}" cy="${ocy + 32}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${ocx - 14}" cy="${ocy + 36}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${ocx + 14}" cy="${ocy + 36}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${ocx + 22}" cy="${ocy + 32}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${ocx}" y="${ocy + 49}" fill="#c084fc" font-size="7" font-weight="bold" text-anchor="middle" font-family="monospace">2× Lone Pairs (4e⁻)</text>`;

    } else if (f === 'CO2') {
        const ccx = 205, ccy = 110;
        const o1x = 95, o1y = 110;
        const o2x = 315, o2y = 110;
        const coreR = 19;

        // Continuous Double-Bond Shared Valence Shell
        const pathCO2 = `
            M ${o1x} 78
            Q ${o1x - 30} 110 ${o1x} 142
            L ${o2x} 142
            Q ${o2x + 30} 110 ${o2x} 78
            Z
        `.replace(/\s+/g, ' ');

        svg += `<path d="${pathCO2}" fill="rgba(0, 245, 212, 0.08)" stroke="#00f5d4" stroke-width="2.2" filter="url(#bohr-valence-glow-${comp.id})" />`;

        // Core Shells (K=2) for all 3 atoms (clearly visible!)
        [o1x, ccx, o2x].forEach(x => {
            svg += `<circle cx="${x}" cy="${ccy}" r="${coreR}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
            svg += `<text x="${x}" y="${ccy - coreR - 3}" fill="#cbd5e1" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">K</text>`;
            for (let e = 0; e < 2; e++) {
                const a = e * 180;
                svg += `
                    <g>
                        <animateTransform attributeName="transform" type="rotate" from="${a} ${x} ${ccy}" to="${a + 360} ${x} ${ccy}" dur="6s" repeatCount="indefinite" />
                        <circle cx="${x + coreR}" cy="${ccy}" r="2.8" fill="#e2e8f0" />
                    </g>`;
            }
        });

        // Nuclei
        svg += `<circle cx="${o1x}" cy="${ccy}" r="12" fill="#ff0d0d" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${o1x}" y="${ccy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">O</text>`;

        svg += `<circle cx="${ccx}" cy="${ccy}" r="11" fill="#909090" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${ccx}" y="${ccy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">C</text>`;

        svg += `<circle cx="${o2x}" cy="${ccy}" r="12" fill="#ff0d0d" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${o2x}" y="${ccy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">O</text>`;

        // Double Bond 1: 4 shared electrons between O1 and C
        const m1x = (o1x + ccx) / 2;
        [[-8, -8], [-8, 8], [8, -8], [8, 8]].forEach(([ox, oy]) => {
            svg += `<circle cx="${m1x + ox}" cy="${ccy + oy}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
        });
        svg += `<text x="${m1x}" y="${ccy + 24}" fill="#00f5d4" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">4e⁻ shared (O=C)</text>`;

        // Double Bond 2: 4 shared electrons between C and O2
        const m2x = (ccx + o2x) / 2;
        [[-8, -8], [-8, 8], [8, -8], [8, 8]].forEach(([ox, oy]) => {
            svg += `<circle cx="${m2x + ox}" cy="${ccy + oy}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
        });
        svg += `<text x="${m2x}" y="${ccy + 24}" fill="#00f5d4" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">4e⁻ shared (C=O)</text>`;

        // Lone pairs on outer ends of Oxygens
        [[-20, -12], [-20, 12]].forEach(([ox, oy]) => {
            svg += `<circle cx="${o1x + ox}" cy="${ccy + oy}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        });
        [[20, -12], [20, 12]].forEach(([ox, oy]) => {
            svg += `<circle cx="${o2x + ox}" cy="${ccy + oy}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        });

    } else if (f === 'N2' || f === 'CO' || f === 'HCN') {
        const a1x = 150, a2x = 260, cy = 110;
        const coreR = 19;
        const isN2 = f === 'N2';
        const sym1 = isN2 ? 'N' : (f === 'CO' ? 'C' : 'C');
        const sym2 = isN2 ? 'N' : (f === 'CO' ? 'O' : 'N');
        const col1 = isN2 ? '#3050f8' : (f === 'CO' ? '#909090' : '#909090');
        const col2 = isN2 ? '#3050f8' : (f === 'CO' ? '#ff0d0d' : '#3050f8');

        // Continuous Shared Valence Envelope
        const pathTriple = `
            M ${a1x} 76
            Q ${a1x - 32} ${cy} ${a1x} 144
            L ${a2x} 144
            Q ${a2x + 32} ${cy} ${a2x} 76
            Z
        `.replace(/\s+/g, ' ');

        svg += `<path d="${pathTriple}" fill="rgba(0, 245, 212, 0.08)" stroke="#00f5d4" stroke-width="2.2" filter="url(#bohr-valence-glow-${comp.id})" />`;

        // Core Shells
        [a1x, a2x].forEach(x => {
            svg += `<circle cx="${x}" cy="${cy}" r="${coreR}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
            svg += `<text x="${x}" y="${cy - coreR - 3}" fill="#cbd5e1" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">K</text>`;
            for (let e = 0; e < 2; e++) {
                const a = e * 180;
                svg += `
                    <g>
                        <animateTransform attributeName="transform" type="rotate" from="${a} ${x} ${cy}" to="${a + 360} ${x} ${cy}" dur="6s" repeatCount="indefinite" />
                        <circle cx="${x + coreR}" cy="${cy}" r="2.8" fill="#e2e8f0" />
                    </g>`;
            }
        });

        // Nuclei
        svg += `<circle cx="${a1x}" cy="${cy}" r="12" fill="${col1}" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${a1x}" y="${cy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">${sym1}</text>`;

        svg += `<circle cx="${a2x}" cy="${cy}" r="12" fill="${col2}" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${a2x}" y="${cy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">${sym2}</text>`;

        // Triple Bond: 6 shared electrons (3 pairs) in overlap
        const mx = (a1x + a2x) / 2;
        [[-6, -14], [6, -14], [-6, 0], [6, 0], [-6, 14], [6, 14]].forEach(([ox, oy]) => {
            svg += `<circle cx="${mx + ox}" cy="${cy + oy}" r="3.2" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
        });
        svg += `<text x="${mx}" y="${cy + 26}" fill="#00f5d4" font-size="7.5" font-weight="bold" text-anchor="middle" font-family="monospace">6e⁻ shared (3 pairs)</text>`;

        // Lone pair on each outer end
        svg += `<circle cx="${a1x - 22}" cy="${cy - 5}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${a1x - 22}" cy="${cy + 5}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${a2x + 22}" cy="${cy - 5}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<circle cx="${a2x + 22}" cy="${cy + 5}" r="3.2" fill="#c084fc" filter="url(#bohr-glow-${comp.id})" />`;

    } else if (isIonic) {
        // Ionic Compound (e.g. NaCl, MgO)
        const m1x = 135, m2x = 275, cy = 110;
        const cat = comp.elements ? comp.elements[0] : { atomicNumber: 11, symbol: 'Na' };
        const an = comp.elements ? comp.elements[1] : { atomicNumber: 17, symbol: 'Cl' };
        const catInfo = getCompoundElementData(cat.atomicNumber);
        const anInfo = getCompoundElementData(an.atomicNumber);

        // Cation Shells (stable remaining filled shells, e.g. Na+ has K=2, L=8)
        const catShells = [2, 8];
        const catR = [18, 30];
        const catNames = ['K', 'L'];
        catShells.forEach((cnt, idx) => {
            const r = catR[idx];
            svg += `<circle cx="${m1x}" cy="${cy}" r="${r}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
            svg += `<text x="${m1x}" y="${cy - r - 2}" fill="#cbd5e1" font-size="6.5" font-weight="bold" text-anchor="middle" font-family="monospace">${catNames[idx]}</text>`;
            for (let e = 0; e < cnt; e++) {
                const a = (360 / cnt) * e;
                svg += `
                    <g>
                        <animateTransform attributeName="transform" type="rotate" from="${a} ${m1x} ${cy}" to="${a + 360} ${m1x} ${cy}" dur="${(idx + 1) * 4}s" repeatCount="indefinite" />
                        <circle cx="${m1x + r}" cy="${cy}" r="2.8" fill="#cbd5e1" />
                    </g>`;
            }
        });

        // Cation Nucleus
        svg += `<circle cx="${m1x}" cy="${cy}" r="12" fill="${(typeof CPK_COLORS !== 'undefined' && CPK_COLORS[cat.atomicNumber]) ? CPK_COLORS[cat.atomicNumber] : '#ab5cf2'}" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${m1x}" y="${cy + 4.5}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">${catInfo.symbol}</text>`;

        // Square brackets for Cation [Na]+
        svg += `<path d="M ${m1x - 38} ${cy - 38} L ${m1x - 44} ${cy - 38} L ${m1x - 44} ${cy + 38} L ${m1x - 38} ${cy + 38}" fill="none" stroke="#f59e0b" stroke-width="1.8" />`;
        svg += `<path d="M ${m1x + 38} ${cy - 38} L ${m1x + 44} ${cy - 38} L ${m1x + 44} ${cy + 38} L ${m1x + 38} ${cy + 38}" fill="none" stroke="#f59e0b" stroke-width="1.8" />`;
        svg += `<text x="${m1x + 48}" y="${cy - 28}" fill="#f59e0b" font-size="13" font-weight="bold" font-family="monospace">⁺</text>`;

        // Anion Shells (K=2, L=8, M=8 full octet!)
        const anShells = [2, 8, 8];
        const anR = [18, 30, 42];
        const anNames = ['K', 'L', 'M'];
        anShells.forEach((cnt, idx) => {
            const r = anR[idx];
            const isVal = idx === anShells.length - 1;
            const stroke = isVal ? '#00f5d4' : 'rgba(148, 163, 184, 0.82)';
            svg += `<circle cx="${m2x}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${isVal ? 2.0 : 1.6}" stroke-dasharray="${isVal ? 'none' : '3,2'}" />`;
            svg += `<text x="${m2x}" y="${cy - r - 2}" fill="#cbd5e1" font-size="6.5" font-weight="bold" text-anchor="middle" font-family="monospace">${anNames[idx]}</text>`;
            for (let e = 0; e < cnt; e++) {
                const a = (360 / cnt) * e;
                const isTransferred = isVal && e === cnt - 1;
                const eCol = isTransferred ? '#f59e0b' : (isVal ? '#00f5d4' : '#cbd5e1');
                const eR = isTransferred ? 3.8 : 2.8;
                svg += `
                    <g>
                        <animateTransform attributeName="transform" type="rotate" from="${a} ${m2x} ${cy}" to="${a + 360} ${m2x} ${cy}" dur="${(idx + 1) * 4}s" repeatCount="indefinite" />
                        <circle cx="${m2x + r}" cy="${cy}" r="${eR}" fill="${eCol}" ${isTransferred ? `filter="url(#bohr-glow-${comp.id})"` : ''} />
                    </g>`;
            }
        });

        // Anion Nucleus
        svg += `<circle cx="${m2x}" cy="${cy}" r="12" fill="${(typeof CPK_COLORS !== 'undefined' && CPK_COLORS[an.atomicNumber]) ? CPK_COLORS[an.atomicNumber] : '#1ff01f'}" stroke="#ffffff" stroke-width="1.5" filter="url(#bohr-glow-${comp.id})" />`;
        svg += `<text x="${m2x}" y="${cy + 4.5}" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle" font-family="monospace">${anInfo.symbol}</text>`;

        // Square brackets for Anion [Cl]-
        svg += `<path d="M ${m2x - 50} ${cy - 50} L ${m2x - 56} ${cy - 50} L ${m2x - 56} ${cy + 50} L ${m2x - 50} ${cy + 50}" fill="none" stroke="#f59e0b" stroke-width="1.8" />`;
        svg += `<path d="M ${m2x + 50} ${cy - 50} L ${m2x + 56} ${cy - 50} L ${m2x + 56} ${cy + 50} L ${m2x + 50} ${cy + 50}" fill="none" stroke="#f59e0b" stroke-width="1.8" />`;
        svg += `<text x="${m2x + 60}" y="${cy - 38}" fill="#f59e0b" font-size="13" font-weight="bold" font-family="monospace">⁻</text>`;

        // Arched Electron Transfer Vector
        const arcMidX = (m1x + m2x) / 2;
        const arcMidY = cy - 54;
        svg += `<path d="M ${m1x + 25} ${cy - 20} Q ${arcMidX} ${arcMidY} ${m2x - 30} ${cy - 35}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-dasharray="4,3" marker-end="url(#bohr-arrow-${comp.id})" />`;
        svg += `<text x="${arcMidX}" y="${arcMidY - 6}" fill="#f59e0b" font-size="8.5" font-weight="bold" text-anchor="middle" font-family="monospace">e⁻ Transfer ➔</text>`;

    } else {
        // General Multi-Atom Molecule Handler
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        atoms.forEach(a => {
            if (a.x < minX) minX = a.x;
            if (a.x > maxX) maxX = a.x;
            if (a.y < minY) minY = a.y;
            if (a.y > maxY) maxY = a.y;
        });
        const spanX = Math.max(0.7, maxX - minX);
        const spanY = Math.max(0.7, maxY - minY);
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;
        const padX = 64;
        const padY = 52;
        const scale = Math.min((svgW - padX * 2) / spanX, (svgH - padY * 2) / spanY, 80);

        const mappedAtoms = atoms.map((a, idx) => {
            const cx = (svgW / 2 + 15) + (a.x - midX) * scale;
            const cy = (svgH / 2) + (a.y - midY) * scale;
            const elInfo = getCompoundElementData(a.elem);
            const shells = elInfo.electronsPerShell ? [...elInfo.electronsPerShell] : [1];
            const cpk = (typeof CPK_COLORS !== 'undefined' && CPK_COLORS[a.elem]) ? CPK_COLORS[a.elem] : '#00d4ff';
            return { id: idx, elem: a.elem, symbol: elInfo.symbol, atomicNumber: elInfo.atomicNumber, shells, color: cpk, cx, cy };
        });

        // Continuous Valence Overlap Connectors between bonded atoms
        for (let i = 0; i < mappedAtoms.length; i++) {
            for (let j = i + 1; j < mappedAtoms.length; j++) {
                const a1 = mappedAtoms[i];
                const a2 = mappedAtoms[j];
                if (a1.elem === 1 && a2.elem === 1 && f !== 'H2') continue;

                const dist = Math.hypot(a2.cx - a1.cx, a2.cy - a1.cy);

                if (dist < 130 || mappedAtoms.length <= 4) {
                    const ux = (a2.cx - a1.cx) / dist;
                    const uy = (a2.cy - a1.cy) / dist;
                    const px = -uy * 14;
                    const py = ux * 14;
                    const bridgePath = `M ${a1.cx + px} ${a1.cy + py} L ${a2.cx + px} ${a2.cy + py} L ${a2.cx - px} ${a2.cy - py} L ${a1.cx - px} ${a1.cy - py} Z`;
                    svg += `<path d="${bridgePath}" fill="rgba(0, 245, 212, 0.08)" stroke="#00f5d4" stroke-width="1.8" filter="url(#bohr-valence-glow-${comp.id})" />`;

                    // Shared electron pair
                    const mx = (a1.cx + a2.cx) / 2;
                    const my = (a1.cy + a2.cy) / 2;
                    const epx = -uy * 5;
                    const epy = ux * 5;
                    svg += `<circle cx="${mx + epx}" cy="${my + epy}" r="3" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
                    svg += `<circle cx="${mx - epx}" cy="${my - epy}" r="3" fill="#00f5d4" filter="url(#bohr-valence-glow-${comp.id})" />`;
                }
            }
        }

        // Atom Core Shells & Nuclei
        mappedAtoms.forEach(atom => {
            const { cx, cy, symbol, atomicNumber, shells, color } = atom;
            const coreR = 16;

            // Core Shell
            svg += `<circle cx="${cx}" cy="${cy}" r="${coreR}" fill="none" stroke="rgba(148, 163, 184, 0.82)" stroke-width="1.6" stroke-dasharray="3,2" />`;
            svg += `<text x="${cx}" y="${cy - coreR - 2}" fill="#cbd5e1" font-size="6.5" font-weight="bold" text-anchor="middle" font-family="monospace">K</text>`;

            for (let e = 0; e < Math.min(2, shells[0] || 1); e++) {
                const a = e * 180;
                svg += `
                    <g>
                        <animateTransform attributeName="transform" type="rotate" from="${a} ${cx} ${cy}" to="${a + 360} ${cx} ${cy}" dur="6s" repeatCount="indefinite" />
                        <circle cx="${cx + coreR}" cy="${cy}" r="2.5" fill="#e2e8f0" />
                    </g>`;
            }

            // Nucleus
            svg += `<circle cx="${cx}" cy="${cy}" r="11" fill="${color}" stroke="#ffffff" stroke-width="1.4" filter="url(#bohr-glow-${comp.id})" />`;
            const textColor = (atomicNumber === 1 || color === '#ffffff' || color === '#ffff30') ? '#000000' : '#ffffff';
            svg += `<text x="${cx}" y="${cy + 4}" fill="${textColor}" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${symbol}</text>`;
        });
    }

    svg += `</svg>`;

    // Elements Shell & Octet Summary Breakdown Chips
    const elemChips = (comp.elements || []).map(el => {
        const info = getCompoundElementData(el.atomicNumber);
        const shellsStr = info.electronsPerShell ? info.electronsPerShell.join(', ') : '';
        const octetTarget = el.atomicNumber === 1 ? 'Duet (2e⁻)' : 'Octet (8e⁻)';
        const cpk = (typeof CPK_COLORS !== 'undefined' && CPK_COLORS[el.atomicNumber]) ? CPK_COLORS[el.atomicNumber] : '#00d4ff';

        return `
            <div class="comp-bohr-chip" title="${info.name} (${info.symbol}): ${info.atomicNumber} protons">
                <span class="bohr-chip-dot" style="background:${cpk}"></span>
                <div class="bohr-chip-info">
                    <b>${el.symbol} (${el.count}×)</b>: Shells [${shellsStr}]
                    <span class="bohr-chip-octet">➔ ${octetTarget} Complete</span>
                </div>
            </div>
        `;
    }).join('');

    const hasLone = f === 'H2O' || f === 'NH3' || f === 'HCL' || f === 'CO2' || f === 'N2' || f === 'CO';

    container.innerHTML = `
        <div class="comp-bohr-wrapper" style="position: relative;">
            <!-- Top-Left Bohr Model Bond & Orbit Legend -->
            <div class="comp-bohr-top-legend">
                <div class="comp-bohr-bond-badge ${bond.badgeClass}">${bond.title}</div>
                <div class="comp-bohr-legend-pills">
                    <span class="bohr-legend-pill"><span class="pill-dot valence"></span> Shared Valence</span>
                    <span class="bohr-legend-pill"><span class="pill-dot core"></span> Core (K, L)</span>
                    <span class="bohr-legend-pill"><span class="pill-dot shared"></span> Shared e⁻</span>
                    ${hasLone ? '<span class="bohr-legend-pill"><span class="pill-dot lone"></span> Lone Pair</span>' : ''}
                    ${isIonic ? '<span class="bohr-legend-pill"><span class="pill-dot transfer"></span> e⁻ Transfer</span>' : ''}
                </div>
            </div>

            <div class="comp-bohr-header-bar">
                <span class="comp-bohr-type-badge ${isIonic ? 'ionic' : 'covalent'}">
                    ${isIonic ? '⚡ Ionic Electron Transfer' : '🔗 Covalent Shared Valence Orbitals'}
                </span>
                <span class="comp-bohr-octet-badge">✓ Octet / Duet Satisfied</span>
            </div>
            <div class="comp-bohr-svg-wrap">
                ${svg}
            </div>
            <div class="comp-bohr-chips-grid">
                ${elemChips}
            </div>
        </div>
    `;
}

window.renderCompoundBohrModel = renderCompoundBohrModel;
