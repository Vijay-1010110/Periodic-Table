/**
 * PERIODICA 3D - Advanced Molecular Dynamics, Chemical Reaction & Intermolecular Physics Engine
 * Non-Linear Morse Potentials, Thermal Bond Dissociation, Dynamic Radical Recombination,
 * Hydrogen Bonding Networks, Ionic Coulomb Lattices, and P-T Chamber Mechanics.
 * 
 * (c) 2026 Periodica 3D | Developer: Vijay-1010110
 */

(function () {
    'use strict';

    /**
     * Element Physical Constants & CPK Colors
     */
    const ELEMENT_META = {
        'H':  { mass: 1.008, radius: 10, color: '#ffffff', valence: 1, electronegativity: 2.20 },
        'C':  { mass: 12.011, radius: 14, color: '#64748b', valence: 4, electronegativity: 2.55 },
        'N':  { mass: 14.007, radius: 14, color: '#3b82f6', valence: 3, electronegativity: 3.04 },
        'O':  { mass: 15.999, radius: 14, color: '#ef4444', valence: 2, electronegativity: 3.44 },
        'F':  { mass: 18.998, radius: 12, color: '#06b6d4', valence: 1, electronegativity: 3.98 },
        'Na': { mass: 22.990, radius: 17, color: '#a855f7', valence: 1, electronegativity: 0.93 },
        'Mg': { mass: 24.305, radius: 16, color: '#10b981', valence: 2, electronegativity: 1.31 },
        'Al': { mass: 26.982, radius: 16, color: '#f472b6', valence: 3, electronegativity: 1.61 },
        'Si': { mass: 28.085, radius: 16, color: '#f59e0b', valence: 4, electronegativity: 1.90 },
        'P':  { mass: 30.974, radius: 15, color: '#f97316', valence: 3, electronegativity: 2.19 },
        'S':  { mass: 32.065, radius: 15, color: '#eab308', valence: 2, electronegativity: 2.58 },
        'Cl': { mass: 35.453, radius: 15, color: '#22c55e', valence: 1, electronegativity: 3.16 },
        'K':  { mass: 39.098, radius: 19, color: '#8b5cf6', valence: 1, electronegativity: 0.82 },
        'Ca': { mass: 40.078, radius: 18, color: '#14b8a6', valence: 2, electronegativity: 1.00 },
        'Fe': { mass: 55.845, radius: 17, color: '#ea580c', valence: 2, electronegativity: 1.83 }
    };

    /**
     * Standard Bond Dissociation Energies (De in arbitrary simulation eV units: 3.0 - 10.0)
     */
    const BOND_ENERGIES = {
        'H-H': 4.5,
        'O-H': 4.8,
        'C-H': 4.3,
        'N-H': 4.0,
        'C-C': 3.6,
        'C=C': 6.4,
        'C#C': 8.7,
        'C-O': 3.7,
        'C=O': 8.3,
        'C-N': 3.2,
        'C=N': 6.4,
        'N-O': 2.3,
        'N=O': 6.2,
        'N#N': 9.8,
        'O-O': 1.5,
        'O=O': 5.2,
        'H-Cl': 4.5,
        'H-F': 5.9,
        'Na-Cl': 4.2,
        'Mg-O': 4.0,
        'S-O': 5.4,
        'S-H': 3.8
    };

    function getBondEnergy(elemA, elemB, order = 1) {
        let sym = order === 3 ? '#' : (order === 2 ? '=' : '-');
        let key1 = `${elemA}${sym}${elemB}`;
        let key2 = `${elemB}${sym}${elemA}`;
        if (BOND_ENERGIES[key1]) return BOND_ENERGIES[key1];
        if (BOND_ENERGIES[key2]) return BOND_ENERGIES[key2];
        return order === 3 ? 8.0 : (order === 2 ? 6.0 : 3.8);
    }

    /**
     * Extensive Molecular Library (30+ Single Molecules & Multi-Molecule Reactive Clusters)
     */
    const MOLECULE_PRESETS = {
        // ========== 1. ATMOSPHERIC & SIMPLE GASES ==========
        'H2O': {
            name: 'Water (H₂O)',
            category: 'Atmospheric',
            desc: 'Polar bent molecule (104.5°). Forms extensive hydrogen bonding networks.',
            atoms: [
                { id: 0, element: 'O', x: 0, y: -6, z: 0, charge: -0.66 },
                { id: 1, element: 'H', x: -38, y: 22, z: 0, charge: +0.33 },
                { id: 2, element: 'H', x: 38, y: 22, z: 0, charge: +0.33 }
            ],
            bonds: [
                { a: 0, b: 1, length: 44, k: 380, order: 1, De: 4.8 },
                { a: 0, b: 2, length: 44, k: 380, order: 1, De: 4.8 },
                { a: 1, b: 2, length: 69, k: 120, order: 1, isAngleConstraint: true, De: 2.5 }
            ]
        },
        'H2': {
            name: 'Hydrogen Gas (H₂)',
            category: 'Atmospheric',
            desc: 'Simplest diatomic molecule. Clean fuel with high gravimetric energy density.',
            atoms: [
                { id: 0, element: 'H', x: -20, y: 0, z: 0, charge: 0 },
                { id: 1, element: 'H', x: 20, y: 0, z: 0, charge: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 40, k: 440, order: 1, De: 4.5 }
            ]
        },
        'O2': {
            name: 'Oxygen Gas (O₂)',
            category: 'Atmospheric',
            desc: 'Paramagnetic diatomic gas with double covalent bond supporting aerobic life.',
            atoms: [
                { id: 0, element: 'O', x: -26, y: 0, z: 0, charge: 0 },
                { id: 1, element: 'O', x: 26, y: 0, z: 0, charge: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 52, k: 540, order: 2, De: 5.2 }
            ]
        },
        'N2': {
            name: 'Nitrogen Gas (N₂)',
            category: 'Atmospheric',
            desc: 'Inert diatomic gas with an ultra-strong triple bond (945 kJ/mol).',
            atoms: [
                { id: 0, element: 'N', x: -24, y: 0, z: 0, charge: 0 },
                { id: 1, element: 'N', x: 24, y: 0, z: 0, charge: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 700, order: 3, De: 9.8 }
            ]
        },
        'O3': {
            name: 'Ozone (O₃)',
            category: 'Atmospheric',
            desc: 'Resonant bent triatomic allotrope of oxygen shielding Earth from solar UV.',
            atoms: [
                { id: 0, element: 'O', x: 0, y: -16, z: 0, charge: +0.2 },
                { id: 1, element: 'O', x: -42, y: 16, z: 0, charge: -0.1 },
                { id: 2, element: 'O', x: 42, y: 16, z: 0, charge: -0.1 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 460, order: 1.5, De: 3.5 },
                { a: 0, b: 2, length: 48, k: 460, order: 1.5, De: 3.5 },
                { a: 1, b: 2, length: 84, k: 140, order: 1, isAngleConstraint: true, De: 1.8 }
            ]
        },
        'CO2': {
            name: 'Carbon Dioxide (CO₂)',
            category: 'Atmospheric',
            desc: 'Linear non-polar greenhouse gas with two strong C=O double bonds.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: 0, z: 0, charge: +0.5 },
                { id: 1, element: 'O', x: -52, y: 0, z: 0, charge: -0.25 },
                { id: 2, element: 'O', x: 52, y: 0, z: 0, charge: -0.25 }
            ],
            bonds: [
                { a: 0, b: 1, length: 52, k: 580, order: 2, De: 8.3 },
                { a: 0, b: 2, length: 52, k: 580, order: 2, De: 8.3 },
                { a: 1, b: 2, length: 104, k: 180, isAngleConstraint: true, De: 2.5 }
            ]
        },
        'CO': {
            name: 'Carbon Monoxide (CO)',
            category: 'Atmospheric',
            desc: 'Toxic triple-bonded gas with coordinate covalent bonding.',
            atoms: [
                { id: 0, element: 'C', x: -24, y: 0, z: 0, charge: -0.1 },
                { id: 1, element: 'O', x: 24, y: 0, z: 0, charge: +0.1 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 720, order: 3, De: 8.8 }
            ]
        },
        'H2O2': {
            name: 'Hydrogen Peroxide (H₂O₂)',
            category: 'Atmospheric',
            desc: 'Non-planar peroxide with weak O-O single bond susceptible to rapid decomposition.',
            atoms: [
                { id: 0, element: 'O', x: -20, y: -8, z: 0, charge: -0.3 },
                { id: 1, element: 'O', x: 20, y: 8, z: 0, charge: -0.3 },
                { id: 2, element: 'H', x: -48, y: 16, z: 0, charge: +0.3 },
                { id: 3, element: 'H', x: 48, y: -16, z: 0, charge: +0.3 }
            ],
            bonds: [
                { a: 0, b: 1, length: 42, k: 280, order: 1, De: 2.1 }, // Weak O-O bond!
                { a: 0, b: 2, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 1, b: 3, length: 42, k: 380, order: 1, De: 4.8 }
            ]
        },
        'NH3': {
            name: 'Ammonia (NH₃)',
            category: 'Atmospheric',
            desc: 'Trigonal pyramidal polar hydride with lone pair, readily accepts protons.',
            atoms: [
                { id: 0, element: 'N', x: 0, y: -8, z: 0, charge: -0.75 },
                { id: 1, element: 'H', x: -36, y: 22, z: 0, charge: +0.25 },
                { id: 2, element: 'H', x: 36, y: 22, z: 0, charge: +0.25 },
                { id: 3, element: 'H', x: 0, y: 38, z: 0, charge: +0.25 }
            ],
            bonds: [
                { a: 0, b: 1, length: 44, k: 360, order: 1, De: 4.0 },
                { a: 0, b: 2, length: 44, k: 360, order: 1, De: 4.0 },
                { a: 0, b: 3, length: 44, k: 360, order: 1, De: 4.0 },
                { a: 1, b: 2, length: 72, k: 110, isAngleConstraint: true, De: 1.8 }
            ]
        },
        'SO2': {
            name: 'Sulfur Dioxide (SO₂)',
            category: 'Atmospheric',
            desc: 'Bent triatomic acidic pollutant gas with resonant S=O bonds.',
            atoms: [
                { id: 0, element: 'S', x: 0, y: -12, z: 0, charge: +0.4 },
                { id: 1, element: 'O', x: -44, y: 16, z: 0, charge: -0.2 },
                { id: 2, element: 'O', x: 44, y: 16, z: 0, charge: -0.2 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 480, order: 2, De: 5.4 },
                { a: 0, b: 2, length: 48, k: 480, order: 2, De: 5.4 },
                { a: 1, b: 2, length: 88, k: 120, isAngleConstraint: true, De: 2.0 }
            ]
        },
        'NO2': {
            name: 'Nitrogen Dioxide (NO₂)',
            category: 'Atmospheric',
            desc: 'Brown toxic free radical gas with an unpaired electron, readily dimerizes to N₂O₄.',
            atoms: [
                { id: 0, element: 'N', x: 0, y: -14, z: 0, charge: +0.3 },
                { id: 1, element: 'O', x: -40, y: 14, z: 0, charge: -0.15 },
                { id: 2, element: 'O', x: 40, y: 14, z: 0, charge: -0.15 }
            ],
            bonds: [
                { a: 0, b: 1, length: 46, k: 460, order: 1.5, De: 4.4 },
                { a: 0, b: 2, length: 46, k: 460, order: 1.5, De: 4.4 },
                { a: 1, b: 2, length: 80, k: 120, isAngleConstraint: true, De: 1.8 }
            ]
        },

        // ========== 2. ACIDS & BASES ==========
        'HCl': {
            name: 'Hydrochloric Acid (HCl)',
            category: 'Acids & Bases',
            desc: 'Strong polar acid. Completely dissociates in water into H⁺ and Cl⁻ ions.',
            atoms: [
                { id: 0, element: 'Cl', x: 18, y: 0, z: 0, charge: -0.4 },
                { id: 1, element: 'H', x: -32, y: 0, z: 0, charge: +0.4 }
            ],
            bonds: [
                { a: 0, b: 1, length: 50, k: 420, order: 1, De: 4.5 }
            ]
        },
        'HF': {
            name: 'Hydrofluoric Acid (HF)',
            category: 'Acids & Bases',
            desc: 'Extremely polar hydrogen halide forming ultra-strong hydrogen bonds. Etches glass.',
            atoms: [
                { id: 0, element: 'F', x: 16, y: 0, z: 0, charge: -0.55 },
                { id: 1, element: 'H', x: -28, y: 0, z: 0, charge: +0.55 }
            ],
            bonds: [
                { a: 0, b: 1, length: 44, k: 510, order: 1, De: 5.9 }
            ]
        },
        'HNO3': {
            name: 'Nitric Acid (HNO₃)',
            category: 'Acids & Bases',
            desc: 'Powerful mineral acid and strong oxidizing agent. Used in fertilizer production.',
            atoms: [
                { id: 0, element: 'N', x: 0, y: 0, z: 0, charge: +0.6 },
                { id: 1, element: 'O', x: -38, y: -26, z: 0, charge: -0.3 },
                { id: 2, element: 'O', x: 38, y: -26, z: 0, charge: -0.3 },
                { id: 3, element: 'O', x: 0, y: 44, z: 0, charge: -0.4 },
                { id: 4, element: 'H', x: -32, y: 64, z: 0, charge: +0.4 }
            ],
            bonds: [
                { a: 0, b: 1, length: 46, k: 500, order: 2, De: 6.2 },
                { a: 0, b: 2, length: 46, k: 500, order: 2, De: 6.2 },
                { a: 0, b: 3, length: 44, k: 380, order: 1, De: 3.8 },
                { a: 3, b: 4, length: 38, k: 380, order: 1, De: 4.8 }
            ]
        },
        'H2SO4': {
            name: 'Sulfuric Acid (H₂SO₄)',
            category: 'Acids & Bases',
            desc: 'World\'s highest volume industrial chemical. Viscous, hygroscopic diprotic super-acid.',
            atoms: [
                { id: 0, element: 'S', x: 0, y: 0, z: 0, charge: +0.8 },
                { id: 1, element: 'O', x: 0, y: -48, z: 0, charge: -0.35 },
                { id: 2, element: 'O', x: 0, y: 48, z: 0, charge: -0.35 },
                { id: 3, element: 'O', x: -46, y: 0, z: 0, charge: -0.4 },
                { id: 4, element: 'O', x: 46, y: 0, z: 0, charge: -0.4 },
                { id: 5, element: 'H', x: -76, y: 24, z: 0, charge: +0.35 },
                { id: 6, element: 'H', x: 76, y: -24, z: 0, charge: +0.35 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 560, order: 2, De: 6.8 },
                { a: 0, b: 2, length: 48, k: 560, order: 2, De: 6.8 },
                { a: 0, b: 3, length: 46, k: 390, order: 1, De: 4.2 },
                { a: 0, b: 4, length: 46, k: 390, order: 1, De: 4.2 },
                { a: 3, b: 5, length: 38, k: 380, order: 1, De: 4.8 },
                { a: 4, b: 6, length: 38, k: 380, order: 1, De: 4.8 }
            ]
        },
        'NaOH': {
            name: 'Sodium Hydroxide (NaOH)',
            category: 'Acids & Bases',
            desc: 'Caustic soda. Dissociates into Na⁺ cation and hydroxide OH⁻ anion.',
            atoms: [
                { id: 0, element: 'Na', x: -36, y: 0, z: 0, charge: +1.0 },
                { id: 1, element: 'O', x: 18, y: 0, z: 0, charge: -0.8 },
                { id: 2, element: 'H', x: 54, y: 0, z: 0, charge: +0.3 }
            ],
            bonds: [
                { a: 0, b: 1, length: 54, k: 310, order: 1, De: 3.6 },
                { a: 1, b: 2, length: 36, k: 420, order: 1, De: 4.8 }
            ]
        },
        'KOH': {
            name: 'Potassium Hydroxide (KOH)',
            category: 'Acids & Bases',
            desc: 'Caustic potash. Highly alkaline precursor to soft soaps and alkaline batteries.',
            atoms: [
                { id: 0, element: 'K', x: -38, y: 0, z: 0, charge: +1.0 },
                { id: 1, element: 'O', x: 18, y: 0, z: 0, charge: -0.8 },
                { id: 2, element: 'H', x: 54, y: 0, z: 0, charge: +0.3 }
            ],
            bonds: [
                { a: 0, b: 1, length: 56, k: 290, order: 1, De: 3.4 },
                { a: 1, b: 2, length: 36, k: 420, order: 1, De: 4.8 }
            ]
        },

        // ========== 3. SALTS & CRYSTAL LATTICES ==========
        'NaCl': {
            name: 'Sodium Chloride (NaCl)',
            category: 'Salts & Crystals',
            desc: 'Table salt. Prototypical ionic crystal with complete electron transfer.',
            atoms: [
                { id: 0, element: 'Na', x: -28, y: 0, z: 0, charge: +1.0 },
                { id: 1, element: 'Cl', x: 28, y: 0, z: 0, charge: -1.0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 56, k: 340, order: 1, De: 4.2 }
            ]
        },
        'CaCO3': {
            name: 'Calcium Carbonate (CaCO₃)',
            category: 'Salts & Crystals',
            desc: 'Limestone, marble, and sea shells. Decomposes into CaO and CO₂ at high heat.',
            atoms: [
                { id: 0, element: 'Ca', x: -44, y: 0, z: 0, charge: +2.0 },
                { id: 1, element: 'C', x: 22, y: 0, z: 0, charge: +0.6 },
                { id: 2, element: 'O', x: 22, y: -42, z: 0, charge: -0.8 },
                { id: 3, element: 'O', x: 22, y: 42, z: 0, charge: -0.8 },
                { id: 4, element: 'O', x: 58, y: 0, z: 0, charge: -0.8 }
            ],
            bonds: [
                { a: 0, b: 1, length: 66, k: 290, order: 1, De: 3.2 },
                { a: 1, b: 2, length: 42, k: 460, order: 1.5, De: 5.5 },
                { a: 1, b: 3, length: 42, k: 460, order: 1.5, De: 5.5 },
                { a: 1, b: 4, length: 38, k: 500, order: 1.5, De: 6.0 }
            ]
        },
        'MgO': {
            name: 'Magnesium Oxide (MgO)',
            category: 'Salts & Crystals',
            desc: 'Ultra-refractory ionic oxide with exceptional melting point (3125 K).',
            atoms: [
                { id: 0, element: 'Mg', x: -24, y: 0, z: 0, charge: +2.0 },
                { id: 1, element: 'O', x: 24, y: 0, z: 0, charge: -2.0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 440, order: 2, De: 5.8 }
            ]
        },

        // ========== 4. HYDROCARBONS & ORGANICS ==========
        'CH4': {
            name: 'Methane (CH₄)',
            category: 'Organics',
            desc: 'Tetrahedral geometry with four equivalent C-H covalent bonds.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: 0, z: 0, charge: -0.2 },
                { id: 1, element: 'H', x: 0, y: -45, z: 0, charge: +0.05 },
                { id: 2, element: 'H', x: -42, y: 24, z: 0, charge: +0.05 },
                { id: 3, element: 'H', x: 42, y: 24, z: 0, charge: +0.05 },
                { id: 4, element: 'H', x: 0, y: 12, z: 0, charge: +0.05 }
            ],
            bonds: [
                { a: 0, b: 1, length: 45, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 2, length: 48, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 3, length: 48, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 4, length: 36, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 2, length: 78, k: 110, isAngleConstraint: true, De: 1.8 },
                { a: 1, b: 3, length: 78, k: 110, isAngleConstraint: true, De: 1.8 }
            ]
        },
        'C2H6': {
            name: 'Ethane (C₂H₆)',
            category: 'Organics',
            desc: 'Simple saturated alkane featuring free rotation around the C-C single sigma bond.',
            atoms: [
                { id: 0, element: 'C', x: -28, y: 0, z: 0 },
                { id: 1, element: 'C', x: 28, y: 0, z: 0 },
                { id: 2, element: 'H', x: -56, y: -30, z: 0 },
                { id: 3, element: 'H', x: -56, y: 30, z: 0 },
                { id: 4, element: 'H', x: -44, y: 0, z: 0 },
                { id: 5, element: 'H', x: 56, y: -30, z: 0 },
                { id: 6, element: 'H', x: 56, y: 30, z: 0 },
                { id: 7, element: 'H', x: 44, y: 0, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 56, k: 380, order: 1, De: 3.6 },
                { a: 0, b: 2, length: 42, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 3, length: 42, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 4, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 5, length: 42, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 6, length: 42, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 7, length: 40, k: 340, order: 1, De: 4.3 }
            ]
        },
        'C2H4': {
            name: 'Ethylene (C₂H₄)',
            category: 'Organics',
            desc: 'Planar alkene with reactive carbon-carbon double bond (σ + π). Precursor to polyethylene.',
            atoms: [
                { id: 0, element: 'C', x: -25, y: 0, z: 0 },
                { id: 1, element: 'C', x: 25, y: 0, z: 0 },
                { id: 2, element: 'H', x: -54, y: -30, z: 0 },
                { id: 3, element: 'H', x: -54, y: 30, z: 0 },
                { id: 4, element: 'H', x: 54, y: -30, z: 0 },
                { id: 5, element: 'H', x: 54, y: 30, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 50, k: 540, order: 2, De: 6.4 },
                { a: 0, b: 2, length: 42, k: 340, order: 1, De: 4.4 },
                { a: 0, b: 3, length: 42, k: 340, order: 1, De: 4.4 },
                { a: 1, b: 4, length: 42, k: 340, order: 1, De: 4.4 },
                { a: 1, b: 5, length: 42, k: 340, order: 1, De: 4.4 }
            ]
        },
        'C2H2': {
            name: 'Acetylene (C₂H₂)',
            category: 'Organics',
            desc: 'Linear alkyne featuring a high-energy carbon-carbon triple bond. Burns at 3600 K.',
            atoms: [
                { id: 0, element: 'C', x: -20, y: 0, z: 0 },
                { id: 1, element: 'C', x: 20, y: 0, z: 0 },
                { id: 2, element: 'H', x: -62, y: 0, z: 0 },
                { id: 3, element: 'H', x: 62, y: 0, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 40, k: 680, order: 3, De: 8.7 },
                { a: 0, b: 2, length: 42, k: 380, order: 1, De: 4.6 },
                { a: 1, b: 3, length: 42, k: 380, order: 1, De: 4.6 }
            ]
        },
        'C3H8': {
            name: 'Propane (C₃H₈)',
            category: 'Organics',
            desc: 'Three-carbon alkane gas liquefied under pressure for clean heating fuel.',
            atoms: [
                { id: 0, element: 'C', x: -44, y: 10, z: 0 },
                { id: 1, element: 'C', x: 0, y: -16, z: 0 },
                { id: 2, element: 'C', x: 44, y: 10, z: 0 },
                { id: 3, element: 'H', x: -74, y: -8, z: 0 },
                { id: 4, element: 'H', x: -66, y: 38, z: 0 },
                { id: 5, element: 'H', x: 0, y: -48, z: 0 },
                { id: 6, element: 'H', x: 66, y: 38, z: 0 },
                { id: 7, element: 'H', x: 74, y: -8, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 50, k: 380, order: 1, De: 3.6 },
                { a: 1, b: 2, length: 50, k: 380, order: 1, De: 3.6 },
                { a: 0, b: 3, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 4, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 5, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 2, b: 6, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 2, b: 7, length: 40, k: 340, order: 1, De: 4.3 }
            ]
        },
        'C6H6': {
            name: 'Benzene (C₆H₆)',
            category: 'Organics',
            desc: 'Aromatic hexagonal planar ring exhibiting quantum pi-electron resonance.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: -40, z: 0 },
                { id: 1, element: 'C', x: 35, y: -20, z: 0 },
                { id: 2, element: 'C', x: 35, y: 20, z: 0 },
                { id: 3, element: 'C', x: 0, y: 40, z: 0 },
                { id: 4, element: 'C', x: -35, y: 20, z: 0 },
                { id: 5, element: 'C', x: -35, y: -20, z: 0 },
                { id: 6, element: 'H', x: 0, y: -72, z: 0 },
                { id: 7, element: 'H', x: 62, y: -36, z: 0 },
                { id: 8, element: 'H', x: 62, y: 36, z: 0 },
                { id: 9, element: 'H', x: 0, y: 72, z: 0 },
                { id: 10, element: 'H', x: -62, y: 36, z: 0 },
                { id: 11, element: 'H', x: -62, y: -36, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 1, b: 2, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 2, b: 3, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 3, b: 4, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 4, b: 5, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 5, b: 0, length: 40, k: 480, order: 1.5, De: 5.2 },
                { a: 0, b: 6, length: 32, k: 360, order: 1, De: 4.4 },
                { a: 1, b: 7, length: 32, k: 360, order: 1, De: 4.4 },
                { a: 2, b: 8, length: 32, k: 360, order: 1, De: 4.4 },
                { a: 3, b: 9, length: 32, k: 360, order: 1, De: 4.4 },
                { a: 4, b: 10, length: 32, k: 360, order: 1, De: 4.4 },
                { a: 5, b: 11, length: 32, k: 360, order: 1, De: 4.4 }
            ]
        },
        'C2H5OH': {
            name: 'Ethanol (C₂H₅OH)',
            category: 'Organics',
            desc: 'Alcohol with polar hydroxyl (-OH) group capable of hydrogen bonding with water.',
            atoms: [
                { id: 0, element: 'C', x: -44, y: 10, z: 0 },
                { id: 1, element: 'C', x: 0, y: -10, z: 0 },
                { id: 2, element: 'O', x: 42, y: 10, z: 0, charge: -0.6 },
                { id: 3, element: 'H', x: 74, y: -6, z: 0, charge: +0.3 },
                { id: 4, element: 'H', x: -70, y: -6, z: 0 },
                { id: 5, element: 'H', x: -50, y: 44, z: 0 },
                { id: 6, element: 'H', x: 0, y: -44, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 380, order: 1, De: 3.6 },
                { a: 1, b: 2, length: 46, k: 390, order: 1, De: 3.7 },
                { a: 2, b: 3, length: 36, k: 400, order: 1, De: 4.8 },
                { a: 0, b: 4, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 5, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 1, b: 6, length: 40, k: 340, order: 1, De: 4.3 }
            ]
        },
        'CH3COOH': {
            name: 'Acetic Acid (CH₃COOH)',
            category: 'Organics',
            desc: 'Carboxylic acid found in vinegar. Forms stable cyclic hydrogen-bonded dimers.',
            atoms: [
                { id: 0, element: 'C', x: -36, y: 0, z: 0 },
                { id: 1, element: 'C', x: 12, y: 0, z: 0, charge: +0.4 },
                { id: 2, element: 'O', x: 26, y: -42, z: 0, charge: -0.4 },
                { id: 3, element: 'O', x: 42, y: 32, z: 0, charge: -0.5 },
                { id: 4, element: 'H', x: 74, y: 24, z: 0, charge: +0.35 },
                { id: 5, element: 'H', x: -64, y: -24, z: 0 },
                { id: 6, element: 'H', x: -64, y: 24, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 380, order: 1, De: 3.6 },
                { a: 1, b: 2, length: 44, k: 560, order: 2, De: 7.9 },
                { a: 1, b: 3, length: 46, k: 390, order: 1, De: 3.8 },
                { a: 3, b: 4, length: 36, k: 400, order: 1, De: 4.8 },
                { a: 0, b: 5, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 6, length: 40, k: 340, order: 1, De: 4.3 }
            ]
        },
        'HCHO': {
            name: 'Formaldehyde (HCHO)',
            category: 'Organics',
            desc: 'Simplest aldehyde. Reactive planar gas with a polar carbonyl (C=O) bond.',
            atoms: [
                { id: 0, element: 'C', x: 0, y: 0, z: 0, charge: +0.3 },
                { id: 1, element: 'O', x: 0, y: -46, z: 0, charge: -0.3 },
                { id: 2, element: 'H', x: -36, y: 30, z: 0 },
                { id: 3, element: 'H', x: 36, y: 30, z: 0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 46, k: 560, order: 2, De: 7.9 },
                { a: 0, b: 2, length: 42, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 3, length: 42, k: 340, order: 1, De: 4.3 }
            ]
        },

        // ========== 5. MULTI-MOLECULE STATE CHAMBERS & REACTION MIXES ==========
        'CLUSTER_H2O': {
            name: 'Water Cluster (6× H₂O)',
            category: 'State Chambers',
            desc: 'Six water molecules demonstrating intermolecular hydrogen bonding, liquid flow, and ice lattice.',
            isMultiMolecule: true,
            atoms: [
                // Mol 1 (top left)
                { id: 0, element: 'O', x: -110, y: -70, z: 0, charge: -0.66, molId: 1 },
                { id: 1, element: 'H', x: -140, y: -50, z: 0, charge: +0.33, molId: 1 },
                { id: 2, element: 'H', x: -80, y: -50, z: 0, charge: +0.33, molId: 1 },
                // Mol 2 (top right)
                { id: 3, element: 'O', x: 110, y: -70, z: 0, charge: -0.66, molId: 2 },
                { id: 4, element: 'H', x: 80, y: -50, z: 0, charge: +0.33, molId: 2 },
                { id: 5, element: 'H', x: 140, y: -50, z: 0, charge: +0.33, molId: 2 },
                // Mol 3 (center left)
                { id: 6, element: 'O', x: -60, y: 10, z: 0, charge: -0.66, molId: 3 },
                { id: 7, element: 'H', x: -85, y: -15, z: 0, charge: +0.33, molId: 3 },
                { id: 8, element: 'H', x: -40, y: 35, z: 0, charge: +0.33, molId: 3 },
                // Mol 4 (center right)
                { id: 9, element: 'O', x: 60, y: 10, z: 0, charge: -0.66, molId: 4 },
                { id: 10, element: 'H', x: 85, y: -15, z: 0, charge: +0.33, molId: 4 },
                { id: 11, element: 'H', x: 40, y: 35, z: 0, charge: +0.33, molId: 4 },
                // Mol 5 (bottom left)
                { id: 12, element: 'O', x: -100, y: 80, z: 0, charge: -0.66, molId: 5 },
                { id: 13, element: 'H', x: -130, y: 65, z: 0, charge: +0.33, molId: 5 },
                { id: 14, element: 'H', x: -80, y: 105, z: 0, charge: +0.33, molId: 5 },
                // Mol 6 (bottom right)
                { id: 15, element: 'O', x: 100, y: 80, z: 0, charge: -0.66, molId: 6 },
                { id: 16, element: 'H', x: 80, y: 105, z: 0, charge: +0.33, molId: 6 },
                { id: 17, element: 'H', x: 130, y: 65, z: 0, charge: +0.33, molId: 6 }
            ],
            bonds: [
                // Mol 1
                { a: 0, b: 1, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 0, b: 2, length: 42, k: 380, order: 1, De: 4.8 },
                // Mol 2
                { a: 3, b: 4, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 3, b: 5, length: 42, k: 380, order: 1, De: 4.8 },
                // Mol 3
                { a: 6, b: 7, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 6, b: 8, length: 42, k: 380, order: 1, De: 4.8 },
                // Mol 4
                { a: 9, b: 10, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 9, b: 11, length: 42, k: 380, order: 1, De: 4.8 },
                // Mol 5
                { a: 12, b: 13, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 12, b: 14, length: 42, k: 380, order: 1, De: 4.8 },
                // Mol 6
                { a: 15, b: 16, length: 42, k: 380, order: 1, De: 4.8 },
                { a: 15, b: 17, length: 42, k: 380, order: 1, De: 4.8 }
            ]
        },
        'MIX_COMBUSTION': {
            name: 'Combustion Mix (CH₄ + 2 O₂)',
            category: 'State Chambers',
            desc: 'Methane and oxygen mix. Raise temperature above 800 K or tap JOLT to spark combustion into CO₂ and H₂O!',
            isMultiMolecule: true,
            atoms: [
                // Methane CH4 in center
                { id: 0, element: 'C', x: 0, y: 0, z: 0, molId: 1 },
                { id: 1, element: 'H', x: 0, y: -38, z: 0, molId: 1 },
                { id: 2, element: 'H', x: -36, y: 20, z: 0, molId: 1 },
                { id: 3, element: 'H', x: 36, y: 20, z: 0, molId: 1 },
                { id: 4, element: 'H', x: 0, y: 10, z: 0, molId: 1 },
                // Oxygen 1 (left)
                { id: 5, element: 'O', x: -110, y: -20, z: 0, molId: 2 },
                { id: 6, element: 'O', x: -110, y: 26, z: 0, molId: 2 },
                // Oxygen 2 (right)
                { id: 7, element: 'O', x: 110, y: -20, z: 0, molId: 3 },
                { id: 8, element: 'O', x: 110, y: 26, z: 0, molId: 3 }
            ],
            bonds: [
                { a: 0, b: 1, length: 38, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 2, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 3, length: 40, k: 340, order: 1, De: 4.3 },
                { a: 0, b: 4, length: 30, k: 340, order: 1, De: 4.3 },
                { a: 5, b: 6, length: 46, k: 520, order: 2, De: 5.2 },
                { a: 7, b: 8, length: 46, k: 520, order: 2, De: 5.2 }
            ]
        },
        'MIX_H2_O2': {
            name: 'Water Synthesis Mix (2 H₂ + O₂)',
            category: 'State Chambers',
            desc: 'Explosive stoichiometric oxy-hydrogen mixture. Spark or heat to trigger synthesis into 2 H₂O!',
            isMultiMolecule: true,
            atoms: [
                // Oxygen O2 in center
                { id: 0, element: 'O', x: 0, y: -24, z: 0, molId: 1 },
                { id: 1, element: 'O', x: 0, y: 24, z: 0, molId: 1 },
                // Hydrogen 1 (left)
                { id: 2, element: 'H', x: -100, y: -16, z: 0, molId: 2 },
                { id: 3, element: 'H', x: -100, y: 16, z: 0, molId: 2 },
                // Hydrogen 2 (right)
                { id: 4, element: 'H', x: 100, y: -16, z: 0, molId: 3 },
                { id: 5, element: 'H', x: 100, y: 16, z: 0, molId: 3 }
            ],
            bonds: [
                { a: 0, b: 1, length: 48, k: 520, order: 2, De: 5.2 },
                { a: 2, b: 3, length: 32, k: 440, order: 1, De: 4.5 },
                { a: 4, b: 5, length: 32, k: 440, order: 1, De: 4.5 }
            ]
        },
        'LATTICE_NACL': {
            name: 'Ionic Crystal Lattice (8× NaCl)',
            category: 'State Chambers',
            desc: 'Alternating Na⁺ and Cl⁻ ions demonstrating electrostatic self-assembly into a cubic rock-salt lattice.',
            isMultiMolecule: true,
            atoms: [
                // Row 1
                { id: 0, element: 'Na', x: -90, y: -45, z: 0, charge: +1.0 },
                { id: 1, element: 'Cl', x: -30, y: -45, z: 0, charge: -1.0 },
                { id: 2, element: 'Na', x: 30, y: -45, z: 0, charge: +1.0 },
                { id: 3, element: 'Cl', x: 90, y: -45, z: 0, charge: -1.0 },
                // Row 2
                { id: 4, element: 'Cl', x: -90, y: 45, z: 0, charge: -1.0 },
                { id: 5, element: 'Na', x: -30, y: 45, z: 0, charge: +1.0 },
                { id: 6, element: 'Cl', x: 30, y: 45, z: 0, charge: -1.0 },
                { id: 7, element: 'Na', x: 90, y: 45, z: 0, charge: +1.0 }
            ],
            bonds: [
                { a: 0, b: 1, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 1, b: 2, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 2, b: 3, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 4, b: 5, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 5, b: 6, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 6, b: 7, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 0, b: 4, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 1, b: 5, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 2, b: 6, length: 60, k: 340, order: 1, De: 4.2 },
                { a: 3, b: 7, length: 60, k: 340, order: 1, De: 4.2 }
            ]
        }
    };

    /**
     * Physical Particle Entity (SimAtom)
     */
    class SimAtom {
        constructor(config, offsetX, offsetY) {
            this.id = config.id;
            this.element = config.element || 'C';
            const meta = ELEMENT_META[this.element] || ELEMENT_META['C'];
            this.mass = meta.mass;
            this.radius = meta.radius;
            this.color = meta.color;
            this.valence = meta.valence;
            this.electronegativity = meta.electronegativity;
            this.charge = typeof config.charge === 'number' ? config.charge : 0;
            this.molId = config.molId || 0;

            this.x = (config.x || 0) + offsetX;
            this.y = (config.y || 0) + offsetY;
            this.vx = (Math.random() - 0.5) * 12;
            this.vy = (Math.random() - 0.5) * 12;
            this.fx = 0;
            this.fy = 0;
            this.isDragged = false;
        }

        applyForce(fx, fy) {
            this.fx += fx;
            this.fy += fy;
        }

        integrate(dt, damping = 0.992) {
            if (this.isDragged) {
                this.vx = 0;
                this.vy = 0;
                this.fx = 0;
                this.fy = 0;
                return;
            }

            const ax = this.fx / this.mass;
            const ay = this.fy / this.mass;

            this.vx = (this.vx + ax * dt) * damping;
            this.vy = (this.vy + ay * dt) * damping;

            // Velocity clamp to prevent numerical explosion
            const speedSq = this.vx * this.vx + this.vy * this.vy;
            const maxSpeed = 700;
            if (speedSq > maxSpeed * maxSpeed) {
                const s = maxSpeed / Math.sqrt(speedSq);
                this.vx *= s;
                this.vy *= s;
            }

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            this.fx = 0;
            this.fy = 0;
        }
    }

    /**
     * Particle Spark / Burst Entity for Chemical Rupture & Reactions
     */
    class SimSpark {
        constructor(x, y, color = '#00d4ff', speed = 180) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const v = (0.3 + Math.random() * 0.7) * speed;
            this.vx = Math.cos(angle) * v;
            this.vy = Math.sin(angle) * v;
            this.color = color;
            this.life = 1.0;
            this.decay = 1.8 + Math.random() * 1.5;
            this.size = 2 + Math.random() * 3;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= this.decay * dt;
            return this.life > 0;
        }

        render(ctx) {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * Master MolecularDynamicsEngine
     */
    class MolecularDynamicsEngine {
        constructor() {
            this.currentKey = 'H2O';
            this.temperatureK = 298.0;   // Kelvin (50 K to 5000 K)
            this.pressureAtm = 1.0;      // Atmospheres (0.01 atm to 50 atm)
            this.atoms = [];
            this.bonds = [];
            this.sparks = [];
            this.hBonds = [];           // Transient Intermolecular Hydrogen Bonds
            this.draggedAtom = null;
            this.width = 600;
            this.height = 400;
            this.centerGravityK = 3.5;   // Soft boundary tether (not pinning)
            this.recentEvents = [];      // Reaction / Rupture event log
            this.nextAtomId = 100;
            this.nextBondId = 100;
            this.showBondLabels = true;

            this.loadPreset('H2O');
        }

        loadPreset(key) {
            const preset = MOLECULE_PRESETS[key] || MOLECULE_PRESETS['H2O'];
            this.currentKey = key;
            this.atoms = [];
            this.bonds = [];
            this.sparks = [];
            this.hBonds = [];
            this.recentEvents = [];

            const centerX = this.width / 2;
            const centerY = this.height / 2;

            preset.atoms.forEach(cfg => {
                this.atoms.push(new SimAtom(cfg, centerX, centerY));
            });

            this.bonds = preset.bonds.map((b, idx) => ({
                id: idx,
                a: b.a,
                b: b.b,
                targetLen: b.length,
                k: b.k || 380,
                order: b.order || 1,
                De: b.De || 4.5,
                broken: false,
                isAngleConstraint: !!b.isAngleConstraint,
                strain: 0
            }));

            this.logEvent(`Loaded preset: ${preset.name}`);
        }

        logEvent(msg) {
            const time = new Date().toLocaleTimeString().split(' ')[0];
            this.recentEvents.unshift(`[${time}] ${msg}`);
            if (this.recentEvents.length > 5) this.recentEvents.pop();
        }

        setTemperature(kelvin) {
            this.temperatureK = Math.max(50, Math.min(5000, Number(kelvin) || 298));
        }

        setPressure(atm) {
            this.pressureAtm = Math.max(0.01, Math.min(50.0, Number(atm) || 1.0));
        }

        applyImpulse(atomOrIndex = 0, fx = 0, fy = -380) {
            const atom = (typeof atomOrIndex === 'number') ? this.atoms[atomOrIndex] : (atomOrIndex || this.atoms[0]);
            if (atom) {
                atom.vx += (fx || (Math.random() - 0.5) * 350) / Math.max(1, atom.mass);
                atom.vy += (fy || -380) / Math.max(1, atom.mass);
                this.createSparkBurst(atom.x, atom.y, '#f59e0b', 8, 220);
                if (window.physicsAudio) {
                    window.physicsAudio.playBondReleaseSnap();
                }
            }
        }

        injectAtom(element = 'H') {
            const meta = ELEMENT_META[element] || ELEMENT_META['H'];
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const spawnX = centerX + (Math.random() - 0.5) * (this.width * 0.4);
            const spawnY = centerY + (Math.random() - 0.5) * (this.height * 0.4);

            const newAtom = new SimAtom({
                id: this.nextAtomId++,
                element: element,
                x: 0,
                y: 0,
                charge: element === 'H' ? 0.33 : (element === 'O' ? -0.66 : 0)
            }, spawnX, spawnY);

            newAtom.vx = (Math.random() - 0.5) * 120;
            newAtom.vy = (Math.random() - 0.5) * 120;

            this.atoms.push(newAtom);
            this.createSparkBurst(spawnX, spawnY, meta.color, 10, 160);
            this.logEvent(`➕ Injected ${element} atom into chamber`);
        }

        startDrag(screenX, screenY) {
            for (const atom of this.atoms) {
                const dx = screenX - atom.x;
                const dy = screenY - atom.y;
                if (dx * dx + dy * dy < (atom.radius + 16) * (atom.radius + 16)) {
                    atom.isDragged = true;
                    this.draggedAtom = atom;
                    if (window.physicsAudio) {
                        window.physicsAudio.playBondStretchPing();
                    }
                    return atom;
                }
            }
            return null;
        }

        dragMove(screenX, screenY) {
            if (this.draggedAtom) {
                this.draggedAtom.x = screenX;
                this.draggedAtom.y = screenY;
            }
        }

        endDrag() {
            if (this.draggedAtom) {
                this.draggedAtom.isDragged = false;
                this.draggedAtom = null;
                if (window.physicsAudio) {
                    window.physicsAudio.playBondReleaseSnap();
                }
            }
        }

        createSparkBurst(x, y, color = '#00d4ff', count = 10, speed = 180) {
            for (let i = 0; i < count; i++) {
                this.sparks.push(new SimSpark(x, y, color, speed));
            }
        }

        update(dt) {
            dt = Math.min(dt, 0.033); // Clamp dt to prevent step explosion
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            // Pressure chamber contraction bounds
            // High pressure contracts the chamber walls inward, increasing collision rate!
            const pressRatio = Math.min(1.0, Math.log10(Math.max(0.01, this.pressureAtm) / 0.01) / 3.7);
            const chamberInsetX = Math.max(20, (this.width * 0.22) * pressRatio);
            const chamberInsetY = Math.max(66, (this.height * 0.18) * pressRatio);
            const minX = chamberInsetX;
            const maxX = this.width - chamberInsetX;
            const minY = chamberInsetY;
            const maxY = this.height - Math.max(54, (this.height * 0.18) * pressRatio);

            // 1. Hooke / Morse Potential Bond Forces & Bond Dissociation
            for (const bond of this.bonds) {
                if (bond.broken) continue;
                const atomA = this.atoms.find(a => a.id === bond.a);
                const atomB = this.atoms.find(a => a.id === bond.b);
                if (!atomA || !atomB) {
                    bond.broken = true;
                    continue;
                }

                const dx = atomB.x - atomA.x;
                const dy = atomB.y - atomA.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
                const delta = dist - bond.targetLen;
                bond.strain = Math.abs(delta) / bond.targetLen;

                // Angle constraints only maintain geometry with a Hooke spring; they never render or break
                if (bond.isAngleConstraint) {
                    const springForce = delta * (bond.k || 120);
                    const fx = (dx / dist) * springForce;
                    const fy = (dy / dist) * springForce;
                    atomA.applyForce(fx, fy);
                    atomB.applyForce(-fx, -fy);
                    continue;
                }

                // Robust Hooke's Law Covalent Spring Force (AMBER/CHARMM harmonic bond model)
                // Linear restoring force maintains stable molecular geometry and realistic vibrational resonance:
                const springK = bond.k || (bond.De ? bond.De * 85 : 380);
                let forceMag = delta * springK;

                // Yield Strain & Thermal Dissociation Threshold
                // O-H bond energy De is 4.8. Higher temp (>2200K) causes thermal agitation to overcome binding energy.
                const isBeingPulled = atomA.isDragged || atomB.isDragged;
                const thermalBreakChance = Math.max(0, (this.temperatureK - 2200) / 2800);
                const isOverstrained = (isBeingPulled && dist > bond.targetLen * 1.85) || (this.temperatureK > 2200 && dist > bond.targetLen * 2.2);
                const isThermallyDissociated = (this.temperatureK > 2400) && (Math.random() < (thermalBreakChance * 0.08) / (bond.De / 4.0));

                if (isOverstrained || isThermallyDissociated) {
                    bond.broken = true;
                    const midX = (atomA.x + atomB.x) / 2;
                    const midY = (atomA.y + atomB.y) / 2;
                    this.createSparkBurst(midX, midY, '#ef4444', 14, 220);
                    this.logEvent(`💥 Bond snapped: ${atomA.element}-${atomB.element} (Strain: ${(bond.strain * 100).toFixed(0)}%, T: ${this.temperatureK.toFixed(0)}K)`);
                    
                    if (window.physicsAudio) {
                        window.physicsAudio.playBondReleaseSnap();
                    }
                    continue;
                }

                const fx = (dx / dist) * forceMag;
                const fy = (dy / dist) * forceMag;

                atomA.applyForce(fx, fy);
                atomB.applyForce(-fx, -fy);

                // Damping along bond axis
                const relVx = atomB.vx - atomA.vx;
                const relVy = atomB.vy - atomA.vy;
                const dampingMag = (dx * relVx + dy * relVy) / dist * 3.5;
                atomA.applyForce((dx / dist) * dampingMag, (dy / dist) * dampingMag);
                atomB.applyForce(-(dx / dist) * dampingMag, -(dy / dist) * dampingMag);
            }

            // 2. Intermolecular Forces (Repulsion, Coulomb & Reactions)
            this.hBonds = [];
            for (let i = 0; i < this.atoms.length; i++) {
                for (let j = i + 1; j < this.atoms.length; j++) {
                    const a1 = this.atoms[i];
                    const a2 = this.atoms[j];
                    const dx = a2.x - a1.x;
                    const dy = a2.y - a1.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq) || 0.001;

                    // A) Lennard-Jones Non-Bonded Repulsion (Prevents nuclear collapse)
                    const minDist = a1.radius + a2.radius + 4;
                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const repForce = overlap * 700;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        a1.applyForce(-nx * repForce, -ny * repForce);
                        a2.applyForce(nx * repForce, ny * repForce);
                        continue;
                    }

                    // Check if covalently bonded
                    const isCovalentlyBonded = this.bonds.some(b => !b.broken && ((b.a === a1.id && b.b === a2.id) || (b.a === a2.id && b.b === a1.id)));

                    // B) Ionic Coulombic Attraction / Repulsion (e.g. Na+ and Cl-)
                    if (Math.abs(a1.charge) > 0.4 && Math.abs(a2.charge) > 0.4) {
                        const coulombK = 480.0;
                        const qProduct = a1.charge * a2.charge;
                        // Opposite charges attract (-), like charges repel (+)
                        const coulForce = (coulombK * qProduct) / Math.max(30, distSq);
                        const cfx = (dx / dist) * coulForce;
                        const cfy = (dy / dist) * coulForce;
                        a1.applyForce(-cfx, -cfy);
                        a2.applyForce(cfx, cfy);
                    }

                    // C) Dynamic Chemical Reaction & Synthesis (Recombination of Free Radicals)
                    // If both atoms have open valences and collide with sufficient contact energy:
                    if (!isCovalentlyBonded && dist < minDist + 12) {
                        const activeA = this.countActiveBonds(a1.id);
                        const activeB = this.countActiveBonds(a2.id);

                        if (activeA < a1.valence && activeB < a2.valence) {
                            // Check reaction compatibility
                            const newDe = getBondEnergy(a1.element, a2.element, 1);
                            const bondLen = Math.round(minDist * 1.25);
                            this.bonds.push({
                                id: this.nextBondId++,
                                a: a1.id,
                                b: a2.id,
                                targetLen: bondLen,
                                k: 400,
                                order: 1,
                                De: newDe,
                                broken: false,
                                strain: 0
                            });

                            const midX = (a1.x + a2.x) / 2;
                            const midY = (a1.y + a2.y) / 2;
                            this.createSparkBurst(midX, midY, '#00d4ff', 12, 190);
                            this.logEvent(`✨ Reaction synthesis: Formed ${a1.element}-${a2.element} bond!`);

                            if (window.physicsAudio) {
                                window.physicsAudio.playBondStretchPing();
                            }
                        }
                    }
                }
            }

            // 2b. Realistic Single-Donor Hydrogen Bonding
            // In physical chemistry, each polar H atom (charge > +0.15) coordinates to at most ONE closest electronegative partner (O/N/F):
            const hBondStability = Math.max(0, 1.0 - (this.temperatureK - 273) / 250);
            if (hBondStability > 0.05) {
                const polarHydrogens = this.atoms.filter(a => a.element === 'H' && a.charge > 0.15);
                const polarAcceptors = this.atoms.filter(a => (a.element === 'O' || a.element === 'N' || a.element === 'F') && a.charge < -0.2);

                for (const hAtom of polarHydrogens) {
                    let bestAcceptor = null;
                    let bestDist = 95.0;

                    for (const acc of polarAcceptors) {
                        // Exclude same intact molecule
                        const isBonded = this.bonds.some(b => !b.broken && ((b.a === hAtom.id && b.b === acc.id) || (b.a === acc.id && b.b === hAtom.id)));
                        if (isBonded) continue;
                        const shareNeighbor = this.bonds.some(b1 => !b1.broken && (b1.a === hAtom.id || b1.b === hAtom.id) &&
                            this.bonds.some(b2 => !b2.broken && (b2.a === acc.id || b2.b === acc.id) &&
                                ((b1.a === b2.a && b1.a !== hAtom.id) || (b1.a === b2.b && b1.a !== hAtom.id) || (b1.b === b2.a && b1.b !== hAtom.id) || (b1.b === b2.b && b1.b !== hAtom.id))
                            )
                        );
                        if (shareNeighbor) continue;

                        const d = Math.hypot(acc.x - hAtom.x, acc.y - hAtom.y);
                        const minD = hAtom.radius + acc.radius + 4;
                        if (d >= minD && d < bestDist) {
                            bestDist = d;
                            bestAcceptor = acc;
                        }
                    }

                    if (bestAcceptor) {
                        const dx = bestAcceptor.x - hAtom.x;
                        const dy = bestAcceptor.y - hAtom.y;
                        const optHdist = 50;
                        const hDelta = bestDist - optHdist;
                        const hForce = hDelta * 55 * hBondStability;
                        const hfx = (dx / bestDist) * hForce;
                        const hfy = (dy / bestDist) * hForce;
                        hAtom.applyForce(hfx, hfy);
                        bestAcceptor.applyForce(-hfx, -hfy);

                        this.hBonds.push({ a1: hAtom, a2: bestAcceptor, dist: bestDist, strength: hBondStability });
                    }
                }
            }

            // 3. Maxwell-Boltzmann Thermal Agitation (Langevin Kicks)
            // Agitation force scales with sqrt(T / 298K) and inverse square root of atomic mass:
            const tempRatio = Math.sqrt(this.temperatureK / 298.0);
            for (const atom of this.atoms) {
                // Calibrated kick: gentle lifelike vibration at 298K (~1-2px), violent bond-breaking kicks at >2200K
                const kickStrength = tempRatio * Math.sqrt(12.0 / Math.max(1.0, atom.mass)) * 140.0;
                const kx = (Math.random() - 0.5) * kickStrength;
                const ky = (Math.random() - 0.5) * kickStrength;
                atom.applyForce(kx, ky);

                // Very gentle central tether so free particles don't escape viewport infinity
                const cdx = centerX - atom.x;
                const cdy = centerY - atom.y;
                atom.applyForce(cdx * this.centerGravityK, cdy * this.centerGravityK);
            }

            // 4. Numerical Integration & Chamber Boundary Collision
            for (const atom of this.atoms) {
                atom.integrate(dt);

                // Bounce off movable pressure chamber walls
                if (atom.x < minX + atom.radius) {
                    atom.x = minX + atom.radius;
                    atom.vx = Math.abs(atom.vx) * 0.85;
                } else if (atom.x > maxX - atom.radius) {
                    atom.x = maxX - atom.radius;
                    atom.vx = -Math.abs(atom.vx) * 0.85;
                }

                if (atom.y < minY + atom.radius) {
                    atom.y = minY + atom.radius;
                    atom.vy = Math.abs(atom.vy) * 0.85;
                } else if (atom.y > maxY - atom.radius) {
                    atom.y = maxY - atom.radius;
                    atom.vy = -Math.abs(atom.vy) * 0.85;
                }
            }

            // 5. Update Sparks
            for (let i = this.sparks.length - 1; i >= 0; i--) {
                if (!this.sparks[i].update(dt)) {
                    this.sparks.splice(i, 1);
                }
            }
        }

        countActiveBonds(atomId) {
            return this.bonds.filter(b => !b.broken && (b.a === atomId || b.b === atomId)).length;
        }

        render(canvas) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const clientW = Math.max(300, rect.width || canvas.clientWidth || 600);
            const clientH = Math.max(220, rect.height || canvas.clientHeight || 400);
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== Math.round(clientW * dpr) || canvas.height !== Math.round(clientH * dpr)) {
                canvas.width = Math.round(clientW * dpr);
                canvas.height = Math.round(clientH * dpr);
            }

            if (Math.abs(this.width - clientW) > 30 || Math.abs(this.height - clientH) > 30) {
                this.width = clientW;
                this.height = clientH;
            }

            ctx.save();
            ctx.scale(dpr, dpr);

            const w = clientW;
            const h = clientH;

            ctx.clearRect(0, 0, w, h);

            // 1. Temperature-Adaptive Ambient Chamber Glow
            let glowColor = 'rgba(0, 212, 255, 0.05)';
            if (this.temperatureK < 273) {
                glowColor = 'rgba(56, 189, 248, 0.12)'; // Cryo frost
            } else if (this.temperatureK > 2400) {
                glowColor = 'rgba(239, 68, 68, 0.22)'; // High pyrolysis heat
            } else if (this.temperatureK > 1200) {
                glowColor = 'rgba(245, 158, 11, 0.14)'; // Warm incandescent
            }

            const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.55);
            bgGrad.addColorStop(0, glowColor);
            bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // 2. Movable Chamber Walls (Pressure Indication)
            const pressRatio = Math.min(1.0, Math.log10(Math.max(0.01, this.pressureAtm) / 0.01) / 3.7);
            const chamberInsetX = Math.max(20, (this.width * 0.22) * pressRatio);
            const chamberInsetY = Math.max(66, (this.height * 0.18) * pressRatio);
            const minX = chamberInsetX;
            const maxX = this.width - chamberInsetX;
            const minY = chamberInsetY;
            const maxY = this.height - Math.max(54, (this.height * 0.18) * pressRatio);

            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 + pressRatio * 0.35})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            ctx.setLineDash([]);

            // Pressure Piston Border Accent
            if (pressRatio > 0.15) {
                ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
                ctx.fillRect(0, 0, minX, h);
                ctx.fillRect(maxX, 0, w - maxX, h);
                ctx.fillRect(minX, 0, maxX - minX, minY);
                ctx.fillRect(minX, maxY, maxX - minX, h - maxY);
            }

            // 3. Render Intermolecular Hydrogen Bonds (Dotted Glowing Cyan Pulses)
            for (const hb of this.hBonds) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.75)';
                ctx.lineWidth = 2.0;
                ctx.setLineDash([4, 4]);
                ctx.shadowColor = '#00d4ff';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(hb.a1.x, hb.a1.y);
                ctx.lineTo(hb.a2.x, hb.a2.y);
                ctx.stroke();
                ctx.restore();
            }

            // 4. Render Covalent Bonds (3D Glowing Spring Cylinders)
            for (const bond of this.bonds) {
                if (bond.broken || bond.isAngleConstraint) continue;
                const a1 = this.atoms.find(a => a.id === bond.a);
                const a2 = this.atoms.find(a => a.id === bond.b);
                if (!a1 || !a2) continue;

                const dx = a2.x - a1.x;
                const dy = a2.y - a1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const strain = Math.abs(dist - bond.targetLen) / bond.targetLen;

                // Color shifts from calm cyan/white to orange/red as yield strain approaches
                const strokeColor = strain > 0.45 ? '#ef4444' : (strain > 0.22 ? '#f59e0b' : 'rgba(255, 255, 255, 0.65)');
                
                if (bond.order === 2) {
                    // Double bond: draw two parallel lines
                    const perpX = (-dy / dist) * 3.5;
                    const perpY = (dx / dist) * 3.5;
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 3.5;
                    ctx.beginPath();
                    ctx.moveTo(a1.x + perpX, a1.y + perpY);
                    ctx.lineTo(a2.x + perpX, a2.y + perpY);
                    ctx.moveTo(a1.x - perpX, a1.y - perpY);
                    ctx.lineTo(a2.x - perpX, a2.y - perpY);
                    ctx.stroke();
                } else if (bond.order === 3) {
                    // Triple bond: draw three parallel lines
                    const perpX = (-dy / dist) * 4.5;
                    const perpY = (dx / dist) * 4.5;
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 3.0;
                    ctx.beginPath();
                    ctx.moveTo(a1.x, a1.y);
                    ctx.lineTo(a2.x, a2.y);
                    ctx.moveTo(a1.x + perpX, a1.y + perpY);
                    ctx.lineTo(a2.x + perpX, a2.y + perpY);
                    ctx.moveTo(a1.x - perpX, a1.y - perpY);
                    ctx.lineTo(a2.x - perpX, a2.y - perpY);
                    ctx.stroke();
                } else {
                    // Single bond
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 5.0;
                    ctx.beginPath();
                    ctx.moveTo(a1.x, a1.y);
                    ctx.lineTo(a2.x, a2.y);
                    ctx.stroke();

                    // Inner glossy highlight
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.8;
                    ctx.beginPath();
                    ctx.moveTo(a1.x, a1.y);
                    ctx.lineTo(a2.x, a2.y);
                    ctx.stroke();
                }
            }

            // 4b. Render Dynamic Bond Names & Identifiers
            if (this.showBondLabels !== false) {
                // Label Intermolecular Hydrogen Bonds (Dotted Lines)
                let hLabelsDrawn = 0;
                for (const hb of this.hBonds) {
                    if (hLabelsDrawn >= 4) break;
                    const hDist = Math.hypot(hb.a2.x - hb.a1.x, hb.a2.y - hb.a1.y);
                    if (hDist < 42) continue;
                    const mx = (hb.a1.x + hb.a2.x) / 2;
                    const my = (hb.a1.y + hb.a2.y) / 2;
                    const otherElement = (hb.a1.element === 'H') ? hb.a2.element : hb.a1.element;
                    const label = 'H\u00B7\u00B7\u00B7' + otherElement + ' H-Bond';
                    hLabelsDrawn++;

                    ctx.save();
                    ctx.font = 'bold 8.5px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const tw = ctx.measureText(label).width;

                    ctx.fillStyle = 'rgba(6, 20, 38, 0.90)';
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    ctx.roundRect(mx - tw / 2 - 4, my - 6.5, tw + 8, 13, 3);
                    ctx.fill();
                    ctx.stroke();

                    ctx.setLineDash([]);
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillText(label, mx, my);
                    ctx.restore();
                }

                // Label Covalent Bonds
                for (const bond of this.bonds) {
                    if (bond.broken || bond.isAngleConstraint) continue;
                    const a1 = this.atoms.find(a => a.id === bond.a);
                    const a2 = this.atoms.find(a => a.id === bond.b);
                    if (!a1 || !a2) continue;

                    const dx = a2.x - a1.x;
                    const dy = a2.y - a1.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 34) continue;

                    const mx = (a1.x + a2.x) / 2;
                    const my = (a1.y + a2.y) / 2;
                    const strain = Math.abs(dist - bond.targetLen) / bond.targetLen;

                    const glue = bond.order === 3 ? '\u2261' : (bond.order === 2 ? '=' : '-');
                    let label = `${a1.element}${glue}${a2.element}`;
                    const isStrained = strain > 0.45;
                    const isModerate = strain > 0.22 && !isStrained;

                    if (isStrained) {
                        label += ` Strained ${(strain * 100).toFixed(0)}%`;
                    } else if (bond.order === 2) {
                        label += ` Double`;
                    } else if (bond.order === 3) {
                        label += ` Triple`;
                    } else {
                        label += ` Covalent`;
                    }

                    ctx.save();
                    ctx.font = 'bold 8.5px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const tw = ctx.measureText(label).width;

                    if (isStrained) {
                        ctx.fillStyle = 'rgba(55, 10, 15, 0.92)';
                        ctx.strokeStyle = '#ef4444';
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 4;
                    } else if (isModerate) {
                        ctx.fillStyle = 'rgba(45, 25, 8, 0.90)';
                        ctx.strokeStyle = '#f59e0b';
                    } else {
                        ctx.fillStyle = 'rgba(10, 16, 30, 0.88)';
                        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
                    }

                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(mx - tw / 2 - 4, my - 6.5, tw + 8, 13, 3);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = isStrained ? '#fca5a5' : (isModerate ? '#fcd34d' : '#f1f5f9');
                    ctx.shadowBlur = 0;
                    ctx.fillText(label, mx, my);
                    ctx.restore();
                }
            }

            // 5. Render Chemical Reaction & Rupture Sparks
            for (const spark of this.sparks) {
                spark.render(ctx);
            }

            // 6. Render Atoms (CPK 3D Sphere Spheres with Partial Charges)
            for (const atom of this.atoms) {
                const r = Math.max(16, atom.radius * 1.15);
                const grad = ctx.createRadialGradient(
                    atom.x - r * 0.35, atom.y - r * 0.35, r * 0.1,
                    atom.x, atom.y, r
                );
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, atom.color);
                grad.addColorStop(1, '#090d16');

                ctx.shadowColor = atom.color;
                ctx.shadowBlur = atom.isDragged ? 24 : 10;
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // Partial Charge Badge (δ⁺ / δ⁻)
                if (Math.abs(atom.charge) > 0.1) {
                    const sign = atom.charge > 0 ? '+' : '-';
                    ctx.fillStyle = atom.charge > 0 ? '#38bdf8' : '#f87171';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`δ${sign}`, atom.x + r * 0.65, atom.y - r * 0.65);
                }

                // Chemical Symbol
                ctx.fillStyle = atom.element === 'H' ? '#0f172a' : '#ffffff';
                ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(atom.element, atom.x, atom.y);
            }

            // 7. Dynamic Status Sync to Narrator Pill (Zero Canvas HUD Overlap)
            const narratorMsg = document.getElementById('sim-narrator-msg');
            if (narratorMsg && window.simPlaybackController && window.simPlaybackController.activeTab === 'molecule') {
                const preset = MOLECULE_PRESETS[this.currentKey] || MOLECULE_PRESETS['H2O'];
                let phaseDesc = 'Liquid Fluid';
                if (this.temperatureK < 273) {
                    phaseDesc = 'Solid Ice';
                } else if (this.temperatureK > 2400) {
                    phaseDesc = 'Pyrolysis Plasma';
                } else if (this.temperatureK > 373) {
                    phaseDesc = 'Vapor / Gas';
                }

                const activeBondsCount = this.bonds.filter(b => !b.broken).length;
                if (this.recentEvents.length > 0) {
                    narratorMsg.textContent = `${preset.name.split('(')[0].trim()} · ${phaseDesc} · ${this.recentEvents[0]}`;
                } else {
                    narratorMsg.textContent = `${preset.name.split('(')[0].trim()} · ${phaseDesc} (${activeBondsCount} bonds) · Drag atoms to strain & snap bonds`;
                }
            }

            ctx.restore();
        }
    }

    // Attach to Global Scope
    window.MolecularDynamicsEngine = MolecularDynamicsEngine;
    window.MOLECULE_PRESETS = MOLECULE_PRESETS;
    window.ELEMENT_META = ELEMENT_META;
    window.molecularDynamicsEngine = new MolecularDynamicsEngine();

})();
