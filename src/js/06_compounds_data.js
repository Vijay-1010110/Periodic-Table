/**
 * 06_compounds_data.js
 * Comprehensive chemical compounds database with 3D atomic coordinates,
 * element mass breakdowns, physical properties, and classification.
 */

const CPK_COLORS = {
    1: '#ffffff',   // H: White
    6: '#909090',   // C: Dark Gray
    7: '#3050f8',   // N: Blue
    8: '#ff0d0d',   // O: Red
    9: '#90e050',   // F: Green
    11: '#ab5cf2',  // Na: Purple
    12: '#8aff00',  // Mg: Light Green
    13: '#ffa0a0',  // Al: Pink
    14: '#f0c8a0',  // Si: Tan
    15: '#ff8000',  // P: Orange
    16: '#ffff30',  // S: Yellow
    17: '#1ff01f',  // Cl: Green
    19: '#8f40d4',  // K: Deep Purple
    20: '#3dff00',  // Ca: Lime
    26: '#e06633',  // Fe: Rust
    29: '#c88033',  // Cu: Copper
    30: '#7d80b0',  // Zn: Slate
    35: '#a62929',  // Br: Dark Red
    53: '#940094'   // I: Violet
};

const compoundsData = [
    {
        id: 'water',
        name: 'Water',
        formula: 'H₂O',
        iupacName: 'Oxidane',
        type: 'Covalent',
        state: 'Liquid',
        molarMass: 18.015,
        density: '0.998 g/cm³',
        meltingPoint: '0 °C',
        boilingPoint: '100 °C',
        description: 'The universal solvent essential for all known forms of life. Displays unique hydrogen bonding properties.',
        elements: [
            { atomicNumber: 1, symbol: 'H', count: 2, massPercent: 11.19 },
            { atomicNumber: 8, symbol: 'O', count: 1, massPercent: 88.81 }
        ],
        atoms: [
            { elem: 8, symbol: 'O', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 1, symbol: 'H', x: 0.76, y: 0.59, z: 0.0 },
            { elem: 1, symbol: 'H', x: -0.76, y: 0.59, z: 0.0 }
        ]
    },
    {
        id: 'carbon-dioxide',
        name: 'Carbon Dioxide',
        formula: 'CO₂',
        iupacName: 'Carbon Dioxide',
        type: 'Oxide',
        state: 'Gas',
        molarMass: 44.009,
        density: '1.98 kg/m³',
        meltingPoint: '-78.5 °C (Sublimes)',
        boilingPoint: '-78.5 °C',
        description: 'A linear greenhouse gas crucial for plant photosynthesis and carbon cycle regulations.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 1, massPercent: 27.29 },
            { atomicNumber: 8, symbol: 'O', count: 2, massPercent: 72.71 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: -1.16, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.16, y: 0.0, z: 0.0 }
        ]
    },
    {
        id: 'methane',
        name: 'Methane',
        formula: 'CH₄',
        iupacName: 'Methane',
        type: 'Organic',
        state: 'Gas',
        molarMass: 16.043,
        density: '0.657 kg/m³',
        meltingPoint: '-182.5 °C',
        boilingPoint: '-161.5 °C',
        description: 'The simplest alkane and primary component of natural gas. Tetrahedral molecular geometry.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 1, massPercent: 74.87 },
            { atomicNumber: 1, symbol: 'H', count: 4, massPercent: 25.13 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 1, symbol: 'H', x: 0.63, y: 0.63, z: 0.63 },
            { elem: 1, symbol: 'H', x: -0.63, y: -0.63, z: 0.63 },
            { elem: 1, symbol: 'H', x: -0.63, y: 0.63, z: -0.63 },
            { elem: 1, symbol: 'H', x: 0.63, y: -0.63, z: -0.63 }
        ]
    },
    {
        id: 'ammonia',
        name: 'Ammonia',
        formula: 'NH₃',
        iupacName: 'Azane',
        type: 'Base',
        state: 'Gas',
        molarMass: 17.031,
        density: '0.73 kg/m³',
        meltingPoint: '-77.7 °C',
        boilingPoint: '-33.3 °C',
        description: 'Trigonal pyramidal gas with a pungent odor. Fundamental building block for fertilizers.',
        elements: [
            { atomicNumber: 7, symbol: 'N', count: 1, massPercent: 82.24 },
            { atomicNumber: 1, symbol: 'H', count: 3, massPercent: 17.76 }
        ],
        atoms: [
            { elem: 7, symbol: 'N', x: 0.0, y: 0.0, z: 0.12 },
            { elem: 1, symbol: 'H', x: 0.0, y: 0.94, z: -0.27 },
            { elem: 1, symbol: 'H', x: 0.81, y: -0.47, z: -0.27 },
            { elem: 1, symbol: 'H', x: -0.81, y: -0.47, z: -0.27 }
        ]
    },
    {
        id: 'sodium-chloride',
        name: 'Sodium Chloride (Table Salt)',
        formula: 'NaCl',
        iupacName: 'Sodium Chloride',
        type: 'Ionic',
        state: 'Solid',
        molarMass: 58.443,
        density: '2.16 g/cm³',
        meltingPoint: '801 °C',
        boilingPoint: '1465 °C',
        description: 'Ionic crystal lattice formed by Na+ and Cl- ions. Essential dietary electrolyte.',
        elements: [
            { atomicNumber: 11, symbol: 'Na', count: 1, massPercent: 39.34 },
            { atomicNumber: 17, symbol: 'Cl', count: 1, massPercent: 60.66 }
        ],
        atoms: [
            { elem: 11, symbol: 'Na', x: -0.8, y: 0.0, z: 0.0 },
            { elem: 17, symbol: 'Cl', x: 0.8, y: 0.0, z: 0.0 }
        ]
    },
    {
        id: 'sulfuric-acid',
        name: 'Sulfuric Acid',
        formula: 'H₂SO₄',
        iupacName: 'Sulfuric Acid',
        type: 'Acid',
        state: 'Liquid',
        molarMass: 98.079,
        density: '1.83 g/cm³',
        meltingPoint: '10.3 °C',
        boilingPoint: '337 °C',
        description: 'A highly corrosive diprotic mineral acid widely used in industrial chemical synthesis.',
        elements: [
            { atomicNumber: 1, symbol: 'H', count: 2, massPercent: 2.06 },
            { atomicNumber: 16, symbol: 'S', count: 1, massPercent: 32.69 },
            { atomicNumber: 8, symbol: 'O', count: 4, massPercent: 65.25 }
        ],
        atoms: [
            { elem: 16, symbol: 'S', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.0, y: 1.2, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.0, y: -1.2, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.1, y: 0.0, z: 0.6 },
            { elem: 8, symbol: 'O', x: -1.1, y: 0.0, z: 0.6 },
            { elem: 1, symbol: 'H', x: 1.6, y: 0.0, z: 1.1 },
            { elem: 1, symbol: 'H', x: -1.6, y: 0.0, z: 1.1 }
        ]
    },
    {
        id: 'ethanol',
        name: 'Ethanol',
        formula: 'C₂H₅OH',
        iupacName: 'Ethanol',
        type: 'Organic',
        state: 'Liquid',
        molarMass: 46.069,
        density: '0.789 g/cm³',
        meltingPoint: '-114.1 °C',
        boilingPoint: '78.37 °C',
        description: 'A volatile organic alcohol used as a solvent, biofuel, and in alcoholic beverages.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 2, massPercent: 52.14 },
            { atomicNumber: 1, symbol: 'H', count: 6, massPercent: 13.13 },
            { atomicNumber: 8, symbol: 'O', count: 1, massPercent: 34.73 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: -0.75, y: -0.2, z: 0.0 },
            { elem: 6, symbol: 'C', x: 0.55, y: 0.5, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.65, y: -0.35, z: 0.0 },
            { elem: 1, symbol: 'H', x: 2.45, y: 0.15, z: 0.0 },
            { elem: 1, symbol: 'H', x: -0.75, y: -0.8, z: 0.9 },
            { elem: 1, symbol: 'H', x: -0.75, y: -0.8, z: -0.9 },
            { elem: 1, symbol: 'H', x: -1.6, y: 0.5, z: 0.0 },
            { elem: 1, symbol: 'H', x: 0.55, y: 1.1, z: 0.9 },
            { elem: 1, symbol: 'H', x: 0.55, y: 1.1, z: -0.9 }
        ]
    },
    {
        id: 'glucose',
        name: 'Glucose',
        formula: 'C₆H₁₂O₆',
        iupacName: 'D-Glucose',
        type: 'Organic',
        state: 'Solid',
        molarMass: 180.156,
        density: '1.54 g/cm³',
        meltingPoint: '146 °C',
        boilingPoint: 'Decomposes',
        description: 'Primary monosaccharide energy source for cellular respiration in living organisms.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 6, massPercent: 40.00 },
            { atomicNumber: 1, symbol: 'H', count: 12, massPercent: 6.71 },
            { atomicNumber: 8, symbol: 'O', count: 6, massPercent: 53.29 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: 0.0, y: 1.2, z: 0.0 },
            { elem: 6, symbol: 'C', x: 1.1, y: 0.4, z: 0.0 },
            { elem: 6, symbol: 'C', x: 0.8, y: -1.0, z: 0.0 },
            { elem: 6, symbol: 'C', x: -0.6, y: -1.2, z: 0.0 },
            { elem: 6, symbol: 'C', x: -1.2, y: 0.1, z: 0.0 },
            { elem: 8, symbol: 'O', x: -0.5, y: 1.3, z: 0.6 },
            { elem: 8, symbol: 'O', x: 2.3, y: 0.8, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.7, y: -1.8, z: 0.0 },
            { elem: 8, symbol: 'O', x: -1.2, y: -2.3, z: 0.0 },
            { elem: 8, symbol: 'O', x: -2.5, y: 0.2, z: 0.0 },
            { elem: 1, symbol: 'H', x: 0.2, y: 2.2, z: 0.0 },
            { elem: 1, symbol: 'H', x: 1.1, y: 0.4, z: -1.0 },
            { elem: 1, symbol: 'H', x: 0.8, y: -1.0, z: -1.0 },
            { elem: 1, symbol: 'H', x: -0.6, y: -1.2, z: -1.0 },
            { elem: 1, symbol: 'H', x: -1.2, y: 0.1, z: -1.0 }
        ]
    },
    {
        id: 'caffeine',
        name: 'Caffeine',
        formula: 'C₈H₁₀N₄O₂',
        iupacName: '1,3,7-Trimethylxanthine',
        type: 'Organic',
        state: 'Solid',
        molarMass: 194.19,
        density: '1.23 g/cm³',
        meltingPoint: '235 °C',
        boilingPoint: '178 °C (Sublimes)',
        description: 'A central nervous system stimulant of the methylxanthine class found in coffee and tea.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 8, massPercent: 49.48 },
            { atomicNumber: 1, symbol: 'H', count: 10, massPercent: 5.19 },
            { atomicNumber: 7, symbol: 'N', count: 4, massPercent: 28.85 },
            { atomicNumber: 8, symbol: 'O', count: 2, massPercent: 16.48 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: 0.0, y: 1.2, z: 0.0 },
            { elem: 7, symbol: 'N', x: 1.1, y: 0.5, z: 0.0 },
            { elem: 6, symbol: 'C', x: 1.0, y: -0.8, z: 0.0 },
            { elem: 6, symbol: 'C', x: -0.3, y: -1.3, z: 0.0 },
            { elem: 7, symbol: 'N', x: -1.3, y: -0.4, z: 0.0 },
            { elem: 6, symbol: 'C', x: -1.2, y: 0.9, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.1, y: 2.4, z: 0.0 },
            { elem: 8, symbol: 'O', x: -2.1, y: 1.7, z: 0.0 },
            { elem: 7, symbol: 'N', x: 2.1, y: -1.5, z: 0.0 },
            { elem: 6, symbol: 'C', x: 1.7, y: -2.7, z: 0.0 },
            { elem: 7, symbol: 'N', x: 0.3, y: -2.6, z: 0.0 }
        ]
    },
    {
        id: 'hydrochloric-acid',
        name: 'Hydrochloric Acid',
        formula: 'HCl',
        iupacName: 'Chlorane',
        type: 'Acid',
        state: 'Liquid',
        molarMass: 36.46,
        density: '1.19 g/cm³',
        meltingPoint: '-30 °C',
        boilingPoint: '108.5 °C',
        description: 'Strong monoprotic mineral acid that is the main component of gastric acid in the stomach.',
        elements: [
            { atomicNumber: 1, symbol: 'H', count: 1, massPercent: 2.77 },
            { atomicNumber: 17, symbol: 'Cl', count: 1, massPercent: 97.23 }
        ],
        atoms: [
            { elem: 17, symbol: 'Cl', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 1, symbol: 'H', x: 1.27, y: 0.0, z: 0.0 }
        ]
    },
    {
        id: 'sodium-hydroxide',
        name: 'Sodium Hydroxide (Caustic Soda)',
        formula: 'NaOH',
        iupacName: 'Sodium Oxidanide',
        type: 'Base',
        state: 'Solid',
        molarMass: 39.997,
        density: '2.13 g/cm³',
        meltingPoint: '318 °C',
        boilingPoint: '1388 °C',
        description: 'Strong metallic base and alkali salt used in soap making and chemical processing.',
        elements: [
            { atomicNumber: 11, symbol: 'Na', count: 1, massPercent: 57.48 },
            { atomicNumber: 8, symbol: 'O', count: 1, massPercent: 40.00 },
            { atomicNumber: 1, symbol: 'H', count: 1, massPercent: 2.52 }
        ],
        atoms: [
            { elem: 11, symbol: 'Na', x: -1.2, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.6, y: 0.0, z: 0.0 },
            { elem: 1, symbol: 'H', x: 1.5, y: 0.0, z: 0.0 }
        ]
    },
    {
        id: 'hydrogen-peroxide',
        name: 'Hydrogen Peroxide',
        formula: 'H₂O₂',
        iupacName: 'Dioxidane',
        type: 'Covalent',
        state: 'Liquid',
        molarMass: 34.015,
        density: '1.45 g/cm³',
        meltingPoint: '-0.43 °C',
        boilingPoint: '150.2 °C',
        description: 'Powerful oxidizer with a non-planar skew molecular geometry. Used as a disinfectant.',
        elements: [
            { atomicNumber: 1, symbol: 'H', count: 2, massPercent: 5.93 },
            { atomicNumber: 8, symbol: 'O', count: 2, massPercent: 94.07 }
        ],
        atoms: [
            { elem: 8, symbol: 'O', x: -0.7, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.7, y: 0.0, z: 0.0 },
            { elem: 1, symbol: 'H', x: -1.1, y: 0.8, z: 0.4 },
            { elem: 1, symbol: 'H', x: 1.1, y: -0.8, z: 0.4 }
        ]
    },
    {
        id: 'calcium-carbonate',
        name: 'Calcium Carbonate',
        formula: 'CaCO₃',
        iupacName: 'Calcium Carbonate',
        type: 'Ionic',
        state: 'Solid',
        molarMass: 100.086,
        density: '2.71 g/cm³',
        meltingPoint: '1339 °C',
        boilingPoint: 'Decomposes',
        description: 'Found in rocks as minerals calcite and aragonite, and primary component of eggshells and sea shells.',
        elements: [
            { atomicNumber: 20, symbol: 'Ca', count: 1, massPercent: 40.04 },
            { atomicNumber: 6, symbol: 'C', count: 1, massPercent: 12.00 },
            { atomicNumber: 8, symbol: 'O', count: 3, massPercent: 47.96 }
        ],
        atoms: [
            { elem: 20, symbol: 'Ca', x: -1.5, y: 0.0, z: 0.0 },
            { elem: 6, symbol: 'C', x: 0.8, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.9, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.3, y: 1.1, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.3, y: -1.1, z: 0.0 }
        ]
    },
    {
        id: 'nitric-acid',
        name: 'Nitric Acid',
        formula: 'HNO₃',
        iupacName: 'Nitric Acid',
        type: 'Acid',
        state: 'Liquid',
        molarMass: 63.01,
        density: '1.51 g/cm³',
        meltingPoint: '-42 °C',
        boilingPoint: '83 °C',
        description: 'Highly corrosive mineral acid used in the production of fertilizers and explosives.',
        elements: [
            { atomicNumber: 1, symbol: 'H', count: 1, massPercent: 1.60 },
            { atomicNumber: 7, symbol: 'N', count: 1, massPercent: 22.23 },
            { atomicNumber: 8, symbol: 'O', count: 3, massPercent: 76.17 }
        ],
        atoms: [
            { elem: 7, symbol: 'N', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.0, y: 1.2, z: 0.0 },
            { elem: 8, symbol: 'O', x: 1.1, y: -0.6, z: 0.0 },
            { elem: 8, symbol: 'O', x: -1.1, y: -0.6, z: 0.0 },
            { elem: 1, symbol: 'H', x: 1.8, y: -0.1, z: 0.0 }
        ]
    },
    {
        id: 'acetone',
        name: 'Acetone',
        formula: 'C₃H₆O',
        iupacName: 'Propan-2-one',
        type: 'Organic',
        state: 'Liquid',
        molarMass: 58.08,
        density: '0.784 g/cm³',
        meltingPoint: '-94.7 °C',
        boilingPoint: '56.05 °C',
        description: 'Simplest ketone, colorless, volatile, flammable organic solvent.',
        elements: [
            { atomicNumber: 6, symbol: 'C', count: 3, massPercent: 62.04 },
            { atomicNumber: 1, symbol: 'H', count: 6, massPercent: 10.41 },
            { atomicNumber: 8, symbol: 'O', count: 1, massPercent: 27.55 }
        ],
        atoms: [
            { elem: 6, symbol: 'C', x: 0.0, y: 0.0, z: 0.0 },
            { elem: 8, symbol: 'O', x: 0.0, y: 1.2, z: 0.0 },
            { elem: 6, symbol: 'C', x: 1.2, y: -0.7, z: 0.0 },
            { elem: 6, symbol: 'C', x: -1.2, y: -0.7, z: 0.0 },
            { elem: 1, symbol: 'H', x: 1.2, y: -1.3, z: 0.9 },
            { elem: 1, symbol: 'H', x: 1.2, y: -1.3, z: -0.9 },
            { elem: 1, symbol: 'H', x: 2.0, y: -0.1, z: 0.0 },
            { elem: 1, symbol: 'H', x: -1.2, y: -1.3, z: 0.9 },
            { elem: 1, symbol: 'H', x: -1.2, y: -1.3, z: -0.9 },
            { elem: 1, symbol: 'H', x: -2.0, y: -0.1, z: 0.0 }
        ]
    }
];
