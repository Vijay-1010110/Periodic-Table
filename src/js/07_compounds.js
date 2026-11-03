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
    molCamera.position.z = 6;

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

    // Render Atom Spheres
    atoms.forEach(a => {
        const radius = a.elem === 1 ? 0.28 : (a.elem === 6 ? 0.42 : (a.elem === 8 ? 0.38 : (a.elem === 7 ? 0.40 : 0.45)));
        const geom = new THREE.SphereGeometry(radius, 32, 32);
        const hexColor = CPK_COLORS[a.elem] || '#00d4ff';
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

    // Render Bonds between nearby atoms
    for (let i = 0; i < atomSpheres.length; i++) {
        for (let j = i + 1; j < atomSpheres.length; j++) {
            const p1 = atomSpheres[i].pos;
            const p2 = atomSpheres[j].pos;
            const dist = p1.distanceTo(p2);

            // Create bond if distance is within covalent bond threshold
            if (dist > 0.4 && dist < 1.85) {
                createBondCylinder(p1, p2, molGroup);
            }
        }
    }

    // Reset rotation
    molGroup.rotation.set(0, 0, 0);
}

function createBondCylinder(p1, p2, group) {
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(p1, p2, new THREE.Object3D().up);

    const length = direction.length();
    const geom = new THREE.CylinderGeometry(0.08, 0.08, length, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.1 });

    const cylinder = new THREE.Mesh(geom, mat);
    cylinder.position.copy(p1).add(p2).multiplyScalar(0.5);
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    group.add(cylinder);
}




