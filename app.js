/* =========================
   SUPABASE CONFIG (SAFE)
========================= */
if (!window._supabaseClient) {
  window._supabaseClient = window.supabase.createClient(
    "https://tjbkohttbscyyribslyu.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYmtvaHR0YnNjeXlyaWJzbHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTY0MTEsImV4cCI6MjA4MzQ5MjQxMX0.gUAoJDE3jr1HRSx6BF6hX2nNVEvZddptz9FkZLNWD5A"
  );
}

const supabaseClient = window._supabaseClient;

/* =========================
   DOM
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
   STATE
========================= */
let songs = [];
let currentIndex = -1;
let shuffle = false;

/* =========================
   UPLOAD
========================= */
fileInput.addEventListener("change", async () => {
  const files = [...fileInput.files];
  if (!files.length) return;

  alert("Subiendo música...");

  for (const file of files) {
    const path = `${Date.now()}_${file.name}`;

    const { error } = await supabaseClient
      .storage
      .from("biblioteca1")
      .upload(path, file);

    if (error) {
      alert(error.message);
      continue;
    }

    const { data } = supabaseClient
      .storage
      .from("biblioteca1")
      .getPublicUrl(path);

    songs.push({
      name: file.name,
      url: data.publicUrl
    });
  }

  localStorage.setItem("songs", JSON.stringify(songs));
  renderList();
  fileInput.value = "";
});

/* =========================
   LIST
========================= */
function renderList() {
  songList.innerHTML = "";
  songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    li.onclick = () => playSong(i);
    songList.appendChild(li);
  });
}

/* =========================
   PLAYER
========================= */
function playSong(i) {
  currentIndex = i;
  audio.src = songs[i].url;
  currentTitle.textContent = songs[i].name;
  audio.play();
}

function playPause() {
  if (!audio.src) return;
  audio.paused ? audio.play() : audio.pause();
}

function next() {
  if (!songs.length) return;
  playSong((currentIndex + 1) % songs.length);
}

function prev() {
  if (!songs.length) return;
  playSong((currentIndex - 1 + songs.length) % songs.length);
}

function toggleShuffle() {
  shuffle = !shuffle;
  shuffleBtn.style.color = shuffle ? "#1db954" : "white";
}

/* =========================
   PROGRESS
========================= */
audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = format(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = format(audio.duration);
});

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

function format(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* =========================
   INIT
========================= */
const saved = localStorage.getItem("songs");
if (saved) songs = JSON.parse(saved);
renderList();
