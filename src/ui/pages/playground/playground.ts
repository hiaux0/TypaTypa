import Aurelia, { IAurelia, resolve } from "aurelia";
import "./playground.scss";

export class Playground {
  public message = "playground.html";
  public inputRef: HTMLElement;
  public itemsRef: HTMLElement;
  public items: string[] = ["hi"];

  constructor(private au = resolve(IAurelia)) {}

  attached() {
    return;
    const audioPlayer = document.getElementById("audioPlayer");
    const progressBar = document.getElementById("progressBar");
    const progress = document.querySelector(".progress");
    const currentTimeDisplay = document.getElementById("currentTime");
    const durationDisplay = document.getElementById("duration");
    const playbackSpeedSlider = document.getElementById("playbackSpeed");
    const speedDisplay = document.getElementById("speedDisplay");
    const repeatToggle = document.getElementById("repeatToggle");

    // Format time in mm:ss
    function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    // Update progress bar
    audioPlayer.addEventListener("timeupdate", () => {
      const progressPercentage =
        (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progress.style.width = `${progressPercentage}%`;
      currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    });

    // Update duration when metadata is loaded
    audioPlayer.addEventListener("loadedmetadata", () => {
      durationDisplay.textContent = formatTime(audioPlayer.duration);
    });

    // Seek functionality
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progressPercentage = clickX / rect.width;
      audioPlayer.currentTime = progressPercentage * audioPlayer.duration;
    });

    // Playback speed control
    playbackSpeedSlider.addEventListener("input", () => {
      const speed = playbackSpeedSlider.value;
      audioPlayer.playbackRate = speed;
      speedDisplay.textContent = `${speed}x`;
    });

    // Repeat toggle
    let isRepeating = false;
    repeatToggle.addEventListener("click", () => {
      isRepeating = !isRepeating;
      audioPlayer.loop = isRepeating;
      repeatToggle.textContent = isRepeating ? "Repeat On" : "Repeat Off";
    });

    document
      .getElementById("fileInput")
      .addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file && file.type === "audio/mpeg") {
          const audioPlayer = document.getElementById("audioPlayer");
          const objectURL = URL.createObjectURL(file);

          audioPlayer.src = objectURL;
          audioPlayer.addEventListener("loadedmetadata", () => {
            const duration = audioPlayer.duration;
            alert(`Audio length: ${formatTime(duration)}`);
          });

          audioPlayer.play();
        } else {
          alert("Please upload a valid MP3 file.");
        }
      });
  }
}
