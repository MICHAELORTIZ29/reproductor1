/* =========================
   SUPABASE CONFIG
========================= */
const SUPABASE_URL = "https://tjbkohttbscyyribslyu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYmtvaHR0YnNjeXlyaWJzbHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTY0MTEsImV4cCI6MjA4MzQ5MjQxMX0.gUAoJDE3jr1HRSx6BF6hX2nNVEvZddptz9FkZLNWD5A";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/* =========================
   ELEMENTOS DOM
========================= */
const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const currentTitle = document.getElementById("currentTitle");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const playBtn = document.querySelector(".play-btn");
const shuffleBtn = document.getElementById("shuffleBtn");

/* =========================
   ESTADO
========================= */
let songs = [];
let currentIndex = -1;
let shuffle = false;

/* =========================
   STORAGE
========================= */
function saveSongs() {
  localStorage.setItem("songs", JSON.stringify(songs));
}

function loadSongs() {
  const stored = JSON.parse(localStorage.getItem("songs"));
  if (Array.isArray(stored)) songs = stored;
}

/* =========================
   SUBIR A SUPABASE
========================= */
async function uploadSong(file) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("music")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("music")
    .getPublicUrl(fileName);

  return {
    name: file.name,
    url: data.publicUrl,
    duration: 0
  };
}

/* =========================
   SUBIR MÚSICA
========================= */
fileInput.addEventListener("change", async () => {
  const files = Array.from(fileInput.files);
  if (!files.length) return;

  alert("Subiendo canciones, espera…");

  for (const file of files) {
    try {
      const song = await uploadSong(file);
      songs.push(song);
    } catch (e) {
      alert("Error subiendo: " + file.name);
      console.error(e);
    }
  }

  saveSongs();
  renderList();
  fileInput.value = "";
  alert("Subida completada ✅");
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

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = e => {
      e.stopPropagation();
      deleteSong(index);
    };

    li.append(title, time, del);
    songList.appendChild(li);
  });
}

/* =========================
   PLAYER
========================= */
function playSong(index) {
  currentIndex = index;
  const song = songs[index];

  audio.pause();
  audio.src = song.url;
  audio.load();

  currentTitle.textContent = song.name;

  audio.play().catch(err => console.log("Play bloqueado", err));
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
  if (currentIndex >= 0) {
    songs[currentIndex].duration = audio.duration;
    saveSongs();
  }
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

audio.addEventListener("ended", next);

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

/* =========================
   UI
========================= */
audio.addEventListener("play", () => (playBtn.textContent = "⏸"));
audio.addEventListener("pause", () => (playBtn.textContent = "▶️"));

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* =========================
   INIT
========================= */
loadSongs();
renderList();
