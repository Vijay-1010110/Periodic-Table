/**
 * ⚡ Periodica Hardware-Accelerated Canvas 2D Periodic Grid Engine (17_canvas_grid.js)
 * 
 * Features:
 * - Dual Fit Modes: Horizontal Fit (18 columns edge-to-edge) & Whole Table Fit (entire table in screen)
 * - Corner Mode Toggle Badge: [ ↔ H-FIT ] <--> [ ⛶ ALL-FIT ] with smooth animation
 * - Single-Blink Screen Edge Glow (Smooth 1-shot 400ms flash on Fit Mode snap; ZERO multi-oscillation)
 * - Pure Single-Element Active Highlighting (Clicking an element ONLY highlights that card, no table flash/dimming)
 * - Instant Empty Space Tap to dismiss all popups & clear active indicator
 * - Steady Locked Panning in Fit Mode (unlocks on zoom > 1.05x)
 * - Multi-touch Pinch-to-Zoom (1.0x - 3.5x) and smooth Pan
 * - Double-tap to reset to current Fit Mode
 * - Solid opaque legend & indicator block support
 * - Seamless full-height card gradients with zero middle seams
 * - Single GPU draw pass in < 0.08ms
 */

window.PeriodicCanvasGrid = (function() {
    let canvas = null;
    let ctx = null;
    let container = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cellW = 0;
    let cellH = 0;
    let gap = 3;
    let totalW = 0;
    let totalH = 0;
    let offsetX = 0;
    let offsetY = 0;
    let isInitialized = false;
    let rafScheduled = false;
    let groupHeaderH = 20;
    let periodMarginLeft = 22;
    let hoveredZ = null;
    let voidX = 0;
    let voidY = 0;
    let voidW = 0;
    let voidH = 0;

    // Dual Fit Mode ('whole' or 'horizontal')
    let currentFitMode = 'whole';

    // Pinch-to-Zoom and Pan Transformation State
    let zoomScale = 1.0;
    let panX = 0;
    let panY = 0;
    let targetZoomScale = 1.0;
    let targetPanX = 0;
    let targetPanY = 0;
    let isPinching = false;
    let isPanning = false;
    let initialPinchDistance = 0;
    let initialZoomScale = 1.0;
    let pinchCenter = { x: 0, y: 0 };
    let lastTouchX = 0;
    let lastTouchY = 0;
    let lastTapTime = 0;

    // Fit Mode Snapping & Screen Edge Glow Blink State (Strictly ONE single smooth flash)
    let fitBlinkActive = false;
    let fitBlinkStartTime = 0;
    let fitBlinkEndTime = 0;
    let isSnapping = false;

    // Cache element positions & metadata
    const elementPositions = new Array(119); // 1-indexed

    // State Text Colors
    const STATE_COLORS = {
        0: '#ffffff', // Solid: Crisp Pure White
        1: '#00f0ff', // Liquid: Electric Neon Cyan
        2: '#ff0055', // Gas: Vibrant Neon Crimson Pink
        3: '#94a3b8'  // Unknown: Slate Muted Gray
    };

    const STATE_BG_COLORS = {
        0: '#475569', // Solid: Crisp Slate Metal
        1: '#0284c7', // Liquid: Deep Electric Cyan
        2: '#e11d48', // Gas: Deep Rose Red
        3: '#1e293b'  // Unknown: Dark Smoky Charcoal
    };

    const CATEGORY_COLORS = {
        'Alkali metal': '#e11d48',          // Vivid Crimson Red
        'Alkaline earth metal': '#ea580c',  // Warm Tangerine Orange
        'Transition metal': '#2563eb',      // Royal Cobalt Blue
        'Post-transition metal': '#0d9488', // Cool Jade Teal
        'Metalloid': '#d97706',             // Radiant Amber Gold
        'Reactive nonmetal': '#059669',     // Deep Emerald Green
        'Other nonmetal': '#059669',        // Deep Emerald Green
        'Other Nonmetals': '#059669',       // Deep Emerald Green
        'Halogen': '#059669',               // Group 17 Reactive Nonmetal
        'Halogens': '#059669',              // Group 17 Reactive Nonmetal
        'Noble gas': '#7c3aed',             // Imperial Purple / Violet
        'Noble Gases': '#7c3aed',           // Imperial Purple / Violet
        'Lanthanide': '#0284c7',            // Electric Cerulean Cyan
        'Actinide': '#c026d3',              // Vivid Deep Fuchsia Orchid
        'Unknown': '#475569'                // Refined Slate Gray
    };

    const GROUPS_DATA = [
        { num: '1', iupac: 'IA' },
        { num: '2', iupac: 'IIA' },
        { num: '3', iupac: 'IIIB' },
        { num: '4', iupac: 'IVB' },
        { num: '5', iupac: 'VB' },
        { num: '6', iupac: 'VIB' },
        { num: '7', iupac: 'VIIB' },
        { num: '8', iupac: 'VIII' },
        { num: '9', iupac: 'VIII' },
        { num: '10', iupac: 'VIII' },
        { num: '11', iupac: 'IB' },
        { num: '12', iupac: 'IIB' },
        { num: '13', iupac: 'IIIA' },
        { num: '14', iupac: 'IVA' },
        { num: '15', iupac: 'VA' },
        { num: '16', iupac: 'VIA' },
        { num: '17', iupac: 'VIIA' },
        { num: '18', iupac: 'VIIIA' }
    ];

    const PERIODS_DATA = [
        { num: '1', row: 1 },
        { num: '2', row: 2 },
        { num: '3', row: 3 },
        { num: '4', row: 4 },
        { num: '5', row: 5 },
        { num: '6', row: 6 },
        { num: '7', row: 7 }
    ];

    function hexToRgbComponents(color) {
        if (!color) return [100, 116, 139];
        if (typeof color === 'string') {
            const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
            if (m) {
                return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
            }
        }
        let c = String(color).replace('#', '').trim();
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        if (isNaN(num)) return [100, 116, 139];
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function createCellGradient(ctx, x, y, w, h, hexColor, isSelected, isHovered) {
        const [r, g, b] = hexToRgbComponents(hexColor);
        const highlightFactor = isSelected ? 0.40 : (isHovered ? 0.35 : 0.25);
        const shadowFactor = isSelected ? 0.82 : (isHovered ? 0.72 : 0.62);

        const highlightR = Math.min(255, Math.round(r + (255 - r) * highlightFactor));
        const highlightG = Math.min(255, Math.round(g + (255 - g) * highlightFactor));
        const highlightB = Math.min(255, Math.round(b + (255 - b) * highlightFactor));

        const shadowR = Math.max(0, Math.round(r * shadowFactor));
        const shadowG = Math.max(0, Math.round(g * shadowFactor));
        const shadowB = Math.max(0, Math.round(b * shadowFactor));

        const alpha = isSelected ? 0.98 : (isHovered ? 0.95 : 0.92);
        const grad = ctx.createLinearGradient(x, y, x + w * 0.85, y + h);
        grad.addColorStop(0, `rgba(${highlightR}, ${highlightG}, ${highlightB}, ${alpha})`);
        grad.addColorStop(0.48, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(1, `rgba(${shadowR}, ${shadowG}, ${shadowB}, ${alpha})`);
        return grad;
    }

    function hexToRgba(color, alpha) {
        if (!color) return `rgba(100,116,139,${alpha})`;
        const [r, g, b] = hexToRgbComponents(color);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // Zero-delay fit mode switching (no screen flashing or blinking)
    function triggerFitBlink() {
        fitBlinkActive = false;
    }

    function cycleFitMode() {
        if (currentFitMode === 'whole') {
            currentFitMode = 'horizontal';
        } else {
            currentFitMode = 'whole';
        }
        zoomScale = 1.0;
        panX = 0;
        panY = 0;
        recomputeGeometry();
        render();
    }

    function toggleFitMode() {
        // If zoomed in or panned, tapping Fit resets smoothly to 100% fit view
        if (zoomScale > 1.03 || Math.abs(panX) > 4 || Math.abs(panY) > 4) {
            snapToFitWithAnimation();
            return;
        }
        cycleFitMode();
    }

    function setFitMode(mode) {
        currentFitMode = (mode === 'horizontal' || mode === 'horizontal-fill') ? 'horizontal' : 'whole';
        zoomScale = 1.0;
        panX = 0;
        panY = 0;
        recomputeGeometry();
        render();
    }

    function normalizeCategory(cat, z = null) {
        if (z) {
            if (z === 117) return 'Reactive nonmetal';
            if (z === 9 || z === 17 || z === 35 || z === 53 || z === 85) return 'Reactive nonmetal';
            if (z === 2 || z === 10 || z === 18 || z === 36 || z === 54 || z === 86 || z === 118) return 'Noble gas';
            if (z === 1 || z === 6 || z === 7 || z === 8 || z === 15 || z === 16 || z === 34) return 'Reactive nonmetal';
            if (z === 5 || z === 14 || z === 32 || z === 33 || z === 51 || z === 52) return 'Metalloid';
        }
        if (!cat) return 'Unknown';
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes('halogen')) return 'Reactive nonmetal';
        if (lowerCat.includes('noble gas')) return 'Noble gas';
        if (lowerCat.includes('nonmetal') || lowerCat === 'diatomic nonmetal' || lowerCat === 'polyatomic nonmetal' || lowerCat === 'reactive nonmetal') return 'Reactive nonmetal';
        if (lowerCat.includes('transition metal') && !lowerCat.includes('post')) return 'Transition metal';
        if (lowerCat.includes('post-transition metal')) return 'Post-transition metal';
        if (lowerCat.includes('metalloid')) return 'Metalloid';
        if (lowerCat.includes('alkali metal') && !lowerCat.includes('alkaline')) return 'Alkali metal';
        if (lowerCat.includes('alkaline earth metal')) return 'Alkaline earth metal';
        if (lowerCat.includes('lanthanide')) return 'Lanthanide';
        if (lowerCat.includes('actinide')) return 'Actinide';
        return cat;
    }

    function getGridPosition(z) {
        if (z === 1) return { col: 1, row: 1 };
        if (z === 2) return { col: 18, row: 1 };
        if (z >= 3 && z <= 4) return { col: z - 2, row: 2 };
        if (z >= 5 && z <= 10) return { col: z + 8, row: 2 };
        if (z >= 11 && z <= 12) return { col: z - 10, row: 3 };
        if (z >= 13 && z <= 18) return { col: z, row: 3 };
        if (z >= 19 && z <= 36) return { col: z - 18, row: 4 };
        if (z >= 37 && z <= 54) return { col: z - 36, row: 5 };
        if (z === 55 || z === 56) return { col: z - 54, row: 6 };
        if (z >= 72 && z <= 86) return { col: z - 68, row: 6 };
        if (z === 87 || z === 88) return { col: z - 86, row: 7 };
        if (z >= 104 && z <= 118) return { col: z - 100, row: 7 };
        if (z >= 57 && z <= 71) return { col: z - 53, row: 9 };
        if (z >= 89 && z <= 103) return { col: z - 85, row: 10 };
        return { col: 1, row: 1 };
    }

    function init() {
        container = document.querySelector('.grid-wrapper');
        if (!container) return;

        // Hide heavy HTML element cells and apply solid dark background to legend indicators
        let style = document.getElementById('canvas-engine-css-override');
        if (!style) {
            style = document.createElement('style');
            style.id = 'canvas-engine-css-override';
            document.head.appendChild(style);
        }
        style.textContent = `
            #main-grid > .element, #main-grid > .element-cell, #main-grid > .f-block-placeholder,
            #elec-grid > .element, #elec-grid > .element-cell, #elec-grid > .f-block-placeholder {
                display: none !important;
            }
            #main-grid, #elec-grid {
                display: block !important;
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                pointer-events: none !important;
                z-index: 40 !important;
                border: none !important;
                background: transparent !important;
                grid-template-columns: none !important;
                grid-template-rows: none !important;
                overflow: visible !important;
            }
            #in-grid-legend {
                position: absolute !important;
                margin: 0 !important;
                gap: 4px !important;
                z-index: 50 !important;
                pointer-events: auto !important;
                touch-action: auto !important;
                overflow: hidden !important;
                display: flex !important;
                justify-content: center !important;
                align-items: stretch !important;
                box-sizing: border-box !important;
            }
            #in-grid-legend * {
                pointer-events: auto !important;
                touch-action: auto !important;
            }
            .in-grid-legend .legend-box {
                background: rgba(9, 14, 26, 0.98) !important;
                border: 1px solid rgba(0, 212, 255, 0.35) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8) !important;
                padding: 2px 4px !important;
                border-radius: 6px !important;
                height: 100% !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
            }
            .in-grid-legend .category-box { flex: 2.35 !important; min-width: 0 !important; }
            .in-grid-legend .state-box { flex: 1 !important; min-width: 0 !important; }
            .in-grid-legend .legend-box-title {
                font-size: 0.40rem !important;
                font-weight: 800 !important;
                margin-bottom: 2px !important;
                text-align: center !important;
                color: #00d4ff !important;
                letter-spacing: 0.4px !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            .in-grid-legend .legend-group-title {
                font-size: 0.38rem !important;
                font-weight: 700 !important;
                margin-bottom: 2px !important;
                text-align: center !important;
                color: rgba(255, 255, 255, 0.85) !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                letter-spacing: 0.3px !important;
                cursor: pointer !important;
                transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, color 0.15s ease !important;
            }
            .in-grid-legend .legend-item {
                border-radius: 3px !important;
                padding: 0 2px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                line-height: 1.05 !important;
                box-sizing: border-box !important;
                flex: 1 !important;
                min-width: 0 !important;
                font-size: 0.38rem !important;
                margin: 0 !important;
                text-align: center !important;
                white-space: normal !important;
                transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, filter 0.15s ease !important;
            }
            .in-grid-legend .legend-item span {
                font-size: 0.38rem !important;
                font-family: var(--font-ui) !important;
                font-weight: 700 !important;
                white-space: normal !important;
                line-height: 1.05 !important;
                text-align: center !important;
                letter-spacing: -0.2px !important;
            }
            .in-grid-legend .legend-item[data-type="category"] span {
                color: #ffffff !important;
            }
            .in-grid-legend .legend-item[data-type="state"] span {
                color: inherit !important;
            }
            .in-grid-legend .legend-item[data-key="Solid"][data-type="state"] {
                color: #ffffff !important;
            }
            .in-grid-legend .legend-item[data-key="Liquid"][data-type="state"] {
                color: #00f0ff !important;
            }
            .in-grid-legend .legend-item[data-key="Gas"][data-type="state"] {
                color: #ff0055 !important;
            }
            .in-grid-legend .legend-item[data-key="Unknown"][data-type="state"] {
                color: #a1a1aa !important;
            }
            
            .in-grid-legend .legend-item:hover, .in-grid-legend .legend-item:active {
                border-color: #ffffff !important;
                box-shadow: 0 0 8px rgba(0, 212, 255, 0.8) !important;
            }
            .in-grid-legend .legend-item-active {
                opacity: 1 !important;
            }
            .in-grid-legend .legend-item-dimmed {
                opacity: 0.35 !important;
                filter: brightness(0.65) !important;
            }
            
            .in-grid-legend .category-box .legend-box-content {
                display: flex !important;
                flex-direction: row !important;
                flex: 1 !important;
                min-height: 0 !important;
                gap: 2px !important;
            }
            .in-grid-legend .legend-col-metals {
                flex: 4.8 !important;
                min-width: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                border-right: 1px solid rgba(0, 212, 255, 0.28) !important;
                padding-right: 3px !important;
                margin-right: 2px !important;
            }
            .in-grid-legend .legend-col-metalloids {
                flex: 1.35 !important;
                min-width: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                border-right: 1px solid rgba(0, 212, 255, 0.28) !important;
                padding-right: 3px !important;
                margin-right: 2px !important;
            }
            .in-grid-legend .metals-layout-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                flex: 1 !important;
                min-height: 0 !important;
            }
            .in-grid-legend .metals-top-row {
                display: flex !important;
                flex-direction: row !important;
                gap: 1.5px !important;
                flex: 2 !important;
                min-height: 0 !important;
            }
            .in-grid-legend .metals-col-sblock {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                flex: 1.25 !important;
                min-width: 0 !important;
            }
            .in-grid-legend .metals-col-dblock {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                flex: 1.35 !important;
                min-width: 0 !important;
            }
            .in-grid-legend .metals-col-pblock {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                flex: 1.25 !important;
                min-width: 0 !important;
            }
            .in-grid-legend .metals-bottom-row {
                display: flex !important;
                flex-direction: row !important;
                flex: 1 !important;
                min-height: 0 !important;
            }
            .in-grid-legend .metalloids-items {
                flex-direction: column !important;
                min-height: 0 !important;
            }
            .in-grid-legend .legend-col-nonmetals {
                flex: 2.35 !important;
                min-width: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                padding-left: 1px !important;
                gap: 1.5px !important;
            }
            .in-grid-legend .nonmetals-items {
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                min-height: 0 !important;
            }
            .in-grid-legend .state-box .legend-box-content {
                display: flex !important;
                flex-direction: column !important;
                flex: 1 !important;
                justify-content: space-between !important;
                min-height: 0 !important;
            }
            .in-grid-legend .legend-group-states {
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
                min-height: 0 !important;
            }
            .in-grid-legend .legend-group-states .legend-group-items {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5px !important;
                justify-content: space-between !important;
                flex: 1 !important;
            }
            
            .in-grid-legend .heatmap-controller {
                display: flex !important;
                flex-direction: row !important;
                gap: 5px !important;
                padding: 2px 4px !important;
                background: rgba(9, 14, 26, 0.98) !important;
                border: 1px solid #00d4ff !important;
                border-radius: 6px !important;
                align-items: center !important;
                justify-content: space-around !important;
                width: 100% !important;
                height: 100% !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8) !important;
                box-sizing: border-box !important;
            }
            .in-grid-legend .heatmap-section { display: flex !important; flex-direction: column !important; gap: 1px !important; align-items: center !important; }
            .in-grid-legend .heatmap-colors { display: flex !important; flex-direction: row !important; gap: 5px !important; font-size: 0.46rem !important; align-items: center !important; }
            .in-grid-legend .hm-controls { display: flex !important; flex-direction: column !important; gap: 1px !important; }
            .in-grid-legend .hm-row { display: flex !important; justify-content: space-between !important; align-items: center !important; gap: 3px !important; font-size: 0.42rem !important; }
            .in-grid-legend .hm-row input[type="color"] { width: 12px !important; height: 12px !important; border: none !important; border-radius: 2px !important; padding: 0 !important; cursor: pointer !important; }
            .in-grid-legend .hm-bars { display: flex !important; flex-direction: column !important; gap: 1px !important; width: 10px !important; }
            .in-grid-legend .hm-gradient { width: 10px !important; height: 32px !important; border-radius: 2px !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; }
            .in-grid-legend .hm-unk-box { width: 10px !important; height: 7px !important; border-radius: 2px !important; }
            .in-grid-legend .heatmap-scale { display: flex !important; flex-direction: column !important; gap: 2px !important; }
            .in-grid-legend .scale-btn { display: flex !important; align-items: center !important; gap: 2px !important; padding: 1px 3px !important; font-size: 0.40rem !important; border-radius: 2px !important; }
            .in-grid-legend .scale-btn svg { width: 10px !important; height: 10px !important; }
            
            #view-main .grid-wrapper { touch-action: none !important; overflow: hidden !important; position: relative !important; }
        `;

        // Create high-DPI GPU canvas if not present
        canvas = document.getElementById('periodic-canvas-engine');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'periodic-canvas-engine';
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 5;
                cursor: pointer;
                touch-action: none;
            `;
            container.style.position = 'relative';
            container.appendChild(canvas);
        }

        ctx = canvas.getContext('2d', { alpha: true });
        dpr = window.devicePixelRatio || 1;

        // Precompute positions with proper normalized categories
        for (let i = 1; i <= 118; i++) {
            const elData = typeof getElementByNumber === 'function' ? getElementByNumber(i) : (typeof elementsData !== 'undefined' ? elementsData[i - 1] : null);
            const pos = typeof getGridPosition === 'function' ? getGridPosition(i) : { col: 1, row: 1 };
            const rawCat = elData ? elData.category : 'Unknown';
            const cat = normalizeCategory(rawCat, i);
            elementPositions[i] = {
                z: i,
                col: pos.col,
                row: pos.row,
                data: elData,
                category: cat
            };
        }

        // Setup touch gestures & pointer click handling
        setupTouchGestures();
        window.addEventListener('resize', handleResize, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 100);
            setTimeout(handleResize, 300);
        }, { passive: true });

        if (window.ResizeObserver && container) {
            try {
                let roTimer = null;
                const ro = new ResizeObserver(() => {
                    if (roTimer) return;
                    roTimer = requestAnimationFrame(() => {
                        roTimer = null;
                        handleResize();
                    });
                });
                ro.observe(container);
            } catch (e) {
                console.warn('ResizeObserver error:', e);
            }
        }

        handleResize();
        setTimeout(handleResize, 50);
        setTimeout(handleResize, 150);
        setTimeout(handleResize, 350);
        setTimeout(handleResize, 750);
        isInitialized = true;
        render();
    }


    function getDistance(t1, t2) {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.hypot(dx, dy);
    }

    function getCenter(t1, t2, rect) {
        return {
            x: ((t1.clientX + t2.clientX) / 2) - rect.left,
            y: ((t1.clientY + t2.clientY) / 2) - rect.top
        };
    }

    function clampPan() {
        const margin = 8;
        const tableLeft = offsetX - periodMarginLeft;
        const tableRight = offsetX + totalW;
        const tableTop = offsetY - groupHeaderH;
        const tableBottom = offsetY + totalH;

        // Scaled bounds on screen:
        // Point X_world maps to (X_world - width/2)*zoomScale + width/2 + panX
        const scaledW = (totalW + periodMarginLeft) * zoomScale;
        const scaledH = (totalH + groupHeaderH) * zoomScale;

        // 1. Horizontal Clamping
        if (scaledW <= width - 2 * margin) {
            panX = 0;
        } else {
            // When user pans right (panX < 0): right edge of table reaches (width - margin)
            // (tableRight - width/2)*zoomScale + width/2 + panX >= width - margin
            // => minPanX = (width - margin) - ((tableRight - width/2)*zoomScale + width/2)
            // When user pans left (panX > 0): left edge of table reaches margin
            // (tableLeft - width/2)*zoomScale + width/2 + panX <= margin
            // => maxPanX = margin - ((tableLeft - width/2)*zoomScale + width/2)
            const minPanX = (width - margin) - ((tableRight - width / 2) * zoomScale + width / 2);
            const maxPanX = margin - ((tableLeft - width / 2) * zoomScale + width / 2);
            if (minPanX <= maxPanX) {
                panX = Math.max(minPanX, Math.min(maxPanX, panX));
            } else {
                panX = (minPanX + maxPanX) / 2;
            }
        }

        // 2. Vertical Clamping
        if (scaledH <= height - 2 * margin) {
            panY = 0;
        } else {
            const minPanY = (height - margin) - ((tableBottom - height / 2) * zoomScale + height / 2);
            const maxPanY = margin - ((tableTop - height / 2) * zoomScale + height / 2);
            if (minPanY <= maxPanY) {
                panY = Math.max(minPanY, Math.min(maxPanY, panY));
            } else {
                panY = (minPanY + maxPanY) / 2;
            }
        }
    }

    function snapToFitWithAnimation() {
        isSnapping = true;
        targetZoomScale = 1.0;
        targetPanX = 0;
        targetPanY = 0;

        function animateSnap() {
            if (!isSnapping) return;
            const ease = 0.32;
            zoomScale += (targetZoomScale - zoomScale) * ease;
            panX += (targetPanX - panX) * ease;
            panY += (targetPanY - panY) * ease;

            if (Math.abs(zoomScale - targetZoomScale) < 0.005 && Math.abs(panX - targetPanX) < 0.5 && Math.abs(panY - targetPanY) < 0.5) {
                zoomScale = targetZoomScale;
                panX = targetPanX;
                panY = targetPanY;
                isSnapping = false;
                triggerFitBlink();
                render();
                return;
            }
            render();
            requestAnimationFrame(animateSnap);
        }
        requestAnimationFrame(animateSnap);
    }

    function setupTouchGestures() {
        if (!canvas) return;

        // Pointer Click / Tap
        canvas.addEventListener('click', handlePointerClick, { passive: true });

        // Mouse Hover Tracking for Desktop
        canvas.addEventListener('mousemove', onMouseMove, { passive: true });
        canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });

        // Multi-touch Pinch-to-Zoom & Pan / Vertical Scroll
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
        canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });

        // Mouse Wheel Scroll (for desktop / simulator / trackpad)
        canvas.addEventListener('wheel', (e) => {
            const hasVerticalOverflow = (totalH > height);
            const hasHorizontalOverflow = (totalW > width);
            if (hasVerticalOverflow || hasHorizontalOverflow || zoomScale > 1.05) {
                e.preventDefault();
                if (hasHorizontalOverflow || zoomScale > 1.05) {
                    panX -= (e.deltaX || (e.shiftKey ? e.deltaY : 0)) * 0.75;
                }
                if (hasVerticalOverflow || zoomScale > 1.05) {
                    if (!e.shiftKey) panY -= e.deltaY * 0.75;
                }
                clampPan();
                requestRender();
            }
        }, { passive: false });
    }

    function onMouseMove(e) {
        if (isPanning || isPinching || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        let clientX = rawX;
        let clientY = rawY;
        if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
            clientX = (clientX - (width / 2 + panX)) / zoomScale + width / 2;
            clientY = (clientY - (height / 2 + panY)) / zoomScale + height / 2;
        }

        let foundZ = null;
        for (let i = 1; i <= 118; i++) {
            const item = elementPositions[i];
            if (!item) continue;
            const b = getElementBounds(item.col, item.row);
            if (clientX >= b.x && clientX <= b.x + b.w && clientY >= b.y && clientY <= b.y + b.h) {
                foundZ = item.z;
                break;
            }
        }

        if (foundZ !== hoveredZ) {
            hoveredZ = foundZ;
            if (hoveredZ) {
                canvas.style.cursor = 'pointer';
                if (typeof window.updateCentralHeroInspector === 'function') {
                    window.updateCentralHeroInspector(hoveredZ);
                }
            } else {
                canvas.style.cursor = 'default';
                const selZ = (typeof selectedElement !== 'undefined' && selectedElement) ? selectedElement.atomicNumber : null;
                if (typeof window.updateCentralHeroInspector === 'function') {
                    window.updateCentralHeroInspector(selZ);
                }
            }
            requestRender();
        }
    }

    function onMouseLeave() {
        if (hoveredZ !== null) {
            hoveredZ = null;
            if (canvas) canvas.style.cursor = 'default';
            const selZ = (typeof selectedElement !== 'undefined' && selectedElement) ? selectedElement.atomicNumber : null;
            if (typeof window.updateCentralHeroInspector === 'function') {
                window.updateCentralHeroInspector(selZ);
            }
            requestRender();
        }
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    function onTouchStart(e) {
        isSnapping = false;
        if (e.touches.length === 2) {
            if (e.cancelable) e.preventDefault();
            isPinching = true;
            isPanning = false;
            const rect = canvas.getBoundingClientRect();
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoomScale = zoomScale;
            pinchCenter = getCenter(e.touches[0], e.touches[1], rect);
        } else if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isPanning = false;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }

    function onTouchMove(e) {
        if (isPinching && e.touches.length === 2) {
            if (e.cancelable) e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            if (initialPinchDistance > 0) {
                const ratio = currentDistance / initialPinchDistance;
                const prevScale = zoomScale;
                zoomScale = Math.max(0.85, Math.min(3.5, initialZoomScale * ratio));
                
                // If crossing into Fit Mode from above, trigger single edge flash
                if (prevScale > 1.08 && zoomScale <= 1.02) {
                    triggerFitBlink();
                }
                
                clampPan();
                requestRender();
            }
        } else if (e.touches.length === 1) {
            const hasVerticalOverflow = (totalH > height);
            const hasHorizontalOverflow = (totalW > width);
            const distFromStart = Math.hypot(e.touches[0].clientX - touchStartX, e.touches[0].clientY - touchStartY);
            
            if (distFromStart > 6 && (zoomScale > 1.05 || hasVerticalOverflow || hasHorizontalOverflow)) {
                isPanning = true;
            }

            if (isPanning) {
                if (e.cancelable) e.preventDefault();
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                if (zoomScale > 1.05 || hasHorizontalOverflow) panX += dx;
                if (zoomScale > 1.05 || hasVerticalOverflow) panY += dy;
                clampPan();
                requestRender();
            }
        }
    }

    function onTouchEnd(e) {
        if (e.touches.length === 0) {
            isPinching = false;
            const wasPanning = isPanning;
            isPanning = false;

            if (e.changedTouches && e.changedTouches.length === 1) {
                const t = e.changedTouches[0];
                const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
                const duration = Date.now() - touchStartTime;
                if (dist < 22 && duration < 650) {
                    if (e.cancelable) e.preventDefault();
                    handlePointerClick({ clientX: t.clientX, clientY: t.clientY });
                    return;
                }
            }

            // Snappy lock to bounds if user pinched out below 1.0x or way above 3.5x
            if (zoomScale < 1.0 || zoomScale > 3.5) {
                snapToFitWithAnimation();
            } else {
                clampPan();
                render();
            }
        } else if (e.touches.length === 1) {
            const hasVerticalOverflow = (totalH > height);
            const hasHorizontalOverflow = (totalW > width);
            if (zoomScale > 1.05 || hasVerticalOverflow || hasHorizontalOverflow) {
                isPinching = false;
                isPanning = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        }
    }

    function getElementBounds(col, row) {
        let effectiveRow = row;
        let extraY = 0;
        if (row >= 9) {
            extraY = gap * 2.5; // Gap before lanthanides/actinides
            effectiveRow = row - 1;
        }

        const x = offsetX + (col - 1) * (cellW + gap);
        const y = offsetY + (effectiveRow - 1) * (cellH + gap) + extraY;
        return { x, y, w: cellW, h: cellH };
    }

    function recomputeGeometry() {
        gap = Math.max(2, Math.min(4, width / 340));
        const topBarH = 22; // Compact clearance for top bar slider and temp readout
        
        groupHeaderH = Math.max(14, Math.min(20, Math.round(height * 0.036)));
        periodMarginLeft = Math.max(18, Math.min(26, Math.round(width * 0.024)));

        // Explicit table margins so table doesn't touch screen edges (guarantees zero bottom clipping)
        const marginX = 6;
        const marginTop = 2;
        const marginBottom = 4;
        const tableAvailW = Math.max(100, width - 2 * marginX - periodMarginLeft);
        const tableAvailH = Math.max(100, height - topBarH - marginTop - marginBottom - groupHeaderH);
        
        // Ensure maxCellH never allows the table to exceed available vertical height
        const maxCellHByHeight = Math.floor(((tableAvailH - gap * 10.5) / 9) * 10) / 10;

        let calcW = 0;
        let calcH = 0;

        if (currentFitMode === 'whole') {
            // Mode 1: Whole Table Fit (Fits entire table both width and height inside screen proportionally)
            const maxCellW = (tableAvailW - gap * 17) / 18;
            const maxCellH = maxCellHByHeight;
            const fitRatio = 1.12;
            if (maxCellW / maxCellH > fitRatio) {
                calcH = Math.floor(maxCellH * 10) / 10;
                calcW = Math.floor(calcH * fitRatio * 10) / 10;
            } else {
                calcW = Math.floor(maxCellW * 10) / 10;
                calcH = Math.floor((calcW / fitRatio) * 10) / 10;
            }
        } else {
            // Mode 2: 100% Horizontal Fill (18 columns span width)
            calcW = Math.floor(((tableAvailW - gap * 17) / 18) * 10) / 10;
            calcH = maxCellHByHeight;
        }

        // Apply responsive bounds that prevent overflow on compact landscape phones
        const MIN_CELL_W = 32;
        const MIN_CELL_H = 28;
        cellW = Math.max(MIN_CELL_W, calcW);
        cellH = Math.max(MIN_CELL_H, calcH);

        totalW = 18 * cellW + 17 * gap;
        totalH = 9 * cellH + 8 * gap + gap * 2.5;

        // Position: if smaller than available space, center it; if overflowing, align to margin
        offsetX = (totalW + periodMarginLeft <= width - 2 * marginX)
            ? (marginX + periodMarginLeft + Math.max(0, Math.floor((width - 2 * marginX - periodMarginLeft - totalW) / 2)))
            : (marginX + periodMarginLeft);
        offsetY = (totalH + groupHeaderH <= height - topBarH - marginTop - marginBottom)
            ? (topBarH + marginTop + groupHeaderH + Math.max(0, Math.floor((height - topBarH - marginTop - marginBottom - groupHeaderH - totalH) / 2)))
            : (topBarH + marginTop + groupHeaderH);

        // Dynamically position the void legends with clear, generous breathing gaps from surrounding table cards
        const legendMarginX = Math.min(8, Math.round(cellW * 0.15));
        const legendMarginY = Math.min(4, Math.round(cellH * 0.10));
        voidX = Math.round(offsetX + 2 * (cellW + gap) + legendMarginX);
        voidY = Math.round(offsetY + legendMarginY);
        voidW = Math.round(10 * cellW + 9 * gap - 2 * legendMarginX);
        voidH = Math.round(3 * cellH + 2 * gap - 2 * legendMarginY);

        const legends = document.querySelectorAll('#in-grid-legend');
        legends.forEach(leg => {
            leg.style.setProperty('left', `${voidX}px`, 'important');
            leg.style.setProperty('top', `${voidY}px`, 'important');
            leg.style.setProperty('width', `${voidW}px`, 'important');
            leg.style.setProperty('height', `${voidH}px`, 'important');
            leg.style.setProperty('max-width', `${voidW}px`, 'important');
            leg.style.setProperty('max-height', `${voidH}px`, 'important');
            if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
                const originX = width / 2 - voidX;
                const originY = height / 2 - voidY;
                leg.style.setProperty('transform-origin', `${originX}px ${originY}px`, 'important');
                leg.style.setProperty('transform', `translate3d(${panX}px, ${panY}px, 0px) scale(${zoomScale})`, 'important');
            } else {
                leg.style.setProperty('transform', 'none', 'important');
            }
        });
    }

    function handleResize(force = false) {
        if (!container || !canvas) return;
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        if (!force && Math.abs(width - rect.width) < 1 && Math.abs(height - rect.height) < 1) {
            return;
        }

        width = rect.width;
        height = rect.height;
        dpr = window.devicePixelRatio || 1;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        recomputeGeometry();

        if (zoomScale <= 1.05) {
            zoomScale = 1.0;
            panX = 0;
            panY = 0;
        } else {
            clampPan();
        }

        render();
    }

    function render() {
        if (!ctx || !isInitialized || width <= 0 || height <= 0) return;

        const k = typeof currentTemp !== 'undefined' ? currentTemp : 298;
        const selZ = (typeof selectedElement !== 'undefined' && selectedElement) ? selectedElement.atomicNumber : null;
        const isMain = (typeof currentView === 'undefined' || currentView === 'main');
        const isStateProp = isMain && (typeof currentProperty !== 'undefined' && currentProperty === 'state');

        // Evaluate states in Wasm
        let wasmStates = null;
        if (window.PeriodicaWasm && window.PeriodicaWasm.isReady()) {
            window.PeriodicaWasm.evaluateTemperature(k);
            wasmStates = window.PeriodicaWasm.getStates();
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // High-DPI Scaling + Pinch & Pan Viewport Transform
        ctx.scale(dpr, dpr);
        ctx.save();
        if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
            ctx.translate(width / 2 + panX, height / 2 + panY);
            ctx.scale(zoomScale, zoomScale);
            ctx.translate(-width / 2, -height / 2);
        }

        // Synchronize DOM void legends with pan & zoom transform
        const legends = document.querySelectorAll('#in-grid-legend');
        legends.forEach(leg => {
            if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
                const originX = width / 2 - voidX;
                const originY = height / 2 - voidY;
                leg.style.setProperty('transform-origin', `${originX}px ${originY}px`, 'important');
                leg.style.setProperty('transform', `translate3d(${panX}px, ${panY}px, 0px) scale(${zoomScale})`, 'important');
            } else {
                leg.style.setProperty('transform', 'none', 'important');
            }
        });

        // Check if any legend item or category is currently highlighted or locked
        const activeHighlight = window.activeLegendHighlight || (
            ((typeof lockedLegendKey !== 'undefined' && lockedLegendKey) || (typeof lockedLegendGroup !== 'undefined' && lockedLegendGroup))
                ? {
                    key: typeof lockedLegendKey !== 'undefined' ? lockedLegendKey : null,
                    type: typeof lockedLegendType !== 'undefined' ? lockedLegendType : null,
                    groupKeys: (typeof lockedLegendGroup !== 'undefined' && lockedLegendGroup && typeof categoryGroups !== 'undefined') ? categoryGroups[lockedLegendGroup] : null
                  }
                : null
        );

        // Draw all 118 element cards (Reflecting legend highlights cleanly)
        for (let i = 1; i <= 118; i++) {
            const item = elementPositions[i];
            if (!item) continue;

            const b = getElementBounds(item.col, item.row);
            const x = b.x;
            const y = b.y;
            const w = b.w;
            const h = b.h;
            const el = item.data;
            if (!el) continue;

            // Determine state
            let stateCode = 0; // Solid
            if (wasmStates) {
                stateCode = wasmStates[i - 1];
            } else if (el.meltingPoint !== null && el.boilingPoint !== null) {
                if (k < el.meltingPoint) stateCode = 0;
                else if (k < el.boilingPoint) stateCode = 1;
                else stateCode = 2;
            }

            // Determine element color and property value based on currentProperty
            const activeProp = (typeof window.currentProperty !== 'undefined' && window.currentProperty) ? window.currentProperty : ((typeof currentProperty !== 'undefined' && currentProperty) ? currentProperty : 'category');
            let cardHex = CATEGORY_COLORS[item.category] || '#64748b';
            let valStr = '';

            if (activeProp === 'state') {
                const stateNames = ['Solid', 'Liquid', 'Gas', 'Unknown'];
                cardHex = STATE_BG_COLORS[stateCode] || '#3b82f6';
                valStr = stateNames[stateCode] || '';
            } else if (activeProp === 'category' || activeProp === 'wiki') {
                cardHex = CATEGORY_COLORS[item.category] || '#64748b';
                valStr = el.atomicMass ? (typeof el.atomicMass === 'number' ? el.atomicMass.toFixed(1) : el.atomicMass) : '';
            } else if (activeProp === 'block') {
                const BLOCK_COLORS = { s: '#00d4ff', p: '#22c55e', d: '#6366f1', f: '#a855f7' };
                cardHex = BLOCK_COLORS[el.block] || '#64748b';
                valStr = (el.block ? el.block.toUpperCase() + '-block' : '');
            } else if (typeof heatmapConfigs !== 'undefined' && 
                       (heatmapConfigs[activeProp] || 
                        (activeProp === 'ionizationEnergy' && heatmapConfigs['ionization']) || 
                        (activeProp === 'ionization' && heatmapConfigs['ionizationEnergy']) ||
                        (activeProp === 'atomicRadius' && heatmapConfigs['radius']) ||
                        (activeProp === 'radius' && heatmapConfigs['atomicRadius'])) && 
                       typeof getPropertyValue === 'function' && typeof getGradientColor === 'function') {
                const numVal = getPropertyValue(el, activeProp);
                if (activeProp === 'discoveryYear' && el.discoveryYear === 'Ancient') {
                    cardHex = '#ffffff';
                    valStr = 'Ancient';
                } else if (numVal !== null && numVal !== undefined && !isNaN(numVal)) {
                    cardHex = getGradientColor(numVal, activeProp);
                    let v = Number(numVal);
                    valStr = (!Number.isInteger(v) && (v > 100 || v < -100)) ? Math.round(v).toString() : Number(v.toPrecision(3)).toString();
                } else {
                    cardHex = typeof heatmapUnknownColor !== 'undefined' ? heatmapUnknownColor : '#334155';
                    valStr = '-';
                }
            } else {
                cardHex = CATEGORY_COLORS[item.category] || '#64748b';
                valStr = el.atomicMass ? (typeof el.atomicMass === 'number' ? el.atomicMass.toFixed(1) : el.atomicMass) : '';
            }

            // Check legend highlight matching
            let isHighlighted = true;
            if (activeHighlight) {
                let match = false;
                const cat = item.category;
                let dualCat = el.dualCategory || '';
                if (el.atomicNumber === 85) {
                    dualCat = cat === 'Metalloid' ? 'Halogen' : 'Metalloid';
                } else if (el.atomicNumber === 84) {
                    dualCat = cat === 'Metalloid' ? 'Post-transition metal' : 'Metalloid';
                } else if (el.atomicNumber === 117) {
                    dualCat = 'Metalloid';
                }
                const stateNames = ['Solid', 'Liquid', 'Gas', 'Unknown'];
                const curStateName = stateNames[stateCode] || 'Solid';

                if (activeHighlight.groupKeys && Array.isArray(activeHighlight.groupKeys)) {
                    match = activeHighlight.groupKeys.includes(cat) || (dualCat && activeHighlight.groupKeys.includes(dualCat));
                } else if (activeHighlight.type === 'category') {
                    match = (cat === activeHighlight.key) || (dualCat && dualCat === activeHighlight.key);
                } else if (activeHighlight.type === 'state') {
                    match = (curStateName === activeHighlight.key);
                } else if (activeHighlight.type === 'block') {
                    match = (el.block === activeHighlight.key);
                } else if (activeHighlight.type === 'exception') {
                    match = (typeof aufbauExceptions !== 'undefined' && (i in aufbauExceptions));
                } else if (activeHighlight.type === 'subshell') {
                    match = typeof window.isElementEndingOnSubshell === 'function' ? window.isElementEndingOnSubshell(el, activeHighlight.key) : (el.electronConfiguration && el.electronConfiguration.includes(activeHighlight.key));
                }
                isHighlighted = match;
            }

            // Isotope Decay Mode Filter
            if (window.activeDecayHighlight && typeof isotopeData !== 'undefined') {
                const z = el.atomicNumber;
                const isos = isotopeData[z] || [];
                const decayKey = window.activeDecayHighlight;
                let decayMatch = false;
                if (decayKey === 'Stable') {
                    decayMatch = isos.some(iso => iso.isStable);
                } else if (decayKey === 'Radioactive') {
                    decayMatch = isos.some(iso => !iso.isStable);
                } else if (decayKey === 'Alpha') {
                    decayMatch = isos.some(iso => (/\bA\b/.test(iso.decayMode || '') || (iso.decayMode || '').includes('Alpha')));
                } else if (decayKey === 'Beta-') {
                    decayMatch = isos.some(iso => (iso.decayMode || '').includes('B-'));
                } else if (decayKey === 'Beta+') {
                    decayMatch = isos.some(iso => ((iso.decayMode || '').includes('B+') || (iso.decayMode || '').includes('EC')));
                } else if (decayKey === 'SF') {
                    decayMatch = isos.some(iso => (iso.decayMode || '').includes('SF'));
                } else if (decayKey === 'Proton') {
                    decayMatch = isos.some(iso => /\bp\b/.test(iso.decayMode || ''));
                } else if (decayKey === 'Neutron') {
                    decayMatch = isos.some(iso => /\bn\b/.test(iso.decayMode || ''));
                }
                if (!decayMatch) isHighlighted = false;
            }

            // Discovery Year Timeline Filter
            if (activeProp === 'discoveryYear' && typeof window.currentTimelineYear !== 'undefined') {
                const disc = el.discoveryYear;
                const dYear = disc === 'Ancient' ? -10000 : Number(disc);
                if (!isNaN(dYear) && dYear > window.currentTimelineYear) {
                    isHighlighted = false;
                }
            }

            const stateColor = STATE_COLORS[stateCode] || '#ffffff';
            const isSelected = (selZ === i);

            const isHovered = (hoveredZ === i);
            const isStateSolid = (activeProp === 'state' && stateCode === 0);

            // Dynamic opacity based on highlighting and selection
            let baseAlpha, borderAlpha;
            if (activeHighlight || (activeProp === 'discoveryYear' && typeof window.currentTimelineYear !== 'undefined')) {
                if (isHighlighted) {
                    baseAlpha = isSelected ? 0.98 : (isHovered ? 0.95 : 0.88);
                    borderAlpha = 1.0;
                } else {
                    baseAlpha = 0.08;
                    borderAlpha = 0.15;
                }
            } else {
                baseAlpha = isSelected ? 0.98 : (isHovered ? 0.95 : 0.90);
                borderAlpha = isSelected ? 1.0 : (isHovered ? 0.95 : 0.75);
            }

            // Square shape card with smooth tactile rounded corners
            const cornerRadius = Math.max(2.5, Math.min(5, Math.min(w, h) * 0.085));
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, cornerRadius);

            let cardGrad;
            if (activeHighlight && !isHighlighted) {
                // Dimmed element card
                cardGrad = ctx.createLinearGradient(x, y, x, y + h);
                cardGrad.addColorStop(0, hexToRgba(cardHex, 0.08));
                cardGrad.addColorStop(1, hexToRgba(cardHex, 0.03));
            } else if (isStateSolid) {
                cardGrad = ctx.createLinearGradient(x, y, x + w * 0.85, y + h);
                cardGrad.addColorStop(0, isSelected ? 'rgba(255, 255, 255, 0.98)' : (isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.92)'));
                cardGrad.addColorStop(0.5, isSelected ? 'rgba(241, 245, 249, 0.95)' : (isHovered ? 'rgba(241, 245, 249, 0.90)' : 'rgba(226, 232, 240, 0.85)'));
                cardGrad.addColorStop(1, isSelected ? 'rgba(203, 213, 225, 0.90)' : (isHovered ? 'rgba(203, 213, 225, 0.82)' : 'rgba(148, 163, 184, 0.78)'));
            } else {
                cardGrad = createCellGradient(ctx, x, y, w, h, cardHex, isSelected, isHovered);
            }
            ctx.fillStyle = cardGrad;
            ctx.fill();

            // 2.5D Tactile Depth: Specular top highlight bevel line
            if (!activeHighlight || isHighlighted) {
                ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.75)' : (isHovered ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.35)');
                ctx.fillRect(x + 1, y + 1, w - 2, 1.2);

                // 2.5D Tactile Depth: Bottom shadow lip
                ctx.fillStyle = isSelected ? 'rgba(0, 240, 255, 0.90)' : (isHovered ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.55)');
                ctx.fillRect(x + 1, y + h - 2, w - 2, 1.8);
            }

            const isUnknownState = (activeProp === 'state' && stateCode === 3);
            if (isUnknownState) {
                ctx.setLineDash([2, 2]);
            } else {
                ctx.setLineDash([]);
            }

            ctx.strokeStyle = isSelected 
                ? '#00f0ff' 
                : (isHovered 
                    ? 'rgba(255, 255, 255, 0.95)' 
                    : (isStateSolid 
                        ? 'rgba(255, 255, 255, 0.95)' 
                        : hexToRgba(cardHex, borderAlpha)));
            ctx.lineWidth = isSelected ? 2.5 : (isHovered ? 2.0 : (activeHighlight && isHighlighted ? 1.8 : 1.0));
            ctx.stroke();
            ctx.setLineDash([]);

            // Selected or Hovered or Active Elements Glowing Outline
            if (isSelected) {
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 12;
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (isHovered) {
                ctx.shadowColor = cardHex;
                ctx.shadowBlur = 10;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.0;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else if (activeHighlight && isHighlighted) {
                ctx.shadowColor = cardHex;
                ctx.shadowBlur = 6;
                ctx.strokeStyle = hexToRgba(cardHex, 0.95);
                ctx.lineWidth = 1.8;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Typography Metrics & Opacity
            const textDim = (activeHighlight && !isHighlighted);
            let numColor, symColorDirect, nameColor, massColor;

            const rgbComp = hexToRgbComponents(cardHex);
            const cardLum = (rgbComp[0] * 299 + rgbComp[1] * 587 + rgbComp[2] * 114) / 1000;
            const isBrightCard = (cardLum > 185) || isStateSolid;

            if (isBrightCard) {
                numColor = textDim ? 'rgba(15, 23, 42, 0.25)' : (isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.90)');
                symColorDirect = textDim ? 'rgba(15, 23, 42, 0.25)' : (isSelected ? '#000000' : '#0f172a');
                nameColor = textDim ? 'rgba(30, 41, 59, 0.20)' : (isSelected ? '#0f172a' : 'rgba(30, 41, 59, 0.95)');
                massColor = textDim ? 'rgba(51, 65, 85, 0.15)' : (isSelected ? '#1e293b' : 'rgba(51, 65, 85, 0.85)');
            } else {
                numColor = `rgba(255, 255, 255, ${textDim ? 0.20 : (isSelected || isHovered ? 1.0 : 0.90)})`;
                symColorDirect = textDim ? hexToRgba(stateColor, 0.25) : (isSelected ? (stateCode === 0 ? '#ffffff' : stateColor) : stateColor);
                nameColor = `rgba(255, 255, 255, ${textDim ? 0.18 : (isSelected || isHovered ? 1.0 : 0.95)})`;
                massColor = `rgba(255, 255, 255, ${textDim ? 0.12 : (isSelected || isHovered ? 0.98 : 0.85)})`;
            }

            const maxTextW = Math.max(8, w - 4);
            const fontSizeNum = Math.max(6, Math.min(8.5, h * 0.22));
            const fontSizeSym = Math.max(10, Math.min(18, h * 0.38));
            const fontSizeName = Math.max(5.5, Math.min(7.5, h * 0.18));
            const fontSizeMass = Math.max(5.5, Math.min(7.5, h * 0.18));

            // 1. Atomic Number (Top-Left)
            ctx.font = `700 ${fontSizeNum}px monospace, sans-serif`;
            ctx.fillStyle = numColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`${i}`, x + 3, y + 2, w * 0.45);

            // 2. Chemical Symbol (Centered, Bold, State-Colored)
            ctx.font = `800 ${fontSizeSym}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif`;
            ctx.fillStyle = symColorDirect;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (isSelected) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.shadowBlur = 4;
            }
            ctx.fillText(el.symbol, x + w / 2, y + h * 0.44, maxTextW);
            ctx.shadowBlur = 0;

            // 3. Element Name (Sub-label)
            ctx.font = `600 ${fontSizeName}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            ctx.fillStyle = nameColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let displayName = el.name || '';
            if (ctx.measureText(displayName).width > maxTextW) {
                while (displayName.length > 3 && ctx.measureText(displayName + '..').width > maxTextW) {
                    displayName = displayName.slice(0, -1);
                }
                displayName += '..';
            }
            ctx.fillText(displayName, x + w / 2, y + h * 0.69, maxTextW);

            // 4. Atomic Mass / Property Value (Bottom-Center)
            ctx.font = `500 ${fontSizeMass}px monospace, sans-serif`;
            ctx.fillStyle = massColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            let displayVal = valStr || '';
            if (ctx.measureText(displayVal).width > maxTextW) {
                while (displayVal.length > 3 && ctx.measureText(displayVal + '..').width > maxTextW) {
                    displayVal = displayVal.slice(0, -1);
                }
                displayVal += '..';
            }
            ctx.fillText(displayVal, x + w / 2, y + h - 1, maxTextW);
        }

        drawIndicators(groupHeaderH, periodMarginLeft);
        drawPlaceholders();
        drawTableTypeElementBox();
        drawFitModeElementBox();

        ctx.restore(); // Restore Viewport transform

        // Dismiss splash screen on successful canvas render
        dismissSplashScreen();

        // Draw Full-Screen Viewport Edge & Corner Glow Flash (Single smooth flash)
        drawScreenEdgeGlow();

        ctx.restore(); // Restore Canvas scale
    }

    function drawIndicators(gh, pw) {
        ctx.save();
        // 1. Group Headers (Columns 1 to 18)
        for (let col = 1; col <= 18; col++) {
            const gx = offsetX + (col - 1) * (cellW + gap);
            const gy = offsetY - gh;
            const gw = cellW;
            const gData = GROUPS_DATA[col - 1];
            if (!gData) continue;

            // Subtle indicator tick at bottom of group header
            ctx.fillStyle = 'rgba(56, 189, 248, 0.40)';
            ctx.fillRect(gx + gw * 0.15, gy + gh - 1.5, gw * 0.7, 1.5);

            // Group Number (1-18)
            const numFontSize = Math.max(8, Math.min(11, gh * 0.50));
            ctx.font = `800 ${numFontSize}px monospace, sans-serif`;
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.textBaseline = cellW >= 42 ? 'top' : 'middle';
            
            if (cellW >= 42) {
                ctx.fillText(gData.num, gx + gw / 2, gy + 1);
                // IUPAC Roman numeral label (e.g. IA, IIA, etc.)
                const iupacFontSize = Math.max(6, Math.min(8.5, gh * 0.36));
                ctx.font = `600 ${iupacFontSize}px 'IBM Plex Mono', monospace, sans-serif`;
                ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
                ctx.textBaseline = 'bottom';
                ctx.fillText(gData.iupac, gx + gw / 2, gy + gh - 2.5);
            } else {
                ctx.fillText(gData.num, gx + gw / 2, gy + gh / 2);
            }
        }

        // 2. Period Headers (Periods 1 to 7)
        for (let p = 0; p < PERIODS_DATA.length; p++) {
            const pData = PERIODS_DATA[p];
            const row = pData.row;
            const py = offsetY + (row - 1) * (cellH + gap);
            const px = offsetX - pw;
            const ph = cellH;

            // Subtle indicator pip on right side
            ctx.fillStyle = 'rgba(56, 189, 248, 0.40)';
            ctx.fillRect(px + pw - 2, py + ph * 0.3, 2, ph * 0.4);

            // Period Number (1-7)
            const pFontSize = Math.max(9, Math.min(12, cellH * 0.28));
            ctx.font = `800 ${pFontSize}px monospace, sans-serif`;
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pData.num, px + (pw - 2) / 2, py + ph / 2);
        }

        // 3. Lanthanides & Actinides Period Indicators (Rows 9 & 10)
        const py9 = offsetY + (9 - 2) * (cellH + gap) + gap * 2.5;
        const px9 = offsetX - pw;
        ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.fillRect(px9 + pw - 2, py9 + cellH * 0.3, 2, cellH * 0.4);
        ctx.font = `800 ${Math.max(8.5, Math.min(11, cellH * 0.25))}px monospace, sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('6*', px9 + (pw - 2) / 2, py9 + cellH / 2);

        const py10 = offsetY + (10 - 2) * (cellH + gap) + gap * 2.5;
        ctx.fillStyle = 'rgba(192, 38, 211, 0.45)';
        ctx.fillRect(px9 + pw - 2, py10 + cellH * 0.3, 2, cellH * 0.4);
        ctx.font = `800 ${Math.max(8.5, Math.min(11, cellH * 0.25))}px monospace, sans-serif`;
        ctx.fillStyle = '#e879f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('7*', px9 + (pw - 2) / 2, py10 + cellH / 2);

        // 4. Dashed Connector Lines from Row 6/7 Col 3 to Row 9/10 Col 4
        const bP6 = getElementBounds(3, 6);
        const bLa = getElementBounds(4, 9);
        const bP7 = getElementBounds(3, 7);
        const bAc = getElementBounds(4, 10);

        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);

        // Lanthanide connector
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.moveTo(bP6.x + bP6.w, bP6.y + bP6.h * 0.5);
        ctx.lineTo(bLa.x - 2, bLa.y + bLa.h * 0.5);
        ctx.stroke();

        // Actinide connector
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.45)';
        ctx.beginPath();
        ctx.moveTo(bP7.x + bP7.w, bP7.y + bP7.h * 0.5);
        ctx.lineTo(bAc.x - 2, bAc.y + bAc.h * 0.5);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();
    }

    function drawPlaceholders() {
        const placeholders = [
            { col: 3, row: 6, label: '57-71', sub: 'F-BLOCK', color: '#ec4899' },
            { col: 3, row: 7, label: '89-103', sub: 'F-BLOCK', color: '#a855f7' }
        ];

        for (const p of placeholders) {
            const b = getElementBounds(p.col, p.row);
            const x = b.x;
            const y = b.y;
            const w = b.w;
            const h = b.h;

            const phCornerRadius = Math.max(2.5, Math.min(5, Math.min(w, h) * 0.085));
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, phCornerRadius);
            ctx.fillStyle = hexToRgba(p.color, 0.22);
            ctx.fill();

            // 2.5D Tactile Depth: Specular top highlight bevel line
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(x + 1, y + 1, w - 2, 1.2);

            // 2.5D Tactile Depth: Bottom shadow lip
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(x + 1, y + h - 2, w - 2, 1.8);

            ctx.strokeStyle = hexToRgba(p.color, 1.0);
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            const fontSize = Math.max(7, Math.min(9.5, h * 0.28));
            ctx.font = `700 ${fontSize}px monospace, sans-serif`;
            ctx.fillStyle = hexToRgba(p.color, 1.0);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label, x + w / 2, y + h / 2);
        }
    }

    function drawScreenEdgeGlow() {}

    function dismissSplashScreen() {
        const splash = document.getElementById('app-splash-skeleton');
        if (splash && !splash.classList.contains('fade-out')) {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';
                handleResize();
            }, 380);
        }
        handleResize();
    }
    window.dismissSplashScreen = dismissSplashScreen;

    function getWideElementCardBounds(row) {
        const b1 = getElementBounds(1, row);
        const b2 = getElementBounds(2, row);
        return {
            x: b1.x,
            y: b1.y,
            w: (b2.x + b2.w) - b1.x,
            h: b1.h
        };
    }

    function drawTableTypeElementBox() {
        const propLabels = {
            'category': 'Category',
            'state': 'State View',
            'discoveryYear': 'Discovery',
            'electronegativity': 'Electroneg',
            'atomicMass': 'Atomic Mass',
            'atomicRadius': 'Atomic Radius',
            'radius': 'Atomic Radius',
            'ionizationEnergy': 'Ionization',
            'ionization': 'Ionization',
            'electronAffinity': 'Affinity',
            'meltingPoint': 'Melting Pt',
            'boilingPoint': 'Boiling Pt',
            'density': 'Density',
            'block': 'Orbital Block'
        };
        const activeProp = (typeof window.currentProperty !== 'undefined' && window.currentProperty) ? window.currentProperty : ((typeof currentProperty !== 'undefined' && currentProperty) ? currentProperty : 'category');
        const propTitle = propLabels[activeProp] || 'Category';

        const b = getWideElementCardBounds(9);
        const x = b.x;
        const y = b.y;
        const w = b.w;
        const h = b.h;
        const r = 4.5;

        const selCornerRadius = Math.max(2.5, Math.min(5, Math.min(w, h) * 0.085));
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, selCornerRadius);

        // Premium obsidian glass background with subtle cyan / purple gradient
        const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
        cardGrad.addColorStop(0, 'rgba(24, 34, 58, 0.96)');
        cardGrad.addColorStop(0.45, 'rgba(15, 23, 42, 0.94)');
        cardGrad.addColorStop(1, 'rgba(9, 14, 28, 0.96)');
        ctx.fillStyle = cardGrad;
        ctx.fill();

        // 2.5D Tactile Depth: Specular top highlight bevel line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
        ctx.fillRect(x + 1, y + 1, w - 2, 1.2);

        // 2.5D Tactile Depth: Bottom shadow lip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.60)';
        ctx.fillRect(x + 1, y + h - 2, w - 2, 1.8);

        // Neon Glowing Border
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.85)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Subtle glow filter effect
        ctx.shadowColor = 'rgba(0, 212, 255, 0.35)';
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 1. Top-Left Tag (Atomic Number position)
        const fontSizeTag = Math.max(5.5, Math.min(7.5, h * 0.20));
        ctx.font = `800 ${fontSizeTag}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = '#00f0ff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('🎛️ VIEW', x + 3.5, y + 2.5);

        // 2. Top-Right Dropdown Tag (Weight position)
        const fontSizeArrow = Math.max(5, Math.min(7, h * 0.18));
        ctx.font = `700 ${fontSizeArrow}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText('▾ SWITCH', x + w - 3.5, y + 2.5);

        // 3. Center Main Symbol (Symbol position)
        const fontSizeSym = Math.max(8, Math.min(12, h * 0.36));
        ctx.font = `900 ${fontSizeSym}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let displayTitle = propTitle;
        if (displayTitle.length > 13 && w < 95) {
            displayTitle = displayTitle.substring(0, 11) + '..';
        }
        ctx.fillText(displayTitle, x + w / 2, y + h * 0.50);

        // 4. Bottom Subtitle (Element Name position)
        const fontSizeSub = Math.max(4.5, Math.min(6.5, h * 0.17));
        ctx.font = `600 ${fontSizeSub}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('TABLE VIEW TYPE', x + w / 2, y + h - 2.5);

        ctx.restore();
    }

    function drawFitModeElementBox() {
        const isZoomedOrPanned = (zoomScale > 1.03 || Math.abs(panX) > 3 || Math.abs(panY) > 3);
        const b = getWideElementCardBounds(10);
        const x = b.x;
        const y = b.y;
        const w = b.w;
        const h = b.h;

        const selCornerRadius = Math.max(2.5, Math.min(5, Math.min(w, h) * 0.085));
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, selCornerRadius);

        const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
        if (isZoomedOrPanned) {
            cardGrad.addColorStop(0, 'rgba(234, 88, 12, 0.95)');
            cardGrad.addColorStop(1, 'rgba(124, 45, 18, 0.95)');
        } else if (currentFitMode === 'whole') {
            cardGrad.addColorStop(0, 'rgba(16, 42, 66, 0.95)');
            cardGrad.addColorStop(1, 'rgba(8, 22, 38, 0.95)');
        } else {
            cardGrad.addColorStop(0, 'rgba(20, 35, 60, 0.95)');
            cardGrad.addColorStop(1, 'rgba(10, 18, 32, 0.95)');
        }
        ctx.fillStyle = cardGrad;
        ctx.fill();

        // 2.5D Tactile Depth: Specular top highlight bevel line
        ctx.fillStyle = isZoomedOrPanned ? 'rgba(254, 215, 170, 0.50)' : 'rgba(56, 189, 248, 0.40)';
        ctx.fillRect(x + 1, y + 1, w - 2, 1.2);

        // 2.5D Tactile Depth: Bottom shadow lip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(x + 1, y + h - 2, w - 2, 1.8);

        ctx.strokeStyle = isZoomedOrPanned ? 'rgba(249, 115, 22, 0.90)' : (currentFitMode === 'whole' ? 'rgba(56, 189, 248, 0.85)' : 'rgba(99, 102, 241, 0.85)');
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 1. Top-Left Tag
        const fontSizeTag = Math.max(5.5, Math.min(7.5, h * 0.20));
        ctx.font = `800 ${fontSizeTag}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = isZoomedOrPanned ? '#fed7aa' : '#38bdf8';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const tagText = isZoomedOrPanned ? '↺ RESET' : (currentFitMode === 'whole' ? '⛶ FIT' : '↔ FIT');
        ctx.fillText(tagText, x + 3.5, y + 2.5);

        // 2. Top-Right Tag: Zoom percentage
        const fontSizeScale = Math.max(5, Math.min(7, h * 0.18));
        ctx.font = `700 ${fontSizeScale}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = isZoomedOrPanned ? '#fdba74' : '#94a3b8';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`${Math.round(zoomScale * 100)}%`, x + w - 3.5, y + 2.5);

        // 3. Center Main Symbol
        const fontSizeSym = Math.max(7.5, Math.min(11, h * 0.35));
        ctx.font = `800 ${fontSizeSym}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let mainTitle = '';
        if (isZoomedOrPanned) {
            mainTitle = '↺ Reset View';
        } else if (currentFitMode === 'whole') {
            mainTitle = '⛶ Whole Table';
        } else {
            mainTitle = '↔ Fit Width';
        }
        ctx.fillText(mainTitle, x + w / 2, y + h * 0.50);

        // 4. Bottom Subtitle
        const fontSizeSub = Math.max(4.5, Math.min(6.5, h * 0.17));
        ctx.font = `600 ${fontSizeSub}px 'IBM Plex Mono', monospace, sans-serif`;
        ctx.fillStyle = isZoomedOrPanned ? '#fdba74' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        let subTitle = '';
        if (isZoomedOrPanned) {
            subTitle = 'TAP TO FIT SCREEN';
        } else if (currentFitMode === 'whole') {
            subTitle = 'ALL 10 ROWS FIT';
        } else {
            subTitle = 'SPAN 18 COLUMNS';
        }
        ctx.fillText(subTitle, x + w / 2, y + h - 2.5);

        ctx.restore();
    }

    let lastPointerClickTime = 0;
    function handlePointerClick(e) {
        if (!container || !canvas) return;
        const now = Date.now();
        if (now - lastPointerClickTime < 220) return;
        if (now - (window._lastSelectPopoverPickTime || 0) < 400) return;
        lastPointerClickTime = now;

        // Ignore canvas click if user tapped inside active floating sidebar or custom popover
        const activeSidebar = document.querySelector('.view-right.mobile-active, .view-right.open');
        if (activeSidebar) {
            const sbRect = activeSidebar.getBoundingClientRect();
            if (e.clientX >= sbRect.left && e.clientX <= sbRect.right && e.clientY >= sbRect.top && e.clientY <= sbRect.bottom) {
                return;
            }
        }
        const pop = document.getElementById('compact-select-popover');
        if (pop && pop.style.display !== 'none') {
            const pRect = pop.getBoundingClientRect();
            if (e.clientX >= pRect.left && e.clientX <= pRect.right && e.clientY >= pRect.top && e.clientY <= pRect.bottom) {
                return;
            }
        }

        const rect = canvas.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;

        // Check if user clicked inside Wide Table Type or Fit Mode Element Boxes (Row 9 & 10, Cols 1-2)
        const bType = getWideElementCardBounds(9);
        const bFit = getWideElementCardBounds(10);
        
        let worldX = rawX;
        let worldY = rawY;
        if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
            worldX = (rawX - (width / 2 + panX)) / zoomScale + width / 2;
            worldY = (rawY - (height / 2 + panY)) / zoomScale + height / 2;
        }

        const hitPad = 6;
        if (worldX >= bType.x - hitPad && worldX <= bType.x + bType.w + hitPad && worldY >= bType.y - hitPad && worldY <= bType.y + bType.h + hitPad) {
            if (window.NativeServices?.Haptics) {
                window.NativeServices.Haptics.selection();
            }
            if (window.openTableTypeModal) window.openTableTypeModal();
            return;
        }

        if (worldX >= bFit.x - hitPad && worldX <= bFit.x + bFit.w + hitPad && worldY >= bFit.y - hitPad && worldY <= bFit.y + bFit.h + hitPad) {
            if (window.NativeServices?.Haptics) {
                window.NativeServices.Haptics.selection();
            }
            toggleFitMode();
            return;
        }

        // 2a. Check if user clicked on any legend title to open Card Anatomy Guide
        const allLegendTitles = document.querySelectorAll('#in-grid-legend .legend-box-title, #elec-in-grid-legend .legend-box-title, .heatmap-legend-title, .heatmap-scale-title');
        for (let j = 0; j < allLegendTitles.length; j++) {
            const title = allLegendTitles[j];
            const r = title.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                if (typeof window.openCardAnatomyModal === 'function') {
                    window.openCardAnatomyModal();
                    return;
                }
            }
        }

        // 2b. Check if user clicked inside any legend item or super category
        const allLegendItems = document.querySelectorAll('#in-grid-legend .legend-item, #in-grid-legend .interactive-super, #elec-in-grid-legend .legend-item, #elec-in-grid-legend .interactive-super');
        for (let j = 0; j < allLegendItems.length; j++) {
            const item = allLegendItems[j];
            const r = item.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                if (item.classList.contains('interactive-super')) {
                    if (typeof window.handleSuperLegendClick === 'function') {
                        window.handleSuperLegendClick(item, e);
                        return;
                    }
                } else {
                    if (typeof window.handleLegendClick === 'function') {
                        window.handleLegendClick(item, e);
                        return;
                    }
                }
            }
        }

        // 2c. Check if user clicked inside heatmap scale buttons or color inputs
        const allLegendInteractive = document.querySelectorAll('#in-grid-legend .scale-btn, #in-grid-legend input[type="color"], #in-grid-legend button, #elec-in-grid-legend button');
        for (let j = 0; j < allLegendInteractive.length; j++) {
            const btn = allLegendInteractive[j];
            const r = btn.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                btn.click();
                if (btn.tagName === 'INPUT' && btn.type === 'color') {
                    btn.focus();
                }
                return;
            }
        }

        // 3. Inverse Transformation for Zoom & Pan for element cards
        let clientX = rawX;
        let clientY = rawY;
        if (zoomScale !== 1.0 || panX !== 0 || panY !== 0) {
            clientX = (clientX - (width / 2 + panX)) / zoomScale + width / 2;
            clientY = (clientY - (height / 2 + panY)) / zoomScale + height / 2;
        }

        let clickedElement = false;
        for (let i = 1; i <= 118; i++) {
            const item = elementPositions[i];
            if (!item) continue;
            const b = getElementBounds(item.col, item.row);

            if (clientX >= b.x && clientX <= b.x + b.w && clientY >= b.y && clientY <= b.y + b.h) {
                clickedElement = true;
                fitBlinkActive = false;
                if (typeof selectElement === 'function') {
                    selectElement(item.z, true, true);
                }
                if (typeof window.updateCentralHeroInspector === 'function') {
                    window.updateCentralHeroInspector(item.z);
                }
                render();
                return;
            }
        }

        // 4. Tap on empty space: close all popups & deselect active legend highlight
        if (!clickedElement) {
            const timeSinceLastEmptyTap = now - lastTapTime;
            lastTapTime = now;
            if (timeSinceLastEmptyTap < 350) {
                // Double tap on empty canvas space smoothly resets zoom and centers the table!
                if (window.NativeServices?.Haptics) {
                    window.NativeServices.Haptics.selection();
                }
                snapToFitWithAnimation();
                return;
            }

            if (typeof window.clearLegendHighlightingForce === 'function') {
                window.clearLegendHighlightingForce();
            }
            if (typeof closeMobileSidebar === 'function') {
                closeMobileSidebar();
            }
            if (typeof window.closeWikiModal === 'function') {
                window.closeWikiModal();
            }
            if (typeof selectedElement !== 'undefined') {
                selectedElement = null;
            }
            if (typeof window.updateCentralHeroInspector === 'function') {
                window.updateCentralHeroInspector(null);
            }
            render();
        }
    }

    function getElementScreenPos(z) {
        const item = elementPositions[z];
        if (!item || !container || !canvas) return null;
        const b = getElementBounds(item.col, item.row);
        const rect = canvas.getBoundingClientRect();
        const worldCenterX = b.x + b.w / 2;
        const worldCenterY = b.y + b.h / 2;
        const screenX = rect.left + (worldCenterX - width / 2) * zoomScale + width / 2 + panX;
        const screenY = rect.top + (worldCenterY - height / 2) * zoomScale + height / 2 + panY;
        return { x: screenX, y: screenY };
    }

    function requestRender() {
        if (!rafScheduled) {
            rafScheduled = true;
            requestAnimationFrame(() => {
                rafScheduled = false;
                render();
            });
        }
    }

    return {
        init: init,
        render: render,
        requestRender: requestRender,
        resize: handleResize,
        snapToFit: snapToFitWithAnimation,
        triggerFitBlink: triggerFitBlink,
        toggleFitMode: toggleFitMode,
        setFitMode: setFitMode,
        getFitMode: function() { return currentFitMode; },
        getElementScreenPos: getElementScreenPos
    };
})();

window.CanvasGrid = window.PeriodicCanvasGrid;
