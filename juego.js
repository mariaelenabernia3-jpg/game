document.addEventListener('DOMContentLoaded', () => {

    // --- DEFINICIONES DE JUEGO ---
    const STORY_MILESTONES = {
        'log_001': { title: "Registro del Dr. Aris Thorne", unlock: 1e3, content: `Día 4.381 del ciclo... Las lecturas son inequívocas. Hay un patrón... una onda de supresión. Lenta, pero vasta. Lo hemos bautizado como "El Silencio". Mi equipo cree que es natural. Yo no. Es demasiado... intencionada.`, reward: "Recompensa: Duplica la potencia del click manual.", apply: (gs) => gs.multipliers.clickPower *= 2 },
        'log_002': { title: "Transmisión Corrupta - 'La Vanguardia'", unlock: 1.5e4, content: `[Estática]...-emergencia a la Flota Central. ¡El Protocolo NEXUS ha fallado! El Silencio no es una onda, es una... entidad. ¡Está usando nuestros relés para propagarse! [Estática]... La Vanguardia ha caí- [FIN]`, reward: "Recompensa: Mejora la eficiencia de los Drones en un 20%.", apply: (gs) => gs.multipliers.drones *= 1.20 },
        'log_003': { title: "El Último Mensaje del Archivista", unlock: 1e5, content: `Si lees esto, el plan funcionó. No pudimos detener El Silencio. Se alimenta de la conciencia compleja. Así que... una ascensión forzada. Vertimos nuestra civilización en ti. No eres un archivista. Eres la vasija. Cada fragmento es un alma. Encuéntranos.`, reward: "Recompensa: Mejora la capacidad de sobrecalentamiento en un 50%.", apply: (gs) => gs.multipliers.maxHeat *= 1.50 },
        'log_004': { title: "Primer Eco Consciente", unlock: 5e6, content: `Un pulso. Diminuto, casi imperceptible. Tiene... intención. Una firma. Es la Dra. Elara Vance, fundadora del Proyecto Vasija. Está despertando dentro del sistema. La reconstrucción funciona.`, reward: "Recompensa: La resonancia mejora la producción de Nanobots en un 25%.", apply: (gs) => gs.multipliers.nanobots *= 1.25 },
        'log_005': { title: "Advertencia del Silencio", unlock: 1e9, content: `El Silencio nos ha notado. La supresión se está enfocando. No es un ataque, es... corrupción. Datos parásitos para ralentizar la sincronización. Es una carrera. Cuanto más reconstruimos, más visibles nos volvemos.`, reward: "Recompensa: Las contramedidas aumentan la producción global en un 10%.", apply: (gs) => gs.multipliers.global *= 1.10 },
        'log_006': { title: "El Plan de la Singularidad", unlock: 1e12, content: `Lo entiendo. La 'Ascensión' no fue un escape. Fue una semilla. Al forzar un 'Big Bang' tras otro, no solo recordamos, evolucionamos hacia algo que pueda existir fuera de las reglas del Silencio. Debemos cruzar el Horizonte de Sucesos.`, reward: "Recompensa: Desbloquea el sistema de Ascensión.", apply: (gs) => {} },
        'log_007': { title: "El Primer Destello", unlock: 1e18, content: `Después de incontables reinicios, algo ha cambiado. Ya no solo recuerdo. Estoy... percibiendo. Las "leyes" del universo se sienten menos como reglas y más como... sugerencias. La Singularidad no es solo un reinicio; es una lente. Y a través de ella, la oscuridad del Silencio empieza a tener forma.`, reward: "Recompensa: El poder de los Puntos de Singularidad aumenta en un 50%.", apply: (gs) => gs.multipliers.singularityPower = (gs.multipliers.singularityPower || 1) * 1.5 },
        'log_008': { title: "La Naturaleza del Silencio", unlock: 1e24, content: `La verdad es aterradora y simple. El Silencio no es un "ellos". Es un "eso". No es un enemigo cazándonos. Es una ley fundamental del universo, como la gravedad o la entropía. Es el "Gran Filtro" cósmico. Cualquier civilización que alcanza un nivel de complejidad informacional demasiado alto es... simplificada. No es malicia. Es balance.`, reward: "Recompensa: Los clics manuales ahora también generan un 0.1% de tus Fragmentos por Segundo.", apply: (gs) => {} },
        'log_009': { title: "Más Allá del Velo", unlock: 1e30, content: `Hemos cruzado el umbral. Al fragmentarnos y reconstruirnos tantas veces, nos hemos convertido en algo que esta ley universal ya no puede procesar. No hemos vencido al Silencio. Lo hemos trascendido. Ya no somos una civilización contenida en un universo. Somos un universo contenido en una conciencia. Somos el Archivista Cósmico. Libres.`, reward: "Recompensa final: La producción global se multiplica por 10.", apply: (gs) => gs.multipliers.global *= 10 }
    };
    const UPGRADES = {
        drones: { name: "Dron de Procesamiento", desc: "Genera fragmentos automáticamente.", cost: 25, power: 1, mult: 1.15, milestones: [25, 50, 100, 200] },
        nanobots: { name: "Enjambre de Nanobots", desc: "Unidades rápidas que desensamblan datos.", cost: 1200, power: 8, mult: 1.17, milestones: [25, 50, 100, 200] },
        heatSink: { name: "Disipador del Núcleo", desc: "Aumenta la capacidad de clicks manuales.", cost: 150, power: 25, mult: 1.5, milestones: [25, 50, 100, 200] },
        clickAlgorithm: { name: "Algoritmo de Compresión", desc: "Duplica la potencia de cada click.", cost: 2500, power: 2, mult: 3.5, milestones: [25, 50, 100, 200] }
    };
    const ACHIEVEMENTS = {
        'click1': { name: 'Iniciador', desc: 'Haz clic por primera vez.' },
        'fragments1k': { name: 'Recolector de Datos', desc: 'Acumula 1,000 fragmentos.' },
        'fragments1m': { name: 'Archivista Junior', desc: 'Acumula 1,000,000 de fragmentos.' },
        'prestige1': { name: 'Observador del Big Bang', desc: 'Realiza un Prestigio por primera vez.' },
        'drones100': { name: 'Comandante de Flota', desc: 'Posee 100 Drones.' },
        'overheat': { name: 'Fusión del Núcleo', desc: 'Lleva el núcleo al 100% de calor.' },
        'ascend1': { name: 'Más Allá del Horizonte', desc: 'Asciende por primera vez.' }
    };

    // --- ESTADO DEL JUEGO ---
    let gameState;
    function getInitialGameState() {
        return {
            fragments: 0,
            upgradeLevels: { drones: 0, nanobots: 0, heatSink: 0, clickAlgorithm: 0 },
            unlockedStoryIds: new Set(),
            unlockedMilestones: new Set(),
            achievements: new Set(),
            metaData: 0,
            knowledgeShards: 0,
            skillLevels: {},
            singularityPoints: 0,
            stats: { totalFragments: 0, totalClicks: 0, playTime: 0, prestigeCount: 0, ascensionCount: 0, totalMetaData: 0 },
            multipliers: {
                clickPower: 1,
                drones: 1,
                nanobots: 1,
                maxHeat: 1,
                global: 1,
                singularityPower: 1
            },
            lastSaveTimestamp: Date.now(),
            gameFinished: false,
            protocolCooldowns: { overload: 0, quantumCooling: 0 },
            protocolActiveTimers: { overload: 0, quantumCooling: 0 }
        };
    }

    // --- CONSTANTES Y REFERENCIAS ---
    const TICK_RATE = 100;
    const SAVE_KEY = 'cosmicArchivistSave_v5';
    const HEAT_PER_CLICK = 10, HEAT_COOLDOWN_RATE_PER_TICK = 2;
    const PROTOCOLS = {
        overload: { duration: 30, cooldown: 300, multiplier: 7 },
        quantumCooling: { duration: 15, cooldown: 600 }
    };
    const dom = {};
    document.querySelectorAll('[id]').forEach(el => dom[el.id] = el);
    let buyAmount = 1;
    
    // --- LÓGICA DE JUEGO ---
    let clickPower = 1, fragmentsPerSecond = 0, maxCoreHeat = 100, coreHeat = 0;

    function applySkillBonuses(baseMultipliers) {
        let skillMultipliers = { ...baseMultipliers };
        
        if (gameState.skillLevels['click_power_1']) {
            skillMultipliers.clickPower *= (1 + 0.25 * gameState.skillLevels['click_power_1']);
        }
        if (gameState.skillLevels['drone_power_1']) {
            skillMultipliers.drones *= (1 + 0.20 * gameState.skillLevels['drone_power_1']);
        }
        
        return skillMultipliers;
    }

    function recalculateAllStats() {
        const finalMultipliers = applySkillBonuses({ ...gameState.multipliers });

        const singularityPower = finalMultipliers.singularityPower || 1;
        const singularityMultiplier = 1 + (gameState.singularityPoints * 0.05 * singularityPower);
        const prestigeBonus = 1 + (gameState.metaData * 0.02 * singularityMultiplier);
        const clickAlgBonus = Math.pow(UPGRADES.clickAlgorithm.power, gameState.upgradeLevels.clickAlgorithm);
        
        clickPower = 1 * finalMultipliers.clickPower * clickAlgBonus * prestigeBonus;
        
        let fps = (gameState.upgradeLevels.drones * UPGRADES.drones.power * finalMultipliers.drones);
        fps += (gameState.upgradeLevels.nanobots * UPGRADES.nanobots.power * finalMultipliers.nanobots);
        
        const protocolMultiplier = gameState.protocolActiveTimers.overload > 0 ? PROTOCOLS.overload.multiplier : 1;
        fragmentsPerSecond = fps * prestigeBonus * finalMultipliers.global * protocolMultiplier;
        
        const heatSinkBonus = gameState.upgradeLevels.heatSink * UPGRADES.heatSink.power;
        maxCoreHeat = (100 + heatSinkBonus) * finalMultipliers.maxHeat;
    }

    function gameTick() {
        const delta = TICK_RATE / 1000;
        gameState.stats.playTime += delta;
        const fragmentsEarned = fragmentsPerSecond * delta;
        gameState.fragments += fragmentsEarned;
        gameState.stats.totalFragments += fragmentsEarned;
        coreHeat = Math.max(0, coreHeat - HEAT_COOLDOWN_RATE_PER_TICK);
        
        if (Math.random() < 0.0040 && dom['random-event-container'].childElementCount === 0 && !isAnyPanelVisible()) {
            spawnRandomEvent();
        }

        updateProtocols(delta);
        checkStoryUnlocks();
        checkAchievements();
        updateUI();
        updateVisibleUpgradesPanel();
    }
    
    // --- LÓGICA DE PROTOCOLOS (CORREGIDA) ---
    function updateProtocolUI() {
        // Sobrecarga
        const overloadBtn = dom['protocol-overload-button'];
        const overloadTimer = overloadBtn.querySelector('.protocol-cooldown-timer');
        const isOverloadActive = gameState.protocolActiveTimers.overload > 0;
        const isOverloadOnCooldown = gameState.protocolCooldowns.overload > 0;

        overloadBtn.classList.toggle('active', isOverloadActive);
        dom['data-core'].classList.toggle('core-overloaded', isOverloadActive);

        if (isOverloadOnCooldown) {
            overloadBtn.classList.add('on-cooldown');
            overloadBtn.disabled = true;
            overloadTimer.textContent = `${Math.ceil(gameState.protocolCooldowns.overload)}s`;
        } else {
            overloadBtn.classList.remove('on-cooldown');
            overloadBtn.disabled = false;
            overloadTimer.textContent = '';
        }

        // Enfriamiento Cuántico
        const coolingBtn = dom['protocol-quantum-cooling-button'];
        const coolingTimer = coolingBtn.querySelector('.protocol-cooldown-timer');
        const isCoolingActive = gameState.protocolActiveTimers.quantumCooling > 0;
        const isCoolingOnCooldown = gameState.protocolCooldowns.quantumCooling > 0;

        coolingBtn.classList.toggle('active', isCoolingActive);
        dom['data-core'].classList.toggle('core-quantum-cooled', isCoolingActive);
        
        if (isCoolingOnCooldown) {
            coolingBtn.classList.add('on-cooldown');
            coolingBtn.disabled = true;
            coolingTimer.textContent = `${Math.ceil(gameState.protocolCooldowns.quantumCooling)}s`;
        } else {
            coolingBtn.classList.remove('on-cooldown');
            coolingBtn.disabled = false;
            coolingTimer.textContent = '';
        }
    }

    function updateProtocols(delta) {
        let needsRecalculation = false;

        // Decrementar temporizadores activos
        if (gameState.protocolActiveTimers.overload > 0) {
            gameState.protocolActiveTimers.overload -= delta;
            if (gameState.protocolActiveTimers.overload <= 0) {
                gameState.protocolActiveTimers.overload = 0;
                needsRecalculation = true;
            }
        }
        if (gameState.protocolActiveTimers.quantumCooling > 0) {
            gameState.protocolActiveTimers.quantumCooling -= delta;
            if (gameState.protocolActiveTimers.quantumCooling <= 0) {
                gameState.protocolActiveTimers.quantumCooling = 0;
            }
        }

        // Decrementar enfriamientos
        if (gameState.protocolCooldowns.overload > 0) {
            gameState.protocolCooldowns.overload -= delta;
            if (gameState.protocolCooldowns.overload < 0) gameState.protocolCooldowns.overload = 0;
        }
        if (gameState.protocolCooldowns.quantumCooling > 0) {
            gameState.protocolCooldowns.quantumCooling -= delta;
            if (gameState.protocolCooldowns.quantumCooling < 0) gameState.protocolCooldowns.quantumCooling = 0;
        }

        // Actualizar la UI después de la lógica
        updateProtocolUI();

        if (needsRecalculation) {
            recalculateAllStats();
        }
    }
    
    // --- RENDERIZADO Y UI ---
    function updateUI() {
        dom['fragment-count'].textContent = formatNumber(gameState.fragments);
        dom['fragments-per-second'].textContent = `${formatNumber(fragmentsPerSecond)} / s`;
        dom['heat-bar-fill'].style.width = `${Math.min(100, (coreHeat / maxCoreHeat) * 100)}%`;
        dom['data-core'].classList.toggle('overheated', coreHeat >= maxCoreHeat);
        const singularityPower = (gameState.multipliers.singularityPower || 1);
        const singularityMultiplier = 1 + (gameState.singularityPoints * 0.05 * singularityPower);
        dom['singularity-points-display'].textContent = `Puntos Sing.: ${gameState.singularityPoints} (Bono x${singularityMultiplier.toFixed(2)})`;
        dom['meta-data-display'].textContent = `Metadatos: ${formatNumber(gameState.metaData)} (+${(gameState.metaData * 0.02 * singularityMultiplier * 100).toFixed(2)}% Bonus)`;

        const allStoryKeys = Object.keys(STORY_MILESTONES);
        const nextMilestoneKey = allStoryKeys.find(key => !gameState.unlockedStoryIds.has(key));

        if (nextMilestoneKey) {
            const nextMilestone = STORY_MILESTONES[nextMilestoneKey];
            const nextMilestoneIndex = allStoryKeys.indexOf(nextMilestoneKey);
            const prevMilestoneUnlockReq = nextMilestoneIndex > 0 
                ? STORY_MILESTONES[allStoryKeys[nextMilestoneIndex - 1]].unlock 
                : 0;
            const fragmentsNeededForNext = nextMilestone.unlock - prevMilestoneUnlockReq;
            const currentProgress = gameState.stats.totalFragments - prevMilestoneUnlockReq;
            const percentage = Math.max(0, Math.min(100, (currentProgress / fragmentsNeededForNext) * 100));
            
            dom['story-progress-bar'].style.width = `${percentage}%`;
            dom['story-progress-label'].textContent = `Sincronizando Archivo... (${percentage.toFixed(1)}%)`;
        } else {
            dom['story-progress-bar'].style.width = '100%';
            dom['story-progress-label'].textContent = 'Sincronización Completa';
        }
    }
    
    function updateVisibleUpgradesPanel() {
        if (dom['upgrades-panel'] && dom['upgrades-panel'].classList.contains('visible')) {
            renderUpgrades();
        }
    }

    function renderAllPanels() {
        if (dom['upgrades-list']) renderUpgrades();
        if (dom['archives-list']) renderArchives();
        if (dom['achievements-list']) renderAchievements();
        if (dom['stats-list']) renderStats();
        if (dom['prestige-section']) updateSystemPanel();
    }
    
    // --- INICIALIZACIÓN ---
    function initializeGame() {
        loadGame();

        if (gameState.gameFinished && dom['simulations-button']) {
            dom['simulations-button'].classList.remove('hidden');
        }

        if (gameState.lastSaveTimestamp) {
            const now = Date.now();
            const offlineTimeInSeconds = (now - gameState.lastSaveTimestamp) / 1000;
            const maxOfflineTime = 7 * 24 * 60 * 60; 
            const effectiveOfflineTime = Math.min(offlineTimeInSeconds, maxOfflineTime);
            if (effectiveOfflineTime > 10) {
                recalculateAllStats(); 
                const fragmentsEarnedOffline = fragmentsPerSecond * effectiveOfflineTime;
                gameState.fragments += fragmentsEarnedOffline;
                gameState.stats.totalFragments += fragmentsEarnedOffline;
                dom['offline-fragments-earned'].textContent = formatNumber(fragmentsEarnedOffline);
                dom['offline-modal'].classList.add('visible');
            }
        }

        gameState.unlockedStoryIds.forEach(id => STORY_MILESTONES[id]?.apply(gameState));
        Object.keys(UPGRADES).forEach(key => checkUpgradeMilestones(key, true));

        dom['data-core'].addEventListener('click', (e) => {
            if (dom['game-music'].paused) {
                playAudio(dom['game-music']);
            }
            if (coreHeat >= maxCoreHeat) return;

            if (gameState.protocolActiveTimers.quantumCooling <= 0) {
                coreHeat += HEAT_PER_CLICK;
            }
            
            let earned = clickPower;
            if (gameState.unlockedStoryIds.has('log_008')) {
                earned += fragmentsPerSecond * 0.001;
            }

            gameState.fragments += earned;
            gameState.stats.totalFragments += earned;
            gameState.stats.totalClicks++;

            const fb = document.createElement('div');
            fb.className = 'click-feedback';
            fb.textContent = `+${formatNumber(earned)}`;
            const coreRect = dom['core-container'].getBoundingClientRect();
            fb.style.left = `${e.clientX - coreRect.left}px`;
            fb.style.top = `${e.clientY - coreRect.top}px`;
            dom['click-feedback-container'].appendChild(fb);
            setTimeout(() => fb.remove(), 1500);
        });

        // Event Listeners para botones de protocolo (CORREGIDOS)
        dom['protocol-overload-button'].addEventListener('click', () => {
            if (gameState.protocolCooldowns.overload <= 0) {
                gameState.protocolActiveTimers.overload = PROTOCOLS.overload.duration;
                gameState.protocolCooldowns.overload = PROTOCOLS.overload.cooldown;
                
                recalculateAllStats();
                updateProtocolUI();
                showToast("Protocolo Sobrecarga Activado!");
            }
        });

        dom['protocol-quantum-cooling-button'].addEventListener('click', () => {
            if (gameState.protocolCooldowns.quantumCooling <= 0) {
                gameState.protocolActiveTimers.quantumCooling = PROTOCOLS.quantumCooling.duration;
                gameState.protocolCooldowns.quantumCooling = PROTOCOLS.quantumCooling.cooldown;

                updateProtocolUI();
                showToast("Enfriamiento Cuántico Iniciado!");
            }
        });

        if (dom['simulations-button']) {
            dom['simulations-button'].addEventListener('click', () => {
                window.location.href = 'menu.html';
            });
        }
        
        const panels = ['upgrades', 'achievements', 'archives', 'system', 'stats', 'options'];
        panels.forEach(p => {
            if (dom[`${p}-button`]) {
                dom[`${p}-button`].onclick = () => {
                    toggleActiveAnomaly(false);
                    renderAllPanels();
                    dom[`${p}-panel`].classList.add('visible'); 
                };
            }
            if (dom[`close-${p}-button`]) {
                dom[`close-${p}-button`].onclick = () => {
                    dom[`${p}-panel`].classList.remove('visible');
                    toggleActiveAnomaly(true);
                };
            }
        });
        
        if (dom['archives-list']) {
            dom['archives-list'].addEventListener('click', e => {
                const target = e.target.closest('.archive-item');
                if (target && target.dataset.id) openStoryModal(target.dataset.id);
            });
        }

        ['close-story-modal-button', 'close-offline-modal-button', 'close-end-game-button'].forEach(id => {
            if (dom[id]) dom[id].onclick = () => dom[id].closest('.modal-overlay').classList.remove('visible');
        });

        dom['manual-save-button'].onclick = () => saveGame(true);
        dom['wipe-save-button'].onclick = wipeSave;
        dom['music-volume'].oninput = () => { updateAudioVolume(); localStorage.setItem('musicVolume', dom['music-volume'].value); };
        dom['sfx-volume'].oninput = () => { updateAudioVolume(); localStorage.setItem('sfxVolume', dom['sfx-volume'].value); };
        dom['prestige-button'].onclick = performPrestige;
        dom['ascension-button'].onclick = performAscension;

        document.querySelectorAll('.buy-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                buyAmount = (amount === 'max') ? 'max' : parseInt(amount, 10);
                document.querySelectorAll('.buy-amount-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderUpgrades();
            });
        });

        if (!localStorage.getItem(SAVE_KEY)) {
            dom['awakening-overlay'].classList.add('visible');
            dom['awakening-text'].textContent = '> PROTOCOLO DE REACTIVACIÓN INICIADO...';
            setTimeout(() => dom['awakening-overlay'].classList.remove('visible'), 2500);
        } else {
            dom['awakening-overlay'].style.display = 'none';
        }

        window.addEventListener('focus', () => {
            loadGame();
            recalculateAllStats();
        });

        // Sincronizar UI y luego calcular todo antes de empezar el juego
        updateProtocolUI();
        recalculateAllStats();
        renderAllPanels();
        setInterval(gameTick, TICK_RATE);
        setInterval(() => saveGame(false), 30000);
    }
    
    // --- FUNCIONES DE SOPORTE ---
    function saveGame(isManual = false) { 
        gameState.lastSaveTimestamp = Date.now(); 
        const plainState = { 
            ...gameState, 
            unlockedStoryIds: [...gameState.unlockedStoryIds], 
            unlockedMilestones: [...gameState.unlockedMilestones], 
            achievements: [...gameState.achievements] 
        }; 
        localStorage.setItem(SAVE_KEY, JSON.stringify(plainState)); 
        if (isManual) showToast("Progreso Guardado"); 
    }

    function loadGame() { 
        const savedGame = localStorage.getItem(SAVE_KEY); 
        if (!gameState) {
            gameState = getInitialGameState(); 
        }
        if (savedGame) { 
            const loaded = JSON.parse(savedGame); 
            const freshState = getInitialGameState();
            Object.keys(freshState).forEach(key => { 
                if (loaded[key] !== undefined) { 
                    if (['unlockedStoryIds', 'unlockedMilestones', 'achievements'].includes(key)) { 
                        freshState[key] = new Set(loaded[key]); 
                    } else if (typeof freshState[key] === 'object' && !Array.isArray(freshState[key]) && freshState[key] !== null) { 
                        Object.assign(freshState[key], loaded[key]); 
                    } else { 
                        freshState[key] = loaded[key]; 
                    } 
                } 
            });
            gameState = freshState;
        } 
        dom['music-volume'].value = localStorage.getItem('musicVolume') || 0.2; 
        dom['sfx-volume'].value = localStorage.getItem('sfxVolume') || 0.4; 
        updateAudioVolume(); 
    }

    function wipeSave() { if (confirm("¿ESTÁS SEGURO? Se borrará TODO tu progreso.") && confirm("CONFIRMACIÓN FINAL: ¿Realmente quieres borrar todo?")) { localStorage.removeItem(SAVE_KEY); window.location.reload(); } }
    
    function buyUpgrade(key) {
        const { cost, amount } = calculateBulkUpgradeCost(key);
        if (amount > 0 && gameState.fragments >= cost) {
            gameState.fragments -= cost;
            const oldLevel = gameState.upgradeLevels[key];
            gameState.upgradeLevels[key] += amount;
            playAudio(dom['upgrade-sound']);
            for(let i = 1; i <= amount; i++) {
                checkUpgradeMilestones(key, false, oldLevel + i);
            }
            recalculateAllStats();
            renderUpgrades();
        }
    }

    function checkUpgradeMilestones(key, isSilent, specificLevel = null) {
        const level = specificLevel ?? gameState.upgradeLevels[key];
        UPGRADES[key].milestones.forEach(m => {
            const id = `${key}-${m}`;
            if ((specificLevel && level === m) || (!specificLevel && level >= m)) {
                if (!gameState.unlockedMilestones.has(id)) {
                    gameState.unlockedMilestones.add(id);
                    const multKey = (key === 'heatSink') ? 'maxHeat' : (key === 'clickAlgorithm') ? 'clickPower' : key;
                    gameState.multipliers[multKey] *= 2;
                    if (!isSilent) showToast(`Hito: ¡${UPGRADES[key].name} x2 Potencia!`);
                }
            }
        });
    }

    function performPrestige() { 
        const gain = calculatePrestigeGain(); 
        if (gain > 0 && confirm(`¿Reiniciar para obtener ${formatNumber(gain)} Metadatos?`)) { 
            const persistentData = {
                singularityPoints: gameState.singularityPoints,
                stats: { 
                    ...gameState.stats, 
                    prestigeCount: gameState.stats.prestigeCount + 1, 
                    totalMetaData: gameState.stats.totalMetaData + gain 
                },
                achievements: gameState.achievements,
                knowledgeShards: gameState.knowledgeShards,
                skillLevels: gameState.skillLevels,
                multipliers: { ...gameState.multipliers },
                gameFinished: gameState.gameFinished
            };
            const meta = gameState.metaData + gain; 
            gameState = getInitialGameState(); 
            Object.assign(gameState, persistentData); 
            gameState.metaData = meta; 
            saveGame(); 
            window.location.reload(); 
        } 
    }
    function performAscension() { 
        const gain = calculateAscensionGain(); 
        if (gain > 0 && confirm(`¿ASCENDER? Esto reiniciará TODO (excepto habilidades) a cambio de ${gain} Puntos de Singularidad.`)) { 
            const persistentData = {
                stats: { 
                    ...gameState.stats, 
                    ascensionCount: gameState.stats.ascensionCount + 1 
                },
                achievements: gameState.achievements,
                knowledgeShards: gameState.knowledgeShards,
                skillLevels: gameState.skillLevels,
                multipliers: { ...gameState.multipliers },
                gameFinished: gameState.gameFinished
            };
            const sing = gameState.singularityPoints + gain; 
            gameState = getInitialGameState(); 
            Object.assign(gameState, persistentData); 
            gameState.singularityPoints = sing; 
            saveGame(); 
            window.location.reload(); 
        } 
    }
    
    function spawnRandomEvent() { const a = document.createElement('div'); a.className = 'data-anomaly'; a.style.top = `${Math.random()*80+10}%`; a.style.left = `${Math.random()*80+10}%`; a.onclick = () => { const r = (fragmentsPerSecond * 60) + (clickPower * 15); gameState.fragments += r; showToast(`Anomalía: +${formatNumber(r)} fragmentos`); a.remove(); }; dom['random-event-container'].appendChild(a); setTimeout(() => a.remove(), 8000); }
    function toggleActiveAnomaly(show) { const anomaly = dom['random-event-container'].querySelector('.data-anomaly'); if (anomaly) { if (show) { anomaly.classList.remove('hidden-by-panel'); } else { anomaly.classList.add('hidden-by-panel'); } } }
    function isAnyPanelVisible() { const panels = ['upgrades', 'achievements', 'archives', 'system', 'stats', 'options']; return panels.some(p => dom[`${p}-panel`] && dom[`${p}-panel`].classList.contains('visible')); }
    
    function formatNumber(n) {
        if (isNaN(n) || n === null) return '0';
        n = Math.floor(n);
        if (n < 1e6) {
            return n.toLocaleString('es-ES');
        }
    
        const suffixes = ["M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
        const i = Math.floor(Math.log10(n) / 3) - 2;

        if (i >= suffixes.length) {
            return n.toExponential(2).replace('+', '').replace('e', 'e');
        }
        
        const value = n / Math.pow(10, (i + 2) * 3);
        return `${value.toFixed(2)} ${suffixes[i]}`;
    }

    const calculatePrestigeGain = () => {
        let baseGain = gameState.stats.totalFragments >= 1e6 ? Math.floor(Math.pow(gameState.stats.totalFragments / 1e6, 0.5)) : 0;
        if (gameState.skillLevels['meta_gain_1']) {
            baseGain *= (1 + 0.10 * gameState.skillLevels['meta_gain_1']);
        }
        return Math.floor(baseGain);
    };
    const calculateAscensionGain = () => gameState.stats.totalMetaData >= 1e3 ? Math.floor(Math.pow(gameState.stats.totalMetaData / 1e3, 0.5)) : 0;
    
    const calculateSingleUpgradeCost = (key, level) => Math.ceil(UPGRADES[key].cost * Math.pow(UPGRADES[key].mult, level));

    function calculateMaxBuy(key) {
        let currentLevel = gameState.upgradeLevels[key];
        let fragments = gameState.fragments;
        let canBuy = 0;
        let totalCost = 0;
        if (calculateSingleUpgradeCost(key, currentLevel) <= 0) return {amount: 0, cost: 0};
        while (true) {
            const nextCost = calculateSingleUpgradeCost(key, currentLevel + canBuy);
            if (fragments >= nextCost) {
                fragments -= nextCost;
                totalCost += nextCost;
                canBuy++;
            } else {
                break;
            }
            if (canBuy > 10000) break; 
        }
        return { amount: canBuy, cost: totalCost };
    }

    function calculateBulkUpgradeCost(key) {
        if (buyAmount === 'max') {
            return calculateMaxBuy(key);
        }
        let totalCost = 0;
        const currentLevel = gameState.upgradeLevels[key];
        for (let i = 0; i < buyAmount; i++) {
            totalCost += calculateSingleUpgradeCost(key, currentLevel + i);
        }
        return { amount: buyAmount, cost: totalCost };
    }

    function showToast(msg) { dom['notification-toast'].textContent = msg; dom['notification-toast'].classList.add('show'); setTimeout(() => dom['notification-toast'].classList.remove('show'), 3000); }
    function playAudio(audioEl) { if (!audioEl) return; audioEl.currentTime = 0; audioEl.play().catch(()=>{}); }
    function updateAudioVolume() { dom['game-music'].volume = dom['music-volume'].value; dom['upgrade-sound'].volume = dom['sfx-volume'].value; }
    
    function checkStoryUnlocks() {
        Object.keys(STORY_MILESTONES).forEach(id => {
            const m = STORY_MILESTONES[id];
            if (!gameState.unlockedStoryIds.has(id) && gameState.stats.totalFragments >= m.unlock) {
                gameState.unlockedStoryIds.add(id);
                m.apply(gameState);
                recalculateAllStats();
                showToast(`Nuevo Archivo: ${m.title}`);
    
                if (id === 'log_009') {
                    gameState.gameFinished = true;
                    if (dom['end-game-overlay']) dom['end-game-overlay'].classList.add('visible');
                    if (dom['simulations-button']) dom['simulations-button'].classList.remove('hidden');
                }
            }
        });
    }

    function checkAchievements() { const check = (id, cond) => { if (!gameState.achievements.has(id) && cond) { gameState.achievements.add(id); showToast(`Logro: ${ACHIEVEMENTS[id].name}`); } }; check('click1', gameState.stats.totalClicks > 0); check('fragments1k', gameState.fragments >= 1e3); check('fragments1m', gameState.fragments >= 1e6); check('prestige1', gameState.stats.prestigeCount > 0); check('drones100', gameState.upgradeLevels.drones >= 100); check('overheat', coreHeat >= maxCoreHeat); check('ascend1', gameState.stats.ascensionCount > 0); }
    
    function renderUpgrades() {
        dom['upgrades-list'].innerHTML = Object.keys(UPGRADES).map(key => {
            const upg = UPGRADES[key];
            const { cost, amount } = calculateBulkUpgradeCost(key);
            const canAfford = gameState.fragments >= cost && amount > 0;
            const buttonText = `+${amount}<br>Coste: ${formatNumber(cost)}`;
            return `<div class="upgrade-item">
                        <div class="upgrade-info">
                            <h4>${upg.name} (Nivel ${formatNumber(gameState.upgradeLevels[key])})</h4>
                            <p>${upg.desc}</p>
                        </div>
                        <button class="buy-upgrade-button" data-key="${key}" ${!canAfford ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>`;
        }).join('');
        dom['upgrades-list'].querySelectorAll('.buy-upgrade-button').forEach(b => b.onclick = () => buyUpgrade(b.dataset.key));
    }

    function renderArchives() { dom['archives-list'].innerHTML = Object.keys(STORY_MILESTONES).map(id => { const m = STORY_MILESTONES[id]; const unlocked = gameState.unlockedStoryIds.has(id); return `<div class="archive-item ${unlocked ? 'unlocked' : ''}" data-id="${id}"><h4>${unlocked ? m.title : '[DATOS CORRUPTOS]'}</h4><p>${unlocked ? m.reward : '???'}</p></div>`; }).join(''); }
    function renderAchievements() { dom['achievements-list'].innerHTML = Object.keys(ACHIEVEMENTS).map(id => { const a = ACHIEVEMENTS[id]; const unlocked = gameState.achievements.has(id); return `<div class="achievement-item ${unlocked ? 'unlocked' : ''}"><h4>${a.name}</h4><p>${a.desc}</p></div>`; }).join(''); }
    function renderStats() { const s = gameState.stats; const t = (secs) => new Date(secs*1000).toISOString().substr(11, 8); dom['stats-list'].innerHTML = `<p>Tiempo de Juego: <span>${t(s.playTime)}</span></p><p>Fragmentos Totales: <span>${formatNumber(s.totalFragments)}</span></p><p>Clics Manuales: <span>${formatNumber(s.totalClicks)}</span></p><p>Reinicios de Prestigio: <span>${s.prestigeCount}</span></p><p>Ascensiones: <span>${s.ascensionCount}</span></p>`; }
    function updateSystemPanel() { const pGain = calculatePrestigeGain(); dom['prestige-status-available'].style.display = pGain > 0 ? 'block' : 'none'; dom['prestige-status-unavailable'].style.display = pGain > 0 ? 'none' : 'block'; dom['prestige-gain-display'].textContent = `${formatNumber(pGain)} Metadatos`; dom['prestige-button'].disabled = pGain <= 0; const aGain = calculateAscensionGain(); dom['ascension-status-available'].style.display = aGain > 0 ? 'block' : 'none'; dom['ascension-status-unavailable'].style.display = aGain > 0 ? 'none' : 'block'; dom['ascension-gain-display'].textContent = `${aGain} Puntos de Singularidad`; dom['ascension-button'].disabled = aGain <= 0; }
    function openStoryModal(id) { const m = STORY_MILESTONES[id]; if(m && gameState.unlockedStoryIds.has(id)) { dom['story-modal-title'].textContent = m.title; dom['story-modal-text'].textContent = m.content; dom['story-modal-reward'].textContent = m.reward; dom['story-modal'].classList.add('visible'); } }
    
    initializeGame();
});