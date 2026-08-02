/**
 * 10_crystals.js
 * 3D Crystal Lattice & Solid-State Physics Renderer using Three.js
 */

let selectedCrystalId = 'fcc';
let crystalMode = 'unitcell'; // 'unitcell' or 'supercell'
let selectedMillerPlane = 'none'; // 'none', '100', '110', '111'

// Three.js Crystal Viewer Globals
let crystalScene = null;
let crystalCamera = null;
let crystalRenderer = null;
let crystalGroup = null;
let crystalRotating = true;
let isDraggingCrystal = false;
let prevCrystalMousePos = { x: 0, y: 0 };

function initCrystalsView() {
    setupCrystalsUI();
    renderCrystalsList();
    initCrystal3DViewer();
    selectCrystalSystem('fcc');
}

function setupCrystalsUI() {
    const unitBtn = document.getElementById('btn-mode-unitcell');
    const superBtn = document.getElementById('btn-mode-supercell');

    if (unitBtn && superBtn) {
        unitBtn.onclick = () => {
            unitBtn.classList.add('active');
            superBtn.classList.remove('active');
            crystalMode = 'unitcell';
            const comp = crystalSystemsData.find(c => c.id === selectedCrystalId);
            if (comp) render3DCrystal(comp);
        };
        superBtn.onclick = () => {
            superBtn.classList.add('active');
            unitBtn.classList.remove('active');
            crystalMode = 'supercell';
            const comp = crystalSystemsData.find(c => c.id === selectedCrystalId);
            if (comp) render3DCrystal(comp);
        };
    }

    const planeBtns = document.querySelectorAll('.miller-btn');
    planeBtns.forEach(btn => {
        btn.onclick = (e) => {
            planeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMillerPlane = btn.dataset.plane || 'none';
            const comp = crystalSystemsData.find(c => c.id === selectedCrystalId);
            if (comp) render3DCrystal(comp);
        };
    });
}

