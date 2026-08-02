/**
 * 09_crystals_data.js
 * Database of 3D Crystal Systems, Unit Cell Coordinates, and Solid-State Physics Parameters
 */

const crystalSystemsData = [
    {
        id: 'fcc',
        name: 'Face-Centered Cubic (FCC)',
        system: 'Cubic',
        packingEfficiency: '74%',
        coordinationNumber: 12,
        examples: 'Copper (Cu), Gold (Au), Aluminium (Al), Lead (Pb), Silver (Ag)',
        description: 'Close-packed cubic structure with atoms at each cube corner and at the center of each face. Maximum atomic packing efficiency.',
        unitCellAtoms: [
            // Corners (8 corners)
            { elem: 'Cu', x: 0, y: 0, z: 0 },
            { elem: 'Cu', x: 1, y: 0, z: 0 },
            { elem: 'Cu', x: 0, y: 1, z: 0 },
            { elem: 'Cu', x: 1, y: 1, z: 0 },
            { elem: 'Cu', x: 0, y: 0, z: 1 },
            { elem: 'Cu', x: 1, y: 0, z: 1 },
            { elem: 'Cu', x: 0, y: 1, z: 1 },
            { elem: 'Cu', x: 1, y: 1, z: 1 },
            // Face centers (6 faces)
            { elem: 'Cu', x: 0.5, y: 0.5, z: 0 },
            { elem: 'Cu', x: 0.5, y: 0.5, z: 1 },
            { elem: 'Cu', x: 0.5, y: 0, z: 0.5 },
            { elem: 'Cu', x: 0.5, y: 1, z: 0.5 },
            { elem: 'Cu', x: 0, y: 0.5, z: 0.5 },
            { elem: 'Cu', x: 1, y: 0.5, z: 0.5 }
        ],
        millerPlanes: {
            '100': [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }],
            '110': [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 1 }],
            '111': [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }]
        }
    },
    {
        id: 'bcc',
        name: 'Body-Centered Cubic (BCC)',
        system: 'Cubic',
        packingEfficiency: '68%',
        coordinationNumber: 8,
        examples: 'Iron (α-Fe), Chromium (Cr), Sodium (Na), Tungsten (W)',
        description: 'Cubic structure with atoms at each cube corner and a single atom at the center of the unit cell.',
        unitCellAtoms: [
            // Corners
            { elem: 'Fe', x: 0, y: 0, z: 0 },
            { elem: 'Fe', x: 1, y: 0, z: 0 },
            { elem: 'Fe', x: 0, y: 1, z: 0 },
            { elem: 'Fe', x: 1, y: 1, z: 0 },
            { elem: 'Fe', x: 0, y: 0, z: 1 },
            { elem: 'Fe', x: 1, y: 0, z: 1 },
            { elem: 'Fe', x: 0, y: 1, z: 1 },
            { elem: 'Fe', x: 1, y: 1, z: 1 },
            // Body center
            { elem: 'Fe', x: 0.5, y: 0.5, z: 0.5 }
        ],
        millerPlanes: {
            '100': [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }],
            '110': [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 0, y: 0, z: 1 }],
            '111': [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }]
        }
    },
    {
        id: 'hcp',
        name: 'Hexagonal Close-Packed (HCP)',
        system: 'Hexagonal',
        packingEfficiency: '74%',
        coordinationNumber: 12,
        examples: 'Magnesium (Mg), Zinc (Zn), Titanium (Ti), Cobalt (Co)',
        description: 'Hexagonal arrangement of close-packed atomic planes (ABAB stacking sequence).',
        unitCellAtoms: [
            // Top & Bottom Hexagon centers & corners
            { elem: 'Mg', x: 0, y: 0, z: 0 },
            { elem: 'Mg', x: 1, y: 0, z: 0 },
            { elem: 'Mg', x: 0.5, y: 0.866, z: 0 },
            { elem: 'Mg', x: -0.5, y: 0.866, z: 0 },
            { elem: 'Mg', x: -1, y: 0, z: 0 },
            { elem: 'Mg', x: -0.5, y: -0.866, z: 0 },
            { elem: 'Mg', x: 0.5, y: -0.866, z: 0 },

            { elem: 'Mg', x: 0, y: 0, z: 1.63 },
            { elem: 'Mg', x: 1, y: 0, z: 1.63 },
            { elem: 'Mg', x: 0.5, y: 0.866, z: 1.63 },
            { elem: 'Mg', x: -0.5, y: 0.866, z: 1.63 },
            { elem: 'Mg', x: -1, y: 0, z: 1.63 },
            { elem: 'Mg', x: -0.5, y: -0.866, z: 1.63 },
            { elem: 'Mg', x: 0.5, y: -0.866, z: 1.63 },

            // Middle Layer (B layer)
            { elem: 'Mg', x: 0.333, y: 0.288, z: 0.815 },
            { elem: 'Mg', x: -0.333, y: 0.288, z: 0.815 },
            { elem: 'Mg', x: 0, y: -0.577, z: 0.815 }
        ],
        millerPlanes: {
            '0001': [{ x: -1, y: 0, z: 1.63 }, { x: 1, y: 0, z: 1.63 }, { x: 0.5, y: 0.866, z: 1.63 }, { x: -0.5, y: 0.866, z: 1.63 }]
        }
    },
    {
        id: 'diamond-cubic',
        name: 'Diamond Cubic Structure',
        system: 'Cubic',
        packingEfficiency: '34%',
        coordinationNumber: 4,
        examples: 'Diamond (C), Silicon (Si), Germanium (Ge), Gray Tin (α-Sn)',
        description: 'FCC lattice with half of the tetrahedral interstitial sites filled by additional atoms. Tetrahedral covalent bonding network.',
        unitCellAtoms: [
            // Standard FCC atoms
            { elem: 'C', x: 0, y: 0, z: 0 }, { elem: 'C', x: 1, y: 0, z: 0 }, { elem: 'C', x: 0, y: 1, z: 0 }, { elem: 'C', x: 1, y: 1, z: 0 },
            { elem: 'C', x: 0, y: 0, z: 1 }, { elem: 'C', x: 1, y: 0, z: 1 }, { elem: 'C', x: 0, y: 1, z: 1 }, { elem: 'C', x: 1, y: 1, z: 1 },
            { elem: 'C', x: 0.5, y: 0.5, z: 0 }, { elem: 'C', x: 0.5, y: 0.5, z: 1 }, { elem: 'C', x: 0.5, y: 0, z: 0.5 },
            { elem: 'C', x: 0.5, y: 1, z: 0.5 }, { elem: 'C', x: 0, y: 0.5, z: 0.5 }, { elem: 'C', x: 1, y: 0.5, z: 0.5 },
            // Interior Tetrahedral positions
            { elem: 'C', x: 0.25, y: 0.25, z: 0.25 },
            { elem: 'C', x: 0.75, y: 0.75, z: 0.25 },
            { elem: 'C', x: 0.75, y: 0.25, z: 0.75 },
            { elem: 'C', x: 0.25, y: 0.75, z: 0.75 }
        ],
        millerPlanes: {
            '100': [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }],
            '111': [{ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 }]
        }
    },
    {
        id: 'nacl-rock-salt',
        name: 'Rock Salt Lattice (NaCl)',
        system: 'Cubic (Interpenetrating FCC)',
        packingEfficiency: '67%',
        coordinationNumber: 6,
        examples: 'Sodium Chloride (NaCl), Magnesium Oxide (MgO), Potassium Chloride (KCl)',
        description: 'Interpenetrating Face-Centered Cubic lattices of Na+ cations and Cl- anions with octahedral coordination.',
        unitCellAtoms: [
            // Na+ cations (Face centers & origin)
            { elem: 'Na', x: 0, y: 0, z: 0 },
            { elem: 'Na', x: 0.5, y: 0.5, z: 0 }, { elem: 'Na', x: 0.5, y: 0, z: 0.5 }, { elem: 'Na', x: 0, y: 0.5, z: 0.5 },
            { elem: 'Na', x: 1, y: 1, z: 0 }, { elem: 'Na', x: 1, y: 0, z: 0.5 }, { elem: 'Na', x: 0, y: 1, z: 0.5 },
            // Cl- anions (Edge centers & body center)
            { elem: 'Cl', x: 0.5, y: 0, z: 0 }, { elem: 'Cl', x: 0, y: 0.5, z: 0 }, { elem: 'Cl', x: 0, y: 0, z: 0.5 },
            { elem: 'Cl', x: 0.5, y: 0.5, z: 0.5 },
            { elem: 'Cl', x: 1, y: 0.5, z: 0 }, { elem: 'Cl', x: 1, y: 0, z: 0 }, { elem: 'Cl', x: 0.5, y: 1, z: 0 }
        ],
        millerPlanes: {
            '100': [{ x: 1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 }, { x: 1, y: 0, z: 1 }]
        }
    },
    {
        id: 'graphite',
        name: 'Graphite Layered Structure',
        system: 'Hexagonal (Layered)',
        packingEfficiency: '59%',
        coordinationNumber: 3,
        examples: 'Graphite (Carbon allotrope)',
        description: 'Parallel planar sheets of sp² hybridized carbon atoms in hexagonal rings, bound together by weak van der Waals forces.',
        unitCellAtoms: [
            // Layer 1 (z = 0)
            { elem: 'C', x: 0, y: 0, z: 0 }, { elem: 'C', x: 0.5, y: 0.866, z: 0 }, { elem: 'C', x: -0.5, y: 0.866, z: 0 },
            { elem: 'C', x: -1, y: 0, z: 0 }, { elem: 'C', x: -0.5, y: -0.866, z: 0 }, { elem: 'C', x: 0.5, y: -0.866, z: 0 },
            // Layer 2 (z = 1.2, offset)
            { elem: 'C', x: 0.333, y: 0.288, z: 1.2 }, { elem: 'C', x: 0.833, y: 1.154, z: 1.2 }, { elem: 'C', x: -0.167, y: 1.154, z: 1.2 },
            { elem: 'C', x: -0.667, y: 0.288, z: 1.2 }, { elem: 'C', x: -0.167, y: -0.578, z: 1.2 }, { elem: 'C', x: 0.833, y: -0.578, z: 1.2 }
        ],
        millerPlanes: {
            '0001': [{ x: -1, y: 0, z: 1.2 }, { x: 1, y: 0, z: 1.2 }, { x: 0.5, y: 0.866, z: 1.2 }, { x: -0.5, y: 0.866, z: 1.2 }]
        }
    }
];
