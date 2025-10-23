document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DE AUDIO ---
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');

    // --- BOTONES PRINCIPALES ---
    const allButtons = document.querySelectorAll('button');
    const startButton = document.getElementById('start-button');
    const optionsButton = document.getElementById('options-button');
    const creditsButton = document.getElementById('credits-button');

    // --- PANELES ---
    const optionsPanel = document.getElementById('options-panel');
    const creditsPanel = document.getElementById('credits-panel');

    // --- BOTONES DENTRO DE LOS PANELES ---
    const closePanelButtons = document.querySelectorAll('.close-panel-button');
    const resetProgressButton = document.getElementById('reset-progress-button');
    const musicToggleButton = document.getElementById('music-toggle-button');
    const sfxToggleButton = document.getElementById('sfx-toggle-button');

    // Verificación: Asegurarse de que el botón de reseteo fue encontrado
    if (!resetProgressButton) {
        console.error("¡ERROR CRÍTICO: No se encontró el botón con id 'reset-progress-button'!");
        return; // Detiene la ejecución si el botón no existe
    }

    // --- ESTADO INICIAL DE AUDIO ---
    let isMusicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    let areSfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';

    // --- FUNCIONES ---
    function updateMusicButton() {
        musicToggleButton.textContent = isMusicEnabled ? 'Activada' : 'Desactivada';
        musicToggleButton.classList.toggle('toggled-on', isMusicEnabled);
    }

    function updateSfxButton() {
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

    // --- LÓGICA PRINCIPAL Y EVENT LISTENERS ---

    // Navegar al juego
    startButton.addEventListener('click', () => {
        document.body.style.opacity = 0;
        setTimeout(() => window.location.href = 'juego.html', 1000);
    });

    // Abrir paneles
    optionsButton.addEventListener('click', () => optionsPanel.classList.add('visible'));
    creditsButton.addEventListener('click', () => creditsPanel.classList.add('visible'));

    // Cerrar paneles
    closePanelButtons.forEach(button => {
        button.addEventListener('click', () => button.closest('.panel').classList.remove('visible'));
    });

    // Toggle de música
    musicToggleButton.addEventListener('click', () => {
        isMusicEnabled = !isMusicEnabled;
        localStorage.setItem('musicEnabled', isMusicEnabled);
        updateMusicButton();
        isMusicEnabled ? playMusic() : backgroundMusic.pause();
    });

    // Toggle de SFX
    sfxToggleButton.addEventListener('click', () => {
        areSfxEnabled = !areSfxEnabled;
        localStorage.setItem('sfxEnabled', areSfxEnabled);
        updateSfxButton();
        if (areSfxEnabled) playClickSound();
    });
    
    // <<<--- AQUÍ ESTÁ LA LÓGICA DE BORRADO --->>>
    resetProgressButton.addEventListener('click', () => {
        console.log("Botón 'Borrar Datos' presionado."); // Mensaje para depurar

        const isConfirmed = confirm('¿Estás seguro de que quieres borrar todo tu progreso? Esta acción es irreversible.');
        
        if (isConfirmed) {
            console.log("Usuario confirmó el borrado.");
            
            // Borra TODOS los datos guardados en el navegador para este sitio.
            localStorage.clear();
            
            alert('Progreso borrado con éxito. El juego se reiniciará desde cero la próxima vez.');
            
            // Restablece visualmente las opciones de audio en la pantalla actual
            isMusicEnabled = true;
            areSfxEnabled = true;
            updateMusicButton();
            updateSfxButton();
        } else {
            console.log("Usuario canceló el borrado.");
        }
    });

    // Asigna el sonido de click a todos los botones
    allButtons.forEach(button => {
        button.addEventListener('click', playClickSound);
    });

    // --- INICIALIZACIÓN ---
    updateMusicButton();
    updateSfxButton();
    document.body.addEventListener('click', playMusic, { once: true });
});