// Jukebox Playlist
const songs = [
  { title: "Talk To Us ", artist: "Slippery Stabs", duration: "2:34", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Thriller Night", artist: "Vincent Price", duration: "3:42", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Wormview ", artist: "Ashes and Diamonds", duration: "3:13", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Programed Ghost", artist: "Ray Parker Jr.", duration: "4:06", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "This Is CyberCity", artist: "Marilyn Manson", duration: "3:24", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Somebody's Watching", artist: "Rockwell", duration: "3:58", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { title: "Mechanical Werewolves", artist: "Warren Zevon", duration: "3:27", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { title: "I Put a Cyborg on You", artist: "Bit Midler", duration: "4:31", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
];

// Player State
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isLoop = false; 
let audio = new Audio();

//  Monedero 
let saldoActual = 0.0;
const precioCancion = 1.00;
let colaComprada = [];       
let indiceColaActual = 0;    

// Elementos
const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const stopBtn = document.getElementById("stopBtn"); 
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const loopBtn = document.getElementById("loopBtn");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const progressBarContainer = document.getElementById("progressBarContainer");
const playlist = document.getElementById("playlist");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const volumeIcon = document.getElementById("volumeIcon");
const statusMessage = document.getElementById("statusMessage");
const saldoDisplay = document.getElementById("saldo-display");
const sonidoMoneda = document.getElementById("sonidoMoneda");
const sonidoDevolucion = document.getElementById("sonidoDevolucion");

// Formato de tiempo
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Status Message
function showStatus(message, iconClass = "") {
  statusMessage.innerHTML = iconClass
    ? `<i class="fa-solid ${iconClass}"></i> ${message}`
    : message;
  statusMessage.classList.add("show");
  setTimeout(() => {
    statusMessage.classList.remove("show");
  }, 3000); 
}

// Carga canción pagada/seleccionada
function loadSongFromQueue(indexInQueue) {
  if (colaComprada.length === 0 || indexInQueue < 0 || indexInQueue >= colaComprada.length) return;

  indiceColaActual = indexInQueue;
  const song = colaComprada[indiceColaActual];

  currentIndex = songs.findIndex(s => s.src === song.src);
  const nowPlayingDisplay = document.querySelector(".now-playing");
  if (nowPlayingDisplay) {
    nowPlayingDisplay.textContent = `♪ Sonando ${indiceColaActual + 1} de ${colaComprada.length}`;
  }

  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;

  audio.src = song.src;
  audio.volume = volumeSlider.value / 100;

  updatePlaylist();
}

// Play / Pause
function play() {
  audio.play().then(() => {
    isPlaying = true;
    playIcon.className = "fa-solid fa-pause";
    actualizarMonederoUI();
  }).catch((err) => {
    console.error("Play error:", err);
    showStatus("Error playing audio", "fa-circle-xmark");
  });
}

// Pause
function pause() {
  audio.pause();
  isPlaying = false;
  playIcon.className = "fa-solid fa-play";
  actualizarMonederoUI();
}

function togglePlayPause() {
  if (!audio.src) {
    if (colaComprada.length > 0) {
      loadSongFromQueue(0);
      play();
    } else {
      showStatus("Inserta saldo y selecciona una canción", "fa-coins");
    }
  } else {
    isPlaying ? pause() : play();
  }
}

// Next / Previous 
function nextSong() {
  if (colaComprada.length === 0) return;

  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * colaComprada.length);
    } while (randomIndex === indiceColaActual && colaComprada.length > 1);
    loadSongFromQueue(randomIndex);
  } else {
    if (indiceColaActual < colaComprada.length - 1) {
      loadSongFromQueue(indiceColaActual + 1);
    } else if (isLoop) {
      loadSongFromQueue(0); 
    } else {
      pause();
      return;
    }
  }
  if (isPlaying) play();
}

