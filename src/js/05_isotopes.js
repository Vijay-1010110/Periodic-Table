/**
 * 05_isotopes.js
 * Handles the logic for the Isotopes interface.
 */

// Global state for isotopes view
let currentIsotopeData = [];
let currentIsotopeIndex = 0;
let currentAtomicNumber = 1;

function isActuallyStable(iso) {
    if (!iso) return false;
    if (iso.decayMode && iso.decayMode !== 'Stable' && iso.decayMode !== '-') return false;
    return !!iso.isStable;
}

function getDecayColor(mode) {
    if (!mode) return '#888888';
    if (mode === 'Stable' || mode === '-') return '#4ade80';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return '#facc15';
    if (mode.includes('B-')) return '#38bdf8';
    if (mode.includes('B+') || mode.includes('EC')) return '#c084fc';
    if (mode.includes('SF')) return '#f87171';
    if (/\bp\b/.test(mode)) return '#fb923c';
    return '#94a3b8';
}

function getDecayCompactTag(mode, isStable) {
    if (isStable || !mode || mode === 'Stable' || mode === '-') return 'STABLE';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return 'α';
    if (mode.includes('B-') || mode.includes('2B-')) return 'β⁻';
    if (mode.includes('B+') || mode.includes('EC')) return 'β⁺/EC';
    if (mode.includes('SF')) return 'SF';
    if (/\bp\b/.test(mode)) return 'p⁺';
    if (/\bn\b/.test(mode)) return 'n⁰';
    return mode.split(' ')[0] || 'DEC';
}

function getDecayModeLabel(mode, isStable) {
    if (isStable || !mode || mode === 'Stable' || mode === '-') return 'STABLE';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) return 'α ALPHA';
    if (mode.includes('B-') || mode.includes('2B-')) return 'β⁻ BETA-';
    if (mode.includes('B+') || mode.includes('EC')) return 'β⁺/EC';
    if (mode.includes('SF')) return 'SF FISSION';
    if (/\bp\b/.test(mode)) return 'p PROTON';
    if (/\bn\b/.test(mode)) return 'n NEUTRON';
    return mode.split(' ')[0] || 'UNSTABLE';
}

function formatCompactHalfLife(iso) {
    if (isActuallyStable(iso)) return 'Stable';
    if (!iso.halfLife) return 'Unstable';
    const val = iso.halfLife;
    let unit = iso.halfLifeUnit || '';
    
    unit = unit.replace('billion years', 'B yr')
               .replace('billion year', 'B yr')
               .replace('million years', 'M yr')
               .replace('million year', 'M yr')
               .replace('Gyears', 'B yr')
               .replace('Gyear', 'B yr')
               .replace('Myears', 'M yr')
               .replace('Myear', 'M yr')
               .replace('kyears', 'k yr')
               .replace('kyear', 'k yr')
               .replace('years', 'yr')
               .replace('year', 'yr')
               .replace('days', 'd')
               .replace('day', 'd')
               .replace('hours', 'h')
               .replace('hour', 'h')
               .replace('minutes', 'm')
               .replace('minute', 'm')
               .replace('seconds', 's')
               .replace('second', 's')
               .replace('msec', 'ms')
               .replace('usec', 'μs')
               .replace('nsec', 'ns');
               
    const numStr = val % 1 === 0 ? val.toString() : (val >= 100 ? val.toFixed(0) : (val >= 10 ? val.toFixed(1) : val.toFixed(2).replace(/\.?0+$/, '')));
    return `${numStr} ${unit}`;
}

/**
 * Comprehensive Nuclear Decay Explanations Dictionary for Educational Popups
 */
const decayExplanationsData = {
    'Stable': {
        title: 'Stable Nuclides & Valley of Stability',
        badge: '🟢',
        badgeColor: '#4ade80',
        subtitle: 'Ground-State Non-Decaying Isotopes (252 Known)',
        nuclideCount: '252 Stable Nuclides across 80 Elements',
        equationText: 'AZX ➔ Indefinitely Stable (No Spontaneous Decay)',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '0' },
            { label: 'Mass Change (ΔA)', val: '0' },
            { label: 'Radiation', val: 'None' },
            { label: 'Half-Life', val: '∞ (Infinite)' }
        ],
        mechanism: 'Stable nuclides lie along the <strong>Valley of Stability</strong> (or line of beta-stability), where the strong nuclear attractive force perfectly balances electrostatic Coulomb repulsion among protons. For light nuclei (Z ≤ 20), stability occurs at N/Z ≈ 1.0 (e.g. ¹²C, ¹⁶O). For heavy nuclei, neutron excess increases to N/Z ≈ 1.5 (e.g. ²⁰⁸Pb) to overcome proton-proton repulsion. Nuclei with magic nucleon counts (2, 8, 20, 28, 50, 82, 126) possess completely filled nuclear shells and maximum binding energy per nucleon.',
        examples: [
            { parent: '¹²₆C (Carbon-12)', daughter: 'Stable (98.93% Abundance)', note: 'Universal atomic mass standard' },
            { parent: '⁵⁶₂₆Fe (Iron-56)', daughter: 'Stable (91.75% Abundance)', note: 'Peak nuclear binding energy' },
            { parent: '²⁰⁸₈₂Pb (Lead-208)', daughter: 'Stable (Double Magic: Z=82, N=126)', note: 'Heaviest stable nuclide' }
        ]
    },
    'Radioactive': {
        title: 'Radioisotopes & Spontaneous Transmutation',
        badge: '☢️',
        badgeColor: '#ef4444',
        subtitle: 'Unstable Nuclei Undergoing Radioactive Decay (2,900+ Known)',
        nuclideCount: '2,900+ Radioactive Nuclides across All 118 Elements',
        equationText: 'N(t) = N₀ · e^(-λt) = N₀ · (½)^(t / t½)',
        metrics: [
            { label: 'Primary Cause', val: 'N/Z Imbalance' },
            { label: 'Decay Law', val: 'Exponential' },
            { label: 'Decay Modes', val: 'α, β⁻, β⁺/EC, SF, p, n' },
            { label: 'Half-Lives', val: '10⁻²² s to 10²⁴ yr' }
        ],
        mechanism: 'Radioisotopes possess an unfavorable ratio of neutrons to protons (N/Z) or excessive nuclear mass (all elements with Z ≥ 83 have no stable isotopes). To reach a lower ground-state energy, the unstable nucleus spontaneously emits ionizing radiation (alpha particles, beta electrons/positrons, gamma photons, neutrons, or undergoes spontaneous fission). Radioisotopes decay according to first-order exponential kinetics governed by their unique half-life (t½).',
        examples: [
            { parent: '¹⁴₆C (Carbon-14)', daughter: '¹⁴₇N + e⁻ + ν̅e (t½ = 5,730 yr)', note: 'Archaeological radiocarbon dating' },
            { parent: '⁶⁰₂₇Co (Cobalt-60)', daughter: '⁶⁰₂₈Ni + e⁻ + γ (t½ = 5.27 yr)', note: 'Industrial radiography & radiotherapy' },
            { parent: '²³⁸₉₂U (Uranium-238)', daughter: '²⁰⁶₈₂Pb (t½ = 4.468 × 10⁹ yr)', note: 'Decay chain dating of Earth\'s crust' }
        ]
    },
    'Alpha': {
        title: 'Alpha Decay (α Emission)',
        badge: 'α',
        badgeColor: '#facc15',
        subtitle: 'Helium-4 Nucleus Ejection via Quantum Tunneling',
        nuclideCount: '436 Alpha-Emitting Nuclides',
        equationText: 'AZX ➔ A-4Z-2Y + ⁴₂He²⁺ + Q (Energy)',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '-2' },
            { label: 'Mass Change (ΔA)', val: '-4' },
            { label: 'Emitted Particle', val: '⁴₂He²⁺ (Alpha)' },
            { label: 'Penetration Power', val: 'Low (Stopped by paper)' }
        ],
        mechanism: 'In heavy nuclei (predominantly Z ≥ 83), two protons and two neutrons pre-form into an extremely tightly bound ⁴He cluster inside the nucleus. According to Gamow Theory, the alpha particle escapes by <strong>quantum mechanical tunneling</strong> through the Coulomb electrostatic barrier. Alpha particles are heavy, doubly charged (+2e), and possess very high Linear Energy Transfer (LET) and ionization density, but can be stopped by a sheet of paper or outer skin layer.',
        examples: [
            { parent: '²³⁸₉₂U (Uranium-238)', daughter: '²³⁴₉₀Th + ⁴₂He (4.27 MeV, t½ = 4.47×10⁹ y)', note: 'Geological timescale nuclear fuel' },
            { parent: '²⁴¹₉₅Am (Americium-241)', daughter: '²³⁷₉₃Np + ⁴₂He (5.49 MeV, t½ = 432.2 y)', note: 'Commercial ionization smoke detectors' },
            { parent: '²²⁶₈₈Ra (Radium-226)', daughter: '²²²₈₆Rn + ⁴₂He (4.87 MeV, t½ = 1,600 y)', note: 'Historically discovered by Marie Curie' }
        ]
    },
    'Beta-': {
        title: 'Beta-Minus Decay (β⁻ Emission)',
        badge: 'β⁻',
        badgeColor: '#38bdf8',
        subtitle: 'Neutron-to-Proton Transmutation via Weak Force',
        nuclideCount: '1,204 Beta-Minus Nuclides',
        equationText: 'AZX ➔ AZ+1Y + e⁻ + ν̅e + Q (n ➔ p + e⁻ + ν̅e)',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '+1' },
            { label: 'Mass Change (ΔA)', val: '0' },
            { label: 'Emitted Particles', val: 'e⁻ (Beta) + ν̅e (Antineutrino)' },
            { label: 'Penetration Power', val: 'Medium (Stopped by aluminum)' }
        ],
        mechanism: 'Beta-minus decay occurs in <strong>neutron-rich</strong> nuclides lying above the valley of stability. Mediated by the Weak Nuclear Force (W⁻ boson), a down quark within an excess neutron transforms into an up quark, converting the neutron into a proton: <code>n → p + e⁻ + ν̅e</code>. The emitted electron (beta particle) and electron antineutrino share the continuous decay energy spectrum. Beta radiation is deflected by magnetic fields and can be shielded by several millimeters of aluminum or plastic/acrylic.',
        examples: [
            { parent: '¹⁴₆C (Carbon-14)', daughter: '¹⁴₇N + e⁻ + ν̅e (156 keV, t½ = 5,730 y)', note: 'Archaeological dating of organic matter' },
            { parent: '¹³⁷₅₅Cs (Cesium-137)', daughter: '¹³⁷₅₆Ba + e⁻ + ν̅e (1.17 MeV, t½ = 30.17 y)', note: 'Major fission product & industrial tracer' },
            { parent: '³₁H (Tritium)', daughter: '³₂He + e⁻ + ν̅e (18.6 keV, t½ = 12.32 y)', note: 'Self-luminous emergency exit signs' }
        ]
    },
    'Beta+': {
        title: 'Beta-Plus & Electron Capture (β⁺ / EC)',
        badge: 'β⁺',
        badgeColor: '#c084fc',
        subtitle: 'Proton-to-Neutron Transmutation & Positron Annihilation',
        nuclideCount: '1,148 Beta-Plus / EC Nuclides',
        equationText: 'AZX ➔ AZ-1Y + e⁺ + νe  OR  AZX + e⁻(orbit) ➔ AZ-1Y + νe',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '-1' },
            { label: 'Mass Change (ΔA)', val: '0' },
            { label: 'Emitted Particles', val: 'e⁺ (Positron) / νe (Neutrino)' },
            { label: 'Annihilation', val: 'Produces 2 × 511 keV γ rays' }
        ],
        mechanism: 'Occurs in <strong>proton-rich</strong> nuclides lying below the valley of stability. In β⁺ emission, an up quark converts to a down quark via the weak force (W⁺ boson): <code>p → n + e⁺ + νe</code>. When the decay energy Q is less than 1.022 MeV (2 × 511 keV electron rest mass), <strong>Orbital Electron Capture (EC)</strong> dominates, where an inner K-shell electron is captured by the nucleus: <code>p + e⁻ → n + νe</code>. When emitted positrons encounter atomic electrons, they annihilate to produce two back-to-back 511 keV gamma photons, forming the foundation of PET medical scanning.',
        examples: [
            { parent: '¹⁸₉F (Fluorine-18)', daughter: '¹⁸₈O + e⁺ + νe (634 keV, t½ = 109.7 min)', note: 'FDG tracer in clinical PET oncology imaging' },
            { parent: '²²₁₁Na (Sodium-22)', daughter: '²²₁₀Ne + e⁺ + νe (t½ = 2.60 y)', note: 'Laboratory positron annihilation source' },
            { parent: '⁷₄Be (Beryllium-7)', daughter: '⁷₃Li + νe (Pure EC, t½ = 53.22 d)', note: 'Cosmogenic tracer in atmospheric physics' }
        ]
    },
    'SF': {
        title: 'Spontaneous Fission (SF)',
        badge: 'SF',
        badgeColor: '#f87171',
        subtitle: 'Spontaneous Nuclear Rupture into Intermediate Fragments',
        nuclideCount: '112 Fissile Nuclides',
        equationText: 'AZX ➔ A1Z1Y1 + A2Z2Y2 + 2-4 neutrons + ~200 MeV',
        metrics: [
            { label: 'Fragment Splitting', val: 'Binary asymmetric' },
            { label: 'Neutron Yield', val: '2 to 4 prompt neutrons' },
            { label: 'Energy Released', val: '~200 MeV / fission' },
            { label: 'Occurrence', val: 'Heavy Actinides (Z ≥ 90)' }
        ],
        mechanism: 'Spontaneous fission occurs exclusively in very heavy actinide and transactinide nuclei where the Coulomb repulsion between numerous protons overcomes the strong nuclear surface tension (fissility parameter Z²/A ≥ 35). Without requiring any external neutron collision, the distorted nucleus tunnels through the fission barrier, snapping into two intermediate-mass daughter nuclei (e.g. around mass 95 and 140) while ejecting multiple prompt neutrons and ~200 MeV of kinetic and gamma energy.',
        examples: [
            { parent: '²⁵²₉₈Cf (Californium-252)', daughter: 'Fission Fragments + 3.76 n (t½ = 2.645 y)', note: 'Powerful portable neutron start-up source' },
            { parent: '²⁴⁴₉₄Pu (Plutonium-244)', daughter: 'Fission Fragments + k n (t½ = 8.0×10⁷ y)', note: 'Extinct primordial solar system fissiogenic nuclide' },
            { parent: '²⁸⁶₁₁₂Cn (Copernicium-286)', daughter: 'Fragments (100% SF branch, t½ = 8.4 s)', note: 'Superheavy element decay mode' }
        ]
    },
    'Proton': {
        title: 'Proton Emission (p-Drip Line)',
        badge: 'p',
        badgeColor: '#fb923c',
        subtitle: 'Direct Proton Ejection Beyond the Proton Drip Line',
        nuclideCount: '78 Proton Emitter Nuclides',
        equationText: 'AZX ➔ A-1Z-1Y + ¹₁p (Proton) + Q',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '-1' },
            { label: 'Mass Change (ΔA)', val: '-1' },
            { label: 'Separation Energy', val: 'Sp < 0 (Unbound)' },
            { label: 'Occurrence', val: 'Extreme Proton Drip Line' }
        ],
        mechanism: 'Proton emission occurs in exotic, highly proton-rich nuclides lying beyond the <strong>Proton Drip Line</strong>, where the nuclear binding energy for the last proton becomes negative (Sp < 0). In this state, the strong force can no longer bind the outermost valence proton, and it escapes the nucleus by tunneling through the Coulomb barrier. It was first observed in nuclear isomer states and is studied at particle accelerator radioactive ion beam facilities.',
        examples: [
            { parent: '⁵³ᵐ₂₇Co (Cobalt-53m)', daughter: '⁵²₂₆Fe + p (1.59 MeV, t½ = 247 ms)', note: 'First discovered proton emitter (1970)' },
            { parent: '¹⁴⁵₆₉Tm (Thulium-145)', daughter: '¹⁴⁴₆₈Er + p (1.73 MeV, t½ = 3.1 µs)', note: 'Direct ground-state proton emitter' },
            { parent: '¹¹³₅₃I (Iodine-113)', daughter: '¹¹²₅₂Te + p (t½ = 0.6 µs)', note: 'Accelerator-produced drip-line nuclide' }
        ]
    },
    'Neutron': {
        title: 'Neutron Emission & Delayed Neutrons',
        badge: 'n',
        badgeColor: '#2dd4bf',
        subtitle: 'Direct & Beta-Delayed Neutron Release',
        nuclideCount: '110 Neutron Emitter Nuclides',
        equationText: 'AZX ➔ A-1ZX + ¹₀n (Neutron) + Q',
        metrics: [
            { label: 'Proton Change (ΔZ)', val: '0' },
            { label: 'Mass Change (ΔA)', val: '-1' },
            { label: 'Coulomb Barrier', val: '0 (Neutral particle)' },
            { label: 'Nuclear Power Role', val: 'Reactor Prompt-Criticality Control' }
        ],
        mechanism: 'Neutron emission occurs beyond the <strong>Neutron Drip Line</strong> (Sn < 0) or as <strong>Beta-Delayed Neutron Emission</strong> (β⁻n). Because neutrons are electrically neutral, there is zero Coulomb barrier to hold them back once the nuclear binding is exceeded, resulting in instantaneous emission (10⁻²² s). In nuclear fission reactors, delayed neutron precursors (like ⁸⁷Br) release neutrons after a small beta-decay delay time (0.1 s to 55 s), providing the essential time window needed for reactor control rods to maintain stable criticality.',
        examples: [
            { parent: '⁸⁷₃₅Br (Bromine-87)', daughter: '⁸⁷₃₆Kr* ➔ ⁸⁶₃₆Kr + n (t½ = 55.6 s)', note: 'Critical delayed-neutron precursor in nuclear reactors' },
            { parent: '⁵₂He (Helium-5)', daughter: '⁴₂He + n (t½ ≈ 7 × 10⁻²² s)', note: 'Extremely prompt unbound resonance' },
            { parent: '¹³⁷₅₃I (Iodine-137)', daughter: '¹³⁷₅₄Xe* ➔ ¹³⁶₅₄Xe + n (t½ = 24.5 s)', note: 'Key fission product delayed emitter' }
        ]
    }
};

