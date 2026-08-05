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

function initCompoundsView() {
    setupCompoundsEvents();
    renderCompoundsGrid();
    initMoleculeViewer();
    selectCompound('water');
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
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 6px;">Searching live database for "${compoundSearchQuery}". If it's a valid chemical formula (e.g. K2Cr2O7), our engine will synthesize it on-the-fly!</div>
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

    // Render 3D Molecule
    render3DMolecule(comp);
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

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        if (molGroup && isMolRotating && !isDraggingMol) {
            molGroup.rotation.y += 0.005;
        }
        if (molRenderer && molScene && molCamera) {
            molRenderer.render(molScene, molCamera);
        }
    }
    animate();

    window.addEventListener('resize', () => {
        if (!canvasContainer || !molRenderer || !molCamera) return;
        const w = canvasContainer.clientWidth;
        const h = canvasContainer.clientHeight;
        if (w > 0 && h > 0) {
            molCamera.aspect = w / h;
            molCamera.updateProjectionMatrix();
            molRenderer.setSize(w, h);
        }
    });
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


