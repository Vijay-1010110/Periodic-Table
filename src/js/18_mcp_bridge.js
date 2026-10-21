/**
 * 18_mcp_bridge.js
 * In-App Client Bridge for Model Context Protocol (MCP) & AI Assistant Remote Control
 * Connects Periodica 3D to local AI assistants (Claude, Cursor, Gemini) via WebSocket.
 */

(function() {
    'use strict';

    const DEFAULT_PORT = 38281;
    let ws = null;
    let reconnectTimeout = null;
    let reconnectDelay = 2000;
    let isConnected = false;
    let isEnabled = localStorage.getItem('periodica_mcp_enabled') !== 'false';
    let serverUrl = localStorage.getItem('periodica_mcp_url') || `ws://127.0.0.1:${DEFAULT_PORT}`;

    function getAppState() {
        return {
            activeView: typeof currentView !== 'undefined' ? currentView : 'main',
            selectedElement: (typeof selectedElement !== 'undefined' && selectedElement) ? {
                atomicNumber: selectedElement.atomicNumber,
                symbol: selectedElement.symbol,
                name: selectedElement.name
            } : null,
            temperature: typeof currentTemp !== 'undefined' ? Math.round(currentTemp) : 298,
            activeFilter: typeof window.lockedLegendKey !== 'undefined' ? (window.lockedLegendKey || 'none') : 'none'
        };
    }

    function showAiToast(message, type = 'ai') {
        let toastContainer = document.getElementById('ai-bridge-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'ai-bridge-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 47, 73, 0.95));
            border: 1px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.25), 0 0 12px rgba(168, 85, 247, 0.2);
            color: #ffffff;
            padding: 10px 16px;
            border-radius: 10px;
            font-family: 'DM Sans', system-ui, sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(8px);
        `;

        const icon = type === 'ai' ? '🤖' : '⚡';
        toast.innerHTML = `
            <span style="font-size: 1.1rem; filter: drop-shadow(0 0 6px #00d4ff);">${icon}</span>
            <div>
                <div style="font-size: 0.72rem; color: #00d4ff; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">AI Remote Action</div>
                <div style="color: #f1f5f9;">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        // Trigger light haptic if on device
        if (window.NativeServices?.Haptics) {
            window.NativeServices.Haptics.light();
        }

        // Animate out
        setTimeout(() => {
            toast.style.transform = 'translateY(-10px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 3500);
    }

    function sendStateUpdate() {
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        try {
            ws.send(JSON.stringify({
                type: 'state_update',
                state: getAppState(),
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('[MCP Bridge] Failed to send state:', e.message);
        }
    }

    function handleIncomingCommand(msg) {
        const { reqId, action, params } = msg;
        let result = { success: true };
        let actionDescription = '';

        try {
            if (action === 'navigate') {
                // 1. Switch View
                if (params.view && typeof window.switchView === 'function') {
                    window.switchView(params.view);
                    actionDescription += `View: ${params.view} `;
                }

                // 2. Select Element
                if (params.atomicNumber && typeof window.selectElement === 'function') {
                    window.selectElement(params.atomicNumber, false, true);
                    const elName = (typeof getElementByNumber === 'function') ? getElementByNumber(params.atomicNumber)?.name : params.atomicNumber;
                    actionDescription += `• Element: ${elName} `;
                }

                // 3. Set Temperature
                if (params.temperature !== undefined) {
                    const tempK = Number(params.temperature);
                    if (!isNaN(tempK) && tempK >= 0) {
                        window.currentTemp = tempK;
                        if (typeof updateTempDisplay === 'function') updateTempDisplay();
                        if (typeof updateStateButtons === 'function') updateStateButtons();
                        if (typeof updateElementStates === 'function') updateElementStates();
                        actionDescription += `• Temp: ${Math.round(tempK)} K `;
                    }
                }

                // 4. Open 3D Quantum Orbital
                if (params.orbital && window.OrbitalViewer && typeof window.OrbitalViewer.openModal === 'function') {
                    const { n, l, m } = params.orbital;
                    window.OrbitalViewer.openModal(n || 2, l !== undefined ? l : 1, m || 'all');
                    actionDescription += `• 3D Orbital (${n || 2}, ${l || 1}) `;
                }

                // 5. Balance Chemical Reaction
                if (params.reaction) {
                    if (typeof window.switchView === 'function') window.switchView('reactions');
                    const input = document.getElementById('reaction-input');
                    if (input) {
                        input.value = params.reaction;
                    }
                    if (typeof balanceEquation === 'function') {
                        balanceEquation(params.reaction);
                        actionDescription += `• Balanced: ${params.reaction} `;
                    }
                }

                showAiToast(actionDescription || 'Navigated to view');
                result.appState = getAppState();
            } else if (action === 'get_state') {
                result.appState = getAppState();
            } else {
                result = { success: false, error: `Unknown action: ${action}` };
            }
        } catch (err) {
            result = { success: false, error: err.message };
        }

        // Send response back to MCP server
        if (ws && ws.readyState === WebSocket.OPEN && reqId) {
            ws.send(JSON.stringify({
                type: 'response',
                reqId,
                result,
                timestamp: Date.now()
            }));
        }

        updateUiBadge();
    }

    function updateUiBadge() {
        const badge = document.getElementById('mcp-bridge-status-badge');
        if (badge) {
            if (isConnected) {
                badge.textContent = '🟢 AI Connected';
                badge.style.background = 'rgba(16, 185, 129, 0.15)';
                badge.style.color = '#34d399';
                badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            } else if (!isEnabled) {
                badge.textContent = '⚪ AI Bridge Disabled';
                badge.style.background = 'rgba(148, 163, 184, 0.1)';
                badge.style.color = '#94a3b8';
                badge.style.borderColor = 'rgba(148, 163, 184, 0.2)';
            } else {
                badge.textContent = '🟡 AI Bridge Standby';
                badge.style.background = 'rgba(245, 158, 11, 0.15)';
                badge.style.color = '#fbbf24';
                badge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }
        }
    }

    function connect() {
        if (!isEnabled) return;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            ws = new WebSocket(serverUrl);

            ws.onopen = function() {
                isConnected = true;
                reconnectDelay = 2000;
                updateUiBadge();
                sendStateUpdate();
                console.log('[MCP Bridge] Connected to AI bridge at', serverUrl);
            };

            ws.onmessage = function(event) {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'command') {
                        handleIncomingCommand(msg);
                    } else if (msg.type === 'ping') {
                        sendStateUpdate();
                    }
                } catch (e) {
                    console.error('[MCP Bridge] Message parse error:', e.message);
                }
            };

            ws.onclose = function() {
                isConnected = false;
                updateUiBadge();
                scheduleReconnect();
            };

            ws.onerror = function() {
                isConnected = false;
                updateUiBadge();
            };
        } catch (e) {
            isConnected = false;
            scheduleReconnect();
        }
    }

    function scheduleReconnect() {
        if (!isEnabled) return;
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(() => {
            connect();
            reconnectDelay = Math.min(reconnectDelay * 1.5, 15000);
        }, reconnectDelay);
    }

    function disconnect() {
        clearTimeout(reconnectTimeout);
        if (ws) {
            ws.close();
            ws = null;
        }
        isConnected = false;
        updateUiBadge();
    }

    /**
     * Native Android Assistant & Deep Link Handler
     * Handles voice commands and app intents from Google Gemini, Google Assistant, Samsung Bixby, and Perplexity.
     */
    function handleDeepLink(urlStr) {
        if (!urlStr || typeof urlStr !== 'string') return;
        try {
            let parsed;
            if (urlStr.startsWith('periodica://')) {
                parsed = new URL(urlStr.replace('periodica://', 'http://periodica/'));
            } else {
                parsed = new URL(urlStr);
            }

            const path = parsed.pathname.replace(/^\/+/, '');
            const segments = path.split('/');
            const params = {};
            parsed.searchParams.forEach((v, k) => params[k] = v);

            const command = {};

            if (segments[0] === 'element') {
                const q = segments[1] || params.q || params.name || params.symbol || params.z;
                if (q && typeof elementsData !== 'undefined') {
                    const el = elementsData.find(e => 
                        e.symbol.toLowerCase() === q.toLowerCase() || 
                        e.name.toLowerCase() === q.toLowerCase() ||
                        String(e.atomicNumber) === q
                    );
                    if (el) command.atomicNumber = el.atomicNumber;
                }
            } else if (segments[0] === 'view') {
                let v = segments[1] || params.view || 'main';
                if (v === 'orbitals') v = 'electrons';
                command.view = v;
                const q = params.element || params.z || params.q;
                if (q && typeof elementsData !== 'undefined') {
                    const el = elementsData.find(e => 
                        e.symbol.toLowerCase() === q.toLowerCase() || 
                        e.name.toLowerCase() === q.toLowerCase() ||
                        String(e.atomicNumber) === q
                    );
                    if (el) command.atomicNumber = el.atomicNumber;
                }
            } else if (segments[0] === 'orbitals' || segments[0] === 'electrons') {
                command.view = 'electrons';
                const q = params.element || params.z || params.q;
                if (q && typeof elementsData !== 'undefined') {
                    const el = elementsData.find(e => 
                        e.symbol.toLowerCase() === q.toLowerCase() || 
                        e.name.toLowerCase() === q.toLowerCase() ||
                        String(e.atomicNumber) === q
                    );
                    if (el) command.atomicNumber = el.atomicNumber;
                }
                if (params.n) {
                    command.orbital = {
                        n: parseInt(params.n, 10),
                        l: params.l !== undefined ? parseInt(params.l, 10) : 1,
                        m: params.m || 'all'
                    };
                }
            } else if (segments[0] === 'reaction' || segments[0] === 'reactions') {
                command.view = 'reactions';
                if (params.eq || params.equation) {
                    command.reaction = decodeURIComponent(params.eq || params.equation);
                }
            } else if (segments[0] === 'isotopes') {
                command.view = 'isotopes';
                const q = params.element || params.z || params.q;
                if (q && typeof elementsData !== 'undefined') {
                    const el = elementsData.find(e => 
                        e.symbol.toLowerCase() === q.toLowerCase() || 
                        e.name.toLowerCase() === q.toLowerCase() ||
                        String(e.atomicNumber) === q
                    );
                    if (el) command.atomicNumber = el.atomicNumber;
                }
            } else if (segments[0] === 'quiz') {
                command.view = 'quiz';
            } else if (segments[0] === 'pro' || segments[0] === 'tier') {
                const status = (segments[1] === 'true' || segments[1] === '1' || params.status === 'pro' || params.enabled === 'true');
                if (typeof window.setProUser === 'function') {
                    window.setProUser(status);
                }
                return;
            }

            if (params.k || params.temp || params.temperature) {
                command.temperature = Number(params.k || params.temp || params.temperature);
            }

            if (Object.keys(command).length > 0) {
                handleIncomingCommand({
                    reqId: 'native_intent_' + Date.now(),
                    action: 'navigate',
                    params: command
                });
            }
        } catch (e) {
            console.error('[DeepLink] Failed to parse URL:', urlStr, e);
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            connect();
            updateUiBadge();
        });
    } else {
        connect();
        updateUiBadge();
    }

    // Listen for Native Capacitor Deep Links from Google Gemini, Bixby, Perplexity
    if (window.Capacitor?.Plugins?.App) {
        window.Capacitor.Plugins.App.addListener('appUrlOpen', (data) => {
            if (data?.url) handleDeepLink(data.url);
        });
    }

    /**
     * Handles structured Intents dispatched from Android MainActivity
     * Supports Google Gemini, Google Assistant, Bixby, Perplexity, and Android Search Actions.
     */
    window.handleNativeAssistantIntent = function(intent) {
        if (!intent || typeof intent !== 'object') return;
        
        // 1. Direct URL Deep Link
        if (intent.url) {
            handleDeepLink(intent.url);
            return;
        }

        const command = {};

        // 2. Explicit Feature mapping
        if (intent.feature) {
            const f = intent.feature.toLowerCase().trim();
            if (f.includes('orbital') || f.includes('electron') || f.includes('wavefunction')) command.view = 'electrons';
            else if (f.includes('isotope') || f.includes('decay') || f.includes('nuclear')) command.view = 'isotopes';
            else if (f.includes('reaction') || f.includes('balance') || f.includes('equation')) command.view = 'reactions';
            else if (f.includes('compound') || f.includes('molecule')) command.view = 'compounds';
            else if (f.includes('crystal') || f.includes('lattice') || f.includes('solid')) command.view = 'crystals';
            else if (f.includes('compare') || f.includes('versus')) command.view = 'compare';
            else if (f.includes('quiz') || f.includes('practice') || f.includes('test')) command.view = 'quiz';
            else if (f.includes('table') || f.includes('main') || f.includes('element')) command.view = 'main';
        }

        // 3. Explicit Element parameter
        if (intent.element && typeof elementsData !== 'undefined') {
            const q = intent.element.trim().toLowerCase();
            const el = elementsData.find(e => 
                e.symbol.toLowerCase() === q || 
                e.name.toLowerCase() === q ||
                String(e.atomicNumber) === q
            );
            if (el) {
                command.atomicNumber = el.atomicNumber;
                if (!command.view) command.view = 'main';
            }
        }

        // 4. Free-form Query / Voice Text (from Gemini / Google Assistant Voice Search)
        const text = intent.query || intent.text;
        if (text && typeof text === 'string') {
            const raw = text.trim();
            const lower = raw.toLowerCase();

            // Reaction equation check
            if ((raw.includes('+') && (raw.includes('->') || raw.includes('=') || raw.includes('→'))) || lower.startsWith('balance ')) {
                command.view = 'reactions';
                command.reaction = raw.replace(/^balance\s+/i, '');
            } else {
                // View keywords
                if (lower.includes('orbital') || lower.includes('electron')) command.view = 'electrons';
                else if (lower.includes('isotope') || lower.includes('decay') || lower.includes('half life')) command.view = 'isotopes';
                else if (lower.includes('reaction') || lower.includes('balance')) command.view = 'reactions';
                else if (lower.includes('compound') || lower.includes('molecule')) command.view = 'compounds';
                else if (lower.includes('crystal') || lower.includes('lattice')) command.view = 'crystals';
                else if (lower.includes('compare')) command.view = 'compare';
                else if (lower.includes('quiz') || lower.includes('test')) command.view = 'quiz';

                // Element search in query
                if (typeof elementsData !== 'undefined') {
                    for (const el of elementsData) {
                        const nameRegex = new RegExp('\\b' + el.name + '\\b', 'i');
                        if (nameRegex.test(raw)) {
                            command.atomicNumber = el.atomicNumber;
                            if (!command.view) command.view = 'main';
                            break;
                        }
                    }
                    if (!command.atomicNumber) {
                        const words = raw.split(/\s+/);
                        for (const w of words) {
                            const el = elementsData.find(e => e.symbol.toLowerCase() === w.toLowerCase());
                            if (el && w.length >= 2) {
                                command.atomicNumber = el.atomicNumber;
                                if (!command.view) command.view = 'main';
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (Object.keys(command).length > 0) {
            handleIncomingCommand({
                reqId: 'assistant_' + Date.now(),
                action: 'navigate',
                params: command
            });
        }
    };

    // Broadcast state changes whenever view or element changes
    window.addEventListener('hashchange', sendStateUpdate);
    document.addEventListener('click', (e) => {
        if (e.target.closest('.nav-btn, .mobile-nav-item, .element-tile, .periodic-cell')) {
            setTimeout(sendStateUpdate, 150);
        }
    });

    // Public API
    window.PeriodicaMCP = {
        connect,
        disconnect,
        sendStateUpdate,
        getStatus: () => ({
            connected: isConnected,
            enabled: isEnabled,
            serverUrl: serverUrl,
            appState: getAppState()
        }),
        toggle: function(enabled) {
            isEnabled = !!enabled;
            localStorage.setItem('periodica_mcp_enabled', isEnabled ? 'true' : 'false');
            if (isEnabled) connect();
            else disconnect();
            updateUiBadge();
        },
        setServerUrl: function(url) {
            serverUrl = url;
            localStorage.setItem('periodica_mcp_url', url);
            disconnect();
            if (isEnabled) connect();
        }
    };
})();