/**
 * Open the decay process explanation modal
 */
function openDecayExplanationModal(decayKey) {
    const data = decayExplanationsData[decayKey];
    if (!data) return;

    const modal = document.getElementById('decay-explanation-modal');
    if (!modal) return;

    const header = document.getElementById('dem-header');
    const badge = document.getElementById('dem-badge');
    const title = document.getElementById('dem-title');
    const subtitle = document.getElementById('dem-subtitle');
    const body = document.getElementById('dem-body');
    const footCount = document.getElementById('dem-nuclide-count');

    if (badge) {
        badge.textContent = data.badge;
        badge.style.background = `${data.badgeColor}25`;
        badge.style.color = data.badgeColor;
        badge.style.border = `1.5px solid ${data.badgeColor}`;
        badge.style.boxShadow = `0 0 10px ${data.badgeColor}66`;
    }
    if (title) title.textContent = data.title;
    if (subtitle) subtitle.textContent = data.subtitle;
    if (footCount) footCount.textContent = data.nuclideCount;
    if (header) {
        header.style.borderBottom = `1px solid ${data.badgeColor}55`;
        header.style.background = `linear-gradient(90deg, ${data.badgeColor}15 0%, rgba(9, 14, 26, 0.95) 100%)`;
    }

    let examplesHtml = '';
    if (data.examples && data.examples.length > 0) {
        examplesHtml = `
            <div class="dem-section">
                <div class="dem-section-title">
                    <span>🔬</span> Real-World Examples & Decay Paths
                </div>
                ${data.examples.map(ex => `
                    <div class="dem-example-pill">
                        <div>
                            <strong style="color: #ffffff;">${ex.parent}</strong>
                            <span style="color: #00d4ff; margin: 0 4px;">➔</span>
                            <span style="color: ${data.badgeColor};">${ex.daughter}</span>
                        </div>
                        <span style="font-size: 0.52rem; color: #94a3b8; font-style: italic;">${ex.note}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    let metricsHtml = '';
    if (data.metrics && data.metrics.length > 0) {
        metricsHtml = `
            <div class="dem-metrics-row">
                ${data.metrics.map(m => `
                    <div class="dem-metric-card">
                        <span class="dem-metric-label">${m.label}</span>
                        <span class="dem-metric-val" style="color: ${data.badgeColor};">${m.val}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    body.innerHTML = `
        <div class="dem-section">
            <div class="dem-section-title">
                <span>⚡</span> Transformation Equation & Key Properties
            </div>
            <div class="dem-equation-box" style="border-color: ${data.badgeColor}66; color: ${data.badgeColor};">
                ${data.equationText}
            </div>
            ${metricsHtml}
        </div>

        <div class="dem-section">
            <div class="dem-section-title">
                <span>📖</span> Physical Mechanism & Nuclear Dynamics
            </div>
            <div style="font-size: 0.66rem; color: #cbd5e1; line-height: 1.45;">
                ${data.mechanism}
            </div>
        </div>

        ${examplesHtml}
    `;

    modal.classList.add('active');
    modal.style.display = 'flex';
}
window.openDecayExplanationModal = openDecayExplanationModal;

function closeDecayExplanationModal() {
    const modal = document.getElementById('decay-explanation-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}
window.closeDecayExplanationModal = closeDecayExplanationModal;

/**
 * Render the in-grid isotope legend & decay mode filter chips.
 */
function renderIsotopeLegend(targetElement) {
    const gridContainer = document.getElementById('iso-in-grid-legend');
    if (!gridContainer) return;

    const el = targetElement || (typeof selectedElement !== 'undefined' ? selectedElement : null) || (typeof elementsData !== 'undefined' ? elementsData[5] : null);
    const z = el ? el.atomicNumber : 6;
    const isos = (typeof isotopeData !== 'undefined' && isotopeData[z]) ? isotopeData[z] : [];
    const stableCount = isos.filter(i => isActuallyStable(i)).length;
    const totalCount = isos.length;
    const sym = el ? el.symbol : 'C';
    const name = el ? el.name : 'Carbon';

    const decayModes = [
        { key: 'Alpha', label: 'α Alpha', color: '#facc15', count: '436', sub: '⁴₂He (ΔZ=-2, ΔA=-4)', bg: 'linear-gradient(180deg, #a16207 0%, #854d0e 50%, #713f12 100%)', border: '#facc15' },
        { key: 'Beta-', label: 'β⁻ Beta-', color: '#38bdf8', count: '1204', sub: 'n → p + e⁻ (ΔZ=+1)', bg: 'linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)', border: '#38bdf8' },
        { key: 'Beta+', label: 'β⁺ / EC', color: '#c084fc', count: '1148', sub: 'p → n + e⁺ (ΔZ=-1)', bg: 'linear-gradient(180deg, #7e22ce 0%, #6b21a8 50%, #581c87 100%)', border: '#c084fc' },
        { key: 'SF', label: 'SF Fission', color: '#f87171', count: '112', sub: 'Spontaneous heavy split', bg: 'linear-gradient(180deg, #b91c1c 0%, #991b1b 50%, #7f1d1d 100%)', border: '#f87171' },
        { key: 'Proton', label: 'p Proton', color: '#fb923c', count: '78', sub: 'p emission (ΔZ=-1)', bg: 'linear-gradient(180deg, #c2410c 0%, #9a3412 50%, #7c2d12 100%)', border: '#fb923c' },
        { key: 'Neutron', label: 'n Neutron', color: '#2dd4bf', count: '110', sub: 'n emission (ΔA=-1)', bg: 'linear-gradient(180deg, #0f766e 0%, #115e59 50%, #134e4a 100%)', border: '#2dd4bf' }
    ];

    let html = `
        <div class="unified-isotope-panel">
            <div class="iso-legend-header-row">
                <span class="legend-box-title">
                    <span style="font-size: 0.70rem;">☢️</span> DECAY MODES & NUCLEAR STABILITY
                </span>
                <span class="iso-target-indicator">
                    TARGET: <strong>${name} (${sym}-${z})</strong> • ${totalCount} Isotopes (${stableCount} Stable)
                </span>
            </div>
            <div class="iso-legend-body">
                <!-- Left Side: Stability Cards (Stacked full height) -->
                <div class="iso-stability-column">
                    <div class="iso-stability-card stable-card" data-decay="Stable" style="background: linear-gradient(180deg, #15803d 0%, #166534 50%, #14532d 100%) !important; border: 1.5px solid #4ade80 !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.5), 0 0 10px rgba(74,222,128,0.3) !important;">
                        <div class="iso-stab-header">
                            <span class="iso-stab-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px #ffffff; flex-shrink: 0;"></span>
                            <span class="iso-stab-title" style="color: #ffffff; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">STABLE NUCLIDES</span>
                            <span class="iso-stab-badge" style="color: #ffffff; background: #14532d; border: 1px solid #4ade80; font-weight: 800; padding: 1px 5px; border-radius: 3px;">252</span>
                        </div>
                        <div class="iso-stab-desc" style="color: #dcfce7; font-weight: 600; text-shadow: 0 1px 1px rgba(0,0,0,0.7);">Ground-state non-decaying</div>
                    </div>
                    <div class="iso-stability-card radio-card" data-decay="Radioactive" style="background: linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%) !important; border: 1.5px solid #f87171 !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.5), 0 0 10px rgba(239,68,68,0.3) !important;">
                        <div class="iso-stab-header">
                            <span class="iso-stab-dot" style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px #ffffff; flex-shrink: 0;"></span>
                            <span class="iso-stab-title" style="color: #ffffff; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">RADIOISOTOPES</span>
                            <span class="iso-stab-badge" style="color: #ffffff; background: #7f1d1d; border: 1px solid #f87171; font-weight: 800; padding: 1px 5px; border-radius: 3px;">2,900+</span>
                        </div>
                        <div class="iso-stab-desc" style="color: #fee2e2; font-weight: 600; text-shadow: 0 1px 1px rgba(0,0,0,0.7);">Spontaneous nuclear decay</div>
                    </div>
                </div>

                <!-- Center Divider -->
                <div class="iso-legend-divider"></div>

                <!-- Right Side: 6 Decay Modes Grid -->
                <div class="iso-decay-grid">
    `;

    decayModes.forEach(mode => {
        html += `
            <div class="iso-mode-card" data-decay="${mode.key}" style="--mode-color: ${mode.color}; background: ${mode.bg} !important; border: 1.5px solid ${mode.border} !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 5px rgba(0,0,0,0.5), 0 0 8px ${mode.color}44 !important;">
                <div class="iso-mode-top">
                    <span class="iso-mode-pill" style="background: rgba(0, 0, 0, 0.45); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.45); font-weight: 800; padding: 1px 5px; border-radius: 3px;">${mode.label}</span>
                    <span class="iso-mode-count" style="background: rgba(0, 0, 0, 0.55); color: #ffffff; font-weight: 800; border: 1px solid rgba(255, 255, 255, 0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.9); padding: 0 4px; border-radius: 3px;">${mode.count}</span>
                </div>
                <span class="iso-mode-sub" style="color: #ffffff; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.9); opacity: 0.95;">${mode.sub}</span>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>
    `;

    gridContainer.innerHTML = html;

    // Attach tap & long-press handlers: Tap opens standard decay modal; Long-press opens concept inspector with SVG diagrams!
    gridContainer.querySelectorAll('.iso-stability-card, .iso-mode-card').forEach(card => {
        if (typeof window.bindLongPress === 'function') {
            window.bindLongPress(
                card,
                (el) => {
                    const decayKey = el.dataset.decay;
                    if (window.openLegendConceptModal) window.openLegendConceptModal(decayKey, 'decay');
                },
                (el) => {
                    const decayKey = el.dataset.decay;
                    openDecayExplanationModal(decayKey);
                }
            );
        } else {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const decayKey = card.dataset.decay;
                openDecayExplanationModal(decayKey);
            });
        }
    });
}
window.renderIsotopeLegend = renderIsotopeLegend;

function applyIsotopeGridHighlighting() {
    const decayKey = window.activeDecayHighlight;
    const grid = document.getElementById('isotopes-grid');
    if (!grid) return;

    const cells = grid.querySelectorAll('.element-cell[data-z]');
    if (!decayKey) {
        cells.forEach(cell => {
            cell.style.opacity = '1';
            cell.style.filter = '';
        });
        return;
    }

    cells.forEach(cell => {
        const z = parseInt(cell.dataset.z, 10);
        const isos = (typeof isotopeData !== 'undefined' && isotopeData[z]) ? isotopeData[z] : [];
        let matches = false;

        if (decayKey === 'Stable') {
            matches = isos.some(i => isActuallyStable(i));
        } else if (decayKey === 'Radioactive') {
            matches = isos.some(i => !isActuallyStable(i));
        } else if (decayKey === 'Alpha') {
            matches = isos.some(i => (/\bA\b/.test(i.decayMode || '') || (i.decayMode || '').includes('Alpha')));
        } else if (decayKey === 'Beta-') {
            matches = isos.some(i => (i.decayMode || '').includes('B-'));
        } else if (decayKey === 'Beta+') {
            matches = isos.some(i => ((i.decayMode || '').includes('B+') || (i.decayMode || '').includes('EC')));
        } else if (decayKey === 'SF') {
            matches = isos.some(i => (i.decayMode || '').includes('SF'));
        } else if (decayKey === 'Proton') {
            matches = isos.some(i => /\bp\b/.test(i.decayMode || ''));
        } else if (decayKey === 'Neutron') {
            matches = isos.some(i => /\bn\b/.test(i.decayMode || ''));
        }

        if (matches) {
            cell.style.opacity = '1';
            cell.style.filter = 'brightness(1.2) drop-shadow(0 0 6px rgba(0, 212, 255, 0.4))';
        } else {
            cell.style.opacity = '0.18';
            cell.style.filter = 'grayscale(80%)';
        }
    });
}
window.applyIsotopeGridHighlighting = applyIsotopeGridHighlighting;

/**
 * Updates the dedicated Isotope Detail Sidebar in #view-isotopes
 */
function updateIsotopeSidebar(atomicNumber, force = false) {
    if (!atomicNumber || atomicNumber < 1 || atomicNumber > 118) return;
    
    const listContainer = document.getElementById('iso-sidebar-list');
    const curT = (typeof currentTemp !== 'undefined') ? Math.round(currentTemp) : 298;
    const cacheKey = `${atomicNumber}_${window._currentIsoSort || 'neutrons'}_${window._currentIsoOrder || 'asc'}_${curT}`;

    if (!force && currentAtomicNumber === atomicNumber && window._isoSidebarCacheKey === cacheKey && listContainer && listContainer.children.length > 0) {
        // Fast-path: isotope sidebar is already rendered and up-to-date!
        return;
    }
    currentAtomicNumber = atomicNumber;
    window._isoSidebarCacheKey = cacheKey;

    const elData = (typeof elementsData !== 'undefined' && elementsData[atomicNumber - 1]) ? elementsData[atomicNumber - 1] : null;
    if (!elData) return;

    // Show details, hide empty state
    const emptyState = document.getElementById('iso-empty-state');
    const elementCard = document.getElementById('iso-element-card');
    const details = document.getElementById('iso-details');
    if (emptyState) emptyState.classList.add('hidden');
    if (elementCard) elementCard.classList.remove('hidden');
    if (details) details.classList.remove('hidden');

    if (typeof positionMobileSidebar === 'function') {
        positionMobileSidebar(null, elData);
    }

    // Header Card
    const numEl = document.getElementById('iso-number');
    const massEl = document.getElementById('iso-mass');
    const symEl = document.getElementById('iso-symbol');
    const nameEl = document.getElementById('iso-name');
    const badgeEl = document.getElementById('iso-series-badge');
    const dotEl = document.getElementById('iso-state-dot');
    const stateTextEl = document.getElementById('iso-state-text');
    const countSummaryEl = document.getElementById('iso-count-summary');
    const tagsEl = document.getElementById('iso-tags-text');

    if (numEl) numEl.innerText = elData.atomicNumber;
    if (massEl) massEl.innerText = elData.atomicMass ? elData.atomicMass.toFixed(3) : '-';
    if (symEl) symEl.innerText = elData.symbol;
    if (nameEl) nameEl.innerText = elData.name;

    const catName = getNormalizedCategory(elData.category, elData.atomicNumber);
    const catColor = (typeof categoryColors !== 'undefined') ? (categoryColors[catName] || '#00d4ff') : '#00d4ff';
    const catText = (elData.category || catName).toUpperCase();

    if (badgeEl) {
        badgeEl.innerHTML = `<span class="ed-series-dot" style="width: 5px; height: 5px; border-radius: 50%; background: ${catColor}; box-shadow: 0 0 5px ${catColor}; display: inline-block; flex-shrink: 0;"></span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${catText}</span>`;
        badgeEl.style.setProperty('color', '#ffffff', 'important');
        badgeEl.style.setProperty('border-color', catColor, 'important');
        const bgGrad = `linear-gradient(135deg, ${window.hexToRgba ? window.hexToRgba(catColor, 0.42) : catColor + '55'} 0%, ${window.hexToRgba ? window.hexToRgba(catColor, 0.18) : catColor + '22'} 100%)`;
        badgeEl.style.setProperty('background', bgGrad, 'important');
        const glow = window.hexToRgba ? window.hexToRgba(catColor, 0.50) : catColor + '66';
        badgeEl.style.setProperty('box-shadow', `0 0 8px ${glow}`, 'important');
    }

    // State at current temperature
    let currentState = 'Unknown';
    if (elData.meltingPoint !== null && elData.meltingPoint !== undefined && elData.boilingPoint !== null && elData.boilingPoint !== undefined) {
        const curT = (typeof currentTemp !== 'undefined') ? currentTemp : 298;
        if (curT < elData.meltingPoint) currentState = 'Solid';
        else if (curT >= elData.meltingPoint && curT < elData.boilingPoint) currentState = 'Liquid';
        else currentState = 'Gas';
    }

    const stateColors = {
        'Solid': '#ffffff',   // Crisp Pure White for solid state
        'Liquid': '#00f0ff',  // Electric Neon Cyan for liquid
        'Gas': '#fbbf24',     // Radiant Amber Gold for gas
        'Unknown': '#94a3b8'  // Muted Slate Silver for unknown
    };
    const sColor = stateColors[currentState] || '#ffffff';
    const stateGlow = (currentState === 'Solid') ? '0 0 7px rgba(255, 255, 255, 0.9)' :
                      (currentState === 'Liquid') ? '0 0 7px #00f0ff' :
                      (currentState === 'Gas') ? '0 0 7px #fbbf24' : '0 0 4px #94a3b8';
    const statePillBorder = (currentState === 'Solid') ? 'rgba(255, 255, 255, 0.45)' :
                            (currentState === 'Liquid') ? 'rgba(0, 240, 255, 0.55)' :
                            (currentState === 'Gas') ? 'rgba(251, 191, 36, 0.55)' : 'rgba(148, 163, 184, 0.35)';
    const statePillBg = (currentState === 'Solid') ? 'rgba(255, 255, 255, 0.12)' :
                        (currentState === 'Liquid') ? 'rgba(0, 240, 255, 0.14)' :
                        (currentState === 'Gas') ? 'rgba(251, 191, 36, 0.14)' : 'rgba(148, 163, 184, 0.10)';

    const isoPill = document.getElementById('iso-state-pill');
    if (dotEl) {
        dotEl.style.setProperty('background', sColor, 'important');
        dotEl.style.setProperty('box-shadow', stateGlow, 'important');
    }
    if (stateTextEl) {
        const curT = (typeof currentTemp !== 'undefined') ? Math.round(currentTemp) : 298;
        stateTextEl.innerText = `${currentState} (${curT} K)`;
        stateTextEl.style.setProperty('color', sColor, 'important');
        stateTextEl.style.setProperty('text-shadow', `0 0 6px ${statePillBorder}`, 'important');
    }
    if (isoPill) {
        isoPill.style.setProperty('border-color', statePillBorder, 'important');
        isoPill.style.setProperty('background', statePillBg, 'important');
    }

    // Global filter/sort state for isotopes
    if (typeof window._currentIsoSort === 'undefined') window._currentIsoSort = 'neutrons';
    if (typeof window._currentIsoOrder === 'undefined') window._currentIsoOrder = 'asc';
    window._currentSelectedIsotope = null;
    if (typeof closeIsotopeDetailPanel === 'function') closeIsotopeDetailPanel();

    // Decay Categories Definition
    const DECAY_CATEGORIES = {
        'stable': { label: 'Stable Nuclides', short: 'Stable', color: '#4ade80', order: 1 },
        'beta-minus': { label: 'Beta-Minus Decay (β⁻)', short: 'β⁻', color: '#38bdf8', order: 2 },
        'beta-plus': { label: 'Beta-Plus / EC (β⁺/EC)', short: 'β⁺/EC', color: '#c084fc', order: 3 },
        'alpha': { label: 'Alpha Decay (α)', short: 'α', color: '#facc15', order: 4 },
        'nucleon': { label: 'Proton / Neutron Emission', short: 'p/n', color: '#fb923c', order: 5 },
        'fission': { label: 'Spontaneous Fission (SF)', short: 'SF', color: '#f87171', order: 6 },
        'other': { label: 'Other Decay Modes', short: 'Other', color: '#94a3b8', order: 7 }
    };

    function getDecayCategoryKey(iso) {
        if (isActuallyStable(iso)) return 'stable';
        const mode = iso.decayMode || '';
        if (mode.includes('B-') || mode.includes('2B-')) return 'beta-minus';
        if (mode.includes('B+') || mode.includes('EC') || mode.includes('2EC')) return 'beta-plus';
        if (/\bA\b/.test(mode) || mode.includes('Alpha')) return 'alpha';
        if (/\bp\b/.test(mode) || /\bn\b/.test(mode)) return 'nucleon';
        if (mode.includes('SF')) return 'fission';
        return 'other';
    }

    const rawIsos = (typeof isotopeData !== 'undefined' && isotopeData[atomicNumber]) ? isotopeData[atomicNumber] : [];
    const stableCount = rawIsos.filter(i => isActuallyStable(i)).length;
    const radioCount = rawIsos.length - stableCount;
    const totalCount = rawIsos.length;

    const stableCountEl = document.getElementById('iso-stat-stable-count');
    const radioCountEl = document.getElementById('iso-stat-radio-count');
    const totalCountEl = document.getElementById('iso-stat-total-count');
    const listCountEl = document.getElementById('iso-sidebar-list-count');

    if (stableCountEl) stableCountEl.innerText = stableCount;
    if (radioCountEl) radioCountEl.innerText = radioCount;
    if (totalCountEl) totalCountEl.innerText = totalCount;
    if (listCountEl) listCountEl.innerText = `${totalCount} isotopes`;

    if (countSummaryEl) {
        countSummaryEl.innerText = `${totalCount} Isotopes (${stableCount} Stable)`;
    }
    if (tagsEl) {
        tagsEl.innerText = `Z=${elData.atomicNumber} • Grp ${elData.group || '-'} • Per ${elData.period || '-'}`;
    }

    // Function to render the sorted and filtered isotope list
    function renderSidebarIsotopesList() {
        const listContainer = document.getElementById('iso-sidebar-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (rawIsos.length === 0) {
            listContainer.innerHTML = '<div style="color: #94a3b8; font-size: 0.75rem; text-align: center; padding: 12px 0;">No isotope data available.</div>';
            return;
        }

        const sortedIsos = [...rawIsos];
        if (window._currentIsoSort === 'category') {
            sortedIsos.sort((a, b) => {
                const catA = DECAY_CATEGORIES[getDecayCategoryKey(a)]?.order || 99;
                const catB = DECAY_CATEGORIES[getDecayCategoryKey(b)]?.order || 99;
                if (catA !== catB) {
                    return window._currentIsoOrder === 'asc' ? (catA - catB) : (catB - catA);
                }
                return a.massNumber - b.massNumber;
            });
        } else {
            // Sort by neutrons N = A - Z
            sortedIsos.sort((a, b) => {
                const nA = a.massNumber - elData.atomicNumber;
                const nB = b.massNumber - elData.atomicNumber;
                return window._currentIsoOrder === 'asc' ? (nA - nB) : (nB - nA);
            });
        }

        // Calculate present categories & counts for direct-jump
        const presentCategories = [];
        const catCounts = {};
        rawIsos.forEach(iso => {
            const catKey = getDecayCategoryKey(iso);
            if (!catCounts[catKey]) {
                catCounts[catKey] = 0;
                presentCategories.push(catKey);
            }
            catCounts[catKey]++;
        });
        presentCategories.sort((a, b) => (DECAY_CATEGORIES[a]?.order || 99) - (DECAY_CATEGORIES[b]?.order || 99));

        // Render Jump Bar Chips
        const jumpBar = document.getElementById('iso-category-jump-bar');
        if (jumpBar) {
            jumpBar.innerHTML = '';
            const jumpFrag = document.createDocumentFragment();
            presentCategories.forEach(catKey => {
                const catInfo = DECAY_CATEGORIES[catKey];
                if (!catInfo) return;
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'iso-jump-chip';
                chip.style.background = `linear-gradient(135deg, ${catInfo.color}33 0%, ${catInfo.color}15 100%)`;
                chip.style.borderColor = `${catInfo.color}66`;
                chip.style.color = '#ffffff';
                chip.style.boxShadow = `0 0 6px ${catInfo.color}33`;
                chip.innerHTML = `<span style="width: 6px; height: 6px; border-radius: 50%; background: ${catInfo.color}; box-shadow: 0 0 5px ${catInfo.color};"></span><span>${catInfo.short} (${catCounts[catKey]})</span>`;
                chip.addEventListener('click', () => {
                    // Switch to category sort if not already active so headers exist
                    if (window._currentIsoSort !== 'category') {
                        window._currentIsoSort = 'category';
                        const sortCatBtn = document.getElementById('iso-sort-category');
                        const sortNeuBtn = document.getElementById('iso-sort-neutrons');
                        if (sortCatBtn) sortCatBtn.classList.add('active');
                        if (sortNeuBtn) sortNeuBtn.classList.remove('active');
                        renderSidebarIsotopesList();
                    }
                    setTimeout(() => {
                        const targetEl = document.getElementById(`iso-cat-hdr-${catKey}`);
                        const listWrap = document.getElementById('iso-sidebar-list');
                        if (targetEl && listWrap) {
                            listWrap.scrollTo({ top: targetEl.offsetTop - listWrap.offsetTop, behavior: 'smooth' });
                        }
                    }, 50);
                });
                jumpFrag.appendChild(chip);
            });
            jumpBar.appendChild(jumpFrag);
        }

        // Render list items with DocumentFragment (Single DOM repaint)
        let lastCategory = null;
        const listFragment = document.createDocumentFragment();
        sortedIsos.forEach((iso) => {
            const isStable = isActuallyStable(iso);
            const catKey = getDecayCategoryKey(iso);
            const catInfo = DECAY_CATEGORIES[catKey] || DECAY_CATEGORIES['other'];

            if (window._currentIsoSort === 'category' && catKey !== lastCategory) {
                lastCategory = catKey;
                const catHdr = document.createElement('div');
                catHdr.className = 'iso-category-header';
                catHdr.id = `iso-cat-hdr-${catKey}`;
                catHdr.style.background = `linear-gradient(90deg, ${catInfo.color}28 0%, rgba(0, 0, 0, 0.6) 100%)`;
                catHdr.style.borderColor = catInfo.color;
                catHdr.style.color = '#ffffff';
                catHdr.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 6px;"><span style="width: 6px; height: 6px; border-radius: 50%; background: ${catInfo.color}; box-shadow: 0 0 6px ${catInfo.color};"></span><span>${catInfo.label}</span></span><span style="font-family: var(--font-mono); opacity: 0.9; font-size: 0.62rem; color: ${catInfo.color};">${catCounts[catKey]} nuclides</span>`;
                listFragment.appendChild(catHdr);
            }

            const dColor = isStable ? '#4ade80' : getDecayColor(iso.decayMode);
            const dTag = getDecayCompactTag(iso.decayMode, isStable);
            const hlStr = formatCompactHalfLife(iso);
            let abundStr = '';
            if (iso.abundance !== null && iso.abundance !== undefined) {
                let aVal = iso.abundance;
                if (aVal > 100) aVal = aVal / 100;
                abundStr = `${aVal.toFixed(2)}%`;
            }

            const item = document.createElement('div');
            const isSelected = (window._currentSelectedIsotope && window._currentSelectedIsotope.massNumber === iso.massNumber);
            item.className = `iso-sidebar-item ${isStable ? 'stable' : 'unstable'} ${isSelected ? 'selected' : ''}`;
            item.style.setProperty('border-left', `3.5px solid ${dColor}`, 'important');
            if (isSelected) {
                item.style.setProperty('border-color', dColor, 'important');
                item.style.setProperty('background', `${dColor}24`, 'important');
                item.style.setProperty('box-shadow', `0 0 10px ${dColor}55`, 'important');
            }
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-mono); font-weight: 800; font-size: 0.85rem; color: #ffffff;">
                        <sup>${iso.massNumber}</sup>${elData.symbol}
                    </span>
                    <span style="font-size: 0.70rem; color: #94a3b8;">${elData.name}-${iso.massNumber}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${abundStr ? `<span style="font-size: 0.65rem; font-family: var(--font-mono); color: #00d4ff; background: rgba(0,212,255,0.12); padding: 1px 4px; border-radius: 3px;">${abundStr}</span>` : ''}
                    <span style="font-size: 0.65rem; font-family: var(--font-mono); color: #cbd5e1;">${hlStr}</span>
                    <span style="font-size: 0.62rem; font-weight: 700; color: ${dColor}; background: ${dColor}22; border: 1px solid ${dColor}55; padding: 1px 5px; border-radius: 4px;">
                        ${dTag}
                    </span>
                </div>
            `;
            item.addEventListener('click', () => {
                window._currentSelectedIsotope = iso;
                listContainer.querySelectorAll('.iso-sidebar-item').forEach(i => {
                    i.classList.remove('selected');
                    i.style.removeProperty('box-shadow');
                    i.style.setProperty('border-color', 'rgba(255, 255, 255, 0.12)', 'important');
                    i.style.setProperty('background', 'rgba(15, 23, 42, 0.75)', 'important');
                });
                item.classList.add('selected');
                item.style.setProperty('border-color', dColor, 'important');
                item.style.setProperty('background', `${dColor}24`, 'important');
                item.style.setProperty('box-shadow', `0 0 10px ${dColor}55`, 'important');
                openIsotopeDetailPanel(iso, elData);
            });
            listFragment.appendChild(item);
        });
        listContainer.appendChild(listFragment);
    }

    // Attach Sort Controls Listeners once
    const sortNeutronsBtn = document.getElementById('iso-sort-neutrons');
    const sortCategoryBtn = document.getElementById('iso-sort-category');
    const orderToggleBtn = document.getElementById('iso-order-toggle');
    const orderText = document.getElementById('iso-order-text');

    if (sortNeutronsBtn) {
        sortNeutronsBtn.onclick = () => {
            window._currentIsoSort = 'neutrons';
            sortNeutronsBtn.classList.add('active');
            if (sortCategoryBtn) sortCategoryBtn.classList.remove('active');
            renderSidebarIsotopesList();
        };
    }
    if (sortCategoryBtn) {
        sortCategoryBtn.onclick = () => {
            window._currentIsoSort = 'category';
            sortCategoryBtn.classList.add('active');
            if (sortNeutronsBtn) sortNeutronsBtn.classList.remove('active');
            renderSidebarIsotopesList();
        };
    }
    if (orderToggleBtn) {
        orderToggleBtn.onclick = () => {
            window._currentIsoOrder = window._currentIsoOrder === 'asc' ? 'desc' : 'asc';
            if (orderText) {
                orderText.innerText = window._currentIsoOrder === 'asc' ? '▲ Asc' : '▼ Desc';
            }
            renderSidebarIsotopesList();
        };
    }

    // Initial render of isotope list
    renderSidebarIsotopesList();
}
window.updateIsotopeSidebar = updateIsotopeSidebar;

/**
 * Opens and populates the secondary opposite-side isotope detail panel
 */
function openIsotopeDetailPanel(iso, elData) {
    if (!iso || !elData) return;
    const sidebar = document.getElementById('iso-primary-sidebar') || document.querySelector('#view-isotopes .view-right.sidebar');
    const extPane = document.getElementById('iso-pane-extended');
    if (!sidebar || !extPane) return;

    // 1. Extend the primary sidebar into two-pane layout
    sidebar.classList.add('is-extended');
    extPane.classList.remove('hidden');
    extPane.scrollTop = 0;
    sidebar.scrollTop = 0;

    // 2. Color code the Selected Isotope Hero Card (#iso-sub-card)
    const A = iso.massNumber;
    const Z = elData.atomicNumber;
    const N = A - Z;
    const isStable = isActuallyStable(iso);
    const dColor = isStable ? '#4ade80' : getDecayColor(iso.decayMode);
    const dTag = isStable ? 'STABLE NUCLIDE' : `DECAY: ${getDecayCompactTag(iso.decayMode, false)}`;

    const subCard = document.getElementById('iso-sub-card');
    if (subCard) {
        const glossBg = (typeof getGlossyBackground === 'function')
            ? getGlossyBackground(dColor, isStable ? 'stable' : 'radioactive')
            : `linear-gradient(135deg, ${dColor}33 0%, rgba(9, 14, 26, 0.95) 100%)`;
        subCard.style.setProperty('background', glossBg, 'important');
        subCard.style.setProperty('border-color', dColor, 'important');
        subCard.style.setProperty('box-shadow', `0 6px 20px rgba(0, 0, 0, 0.8), 0 0 14px ${dColor}55`, 'important');

        const numBadge = subCard.querySelector('.ed-number-badge');
        if (numBadge) {
            numBadge.style.setProperty('border-color', dColor, 'important');
            numBadge.style.setProperty('background', `${dColor}22`, 'important');
            numBadge.style.setProperty('color', '#ffffff', 'important');
        }
    }

    const subNumber = document.getElementById('iso-sub-number');
    const subBadge = document.getElementById('iso-sub-badge');
    const subMass = document.getElementById('iso-sub-mass');
    const subSymbol = document.getElementById('iso-sub-symbol');
    const subName = document.getElementById('iso-sub-name');
    const subDot = document.getElementById('iso-sub-state-dot');
    const subStateText = document.getElementById('iso-sub-state-text');
    const subPill = document.getElementById('iso-sub-state-pill');
    const subAbund = document.getElementById('iso-sub-abundance-text');
    const subNeutrons = document.getElementById('iso-sub-neutrons-text');

    if (subNumber) subNumber.innerText = A;
    if (subMass) subMass.innerText = iso.mass ? iso.mass.toFixed(6) : `${A}.000000`;
    if (subSymbol) {
        subSymbol.innerHTML = `<sup>${A}</sup>${elData.symbol}`;
        subSymbol.style.setProperty('color', '#ffffff', 'important');
        subSymbol.style.setProperty('text-shadow', `0 0 10px ${dColor}88`, 'important');
    }
    if (subName) subName.innerText = `${elData.name}-${A}`;

    if (subBadge) {
        subBadge.innerHTML = `<span class="ed-series-dot" style="width: 5px; height: 5px; border-radius: 50%; background: ${dColor}; box-shadow: 0 0 6px ${dColor}; display: inline-block; flex-shrink: 0;"></span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${dTag}</span>`;
        subBadge.style.setProperty('color', '#ffffff', 'important');
        subBadge.style.setProperty('border-color', dColor, 'important');
        subBadge.style.setProperty('background', `linear-gradient(135deg, ${dColor}55 0%, ${dColor}22 100%)`, 'important');
        subBadge.style.setProperty('box-shadow', `0 0 10px ${dColor}66`, 'important');
    }

    if (subDot) {
        subDot.style.setProperty('background', dColor, 'important');
        subDot.style.setProperty('box-shadow', `0 0 7px ${dColor}`, 'important');
    }
    if (subStateText) {
        subStateText.innerText = isStable ? 'Stable Nuclide' : `T½: ${formatCompactHalfLife(iso)}`;
        subStateText.style.setProperty('color', dColor, 'important');
        subStateText.style.setProperty('text-shadow', `0 0 6px ${dColor}88`, 'important');
    }
    if (subPill) {
        subPill.style.setProperty('border-color', `${dColor}66`, 'important');
        subPill.style.setProperty('background', `${dColor}18`, 'important');
    }
    if (subAbund) {
        if (iso.abundance !== null && iso.abundance !== undefined) {
            let aVal = iso.abundance;
            if (aVal > 100) aVal = aVal / 100;
            subAbund.innerText = `${aVal.toFixed(2)}% Natural Abundance`;
            subAbund.style.color = '#4ade80';
        } else {
            subAbund.innerText = isStable ? 'Observationally Stable' : 'Synthetic / Trace Isotope';
            subAbund.style.color = '#94a3b8';
        }
    }
    if (subNeutrons) {
        subNeutrons.innerText = `N = ${N} • Z = ${Z} • A = ${A}`;
    }

    // Populate Tab 1: Decay Diagram
    renderSubDecayDiagram(iso, elData);

    // Populate Tab 2: Info List
    renderSubInfoList(iso, elData);

    // Populate Tab 3: Simulator
    initSubHalfLifeSimulator(iso, elData);

    // Setup Sub Tab Navigation Listeners
    setupSubTabNavigation();
}
window.openIsotopeDetailPanel = openIsotopeDetailPanel;

function closeIsotopeDetailPanel() {
    const extPane = document.getElementById('iso-pane-extended');
    if (extPane) {
        extPane.classList.add('hidden');
    }
    const sidebar = document.getElementById('iso-primary-sidebar') || document.querySelector('#view-isotopes .view-right.sidebar');
    if (sidebar) {
        sidebar.classList.remove('is-extended');
    }
    const listContainer = document.getElementById('iso-sidebar-list');
    if (listContainer) {
        listContainer.querySelectorAll('.iso-sidebar-item').forEach(i => {
            i.classList.remove('selected');
            i.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            i.style.background = 'rgba(15, 23, 42, 0.75)';
            i.style.boxShadow = 'none';
        });
    }
    window._currentSelectedIsotope = null;
}
window.closeIsotopeDetailPanel = closeIsotopeDetailPanel;

function setupSubTabNavigation() {
    const tabs = ['decay', 'info', 'sim'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`subtab-btn-${tab}`);
        if (btn) {
            btn.onclick = () => {
                tabs.forEach(t => {
                    const b = document.getElementById(`subtab-btn-${t}`);
                    const c = document.getElementById(`iso-subtab-${t}`);
                    if (b) b.classList.toggle('active', t === tab);
                    if (c) {
                        c.classList.toggle('active', t === tab);
                        c.classList.toggle('hidden', t !== tab);
                    }
                });
            };
        }
    });
}

function renderSubDecayDiagram(iso, elData) {
    const container = document.getElementById('iso-sub-decay-diagram');
    if (!container) return;

    const A = iso.massNumber;
    const Z = elData.atomicNumber;
    const N = A - Z;
    const isStable = isActuallyStable(iso);

    if (isStable) {
        const ratioNZ = (N / Math.max(1, Z)).toFixed(2);
        const bindingStr = iso.bindingEnergy ? `${(iso.bindingEnergy / A).toFixed(2)} MeV/A` : 'High';
        container.innerHTML = `
            <div class="iso-sub-decay-stage">
                <div class="iso-sub-decay-equation" style="color: #4ade80; border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.1);">
                    VALLEY OF NUCLEAR STABILITY &bull; STABLE
                </div>
                <div class="iso-sub-flow-row">
                    <div class="iso-sub-nuclide-box" style="border-color: #4ade80;">
                        <span class="iso-sub-nuclide-sym"><sup>${A}</sup>${elData.symbol}</span>
                        <span class="iso-sub-nuclide-meta">Z=${Z} &bull; N=${N}</span>
                    </div>
                    <div class="iso-sub-decay-arrow">
                        <span style="font-size: 1.3rem; color: #4ade80;">🛡️</span>
                        <span class="iso-sub-arrow-particle" style="background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3);">
                            Zero Decay
                        </span>
                    </div>
                    <div class="iso-sub-nuclide-box" style="border-color: rgba(74, 222, 128, 0.5); opacity: 0.85;">
                        <span style="font-size: 0.72rem; color: #cbd5e1; font-weight: 600;">N/Z Ratio</span>
                        <span style="font-size: 1rem; font-family: var(--font-mono); font-weight: 800; color: #4ade80;">${ratioNZ}</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #94a3b8; font-family: var(--font-mono); padding: 4px 6px; background: rgba(0,0,0,0.3); border-radius: 6px;">
                    <span>Binding Energy: <strong style="color: #facc15;">${bindingStr}</strong></span>
                    <span>Half-life: <strong style="color: #4ade80;">∞ (Stable)</strong></span>
                </div>
            </div>
        `;
        return;
    }

    // Radioactive decay calculation
    const mode = iso.decayMode || '';
    let dZ = Z;
    let dA = A;
    let particleStr = '+ Radiation';
    let particleLabel = 'Beta-';

    if (/\bA\b/.test(mode) || mode.includes('Alpha')) {
        dZ = Z - 2;
        dA = A - 4;
        particleStr = '+ ⁴₂α';
        particleLabel = 'Alpha (α)';
    } else if (mode.includes('B-') || mode.includes('2B-')) {
        dZ = Z + 1;
        dA = A;
        particleStr = '+ e⁻ + ν̄ₑ';
        particleLabel = 'Beta- (β⁻)';
    } else if (mode.includes('B+') || mode.includes('EC')) {
        dZ = Z - 1;
        dA = A;
        particleStr = '+ e⁺ + νₑ';
        particleLabel = 'Beta+ / EC';
    } else if (/\bp\b/.test(mode)) {
        dZ = Z - 1;
        dA = A - 1;
        particleStr = '+ p⁺';
        particleLabel = 'Proton (p)';
    } else if (/\bn\b/.test(mode)) {
        dZ = Z;
        dA = A - 1;
        particleStr = '+ n⁰';
        particleLabel = 'Neutron (n)';
    } else if (mode.includes('SF')) {
        dZ = Math.max(1, Math.floor(Z / 2));
        dA = Math.max(1, Math.floor((A - 2) / 2));
        particleStr = '+ Fission Fragments';
        particleLabel = 'Fission (SF)';
    }

    const dEl = (typeof elementsData !== 'undefined' && elementsData[dZ - 1]) ? elementsData[dZ - 1] : { symbol: '?', name: 'Daughter' };
    const dN = dA - dZ;
    const dColor = getDecayColor(mode);
    const qVal = iso.decayEnergy ? `${iso.decayEnergy.toFixed(2)} keV` : (iso.massExcess ? `${Math.abs(iso.massExcess).toFixed(2)} MeV` : 'Calculated');

    container.innerHTML = `
        <div class="iso-sub-decay-stage">
            <div class="iso-sub-decay-equation">
                <sup>${A}</sup>${elData.symbol} &rarr; <sup>${dA}</sup>${dEl.symbol} ${particleStr}
            </div>
            <div class="iso-sub-flow-row">
                <div class="iso-sub-nuclide-box" style="border-color: #00d4ff;">
                    <span class="iso-sub-nuclide-sym"><sup>${A}</sup>${elData.symbol}</span>
                    <span class="iso-sub-nuclide-meta">Z=${Z} &bull; N=${N}</span>
                </div>
                <div class="iso-sub-decay-arrow">
                    <span style="font-size: 1.1rem; color: ${dColor}; font-weight: bold;">&xrarr;</span>
                    <span class="iso-sub-arrow-particle" style="background: ${dColor}22; color: ${dColor}; border: 1px solid ${dColor}55;">
                        ${particleLabel}
                    </span>
                </div>
                <div class="iso-sub-nuclide-box" style="border-color: #a855f7;">
                    <span class="iso-sub-nuclide-sym"><sup>${dA}</sup>${dEl.symbol}</span>
                    <span class="iso-sub-nuclide-meta">Z=${dZ} &bull; N=${dN}</span>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; font-family: var(--font-mono); padding: 4px 6px; background: rgba(0,0,0,0.35); border-radius: 6px;">
                <span>Q-Energy: <strong style="color: #38bdf8;">${qVal}</strong></span>
                <span>T½: <strong style="color: #facc15;">${formatCompactHalfLife(iso)}</strong></span>
            </div>
        </div>
    `;
}

function renderSubInfoList(iso, elData) {
    const A = iso.massNumber;
    const Z = elData.atomicNumber;
    const N = A - Z;

    const setVal = (id, val, color) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = val !== null && val !== undefined && val !== '' ? val : '-';
            if (color) el.style.color = color;
            else el.style.color = '';
        }
    };

    setVal('sub-val-mass', iso.mass ? `${iso.mass.toFixed(6)} u` : `${A}.000000 u`, '#ffffff');
    setVal('sub-val-excess', iso.massExcess ? `${iso.massExcess.toFixed(3)} MeV` : '-', '#00d4ff');
    setVal('sub-val-binding', iso.bindingEnergy ? `${(iso.bindingEnergy / A).toFixed(3)} MeV` : '-', '#38bdf8');
    
    let abundStr = '-';
    if (iso.abundance !== null && iso.abundance !== undefined) {
        let a = iso.abundance;
        if (a > 100) a = a / 100;
        abundStr = `${a.toFixed(3)}%`;
    }
    setVal('sub-val-abundance', abundStr, isActuallyStable(iso) ? '#4ade80' : '#cbd5e1');
    setVal('sub-val-halflife', isActuallyStable(iso) ? '∞ (Stable)' : formatCompactHalfLife(iso), isActuallyStable(iso) ? '#4ade80' : '#facc15');
    setVal('sub-val-decay', iso.decayMode || (isActuallyStable(iso) ? 'None (Stable)' : 'Radioactive'), '#c084fc');
    setVal('sub-val-qval', iso.decayEnergy ? `${iso.decayEnergy.toFixed(2)} keV` : (iso.massExcess ? `${Math.abs(iso.massExcess).toFixed(2)} MeV` : '-'), '#38bdf8');
    setVal('sub-val-spin', iso.spin || '-', '#f472b6');
    setVal('sub-val-magnetic', iso.magneticMoment ? `${iso.magneticMoment.toFixed(4)} μN` : '-', '#cbd5e1');
    setVal('sub-val-quadrupole', iso.quadrupoleMoment ? `${iso.quadrupoleMoment.toFixed(4)} b` : '-', '#cbd5e1');
    setVal('sub-val-nucleons', `N = ${N} • Z = ${Z}`, '#00d4ff');
}

function initSubHalfLifeSimulator(iso, elData) {
    const isStable = isActuallyStable(iso);
    const badgeEl = document.getElementById('sub-sim-halflife-badge');
    const reactionBanner = document.getElementById('sub-sim-reaction-banner');
    const slider = document.getElementById('sub-sim-time-slider');
    const timeText = document.getElementById('sub-sim-time-text');
    const parentVal = document.getElementById('sub-sim-parent-val');
    const daughterVal = document.getElementById('sub-sim-daughter-val');
    const parentBar = document.getElementById('sub-sim-decay-bar-parent');
    const daughterBar = document.getElementById('sub-sim-decay-bar-daughter');

    if (!slider) return;

    if (isStable) {
        if (badgeEl) {
            badgeEl.innerText = 'T½ = ∞ (Stable)';
            badgeEl.style.color = '#4ade80';
            badgeEl.style.borderColor = '#4ade80';
        }
        if (reactionBanner) {
            reactionBanner.innerHTML = `<sup>${iso.massNumber}</sup>${elData.symbol} is 100% Stable (Zero Decay)`;
        }
        slider.value = 0;
        slider.disabled = true;
        if (timeText) timeText.innerText = 'Stable (No Decay)';
        if (parentVal) parentVal.innerText = '100.0%';
        if (daughterVal) daughterVal.innerText = '0.0%';
        if (parentBar) parentBar.style.width = '100%';
        if (daughterBar) daughterBar.style.width = '0%';
        return;
    }

    slider.disabled = false;
    slider.value = 0;

    const hlStr = formatCompactHalfLife(iso);
    if (badgeEl) {
        badgeEl.innerText = `T½ = ${hlStr}`;
        badgeEl.style.color = '#facc15';
        badgeEl.style.borderColor = '#facc15';
    }

    // Reaction equation
    const Z = elData.atomicNumber;
    const A = iso.massNumber;
    const mode = iso.decayMode || '';
    let dZ = Z, dA = A, particleStr = '+ Radiation';
    if (/\bA\b/.test(mode) || mode.includes('Alpha')) { dZ = Z - 2; dA = A - 4; particleStr = '+ ⁴₂α'; }
    else if (mode.includes('B-') || mode.includes('2B-')) { dZ = Z + 1; dA = A; particleStr = '+ e⁻ + ν̄ₑ'; }
    else if (mode.includes('B+') || mode.includes('EC')) { dZ = Z - 1; dA = A; particleStr = '+ e⁺ + νₑ'; }
    else if (/\bp\b/.test(mode)) { dZ = Z - 1; dA = A - 1; particleStr = '+ p⁺'; }
    else if (/\bn\b/.test(mode)) { dZ = Z; dA = A - 1; particleStr = '+ n⁰'; }
    else if (mode.includes('SF')) { dZ = Math.max(1, Math.floor(Z / 2)); dA = Math.max(1, Math.floor((A - 2) / 2)); particleStr = '+ Fission'; }

    const dEl = (typeof elementsData !== 'undefined' && elementsData[dZ - 1]) ? elementsData[dZ - 1] : { symbol: '?' };
    if (reactionBanner) {
        reactionBanner.innerHTML = `<sup>${A}</sup>${elData.symbol} &rarr; <sup>${dA}</sup>${dEl.symbol} ${particleStr}`;
    }

    const updateSimValues = () => {
        const pct = parseFloat(slider.value) / 100;
        const halfLives = pct * 7.0; // 0 to 7 half-lives
        const remainingPct = 100 * Math.pow(0.5, halfLives);
        const daughterPct = 100 - remainingPct;

        if (parentVal) parentVal.innerText = `${remainingPct.toFixed(1)}%`;
        if (daughterVal) daughterVal.innerText = `${daughterPct.toFixed(1)}%`;
        if (parentBar) parentBar.style.width = `${remainingPct}%`;
        if (daughterBar) daughterBar.style.width = `${daughterPct}%`;

        // Elapsed time in physical units
        const numVal = iso.halfLife || 1;
        const unit = iso.halfLifeUnit || '';
        const elapsedVal = halfLives * numVal;
        let timeFormatted = '';
        if (elapsedVal < 0.01) timeFormatted = `${elapsedVal.toExponential(2)} ${unit}`;
        else if (elapsedVal > 100000) timeFormatted = `${elapsedVal.toExponential(2)} ${unit}`;
        else timeFormatted = `${elapsedVal.toFixed(2)} ${unit}`;

        if (timeText) {
            timeText.innerText = `${timeFormatted} (${halfLives.toFixed(2)} T½)`;
        }
    };

    slider.oninput = updateSimValues;
    updateSimValues();
}

function openIsotopeModal(atomicNumber, initialIndex = 0) {
    if (!atomicNumber || atomicNumber < 1 || atomicNumber > 118) {
        atomicNumber = currentAtomicNumber || 1;
    }
    updateIsotopeSidebar(atomicNumber);
    const rawIsos = (typeof isotopeData !== 'undefined' && isotopeData[atomicNumber]) ? isotopeData[atomicNumber] : [];
    if (rawIsos.length > 0) {
        const elData = (typeof elementsData !== 'undefined' && elementsData[atomicNumber - 1]) ? elementsData[atomicNumber - 1] : null;
        const targetIso = rawIsos[initialIndex] || rawIsos[0];
        if (elData && targetIso) {
            openIsotopeDetailPanel(targetIso, elData);
        }
    }
}
window.openIsotopeModal = openIsotopeModal;


/**
 * Main update function called when an element is selected
 * or when switching to the isotopes view.
 */
function updateIsotopesView(atomicNumber) {
    if (!atomicNumber || atomicNumber < 1 || atomicNumber > 118) return;
    
    currentAtomicNumber = atomicNumber;
    
    // Retrieve element info from 01_data.js
    const elData = elementsData[atomicNumber - 1];
    if (!elData) return;
    
    // Retrieve isotope data
    if (typeof isotopeData !== 'undefined' && isotopeData[atomicNumber]) {
        const legendContainer = document.getElementById('modal-decay-legend');
        if (legendContainer && legendContainer.children.length === 0) {
            const legendModes = [
                { name: 'Stable', shortName: 'Stable', color: '#4ade80' },
                { name: 'α Alpha', shortName: 'α', color: '#facc15' },
                { name: 'β⁻ Beta-', shortName: 'β⁻', color: '#38bdf8' },
                { name: 'β⁺ / EC', shortName: 'β⁺', color: '#c084fc' },
                { name: 'SF Fission', shortName: 'SF', color: '#f87171' },
                { name: 'p Proton', shortName: 'p', color: '#fb923c' },
                { name: 'n Neutron', shortName: 'n', color: '#2dd4bf' }
            ];
            
            window.activeIsotopeFilter = null;
            
            legendModes.forEach(mode => {
                const p = document.createElement('div');
                p.className = 'iso-legend-chip';
                p.style.cssText = `position: relative; overflow: hidden; padding: 3px 8px; border-radius: 6px; border: 1px solid ${mode.color}; background: ${getGlossyBackground(mode.color, 'metal')}; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: var(--font-ui); cursor: pointer; transition: all 0.2s; user-select: none; flex-shrink: 0; white-space: nowrap; font-size: 0.68rem;`;
                p.innerHTML = `<div style="position: absolute; top: 0; left: 0; right: 0; height: 50%; background: linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%); pointer-events: none; border-radius: 6px 6px 0 0;"></div><span class="chip-text-full" style="position:relative; z-index:1;">${mode.name}</span><span class="chip-text-short" style="position:relative; z-index:1; display:none;">${mode.shortName}</span>`;
                
                const applyFilter = (mode) => {
                    const divM = document.getElementById('iso-div-matched');
                    const divO = document.getElementById('iso-div-other');
                    if (divM) {
                        divM.style.display = 'block';
                        divM.style.color = mode.color;
                        divM.style.borderBottomColor = mode.color;
                        divM.textContent = mode.name;
                    }
                    if (divO) divO.style.display = 'block';

                    document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                        if (el.dataset.decayColor !== mode.color) {
                            el.style.order = '3';
                            el.style.opacity = '0.2';
                        } else {
                            el.style.order = '1';
                            el.style.opacity = '1';
                        }
                    });
                };

                const clearFilter = () => {
                    const divM = document.getElementById('iso-div-matched');
                    const divO = document.getElementById('iso-div-other');
                    if (divM) divM.style.display = 'none';
                    if (divO) divO.style.display = 'none';

                    document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                        el.style.order = '1';
                        el.style.opacity = '1';
                    });
                };

                p.onmouseover = () => {
                    if (window.activeIsotopeFilter) return;
                    applyFilter(mode);
                };
                p.onmouseout = () => {
                    if (window.activeIsotopeFilter) return;
                    clearFilter();
                };
                p.onclick = () => {
                    if (window.activeIsotopeFilter === mode.color) {
                        window.activeIsotopeFilter = null;
                        clearFilter();
                        p.style.transform = 'scale(1)';
                        p.style.boxShadow = 'none';
                    } else {
                        window.activeIsotopeFilter = mode.color;
                        applyFilter(mode);
                        Array.from(legendContainer.children).forEach(l => {
                            l.style.transform = 'scale(1)';
                            l.style.boxShadow = 'none';
                        });
                        p.style.transform = 'scale(1.05)';
                        p.style.boxShadow = `0 0 15px ${mode.color}`;
                    }
                };
                
                legendContainer.appendChild(p);
            });
        }
        
        currentIsotopeData = isotopeData[atomicNumber];
    } else {
        currentIsotopeData = [];
    }
    
    // Sort isotopes: stable first, then by abundance, then by mass
    currentIsotopeData.sort((a, b) => {
        if (a.isStable && !b.isStable) return -1;
        if (!a.isStable && b.isStable) return 1;
        if (a.abundance !== null && b.abundance === null) return -1;
        if (a.abundance === null && b.abundance !== null) return 1;
        if (a.abundance !== null && b.abundance !== null && a.abundance !== b.abundance) {
            return b.abundance - a.abundance;
        }
        return a.massNumber - b.massNumber;
    });
    

    if (currentIsotopeData.length === 0) {
        document.getElementById('modal-isotope-count').textContent = '0 isotopes';
        return;
    }
    
    document.getElementById('modal-isotope-count').textContent = `${currentIsotopeData.length} isotopes`;
    
    // Populate Isotope List in Left Pane
    const listContainer = document.getElementById('modal-isotope-list');
    listContainer.innerHTML = '';
    
    // Create dividers for filtering
    const divMatched = document.createElement('div');
    divMatched.id = 'iso-div-matched';
    divMatched.style.cssText = 'grid-column: 1 / -1; font-family: var(--font-ui); font-size: 0.9rem; font-weight: bold; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.2); margin-bottom: 4px; display: none; order: 0; text-transform: uppercase; letter-spacing: 1px; width: 100%;';
    
    const divOther = document.createElement('div');
    divOther.id = 'iso-div-other';
    divOther.style.cssText = 'grid-column: 1 / -1; font-family: var(--font-ui); font-size: 0.9rem; font-weight: bold; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.2); margin-top: 10px; margin-bottom: 4px; display: none; order: 2; text-transform: uppercase; letter-spacing: 1px; color: #888; width: 100%;';
    divOther.textContent = 'Other Isotopes';

    listContainer.appendChild(divMatched);
    listContainer.appendChild(divOther);
    
    const formatValue = (val) => val !== null && val !== undefined ? val.toFixed(4) : '-';
    const formatExp = (val, dec = 2) => {
        if (val === null || val === undefined) return '-';
        if (Math.abs(val) > 10000 || (Math.abs(val) < 0.001 && val !== 0)) return val.toExponential(dec);
        return val.toFixed(dec);
    };
    
    const catName = getNormalizedCategory(elData.category);
    const catColor = categoryColors[catName] || '#38bdf8';

    currentIsotopeData.forEach((iso, index) => {
        const item = document.createElement('div');
        item.className = 'element-cell iso-element-cell';
        const isStable = isActuallyStable(iso);
        const dColor = getDecayColor(iso.decayMode);
        const indicatorColor = isStable ? '#4ade80' : dColor;
        item.dataset.mainColor = indicatorColor;
        item.dataset.catColor = catColor;
        item.dataset.decayColor = dColor;
        item.dataset.searchKey = `${iso.massNumber} ${elData.symbol}-${iso.massNumber} ${isStable ? 'stable' : ''} ${iso.decayMode || ''}`.toLowerCase();
        
        // Exact same glossy background as periodic table elements
        item.style.background = getGlossyBackground(indicatorColor, catName);
        item.style.borderColor = indicatorColor;
        
        const Z = elData.atomicNumber;
        const decayBadge = getDecayCompactTag(iso.decayMode, isStable);
        const compactHalfLife = formatCompactHalfLife(iso);
        const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#ffffff';

        item.innerHTML = `
            <span class="cell-num">${iso.massNumber}</span>
            <span class="cell-decay-tag" style="border: 1px solid ${indicatorColor}88; color: ${indicatorColor};">${decayBadge}</span>
            <span class="cell-sym" style="color: ${stateColor};">${elData.symbol}</span>
            <span class="cell-name">${elData.name}-${iso.massNumber}</span>
            <span class="cell-value" style="color: #ffffff;">${compactHalfLife}</span>
        `;
        
        item.onmouseenter = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = '#00d4ff';
                item.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.6), 0 8px 18px rgba(0, 212, 255, 0.4), inset 0 0 10px ${indicatorColor}33`;
                item.style.transform = 'scale(1.08) translateY(-2px)';
                item.style.zIndex = '10';
            }
        };
        item.onmouseleave = () => {
            if (!item.classList.contains('selected')) {
                item.style.borderColor = indicatorColor;
                item.style.boxShadow = '';
                item.style.transform = 'none';
                item.style.zIndex = '1';
            }
        };
        
        item.onclick = () => {
            document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                el.classList.remove('selected');
                const mColor = el.dataset.mainColor || 'rgba(255, 255, 255, 0.2)';
                el.style.borderColor = mColor;
                el.style.boxShadow = '';
                el.style.transform = 'none';
                el.style.zIndex = '1';
            });
            item.classList.add('selected');
            item.style.borderColor = '#00d4ff';
            item.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.8), 0 0 22px #00d4ff, inset 0 0 12px rgba(0, 212, 255, 0.3)`;
            item.style.transform = 'scale(1.04)';
            item.style.zIndex = '8';
            item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            renderIsotopeDetails(index);
        };
        
        listContainer.appendChild(item);
    });
    
    // Setup Search Filter Input
    const searchInput = document.getElementById('iso-search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = () => {
            const query = searchInput.value.trim().toLowerCase();
            document.querySelectorAll('.iso-element-cell, .iso-list-item').forEach(el => {
                if (!query || el.dataset.searchKey.includes(query)) {
                    el.style.display = 'flex';
                } else {
                    el.style.display = 'none';
                }
            });
        };
    }
    
    // Default select first
    const firstItem = listContainer.querySelector('.iso-element-cell, .iso-list-item');
    if (firstItem) {
        firstItem.classList.add('selected');
        firstItem.style.borderColor = '#00d4ff';
        firstItem.style.boxShadow = `inset 0 1px 2px rgba(255,255,255,0.8), 0 0 22px #00d4ff, inset 0 0 12px rgba(0, 212, 255, 0.3)`;
        firstItem.style.transform = 'scale(1.04)';
    }
    renderIsotopeDetails(0);
    
    // Handle Modal Animation
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    const cell = document.querySelector(`.view-mode.active .element-cell[data-z="${atomicNumber}"]`) || document.querySelector(`.element-cell[data-z="${atomicNumber}"]`);
    
    if (cell && modal) {
        const rect = cell.getBoundingClientRect();
        const cellCenterX = rect.left + rect.width / 2;
        const cellCenterY = rect.top + rect.height / 2;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const originX = (cellCenterX / winW) * 100;
        const originY = (cellCenterY / winH) * 100;
        modal.style.transformOrigin = `${originX}% ${originY}%`;
    } else if (modal) {
        modal.style.transformOrigin = 'center center';
    }
    
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            overlay.style.opacity = '1';
            if (modal) modal.style.transform = 'scale(1)';
        }, 10);
    }
}

