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
    li.className = "song-item";

    const title = document.createElement("span");
    title.textContent = song.name;
    title.onclick = () => playSong(index);

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation(); // evita que se reproduzca
      deleteSong(index);
    };

    li.appendChild(title);
    li.appendChild(delBtn);
    songList.appendChild(li);
  });
}


function playSong(index) {
  currentIndex = index;
  audio.src = URL.createObjectURL(songs[index]);
  currentTitle.textContent = songs[index].name;
  audio.play();
}

function deleteSong(index) {
  const confirmDelete = confirm("¿Eliminar esta canción?");
  if (!confirmDelete) return;

  // Si la canción eliminada es la actual
  if (index === currentIndex) {
    audio.pause();
    audio.src = "";
    currentTitle.textContent = "Sin reproducción";
  }

  songs.splice(index, 1);

  // Ajustar índice
  if (currentIndex >= songs.length) {
    currentIndex = songs.length - 1;
  }

  renderList(songs);
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

  renderList(songs);
});

function getDuration(file) {
  return new Promise(resolve => {
    const tempAudio = new Audio();
    tempAudio.src = URL.createObjectURL(file);
    tempAudio.addEventListener("loadedmetadata", () => {
      resolve(tempAudio.duration);
    });
  });
}
function renderList(list) {
  songList.innerHTML = "";

  list.forEach((song, index) => {
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


audio.addEventListener("ended", next);
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");

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


