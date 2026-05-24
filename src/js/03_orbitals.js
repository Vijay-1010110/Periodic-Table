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
            this.controls.dampingFactor = 0.05;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 2.0;
        }

        // Slicing planes for quadrant cutout (removes x>0 AND z>0)
        this.slicePlane1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
        this.slicePlane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
        
        // Initial draw
        this.drawOrbital();
        this.animate();

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
        this.currentElementData = elData;
        this.atomicNumber = elData.atomicNumber || 1;
        // Try to get empirical or calculated radius, fallback to 100 pm
        let r = 100;
        if (elData.radius) {
            if (elData.radius.calculated) r = elData.radius.calculated;
            else if (elData.radius.empirical) r = elData.radius.empirical;
            else if (elData.radius.covalent) r = elData.radius.covalent;
        }
        this.currentElementRadius = r;
        
        // Find outermost n from electron configuration
        let maxN = 1;
        if (elData.electronConfiguration) {
            const parts = elData.electronConfiguration.split(' ');
            parts.forEach(p => {
                if (p.length > 0 && !p.startsWith('[')) {
                    const n = parseInt(p[0]);
                    if (!isNaN(n) && n > maxN) maxN = n;
                }
            });
        }
        this.outermostN = maxN;
        
        // We do NOT call drawOrbital() here directly anymore, because 02_main.js
        // handles calling drawOrbital() with the correct valence shell parameters
        // right after calling setElement().
    },

    updateInfoOverlay: function(n, l, mlStr, calculatedRadius) {
        const elNameBox = document.getElementById('oi-element');
        const orbitalBox = document.getElementById('oi-orbital');
        const radiusBox = document.getElementById('oi-radius');
        
        if (elNameBox && this.currentElementData) {
            elNameBox.textContent = `${this.currentElementData.name} (${this.currentElementData.symbol})`;
        }
        
        if (orbitalBox) {
            const lNames = ['s', 'p', 'd', 'f'];
            const lChar = lNames[l] || 's';
            let orientation = '';
            if (mlStr !== 'all') {
                if (lChar === 'p') {
                    if (mlStr === '-1') orientation = 'x';
                    if (mlStr === '0') orientation = 'y';
                    if (mlStr === '1') orientation = 'z';
                } else {
                    orientation = ` (m=${mlStr})`;
                }
            }
            orbitalBox.innerHTML = `${n}${lChar}<sub>${orientation}</sub>`;
        }
        
        if (radiusBox) {
            let formattedRadius = parseFloat(calculatedRadius.toFixed(2));
            radiusBox.textContent = `Radius: ~${formattedRadius} pm`;
        }
    },

    drawOrbital: function(nParam, lParam, mlParam) {
        if (!this.scene) return;

        // Determine current orbital params
        // Use parameters if provided, otherwise default to stored values, or 2p as fallback
        const n = nParam !== undefined ? parseInt(nParam) : (this.currentN || 2);
        const l = lParam !== undefined ? parseInt(lParam) : (this.currentL !== undefined ? this.currentL : 1);
        let mlStr = mlParam !== undefined ? mlParam.toString() : (this.currentMl !== undefined ? this.currentMl.toString() : 'all');
        
        // Save state so re-renders (like slice toggle) keep the same orbital
        this.currentN = n;
        this.currentL = l;
        this.currentMl = mlStr;

        const sliceToggle = document.getElementById('slice-orbital');
        const doSlice = sliceToggle ? sliceToggle.checked : false;

        // Calculate scientifically accurate orbital radius using relativistic Bohr model for core 
        // and exponential interpolation to match empirical/calculated radius for valence
        const baseR = this.currentElementRadius || 100;
        const outerN = this.outermostN || 2;
        const Z = this.atomicNumber || 1;

        const alpha = 1 / 137.036;
        const safeRelFactor = Math.sqrt(Math.max(0.1, 1 - Math.pow(Z * alpha, 2)));
        const r1 = (52.9 / Z) * safeRelFactor;

        let specificRadius;
        if (outerN <= 1) {
            specificRadius = baseR;
        } else if (n === 1) {
            specificRadius = r1;
        } else if (n >= outerN) {
            specificRadius = baseR * Math.pow(n / outerN, 2); // Extrapolate beyond if needed
        } else {
            const k = Math.log(baseR / r1) / (outerN - 1);
            specificRadius = r1 * Math.exp(k * (n - 1));
        }
        
        this.updateInfoOverlay(n, l, mlStr, specificRadius);

        // Clear existing orbital
        if (this.currentOrbitalGroup) {
            this.scene.remove(this.currentOrbitalGroup);
            this.currentOrbitalGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
            this.currentOrbitalGroup = null;
        }
        
        this.currentOrbitalGroup = new THREE.Group();
        
        const mlVal = mlStr;

        // Visual properties
        const colorBlue = 0x00d4ff;
        const colorRed = 0xef4444;
        const colorGreen = 0x22c55e;
        const opacityVal = doSlice ? 0.9 : 0.8;
        
        const clippingPlanes = doSlice ? [this.slicePlane1, this.slicePlane2] : [];

        const layers = Math.max(1, n - l);
        
        const sliceLabel = document.getElementById('slice-orbital').parentElement;
        if (layers <= 1) {
            sliceLabel.style.display = 'none';
            if (doSlice) {
                document.getElementById('slice-orbital').checked = false;
                clippingPlanes.length = 0;
            }
        } else {
            sliceLabel.style.display = 'flex';
        }

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

        const capVertexShader = `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const capFragmentShader = `
            varying vec3 vPosition;
            uniform int lType;
            uniform int mType;
            uniform vec3 colorPos;
            uniform vec3 colorNeg;
            uniform float maxRadius;
            uniform float rOuter[6];
            uniform float rInner[6];
            uniform int numLayers;
            uniform bool isAllView;
            uniform int sliceAxis; // 0 for Z-cap, 1 for X-cap

            void main() {
                float x_orb, y_orb, z_orb;
                
                if (sliceAxis == 0) {
                    if (vPosition.x <= 0.0) discard;
                    x_orb = vPosition.x;
                    y_orb = vPosition.y;
                    z_orb = 0.0;
                } else {
                    if (vPosition.x >= 0.0) discard;
                    x_orb = 0.0;
                    y_orb = vPosition.y;
                    z_orb = -vPosition.x;
                }
                
                float r = sqrt(x_orb*x_orb + y_orb*y_orb + z_orb*z_orb);
                if (r > maxRadius || r < 0.0001) discard;
                
                float nx = x_orb / r;
                float ny = y_orb / r;
                float nz = z_orb / r;
                
                float Y = 0.0;
                if (lType == 0) {
                    Y = 1.0;
                } else if (lType == 1) {
                    if (mType == 0) Y = ny;
                    else if (mType == 1) Y = nx;
                    else if (mType == -1) Y = nz;
                } else if (lType == 2) {
                    if (mType == 0) Y = (3.0 * ny * ny - 1.0) / 2.0;
                    else if (mType == 1) Y = sqrt(3.0) * nx * ny;
                    else if (mType == -1) Y = sqrt(3.0) * nz * ny;
                    else if (mType == 2) Y = sqrt(3.0) / 2.0 * (x_orb * x_orb - nz * nz);
                    else if (mType == -2) Y = sqrt(3.0) * nx * nz;
                } else if (lType == 3) {
                    if (mType == 0) Y = 0.5 * ny * (5.0 * ny * ny - 3.0);
                    else if (mType == 1) Y = sqrt(6.0)/4.0 * nx * (5.0 * ny * ny - 1.0);
                    else if (mType == -1) Y = sqrt(6.0)/4.0 * nz * (5.0 * ny * ny - 1.0);
                    else if (mType == 2) Y = sqrt(15.0)/2.0 * ny * (nx * nx - nz * nz);
                    else if (mType == -2) Y = sqrt(15.0) * nx * ny * nz;
                    else if (mType == 3) Y = sqrt(10.0)/4.0 * nx * (x_orb * x_orb - 3.0 * nz * nz);
                    else if (mType == -3) Y = sqrt(10.0)/4.0 * nz * (3.0 * x_orb * x_orb - nz * nz);
                }
                
                float absY = abs(Y);
                float scale = lType == 0 ? 1.0 : pow(absY, 0.35);
                if (scale < 0.001) discard;
                
                float localR = r / maxRadius;
                float expectedR = scale;
                float normalizedR = localR / expectedR;
                
                bool insideSolid = false;
                int layerIdx = 0;
                for (int i=0; i<6; i++) {
                    if (i >= numLayers) break;
                    if (normalizedR <= rOuter[i] && normalizedR >= rInner[i]) {
                        insideSolid = true;
                        layerIdx = i;
                        break;
                    }
                }
                
                if (!insideSolid) discard;
                
                vec3 cP = colorPos;
                vec3 cN = colorNeg;
                if (layerIdx == 1 || layerIdx == 3 || layerIdx == 5) {
                    cP = colorNeg;
                    cN = colorPos;
                }
                
                vec3 baseColor = cP;
                if (!isAllView) {
                    if (Y < 0.0) baseColor = cN;
                }
                
                gl_FragColor = vec4(baseColor * 0.75, 1.0);
            }
        `;

        const R_outer = [];
        const R_inner = [];
        for (let i = 0; i < layers; i++) {
            const outScale = Math.pow((layers - i) / layers, 2.0);
            R_outer.push(outScale);
            if (i < layers - 1) {
                const nextOutScale = Math.pow((layers - (i + 1)) / layers, 2.0);
                const gap = 0.06;
                const inScale = Math.min(outScale - 0.01, nextOutScale + gap);
                R_inner.push(inScale);
            } else {
                R_inner.push(0.0);
            }
        }

        const createCapMaterial = (lType, mType, colorPosHex, colorNegHex, isAllView, axisIdx) => {
            const paddedOuter = [...R_outer];
            while(paddedOuter.length < 6) paddedOuter.push(0);
            const paddedInner = [...R_inner];
            while(paddedInner.length < 6) paddedInner.push(0);

            return new THREE.ShaderMaterial({
                vertexShader: capVertexShader,
                fragmentShader: capFragmentShader,
                uniforms: {
                    lType: { value: lType },
                    mType: { value: mType },
                    colorPos: { value: new THREE.Color(colorPosHex) },
                    colorNeg: { value: new THREE.Color(colorNegHex) },
                    maxRadius: { value: maxRadius },
                    rOuter: { value: paddedOuter },
                    rInner: { value: paddedInner },
                    numLayers: { value: layers },
                    isAllView: { value: isAllView },
                    sliceAxis: { value: axisIdx }
                },
                side: THREE.DoubleSide,
                transparent: true
            });
        };

        const generateShell = (lType, mlType, scaleFactor, primaryColorHex, secondaryColorHex, isAllView) => {
            const material = new THREE.MeshPhongMaterial({ 
                vertexColors: true,
                transparent: true, 
                opacity: opacityVal, 
                wireframe: false,
                side: THREE.DoubleSide,
                clippingPlanes: clippingPlanes,
                clipIntersection: true
            });

            const geometry = createOrbitalGeometry(lType, mlType, maxRadius * scaleFactor, primaryColorHex, secondaryColorHex, isAllView);
            return new THREE.Mesh(geometry, material);
        };

        const renderSingleOrientation = (mlTarget, primaryColor, isAllView) => {
            const group = new THREE.Group();
            for (let i = 0; i < layers; i++) {
                const outScale = R_outer[i];
                const inScale = R_inner[i];
                const c1 = (i % 2 === 0) ? primaryColor : colorRed;
                const c2 = (i % 2 === 0) ? colorRed : primaryColor;
                
                group.add(generateShell(l, mlTarget, outScale, c1, c2, isAllView));
                
                if (inScale > 0) {
                    group.add(generateShell(l, mlTarget, inScale, c1, c2, isAllView));
                }
            }
            
            if (doSlice) {
                const capGeo = new THREE.PlaneGeometry(maxRadius * 2.5, maxRadius * 2.5);
                
                const capMatZ = createCapMaterial(l, mlTarget, primaryColor, colorRed, isAllView, 0);
                const capMeshZ = new THREE.Mesh(capGeo, capMatZ);
                capMeshZ.position.z = -0.001 - ((mlTarget + l) * 0.0005);
                group.add(capMeshZ);
                
                const capMatX = createCapMaterial(l, mlTarget, primaryColor, colorRed, isAllView, 1);
                const capMeshX = new THREE.Mesh(capGeo, capMatX);
                capMeshX.rotation.y = Math.PI / 2;
                capMeshX.position.x = -0.001 - ((mlTarget + l) * 0.0005);
                group.add(capMeshX);
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

    animate: function() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        if (this.controls) this.controls.update();
        if (this.renderer) this.renderer.render(this.scene, this.camera);
    }
};