/**
 * Format half-life values nicely.
 */
function formatHalfLife(val, unit) {
    if (val === null || val === undefined) return '-';
    if (unit === 'Gyears' || unit === 'Gyear') unit = 'billion years';
    if (unit === 'Myears' || unit === 'Myear') unit = 'million years';
    if (val > 1e6) {
        return val.toExponential(2) + ' ' + unit;
    }
    const numStr = val % 1 === 0 ? val.toString() : val.toFixed(4).replace(/\.?0+$/, '');
    return numStr + ' ' + unit;
}

/**
 * Render comprehensive details for selected isotope
 */
function renderIsotopeDetails(index) {
    if (!currentIsotopeData || !currentIsotopeData[index]) return;
    
    const iso = currentIsotopeData[index];
    const elData = elementsData[currentAtomicNumber - 1];
    const isStable = isActuallyStable(iso);
    
    const isoCard = document.getElementById('modal-iso-card');
    if (isoCard && elData) {
        const dColor = isStable ? '#4ade80' : getDecayColor(iso.decayMode);
        const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#e2e8f0';
        isoCard.style.display = 'flex';
        isoCard.style.background = getGlossyBackground(dColor, 'metal');
        isoCard.style.border = `1.5px solid ${dColor}`;
        const Z = elData.atomicNumber;
        const N = iso.massNumber - Z;
        
        let isoName = `${elData.name}-${iso.massNumber}`;
        if (Z === 1 && iso.massNumber === 1) isoName = 'Protium';
        if (Z === 1 && iso.massNumber === 2) isoName = 'Deuterium';
        if (Z === 1 && iso.massNumber === 3) isoName = 'Tritium';
        
        const massStr = iso.mass ? iso.mass.toFixed(4) : iso.massNumber;
        const statusHtml = isStable ? '<span style="color: #4ade80;">Stable Isotope</span>' : `<span style="color: ${dColor};">${iso.decayMode || 'Unstable'} Decay</span>`;
        const compactHalfLife = formatCompactHalfLife(iso);
        const halfLifeBadge = isStable ? 'Half-life: ∞' : `t½: ${compactHalfLife}`;

        isoCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 18px;">
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; line-height: 1.05; font-family: var(--font-mono);">
                    <span style="font-size: 1.35rem; font-weight: 800; color: #00d4ff; text-shadow: 0 0 10px rgba(0,212,255,0.4);">${iso.massNumber}</span>
                    <span style="font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.7);">${Z}</span>
                </div>
                <div style="font-size: 3.2rem; font-family: var(--font-mono); font-weight: 800; color: ${stateColor}; text-shadow: 0 2px 8px rgba(0,0,0,0.9); line-height: 1;">${elData.symbol}</div>
                <div style="display: flex; flex-direction: column; justify-content: center; gap: 5px; line-height: 1.15;">
                    <span style="font-size: 1.55rem; font-weight: 800; font-family: var(--font-ui); text-shadow: 0 2px 4px rgba(0,0,0,0.8); color: #fff; letter-spacing: -0.2px;">${isoName}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.85rem; font-family: var(--font-ui); text-shadow: 0 1px 2px rgba(0,0,0,0.8); font-weight: 700; padding: 3px 12px; border-radius: 14px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); letter-spacing: 0.3px;">${statusHtml}</span>
                        <span style="font-size: 0.82rem; font-family: var(--font-mono); color: rgba(255,255,255,0.85); background: rgba(0,0,0,0.35); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">${halfLifeBadge}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 6px; line-height: 1.25; font-family: var(--font-mono);">
                <div style="font-size: 0.95rem; color: rgba(255,255,255,0.75);">Mass: <strong style="color:#fff; font-size: 1.05rem; font-weight: 800;">${massStr} u</strong></div>
                <div style="font-size: 0.95rem; color: rgba(255,255,255,0.75);">Neutrons: <strong style="color:#00d4ff; font-size: 1.05rem; font-weight: 800;">${N}</strong></div>
            </div>
        `;
    }

    if (elData) {
        const elCard = document.getElementById('modal-el-card');
        if (elCard) {
            const catName = getNormalizedCategory(elData.category);
            const catColor = categoryColors[catName] || '#333';
            const stateColor = typeof stateTextColors !== 'undefined' ? (stateTextColors[elData.phase] || stateTextColors['Unknown']) : '#e2e8f0';
            const defaultN = Math.round(elData.atomicMass) - elData.atomicNumber;
            elCard.style.background = getGlossyBackground(catColor, catName);
            elCard.style.border = `1.5px solid ${catColor}`;
            elCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 64px; height: 64px; background: rgba(0,0,0,0.35); border: 1.5px solid rgba(255,255,255,0.25); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; flex-shrink: 0; box-shadow: inset 0 1px 3px rgba(255,255,255,0.3);">
                        <span style="position: absolute; top: 3px; left: 5px; font-size: 0.68rem; font-family: var(--font-mono); color: rgba(255,255,255,0.75); font-weight: 700;">${elData.atomicNumber}</span>
                        <span style="font-size: 2.2rem; font-family: var(--font-mono); font-weight: 800; color: ${stateColor}; line-height: 1;">${elData.symbol}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; line-height: 1.15;">
                        <span style="font-size: 1.45rem; font-weight: 800; font-family: var(--font-ui); color: #fff; letter-spacing: -0.2px;">${elData.name}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 0.72rem; color: #00d4ff; font-weight: 700; font-family: var(--font-ui); text-transform: uppercase; background: rgba(0,212,255,0.12); border: 1px solid rgba(0,212,255,0.3); padding: 1px 6px; border-radius: 6px;">${catName}</span>
                            <span style="font-size: 0.78rem; color: rgba(255,255,255,0.75); font-family: var(--font-mono);">${elData.atomicMass ? elData.atomicMass.toFixed(3) + ' u' : ''}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 5px; font-family: var(--font-mono); font-size: 0.78rem; flex-shrink: 0;">
                    <span style="background: rgba(0,0,0,0.45); padding: 3px 9px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); color: #00d4ff; font-weight: 700;">Z = ${elData.atomicNumber}</span>
                    <span style="background: rgba(0,0,0,0.45); padding: 3px 9px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); font-weight: 700;">Avg N = ${defaultN}</span>
                </div>
            `;
        }
    }
    
    const isoTitle = document.getElementById('modal-iso-title');
    if (isoTitle) {
        isoTitle.innerHTML = `<sup>${iso.massNumber}</sup>${elData ? elData.symbol : ''}`;
    }
    
    // Status text
    const statusEl = document.getElementById('modal-iso-status');
    if (statusEl) {
        if (isStable) {
            statusEl.innerHTML = '<span style="color: #4ade80;">Stable Isotope</span>';
        } else {
            statusEl.innerHTML = `<span style="color: ${getDecayColor(iso.decayMode)};">${iso.decayMode || 'Unstable'} Decay</span>`;
        }
    }
    
    // Helper to format values
    const format = (val, dec = 4) => (val !== null && val !== undefined) ? val.toFixed(dec) : '-';
    const formatExp = (val, dec = 4) => {
        if (val === null || val === undefined) return '-';
        if (Math.abs(val) > 10000 || (Math.abs(val) < 0.001 && val !== 0)) return val.toExponential(dec);
        return val.toFixed(dec);
    };
    
    // Abundance percentage helper (raw abundance is parts per 10,000, i.e. 10,000 = 100%)
    const rawAbund = iso.abundance;
    const abundPct = rawAbund !== null && rawAbund !== undefined ? (rawAbund > 100 ? rawAbund / 100 : rawAbund) : null;

    // Write-up link
    if (elData && elData.name) {
        document.getElementById('m-iso-wiki').innerHTML = `<button onclick="window.openWikiModal('${elData.name}', ${iso.massNumber})" style="background: rgba(59,130,246,0.2); border: 1px solid #3b82f6; color: #60a5fa; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-family: var(--font-ui); font-size: 0.85rem; transition: all 0.2s;">Read Wikipedia ↗</button>`;
    } else {
        document.getElementById('m-iso-wiki').textContent = '-';
    }
    
    document.getElementById('m-iso-mass').innerHTML = (iso.mass ? format(iso.mass, 6) : iso.massNumber) + ' <span style="font-size: 0.8em; color: #888;">u</span>';
    document.getElementById('m-iso-excess').innerHTML = iso.massExcess !== null ? format(iso.massExcess, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-binding').innerHTML = iso.bindingEnergy !== null ? format(iso.bindingEnergy, 3) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-abundance').innerHTML = abundPct !== null ? format(abundPct, 4) + ' <span style="font-size: 0.8em; color: #888;">%</span>' : '-';
    
    let hlText = '-';
    if (isStable) {
        hlText = '<span style="color: #4ade80;">Stable</span>';
    } else if (iso.halfLife !== null) {
        hlText = formatHalfLife(iso.halfLife, iso.halfLifeUnit);
    }
    document.getElementById('m-iso-halflife').innerHTML = hlText;
    document.getElementById('m-iso-decay').textContent = iso.decayMode || '-';
    
    // Calculate fallback values for Decay Width and Specific Activity mathematically
    let calcWidth = iso.decayWidth;
    let calcActivity = iso.specificActivity;
    
    if (!isStable && iso.halfLife !== null && (calcWidth === null || calcActivity === null)) {
        let t_sec = null;
        const val = iso.halfLife;
        const unit = (iso.halfLifeUnit || '').toLowerCase();
        
        let mult = 1;
        if (unit.includes('ysec')) mult = 1e-24;
        else if (unit.includes('zsec')) mult = 1e-21;
        else if (unit.includes('asec')) mult = 1e-18;
        else if (unit.includes('fsec')) mult = 1e-15;
        else if (unit.includes('psec')) mult = 1e-12;
        else if (unit.includes('nsec')) mult = 1e-9;
        else if (unit.includes('usec') || unit.includes('μs')) mult = 1e-6;
        else if (unit.includes('msec')) mult = 1e-3;
        else if (unit === 'sec' || unit === 's') mult = 1;
        else if (unit.includes('min')) mult = 60;
        else if (unit.includes('hour') || unit === 'h') mult = 3600;
        else if (unit.includes('day') || unit === 'd') mult = 86400;
        else if (unit === 'year' || unit === 'y' || unit === 'yr' || unit === 'years') mult = 31557600;
        else if (unit.includes('kyear') || unit.includes('kyr')) mult = 31557600 * 1e3;
        else if (unit.includes('myear') || unit.includes('myr')) mult = 31557600 * 1e6;
        else if (unit.includes('gyear') || unit.includes('gyr')) mult = 31557600 * 1e9;
        else if (unit.includes('tyear')) mult = 31557600 * 1e12;
        else if (unit.includes('pyear')) mult = 31557600 * 1e15;
        else if (unit.includes('eyear')) mult = 31557600 * 1e18;
        else if (unit.includes('zyear')) mult = 31557600 * 1e21;
        else if (unit.includes('yyear')) mult = 31557600 * 1e24;
        
        t_sec = val * mult;
        
        if (t_sec > 0) {
            if (calcWidth === null) calcWidth = 4.56229e-22 / t_sec;
            if (calcActivity === null) {
                const M = iso.mass || iso.massNumber;
                calcActivity = 4.174e23 / (t_sec * M);
            }
        }
    }
    
    document.getElementById('m-iso-width').innerHTML = calcWidth !== null ? formatExp(calcWidth, 4) + ' <span style="font-size: 0.8em; color: #888;">MeV</span>' : '-';
    document.getElementById('m-iso-activity').innerHTML = calcActivity !== null ? formatExp(calcActivity, 2) + ' <span style="font-size: 0.8em; color: #888;">Bq/g</span>' : '-';
    document.getElementById('m-iso-magnetic').innerHTML = iso.magneticMoment !== null ? format(iso.magneticMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">μN</span>' : '-';
    document.getElementById('m-iso-quadrupole').innerHTML = iso.quadrupoleMoment !== null ? format(iso.quadrupoleMoment, 4) + ' <span style="font-size: 0.8em; color: #888;">eb</span>' : '-';
    
    let spinParity = '-';
    if (iso.spin !== null && iso.spin !== '') {
        spinParity = iso.spin;
        if (iso.parity !== null && iso.parity !== '') spinParity += ' ' + iso.parity;
    } else if (iso.parity !== null && iso.parity !== '') {
        spinParity = iso.parity;
    }
    document.getElementById('m-iso-spin').textContent = spinParity;

    // Render Detailed Scientific Infographic
    const infoContainer = document.getElementById('decay-infographic-container');
    if (infoContainer && elData) {
        if (isStable) {
            const Z = elData.atomicNumber;
            const A = iso.massNumber;
            const N = A - Z;
            const ratioNZ = (N / Math.max(1, Z)).toFixed(2);
            const magicNumbers = [2, 8, 20, 28, 50, 82, 126];
            const isMagicZ = magicNumbers.includes(Z);
            const isMagicN = magicNumbers.includes(N);
            const isDoublyMagic = isMagicZ && isMagicN;
            
            let magicBadge = '';
            if (isDoublyMagic) {
                magicBadge = `<span style="background: rgba(250, 204, 21, 0.2); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.5); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; box-shadow: 0 0 10px rgba(250, 204, 21, 0.3);">✨ Doubly Magic Nucleus (Z=${Z}, N=${N})</span>`;
            } else if (isMagicZ || isMagicN) {
                magicBadge = `<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.5); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">⭐ Magic Shell (${isMagicZ ? 'Z=' + Z : 'N=' + N})</span>`;
            } else {
                magicBadge = `<span style="background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">🟢 Optimal N/Z Ratio (${ratioNZ})</span>`;
            }

            const abundStr = abundPct !== null ? `${abundPct.toFixed(2)}%` : 'Observationally Stable';
            const bindingStr = iso.bindingEnergy !== null && iso.bindingEnergy !== undefined ? `${(iso.bindingEnergy / A).toFixed(2)} MeV/A` : 'High (Valley Base)';

            infoContainer.innerHTML = `
                <div class="iso-decay-stage" style="flex-direction: column; justify-content: space-between; padding: 16px 14px; box-sizing: border-box; width: 100%; height: 100%;">
                    
                    <!-- Header Banner -->
                    <div class="iso-decay-banner-title" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(22, 101, 52, 0.35) 100%); border-color: rgba(74, 222, 128, 0.5); color: #4ade80; margin: 0 auto; max-width: 90%;">
                        VALLEY OF NUCLEAR STABILITY &bull; ${elData.name.toUpperCase()}-${A}
                    </div>

                    <!-- Top Stability Indicator -->
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; z-index: 2; flex-wrap: wrap;">
                        ${magicBadge}
                        <span style="background: rgba(0, 0, 0, 0.5); color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.15); padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-family: var(--font-mono);">Half-life: ∞ (Stable)</span>
                    </div>

                    <!-- Center 3-Column Visualizer (Responsive flex with auto-scaling) -->
                    <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; width: 100%; max-width: 860px; margin: 8px auto; gap: clamp(10px, 2.5vw, 24px); z-index: 2; box-sizing: border-box;">
                        
                        <!-- Left Stats Card -->
                        <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(74, 222, 128, 0.35); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 230px; min-width: 160px; box-sizing: border-box;">
                            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Nucleon Composition</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem;">
                                <span style="color: #38bdf8;">Protons (Z):</span>
                                <strong style="color: #fff;">${Z}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem;">
                                <span style="color: #f472b6;">Neutrons (N):</span>
                                <strong style="color: #fff;">${N}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                                <span style="color: #a78bfa;">Total Mass (A):</span>
                                <strong style="color: #00d4ff;">${A}</strong>
                            </div>
                        </div>

                        <!-- Center Glowing Nucleus Stage -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0;">
                            <div style="width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #4ade80 0%, #15803d 60%, #052e16 100%); box-shadow: 0 0 45px rgba(74, 222, 128, 0.45), inset 0 0 20px rgba(255,255,255,0.4); display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2.5px solid #86efac; position: relative;">
                                <span style="font-size: 2.4rem; font-family: var(--font-mono); font-weight: 800; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.8); line-height: 1;">${elData.symbol}</span>
                                <span style="font-size: 0.78rem; font-family: var(--font-mono); color: #dcfce7; font-weight: 700; margin-top: 2px;">A = ${A}</span>
                            </div>
                            <div style="font-size: 0.85rem; font-family: var(--font-ui); font-weight: 800; color: #4ade80; text-transform: uppercase; letter-spacing: 1.2px; text-shadow: 0 0 12px rgba(74,222,128,0.6);">Zero Radioactivity</div>
                        </div>

                        <!-- Right Stats Card -->
                        <div style="background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(74, 222, 128, 0.35); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; max-width: 240px; min-width: 170px; box-sizing: border-box;">
                            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Stability Parameters</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; gap: 6px;">
                                <span style="color: rgba(255,255,255,0.7); flex-shrink: 0;">Abundance:</span>
                                <strong style="color: #4ade80; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${abundStr}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; gap: 6px;">
                                <span style="color: rgba(255,255,255,0.7); flex-shrink: 0;">Binding (B/A):</span>
                                <strong style="color: #facc15; text-align: right; white-space: nowrap;">${bindingStr}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.82rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 3px;">
                                <span style="color: rgba(255,255,255,0.7);">Nuclear Force:</span>
                                <strong style="color: #38bdf8;">Equilibrium</strong>
                            </div>
                        </div>

                    </div>

                    <!-- Bottom Summary Banner -->
                    <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 6px 14px; font-size: 0.72rem; color: rgba(255,255,255,0.7); text-align: center; z-index: 2; margin: 0 auto; max-width: 90%;">
                        The strong nuclear force completely balances electrostatic proton repulsion. No spontaneous decay will ever occur.
                    </div>
                </div>
            `;
        } else {
            const dMode = iso.decayMode || '';
            const Z = elData.atomicNumber;
            const A = iso.massNumber;
            
            let dZ = Z, dA = A;
            let pZ = '', pA = '', pSym = '', pName = '', pFullName = '';
            let particleSvg = '';
            let isSpontaneousFission = false;
            let hasParticle = true;
            
            if (/\bA\b/.test(dMode) || dMode.includes('Alpha')) {
                dZ = Z - 2; dA = A - 4;
                pZ = '2'; pA = '4'; pSym = 'He'; pName = 'α'; pFullName = 'Alpha particle';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="pGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient><radialGradient id="nGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs><circle cx="15" cy="15" r="8" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="25" cy="15" r="8" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="15" cy="25" r="8" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /><circle cx="25" cy="25" r="8" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="0.5" /></svg>`;
            } else if (dMode.includes('B-')) {
                dZ = Z + 1; dA = A;
                pZ = '-1'; pA = '0'; pSym = 'e'; pName = 'β⁻'; pFullName = 'Electron';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="eGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#38bdf8" /><stop offset="100%" stop-color="#0284c7" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#eGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">e⁻</text></svg>`;
            } else if (dMode.includes('B+') || dMode.includes('EC')) {
                dZ = Z - 1; dA = A;
                pZ = '+1'; pA = '0'; pSym = 'e'; pName = dMode.includes('B+') ? 'β⁺' : 'ν'; pFullName = dMode.includes('B+') ? 'Positron' : 'Neutrino';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="posGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#c084fc" /><stop offset="100%" stop-color="#7e22ce" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#posGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">e⁺</text></svg>`;
            } else if (dMode.includes('SF')) {
                isSpontaneousFission = true;
                dZ = Math.floor(Z / 2); dA = Math.floor(A / 2);
                pZ = Math.ceil(Z / 2); pA = Math.ceil(A / 2);
            } else if (/\bp\b/.test(dMode)) {
                dZ = Z - 1; dA = A - 1;
                pZ = '1'; pA = '1'; pSym = 'p'; pName = 'Proton'; pFullName = 'Proton';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="pGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#pGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">p⁺</text></svg>`;
            } else if (/\bn\b/.test(dMode)) {
                dZ = Z; dA = A - 1;
                pZ = '0'; pA = '1'; pSym = 'n'; pName = 'Neutron'; pFullName = 'Neutron';
                particleSvg = `<svg viewBox="0 0 40 40" width="100%" height="100%"><defs><radialGradient id="nGrad" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs><circle cx="20" cy="20" r="12" fill="url(#nGrad)" stroke="rgba(0,0,0,0.3)" stroke-width="1" /><text x="20" y="25" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">n⁰</text></svg>`;
            } else {
                hasParticle = false;
            }

            const getElementByZ = (targetZ) => {
                const list = (typeof elementsData !== 'undefined') ? elementsData : (window.elementsData || []);
                if (!list || !list.length) return null;
                return list.find(e => e.atomicNumber === targetZ) || list[targetZ - 1] || null;
            };

            const getSym = (targetZ) => {
                const el = getElementByZ(targetZ);
                return el ? el.symbol : '?';
            };

            const getName = (targetZ) => {
                const el = getElementByZ(targetZ);
                return el ? el.name : 'Unknown';
            };
            
            const dSym = getSym(dZ);
            const dName = getName(dZ);
            const pNameFragment = getName(pZ);
            
            const genNuc = (mass) => {
                const numSpheres = Math.min(mass, 80);
                let svg = `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="pGradN" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#1d4ed8" /></radialGradient><radialGradient id="nGradN" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#f472b6" /><stop offset="100%" stop-color="#be185d" /></radialGradient></defs>`;
                const spheres = [];
                for (let i = 0; i < numSpheres; i++) {
                    const u = Math.random();
                    const v = Math.random();
                    const theta = u * 2 * Math.PI;
                    const phi = Math.acos(2 * v - 1);
                    const r = Math.cbrt(Math.random()) * 25; // 3D spherical volume distribution
                    const cx = 50 + r * Math.sin(phi) * Math.cos(theta);
                    const cy = 50 + r * Math.sin(phi) * Math.sin(theta);
                    const z = r * Math.cos(phi);
                    const fill = Math.random() > 0.5 ? 'url(#pGradN)' : 'url(#nGradN)';
                    spheres.push({ cx, cy, z, fill });
                }
                spheres.sort((a, b) => a.z - b.z); // Sort by Z depth!
                for (const s of spheres) {
                    svg += `<circle cx="${s.cx}" cy="${s.cy}" r="9" fill="${s.fill}" stroke="rgba(0,0,0,0.4)" stroke-width="0.8" />`;
                }
                svg += `</svg>`;
                return svg;
            };

            const parentSvg = genNuc(A);
            const daughterSvg = genNuc(dA);
            const dColor = getDecayColor(dMode);
            
            let html = `
                <div class="iso-decay-stage">
                    
                    <!-- Header Title -->
                    <div class="iso-decay-banner-title">
                        ${dMode} DECAY OF ${elData.name.toUpperCase()}-${A}
                    </div>

                    <!-- Legend Key -->
                    <div class="iso-decay-legend-key">
                        <div style="font-weight: bold; text-align: center; margin-bottom: 2px; color: rgba(255,255,255,0.6); font-size: 0.68rem; text-transform: uppercase;">Key</div>
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 600; color: #38bdf8;"><div style="width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #60a5fa 0%, #1d4ed8 100%); box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);"></div> Proton (p⁺)</div>
                        <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px; font-size: 0.72rem; font-weight: 600; color: #f472b6;"><div style="width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #f472b6 0%, #be185d 100%); box-shadow: 0 0 6px rgba(244, 114, 182, 0.6);"></div> Neutron (n⁰)</div>
                    </div>

                    <!-- Parent Nucleus -->
                    <div class="iso-decay-parent">
                        <div style="color: #38bdf8; font-weight: bold; text-align: center; line-height: 1.2; font-size: 0.95rem;">Parent Nucleus<br><span style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">(${elData.name}-${A})</span></div>
                        <div class="parent-svg-wrap" style="width: 100px; height: 100px; margin: 8px 0;">${parentSvg}</div>
                        <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 2.2rem; font-family: var(--font-mono);">
                            <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.95rem; line-height: 1; margin-right: 4px; color: #00d4ff;">
                                <span>${A}</span>
                                <span>${Z}</span>
                            </div>
                            <span style="line-height: 1;">${elData.symbol}</span>
                        </div>
                    </div>
            `;

            if (isSpontaneousFission || !hasParticle) {
                html += `
                    <!-- Center Arrow -->
                    <div class="iso-decay-arrow-wrap">
                        <div class="decay-badge-center" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #facc15; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.85); border: 1px solid #facc15; border-radius: 8px; padding: 4px 8px; font-size: 0.72rem; line-height: 1.1; box-shadow: 0 0 12px rgba(250, 204, 21, 0.35); white-space: nowrap;">Nuclear<br>Fission</div>
                        <svg width="100%" height="100%" viewBox="0 0 80 150" style="position: absolute; inset: 0;" preserveAspectRatio="none">
                            <path d="M 5,75 C 35,75 45,25 75,25" stroke="#facc15" stroke-width="2.5" fill="none" marker-end="url(#arrow-fiss)" />
                            <path d="M 5,75 C 35,75 45,125 75,125" stroke="#facc15" stroke-width="2.5" fill="none" marker-end="url(#arrow-fiss)" />
                            <defs>
                                <marker id="arrow-fiss" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#facc15" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Fragments) -->
                    <div class="iso-decay-products">
                        <!-- Fragment 1 -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${genNuc(pA)}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${getSym(pZ)}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Fragment 1 (${pNameFragment}-${pA})</div>
                            </div>
                        </div>

                        <!-- Fragment 2 -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Fragment 2 (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                let badgeLabel = dMode || 'Decay';
                if (badgeLabel.includes(',')) {
                    badgeLabel = badgeLabel.split(',')[0].trim();
                }
                html += `
                    <!-- Center Arrow -->
                    <div class="iso-decay-arrow-wrap">
                        <div class="decay-badge-center" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${dColor}; font-weight: bold; text-align: center; z-index: 2; background: rgba(0,0,0,0.85); border: 1px solid ${dColor}; border-radius: 8px; padding: 3px 6px; font-size: 0.68rem; line-height: 1.15; box-shadow: 0 0 12px ${dColor}44; max-width: 100px; word-break: break-word; white-space: normal;">${badgeLabel}<br>Event</div>
                        <svg width="100%" height="100%" viewBox="0 0 80 150" style="position: absolute; inset: 0;" preserveAspectRatio="none">
                            <path d="M 5,75 C 35,75 45,25 75,25" stroke="${dColor}" stroke-width="2.5" fill="none" marker-end="url(#arrow-prod)" />
                            <path d="M 5,75 C 35,75 45,125 75,125" stroke="${dColor}" stroke-width="2.5" fill="none" marker-end="url(#arrow-prod)" />
                            <defs>
                                <marker id="arrow-prod" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M 0 1 L 9 5 L 0 9 z" fill="${dColor}" />
                                </marker>
                            </defs>
                        </svg>
                    </div>

                    <!-- Right Side (Products) -->
                    <div class="iso-decay-products">
                        
                        <!-- Emitted Particle (Top) -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 40px; height: 40px; flex-shrink: 0;">${particleSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    ${pA ? `
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${pA}</span>
                                        <span>${pZ}</span>
                                    </div>
                                    ` : ''}
                                    <span style="line-height: 1;">${pSym}</span>
                                </div>
                                <div style="color: #facc15; font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Emitted ${pName} (${pFullName})</div>
                            </div>
                        </div>

                        <!-- Daughter Nucleus (Bottom) -->
                        <div class="iso-decay-product-item" style="display: flex; align-items: center; gap: 10px; height: 50px;">
                            <div style="width: 48px; height: 48px; flex-shrink: 0;">${daughterSvg}</div>
                            <div style="display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; font-weight: bold; color: #fff; font-size: 1.5rem; font-family: var(--font-mono); line-height: 1;">
                                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-size: 0.78rem; line-height: 1; margin-right: 3px; color: #00d4ff;">
                                        <span>${dA}</span>
                                        <span>${dZ}</span>
                                    </div>
                                    <span style="line-height: 1;">${dSym}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.7); font-weight: 600; line-height: 1.1; font-size: 0.72rem; margin-top: 2px;">Daughter Nucleus (${dName}-${dA})</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
            infoContainer.innerHTML = html;
        }
    }
    
    // Initialize Half-Life Simulator for this selected isotope
    initHalfLifeSimulator(iso);
}

// Wiki Modal Logic
window.openWikiModal = function(elName, massNum) {
    const modal = document.getElementById('wiki-modal');
    const iframe = document.getElementById('wiki-iframe');
    const loaderOverlay = document.getElementById('wiki-loader-overlay');
    const header = document.getElementById('wiki-modal-header');
    const symbolSpan = document.getElementById('wiki-modal-symbol');
    const iconSvg = document.getElementById('wiki-modal-icon');
    
    // Style the modal header if element data is available
    let el = null;
    if (typeof elementsData !== 'undefined') {
        el = elementsData.find(e => e.name === elName);
    }
    if (el && header) {
        const normalizedCategory = getNormalizedCategory(el.category);
        header.style.background = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory);
        header.style.borderBottom = `1px solid ${categoryColors[normalizedCategory] || 'rgba(255,255,255,0.2)'}`;
        if (symbolSpan && iconSvg) {
            symbolSpan.innerHTML = massNum ? `<sup>${massNum}</sup>${el.symbol}` : el.symbol;
            symbolSpan.style.display = 'inline';
            iconSvg.style.display = 'none';
        }
    } else if (header) {
        header.style.background = 'rgba(255,255,255,0.05)';
        header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        if (symbolSpan && iconSvg) {
            symbolSpan.style.display = 'none';
            iconSvg.style.display = 'inline';
        }
    }
    
    let pageName = elName;
    if (massNum) {
        pageName = `${elName}-${massNum}`;
    }
    
    // Reset states
    if (loaderOverlay) {
        loaderOverlay.style.display = 'flex';
        loaderOverlay.style.opacity = '1';
    }
    iframe.style.opacity = '0';
    iframe.srcdoc = '';
    
    modal.style.display = 'flex';
    
    // Use the official Wikimedia REST API to get a mobile-friendly HTML page that doesn't set X-Frame-Options
    const url = `https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(pageName)}`;
    
    // Once the iframe has finished rendering the injected HTML (including CSS!)
    iframe.onload = () => {
        if (iframe.srcdoc) {
            if (loaderOverlay) loaderOverlay.style.opacity = '0';
            iframe.style.opacity = '1';
            setTimeout(() => {
                if (loaderOverlay) loaderOverlay.style.display = 'none';
            }, 300);
        }
    };
    
    fetch(url)
        .then(res => {
            if (!res.ok) {
                if (!massNum) return fetch(`https://en.wikipedia.org/api/rest_v1/page/mobile-html/${encodeURIComponent(elName)}`).then(r => r.text());
                throw new Error('Network error');
            }
            return res.text();
        })
        .then(html => {
            // Inject custom CSS to style the Wikipedia Infobox table headers!
            let injectedCss = '';
            if (el) {
                const normalizedCategory = getNormalizedCategory(el.category);
                const bgColor = getGlossyBackground(categoryColors[normalizedCategory], normalizedCategory).replace(/"/g, "'");
                const borderColor = categoryColors[normalizedCategory] || 'rgba(255,255,255,0.2)';
                
                injectedCss = `
                <style>
                    table.infobox th.infobox-header {
                        background: ${bgColor} !important;
                        color: white !important;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
                        border-bottom: 2px solid ${borderColor} !important;
                    }
                    /* Also style the title caption */
                    table.infobox caption.infobox-title {
                        background: ${bgColor} !important;
                        color: white !important;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.8) !important;
                        border-bottom: 2px solid ${borderColor} !important;
                    }
                </style>`;
            }

            // Wikipedia mobile HTML API returns a full HTML document, but we inject a base tag to ensure all relative links and resources resolve to Wikipedia domain.
            const injectedHtml = html.replace('<head>', '<head><base href="https://en.wikipedia.org/wiki/">' + injectedCss);
            iframe.srcdoc = injectedHtml;
        })
        .catch(err => {
            iframe.srcdoc = `<html style="background:#0f172a;"><body style="color:red;padding:20px;font-family:sans-serif;background:#0f172a;">Error loading Wikipedia page.</body></html>`;
        });
};