function prevSong() {
  if (colaComprada.length === 0) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    if (indiceColaActual > 0) {
      loadSongFromQueue(indiceColaActual - 1);
    } else if (isLoop) {
      loadSongFromQueue(colaComprada.length - 1);
    }
    if (isPlaying) play();
  }
}

// Playlist UI
function updatePlaylist() {
  playlist.innerHTML = songs.map(
    (song, index) => `
      <div class="playlist-item ${index === currentIndex && colaComprada.length > 0 ? "active" : ""}" data-index="${index}">
        <div class="playlist-item-info">
          <div class="playlist-item-title">${song.title}</div>
          <div class="playlist-item-artist">${song.artist}</div>
        </div>
        <div class="playlist-item-duration">${song.duration}</div>
      </div>`
  ).join("");

  document.querySelectorAll(".playlist-item").forEach((item) => {
    item.addEventListener("click", () => {
      const selectedIndex = parseInt(item.dataset.index);
      
      if (saldoActual < precioCancion) {
          showStatus("Bloqueado: Se necesita 1.00 €", "fa-lock");
          return;
      }

      saldoActual -= precioCancion;
      saldoActual = Math.round(saldoActual * 100) / 100;

      colaComprada.push(songs[selectedIndex]);

      if (!isPlaying && audio.currentTime === 0) {
        loadSongFromQueue(colaComprada.length - 1);
        play();
        showStatus("¡Canción añadida y reproduciendo!", "fa-compact-disc");
      } else {
        showStatus(`Añadida a la cola (Posición ${colaComprada.length})`, "fa-list-ol");

        const nowPlayingDisplay = document.querySelector(".now-playing");
        if (nowPlayingDisplay) {
          nowPlayingDisplay.textContent = `♪ Sonando ${indiceColaActual + 1} de ${colaComprada.length}`;
        }
      }

      actualizarMonederoUI();
    });
  });
}

// Eventos de audio
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + "%";
  }
  
  if (stopBtn) {
    stopBtn.disabled = (audio.currentTime === 0 && !isPlaying);
  }
});

// Salto automático
audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    play();
  } else if (indiceColaActual < colaComprada.length - 1) {
    nextSong();
  } else if (isLoop && colaComprada.length > 0) {
    loadSongFromQueue(0);
    play();
  } else {
    pause();
  }
});

// Control de botones
playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
  showStatus(isShuffle ? "Shuffle ON" : "Shuffle OFF", "fa-shuffle");
});

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
  showStatus(isRepeat ? "Repeat ON" : "Repeat OFF", "fa-repeat");
});

loopBtn.addEventListener("click", () => {
  isLoop = !isLoop;
  loopBtn.classList.toggle("active", isLoop);
  showStatus(isLoop ? "Loop ON" : "Loop OFF", "fa-infinity");
});

// Volumen
volumeSlider.addEventListener("input", (e) => {
  const vol = e.target.value;
  audio.volume = vol / 100;
  volumeValue.textContent = vol + "%";

  const icon = volumeIcon.querySelector("i");
  if (vol == 0) {
    icon.className = "fa-solid fa-volume-xmark";
  } else if (vol < 50) {
    icon.className = "fa-solid fa-volume-low";
  } else {
    icon.className = "fa-solid fa-volume-high";
  }
});

let prevVolume = 70;
volumeIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    prevVolume = volumeSlider.value;
    volumeSlider.value = 0;
  } else {
    volumeSlider.value = prevVolume;
  }
  volumeSlider.dispatchEvent(new Event("input"));
});

