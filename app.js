const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const currentTitle = document.getElementById("currentTitle");

let songs = [];
let currentIndex = 0;
let shuffle = false;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

fileInput.addEventListener("change", () => {
  songs = Array.from(fileInput.files);
  renderList(songs);
});

function renderList(list) {
  songList.innerHTML = "";
  list.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    li.onclick = () => playSong(index);
    songList.appendChild(li);
  });
}

function playSong(index) {
  currentIndex = index;
  audio.src = URL.createObjectURL(songs[index]);
  currentTitle.textContent = songs[index].name;
  audio.play();
}

function playPause() {
  audio.paused ? audio.play() : audio.pause();
}

function next() {
  if (shuffle) {
    currentIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  playSong(currentIndex);
}

function prev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

function setVolume(v) {
  audio.volume = v;
}

function toggleShuffle() {
  shuffle = !shuffle;
  alert(shuffle ? "Aleatorio activado" : "Aleatorio desactivado");
}

function toggleFavorite() {
  const song = songs[currentIndex];
  if (!song) return;

  if (favorites.includes(song.name)) {
    favorites = favorites.filter(f => f !== song.name);
  } else {
    favorites.push(song.name);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function showFavorites() {
  const favSongs = songs.filter(s => favorites.includes(s.name));
  renderList(favSongs);
}

audio.addEventListener("ended", next);