// Half-Life Simulator Logic
function initHalfLifeSimulator(iso) {
    const badge = document.getElementById('sim-halflife-badge');
    const daughterBadge = document.getElementById('sim-daughter-badge');
    const reactionEquation = document.getElementById('sim-reaction-equation');
    const decayTypeLabel = document.getElementById('sim-decay-type');
    const parentLabel = document.getElementById('sim-parent-label');
    const daughterLabel = document.getElementById('sim-daughter-label');
    const parentCountEl = document.getElementById('sim-parent-count');
    const daughterCountEl = document.getElementById('sim-daughter-count');
    const slider = document.getElementById('sim-time-slider');
    const textTime = document.getElementById('sim-time-text');
    const textAtoms = document.getElementById('sim-atoms-text');
    const chamber = document.getElementById('sim-atom-chamber');
    
    if (!badge || !slider || !chamber) return;
    
    const elData = elementsData[currentAtomicNumber - 1];
    const Z = elData.atomicNumber;
    const A = iso.massNumber;
    const mode = iso.decayMode || '';

    let dZ = Z;
    let dA = A;
    let particleStr = '';

    if (/\bA\b/.test(mode) || mode.includes('Alpha')) {
        dZ = Z - 2;
        dA = A - 4;
        particleStr = '+ ⁴₂α';
    } else if (mode.includes('B-') || mode.includes('2B-')) {
        dZ = Z + 1;
        dA = A;
        particleStr = '+ e⁻ + ν̄ₑ';
    } else if (mode.includes('B+') || mode.includes('EC')) {
        dZ = Z - 1;
        dA = A;
        particleStr = '+ e⁺ + νₑ';
    } else if (/\bp\b/.test(mode)) {
        dZ = Z - 1;
        dA = A - 1;
        particleStr = '+ p⁺';
    } else if (/\bn\b/.test(mode)) {
        dZ = Z;
        dA = A - 1;
        particleStr = '+ n⁰';
    } else if (mode.includes('SF')) {
        dZ = Math.max(1, Math.floor(Z / 2));
        dA = Math.max(1, Math.floor((A - 2) / 2));
        particleStr = '+ Fission Fragments';
    }

    const getElementByZ = (targetZ) => {
        const list = (typeof elementsData !== 'undefined') ? elementsData : (window.elementsData || []);
        if (!list || !list.length) return null;
        return list.find(e => e.atomicNumber === targetZ) || list[targetZ - 1] || null;
    };

    const getSym = (targetZ) => {
        const el = getElementByZ(targetZ);
        return el ? el.symbol : '?';
    };

    const getName = (targetZ) => {
        const el = getElementByZ(targetZ);
        return el ? el.name : 'Unknown';
    };

    const dSym = getSym(dZ);
    const dName = getName(dZ);
    const parentFullName = `${elData.name}-${A}`;
    const daughterFullName = iso.isStable ? 'Stable' : `${dName}-${dA}`;

    // Set simulator headers
    const hlStr = iso.isStable ? 'Stable (∞)' : (iso.halfLife ? formatHalfLife(iso.halfLife, iso.halfLifeUnit) : 'Unknown');
    badge.textContent = `T½ = ${hlStr}`;
    
    if (daughterBadge) {
        if (iso.isStable) {
            daughterBadge.style.background = 'rgba(74, 222, 128, 0.15)';
            daughterBadge.style.borderColor = 'rgba(74, 222, 128, 0.4)';
            daughterBadge.style.color = '#4ade80';
            daughterBadge.textContent = '🟢 Stable Nucleus (No Decay)';
        } else {
            daughterBadge.style.background = 'rgba(192, 132, 252, 0.15)';
            daughterBadge.style.borderColor = 'rgba(192, 132, 252, 0.4)';
            daughterBadge.style.color = '#c084fc';
            daughterBadge.textContent = `⚛️ Decays Into: ${dName}-${dA} (${dSym})`;
        }
    }

    if (reactionEquation) {
        if (iso.isStable) {
            reactionEquation.innerHTML = `<span style="color:#4ade80;"><sup>${A}</sup><sub>${Z}</sub>${elData.symbol}</span> &bull; Stable Isotope (No Decay Product)`;
        } else {
            reactionEquation.innerHTML = `<span style="color:#38bdf8;"><sup>${A}</sup><sub>${Z}</sub>${elData.symbol}</span> ➔ <span style="color:#c084fc;"><sup>${dA}</sup><sub>${dZ}</sub>${dSym}</span> ${particleStr}`;
        }
    }

    if (decayTypeLabel) {
        decayTypeLabel.textContent = iso.isStable ? 'STABLE' : `Mode: ${mode || 'Radioactive Decay'}`;
        decayTypeLabel.style.color = iso.isStable ? '#4ade80' : getDecayColor(mode);
    }

    if (parentLabel) parentLabel.textContent = parentFullName;
    if (daughterLabel) daughterLabel.textContent = daughterFullName;

    slider.value = 0;

    // Disable slider entirely for stable isotopes — no decay can happen
    slider.disabled = iso.isStable;
    slider.style.opacity = iso.isStable ? '0.35' : '1';
    slider.style.cursor  = iso.isStable ? 'not-allowed' : 'pointer';
    
    // Generate 100 atoms
    chamber.innerHTML = '';
    const decayOrder = Array.from({length: 100}, (_, i) => i);
    for (let i = decayOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [decayOrder[i], decayOrder[j]] = [decayOrder[j], decayOrder[i]];
    }

    for (let i = 0; i < 100; i++) {
        const dot = document.createElement('div');
        dot.className = 'sim-atom-dot';
        dot.style.cssText = 'width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%); box-shadow: 0 0 8px rgba(74, 222, 128, 0.6); transition: all 0.3s ease;';
        chamber.appendChild(dot);
    }
    
    const updateSim = () => {
        // === STABLE ISOTOPE: nothing decays — lock everything to 100% parent ===
        if (iso.isStable) {
            slider.value = 0; // keep slider pinned at 0
            textTime.textContent = '0.0 Half-lives';
            textAtoms.textContent = '100 / 100 (100.0%)';
            if (parentCountEl)  parentCountEl.textContent  = 100;
            if (daughterCountEl) daughterCountEl.textContent = 0;

            // All dots stay green
            const dots = chamber.querySelectorAll('.sim-atom-dot');
            dots.forEach(dot => {
                dot.style.background  = 'radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%)';
                dot.style.boxShadow   = '0 0 8px rgba(74, 222, 128, 0.6)';
                dot.style.opacity     = '1';
                dot.style.transform   = 'scale(1)';
            });
            return;
        }

        // === RADIOACTIVE ISOTOPE: simulate exponential decay ===
        const tVal = parseFloat(slider.value);
        const fraction = Math.pow(0.5, tVal);
        const remainingCount = Math.round(100 * fraction);
        const decayedCount = 100 - remainingCount;
        
        let timeLabel = `${tVal.toFixed(1)} Half-lives`;
        if (iso.halfLife) {
            const realTime = (tVal * iso.halfLife);
            timeLabel += ` (${formatHalfLife(realTime, iso.halfLifeUnit)})`;
        }
        
        textTime.textContent = timeLabel;
        textAtoms.textContent = `${remainingCount} / 100 (${(fraction * 100).toFixed(1)}%)`;
        if (parentCountEl)  parentCountEl.textContent  = remainingCount;
        if (daughterCountEl) daughterCountEl.textContent = decayedCount;
        
        const activeIndices = new Set(decayOrder.slice(0, remainingCount));
        const dots = chamber.querySelectorAll('.sim-atom-dot');
        dots.forEach((dot, index) => {
            if (activeIndices.has(index)) {
                dot.style.background = 'radial-gradient(circle at 30% 30%, #4ade80 0%, #15803d 100%)';
                dot.style.boxShadow  = '0 0 8px rgba(74, 222, 128, 0.6)';
                dot.style.opacity    = '1';
                dot.style.transform  = 'scale(1)';
            } else {
                dot.style.background = 'radial-gradient(circle at 30% 30%, #a855f7 0%, #581c87 100%)';
                dot.style.boxShadow  = '0 0 4px rgba(168, 85, 247, 0.3)';
                dot.style.opacity    = '0.35';
                dot.style.transform  = 'scale(0.85)';
            }
        });
    };
    
    slider.oninput = updateSim;
    updateSim();
}

