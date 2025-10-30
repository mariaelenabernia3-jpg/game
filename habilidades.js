document.addEventListener('DOMContentLoaded', () => {
    const SAVE_KEY = 'cosmicArchivistSave_v5';
    
    // --- LÓGICA DE COSTE AJUSTADA (PRECIOS MÁS BAJOS) ---
    const SHARD_BASE_COST = 250000; // Antes: 1e6 (1 Millón)
    const SHARD_COST_MULTIPLIER = 1.18; // Antes: 1.25

    // --- DEFINICIÓN DE HABILIDADES (DEBE SER IDÉNTICA A LA DE juego.js) ---
    const SKILLS = {
        'meta_gain_1': { name: "Memoria Cósmica I", desc: "Aumenta toda la ganancia de Metadatos en un 10% por nivel.", cost: 2, maxLevel: 5 },
        'click_power_1': { name: "Sinergia de Clics I", desc: "Aumenta el poder del clic manual en un 25% por nivel.", cost: 1, maxLevel: 10 },
        'drone_power_1': { name: "Eficiencia de Drones I", desc: "Aumenta la producción de Drones en un 20% por nivel.", cost: 3, maxLevel: 10, requires: 'click_power_1' }
    };

    const dom = {
        fragmentsBalance: document.getElementById('fragments-balance'),
        metadataBalance: document.getElementById('metadata-balance'),
        shardsBalance: document.getElementById('knowledge-shards-balance'),
        buyShardButton: document.getElementById('buy-shard-button'),
        skillTreeContainer: document.getElementById('skill-tree-container'),
    };

    let gameState = {};

    function loadState() {
        const savedGame = localStorage.getItem(SAVE_KEY);
        if (savedGame) {
            const loaded = JSON.parse(savedGame);
            // Re-hidratar el estado, inicializando campos nuevos si no existen
            gameState.fragments = loaded.fragments || 0;
            gameState.metaData = loaded.metaData || 0;
            gameState.knowledgeShards = loaded.knowledgeShards || 0;
            gameState.skillLevels = loaded.skillLevels || {};
        }
    }

    function saveState() {
        // Carga el estado completo para no sobrescribir otros datos
        const fullSavedGame = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
        // Actualiza solo las partes que esta página puede modificar
        fullSavedGame.fragments = gameState.fragments;
        fullSavedGame.knowledgeShards = gameState.knowledgeShards;
        fullSavedGame.skillLevels = gameState.skillLevels;
        // Guarda el estado completo de vuelta
        localStorage.setItem(SAVE_KEY, JSON.stringify(fullSavedGame));
    }

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

    function calculateShardCost() {
        const ownedShards = gameState.knowledgeShards || 0;
        return Math.floor(SHARD_BASE_COST * Math.pow(SHARD_COST_MULTIPLIER, ownedShards));
    }

    function renderPage() {
        loadState();
        
        dom.fragmentsBalance.textContent = formatNumber(gameState.fragments);
        dom.metadataBalance.textContent = formatNumber(gameState.metaData);
        dom.shardsBalance.textContent = formatNumber(gameState.knowledgeShards);

        // Renderizar botón de compra de Fragmentos de Conocimiento
        const shardCost = calculateShardCost();
        dom.buyShardButton.innerHTML = `Sintetizar 1 por <br>${formatNumber(shardCost)} Fragmentos`;
        dom.buyShardButton.disabled = gameState.fragments < shardCost;

        // Renderizar árbol de habilidades
        dom.skillTreeContainer.innerHTML = Object.keys(SKILLS).map(key => {
            const skill = SKILLS[key];
            const currentLevel = gameState.skillLevels[key] || 0;
            
            let isLocked = false;
            if (skill.requires && (!gameState.skillLevels[skill.requires] || gameState.skillLevels[skill.requires] < 1)) {
                isLocked = true;
            }

            const isMaxed = currentLevel >= skill.maxLevel;
            const canAfford = gameState.knowledgeShards >= skill.cost;

            let buttonText = isMaxed ? 'MAX' : (isLocked ? 'Bloqueado' : `Coste: ${skill.cost} ✨`);
            let buttonClass = 'skill-buy-button';
            let itemClass = 'skill-item';
            
            if (isMaxed) {
                buttonClass += ' maxed-out';
                itemClass += ' maxed';
            } else if (!isLocked && canAfford) {
                itemClass += ' available';
            }

            return `
                <div class="${itemClass}" data-skill-key="${key}">
                    <div class="skill-info">
                        <h4>${skill.name} (Nivel ${currentLevel}/${skill.maxLevel})</h4>
                        <p>${skill.desc}</p>
                    </div>
                    <button class="${buttonClass}" ${isLocked || isMaxed || !canAfford ? 'disabled' : ''}>
                        ${buttonText}
                    </button>
                </div>
            `;
        }).join('');
    }

    function buyKnowledgeShard() {
        const cost = calculateShardCost();
        if (gameState.fragments >= cost) {
            gameState.fragments -= cost;
            gameState.knowledgeShards += 1;
            saveState();
            renderPage();
        }
    }

    function buySkill(key) {
        const skill = SKILLS[key];
        const currentLevel = gameState.skillLevels[key] || 0;
        
        if (currentLevel < skill.maxLevel && gameState.knowledgeShards >= skill.cost) {
            gameState.knowledgeShards -= skill.cost;
            gameState.skillLevels[key] = currentLevel + 1;
            saveState();
            renderPage();
        }
    }

    // --- Event Listeners ---
    dom.buyShardButton.addEventListener('click', buyKnowledgeShard);

    dom.skillTreeContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('skill-buy-button')) {
            const key = e.target.closest('.skill-item').dataset.skillKey;
            if (key) {
                buySkill(key);
            }
        }
    });

    // --- Inicialización y actualización en "tiempo real" ---
    renderPage();
    setInterval(renderPage, 500); // Actualiza la UI cada medio segundo para ver los cambios del juego principal
});