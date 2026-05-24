window.OrbitalViewer = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animationId: null,
    currentOrbitalGroup: null,
    slicePlane: null,
    currentElementRadius: 100, // default 100 pm

    init: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.renderer) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#0a0e1a');
        
        let width = container.clientWidth || 300;
        let height = container.clientHeight || 200;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.z = 8;
        this.camera.position.y = 2;
        this.camera.lookAt(0,0,0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.localClippingEnabled = true; // Enable slicing
        container.appendChild(this.renderer.domElement);

        const light = new THREE.PointLight(0xffffff, 1.2, 100);
        light.position.set(10, 10, 10);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x606060));
        
        const axesHelper = new THREE.AxesHelper(3);
        this.scene.add(axesHelper);

        if (window.THREE && THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.enablePan = false;
        }

        // Initialize slicing plane (cuts away Z > 0 half)
        this.slicePlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.1);

        window.addEventListener('resize', () => this.resize());

        // Setup UI listener for slicing toggle
        const sliceToggle = document.getElementById('slice-orbital');
        if (sliceToggle) {
            sliceToggle.addEventListener('change', () => this.drawOrbital());
        }

        this.animate();
        this.drawOrbital();
    },

    resize: function() {
        const container = document.getElementById('three-canvas-container');
        if (!container || !this.camera || !this.renderer) return;
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        }
    },

    setElement: function(elData) {
        if (!elData) return;
        // Try to get empirical or calculated radius, fallback to 100 pm
        let r = 100;
        if (elData.radius) {
            if (elData.radius.calculated) r = elData.radius.calculated;
            else if (elData.radius.empirical) r = elData.radius.empirical;
            else if (elData.radius.covalent) r = elData.radius.covalent;
        }
        this.currentElementRadius = r;
        this.drawOrbital();
    },

    drawOrbital: function() {
        if (!this.scene) return;
        if (this.currentOrbitalGroup) this.scene.remove(this.currentOrbitalGroup);
        
        this.currentOrbitalGroup = new THREE.Group();
        
        const nEl = document.getElementById('orbital-n');
        const lEl = document.getElementById('orbital-l');
        const mlEl = document.getElementById('orbital-ml');
        const sliceToggle = document.getElementById('slice-orbital');
        
        if(!nEl || !lEl || !mlEl) return;

        const n = parseInt(nEl.value);
        const l = parseInt(lEl.value);
        const mlVal = mlEl.value;
        const doSlice = sliceToggle ? sliceToggle.checked : false;

        // Visual properties
        const colorBlue = 0x00d4ff;
        const colorRed = 0xef4444;
        const colorGreen = 0x22c55e;
        const opacityVal = doSlice ? 0.9 : 0.8;
        
        const clippingPlanes = doSlice ? [this.slicePlane] : [];

        const layers = Math.max(1, n - l);
        const maxRadius = this.currentElementRadius / 100.0;

        // Custom function to create a mathematically accurate, "fat" solid mesh for any orbital
        const createOrbitalGeometry = (lType, mType, radius, colorPosHex, colorNegHex, isAllView) => {
            const geom = new THREE.SphereGeometry(radius, 64, 64);
            const pos = geom.attributes.position;
            const colors = [];
            const colorP = new THREE.Color(colorPosHex);
            const colorN = new THREE.Color(colorNegHex);
            
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const z = pos.getZ(i);
                
                const nx = x / radius;
                const ny = y / radius;
                const nz = z / radius;
                
                let Y = 0;
                if (lType === 0) {
                    Y = 1.0;
                } else if (lType === 1) {
                    if (mType === 0) Y = ny;
                    else if (mType === 1) Y = nx;
                    else if (mType === -1) Y = nz;
                } else if (lType === 2) {
                    if (mType === 0) Y = (3.0 * ny * ny - 1.0) / 2.0;
                    else if (mType === 1) Y = Math.sqrt(3.0) * nx * ny;
                    else if (mType === -1) Y = Math.sqrt(3.0) * nz * ny;
                    else if (mType === 2) Y = Math.sqrt(3.0) / 2.0 * (nx * nx - nz * nz);
                    else if (mType === -2) Y = Math.sqrt(3.0) * nx * nz;
                } else if (lType === 3) {
                    if (mType === 0) Y = 0.5 * ny * (5.0 * ny * ny - 3.0);
                    else if (mType === 1) Y = Math.sqrt(6.0)/4.0 * nx * (5.0 * ny * ny - 1.0);
                    else if (mType === -1) Y = Math.sqrt(6.0)/4.0 * nz * (5.0 * ny * ny - 1.0);
                    else if (mType === 2) Y = Math.sqrt(15.0)/2.0 * ny * (nx * nx - nz * nz);
                    else if (mType === -2) Y = Math.sqrt(15.0) * nx * ny * nz;
                    else if (mType === 3) Y = Math.sqrt(10.0)/4.0 * nx * (nx * nx - 3.0 * nz * nz);
                    else if (mType === -3) Y = Math.sqrt(10.0)/4.0 * nz * (3.0 * nx * nx - nz * nz);
                }
                
                // A power < 1 makes the lobes "fatter". 
                // 0.35 ensures that overlapping all orientations feels like a sphere, rather than isolated pool balls.
                const absY = Math.abs(Y);
                const scale = lType === 0 ? 1.0 : Math.pow(absY, 0.35);
                
                pos.setXYZ(i, x * scale, y * scale, z * scale);
                
                if (isAllView) {
                    // For "All" view, use the same color for both phases to visually identify the axis
                    colors.push(colorP.r, colorP.g, colorP.b);
                } else {
                    if (Y > 0) colors.push(colorP.r, colorP.g, colorP.b);
                    else colors.push(colorN.r, colorN.g, colorN.b);
                }
            }
            
            geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geom.computeVertexNormals();
            return geom;
        };

        const generateShell = (lType, mlType, scaleFactor, primaryColorHex, secondaryColorHex, isAllView) => {
            const material = new THREE.MeshPhongMaterial({ 
                vertexColors: true,
                transparent: true, 
                opacity: opacityVal, 
                wireframe: false,
                side: THREE.DoubleSide,
                clippingPlanes: clippingPlanes
            });

            const geometry = createOrbitalGeometry(lType, mlType, maxRadius * scaleFactor, primaryColorHex, secondaryColorHex, isAllView);
            return new THREE.Mesh(geometry, material);
        };

        const renderSingleOrientation = (mlTarget, primaryColor, isAllView) => {
            const group = new THREE.Group();
            for (let i = 0; i < layers; i++) {
                const layerScale = 1.0 - (i * (0.8 / layers));
                const c1 = (i % 2 === 0) ? primaryColor : colorRed;
                const c2 = (i % 2 === 0) ? colorRed : primaryColor;
                group.add(generateShell(l, mlTarget, layerScale, c1, c2, isAllView));
            }
            return group;
        };

        if (mlVal === 'all') {
            if (l === 1) {
                this.currentOrbitalGroup.add(renderSingleOrientation(1, colorRed, true));    // px
                this.currentOrbitalGroup.add(renderSingleOrientation(-1, colorGreen, true)); // py
                this.currentOrbitalGroup.add(renderSingleOrientation(0, colorBlue, true));   // pz
            } else if (l === 2) {
                this.currentOrbitalGroup.add(renderSingleOrientation(0, colorBlue, true));
                this.currentOrbitalGroup.add(renderSingleOrientation(1, colorRed, true));
                this.currentOrbitalGroup.add(renderSingleOrientation(-1, colorGreen, true));
                this.currentOrbitalGroup.add(renderSingleOrientation(2, 0xf59e0b, true)); // yellow
                this.currentOrbitalGroup.add(renderSingleOrientation(-2, 0xec4899, true)); // pink
            } else {
                this.currentOrbitalGroup.add(renderSingleOrientation(0, colorBlue, true));
            }
        } else {
            const m = mlVal === 'all' ? 0 : parseInt(mlVal);
            this.currentOrbitalGroup.add(renderSingleOrientation(m, colorBlue, false));
        }
        
        this.scene.add(this.currentOrbitalGroup);
    },

    updateScaleBar: function() {
        const scaleText = document.getElementById('orbital-scale-text');
        const container = document.getElementById('three-canvas-container');
        if (!scaleText || !container || !this.camera) return;

        // Calculate visible width at the origin (z=0)
        // distance to origin is camera.position.length()
        const dist = this.camera.position.length();
        const vFOV = this.camera.fov * Math.PI / 180;
        const heightAtOrigin = 2 * Math.tan(vFOV / 2) * dist;
        const widthAtOrigin = heightAtOrigin * this.camera.aspect;

        // HTML container width
        const cw = container.clientWidth;
        
        // Scale bar width is fixed at 50px (from HTML)
        const scaleBarPixelWidth = 50;

        // Ratio of scale bar to canvas width
        const ratio = scaleBarPixelWidth / cw;

        // Physical width in Three.js units
        const threeUnits = widthAtOrigin * ratio;

        // Convert to picometers (1 unit = 100 pm)
        const pm = Math.round(threeUnits * 100);
        
        scaleText.innerText = `${pm} pm`;
    },

    animate: function() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (this.currentOrbitalGroup) {
            this.currentOrbitalGroup.rotation.y += 0.005;
            this.currentOrbitalGroup.rotation.x += 0.002;
        }
        
        if (this.controls) this.controls.update();
        if (this.renderer) this.renderer.render(this.scene, this.camera);
        
        this.updateScaleBar();
    }
};
