const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const currentTitle = document.getElementById("currentTitle");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const playBtn = document.querySelector(".play-btn");
const shuffleBtn = document.getElementById("shuffleBtn");

const CLOUD_NAME = "dj2romk53";
const UPLOAD_PRESET = "biblioteca1";

let songs = [];
let currentIndex = -1;
let shuffle = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* =========================
   CLOUDINARY UPLOAD
========================= */
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: formData });
  return await res.json();
}

fileInput.addEventListener("change", async () => {
  const files = Array.from(fileInput.files);

  for (const file of files) {
    const res = await uploadToCloudinary(file);

    songs.push({
      name: res.original_filename,
      url: res.secure_url,
      duration: 0
    });
  }

  saveSongs();
  renderList();
});

/* =========================
   LISTA
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

    const favBtn = document.createElement("button");
    favBtn.textContent = favorites.includes(song.name) ? "❤️" : "🤍";
    favBtn.onclick = e => {
      e.stopPropagation();
      toggleFavorite(song.name);
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.onclick = e => {
      e.stopPropagation();
      deleteSong(index);
    };

    li.append(title, time, favBtn, delBtn);
    songList.appendChild(li);
  });
}

/* =========================
   PLAYER
========================= */
function playSong(index) {
  currentIndex = index;
  audio.src = songs[index].url;
  currentTitle.textContent = songs[index].name;
  audio.play();
  renderList();
}

function playPause() {
  if (!audio.src) return;
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
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

/* =========================
   PROGRESO
========================= */
audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audio.duration);
  songs[currentIndex].duration = audio.duration;
  saveSongs();
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener("ended", next);

/* =========================
   FAVORITOS
========================= */
function toggleFavorite(name) {
  favorites = favorites.includes(name)
    ? favorites.filter(f => f !== name)
    : [...favorites, name];

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderList();
}

/* =========================
   EXTRAS
========================= */
function deleteSong(index) {
  if (!confirm("¿Eliminar canción?")) return;
  songs.splice(index, 1);
  saveSongs();
  renderList();
}

function toggleShuffle() {
  shuffle = !shuffle;
  shuffleBtn.style.color = shuffle ? "#1db954" : "white";
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* =========================
   UI
========================= */
audio.addEventListener("play", () => playBtn.textContent = "⏸");
audio.addEventListener("pause", () => playBtn.textContent = "▶️");

/* =========================
   STORAGE
========================= */
function saveSongs() {
  localStorage.setItem("songs", JSON.stringify(songs));
}

function loadSongs() {
  const stored = JSON.parse(localStorage.getItem("songs"));
  if (stored) songs = stored;
  renderList();
}

loadSongs();
