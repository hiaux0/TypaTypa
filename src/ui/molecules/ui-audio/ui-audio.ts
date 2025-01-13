import "./ui-audio.scss";
import { CELL_WIDTH } from "../../../common/modules/constants";
import { bindable, containerless, resolve } from "aurelia";
import { CellEventMessagingService } from "../../../common/services/CellEventMessagingService";

// played, seekable


@containerless()
export class UiAudio {
  @bindable onTimeChange: (time: number, progress: number) => void;
  @bindable onStateChange: (isPlaying: boolean, event: Event) => void;

  public cellWidth = CELL_WIDTH;
  public fileInputRef: HTMLInputElement;
  public itemsRef: HTMLElement;
  public audioPlayerRef: HTMLAudioElement;
  public isRepeating = false;
  public audioSpeed = 1;

  public cellEventMessagingService = resolve(CellEventMessagingService);

  attached() {
    this.audioPlayerRef.addEventListener("loadedmetadata", () => {
      // durationDisplay.textContent = formatTime(this.audioPlayerRef.duration);
    });

    // Seek functionality
    //progressBar.addEventListener("click", (e) => {
    //  const rect = progressBar.getBoundingClientRect();
    //  const clickX = e.clientX - rect.left;
    //  const progressPercentage = clickX / rect.width;
    //  this.audioPlayerRef.currentTime = progressPercentage * this.audioPlayerRef.duration;
    //});

    this.audioPlayerRef.addEventListener("playing", (event) => {
      this.onStateChange(true, event);
    });

    this.audioPlayerRef.addEventListener("pause", (event) => {
      this.onStateChange(false, event);
    });

    this.audioPlayerRef.addEventListener("timeupdate", () => {
      const progressPercentage =
        (this.audioPlayerRef.currentTime / this.audioPlayerRef.duration) * 100;
      if (typeof this.onTimeChange === "function") {
        this.onTimeChange(this.audioPlayerRef.currentTime, progressPercentage);
      }
    });

    this.fileInputRef.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      const file = target.files?.[0];
      if (file && file.type === "audio/mpeg") {
        const objectURL = URL.createObjectURL(file);
        this.audioPlayerRef.src = objectURL;
        this.audioPlayerRef.addEventListener("loadedmetadata", () => {
          const duration = this.audioPlayerRef.duration;
        });

        this.audioPlayerRef.play();
      }
    });
  }

  public changeSpeed() {
    this.audioPlayerRef.playbackRate = this.audioSpeed;
  }

  public toggleRepeat() {
    this.isRepeating = !this.isRepeating;
    this.audioPlayerRef.loop = this.isRepeating;
  }
}

// Format time in mm:ss
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