// Barra duración
progressBarContainer.addEventListener("click", (e) => {
  if (!audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
});

// Insertar monedas
function insertarMoneda(valor) {
    if (sonidoMoneda) {
        const clonSonido = sonidoMoneda.cloneNode(true);
        clonSonido.volume = 0.6;
        clonSonido.play().catch(err => console.log("Error audio:", err));
    }

    saldoActual += valor;
    saldoActual = Math.round(saldoActual * 100) / 100;
    
    actualizarMonederoUI();
    showStatus(`Añadido +${valor.toFixed(2)} €`, "fa-money-bill-wave");
}

function devolverEfectivo() {
    if (saldoActual > 0) {
        if (sonidoDevolucion) {
            const clonSonido = sonidoDevolucion.cloneNode(true);
            clonSonido.volume = 0.6;
            clonSonido.play().catch(err => console.log("Error audio:", err));
        }

        showStatus(`Devolviendo ${saldoActual.toFixed(2)} €`, "fa-hand-holding-dollar");
        saldoActual = 0.0;
        actualizarMonederoUI();
    } else {
        showStatus("No hay saldo que devolver", "fa-circle-info");
    }
}

// Detener y Penalizar
function detenerYPenalizar() {
    if (isPlaying || audio.currentTime > 0) {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        playIcon.className = "fa-solid fa-play";
        
        if (sonidoDevolucion) {
            const clonSonido = sonidoDevolucion.cloneNode(true);
            clonSonido.volume = 0.6;
            clonSonido.play().catch(err => console.log("Error audio:", err));
        }

        saldoActual += 0.50;
        saldoActual = Math.round(saldoActual * 100) / 100;
        colaComprada = [];
        indiceColaActual = 0;
        currentIndex = -1;
        
        const nowPlayingDisplay = document.querySelector(".now-playing");
        if (nowPlayingDisplay) nowPlayingDisplay.textContent = "♪ Sonando Ahora...";
        
        songTitle.textContent = "Pista seleccionada...";
        songArtist.textContent = "Selecciona cualquier pista para empezar";
        
        showStatus("Canción cancelada: Se devuelven 0,50 €", "fa-hand-holding-dollar");
        actualizarMonederoUI();
        updatePlaylist();
    }
}

function actualizarMonederoUI() {
    if (saldoDisplay) {
        saldoDisplay.innerText = `SALDO: ${saldoActual.toFixed(2)} €`;
    }
    
    const msgBloqueo = document.querySelector(".display-panel .status-message");
    const playlistContainer = document.getElementById("playlist");
    
    if (audio.src && audio.currentTime >= 0 && (isPlaying || audio.currentTime > 0)) {
        if (stopBtn) stopBtn.disabled = false;
    } else {
        if (stopBtn) stopBtn.disabled = true;
    }
    
    if (saldoActual >= precioCancion) {
        if (playlistContainer) playlistContainer.classList.remove("disabled-playlist");
        
        if (msgBloqueo) {
            if (saldoActual > precioCancion) {
                msgBloqueo.innerText = "CRÉDITO DISPONIBLE: Selecciona otra canción";
            } else {
                msgBloqueo.innerText = "CRÉDITO DISPONIBLE: Elige canción";
            }
        }
    } else {
        const faltante = (precioCancion - saldoActual).toFixed(2);
        if (msgBloqueo) msgBloqueo.innerText = `BLOQUEADO: Faltan ${faltante} €`;
        if (playlistContainer) playlistContainer.classList.add("disabled-playlist");
    }
}

// Control por teclado
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;

  switch (e.key) {
    case " ":
      e.preventDefault();
      togglePlayPause();
      break;
    case "ArrowRight":
      nextSong();
      break;
    case "ArrowLeft":
      prevSong();
      break;
    case "ArrowUp":
      e.preventDefault();
      volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
      volumeSlider.dispatchEvent(new Event("input"));
      break;
    case "ArrowDown":
      e.preventDefault();
      volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
      volumeSlider.dispatchEvent(new Event("input"));
      break;
    case "m":
    case "M":
      volumeIcon.click();
      break;
  }
});

// 🚀 Initialize
updatePlaylist();
actualizarMonederoUI();
showStatus("Bienvenido a Cyberpunk Jukebox", "fa-music");