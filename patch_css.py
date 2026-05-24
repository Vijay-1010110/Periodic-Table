import os

filepath = 'd:/Antigravity projects/Periodic table/src/css/01_base.css'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Highlighting CSS
content = content.replace('#main-grid.highlighting-active .element-cell:not(.highlighted) {', '#main-grid.highlighting-active .element-cell:not(.highlighted),\n#electrons-grid.highlighting-active .element-cell:not(.highlighted) {')
content = content.replace('#main-grid.highlighting-active .element-cell:not(.highlighted) * {', '#main-grid.highlighting-active .element-cell:not(.highlighted) *,\n#electrons-grid.highlighting-active .element-cell:not(.highlighted) * {')
content = content.replace('#main-grid.highlighting-active .element-cell.highlighted {', '#main-grid.highlighting-active .element-cell.highlighted,\n#electrons-grid.highlighting-active .element-cell.highlighted {')

# Add missing Aufbau CSS
aufbau_css = """

/* Aufbau Diagram Styles */
.aufbau-diagram-container {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: flex-end;
    font-family: monospace;
    font-size: 0.8rem;
    color: #e0e0e0;
}

.aufbau-legend {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 25px; /* Align with the bottom row */
    margin-right: 15px;
}

.legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.legend-box-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
}

.aufbau-grid {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.aufbau-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: flex-start;
}

.block-type-s { width: 40px; }
.block-type-p { width: 80px; }
.block-type-d { width: 120px; }
.block-type-f { width: 160px; }

.subshell-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
}

.subshell-label {
    width: 18px;
    text-align: right;
    color: #ccc;
    font-size: 0.75rem;
}

.orbital-boxes {
    display: flex;
    flex-direction: row;
    gap: 2px;
}

.orbital-box {
    width: 18px;
    height: 22px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    border: 1px solid transparent;
}

.arrow-up { color: #fff; margin-right: -1px; }
.arrow-down { color: #fff; margin-left: -1px; }

/* Block Colors */
.s-block { background-color: #0d5c63; }
.p-block { background-color: #4a5d23; }
.d-block { background-color: #6a1a41; }
.f-block { background-color: #0b3c8a; }

.active-orbital {
    border: 1px solid #4da6ff;
    box-shadow: 0 0 5px rgba(77, 166, 255, 0.5);
}
"""

if "/* Aufbau Diagram Styles */" not in content:
    content += aufbau_css

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS Patched Successfully!")
