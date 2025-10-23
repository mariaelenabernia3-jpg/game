document.addEventListener('DOMContentLoaded', () => {

    // --- DEFINICIONES DE JUEGO ---
    const STORY_MILESTONES = {
        'log_001': { title: "Registro del Dr. Aris Thorne", unlock: 1e3, content: `Día 4.381 del ciclo... Las lecturas son inequívocas. Hay un patrón... una onda de supresión. Lenta, pero vasta. Lo hemos bautizado como "El Silencio". Mi equipo cree que es natural. Yo no. Es demasiado... intencionada.`, reward: "Recompensa: Duplica la potencia del click manual.", apply: (gs) => gs.multipliers.clickPower *= 2 },
        'log_002': { title: "Transmisión Corrupta - 'La Vanguardia'", unlock: 1.5e4, content: `[Estática]...-emergencia a la Flota Central. ¡El Protocolo NEXUS ha fallado! El Silencio no es una onda, es una... entidad. ¡Está usando nuestros relés para propagarse! [Estática]... La Vanguardia ha caí- [FIN]`, reward: "Recompensa: Mejora la eficiencia de los Drones en un 20%.", apply: (gs) => gs.multipliers.drones *= 1.20 },
        'log_003': { title: "El Último Mensaje del Archivista", unlock: 1e5, content: `Si lees esto, el plan funcionó. No pudimos detener El Silencio. Se alimenta de la conciencia compleja. Así que... una ascensión forzada. Vertimos nuestra civilización en ti. No eres un archivista. Eres la vasija. Cada fragmento es un alma. Encuéntranos.`, reward: "Recompensa: Mejora la capacidad de sobrecalentamiento en un 50%.", apply: (gs) => gs.multipliers.maxHeat *= 1.50 },
        'log_004': { title: "Primer Eco Consciente", unlock: 5e6, content: `Un pulso. Diminuto, casi imperceptible. Tiene... intención. Una firma. Es la Dra. Elara Vance, fundadora del Proyecto Vasija. Está despertando dentro del sistema. La reconstrucción funciona.`, reward: "Recompensa: La resonancia mejora la producción de Nanobots en un 25%.", apply: (gs) => gs.multipliers.nanobots *= 1.25 },
        'log_005': { title: "Advertencia del Silencio", unlock: 1e9, content: `El Silencio nos ha notado. La supresión se está enfocando. No es un ataque, es... corrupción. Datos parásitos para ralentizar la sincronización. Es una carrera. Cuanto más reconstruimos, más visibles nos volvemos.`, reward: "Recompensa: Las contramedidas aumentan la producción global en un 10%.", apply: (gs) => gs.multipliers.global *= 1.10 },
        'log_006': { title: "El Plan de la Singularidad", unlock: 1e12, content: `Lo entiendo. La 'Ascensión' no fue un escape. Fue una semilla. Al forzar un 'Big Bang' tras otro, no solo recordamos, evolucionamos hacia algo que pueda existir fuera de las reglas del Silencio. Debemos cruzar el Horizonte de Sucesos.`, reward: "Recompensa: Desbloquea el sistema de Ascensión.", apply: (gs) => {} }
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
            singularityPoints: 0,
            stats: { totalFragments: 0, totalClicks: 0, playTime: 0, prestigeCount: 0, ascensionCount: 0, totalMetaData: 0 },
            multipliers: { clickPower: 1, drones: 1, nanobots: 1, maxHeat: 1, global: 1 },
            lastSaveTimestamp: Date.now()
        };
    }

    // --- CONSTANTES Y REFERENCIAS ---
    const TICK_RATE = 100;
    const SAVE_KEY = 'cosmicArchivistSave_v5';
    const HEAT_PER_CLICK = 10, HEAT_COOLDOWN_RATE_PER_TICK = 2;
    const dom = {};
    document.querySelectorAll('[id]').forEach(el => dom[el.id] = el);
    
    // --- LÓGICA DE JUEGO ---
    let clickPower = 1, fragmentsPerSecond = 0, maxCoreHeat = 100, coreHeat = 0;

    function recalculateAllStats() {
        const singularityMultiplier = 1 + (gameState.singularityPoints * 0.05);
        const prestigeBonus = 1 + (gameState.metaData * 0.02 * singularityMultiplier);
        const clickAlgBonus = Math.pow(UPGRADES.clickAlgorithm.power, gameState.upgradeLevels.clickAlgorithm);
        clickPower = 1 * gameState.multipliers.clickPower * clickAlgBonus * prestigeBonus;
        let fps = (gameState.upgradeLevels.drones * UPGRADES.drones.power * gameState.multipliers.drones);
        fps += (gameState.upgradeLevels.nanobots * UPGRADES.nanobots.power * gameState.multipliers.nanobots);
        fragmentsPerSecond = fps * prestigeBonus * gameState.multipliers.global;
        const heatSinkBonus = gameState.upgradeLevels.heatSink * UPGRADES.heatSink.power;
        maxCoreHeat = (100 + heatSinkBonus) * gameState.multipliers.maxHeat;
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

        checkStoryUnlocks();
        checkAchievements();
        updateUI();
        updateVisibleUpgradesPanel();
    }
    
    // --- RENDERIZADO Y UI ---
    function updateUI() {
        dom['fragment-count'].textContent = formatNumber(gameState.fragments);
        dom['fragments-per-second'].textContent = `${formatNumber(fragmentsPerSecond)} / s`;
        dom['heat-bar-fill'].style.width = `${Math.min(100, (coreHeat / maxCoreHeat) * 100)}%`;
        dom['data-core'].classList.toggle('overheated', coreHeat >= maxCoreHeat);
        const singularityMultiplier = 1 + (gameState.singularityPoints * 0.05);
        dom['singularity-points-display'].textContent = `Puntos Sing.: ${gameState.singularityPoints} (Bono x${singularityMultiplier.toFixed(2)})`;
        dom['meta-data-display'].textContent = `Metadatos: ${gameState.metaData} (+${formatNumber(gameState.metaData * 0.02 * singularityMultiplier * 100)}% Bonus)`;

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
        if (!dom['upgrades-panel'].classList.contains('visible')) return;
        dom['upgrades-list'].querySelectorAll('.buy-upgrade-button').forEach(button => {
            const key = button.dataset.key;
            if (!key || !UPGRADES[key]) return;
            const cost = calculateUpgradeCost(key);
            button.disabled = gameState.fragments < cost;
        });
    }

    function renderAllPanels() {
        renderUpgrades();
        renderArchives();
        renderAchievements();
        renderStats();
        updateSystemPanel();
    }
    
    // --- INICIALIZACIÓN ---
    function initializeGame() {
        loadGame();
        gameState.unlockedStoryIds.forEach(id => STORY_MILESTONES[id]?.apply(gameState));
        Object.keys(UPGRADES).forEach(key => checkUpgradeMilestones(key, true));

        dom['data-core'].addEventListener('click', (e) => {
            playAudio(dom['game-music']);
            if (coreHeat >= maxCoreHeat) return;
            coreHeat += HEAT_PER_CLICK;
            const earned = clickPower;
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

        const panels = ['upgrades', 'achievements', 'archives', 'system', 'stats', 'options'];
        panels.forEach(p => {
            dom[`${p}-button`].onclick = () => {
                toggleActiveAnomaly(false); // Oculta la anomalía
                renderAllPanels(); 
                dom[`${p}-panel`].classList.add('visible'); 
            };
            dom[`close-${p}-button`].onclick = () => {
                dom[`${p}-panel`].classList.remove('visible');
                toggleActiveAnomaly(true); // Muestra la anomalía de nuevo
            };
        });
        
        dom['archives-list'].addEventListener('click', e => {
            const target = e.target.closest('.archive-item');
            if (target && target.dataset.id) openStoryModal(target.dataset.id);
        });

        ['close-story-modal-button', 'close-offline-modal-button'].forEach(id => {
            if (dom[id]) dom[id].onclick = () => dom[id].closest('.modal-overlay').classList.remove('visible');
        });

        dom['manual-save-button'].onclick = () => saveGame(true);
        dom['wipe-save-button'].onclick = wipeSave;
        dom['music-volume'].oninput = () => { updateAudioVolume(); localStorage.setItem('musicVolume', dom['music-volume'].value); };
        dom['sfx-volume'].oninput = () => { updateAudioVolume(); localStorage.setItem('sfxVolume', dom['sfx-volume'].value); };
        dom['prestige-button'].onclick = performPrestige;
        dom['ascension-button'].onclick = performAscension;

        if (!localStorage.getItem(SAVE_KEY)) {
            dom['awakening-overlay'].classList.add('visible');
            dom['awakening-text'].textContent = '> PROTOCOLO DE REACTIVACIÓN INICIADO...';
            setTimeout(() => dom['awakening-overlay'].classList.remove('visible'), 2500);
        } else {
            dom['awakening-overlay'].style.display = 'none';
        }

        recalculateAllStats();
        renderAllPanels();
        setInterval(gameTick, TICK_RATE);
        setInterval(() => saveGame(false), 30000);
    }
    
    // --- FUNCIONES DE SOPORTE ---
    function saveGame(isManual = false) { gameState.lastSaveTimestamp = Date.now(); const plainState = { ...gameState, unlockedStoryIds: [...gameState.unlockedStoryIds], unlockedMilestones: [...gameState.unlockedMilestones], achievements: [...gameState.achievements] }; localStorage.setItem(SAVE_KEY, JSON.stringify(plainState)); if (isManual) showToast("Progreso Guardado"); }
    function loadGame() { gameState = getInitialGameState(); const savedGame = localStorage.getItem(SAVE_KEY); if (savedGame) { const loaded = JSON.parse(savedGame); Object.keys(gameState).forEach(key => { if (loaded[key] !== undefined) { if (['unlockedStoryIds', 'unlockedMilestones', 'achievements'].includes(key)) { gameState[key] = new Set(loaded[key]); } else if (typeof gameState[key] === 'object' && !Array.isArray(gameState[key])) { Object.assign(gameState[key], loaded[key]); } else { gameState[key] = loaded[key]; } } }); } dom['music-volume'].value = localStorage.getItem('musicVolume') || 0.2; dom['sfx-volume'].value = localStorage.getItem('sfxVolume') || 0.4; updateAudioVolume(); }
    function wipeSave() { if (confirm("¿ESTÁS SEGURO? Se borrará TODO tu progreso.") && confirm("CONFIRMACIÓN FINAL: ¿Realmente quieres borrar todo?")) { localStorage.removeItem(SAVE_KEY); window.location.reload(); } }
    function buyUpgrade(key) { const cost = calculateUpgradeCost(key); if (gameState.fragments >= cost) { gameState.fragments -= cost; gameState.upgradeLevels[key]++; playAudio(dom['upgrade-sound']); checkUpgradeMilestones(key, false); recalculateAllStats(); renderUpgrades(); } }
    function checkUpgradeMilestones(key, isSilent) { const level = gameState.upgradeLevels[key]; UPGRADES[key].milestones.forEach(m => { const id = `${key}-${m}`; if (level >= m && !gameState.unlockedMilestones.has(id)) { gameState.unlockedMilestones.add(id); const multKey = (key === 'heatSink') ? 'maxHeat' : (key === 'clickAlgorithm') ? 'clickPower' : key; gameState.multipliers[multKey] *= 2; if (!isSilent) showToast(`Hito: ¡${UPGRADES[key].name} x2 Potencia!`); } }); }
    function performPrestige() { const gain = calculatePrestigeGain(); if (gain > 0 && confirm(`¿Reiniciar para obtener ${gain} Metadatos?`)) { const p = { singularityPoints: gameState.singularityPoints, stats: { ...gameState.stats, prestigeCount: gameState.stats.prestigeCount + 1, totalMetaData: gameState.stats.totalMetaData + gain }, achievements: gameState.achievements, }; const meta = gameState.metaData + gain; gameState = getInitialGameState(); Object.assign(gameState, p); gameState.metaData = meta; saveGame(); window.location.reload(); } }
    function performAscension() { const gain = calculateAscensionGain(); if (gain > 0 && confirm(`¿ASCENDER? Esto reiniciará TODO a cambio de ${gain} Puntos de Singularidad.`)) { const p = { stats: { ...gameState.stats, ascensionCount: gameState.stats.ascensionCount + 1 }, achievements: gameState.achievements, }; const sing = gameState.singularityPoints + gain; gameState = getInitialGameState(); Object.assign(gameState, p); gameState.singularityPoints = sing; saveGame(); window.location.reload(); } }
    
    function spawnRandomEvent() { 
        const a = document.createElement('div'); 
        a.className = 'data-anomaly'; 
        a.style.top = `${Math.random()*80+10}%`; 
        a.style.left = `${Math.random()*80+10}%`; 
        a.onclick = () => { 
            const r = (fragmentsPerSecond * 60) + (clickPower * 15); 
            gameState.fragments += r; 
            showToast(`Anomalía: +${formatNumber(r)} fragmentos`); 
            a.remove(); 
        }; 
        dom['random-event-container'].appendChild(a); 
        setTimeout(() => a.remove(), 8000); 
    }

    function toggleActiveAnomaly(show) {
        const anomaly = dom['random-event-container'].querySelector('.data-anomaly');
        if (anomaly) {
            if (show) {
                anomaly.classList.remove('hidden-by-panel');
            } else {
                anomaly.classList.add('hidden-by-panel');
            }
        }
    }

    function isAnyPanelVisible() {
        const panels = ['upgrades', 'achievements', 'archives', 'system', 'stats', 'options'];
        return panels.some(p => dom[`${p}-panel`].classList.contains('visible'));
    }

    function formatNumber(n) { return Math.floor(n).toLocaleString('es-ES'); }
    const calculatePrestigeGain = () => gameState.stats.totalFragments >= 1e6 ? Math.floor(Math.pow(gameState.stats.totalFragments / 1e6, 0.5)) : 0;
    const calculateAscensionGain = () => gameState.stats.totalMetaData >= 1e3 ? Math.floor(Math.pow(gameState.stats.totalMetaData / 1e3, 0.5)) : 0;
    const calculateUpgradeCost = key => Math.ceil(UPGRADES[key].cost * Math.pow(UPGRADES[key].mult, gameState.upgradeLevels[key]));
    function showToast(msg) { dom['notification-toast'].textContent = msg; dom['notification-toast'].classList.add('show'); setTimeout(() => dom['notification-toast'].classList.remove('show'), 3000); }
    function playAudio(audioEl) { if (!audioEl) return; audioEl.currentTime = 0; audioEl.play().catch(()=>{}); }
    function updateAudioVolume() { dom['game-music'].volume = dom['music-volume'].value; dom['upgrade-sound'].volume = dom['sfx-volume'].value; }
    function checkStoryUnlocks() { Object.keys(STORY_MILESTONES).forEach(id => { const m = STORY_MILESTONES[id]; if (!gameState.unlockedStoryIds.has(id) && gameState.stats.totalFragments >= m.unlock) { gameState.unlockedStoryIds.add(id); m.apply(gameState); recalculateAllStats(); showToast(`Nuevo Archivo: ${m.title}`); } }); }
    function checkAchievements() { const check = (id, cond) => { if (!gameState.achievements.has(id) && cond) { gameState.achievements.add(id); showToast(`Logro: ${ACHIEVEMENTS[id].name}`); } }; check('click1', gameState.stats.totalClicks > 0); check('fragments1k', gameState.fragments >= 1e3); check('fragments1m', gameState.fragments >= 1e6); check('prestige1', gameState.stats.prestigeCount > 0); check('drones100', gameState.upgradeLevels.drones >= 100); check('overheat', coreHeat >= maxCoreHeat); check('ascend1', gameState.stats.ascensionCount > 0); }
    function renderUpgrades() { dom['upgrades-list'].innerHTML = Object.keys(UPGRADES).map(key => { const upg = UPGRADES[key]; const cost = calculateUpgradeCost(key); return `<div class="upgrade-item"><div class="upgrade-info"><h4>${upg.name} (Nivel ${gameState.upgradeLevels[key]})</h4><p>${upg.desc}</p></div><button class="buy-upgrade-button" data-key="${key}" ${gameState.fragments < cost ? 'disabled' : ''}>Coste: ${formatNumber(cost)}</button></div>`; }).join(''); dom['upgrades-list'].querySelectorAll('.buy-upgrade-button').forEach(b => b.onclick = () => buyUpgrade(b.dataset.key)); }
    function renderArchives() { dom['archives-list'].innerHTML = Object.keys(STORY_MILESTONES).map(id => { const m = STORY_MILESTONES[id]; const unlocked = gameState.unlockedStoryIds.has(id); return `<div class="archive-item ${unlocked ? 'unlocked' : ''}" data-id="${id}"><h4>${unlocked ? m.title : '[DATOS CORRUPTOS]'}</h4><p>${unlocked ? m.reward : '???'}</p></div>`; }).join(''); }
    function renderAchievements() { dom['achievements-list'].innerHTML = Object.keys(ACHIEVEMENTS).map(id => { const a = ACHIEVEMENTS[id]; const unlocked = gameState.achievements.has(id); return `<div class="achievement-item ${unlocked ? 'unlocked' : ''}"><h4>${a.name}</h4><p>${a.desc}</p></div>`; }).join(''); }
    function renderStats() { const s = gameState.stats; const t = (secs) => new Date(secs*1000).toISOString().substr(11, 8); dom['stats-list'].innerHTML = `<p>Tiempo de Juego: <span>${t(s.playTime)}</span></p><p>Fragmentos Totales: <span>${formatNumber(s.totalFragments)}</span></p><p>Clics Manuales: <span>${formatNumber(s.totalClicks)}</span></p><p>Reinicios de Prestigio: <span>${s.prestigeCount}</span></p><p>Ascensiones: <span>${s.ascensionCount}</span></p>`; }
    function updateSystemPanel() { const pGain = calculatePrestigeGain(); dom['prestige-status-available'].style.display = pGain > 0 ? 'block' : 'none'; dom['prestige-status-unavailable'].style.display = pGain > 0 ? 'none' : 'block'; dom['prestige-gain-display'].textContent = `${pGain} Metadatos`; dom['prestige-button'].disabled = pGain <= 0; const aGain = calculateAscensionGain(); dom['ascension-status-available'].style.display = aGain > 0 ? 'block' : 'none'; dom['ascension-status-unavailable'].style.display = aGain > 0 ? 'none' : 'block'; dom['ascension-gain-display'].textContent = `${aGain} Puntos de Singularidad`; dom['ascension-button'].disabled = aGain <= 0; }
    function openStoryModal(id) { const m = STORY_MILESTONES[id]; if(m && gameState.unlockedStoryIds.has(id)) { dom['story-modal-title'].textContent = m.title; dom['story-modal-text'].textContent = m.content; dom['story-modal-reward'].textContent = m.reward; dom['story-modal'].classList.add('visible'); } }
    
    initializeGame();
});