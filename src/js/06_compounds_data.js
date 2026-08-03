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
    22: '#bfc2c7',  // Ti: Gray
    26: '#e06633',  // Fe: Rust
    29: '#c88033',  // Cu: Copper
    30: '#7d80b0',  // Zn: Slate
    35: '#a62929',  // Br: Dark Red
    47: '#c0c0c0',  // Ag: Silver
    53: '#940094'   // I: Violet
};

const compoundsData = [
    {
        id: "hydrochloricacid",
        "name": "Hydrochloric Acid",
        "formula": "HCl",
        "iupacName": "Chlorane",
        "type": "Acid",
        "state": "Liquid",
        "molarMass": 36.46,
        "density": "1.18 g/cm\u00b3",
        "meltingPoint": "-27 \u00b0C",
        "boilingPoint": "48 \u00b0C",
        "description": "A strongly acidic solution of hydrogen chloride in water.",
        "elements": [
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 2.76
                },
                {
                        "atomicNumber": 17,
                        "symbol": "Cl",
                        "count": 1,
                        "massPercent": 97.24
                }
        ],
        "atoms": [
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "sulfuricacid",
        "name": "Sulfuric Acid",
        "formula": "H2SO4",
        "iupacName": "Dihydrogen sulfate",
        "type": "Acid",
        "state": "Liquid",
        "molarMass": 98.079,
        "density": "1.83 g/cm\u00b3",
        "meltingPoint": "10 \u00b0C",
        "boilingPoint": "337 \u00b0C",
        "description": "A strong mineral acid, highly corrosive.",
        "elements": [
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 2,
                        "massPercent": 2.06
                },
                {
                        "atomicNumber": 16,
                        "symbol": "S",
                        "count": 1,
                        "massPercent": 32.69
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 4,
                        "massPercent": 65.25
                }
        ],
        "atoms": [
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 16,
                        "symbol": "S",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 0,
                        "z": 1.5
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1,
                        "y": 1,
                        "z": 1.5
                }
        ]
}
    {
        id: "nitricacid",
        "name": "Nitric Acid",
        "formula": "HNO3",
        "iupacName": "Hydrogen nitrate",
        "type": "Acid",
        "state": "Liquid",
        "molarMass": 63.012,
        "density": "1.51 g/cm\u00b3",
        "meltingPoint": "-42 \u00b0C",
        "boilingPoint": "83 \u00b0C",
        "description": "A highly corrosive mineral acid.",
        "elements": [
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 1.6
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 22.23
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 76.17
                }
        ],
        "atoms": [
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 0,
                        "y": 1.4,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 4,
                        "y": 0,
                        "z": 1.0
                }
        ]
}
    {
        id: "ammonia",
        "name": "Ammonia",
        "formula": "NH3",
        "iupacName": "Azane",
        "type": "Base",
        "state": "Gas",
        "molarMass": 17.031,
        "density": "0.73 kg/m\u00b3",
        "meltingPoint": "-77.7 \u00b0C",
        "boilingPoint": "-33.3 \u00b0C",
        "description": "A colorless gas with a characteristic pungent smell.",
        "elements": [
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 82.24
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 3,
                        "massPercent": 17.76
                }
        ],
        "atoms": [
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "methane",
        "name": "Methane",
        "formula": "CH4",
        "iupacName": "Methane",
        "type": "Organic",
        "state": "Gas",
        "molarMass": 16.04,
        "density": "0.656 kg/m\u00b3",
        "meltingPoint": "-182.5 \u00b0C",
        "boilingPoint": "-161.5 \u00b0C",
        "description": "The simplest alkane and the main constituent of natural gas.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 74.87
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 4,
                        "massPercent": 25.13
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                }
        ]
}
    {
        id: "sodiumchloride",
        "name": "Sodium Chloride",
        "formula": "NaCl",
        "iupacName": "Sodium chloride",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 58.44,
        "density": "2.16 g/cm\u00b3",
        "meltingPoint": "801 \u00b0C",
        "boilingPoint": "1465 \u00b0C",
        "description": "Common table salt.",
        "elements": [
                {
                        "atomicNumber": 11,
                        "symbol": "Na",
                        "count": 1,
                        "massPercent": 39.34
                },
                {
                        "atomicNumber": 17,
                        "symbol": "Cl",
                        "count": 1,
                        "massPercent": 60.66
                }
        ],
        "atoms": [
                {
                        "elem": 11,
                        "symbol": "Na",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "carbondioxide",
        "name": "Carbon Dioxide",
        "formula": "CO2",
        "iupacName": "Carbon dioxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 44.009,
        "density": "1.98 kg/m\u00b3",
        "meltingPoint": "-78.5 \u00b0C (sub)",
        "boilingPoint": "-78.5 \u00b0C",
        "description": "A colorless gas vital to life on Earth.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 72.71
                },
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 27.29
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "ethanol",
        "name": "Ethanol",
        "formula": "C2H5OH",
        "iupacName": "Ethanol",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 46.069,
        "density": "0.789 g/cm\u00b3",
        "meltingPoint": "-114.1 \u00b0C",
        "boilingPoint": "78.2 \u00b0C",
        "description": "A volatile, flammable, colorless liquid.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 2,
                        "massPercent": 52.14
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 34.73
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 6,
                        "massPercent": 13.13
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "glucose",
        "name": "Glucose",
        "formula": "C6H12O6",
        "iupacName": "D-glucose",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 180.156,
        "density": "1.54 g/cm\u00b3",
        "meltingPoint": "146 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "A simple sugar which is an important energy source in living organisms.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 6,
                        "massPercent": 40.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 6,
                        "massPercent": 53.28
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 12,
                        "massPercent": 6.71
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                }
        ]
}
    {
        id: "benzene",
        "name": "Benzene",
        "formula": "C6H6",
        "iupacName": "Benzene",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 78.114,
        "density": "0.876 g/cm\u00b3",
        "meltingPoint": "5.5 \u00b0C",
        "boilingPoint": "80.1 \u00b0C",
        "description": "An important organic chemical compound with the chemical formula C6H6.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 6,
                        "massPercent": 92.26
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 6,
                        "massPercent": 7.74
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "acetone",
        "name": "Acetone",
        "formula": "CH3COCH3",
        "iupacName": "Propan-2-one",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 58.08,
        "density": "0.784 g/cm\u00b3",
        "meltingPoint": "-94.7 \u00b0C",
        "boilingPoint": "56.0 \u00b0C",
        "description": "A colorless, volatile, flammable liquid, the simplest ketone.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 3,
                        "massPercent": 62.04
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 27.55
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 6,
                        "massPercent": 10.41
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "aceticacid",
        "name": "Acetic Acid",
        "formula": "CH3COOH",
        "iupacName": "Ethanoic acid",
        "type": "Acid",
        "state": "Liquid",
        "molarMass": 60.052,
        "density": "1.049 g/cm\u00b3",
        "meltingPoint": "16.6 \u00b0C",
        "boilingPoint": "118.1 \u00b0C",
        "description": "A colorless liquid organic compound that gives vinegar its sour taste.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 2,
                        "massPercent": 40.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 53.28
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 4,
                        "massPercent": 6.71
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "hydrogenperoxide",
        "name": "Hydrogen Peroxide",
        "formula": "H2O2",
        "iupacName": "Dihydrogen dioxide",
        "type": "Covalent",
        "state": "Liquid",
        "molarMass": 34.014,
        "density": "1.45 g/cm\u00b3",
        "meltingPoint": "-0.43 \u00b0C",
        "boilingPoint": "150.2 \u00b0C",
        "description": "A pale blue liquid, slightly more viscous than water.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 94.07
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 2,
                        "massPercent": 5.93
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "ozone",
        "name": "Ozone",
        "formula": "O3",
        "iupacName": "Trioxygen",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 47.998,
        "density": "2.14 kg/m\u00b3",
        "meltingPoint": "-192.2 \u00b0C",
        "boilingPoint": "-112.0 \u00b0C",
        "description": "A highly reactive gas composed of three oxygen atoms.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 100.0
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": -0.8,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 0.5,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": -0.8,
                        "z": 0
                }
        ]
}
    {
        id: "sodiumhydroxide",
        "name": "Sodium Hydroxide",
        "formula": "NaOH",
        "iupacName": "Sodium hydroxide",
        "type": "Base",
        "state": "Solid",
        "molarMass": 39.997,
        "density": "2.13 g/cm\u00b3",
        "meltingPoint": "318 \u00b0C",
        "boilingPoint": "1388 \u00b0C",
        "description": "Lye and caustic soda, an inorganic compound.",
        "elements": [
                {
                        "atomicNumber": 11,
                        "symbol": "Na",
                        "count": 1,
                        "massPercent": 57.48
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 40.0
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 2.52
                }
        ],
        "atoms": [
                {
                        "elem": 11,
                        "symbol": "Na",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "potassiumhydroxide",
        "name": "Potassium Hydroxide",
        "formula": "KOH",
        "iupacName": "Potassium hydroxide",
        "type": "Base",
        "state": "Solid",
        "molarMass": 56.105,
        "density": "2.12 g/cm\u00b3",
        "meltingPoint": "360 \u00b0C",
        "boilingPoint": "1327 \u00b0C",
        "description": "An inorganic compound, commonly called caustic potash.",
        "elements": [
                {
                        "atomicNumber": 19,
                        "symbol": "K",
                        "count": 1,
                        "massPercent": 69.69
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 28.52
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 1.8
                }
        ],
        "atoms": [
                {
                        "elem": 19,
                        "symbol": "K",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "calciumcarbonate",
        "name": "Calcium Carbonate",
        "formula": "CaCO3",
        "iupacName": "Calcium carbonate",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 100.086,
        "density": "2.71 g/cm\u00b3",
        "meltingPoint": "825 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "A chemical compound found in rocks as the minerals calcite and aragonite.",
        "elements": [
                {
                        "atomicNumber": 20,
                        "symbol": "Ca",
                        "count": 1,
                        "massPercent": 40.04
                },
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 12.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 47.96
                }
        ],
        "atoms": [
                {
                        "elem": 20,
                        "symbol": "Ca",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "magnesiumoxide",
        "name": "Magnesium Oxide",
        "formula": "MgO",
        "iupacName": "Magnesium oxide",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 40.304,
        "density": "3.58 g/cm\u00b3",
        "meltingPoint": "2852 \u00b0C",
        "boilingPoint": "3600 \u00b0C",
        "description": "A white hygroscopic solid mineral.",
        "elements": [
                {
                        "atomicNumber": 12,
                        "symbol": "Mg",
                        "count": 1,
                        "massPercent": 60.3
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 39.7
                }
        ],
        "atoms": [
                {
                        "elem": 12,
                        "symbol": "Mg",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "ironiiioxide",
        "name": "Iron(III) Oxide",
        "formula": "Fe2O3",
        "iupacName": "Iron(III) oxide",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 159.69,
        "density": "5.24 g/cm\u00b3",
        "meltingPoint": "1566 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "One of the three main oxides of iron, known as rust.",
        "elements": [
                {
                        "atomicNumber": 26,
                        "symbol": "Fe",
                        "count": 2,
                        "massPercent": 69.94
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 30.06
                }
        ],
        "atoms": [
                {
                        "elem": 26,
                        "symbol": "Fe",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 26,
                        "symbol": "Fe",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "aluminumoxide",
        "name": "Aluminum Oxide",
        "formula": "Al2O3",
        "iupacName": "Aluminum oxide",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 101.96,
        "density": "3.95 g/cm\u00b3",
        "meltingPoint": "2072 \u00b0C",
        "boilingPoint": "2977 \u00b0C",
        "description": "A chemical compound of aluminium and oxygen.",
        "elements": [
                {
                        "atomicNumber": 13,
                        "symbol": "Al",
                        "count": 2,
                        "massPercent": 52.93
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 47.07
                }
        ],
        "atoms": [
                {
                        "elem": 13,
                        "symbol": "Al",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 13,
                        "symbol": "Al",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "silicondioxide",
        "name": "Silicon Dioxide",
        "formula": "SiO2",
        "iupacName": "Silicon dioxide",
        "type": "Covalent",
        "state": "Solid",
        "molarMass": 60.08,
        "density": "2.648 g/cm\u00b3",
        "meltingPoint": "1713 \u00b0C",
        "boilingPoint": "2950 \u00b0C",
        "description": "Most commonly found in nature as quartz.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 53.26
                },
                {
                        "atomicNumber": 14,
                        "symbol": "Si",
                        "count": 1,
                        "massPercent": 46.74
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 14,
                        "symbol": "Si",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "titaniumdioxide",
        "name": "Titanium Dioxide",
        "formula": "TiO2",
        "iupacName": "Titanium dioxide",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 79.866,
        "density": "4.23 g/cm\u00b3",
        "meltingPoint": "1843 \u00b0C",
        "boilingPoint": "2972 \u00b0C",
        "description": "The naturally occurring oxide of titanium.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 40.07
                },
                {
                        "atomicNumber": 22,
                        "symbol": "Ti",
                        "count": 1,
                        "massPercent": 59.93
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 22,
                        "symbol": "Ti",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "zincoxide",
        "name": "Zinc Oxide",
        "formula": "ZnO",
        "iupacName": "Zinc oxide",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 81.408,
        "density": "5.606 g/cm\u00b3",
        "meltingPoint": "1975 \u00b0C",
        "boilingPoint": "2360 \u00b0C",
        "description": "An inorganic compound, a white powder insoluble in water.",
        "elements": [
                {
                        "atomicNumber": 30,
                        "symbol": "Zn",
                        "count": 1,
                        "massPercent": 80.34
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 19.66
                }
        ],
        "atoms": [
                {
                        "elem": 30,
                        "symbol": "Zn",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "sodiumbicarbonate",
        "name": "Sodium Bicarbonate",
        "formula": "NaHCO3",
        "iupacName": "Sodium hydrogen carbonate",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 84.006,
        "density": "2.20 g/cm\u00b3",
        "meltingPoint": "50 \u00b0C (dec)",
        "boilingPoint": "Decomposes",
        "description": "Baking soda.",
        "elements": [
                {
                        "atomicNumber": 11,
                        "symbol": "Na",
                        "count": 1,
                        "massPercent": 27.37
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 1.2
                },
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 14.3
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 57.14
                }
        ],
        "atoms": [
                {
                        "elem": 11,
                        "symbol": "Na",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "sodiumcarbonate",
        "name": "Sodium Carbonate",
        "formula": "Na2CO3",
        "iupacName": "Sodium carbonate",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 105.988,
        "density": "2.54 g/cm\u00b3",
        "meltingPoint": "851 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "Washing soda.",
        "elements": [
                {
                        "atomicNumber": 11,
                        "symbol": "Na",
                        "count": 2,
                        "massPercent": 43.38
                },
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 11.33
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 45.29
                }
        ],
        "atoms": [
                {
                        "elem": 11,
                        "symbol": "Na",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 11,
                        "symbol": "Na",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "silvernitrate",
        "name": "Silver Nitrate",
        "formula": "AgNO3",
        "iupacName": "Silver nitrate",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 169.87,
        "density": "4.35 g/cm\u00b3",
        "meltingPoint": "212 \u00b0C",
        "boilingPoint": "444 \u00b0C",
        "description": "A versatile precursor to many other silver compounds.",
        "elements": [
                {
                        "atomicNumber": 47,
                        "symbol": "Ag",
                        "count": 1,
                        "massPercent": 63.5
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 8.25
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 28.25
                }
        ],
        "atoms": [
                {
                        "elem": 47,
                        "symbol": "Ag",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "copperiisulfate",
        "name": "Copper(II) Sulfate",
        "formula": "CuSO4",
        "iupacName": "Copper(II) sulfate",
        "type": "Ionic",
        "state": "Solid",
        "molarMass": 159.609,
        "density": "3.6 g/cm\u00b3",
        "meltingPoint": "110 \u00b0C (dec)",
        "boilingPoint": "Decomposes",
        "description": "Often encountered as the bright blue pentahydrate.",
        "elements": [
                {
                        "atomicNumber": 29,
                        "symbol": "Cu",
                        "count": 1,
                        "massPercent": 39.82
                },
                {
                        "atomicNumber": 16,
                        "symbol": "S",
                        "count": 1,
                        "massPercent": 20.09
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 4,
                        "massPercent": 40.1
                }
        ],
        "atoms": [
                {
                        "elem": 29,
                        "symbol": "Cu",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 16,
                        "symbol": "S",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 0,
                        "z": 1.5
                }
        ]
}
    {
        id: "urea",
        "name": "Urea",
        "formula": "CH4N2O",
        "iupacName": "Carbamide",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 60.06,
        "density": "1.32 g/cm\u00b3",
        "meltingPoint": "133 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "Important in the metabolism of nitrogen-containing compounds.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 20.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 26.64
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 2,
                        "massPercent": 46.65
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 4,
                        "massPercent": 6.71
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 1.4,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": -1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 4,
                        "y": 0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 5,
                        "y": 0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 6,
                        "y": 0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 7,
                        "y": 0,
                        "z": 1.0
                }
        ]
}
    {
        id: "ascorbicacid",
        "name": "Ascorbic Acid",
        "formula": "C6H8O6",
        "iupacName": "Vitamin C",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 176.12,
        "density": "1.65 g/cm\u00b3",
        "meltingPoint": "190 \u00b0C",
        "boilingPoint": "Decomposes",
        "description": "An essential nutrient involved in the repair of tissue.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 6,
                        "massPercent": 40.92
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 6,
                        "massPercent": 54.5
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 4.58
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                }
        ]
}
    {
        id: "caffeine",
        "name": "Caffeine",
        "formula": "C8H10N4O2",
        "iupacName": "1,3,7-Trimethylxanthine",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 194.19,
        "density": "1.23 g/cm\u00b3",
        "meltingPoint": "235 \u00b0C",
        "boilingPoint": "Sublimes",
        "description": "A central nervous system stimulant.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 8,
                        "massPercent": 49.48
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 4,
                        "massPercent": 28.85
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 16.48
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 10,
                        "massPercent": 5.19
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 4.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 5.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 6.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 6.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 6.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "aspirin",
        "name": "Aspirin",
        "formula": "C9H8O4",
        "iupacName": "Acetylsalicylic acid",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 180.159,
        "density": "1.40 g/cm\u00b3",
        "meltingPoint": "136 \u00b0C",
        "boilingPoint": "140 \u00b0C",
        "description": "A medication used to reduce pain, fever, or inflammation.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 9,
                        "massPercent": 60.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 4,
                        "massPercent": 35.52
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 4.48
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 4.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 5.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 5.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "sucrose",
        "name": "Sucrose",
        "formula": "C12H22O11",
        "iupacName": "Saccharose",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 342.3,
        "density": "1.587 g/cm\u00b3",
        "meltingPoint": "186 \u00b0C (dec)",
        "boilingPoint": "Decomposes",
        "description": "Common table sugar.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 12,
                        "massPercent": 42.11
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 11,
                        "massPercent": 51.41
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 22,
                        "massPercent": 6.48
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 4.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 5.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 6.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 6.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 6.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 7.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 7.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 7.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 8.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 8.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 8.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 9.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 9.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 9.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 10.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 10.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 10.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 11.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 11.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 11.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 12.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 12.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 12.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 13.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 13.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 13.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "hydrogensulfide",
        "name": "Hydrogen Sulfide",
        "formula": "H2S",
        "iupacName": "Sulfane",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 34.08,
        "density": "1.36 kg/m\u00b3",
        "meltingPoint": "-82 \u00b0C",
        "boilingPoint": "-60 \u00b0C",
        "description": "A colorless chalcogen hydride gas with the characteristic foul odor of rotten eggs.",
        "elements": [
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 2,
                        "massPercent": 5.92
                },
                {
                        "atomicNumber": 16,
                        "symbol": "S",
                        "count": 1,
                        "massPercent": 94.08
                }
        ],
        "atoms": [
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -0.8,
                        "z": 0
                },
                {
                        "elem": 16,
                        "symbol": "S",
                        "x": 0,
                        "y": 0.5,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -0.8,
                        "z": 0
                }
        ]
}
    {
        id: "sulfurdioxide",
        "name": "Sulfur Dioxide",
        "formula": "SO2",
        "iupacName": "Sulfur dioxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 64.066,
        "density": "2.63 kg/m\u00b3",
        "meltingPoint": "-72 \u00b0C",
        "boilingPoint": "-10 \u00b0C",
        "description": "A toxic gas responsible for the smell of burnt matches.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 49.95
                },
                {
                        "atomicNumber": 16,
                        "symbol": "S",
                        "count": 1,
                        "massPercent": 50.05
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": -0.8,
                        "z": 0
                },
                {
                        "elem": 16,
                        "symbol": "S",
                        "x": 0,
                        "y": 0.5,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": -0.8,
                        "z": 0
                }
        ]
}
    {
        id: "sulfurtrioxide",
        "name": "Sulfur Trioxide",
        "formula": "SO3",
        "iupacName": "Sulfur trioxide",
        "type": "Covalent",
        "state": "Liquid",
        "molarMass": 80.06,
        "density": "1.92 g/cm\u00b3",
        "meltingPoint": "16.9 \u00b0C",
        "boilingPoint": "44.9 \u00b0C",
        "description": "A primary agent in acid rain.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 59.95
                },
                {
                        "atomicNumber": 16,
                        "symbol": "S",
                        "count": 1,
                        "massPercent": 40.05
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 16,
                        "symbol": "S",
                        "x": 0,
                        "y": 1.4,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.21,
                        "y": -0.7,
                        "z": 0
                }
        ]
}
    {
        id: "nitricoxide",
        "name": "Nitric Oxide",
        "formula": "NO",
        "iupacName": "Nitrogen monoxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 30.006,
        "density": "1.34 kg/m\u00b3",
        "meltingPoint": "-164 \u00b0C",
        "boilingPoint": "-152 \u00b0C",
        "description": "A colorless gas and a free radical.",
        "elements": [
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 46.68
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 53.32
                }
        ],
        "atoms": [
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "nitrousoxide",
        "name": "Nitrous Oxide",
        "formula": "N2O",
        "iupacName": "Dinitrogen monoxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 44.013,
        "density": "1.98 kg/m\u00b3",
        "meltingPoint": "-90.8 \u00b0C",
        "boilingPoint": "-88.5 \u00b0C",
        "description": "Laughing gas.",
        "elements": [
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 2,
                        "massPercent": 63.65
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 36.35
                }
        ],
        "atoms": [
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "nitrogendioxide",
        "name": "Nitrogen Dioxide",
        "formula": "NO2",
        "iupacName": "Nitrogen dioxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 46.005,
        "density": "1.88 kg/m\u00b3",
        "meltingPoint": "-11.2 \u00b0C",
        "boilingPoint": "21.2 \u00b0C",
        "description": "An intermediate in the industrial synthesis of nitric acid.",
        "elements": [
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 2,
                        "massPercent": 69.55
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 30.45
                }
        ],
        "atoms": [
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.2,
                        "y": -0.8,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 0,
                        "y": 0.5,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.2,
                        "y": -0.8,
                        "z": 0
                }
        ]
}
    {
        id: "carbonmonoxide",
        "name": "Carbon Monoxide",
        "formula": "CO",
        "iupacName": "Carbon monoxide",
        "type": "Covalent",
        "state": "Gas",
        "molarMass": 28.01,
        "density": "1.14 kg/m\u00b3",
        "meltingPoint": "-205 \u00b0C",
        "boilingPoint": "-191.5 \u00b0C",
        "description": "A colorless, odorless, and tasteless flammable gas that is slightly less dense than air.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 42.88
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 57.12
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.75,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.75,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "cyanide",
        "name": "Cyanide",
        "formula": "HCN",
        "iupacName": "Hydrogen cyanide",
        "type": "Covalent",
        "state": "Liquid",
        "molarMass": 27.025,
        "density": "0.687 g/cm\u00b3",
        "meltingPoint": "-13.4 \u00b0C",
        "boilingPoint": "25.6 \u00b0C",
        "description": "Extremely poisonous liquid that boils slightly above room temperature.",
        "elements": [
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 3.73
                },
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 44.44
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 51.83
                }
        ],
        "atoms": [
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.5,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 1.5,
                        "y": 0,
                        "z": 0
                }
        ]
}
    {
        id: "formaldehyde",
        "name": "Formaldehyde",
        "formula": "CH2O",
        "iupacName": "Methanal",
        "type": "Organic",
        "state": "Gas",
        "molarMass": 30.026,
        "density": "0.815 kg/m\u00b3",
        "meltingPoint": "-92 \u00b0C",
        "boilingPoint": "-19 \u00b0C",
        "description": "The simplest aldehyde.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 40.0
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 53.28
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 2,
                        "massPercent": 6.71
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 1.4,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.21,
                        "y": -0.7,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.21,
                        "y": -0.7,
                        "z": 0
                }
        ]
}
    {
        id: "propane",
        "name": "Propane",
        "formula": "C3H8",
        "iupacName": "Propane",
        "type": "Organic",
        "state": "Gas",
        "molarMass": 44.097,
        "density": "1.88 kg/m\u00b3",
        "meltingPoint": "-187.7 \u00b0C",
        "boilingPoint": "-42.25 \u00b0C",
        "description": "A three-carbon alkane, usually a gas, compressible to a transportable liquid.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 3,
                        "massPercent": 81.71
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 18.29
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                }
        ]
}
    {
        id: "butane",
        "name": "Butane",
        "formula": "C4H10",
        "iupacName": "Butane",
        "type": "Organic",
        "state": "Gas",
        "molarMass": 58.12,
        "density": "2.48 kg/m\u00b3",
        "meltingPoint": "-138 \u00b0C",
        "boilingPoint": "-0.5 \u00b0C",
        "description": "A highly flammable, colorless, easily liquefied gas.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 4,
                        "massPercent": 82.66
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 10,
                        "massPercent": 17.34
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "octane",
        "name": "Octane",
        "formula": "C8H18",
        "iupacName": "Octane",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 114.23,
        "density": "0.703 g/cm\u00b3",
        "meltingPoint": "-57 \u00b0C",
        "boilingPoint": "125 \u00b0C",
        "description": "An important component of gasoline.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 8,
                        "massPercent": 84.12
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 18,
                        "massPercent": 15.88
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 4.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 4.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 5.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 5.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 6.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 6.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 6.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 7.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 7.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "methanol",
        "name": "Methanol",
        "formula": "CH3OH",
        "iupacName": "Methanol",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 32.04,
        "density": "0.792 g/cm\u00b3",
        "meltingPoint": "-97.6 \u00b0C",
        "boilingPoint": "64.7 \u00b0C",
        "description": "The simplest alcohol, toxic to humans.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 37.49
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 49.93
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 4,
                        "massPercent": 12.58
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0,
                        "y": 0,
                        "z": 1.5
                }
        ]
}
    {
        id: "isopropanol",
        "name": "Isopropanol",
        "formula": "C3H8O",
        "iupacName": "Propan-2-ol",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 60.1,
        "density": "0.786 g/cm\u00b3",
        "meltingPoint": "-89 \u00b0C",
        "boilingPoint": "82.6 \u00b0C",
        "description": "Rubbing alcohol.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 3,
                        "massPercent": 59.96
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 26.62
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 13.42
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "glycerol",
        "name": "Glycerol",
        "formula": "C3H8O3",
        "iupacName": "Propane-1,2,3-triol",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 92.09,
        "density": "1.26 g/cm\u00b3",
        "meltingPoint": "17.8 \u00b0C",
        "boilingPoint": "290 \u00b0C",
        "description": "A simple polyol compound.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 3,
                        "massPercent": 39.13
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 3,
                        "massPercent": 52.12
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 8.76
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.0,
                        "y": -1.0,
                        "z": 1.0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.0,
                        "y": -1.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": -1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 0.0,
                        "y": 0.0,
                        "z": 0.0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 1.0,
                        "y": 0.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 1.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 1.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 2.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.0,
                        "y": 2.0,
                        "z": 1.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.0,
                        "y": 3.0,
                        "z": 0.0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 0.0,
                        "y": 3.0,
                        "z": 1.0
                }
        ]
}
    {
        id: "toluene",
        "name": "Toluene",
        "formula": "C7H8",
        "iupacName": "Methylbenzene",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 92.14,
        "density": "0.867 g/cm\u00b3",
        "meltingPoint": "-93 \u00b0C",
        "boilingPoint": "110.6 \u00b0C",
        "description": "An aromatic hydrocarbon.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 7,
                        "massPercent": 91.25
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 8,
                        "massPercent": 8.75
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                }
        ]
}
    {
        id: "phenol",
        "name": "Phenol",
        "formula": "C6H6O",
        "iupacName": "Phenol",
        "type": "Organic",
        "state": "Solid",
        "molarMass": 94.11,
        "density": "1.07 g/cm\u00b3",
        "meltingPoint": "40.5 \u00b0C",
        "boilingPoint": "181.7 \u00b0C",
        "description": "An aromatic organic compound with the molecular formula C6H5OH.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 6,
                        "massPercent": 76.57
                },
                {
                        "atomicNumber": 8,
                        "symbol": "O",
                        "count": 1,
                        "massPercent": 17.0
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 6,
                        "massPercent": 6.43
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 8,
                        "symbol": "O",
                        "x": 2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                }
        ]
}
    {
        id: "aniline",
        "name": "Aniline",
        "formula": "C6H7N",
        "iupacName": "Phenylamine",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 93.13,
        "density": "1.02 g/cm\u00b3",
        "meltingPoint": "-6.3 \u00b0C",
        "boilingPoint": "184.1 \u00b0C",
        "description": "The simplest aromatic amine.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 6,
                        "massPercent": 77.38
                },
                {
                        "atomicNumber": 7,
                        "symbol": "N",
                        "count": 1,
                        "massPercent": 15.04
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 7,
                        "massPercent": 7.58
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": 1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -1.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": -0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0.7,
                        "y": -1.21,
                        "z": 0
                },
                {
                        "elem": 7,
                        "symbol": "N",
                        "x": 2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": 2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -2.4,
                        "y": 0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": -2.08,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 2.4,
                        "y": -0.0,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": 1.2,
                        "y": 2.08,
                        "z": 0
                }
        ]
}
    {
        id: "chloroform",
        "name": "Chloroform",
        "formula": "CHCl3",
        "iupacName": "Trichloromethane",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 119.37,
        "density": "1.49 g/cm\u00b3",
        "meltingPoint": "-63.5 \u00b0C",
        "boilingPoint": "61.15 \u00b0C",
        "description": "A colorless, strong-smelling, dense liquid.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 10.06
                },
                {
                        "atomicNumber": 17,
                        "symbol": "Cl",
                        "count": 3,
                        "massPercent": 89.09
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 1,
                        "massPercent": 0.84
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                }
        ]
}
    {
        id: "carbontetrachloride",
        "name": "Carbon Tetrachloride",
        "formula": "CCl4",
        "iupacName": "Tetrachloromethane",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 153.81,
        "density": "1.59 g/cm\u00b3",
        "meltingPoint": "-22.9 \u00b0C",
        "boilingPoint": "76.7 \u00b0C",
        "description": "A colorless liquid with a 'sweet' smell that can be detected at low levels.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 7.81
                },
                {
                        "atomicNumber": 17,
                        "symbol": "Cl",
                        "count": 4,
                        "massPercent": 92.19
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                }
        ]
}
    {
        id: "dichloromethane",
        "name": "Dichloromethane",
        "formula": "CH2Cl2",
        "iupacName": "Dichloromethane",
        "type": "Organic",
        "state": "Liquid",
        "molarMass": 84.93,
        "density": "1.33 g/cm\u00b3",
        "meltingPoint": "-96.7 \u00b0C",
        "boilingPoint": "39.6 \u00b0C",
        "description": "A widely used organic solvent.",
        "elements": [
                {
                        "atomicNumber": 6,
                        "symbol": "C",
                        "count": 1,
                        "massPercent": 14.14
                },
                {
                        "atomicNumber": 17,
                        "symbol": "Cl",
                        "count": 2,
                        "massPercent": 83.48
                },
                {
                        "atomicNumber": 1,
                        "symbol": "H",
                        "count": 2,
                        "massPercent": 2.37
                }
        ],
        "atoms": [
                {
                        "elem": 6,
                        "symbol": "C",
                        "x": 0,
                        "y": 0,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 0,
                        "y": 1.2,
                        "z": 0
                },
                {
                        "elem": 17,
                        "symbol": "Cl",
                        "x": 1.13,
                        "y": -0.4,
                        "z": 0
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": 0.98
                },
                {
                        "elem": 1,
                        "symbol": "H",
                        "x": -0.56,
                        "y": -0.4,
                        "z": -0.98
                }
        ]
}
];
