import "./ui-audio.scss";
import { CELL_HEIGHT, CELL_WIDTH } from "../../../common/modules/constants";
import {
  ICustomElementViewModel,
  bindable,
  containerless,
  resolve,
} from "aurelia";
import IndexedDBService from "../../../common/services/IndexdDBService";
import { featureFlags } from "../../pages/grid-test-page/grid-modules/featureFlags";
import { Store } from "../../../common/modules/store";
import { CellEventMessagingService } from "../../../common/services/CellEventMessagingService";
import { Cell } from "../../../types";
import { IHydratedController } from "@aurelia/runtime-html";
import {
  GRID_FUNCTIONS,
  isAudioStartFunction,
} from "../../../domain/entities/grid/CellFunctionEntities";

// played, seekable

@containerless()
export class UiAudio implements ICustomElementViewModel {
  @bindable cell: Cell;
  @bindable onTimeChange: (time: number, progress: number) => void;
  @bindable onStateChange: (isPlaying: boolean, event: Event) => void;

  public cellWidth = CELL_WIDTH;
  public cellHeight = CELL_HEIGHT;
  public fileInputRef: HTMLInputElement;
  public itemsRef: HTMLElement;
  public audioPlayerRef: HTMLAudioElement;
  public isRepeating = false;
  public audioSpeed = 1;
  public audioSrc: string;

  private audioStart: number;

  constructor(
    public indexedDBService = resolve(IndexedDBService),
    public store = resolve(Store),
    private cellEventMessagingService = resolve(CellEventMessagingService),
  ) {}

  binding(): void | Promise<void> {
    this.cellEventMessagingService.subscribe(this.cell, (payload) => {
      /*prettier-ignore*/ console.log("[ui-audio.ts,47] payload: ", payload);
      const is = isAudioStartFunction(payload);
      /*prettier-ignore*/ console.log("[ui-audio.ts,49] is: ", is);
      if (is) {
        this.store.audioTime = payload.data.start
      }
    });
  }

  async attached() {
    this.audioPlayerRef.addEventListener("loadedmetadata", () => {
      // durationDisplay.textContent = formatTime(this.audioPlayerRef.duration);
    });

    const { file: loadedFile } = (await this.indexedDBService.loadFile()) ?? {};
    if (loadedFile) {
      const url = URL.createObjectURL(loadedFile);
      this.audioSrc = url;
      this.audioPlayerRef.load();
      // this.audioPlayerRef.muted = true;
      if (featureFlags.autoPlayAudio) {
        this.audioPlayerRef.currentTime = this.store.audioTime ?? 0;
        this.audioPlayerRef.play();
      }
    }

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
      const time = Math.round(this.audioPlayerRef.currentTime);
      const progressPercentage = (time / this.audioPlayerRef.duration) * 100;
      if (typeof this.onTimeChange === "function") {
        this.onTimeChange(time, progressPercentage);
        this.store.audioTime = time;
      }
    });

    this.fileInputRef.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      const file = target.files?.[0];
      if (file && file.type === "audio/mpeg") {
        const objectURL = window.URL.createObjectURL(file);
        this.audioPlayerRef.src = objectURL;
        this.audioPlayerRef.addEventListener("loadedmetadata", () => {
          const duration = this.audioPlayerRef.duration;
        });

        this.audioPlayerRef.play();
        // Save the file to rxdb
        await this.indexedDBService.saveFile(file);
        // await this.databaseService.save(file);
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
