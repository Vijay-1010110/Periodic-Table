window.OrbitalViewer = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    animationId: null,
    currentOrbitalGroup: null,
    slicePlane1: null,
    slicePlane2: null,
    currentElementRadius: 100, // default 100 pm

    // Modal state
    modalScene: null,
    modalCamera: null,
    modalRenderer: null,
    modalControls: null,
    modalAnimationId: null,
    modalCurrentOrbitalGroup: null,
    modalSlicePlane1: null,
    modalSlicePlane2: null,
    modalCurrentN: 2,
    modalCurrentL: 1,
    modalCurrentM: 'all',
    modalBindingEnergy_eV: 13.6,

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

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        this.renderer.localClippingEnabled = true;
        container.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        this.scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight1.position.set(5, 10, 7);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x00d4ff, 0.5);
        dirLight2.position.set(-5, -5, -5);
        this.scene.add(dirLight2);
        
        const axesHelper = new THREE.AxesHelper(3);
        this.scene.add(axesHelper);

        if (window.THREE && THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 2.0;
            this.controls.enableZoom = false; // Disable scroll-zoom in sidebar to allow page scroll

            // Smart touch handling: allow vertical scrolling to pass through to the sidebar
            const dom = this.renderer.domElement;
            let touchStartX = 0;
            let touchStartY = 0;
            dom.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
            }, { passive: true });

            dom.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                    const dx = Math.abs(e.touches[0].clientX - touchStartX);
                    const dy = Math.abs(e.touches[0].clientY - touchStartY);
                    if (dy > dx * 1.1) {
                        this.controls.enabled = false;
                    } else {
                        this.controls.enabled = true;
                    }
                }
            }, { passive: true });

            dom.addEventListener('touchend', () => {
                this.controls.enabled = true;
            }, { passive: true });
        }

        this.slicePlane1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
        this.slicePlane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
        
        this.drawOrbital();
        if (typeof currentView !== 'undefined' && currentView === 'electrons') {
            this.start();
        }

        window.addEventListener('resize', () => this.resize());

        const sliceToggle = document.getElementById('slice-orbital');
        if (sliceToggle) {
            sliceToggle.addEventListener('change', () => this.drawOrbital());
        }
    },

    resize: function() {
        const container = document.getElementById('three-canvas-container');
        if (!container || !this.camera || !this.renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0) {
            if (this._lastWidth === w && this._lastHeight === h) {
                return; // Fast path: WebGL buffer already matches exact dimensions! Skip canvas reallocation.
            }
            this._lastWidth = w;
            this._lastHeight = h;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        }
    },

    setElement: function(elData) {
        if (!elData) return;
        this.currentElementData = elData;
        this.atomicNumber = elData.atomicNumber || 1;
        let r = 100;
        if (elData.radius) {
            if (elData.radius.calculated) r = elData.radius.calculated;
            else if (elData.radius.empirical) r = elData.radius.empirical;
            else if (elData.radius.covalent) r = elData.radius.covalent;
        }
        this.currentElementRadius = r;
        
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
    },

    updateInfoOverlay: function(n, l, mlStr, calculatedRadius, bindingEnergy) {
        const elNameBox = document.getElementById('oi-element');
        const orbitalBox = document.getElementById('oi-orbital');
        const radiusBox = document.getElementById('oi-radius');
        const quantumBox = document.getElementById('oi-quantum');
        const bindingBox = document.getElementById('oi-binding');
        const bindingUnit = document.getElementById('oi-binding-unit');
        
        if (elNameBox && this.currentElementData) {
            elNameBox.textContent = `${this.currentElementData.name} (${this.currentElementData.symbol})`;
        }
        
        if (orbitalBox) {
            const lChar = l === 0 ? 's' : (l === 1 ? 'p' : (l === 2 ? 'd' : 'f'));
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

        if (quantumBox) {
            if (mlStr === 'all') {
                quantumBox.innerHTML = `n=${n}, ℓ=${l}, m<sub>ℓ</sub>=...`;
            } else {
                quantumBox.innerHTML = `n=${n}, ℓ=${l}, m<sub>ℓ</sub>=${mlStr}`;
            }
        }
        
        if (bindingBox && bindingEnergy !== undefined) {
            window.currentBindingEnergy_eV = bindingEnergy;
            
            const updateBindingText = () => {
                const isKj = bindingUnit && bindingUnit.value === 'kJ';
                let val = window.currentBindingEnergy_eV;
                let unitStr = "eV";
                
                if (isKj) {
                    val *= 96.485;
                    unitStr = "kJ/mol";
                } else {
                    if (val >= 1000) {
                        val /= 1000;
                        unitStr = "keV";
                    }
                }
                bindingBox.textContent = `E ≈ -${parseFloat(val.toFixed(2))} ${unitStr}`;
            };
            
            if (bindingUnit && !bindingUnit.hasAttribute('data-listener-attached')) {
                bindingUnit.setAttribute('data-listener-attached', 'true');
                bindingUnit.addEventListener('change', updateBindingText);
            }
            
            updateBindingText();
        }
    },

    // Mathematical Helpers for Geometry Generation (Optimized 32x32 for 60fps mobile WebGL)
    _createOrbitalGeometry: function(lType, mType, radius, colorPosHex, colorNegHex, isAllView) {
        const geom = new THREE.SphereGeometry(radius, 32, 32);
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
            
            const absY = Math.abs(Y);
            const scale = lType === 0 ? 1.0 : Math.pow(absY, 0.35);
            
            pos.setXYZ(i, x * scale, y * scale, z * scale);
            
            if (isAllView) {
                colors.push(colorP.r, colorP.g, colorP.b);
            } else {
                if (Y > 0) colors.push(colorP.r, colorP.g, colorP.b);
                else colors.push(colorN.r, colorN.g, colorN.b);
            }
        }
        
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geom.computeVertexNormals();
        return geom;
    },

    _buildOrbitalMeshGroup: function(n, l, mlVal, doSlice, slicePlanes, maxRadius) {
        const group = new THREE.Group();
        const colorBlue = 0x00d4ff;
        const colorRed = 0xef4444;
        const colorGreen = 0x22c55e;
        const opacityVal = doSlice ? 0.9 : 0.8;
        const layers = Math.max(1, n - l);

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
            uniform int sliceAxis;

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
                    else if (mType == 2) Y = sqrt(3.0) / 2.0 * (nx * nx - nz * nz);
                    else if (mType == -2) Y = sqrt(3.0) * nx * nz;
                } else if (lType == 3) {
                    if (mType == 0) Y = 0.5 * ny * (5.0 * ny * ny - 3.0);
                    else if (mType == 1) Y = sqrt(6.0)/4.0 * nx * (5.0 * ny * ny - 1.0);
                    else if (mType == -1) Y = sqrt(6.0)/4.0 * nz * (5.0 * ny * ny - 1.0);
                    else if (mType == 2) Y = sqrt(15.0)/2.0 * ny * (nx * nx - nz * nz);
                    else if (mType == -2) Y = sqrt(15.0) * nx * ny * nz;
                    else if (mType == 3) Y = sqrt(10.0)/4.0 * nx * (nx * nx - 3.0 * nz * nz);
                    else if (mType == -3) Y = sqrt(10.0)/4.0 * nz * (3.0 * nx * nx - nz * nz);
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
            const out_frac = 1.0 - (i * 0.95 / layers);
            const in_frac = (i === layers - 1) ? 0.0 : (1.0 - ((i + 1) * 0.95 / layers));
            R_outer.push(out_frac);
            R_inner.push(in_frac);
        }

        const createCapMaterial = (lType, mType, colorPosHex, colorNegHex, isAllView, axis) => {
            const rOuterArr = [0,0,0,0,0,0];
            const rInnerArr = [0,0,0,0,0,0];
            for (let i=0; i<layers; i++) {
                rOuterArr[i] = R_outer[i];
                rInnerArr[i] = R_inner[i];
            }
            return new THREE.ShaderMaterial({
                vertexShader: capVertexShader,
                fragmentShader: capFragmentShader,
                uniforms: {
                    lType: { value: lType },
                    mType: { value: mType },
                    colorPos: { value: new THREE.Color(colorPosHex) },
                    colorNeg: { value: new THREE.Color(colorNegHex) },
                    maxRadius: { value: maxRadius },
                    rOuter: { value: rOuterArr },
                    rInner: { value: rInnerArr },
                    numLayers: { value: layers },
                    isAllView: { value: isAllView },
                    sliceAxis: { value: axis }
                },
                side: THREE.DoubleSide
            });
        };

        const generateShell = (lType, mlType, scaleFactor, primaryColorHex, secondaryColorHex, isAllView) => {
            const matOpts = {
                vertexColors: true,
                transparent: true,
                opacity: opacityVal,
                shininess: 90,
                side: THREE.DoubleSide
            };
            if (doSlice && slicePlanes && slicePlanes.length > 0) {
                matOpts.clippingPlanes = slicePlanes;
                matOpts.clipShadows = true;
            }
            const material = new THREE.MeshPhongMaterial(matOpts);
            const geometry = this._createOrbitalGeometry(lType, mlType, maxRadius * scaleFactor, primaryColorHex, secondaryColorHex, isAllView);
            return new THREE.Mesh(geometry, material);
        };

        const renderSingleOrientation = (mlTarget, primaryColor, isAllView) => {
            const subGrp = new THREE.Group();
            for (let i = 0; i < layers; i++) {
                const outScale = R_outer[i];
                const inScale = R_inner[i];
                const c1 = (i % 2 === 0) ? primaryColor : colorRed;
                const c2 = (i % 2 === 0) ? colorRed : primaryColor;
                
                subGrp.add(generateShell(l, mlTarget, outScale, c1, c2, isAllView));
                if (inScale > 0) {
                    subGrp.add(generateShell(l, mlTarget, inScale, c1, c2, isAllView));
                }
            }
            
            if (doSlice) {
                const capGeo = new THREE.PlaneGeometry(maxRadius * 2.5, maxRadius * 2.5);
                const capMatZ = createCapMaterial(l, mlTarget, primaryColor, colorRed, isAllView, 0);
                const capMeshZ = new THREE.Mesh(capGeo, capMatZ);
                capMeshZ.position.z = -0.001 - ((mlTarget + l) * 0.0005);
                subGrp.add(capMeshZ);
                
                const capMatX = createCapMaterial(l, mlTarget, primaryColor, colorRed, isAllView, 1);
                const capMeshX = new THREE.Mesh(capGeo, capMatX);
                capMeshX.rotation.y = Math.PI / 2;
                capMeshX.position.x = -0.001 - ((mlTarget + l) * 0.0005);
                subGrp.add(capMeshX);
            }
            return subGrp;
        };

        if (mlVal === 'all') {
            if (l === 1) {
                group.add(renderSingleOrientation(1, colorRed, true));    // px
                group.add(renderSingleOrientation(-1, colorGreen, true)); // py
                group.add(renderSingleOrientation(0, colorBlue, true));   // pz
            } else if (l === 2) {
                group.add(renderSingleOrientation(0, colorBlue, true));
                group.add(renderSingleOrientation(1, colorRed, true));
                group.add(renderSingleOrientation(-1, colorGreen, true));
                group.add(renderSingleOrientation(2, 0xf59e0b, true));
                group.add(renderSingleOrientation(-2, 0xec4899, true));
            } else if (l === 3) {
                group.add(renderSingleOrientation(0, colorBlue, true));
                group.add(renderSingleOrientation(1, colorRed, true));
                group.add(renderSingleOrientation(-1, colorGreen, true));
                group.add(renderSingleOrientation(2, 0xf59e0b, true));
                group.add(renderSingleOrientation(-2, 0xec4899, true));
                group.add(renderSingleOrientation(3, 0x06b6d4, true));
                group.add(renderSingleOrientation(-3, 0x8b5cf6, true));
            } else {
                group.add(renderSingleOrientation(0, colorBlue, true));
            }
        } else {
            const m = parseInt(mlVal) || 0;
            group.add(renderSingleOrientation(m, colorBlue, false));
        }
        return group;
    },

    drawOrbital: function(nParam, lParam, subset, force = false) {
        if (!this.scene) return;

        const n = nParam !== undefined ? parseInt(nParam) : (this.currentN || 2);
        const l = lParam !== undefined ? parseInt(lParam) : (this.currentL !== undefined ? this.currentL : 1);
        let mlStr = subset !== undefined ? subset.toString() : (this.currentMl !== undefined ? this.currentMl.toString() : 'all');
        
        this.currentN = n;
        this.currentL = l;
        this.currentMl = mlStr;

        const sliceToggle = document.getElementById('slice-orbital');
        const doSlice = sliceToggle ? sliceToggle.checked : false;
        const Z = this.atomicNumber || 1;

        const orbitalKey = `${Z}_${n}_${l}_${mlStr}_${doSlice}`;
        if (!force && this._renderedOrbitalKey === orbitalKey && this.currentOrbitalGroup) {
            return; // Fast path: Exact orbital geometry already active!
        }
        this._renderedOrbitalKey = orbitalKey;

        const baseR = this.currentElementRadius || 100;
        const outerN = this.outermostN || 2;

        const alpha = 1 / 137.036;
        const safeRelFactor = Math.sqrt(Math.max(0.1, 1 - Math.pow(Z * alpha, 2)));
        const r1 = (52.9 / Z) * safeRelFactor;

        let specificRadius;
        if (outerN <= 1) specificRadius = baseR;
        else if (n === 1) specificRadius = r1;
        else if (n >= outerN) specificRadius = baseR * Math.pow(n / outerN, 2);
        else {
            const k = Math.log(baseR / r1) / (outerN - 1);
            specificRadius = r1 * Math.exp(k * (n - 1));
        }

        let specificBindingEnergy = 0;
        const ie = (this.currentElementData && this.currentElementData.ionizationEnergies && this.currentElementData.ionizationEnergies.length > 0) 
                   ? this.currentElementData.ionizationEnergies[0] / 96.485 : 13.6; 
        const e1 = 13.6 * Math.pow(Math.max(1, Z - 1), 2);

        if (outerN <= 1) specificBindingEnergy = ie;
        else if (n === 1) specificBindingEnergy = e1;
        else if (n >= outerN) specificBindingEnergy = ie;
        else {
            const kE = Math.log(ie / e1) / (outerN - 1);
            specificBindingEnergy = e1 * Math.exp(kE * (n - 1));
        }
        
        this.updateInfoOverlay(n, l, mlStr, specificRadius, specificBindingEnergy);

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

        const clippingPlanes = doSlice ? [this.slicePlane1, this.slicePlane2] : [];
        const layers = Math.max(1, n - l);
        
        const sliceLabel = document.getElementById('slice-orbital') ? document.getElementById('slice-orbital').parentElement : null;
        if (sliceLabel) {
            if (layers <= 1 || mlStr === 'all') {
                sliceLabel.style.display = 'none';
                if (doSlice && document.getElementById('slice-orbital')) {
                    document.getElementById('slice-orbital').checked = false;
                    clippingPlanes.length = 0;
                }
            } else {
                sliceLabel.style.display = 'flex';
            }
        }

        const maxRadius = this.currentElementRadius / 100.0;
        this.currentOrbitalGroup = this._buildOrbitalMeshGroup(n, l, mlStr, doSlice, clippingPlanes, maxRadius);
        this.scene.add(this.currentOrbitalGroup);
    },

    // =========================================================================
    // DEDICATED 3D ORBITAL VISUALIZER MODAL
    // =========================================================================
    initModal: function() {
        const container = document.getElementById('ovm-canvas-container');
        if (!container || this.modalRenderer) return;

        this.modalScene = new THREE.Scene();

        let width = container.clientWidth || 400;
        let height = container.clientHeight || 280;

        this.modalCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.modalCamera.position.set(0, 2, 8);
        this.modalCamera.lookAt(0, 0, 0);

        this.modalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.modalRenderer.setSize(width, height);
        this.modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.modalRenderer.localClippingEnabled = true;
        container.appendChild(this.modalRenderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.modalScene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight1.position.set(6, 12, 8);
        this.modalScene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x00d4ff, 0.6);
        dirLight2.position.set(-6, -6, -6);
        this.modalScene.add(dirLight2);

        const axesHelper = new THREE.AxesHelper(3.5);
        this.modalScene.add(axesHelper);

        if (window.THREE && THREE.OrbitControls) {
            this.modalControls = new THREE.OrbitControls(this.modalCamera, this.modalRenderer.domElement);
            this.modalControls.enableDamping = true;
            this.modalControls.dampingFactor = 0.05;
            this.modalControls.autoRotate = true;
            this.modalControls.autoRotateSpeed = 2.0;
            this.modalControls.enableZoom = true;
        }

        this.modalSlicePlane1 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
        this.modalSlicePlane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);

        const subshellSelect = document.getElementById('ovm-subshell-select');
        if (subshellSelect) {
            const allSubshells = [
                '1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', 
                '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'
            ];
            subshellSelect.innerHTML = allSubshells.map(s => `<option value="${s}">${s}</option>`).join('');
            subshellSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                const n = parseInt(val[0]);
                const lChar = val[1];
                const l = lChar === 's' ? 0 : (lChar === 'p' ? 1 : (lChar === 'd' ? 2 : 3));
                this.updateModalOrientationOptions(l, 'all');
                this.drawModalOrbital(n, l, 'all');
            });
        }

        const orientationSelect = document.getElementById('ovm-orientation-select');
        if (orientationSelect) {
            orientationSelect.addEventListener('change', (e) => {
                const mVal = e.target.value;
                this.drawModalOrbital(this.modalCurrentN, this.modalCurrentL, mVal);
            });
        }

        const sliceToggle = document.getElementById('ovm-slice-toggle');
        if (sliceToggle) {
            sliceToggle.addEventListener('change', () => {
                this.drawModalOrbital(this.modalCurrentN, this.modalCurrentL, this.modalCurrentM);
            });
        }

        const autoRotateToggle = document.getElementById('ovm-autorotate-toggle');
        if (autoRotateToggle) {
            autoRotateToggle.addEventListener('change', (e) => {
                if (this.modalControls) this.modalControls.autoRotate = e.target.checked;
            });
        }

        const energyUnitSelect = document.getElementById('ovm-energy-unit');
        if (energyUnitSelect) {
            energyUnitSelect.addEventListener('change', () => {
                this.updateModalBindingEnergyText();
            });
        }

        window.addEventListener('resize', () => this.resizeModal());
    },

    updateModalOrientationOptions: function(l, selectedM = 'all') {
        const orientationSelect = document.getElementById('ovm-orientation-select');
        if (!orientationSelect) return;

        let options = [];
        if (l === 0) {
            options = [{ val: 'all', label: 'Spherical (m = 0)' }];
        } else if (l === 1) {
            options = [
                { val: 'all', label: 'All (Px, Py, Pz)' },
                { val: '1', label: 'Px (m = +1)' },
                { val: '0', label: 'Py (m = 0)' },
                { val: '-1', label: 'Pz (m = -1)' }
            ];
        } else if (l === 2) {
            options = [
                { val: 'all', label: 'All (5 orientations)' },
                { val: '0', label: 'dz² (m = 0)' },
                { val: '1', label: 'dxz (m = +1)' },
                { val: '-1', label: 'dyz (m = -1)' },
                { val: '2', label: 'dx²-y² (m = +2)' },
                { val: '-2', label: 'dxy (m = -2)' }
            ];
        } else if (l === 3) {
            options = [
                { val: 'all', label: 'All (7 orientations)' },
                { val: '0', label: 'fz³ (m = 0)' },
                { val: '1', label: 'fxz² (m = +1)' },
                { val: '-1', label: 'fyz² (m = -1)' },
                { val: '2', label: 'fz(x²-y²) (m = +2)' },
                { val: '-2', label: 'fxyz (m = -2)' },
                { val: '3', label: 'fx(x²-3y²) (m = +3)' },
                { val: '-3', label: 'fy(3x²-y²) (m = -3)' }
            ];
        }

        orientationSelect.innerHTML = options.map(o => 
            `<option value="${o.val}" ${String(o.val) === String(selectedM) ? 'selected' : ''}>${o.label}</option>`
        ).join('');
    },

    openModal: function(nParam, lParam, mParam) {
        const modal = document.getElementById('orbital-visualizer-modal');
        if (!modal) return;

        const n = nParam !== undefined ? parseInt(nParam) : (this.currentN || 2);
        const l = lParam !== undefined ? parseInt(lParam) : (this.currentL !== undefined ? this.currentL : 1);
        const m = mParam !== undefined ? mParam.toString() : 'all';

        if (window.PeriodicaNativeSlider && window.PeriodicaNativeSlider.setVisibility) {
            window.PeriodicaNativeSlider.setVisibility(false);
        }

        modal.style.display = 'flex';

        if (!this.modalRenderer) {
            this.initModal();
        }

        const el = (typeof selectedElement !== 'undefined' && selectedElement) ? selectedElement : this.currentElementData;
        if (el) {
            this.setElement(el);
            const elBadge = document.getElementById('ovm-el-badge');
            if (elBadge) elBadge.textContent = `${el.atomicNumber} ${el.symbol}`;
            const elName = document.getElementById('ovm-el-name');
            if (elName) {
                const lChar = l === 0 ? 's' : (l === 1 ? 'p' : (l === 2 ? 'd' : 'f'));
                elName.textContent = `${el.name} — ${n}${lChar} Orbital`;
            }
            const configSub = document.getElementById('ovm-config-preview');
            if (configSub) configSub.textContent = el.electronConfigurationNoble || el.electronConfiguration || '';
        }

        const lChar = l === 0 ? 's' : (l === 1 ? 'p' : (l === 2 ? 'd' : 'f'));
        const subshellKey = `${n}${lChar}`;
        const subSelect = document.getElementById('ovm-subshell-select');
        if (subSelect) subSelect.value = subshellKey;

        this.updateModalOrientationOptions(l, m);

        setTimeout(() => {
            this.resizeModal();
            this.drawModalOrbital(n, l, m);
            this.startModalAnimation();
        }, 30);
    },

    closeModal: function() {
        const modal = document.getElementById('orbital-visualizer-modal');
        if (modal) modal.style.display = 'none';
        this.stopModalAnimation();

        if (typeof syncNativeSliderVisibility === 'function') {
            syncNativeSliderVisibility();
        }
    },

    resizeModal: function() {
        const container = document.getElementById('ovm-canvas-container');
        if (!container || !this.modalCamera || !this.modalRenderer) return;
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            this.modalCamera.aspect = container.clientWidth / container.clientHeight;
            this.modalCamera.updateProjectionMatrix();
            this.modalRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    },

    drawModalOrbital: function(nParam, lParam, mlParam) {
        if (!this.modalScene) return;

        const n = parseInt(nParam);
        const l = parseInt(lParam);
        const mlStr = mlParam !== undefined ? mlParam.toString() : 'all';

        this.modalCurrentN = n;
        this.modalCurrentL = l;
        this.modalCurrentM = mlStr;

        const lChar = l === 0 ? 's' : (l === 1 ? 'p' : (l === 2 ? 'd' : 'f'));

        const badge = document.getElementById('ovm-orientation-badge');
        if (badge) {
            let orientLabel = '';
            if (mlStr === 'all') {
                orientLabel = `${n}${lChar} (All orientations)`;
            } else if (l === 1) {
                const pAxis = mlStr === '1' ? 'x' : (mlStr === '0' ? 'y' : 'z');
                badge.innerHTML = `${n}p<sub>${pAxis}</sub> (m = ${mlStr})`;
            } else {
                badge.innerHTML = `${n}${lChar} (m = ${mlStr})`;
            }
            if (orientLabel) badge.innerHTML = orientLabel;
        }

        const quantumText = document.getElementById('ovm-quantum-text');
        if (quantumText) {
            quantumText.innerHTML = `n=${n}, ℓ=${l}, m<sub>ℓ</sub>=${mlStr}`;
        }

        const baseR = this.currentElementRadius || 100;
        const outerN = this.outermostN || 2;
        const Z = this.atomicNumber || 1;

        const alpha = 1 / 137.036;
        const safeRelFactor = Math.sqrt(Math.max(0.1, 1 - Math.pow(Z * alpha, 2)));
        const r1 = (52.9 / Z) * safeRelFactor;

        let specificRadius;
        if (outerN <= 1) specificRadius = baseR;
        else if (n === 1) specificRadius = r1;
        else if (n >= outerN) specificRadius = baseR * Math.pow(n / outerN, 2);
        else {
            const k = Math.log(baseR / r1) / (outerN - 1);
            specificRadius = r1 * Math.exp(k * (n - 1));
        }

        const radText = document.getElementById('ovm-radius-text');
        if (radText) radText.textContent = `~${parseFloat(specificRadius.toFixed(1))} pm`;

        let specificBindingEnergy = 0;
        const ie = (this.currentElementData && this.currentElementData.ionizationEnergies && this.currentElementData.ionizationEnergies.length > 0) 
                   ? this.currentElementData.ionizationEnergies[0] / 96.485 : 13.6;
        const e1 = 13.6 * Math.pow(Math.max(1, Z - 1), 2);

        if (outerN <= 1) specificBindingEnergy = ie;
        else if (n === 1) specificBindingEnergy = e1;
        else if (n >= outerN) specificBindingEnergy = ie;
        else {
            const kE = Math.log(ie / e1) / (outerN - 1);
            specificBindingEnergy = e1 * Math.exp(kE * (n - 1));
        }
        this.modalBindingEnergy_eV = specificBindingEnergy;
        this.updateModalBindingEnergyText();

        const occText = document.getElementById('ovm-occupancy-text');
        if (occText && this.currentElementData) {
            const cfg = this.currentElementData.electronConfiguration || '';
            const match = cfg.match(new RegExp(`${n}${lChar}(\\d+)`));
            const count = match ? parseInt(match[1]) : 0;
            const numOrbs = 2 * l + 1;
            
            if (mlStr === 'all') {
                occText.textContent = `${count} e⁻ in ${n}${lChar}`;
            } else {
                const mIndex = parseInt(mlStr) + l;
                let orbElectrons = 0;
                if (count > mIndex) orbElectrons = 1;
                if (count > numOrbs + mIndex) orbElectrons = 2;
                
                if (orbElectrons === 2) occText.innerHTML = '<span style="color:#00ffff; font-weight:800;">Paired (↿⇂)</span>';
                else if (orbElectrons === 1) occText.innerHTML = '<span style="color:#22c55e; font-weight:800;">Single (↿)</span>';
                else occText.innerHTML = '<span style="color:#94a3b8;">Empty (0 e⁻)</span>';
            }
        }

        if (this.modalCurrentOrbitalGroup) {
            this.modalScene.remove(this.modalCurrentOrbitalGroup);
            this.modalCurrentOrbitalGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
            this.modalCurrentOrbitalGroup = null;
        }

        const sliceToggle = document.getElementById('ovm-slice-toggle');
        const doSlice = sliceToggle ? sliceToggle.checked : false;
        const clippingPlanes = doSlice ? [this.modalSlicePlane1, this.modalSlicePlane2] : [];

        const maxRadius = this.currentElementRadius / 100.0;
        this.modalCurrentOrbitalGroup = this._buildOrbitalMeshGroup(n, l, mlStr, doSlice, clippingPlanes, maxRadius);
        this.modalScene.add(this.modalCurrentOrbitalGroup);
    },

    updateModalBindingEnergyText: function() {
        const unitSelect = document.getElementById('ovm-energy-unit');
        const bindingText = document.getElementById('ovm-binding-text');
        if (!bindingText) return;

        const isKj = unitSelect && unitSelect.value === 'kJ';
        let val = this.modalBindingEnergy_eV || 13.6;
        let unitStr = "eV";

        if (isKj) {
            val *= 96.485;
            unitStr = "kJ/mol";
        } else {
            if (val >= 1000) {
                val /= 1000;
                unitStr = "keV";
            }
        }
        bindingText.textContent = `-${parseFloat(val.toFixed(2))} ${unitStr}`;
    },

    isRunning: false,

    start: function() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    },

    stop: function() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    animate: function() {
        if (!this.isRunning) return;
        if (!this.boundAnimate) this.boundAnimate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.boundAnimate);
        
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
    },

    isModalRunning: false,

    startModalAnimation: function() {
        if (this.isModalRunning) return;
        this.isModalRunning = true;
        this.animateModal();
    },

    stopModalAnimation: function() {
        this.isModalRunning = false;
        if (this.modalAnimationId) {
            cancelAnimationFrame(this.modalAnimationId);
            this.modalAnimationId = null;
        }
    },

    animateModal: function() {
        if (!this.isModalRunning) return;
        if (!this.boundAnimateModal) this.boundAnimateModal = this.animateModal.bind(this);
        this.modalAnimationId = requestAnimationFrame(this.boundAnimateModal);
        
        if (this.modalControls) this.modalControls.update();
        if (this.modalRenderer && this.modalScene && this.modalCamera) {
            this.modalRenderer.render(this.modalScene, this.modalCamera);
        }
    }
};
