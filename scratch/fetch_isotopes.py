import json
import math
import mendeleev

# Constants
U_TO_MEV = 931.4940954
M_P = 1.007276466879 # Proton mass in u
M_E = 0.000548579909 # Electron mass in u
M_H = 1.00782503223 # Hydrogen atom mass (proton + electron) in u
M_N = 1.00866491588 # Neutron mass in u
N_A = 6.02214076e23 # Avogadro's number
H_BAR_MEV_S = 6.582119569e-22 # h-bar in MeV*s

isotope_dict = {}

def get_decay_mode_str(dm):
    # mendeleev dm is an object, we need its name or string rep
    modes = []
    for d in dm:
        m = getattr(d, 'mode', str(d))
        rel = getattr(d, 'relation', '')
        # maybe intensity
        intensity = getattr(d, 'intensity', None)
        if intensity:
            modes.append(f"{m} ({intensity}%)")
        else:
            modes.append(m)
    return ", ".join(modes) if modes else "Stable"

for z in range(1, 119):
    try:
        el = mendeleev.element(z)
        isos = el.isotopes
    except Exception as e:
        print(f"Failed element {z}: {e}")
        continue
        
    iso_list = []
    for iso in isos:
        mass = iso.mass if iso.mass is not None else iso.mass_number
        n = iso.mass_number - z
        
        # Mass excess (MeV)
        mass_excess = (mass - iso.mass_number) * U_TO_MEV if iso.mass is not None else None
        
        # Binding energy (MeV)
        # BE = (Z * M_H + N * M_N - Mass) * c^2
        if iso.mass is not None:
            be = (z * M_H + n * M_N - mass) * U_TO_MEV
            be_per_A = be / iso.mass_number if iso.mass_number > 0 else 0
        else:
            be = None
            be_per_A = None
            
        # Specific activity (Bq/g)
        # A = (ln(2) / T_1/2_in_seconds) * (N_A / Mass)
        # Convert half life to seconds
        hl = iso.half_life
        unit = iso.half_life_unit
        hl_sec = None
        if hl is not None and not iso.is_stable:
            if unit == 'y': hl_sec = hl * 31556926
            elif unit == 'd': hl_sec = hl * 86400
            elif unit == 'h': hl_sec = hl * 3600
            elif unit == 'm': hl_sec = hl * 60
            elif unit == 's': hl_sec = hl
            elif unit == 'ms': hl_sec = hl * 1e-3
            elif unit == 'us': hl_sec = hl * 1e-6
            elif unit == 'ns': hl_sec = hl * 1e-9
            elif unit == 'ps': hl_sec = hl * 1e-12
            elif unit == 'fs': hl_sec = hl * 1e-15
            elif unit == 'zs': hl_sec = hl * 1e-21
            elif unit == 'ys': hl_sec = hl * 1e-24
            
        specific_activity = None
        if hl_sec is not None and hl_sec > 0 and mass is not None:
            decay_const = math.log(2) / hl_sec
            atoms_per_g = N_A / mass
            specific_activity = decay_const * atoms_per_g
            
        # Decay width (MeV)
        # Gamma = h_bar / tau = h_bar * ln(2) / T_1/2
        decay_width = None
        if hl_sec is not None and hl_sec > 0:
            decay_width = H_BAR_MEV_S * math.log(2) / hl_sec
            
        # Magnetic moment
        # mu = g * I
        mag_moment = None
        if iso.g_factor is not None and iso.spin is not None:
            try:
                # Try to parse spin like '1/2+' or '3' or '5/2'
                import re
                m = re.match(r'^(\d+)(?:/(\d+))?', str(iso.spin))
                if m:
                    num = float(m.group(1))
                    den = float(m.group(2)) if m.group(2) else 1.0
                    spin_val = num / den
                    mag_moment = iso.g_factor * spin_val
            except:
                pass
            
        decay_mode_str = "Stable" if iso.is_stable else "Radioactive"
        if hasattr(iso, 'decay_modes') and iso.decay_modes:
            decay_mode_str = get_decay_mode_str(iso.decay_modes)
            
        iso_data = {
            "massNumber": iso.mass_number,
            "mass": mass,
            "massExcess": mass_excess,
            "bindingEnergy": be,
            "bindingEnergyPerA": be_per_A,
            "abundance": iso.abundance * 100 if iso.abundance is not None else None, # Convert to %
            "halfLife": iso.half_life,
            "halfLifeUnit": iso.half_life_unit,
            "isStable": iso.is_stable,
            "decayMode": decay_mode_str,
            "decayWidth": decay_width,
            "specificActivity": specific_activity,
            "magneticMoment": mag_moment,
            "quadrupoleMoment": iso.quadrupole_moment,
            "spin": iso.spin,
            "parity": iso.parity
        }
        iso_list.append(iso_data)
        
    isotope_dict[z] = iso_list

with open("src/js/04_isotopes_data.js", "w", encoding="utf-8") as f:
    f.write("const isotopeData = ")
    json.dump(isotope_dict, f, indent=4)
    f.write(";\n")
    
print("Isotope data written to src/js/04_isotopes_data.js")