function closeIsotopeModal() {
    const overlay = document.getElementById('isotope-modal-overlay');
    const modal = document.getElementById('isotope-modal');
    
    if (overlay) overlay.style.opacity = '0';
    if (modal) modal.style.transform = 'scale(0.9)';
    document.body.style.overflow = '';
    
    setTimeout(() => {
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }, 300);
}
window.closeIsotopeModal = closeIsotopeModal;

// Setup close button, tab switching, and keyboard/backdrop shortcuts
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeIsotopeModal);

    const overlay = document.getElementById('isotope-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeIsotopeModal();
        });
    }

    const decayOverlay = document.getElementById('decay-explanation-modal');
    if (decayOverlay) {
        decayOverlay.addEventListener('click', (e) => {
            if (e.target === decayOverlay) closeDecayExplanationModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('isotope-modal-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                closeIsotopeModal();
            }
            const dem = document.getElementById('decay-explanation-modal');
            if (dem && dem.style.display !== 'none') {
                closeDecayExplanationModal();
            }
        }
    });

    // Setup Inspector Tab Switching
    document.querySelectorAll('.iso-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.iso-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetTab = btn.dataset.tab;
            document.querySelectorAll('.iso-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            const activeContent = document.getElementById(`iso-tab-${targetTab}`);
            if (activeContent) activeContent.style.display = 'flex';
        });
    });
});