function renderCrystalsList() {
    const container = document.getElementById('crystals-list-grid');
    if (!container) return;

    container.innerHTML = '';

    crystalSystemsData.forEach(sys => {
        const card = document.createElement('div');
        card.className = `crystal-card ${selectedCrystalId === sys.id ? 'active' : ''}`;
        card.dataset.id = sys.id;

        card.innerHTML = `
            <div class="crystal-card-title">${sys.name}</div>
            <div class="crystal-card-meta">
                <span>System: ${sys.system}</span>
                <span class="packing-badge">${sys.packingEfficiency}</span>
            </div>
        `;

        card.onclick = () => {
            document.querySelectorAll('.crystal-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectCrystalSystem(sys.id);
        };

        container.appendChild(card);
    });
}

function selectCrystalSystem(id) {
    const sys = crystalSystemsData.find(c => c.id === id);
    if (!sys) return;

    selectedCrystalId = id;

    // Update Text Details
    const nameEl = document.getElementById('crystal-detail-name');
    const systemEl = document.getElementById('crystal-detail-system');
    const packEl = document.getElementById('crystal-detail-packing');
    const coordEl = document.getElementById('crystal-detail-coord');
    const egEl = document.getElementById('crystal-detail-examples');
    const descEl = document.getElementById('crystal-detail-desc');

    if (nameEl) nameEl.textContent = sys.name;
    if (systemEl) systemEl.textContent = sys.system;
    if (packEl) packEl.textContent = sys.packingEfficiency;
    if (coordEl) coordEl.textContent = sys.coordinationNumber;
    if (egEl) egEl.textContent = sys.examples;
    if (descEl) descEl.textContent = sys.description;

    render3DCrystal(sys);
}

function initCrystal3DViewer() {
    const canvasContainer = document.getElementById('crystal-canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    canvasContainer.innerHTML = '';

    const width = canvasContainer.clientWidth || 400;
    const height = canvasContainer.clientHeight || 350;

    crystalScene = new THREE.Scene();
    crystalCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    crystalCamera.position.set(2.5, 2.5, 4.5);
    crystalCamera.lookAt(0, 0, 0);

    crystalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    crystalRenderer.setSize(width, height);
    crystalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(crystalRenderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    crystalScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(5, 10, 7);
    crystalScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00d4ff, 0.5);
    dirLight2.position.set(-5, -5, -5);
    crystalScene.add(dirLight2);

    crystalGroup = new THREE.Group();
    crystalScene.add(crystalGroup);

    // Mouse Controls
    const dom = crystalRenderer.domElement;
    dom.addEventListener('mousedown', (e) => {
        isDraggingCrystal = true;
        prevCrystalMousePos = { x: e.clientX, y: e.clientY };
    });
    dom.addEventListener('mousemove', (e) => {
        if (!isDraggingCrystal || !crystalGroup) return;
        const delta = { x: e.clientX - prevCrystalMousePos.x, y: e.clientY - prevCrystalMousePos.y };
        crystalGroup.rotation.y += delta.x * 0.01;
        crystalGroup.rotation.x += delta.y * 0.01;
        prevCrystalMousePos = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDraggingCrystal = false; });

    // Touch Controls
    dom.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDraggingCrystal = true;
            prevCrystalMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    });
    dom.addEventListener('touchmove', (e) => {
        if (!isDraggingCrystal || !crystalGroup || e.touches.length !== 1) return;
        const delta = { x: e.touches[0].clientX - prevCrystalMousePos.x, y: e.touches[0].clientY - prevCrystalMousePos.y };
        crystalGroup.rotation.y += delta.x * 0.01;
        crystalGroup.rotation.x += delta.y * 0.01;
        prevCrystalMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    dom.addEventListener('touchend', () => { isDraggingCrystal = false; });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        if (crystalGroup && crystalRotating && !isDraggingCrystal) {
            crystalGroup.rotation.y += 0.004;
        }
        if (crystalRenderer && crystalScene && crystalCamera) {
            crystalRenderer.render(crystalScene, crystalCamera);
        }
    }
    animate();

    window.addEventListener('resize', () => {
        if (!canvasContainer || !crystalRenderer || !crystalCamera) return;
        const w = canvasContainer.clientWidth;
        const h = canvasContainer.clientHeight;
        if (w > 0 && h > 0) {
            crystalCamera.aspect = w / h;
            crystalCamera.updateProjectionMatrix();
            crystalRenderer.setSize(w, h);
        }
    });
}

function render3DCrystal(sys) {
    if (!crystalGroup || !sys || !sys.unitCellAtoms) return;

    // Clear previous elements
    while (crystalGroup.children.length > 0) {
        const obj = crystalGroup.children[0];
        crystalGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }

    const scale = 1.6;
    const offset = new THREE.Vector3(-0.5 * scale, -0.5 * scale, -0.5 * scale);

    const isSuper = crystalMode === 'supercell';
    const numCopies = isSuper ? 2 : 1;

    // Generate Unit Cell or 2x2x2 Supercell
    for (let cx = 0; cx < numCopies; cx++) {
        for (let cy = 0; cy < numCopies; cy++) {
            for (let cz = 0; cz < numCopies; cz++) {
                
                // Draw Unit Cell Wireframe Box
                const boxGeom = new THREE.BoxGeometry(scale, scale, scale);
                const edges = new THREE.EdgesGeometry(boxGeom);
                const lineMat = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: isSuper ? 0.25 : 0.6 });
                const wireframe = new THREE.LineSegments(edges, lineMat);
                wireframe.position.set(
                    (cx + 0.5) * scale + offset.x,
                    (cy + 0.5) * scale + offset.y,
                    (cz + 0.5) * scale + offset.z
                );
                crystalGroup.add(wireframe);

                // Draw Atoms
                sys.unitCellAtoms.forEach(a => {
                    const radius = sys.id === 'nacl-rock-salt' ? (a.elem === 'Na' ? 0.16 : 0.26) : 0.22;
                    const geom = new THREE.SphereGeometry(radius, 32, 32);
                    
                    let hexColor = '#00d4ff';
                    if (a.elem === 'Cu') hexColor = '#c88033';
                    else if (a.elem === 'Fe') hexColor = '#e06633';
                    else if (a.elem === 'Mg') hexColor = '#8aff00';
                    else if (a.elem === 'C') hexColor = '#909090';
                    else if (a.elem === 'Na') hexColor = '#ab5cf2';
                    else if (a.elem === 'Cl') hexColor = '#1ff01f';

                    const mat = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(hexColor),
                        roughness: 0.3,
                        metalness: 0.4
                    });

                    const sphere = new THREE.Mesh(geom, mat);
                    sphere.position.set(
                        (cx + a.x) * scale + offset.x,
                        (cy + a.y) * scale + offset.y,
                        (cz + a.z) * scale + offset.z
                    );
                    crystalGroup.add(sphere);
                });
            }
        }
    }

    // Render Miller Plane overlay if selected
    if (selectedMillerPlane !== 'none' && sys.millerPlanes && sys.millerPlanes[selectedMillerPlane]) {
        const pts = sys.millerPlanes[selectedMillerPlane].map(p => new THREE.Vector3(p.x * scale + offset.x, p.y * scale + offset.y, p.z * scale + offset.z));
        
        if (pts.length >= 3) {
            const planeGeom = new THREE.BufferGeometry().setFromPoints(pts);
            const planeMat = new THREE.MeshBasicMaterial({
                color: 0xfacc15,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.45
            });
            const planeMesh = new THREE.Mesh(planeGeom, planeMat);
            crystalGroup.add(planeMesh);
        }
    }

    // Adjust camera position
    crystalCamera.position.set(isSuper ? 4 : 2.5, isSuper ? 4 : 2.5, isSuper ? 7 : 4.5);
    crystalCamera.lookAt(0, 0, 0);
    crystalGroup.rotation.set(0, 0, 0);
}
