const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const currentTitle = document.getElementById("currentTitle");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");

let songs = [];
let currentIndex = -1;
let shuffle = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* =========================
   SUBIR MÚSICA LOCAL
========================= */
fileInput.addEventListener("change", async () => {
  const files = Array.from(fileInput.files);

  for (const file of files) {
    const duration = await getDuration(file);
    songs.push({
      file,
      name: file.name,
      duration
    });
  }

  renderList();
});

/* =========================
   RENDER LISTA
========================= */
function renderList() {
  songList.innerHTML = "";

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "song-item";
    if (index === currentIndex) li.classList.add("active");

    const title = document.createElement("span");
    title.textContent = song.name;
    title.onclick = () => playSong(index);

    const time = document.createElement("span");
    time.className = "duration";
    time.textContent = formatTime(song.duration);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "delete-btn";
    delBtn.onclick = e => {
      e.stopPropagation();
      deleteSong(index);
    };

    li.append(title, time, delBtn);
    songList.appendChild(li);
  });
}

/* =========================
   REPRODUCCIÓN
========================= */
function playSong(index) {
  currentIndex = index;
  audio.src = URL.createObjectURL(songs[index].file);
  currentTitle.textContent = songs[index].name;
  audio.play();
  renderList();
}

function playPause() {
  if (audio.src === "") return;
  audio.paused ? audio.play() : audio.pause();
}

function next() {
  if (!songs.length) return;

  currentIndex = shuffle
    ? Math.floor(Math.random() * songs.length)
    : (currentIndex + 1) % songs.length;

  playSong(currentIndex);
}

function prev() {
  if (!songs.length) return;

  currentIndex =
    (currentIndex - 1 + songs.length) % songs.length;

  playSong(currentIndex);
}

/* =========================
   ELIMINAR CANCIÓN
========================= */
function deleteSong(index) {
  if (!confirm("¿Eliminar esta canción?")) return;

  if (index === currentIndex) {
    audio.pause();
    audio.src = "";
    currentTitle.textContent = "Sin reproducción";
    currentIndex = -1;
  }

  songs.splice(index, 1);
  renderList();
}

/* =========================
   PROGRESO Y TIEMPO
========================= */
audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener("ended", next);

/* =========================
   EXTRAS
========================= */
function setVolume(v) {
  audio.volume = v;
}

function toggleShuffle() {
  shuffle = !shuffle;
  alert(shuffle ? "Aleatorio activado" : "Aleatorio desactivado");
}

/* =========================
   UTILIDADES
========================= */
function getDuration(file) {
  return new Promise(resolve => {
    const tempAudio = new Audio();
    tempAudio.src = URL.createObjectURL(file);
    tempAudio.onloadedmetadata = () => resolve(tempAudio.duration);
  });
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}
