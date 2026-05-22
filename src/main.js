// Constants & State
let currentTemp = 298; // Kelvin
let tempUnit = 'K';
let currentColorMode = 'category';
let selectedElement = null;

// Grid layout mapping
// Returns { col, row } for an atomic number in the standard 18-col layout
function getGridPosition(z) {
    if (z === 1) return { col: 1, row: 1 };
    if (z === 2) return { col: 18, row: 1 };
    if (z >= 3 && z <= 4) return { col: z - 2, row: 2 };
    if (z >= 5 && z <= 10) return { col: z + 8, row: 2 };
    if (z >= 11 && z <= 12) return { col: z - 10, row: 3 };
    if (z >= 13 && z <= 18) return { col: z + 0, row: 3 };
    if (z >= 19 && z <= 36) return { col: z - 18, row: 4 };
    if (z >= 37 && z <= 54) return { col: z - 36, row: 5 };
    if (z >= 55 && z <= 56) return { col: z - 54, row: 6 };
    if (z >= 72 && z <= 86) return { col: z - 68, row: 6 };
    if (z >= 87 && z <= 88) return { col: z - 86, row: 7 };
    if (z >= 104 && z <= 118) return { col: z - 100, row: 7 };
    
    // Lanthanides
    if (z >= 57 && z <= 71) return { col: z - 53, row: 9 };
    // Actinides
    if (z >= 89 && z <= 103) return { col: z - 85, row: 10 };
    
    return { col: 1, row: 1 }; // Fallback
}

// Category Colors
const categoryColors = {
    'Alkali metal': '#ff6666',
    'Alkaline earth metal': '#ffdead',
    'Transition metal': '#ffc0c0',
    'Post-transition metal': '#cccccc',
    'Metalloid': '#cccc99',
    'Reactive nonmetal': '#a0ffa0',
    'Noble gas': '#c0ffff',
    'Lanthanide': '#ffbfff',
    'Actinide': '#ff99cc',
    'Unknown': '#e8e8e8'
};

// State Colors
const stateColors = {
    'Solid': '#3b82f6', // Blue
    'Liquid': '#f59e0b', // Amber
    'Gas': '#ef4444', // Red
    'Unknown': '#6b7280' // Gray
};

// Initialize Grid
function initGrid() {
    const grid = document.getElementById('periodic-grid');
    grid.innerHTML = '';
    
    // 10 rows (1-7 main, 8 gap, 9 lanth, 10 actin)
    // Create cells for elements 1-118
    for (let i = 1; i <= 118; i++) {
        const elData = getElementByNumber(i);
        const pos = getGridPosition(i);
        
        const cell = document.createElement('div');
        cell.className = 'element-cell';
        cell.dataset.z = i;
        cell.style.gridColumn = pos.col;
        cell.style.gridRow = pos.row;
        
        if (elData) {
            cell.innerHTML = `
                <span class="cell-num">${elData.atomicNumber}</span>
                <span class="cell-sym">${elData.symbol}</span>
                <span class="cell-name">${elData.name}</span>
            `;
            cell.addEventListener('click', () => selectElement(elData.atomicNumber));
        } else {
            // Placeholder for elements not yet in dummy data
            cell.innerHTML = `
                <span class="cell-num">${i}</span>
                <span class="cell-sym">?</span>
                <span class="cell-name">Unknown</span>
            `;
            cell.style.opacity = '0.3';
        }
        
        grid.appendChild(cell);
    }
    
    updateGridColors();
}

// Update colors based on current mode
function updateGridColors() {
    const cells = document.querySelectorAll('.element-cell');
    
    let solidCount = 0, liquidCount = 0, gasCount = 0;

    cells.forEach(cell => {
        const z = parseInt(cell.dataset.z);
        const el = getElementByNumber(z);
        if (!el) return;
        
        if (currentColorMode === 'category') {
            cell.style.backgroundColor = categoryColors[el.category] + '40'; // with opacity
            cell.style.borderColor = categoryColors[el.category];
        } else if (currentColorMode === 'state') {
            // Determine state at currentTemp
            let currentState = 'Unknown';
            if (el.meltingPoint && el.boilingPoint) {
                if (currentTemp < el.meltingPoint) currentState = 'Solid';
                else if (currentTemp >= el.meltingPoint && currentTemp < el.boilingPoint) currentState = 'Liquid';
                else currentState = 'Gas';
            }
            
            cell.style.backgroundColor = stateColors[currentState] + '40';
            cell.style.borderColor = stateColors[currentState];
            
            if (currentState === 'Solid') solidCount++;
            if (currentState === 'Liquid') liquidCount++;
            if (currentState === 'Gas') gasCount++;
        }
        // Additional modes can be added here
    });
    
    if (currentColorMode === 'state') {
        document.getElementById('state-counter').innerText = 
            `${solidCount} Solid / ${liquidCount} Liquid / ${gasCount} Gas`;
    } else {
        document.getElementById('state-counter').innerText = '';
    }
}

