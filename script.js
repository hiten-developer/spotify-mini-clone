let currentSong = new Audio();
let songs;

function formatSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:3000/songs");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("%5C")[2]);
    }
  }
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play();
    const playBtnHeader = document.getElementById("play");
    if (playBtnHeader) playBtnHeader.src = "images/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  const displayName = decodeURI(track).replaceAll("%20", " ");
  document.querySelectorAll(".song-list ul li").forEach((li) => {
    const titleElem = li.querySelector(".info").firstElementChild;
    if (!titleElem) return;
    const liTitle = titleElem.innerText.trim();
    if (liTitle === displayName) {
      li.classList.add("active-song");
      if (!currentSong.paused) li.classList.add("playing");
    } else {
      li.classList.remove("active-song");
      li.classList.remove("playing");
    }
  });
};

async function main() {
  songs = await getSongs();
  if (!songs || songs.length === 0) return;
  playMusic(songs[0], true);

  let songUl = document.querySelector(".song-list ul");
  for (const song of songs) {
    const display = decodeURIComponent(song).replaceAll("%20", " ");
    songUl.innerHTML += `
      <li>
        <img class="invert" src="images/music.svg" alt="">
        <div class="info">
          <div>${display}</div>
          <div>Hiten</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="images/play_btn_2.svg" alt="">
        </div>
        <span class="playing-indicator">🔊</span>
      </li>`;
  }

  const firstLi = songUl.querySelector("li");
  if (firstLi) firstLi.classList.add("active-song");

  Array.from(document.querySelectorAll(".song-list li")).forEach((e, idx) => {
    e.addEventListener("click", () => {
      document
        .querySelectorAll(".song-list li")
        .forEach((li) => li.classList.remove("active-song", "playing"));
      e.classList.add("active-song");
      const selectedName = e.querySelector(".info").firstElementChild.innerHTML;
      const match = songs.find(
        (s) => decodeURIComponent(s).replaceAll("%20", " ") === selectedName
      );
      playMusic(match || songs[idx]);
    });
  });

  const headerPlay = document.getElementById("play");
  if (headerPlay) {
    headerPlay.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        headerPlay.src = "images/pause.svg";
      } else {
        currentSong.pause();
        headerPlay.src = "images/play_btn_2.svg";
      }
    });
  }

  currentSong.addEventListener("timeupdate", () => {
    const dur = isNaN(currentSong.duration) ? 0 : currentSong.duration;
    document.querySelector(".songtime").innerHTML = `${formatSeconds(
      currentSong.currentTime
    )}/${formatSeconds(dur)}`;
    const circle = document.querySelector(".circle");
    if (circle && dur > 0) {
      circle.style.left = (currentSong.currentTime / dur) * 100 + "%";
    }
  });

  currentSong.addEventListener("play", () => {
    document.querySelectorAll(".song-list li").forEach((li) => {
      if (li.classList.contains("active-song")) li.classList.add("playing");
      else li.classList.remove("playing");
    });
  });
  currentSong.addEventListener("pause", () => {
    document
      .querySelectorAll(".song-list li")
      .forEach((li) => li.classList.remove("playing"));
  });

  const seekbar = document.querySelector(".seekbar");
  if (seekbar) {
    seekbar.addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      let percent = (offsetX / rect.width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      if (currentSong.duration)
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });
  }

  const hamburger = document.querySelector(".hamburger");
  if (hamburger)
    hamburger.addEventListener("click", () => {
      document.querySelector(".left").style.left = 0;
    });

  const closeBtn = document.querySelector(".close");
  if (closeBtn)
    closeBtn.addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

  const prev = document.getElementById("prev");
  if (prev)
    prev.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

  const next = document.getElementById("next");
  if (next)
    next.addEventListener("click", () => {
      currentSong.pause();
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

  const volInput = document.querySelector(".range input");
  if (volInput)
    volInput.addEventListener("change", (e) => {
      currentSong.volume = e.target.value / 100;
    });

  document.querySelectorAll(".card .play-btn").forEach((btn, idx) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const card = btn.closest(".card");
      const titleEl = card.querySelector("h3");
      const titleText = titleEl ? titleEl.innerText.trim() : "";
      let match = songs.find((s) => {
        const decoded = decodeURIComponent(s)
          .replaceAll("%20", " ")
          .toLowerCase();
        return decoded.includes(titleText.toLowerCase());
      });
      if (!match) match = songs[idx] || songs[0];
      playMusic(match);
    });
  });
}
main();
