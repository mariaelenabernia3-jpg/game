document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DE AUDIO ---
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');

    // --- BOTONES PRINCIPALES ---
    const allButtons = document.querySelectorAll('button');
    const startButton = document.getElementById('start-button');
    const optionsButton = document.getElementById('options-button');
    const creditsButton = document.getElementById('credits-button');
    const challengesButton = document.getElementById('challenges-button');

    // --- PANELES ---
    const optionsPanel = document.getElementById('options-panel');
    const creditsPanel = document.getElementById('credits-panel');
    const challengesPanel = document.getElementById('challenges-panel');

    // --- BOTONES DENTRO DE LOS PANELES ---
    const closePanelButtons = document.querySelectorAll('.close-panel-button');
    const resetProgressButton = document.getElementById('reset-progress-button');
    const musicToggleButton = document.getElementById('music-toggle-button');
    const sfxToggleButton = document.getElementById('sfx-toggle-button');

    // --- LÓGICA DE DESAFÍOS ---
    const challengesListContainer = document.getElementById('challenges-list');
    const CHALLENGES = {
        'produccion_cero': { name: 'Producción Cero', desc: 'La producción pasiva (FPS) está desactivada. El poder de los clics se multiplica por 1000.', goal: 'Alcanzar 1 Billón (1e9) de fragmentos.', reward: 'El bonus de los clics del "Algoritmo de Compresión" se aplica con una potencia de ^1.1 (multiplicador masivo a largo plazo).' },
        'sobrecalentamiento_critico': { name: 'Sobrecalentamiento Crítico', desc: 'El calor se genera 10 veces más rápido y no se enfría pasivamente.', goal: 'Comprar 500 niveles del "Disipador del Núcleo".', reward: 'Desbloquea una reducción permanente del 10% en la generación de calor por clic.' }
    };
    
    // --- ESTADO INICIAL DE AUDIO ---
    let isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    let areSfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';

    // --- FUNCIONES ---
    function updateAudioButtons() {
        musicToggleButton.textContent = isMusicEnabled ? 'Activada' : 'Desactivada';
        musicToggleButton.classList.toggle('toggled-on', isMusicEnabled);
        sfxToggleButton.textContent = areSfxEnabled ? 'Activados' : 'Desactivados';
        sfxToggleButton.classList.toggle('toggled-on', areSfxEnabled);
    }

    function playMusic() {
        if (isMusicEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(e => console.log("Interacción del usuario necesaria para la música."));
        }
    }

    function playClickSound() {
        if (areSfxEnabled) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
    }

    function renderChallenges(completedChallenges = new Set()) {
        challengesListContainer.innerHTML = Object.keys(CHALLENGES).map(key => {
            const challenge = CHALLENGES[key];
            const isCompleted = completedChallenges.has(key);
            return `
                <div class="challenge-item ${isCompleted ? 'completed' : ''}">
                    <div class="challenge-info">
                        <h4>${challenge.name} ${isCompleted ? '(Completado)' : ''}</h4>
                        <p><strong>Reglas:</strong> ${challenge.desc}</p>
                        <p><strong>Objetivo:</strong> ${challenge.goal}</p>
                        <p><strong>Recompensa:</strong> ${challenge.reward}</p>
                    </div>
                    <div class="challenge-actions">
                        <button class="start-challenge-button" data-challenge-id="${key}" ${isCompleted ? 'disabled' : ''}>
                            ${isCompleted ? 'Completado' : 'Iniciar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- LÓGICA PRINCIPAL Y EVENT LISTENERS ---

    // Navegar al juego
    startButton.addEventListener('click', () => {
        localStorage.removeItem('activeChallenge');
        document.body.style.opacity = 0;
        setTimeout(() => window.location.href = 'juego.html', 1000);
    });

    // Abrir paneles
    optionsButton.addEventListener('click', () => optionsPanel.classList.add('visible'));
    creditsButton.addEventListener('click', () => creditsPanel.classList.add('visible'));
    if(challengesButton) challengesButton.addEventListener('click', () => challengesPanel.classList.add('visible'));

    // Cerrar paneles
    closePanelButtons.forEach(button => {
        button.addEventListener('click', () => button.closest('.panel').classList.remove('visible'));
    });

    // Toggle de música y SFX
    musicToggleButton.addEventListener('click', () => {
        isMusicEnabled = !isMusicEnabled;
        localStorage.setItem('musicEnabled', isMusicEnabled);
        updateAudioButtons();
        isMusicEnabled ? playMusic() : backgroundMusic.pause();
    });
    sfxToggleButton.addEventListener('click', () => {
        areSfxEnabled = !areSfxEnabled;
        localStorage.setItem('sfxEnabled', areSfxEnabled);
        updateAudioButtons();
        if (areSfxEnabled) playClickSound();
    });
    
    // Borrado de progreso
    resetProgressButton.addEventListener('click', () => {
        const isConfirmed = confirm('¿Estás seguro de que quieres borrar todo tu progreso? Esta acción es irreversible.');
        if (isConfirmed) {
            localStorage.clear();
            alert('Progreso borrado con éxito.');
            window.location.reload();
        }
    });

    // Iniciar un desafío
    challengesListContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('start-challenge-button')) {
            const challengeId = e.target.dataset.challengeId;
            if (challengeId) {
                const isConfirmed = confirm(`Vas a iniciar la simulación "${CHALLENGES[challengeId].name}". Tu partida principal no se verá afectada, pero comenzarás una sesión temporal con reglas especiales.\n\n¿Continuar?`);
                if (isConfirmed) {
                    localStorage.setItem('activeChallenge', challengeId);
                    document.body.style.opacity = 0;
                    setTimeout(() => window.location.href = 'juego.html', 1000);
                }
            }
        }
    });

    // Asigna el sonido de click a todos los botones
    allButtons.forEach(button => {
        button.addEventListener('click', playClickSound);
    });

    // --- INICIALIZACIÓN ---
    updateAudioButtons();
    document.body.addEventListener('click', playMusic, { once: true });
    
    const mainSave = JSON.parse(localStorage.getItem('cosmicArchivistSave_v5') || '{}');
    if (mainSave.gameFinished) {
        challengesButton.classList.remove('hidden');
        renderChallenges(new Set(mainSave.completedChallenges || []));
    }
});