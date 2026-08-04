/**
 * 07_compounds.js
 * Controller for Compounds View & 3D Molecule Renderer using Three.js
 */

let selectedCompoundId = 'water';
let compoundFilterType = 'All';
let compoundSearchQuery = '';
let activeElementFilters = []; // Array of {atomicNumber, symbol}

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
    initSynthesizerUI();
    selectCompound('water');
}

function setupCompoundsEvents() {
    const searchInput = document.getElementById('compound-search-bar');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            compoundSearchQuery = e.target.value.trim().toLowerCase();
            renderCompoundsGrid();
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

    // Sub-Tab Switcher
    const subTabBtns = document.querySelectorAll('.comp-sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subTabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = 'rgba(255,255,255,0.15)';
                b.style.background = 'rgba(255,255,255,0.05)';
                b.style.color = 'rgba(255,255,255,0.7)';
            });
            btn.classList.add('active');
            btn.style.borderColor = '#00d4ff';
            btn.style.background = 'rgba(0, 212, 255, 0.15)';
            btn.style.color = '#00d4ff';

            const subTab = btn.dataset.subtab;
            document.querySelectorAll('.comp-subtab-content').forEach(c => c.style.display = 'none');
            const targetContent = document.getElementById(`comp-subtab-${subTab}`);
            if (targetContent) targetContent.style.display = 'flex';
        });
    });
}

function initSynthesizerUI() {
    const gridContainer = document.getElementById('compounds-periodic-grid');
    const dropzone = document.getElementById('synth-dropzone');
    const clearBtn = document.getElementById('clear-synth-btn');
    if (!gridContainer || !dropzone) return;

    // Render full 118 element selection grid
    gridContainer.innerHTML = '';
    
    for (let i = 1; i <= 118; i++) {
        const elData = typeof getElementByNumber === 'function' ? getElementByNumber(i) : (elementsData ? elementsData[i - 1] : null);
        if (!elData) continue;
        
        const pos = typeof getGridPosition === 'function' ? getGridPosition(i) : { col: (i % 18) || 18, row: Math.ceil(i / 18) };
        const cat = typeof getNormalizedCategory === 'function' ? getNormalizedCategory(elData.category) : 'unknown';
        const color = (typeof categoryColors !== 'undefined' && categoryColors[cat]) ? categoryColors[cat] : '#00d4ff';
        
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.draggable = true;
        cell.dataset.z = i;
        cell.dataset.sym = elData.symbol;
        cell.style.gridColumn = pos.col;
        cell.style.gridRow = pos.row;
        cell.style.cursor = 'pointer';
        cell.style.border = `1px solid ${color}`;
        cell.style.background = typeof getGlossyBackground === 'function' ? getGlossyBackground(color, cat) : 'rgba(15, 23, 42, 0.8)';
        
        cell.innerHTML = `
            <span class="cell-num">${i}</span>
            <span class="cell-sym">${elData.symbol}</span>
            <span class="cell-name">${elData.name}</span>
        `;
        
        // Hover effect
        cell.addEventListener('mouseenter', () => {
            cell.style.boxShadow = `0 0 14px ${color}`;
            cell.style.zIndex = '10';
        });
        cell.addEventListener('mouseleave', () => {
            cell.style.boxShadow = 'none';
            cell.style.zIndex = '1';
        });

        // Click / Tap Fallback
        cell.addEventListener('click', () => {
            addFilterElement(i, elData.symbol, color);
        });
        
        // Drag and Drop
        cell.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ z: i, sym: elData.symbol, color: color }));
            cell.style.opacity = '0.5';
        });
        cell.addEventListener('dragend', () => {
            cell.style.opacity = '1';
        });
        
        gridContainer.appendChild(cell);
    }

    // Clear Button
    if (clearBtn) {
        clearBtn.onclick = () => {
            activeElementFilters = [];
            updateDropzoneUI();
            renderCompoundsGrid();
        };
    }

    // Dropzone logic
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.background = 'rgba(0, 212, 255, 0.15)';
        dropzone.style.borderColor = '#00d4ff';
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = 'rgba(4, 8, 16, 0.6)';
        dropzone.style.borderColor = 'rgba(0, 212, 255, 0.4)';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.background = 'rgba(4, 8, 16, 0.6)';
        dropzone.style.borderColor = 'rgba(0, 212, 255, 0.4)';
        
        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return;
        
        try {
            const data = JSON.parse(dataStr);
            addFilterElement(data.z, data.sym, data.color);
        } catch (err) {
            console.error(err);
        }
    });

    updateDropzoneUI();
}