// Select Element
function selectElement(z) {
    const el = getElementByNumber(z);
    if (!el) return;
    
    selectedElement = el;
    
    // Highlight in grid
    document.querySelectorAll('.element-cell').forEach(c => c.classList.remove('selected'));
    const cell = document.querySelector(`.element-cell[data-z="${z}"]`);
    if (cell) cell.classList.add('selected');
    
    // UI Updates
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('element-detail-hub').classList.remove('hidden');
    
    document.getElementById('dh-number').innerText = el.atomicNumber;
    document.getElementById('dh-mass').innerText = el.atomicMass;
    document.getElementById('dh-symbol').innerText = el.symbol;
    document.getElementById('dh-name').innerText = el.name;
    document.getElementById('dh-category').innerText = el.category;
    document.getElementById('dh-state').innerText = el.phase;
    
    document.getElementById('dh-category').style.backgroundColor = categoryColors[el.category] + '80';
    
    // Populate Overview
    document.getElementById('dh-discovery-text').innerText = `Discovered in ${el.discoveryYear} by ${el.discoveredBy}.`;
    document.getElementById('dh-appearance-text').innerText = el.appearance || 'Unknown';
    
    const factsList = document.getElementById('dh-facts-list');
    factsList.innerHTML = '';
    if (el.facts) {
        el.facts.forEach(f => {
            const li = document.createElement('li');
            li.innerText = f;
            factsList.appendChild(li);
        });
    }
    
    // Populate Physical (dummy table for now)
    const physTbody = document.getElementById('dh-physical-table');
    physTbody.innerHTML = `
        <tr><td>Melting Point</td><td class="mono-text">${el.meltingPoint} K</td></tr>
        <tr><td>Boiling Point</td><td class="mono-text">${el.boilingPoint} K</td></tr>
        <tr><td>Density</td><td class="mono-text">${el.density} g/cm³</td></tr>
    `;
    
    // Populate Atomic
    document.getElementById('dh-econfig').innerText = el.electronConfiguration;
    document.getElementById('dh-econfig-noble').innerText = el.electronConfigurationNoble;
    
    // Initialize Three.js orbital viewer with default orbital based on element?
    // For now just draw a simple sphere
    drawOrbital();
}

// UI Setup
function setupUI() {
    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentColorMode = e.target.dataset.color;
            updateGridColors();
        });
    });
    
    // Temp slider
    const tempSlider = document.getElementById('temp-slider');
    const tempDisplay = document.getElementById('temp-display');
    tempSlider.addEventListener('input', (e) => {
        currentTemp = parseFloat(e.target.value);
        updateTempDisplay();
        if (currentColorMode === 'state') updateGridColors();
    });
    
    // Temp presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentTemp = parseFloat(e.target.dataset.temp);
            tempSlider.value = currentTemp;
            updateTempDisplay();
            if (currentColorMode === 'state') updateGridColors();
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetId = 'tab-' + e.target.dataset.tab;
            const targetContent = document.getElementById(targetId);
            if(targetContent) {
                targetContent.classList.add('active');
                // Hiding other contents natively by active class is cleaner, wait, standard CSS approach:
                // Actually my CSS had `.hidden { display: none !important; }` but I used `.active` here?
                // Let's modify CSS for tabs dynamically.
            }
        });
    });
}

function updateTempDisplay() {
    let val = currentTemp;
    if (tempUnit === 'C') val = currentTemp - 273.15;
    if (tempUnit === 'F') val = (currentTemp - 273.15) * 9/5 + 32;
    document.getElementById('temp-display').innerText = `${Math.round(val)} ${tempUnit}`;
}

// Three.js Orbital Viewer Placeholder
let scene, camera, renderer, currentMesh;
function initThreeJS() {
    const container = document.getElementById('three-canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0e1a');
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    
    // Handle resize
    window.addEventListener('resize', () => {
        if(container.clientWidth > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
    
    animate();
}

function drawOrbital() {
    if (!scene) return;
    if (currentMesh) scene.remove(currentMesh);
    
    // Dummy sphere for s-orbital placeholder
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00d4ff, 
        transparent: true,
        opacity: 0.6,
        wireframe: true
    });
    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
}

function animate() {
    requestAnimationFrame(animate);
    if (currentMesh) {
        currentMesh.rotation.x += 0.01;
        currentMesh.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}


// Init
window.addEventListener('DOMContentLoaded', () => {
    initGrid();
    setupUI();
    initThreeJS();
    
    // Handle tab CSS in main.js since I missed it in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    `;
    document.head.appendChild(style);
});
