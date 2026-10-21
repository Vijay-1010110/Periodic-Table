import asyncio
import time
import subprocess
import os
from create_promotional_suite import (
    unlock_pro, capture_shot, record_clip, ensure_foreground, eval_js
)

async def run_all():
    print("==================================================")
    print("   PERIODICA 3D - PROMOTIONAL MATERIAL SUITE     ")
    print("==================================================")

    ensure_foreground()
    await unlock_pro()

    # ==================================================
    # PART 1: HIGH-RESOLUTION SCREENSHOTS (1600x720)
    # ==================================================
    print("\n--- CAPTURING FLAGSHIP SCREENSHOTS ---")

    # 01. Periodic Table Hero (298K)
    await capture_shot('01_periodic_table_hero.png', setup_js='''
        (() => {
            if (window.OrbitalViewer && window.OrbitalViewer.closeModal) window.OrbitalViewer.closeModal();
            if (typeof switchView === 'function') switchView('main');
            const sb = document.getElementById('element-sidebar');
            if (sb) sb.classList.remove('open');
            if (typeof closeSidebar === 'function') closeSidebar();
            if (window.onNativeTempChange) window.onNativeTempChange(298);
        })()
    ''', delay=1.5)

    # 02. Element Dossier Gold
    await capture_shot('02_element_dossier_gold.png', setup_js='''
        (() => {
            if (typeof selectElement === 'function') selectElement(79, true, true);
        })()
    ''', delay=1.5)

    # 03. Quantum Orbitals 3D Modal
    await capture_shot('03_quantum_orbitals_3d.png', setup_js='''
        (() => {
            if (window.OrbitalViewer) {
                window.OrbitalViewer.openModal(3, 2, '0');
            }
        })()
    ''', delay=1.5)

    # 04. Isotopes Decay Chart
    await capture_shot('04_isotopes_decay_chart.png', setup_js='''
        (() => {
            if (window.OrbitalViewer && window.OrbitalViewer.closeModal) window.OrbitalViewer.closeModal();
            if (typeof switchView === 'function') switchView('isotopes');
        })()
    ''', delay=1.5)

    # 05. Molecular Compounds 3D
    await capture_shot('05_molecular_compounds_3d.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('compounds');
            setTimeout(() => {
                if (typeof selectCompound === 'function') selectCompound('caffeine');
            }, 300);
        })()
    ''', delay=1.8)

    # 06. Chemical Reactions Lab
    await capture_shot('06_chemical_reactions_lab.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('reactions');
        })()
    ''', delay=1.5)

    # 07. Crystals 3D Lattice
    await capture_shot('07_crystals_3d_lattice.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('crystals');
            setTimeout(() => {
                if (typeof selectCrystalSystem === 'function') selectCrystalSystem('diamond');
            }, 300);
        })()
    ''', delay=1.8)

    # 08. Compare Elements Radar
    await capture_shot('08_compare_elements_radar.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('compare');
        })()
    ''', delay=1.5)

    # 09. Sim Lab: Nuclear Fission Split
    await capture_shot('09_nuclear_fission_split.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('chain_reaction');
            if (window.chainReactionEngine) {
                window.chainReactionEngine.setScenario('single_fission');
                window.chainReactionEngine.fireSingleAtomNeutron();
            }
        })()
    ''', delay=1.8)

    # 10. Sim Lab: Nuclear Reactor Core
    await capture_shot('10_nuclear_reactor_core.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('chain_reaction');
            if (window.chainReactionEngine) {
                window.chainReactionEngine.setScenario('reactor_core');
                window.chainReactionEngine.injectNeutron();
            }
        })()
    ''', delay=1.8)

    # 11. Sim Lab: Radioactive Decay Half-Life
    await capture_shot('11_radioactive_decay_halflife.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('decay');
            if (window.nuclearDecayEngine) {
                window.nuclearDecayEngine.setMode('halflife');
                window.nuclearDecayEngine.initHalfLifePopulation();
                window.nuclearDecayEngine.halfLifeRunning = true;
                if (typeof renderGameDeck === 'function') renderGameDeck('decay');
            }
        })()
    ''', delay=2.0)

    # 12. Sim Lab: Radiation Shielding
    await capture_shot('12_radiation_shielding_geiger.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('decay');
            if (window.nuclearDecayEngine) {
                window.nuclearDecayEngine.setMode('shielding');
                window.nuclearDecayEngine.triggerTransmutation();
                if (typeof renderGameDeck === 'function') renderGameDeck('decay');
            }
        })()
    ''', delay=1.8)

    # 13. Sim Lab: Cloud Chamber Lorentz
    await capture_shot('13_cloud_chamber_lorentz.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('decay');
            if (window.nuclearDecayEngine) {
                window.nuclearDecayEngine.setMode('chamber');
                window.nuclearDecayEngine.setMagneticField(1.8);
                window.nuclearDecayEngine.triggerDecay();
                if (typeof renderGameDeck === 'function') renderGameDeck('decay');
            }
        })()
    ''', delay=1.8)

    # 14. Sim Lab: Molecular Dynamics
    await capture_shot('14_molecular_dynamics_bonds.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('molecule');
            if (window.molecularDynamicsEngine) {
                window.molecularDynamicsEngine.loadPreset('C6H6');
                window.molecularDynamicsEngine.applyImpulse(0, 0, -250);
            }
        })()
    ''', delay=1.8)

    # 15. Sim Lab: Extreme States Hydraulic Press
    await capture_shot('15_extreme_hydraulic_press.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('environment');
            if (window.envSimulationEngine) {
                window.envSimulationEngine.setViewMode('chamber');
                window.envSimulationEngine.setElement(6);
                window.envSimulationEngine.quickJumpPhase('solid');
                if (typeof renderGameDeck === 'function') renderGameDeck('environment');
            }
        })()
    ''', delay=1.8)

    # 16. Sim Lab: P-T Phase Diagram Radar
    await capture_shot('16_pt_phase_diagram_radar.png', setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('environment');
            if (window.envSimulationEngine) {
                window.envSimulationEngine.setViewMode('diagram');
                window.envSimulationEngine.setElement(26);
                window.envSimulationEngine.setPressure(50);
                window.envSimulationEngine.setTemperature(1800);
            }
        })()
    ''', delay=1.8)

    # ==================================================
    # PART 2: DYNAMIC VIDEO ANIMATIONS (MP4 + GIF)
    # ==================================================
    print("\n--- RECORDING DYNAMIC VIDEO ANIMATIONS ---")

    # Clip 2: 3D Quantum Orbital Rotation
    await record_clip('02_quantum_orbital_3d_rotation', 8, setup_js='''
        (() => {
            if (typeof selectElement === 'function') selectElement(79, true, false);
            if (window.OrbitalViewer) {
                window.OrbitalViewer.openModal(3, 2, '0');
                if (window.OrbitalViewer.modalControls) {
                    window.OrbitalViewer.modalControls.autoRotate = true;
                    window.OrbitalViewer.modalControls.autoRotateSpeed = 4.0;
                }
            }
        })()
    ''', live_action_js='''
        (() => {
            setTimeout(() => {
                if (window.OrbitalViewer) window.OrbitalViewer.drawModalOrbital(3, 2, 'all');
            }, 3500);
        })()
    ''')

    # Clip 3: 3D Molecular Compound Rotation
    await record_clip('03_compound_3d_rotation', 8, setup_js='''
        (() => {
            if (window.OrbitalViewer && window.OrbitalViewer.closeModal) window.OrbitalViewer.closeModal();
            if (typeof switchView === 'function') switchView('compounds');
            setTimeout(() => {
                if (typeof selectCompound === 'function') selectCompound('caffeine');
            }, 300);
        })()
    ''', live_action_js='''
        (() => {
            const startT = performance.now();
            function rotateCompound(now) {
                if (window.compoundViewer && window.compoundViewer.compoundGroup) {
                    window.compoundViewer.compoundGroup.rotation.y += 0.035;
                    window.compoundViewer.compoundGroup.rotation.x = Math.sin((now - startT)*0.001) * 0.2;
                }
                if (performance.now() - startT < 7000) {
                    requestAnimationFrame(rotateCompound);
                }
            }
            requestAnimationFrame(rotateCompound);
        })()
    ''')

    # Clip 4: Nuclear Fission Droplet Split & Cascade
    await record_clip('04_nuclear_fission_cascade', 8, setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('chain_reaction');
            if (window.chainReactionEngine) {
                window.chainReactionEngine.setScenario('single_fission');
            }
        })()
    ''', live_action_js='''
        (() => {
            setTimeout(() => {
                if (window.chainReactionEngine) window.chainReactionEngine.fireSingleAtomNeutron();
            }, 800);
            setTimeout(() => {
                if (window.chainReactionEngine) {
                    window.chainReactionEngine.setScenario('reactor_core');
                    window.chainReactionEngine.injectNeutron();
                }
            }, 4000);
        })()
    ''')

    # Clip 5: Exponential Radioactive Decay Curve
    await record_clip('05_decay_halflife_exponential_curve', 8, setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('decay');
            if (window.nuclearDecayEngine) {
                window.nuclearDecayEngine.setMode('halflife');
                window.nuclearDecayEngine.initHalfLifePopulation();
                window.nuclearDecayEngine.halfLifeRunning = false;
                if (typeof renderGameDeck === 'function') renderGameDeck('decay');
            }
        })()
    ''', live_action_js='''
        (() => {
            setTimeout(() => {
                if (window.nuclearDecayEngine) {
                    window.nuclearDecayEngine.halfLifeRunning = true;
                    if (typeof renderGameDeck === 'function') renderGameDeck('decay');
                }
            }, 600);
        })()
    ''')

    # Clip 6: Extreme Hydraulic Press Compression
    await record_clip('06_hydraulic_press_compression', 9, setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('environment');
            if (window.envSimulationEngine) {
                window.envSimulationEngine.setViewMode('chamber');
                window.envSimulationEngine.setElement(6);
                window.envSimulationEngine.quickJumpPhase('gas');
                if (typeof renderGameDeck === 'function') renderGameDeck('environment');
            }
        })()
    ''', live_action_js='''
        (() => {
            const startT = performance.now();
            function compressCycle(now) {
                const elapsed = now - startT;
                const p = Math.min(1.0, elapsed / 8000);
                if (window.envSimulationEngine) {
                    // Pressure wave: 0.5 atm -> 120 atm -> 1 atm
                    let targetP = 0.5;
                    if (p < 0.6) {
                        targetP = 0.5 + Math.pow(p / 0.6, 2) * 120;
                    } else {
                        targetP = 120 - ((p - 0.6) / 0.4) * 115;
                    }
                    window.envSimulationEngine.setPressure(targetP);
                }
                if (p < 1.0) requestAnimationFrame(compressCycle);
            }
            setTimeout(() => requestAnimationFrame(compressCycle), 500);
        })()
    ''')

    # Clip 7: P-T Phase Radar Touch Teleportation
    await record_clip('07_pt_phase_radar_touch_teleport', 8, setup_js='''
        (() => {
            if (typeof switchView === 'function') switchView('simulations');
            if (typeof switchSimTab === 'function') switchSimTab('environment');
            if (window.envSimulationEngine) {
                window.envSimulationEngine.setViewMode('diagram');
                window.envSimulationEngine.setElement(26);
                window.envSimulationEngine.quickJumpPhase('solid');
            }
        })()
    ''', live_action_js='''
        (() => {
            setTimeout(() => { if (window.envSimulationEngine) window.envSimulationEngine.quickJumpPhase('liquid'); }, 1800);
            setTimeout(() => { if (window.envSimulationEngine) window.envSimulationEngine.quickJumpPhase('gas'); }, 3600);
            setTimeout(() => { if (window.envSimulationEngine) window.envSimulationEngine.quickJumpPhase('plasma'); }, 5400);
        })()
    ''')

    print("\n==================================================")
    print("   ALL PROMOTIONAL MATERIALS GENERATED!           ")
    print("==================================================")

if __name__ == '__main__':
    asyncio.run(run_all())