function addFilterElement(z, sym, color) {
    if (activeElementFilters.some(f => f.atomicNumber == z)) return;
    activeElementFilters.push({ atomicNumber: z, symbol: sym, color: color });
    updateDropzoneUI();
    renderCompoundsGrid();
}

function updateDropzoneUI() {
    const hint = document.getElementById('synth-drop-hint');
    const container = document.getElementById('synth-pills-container');
    const clearBtn = document.getElementById('clear-synth-btn');
    if (!container || !hint) return;
    
    container.innerHTML = '';
    
    if (activeElementFilters.length === 0) {
        hint.style.display = 'inline';
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        hint.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'inline-block';
        
        activeElementFilters.forEach(f => {
            const pill = document.createElement('div');
            pill.style.cssText = `
                background: rgba(0,0,0,0.6); border: 1px solid ${f.color};
                border-radius: 20px; padding: 4px 12px;
                display: flex; align-items: center; gap: 8px;
                color: ${f.color}; font-weight: bold; font-family: var(--font-mono);
                animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 0 10px ${f.color}44;
            `;
            pill.innerHTML = `
                ${f.symbol} (${f.atomicNumber})
                <span class="remove-synth-btn" style="cursor: pointer; background: rgba(255,255,255,0.2); width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #fff;">&times;</span>
            `;
            
            pill.querySelector('.remove-synth-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                activeElementFilters = activeElementFilters.filter(el => el.atomicNumber != f.atomicNumber);
                updateDropzoneUI();
                renderCompoundsGrid();
            });
            
            container.appendChild(pill);
        });
    }
}

function renderCompoundsGrid() {
    const gridContainer = document.getElementById('compounds-grid');
    const synthGridContainer = document.getElementById('synth-compounds-grid');
    const countBadge = document.getElementById('synth-count-badge');
    
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    if (synthGridContainer) synthGridContainer.innerHTML = '';

    const filtered = compoundsData.filter(comp => {
        // Filter by Type
        if (compoundFilterType !== 'All') {
            if (compoundFilterType === 'Solid' || compoundFilterType === 'Liquid' || compoundFilterType === 'Gas') {
                if (comp.state !== compoundFilterType) return false;
            } else {
                if (comp.type !== compoundFilterType) return false;
            }
        }

        // Filter by Element(s)
        if (activeElementFilters.length > 0) {
            // Must contain ALL dragged elements
            const containsAll = activeElementFilters.every(activeEl => {
                return comp.elements.some(e => e.atomicNumber == activeEl.atomicNumber || e.symbol.toLowerCase() === activeEl.symbol.toLowerCase());
            });
            if (!containsAll) return false;
        }

        // Search Query
        if (compoundSearchQuery) {
            const matchName = comp.name.toLowerCase().includes(compoundSearchQuery);
            const matchFormula = comp.formula.toLowerCase().includes(compoundSearchQuery);
            const matchIupac = comp.iupacName.toLowerCase().includes(compoundSearchQuery);
            if (!matchName && !matchFormula && !matchIupac) return false;
        }

        return true;
    });

    if (countBadge) {
        countBadge.textContent = `${filtered.length} Compounds Participating`;
    }

    const emptyHtml = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: rgba(255,255,255,0.5);">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🧪</div>
            <div style="font-size: 1.1rem; font-family: var(--font-ui);">No compounds found matching your filter</div>
        </div>
    `;

    if (filtered.length === 0) {
        gridContainer.innerHTML = emptyHtml;
        if (synthGridContainer) synthGridContainer.innerHTML = emptyHtml;
        return;
    }

    filtered.forEach(comp => {
        const createCard = () => {
            const card = document.createElement('div');
            card.className = `compound-card ${selectedCompoundId === comp.id ? 'active' : ''}`;
            card.dataset.id = comp.id;

            card.innerHTML = `
                <div class="compound-card-header">
                    <span class="compound-formula-badge">${comp.formula}</span>
                    <span class="compound-type-tag">${comp.type}</span>
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

            return card;
        };

        gridContainer.appendChild(createCard());
        if (synthGridContainer) synthGridContainer.appendChild(createCard());
    });
}

function selectCompound(id) {
    const comp = compoundsData.find(c => c.id === id);
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

// Auto-initialize Synthesizer UI when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initSynthesizerUI();
});
