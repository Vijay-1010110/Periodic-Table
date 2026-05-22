const elementsData = [
    {
        atomicNumber: 1,
        symbol: 'H',
        name: 'Hydrogen',
        atomicMass: 1.008,
        category: 'Reactive nonmetal',
        block: 's',
        period: 1,
        group: 1,
        electronConfiguration: '1s1',
        electronConfigurationNoble: '1s1',
        meltingPoint: 13.99,
        boilingPoint: 20.271,
        density: 0.00008988,
        electronegativity: 2.20,
        ionizationEnergies: [1312],
        discoveryYear: 1766,
        discoveredBy: 'Henry Cavendish',
        appearance: 'colorless gas',
        phase: 'Gas',
        facts: [
            'Most abundant element in the universe.',
            'Lightest element.',
            'Only element without neutrons (in its most common isotope).'
        ]
    },
    {
        atomicNumber: 2,
        symbol: 'He',
        name: 'Helium',
        atomicMass: 4.0026,
        category: 'Noble gas',
        block: 's',
        period: 1,
        group: 18,
        electronConfiguration: '1s2',
        electronConfigurationNoble: '1s2',
        meltingPoint: 0.95, // At 2.5 MPa
        boilingPoint: 4.22,
        density: 0.0001786,
        electronegativity: null,
        ionizationEnergies: [2372.3, 5250.5],
        discoveryYear: 1868,
        discoveredBy: 'Pierre Janssen and Norman Lockyer',
        appearance: 'colorless gas, exhibiting a red-orange glow when placed in an electric field',
        phase: 'Gas',
        facts: [
            'Second most abundant element in the universe.',
            'Discovered in the solar spectrum before being found on Earth.',
            'Has the lowest boiling point of all elements.'
        ]
    },
    {
        atomicNumber: 3,
        symbol: 'Li',
        name: 'Lithium',
        atomicMass: 6.94,
        category: 'Alkali metal',
        block: 's',
        period: 2,
        group: 1,
        electronConfiguration: '[He] 2s1',
        electronConfigurationNoble: '[He] 2s1',
        meltingPoint: 453.65,
        boilingPoint: 1603,
        density: 0.534,
        electronegativity: 0.98,
        ionizationEnergies: [520.2],
        discoveryYear: 1817,
        discoveredBy: 'Johan August Arfwedson',
        appearance: 'silvery-white',
        phase: 'Solid',
        facts: [
            'Lightest solid element.',
            'Floats on water and oil.',
            'Used in rechargeable batteries and psychiatric medication.'
        ]
    },
    {
        atomicNumber: 4,
        symbol: 'Be',
        name: 'Beryllium',
        atomicMass: 9.0122,
        category: 'Alkaline earth metal',
        block: 's',
        period: 2,
        group: 2,
        electronConfiguration: '[He] 2s2',
        electronConfigurationNoble: '[He] 2s2',
        meltingPoint: 1560,
        boilingPoint: 2742,
        density: 1.85,
        electronegativity: 1.57,
        ionizationEnergies: [899.5],
        discoveryYear: 1798,
        discoveredBy: 'Louis Nicolas Vauquelin',
        appearance: 'white-gray metallic',
        phase: 'Solid',
        facts: [
            'Highly transparent to X-rays.',
            'Its dust is highly toxic, causing berylliosis.',
            'Used in aerospace structural components.'
        ]
    },
    {
        atomicNumber: 26,
        symbol: 'Fe',
        name: 'Iron',
        atomicMass: 55.845,
        category: 'Transition metal',
        block: 'd',
        period: 4,
        group: 8,
        electronConfiguration: '[Ar] 3d6 4s2',
        electronConfigurationNoble: '[Ar] 3d6 4s2',
        meltingPoint: 1811,
        boilingPoint: 3134,
        density: 7.874,
        electronegativity: 1.83,
        ionizationEnergies: [762.5],
        discoveryYear: 'Ancient',
        discoveredBy: 'Unknown',
        appearance: 'lustrous metallic with a grayish tinge',
        phase: 'Solid',
        facts: [
            'Most common element on Earth by mass.',
            'Main component of steel.',
            'Essential for blood in mammals (hemoglobin).'
        ]
    }
];

// Helper functions for data
function getElementByNumber(num) {
    return elementsData.find(e => e.atomicNumber === parseInt(num));
}