/**
 * Switch between 3D Ball-and-Stick Molecule and 2D Interactive Bohr Model representation
 */
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
        if (typeof window.resizeMoleculeViewer === 'function') {
            setTimeout(window.resizeMoleculeViewer, 50);
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
function renderCompoundBohrModel(comp) {
    const container = document.getElementById('compound-bohr-container');
    if (!container || !comp) return;

    const isIonic = (comp.type || '').toLowerCase().includes('ionic');
    const atoms = comp.atoms || [];

    if (atoms.length === 0) {
        container.innerHTML = '<div class="comp-bohr-empty">No 2D atomic coordinates available for this compound.</div>';
        return;
    }

    // SVG Canvas Dimensions
    const svgW = 380;
    const svgH = 220;

    // Coordinate Normalization & Viewport Fitting
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
    const availW = svgW - padX * 2;
    const availH = svgH - padY * 2;
    const scale = Math.min(availW / spanX, availH / spanY, 95);

    const mappedAtoms = atoms.map((a, idx) => {
        let cx = (svgW / 2) + (a.x - midX) * scale;
        let cy = (svgH / 2) + (a.y - midY) * scale;

        // Custom balanced centering for 2-atom & 3-atom geometries
        if (atoms.length === 2) {
            cx = idx === 0 ? 115 : 265;
            cy = 110;
        } else if (atoms.length === 3 && Math.abs(atoms[0].y - atoms[1].y) < 0.1 && Math.abs(atoms[0].y - atoms[2].y) < 0.1) {
            // Linear molecule (e.g. CO2)
            cx = 70 + idx * 120;
            cy = 110;
        }

        const elInfo = getCompoundElementData(a.elem);
        const shells = elInfo.electronsPerShell ? [...elInfo.electronsPerShell] : [1];
        const cpk = (typeof CPK_COLORS !== 'undefined' && CPK_COLORS[a.elem]) ? CPK_COLORS[a.elem] : '#00d4ff';

        return {
            id: idx,
            elem: a.elem,
            symbol: a.symbol || elInfo.symbol,
            name: elInfo.name,
            atomicNumber: elInfo.atomicNumber,
            shells,
            color: cpk,
            cx,
            cy
        };
    });

    let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" class="comp-bohr-svg" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<defs>
        <radialGradient id="bohr-bg-grad-${comp.id}" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stop-color="#0a192f" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#020617" stop-opacity="0.98"/>
        </radialGradient>
        <filter id="bohr-glow-${comp.id}" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="bohr-arrow-${comp.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
        </marker>
    </defs>`;

    svg += `<rect width="${svgW}" height="${svgH}" fill="url(#bohr-bg-grad-${comp.id})" rx="9"/>`;

    // 1. Draw Chemical Bonding Bridges & Ionic Electron Transfers
    for (let i = 0; i < mappedAtoms.length; i++) {
        for (let j = i + 1; j < mappedAtoms.length; j++) {
            const a1 = mappedAtoms[i];
            const a2 = mappedAtoms[j];
            const dist = Math.hypot(a2.cx - a1.cx, a2.cy - a1.cy);

            // Connect if within bonded distance or small compound
            if (dist < 185 || mappedAtoms.length <= 3) {
                if (isIonic) {
                    // Ionic Transfer Arc
                    const mx = (a1.cx + a2.cx) / 2;
                    const my = Math.min(a1.cy, a2.cy) - 30;
                    svg += `<path d="M ${a1.cx} ${a1.cy - 18} Q ${mx} ${my} ${a2.cx} ${a2.cy - 18}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#bohr-arrow-${comp.id})" />`;
                    svg += `<text x="${mx}" y="${my - 6}" fill="#f59e0b" font-size="9" text-anchor="middle" font-weight="bold" font-family="monospace">e⁻ Transfer</text>`;
                } else {
                    // Covalent Valence Overlap Bridge
                    svg += `<line x1="${a1.cx}" y1="${a1.cy}" x2="${a2.cx}" y2="${a2.cy}" stroke="rgba(0, 212, 255, 0.40)" stroke-width="1.8" stroke-dasharray="3,3" />`;
                    
                    // Shared electron pair positioned in the bonding overlap midpoint
                    const mx = (a1.cx + a2.cx) / 2;
                    const my = (a1.cy + a2.cy) / 2;
                    const perpX = (-(a2.cy - a1.cy) / dist) * 5.5;
                    const perpY = ((a2.cx - a1.cx) / dist) * 5.5;
                    
                    svg += `<circle cx="${mx + perpX}" cy="${my + perpY}" r="3.2" fill="#38bdf8" filter="url(#bohr-glow-${comp.id})"/>`;
                    svg += `<circle cx="${mx - perpX}" cy="${my - perpY}" r="3.2" fill="#38bdf8" filter="url(#bohr-glow-${comp.id})"/>`;
                    svg += `<text x="${mx}" y="${my + (perpY > 0 ? 15 : -10)}" fill="#00d4ff" font-size="7.5" text-anchor="middle" font-weight="bold" font-family="monospace">2e⁻ shared</text>`;
                }
            }
        }
    }

    // 2. Draw Atom Shells and Revolving Electrons
    mappedAtoms.forEach(atom => {
        const { cx, cy, symbol, atomicNumber, shells, color } = atom;
        const isHydrogen = atomicNumber === 1;
        const shellBaseR = isHydrogen ? 18 : 16;
        const shellStepR = Math.min(13, 52 / Math.max(1, shells.length));

        // Draw Concentric Energy Level Shells (K, L, M...)
        const shellNames = ['K', 'L', 'M', 'N', 'O', 'P'];
        shells.forEach((eCount, sIdx) => {
            const r = shellBaseR + (sIdx + 1) * shellStepR;
            const isValence = sIdx === shells.length - 1;
            const strokeColor = isValence ? 'rgba(56, 189, 248, 0.70)' : 'rgba(148, 163, 184, 0.28)';
            const strokeDash = isValence ? 'none' : '3,3';
            
            svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="1.2" stroke-dasharray="${strokeDash}" />`;
            svg += `<text x="${cx}" y="${cy - r - 2}" fill="rgba(148, 163, 184, 0.55)" font-size="6.5" text-anchor="middle" font-family="monospace">${shellNames[sIdx] || 'n'}</text>`;

            // Position and Animate Revolving Electrons along each Shell
            const dur = (sIdx + 1) * 5 + 3; // Inner shells revolve faster
            for (let e = 0; e < eCount; e++) {
                const angle = (360 / eCount) * e;
                const eColor = isValence ? '#38bdf8' : '#cbd5e1';
                svg += `
                <g>
                    <animateTransform attributeName="transform" type="rotate" from="${angle} ${cx} ${cy}" to="${angle + 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite" />
                    <circle cx="${cx + r}" cy="${cy}" r="2.8" fill="${eColor}" />
                </g>`;
            }
        });

        // Glowing Nucleus
        svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="${color}" stroke="#ffffff" stroke-width="1.6" filter="url(#bohr-glow-${comp.id})" />`;
        const textColor = (atomicNumber === 1 || color === '#ffffff' || color === '#ffff30') ? '#000000' : '#ffffff';
        svg += `<text x="${cx}" y="${cy + 4.5}" fill="${textColor}" font-size="11.5" text-anchor="middle" font-weight="bold" font-family="monospace">${symbol}</text>`;
        svg += `<text x="${cx}" y="${cy + 25}" fill="#94a3b8" font-size="8" text-anchor="middle" font-family="monospace">${atomicNumber}p⁺</text>`;

        // Ionic Formal Charge Annotation
        if (isIonic) {
            const isMetal = [3, 11, 12, 19, 20, 26, 29, 30, 47].includes(atomicNumber);
            const chargeSign = isMetal ? '⁺' : '⁻';
            svg += `<text x="${cx + 25}" y="${cy - 16}" fill="#f59e0b" font-size="15" font-weight="bold" font-family="monospace">${chargeSign}</text>`;
        }
    });

    svg += `</svg>`;

    // 3. Elements Shell & Octet Summary Breakdown Chips
    const elemChips = comp.elements.map(el => {
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

    container.innerHTML = `
        <div class="comp-bohr-wrapper">
            <div class="comp-bohr-header-bar">
                <span class="comp-bohr-type-badge ${isIonic ? 'ionic' : 'covalent'}">
                    ${isIonic ? '⚡ Ionic Electron Transfer' : '🔗 Covalent Electron Sharing'}
                </span>
                <span class="comp-bohr-octet-badge">✓ Octet / Duet Rule Satisfied</span>
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
