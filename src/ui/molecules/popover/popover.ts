import { bindable, observable } from "aurelia";
import { onOutsideClick } from "../../../common/modules/htmlElements";
import "./popover.scss";

export class Popover {
  @bindable closeOnClick = false;

  public popoverContainerRef: HTMLElement = null;
  public clickTriggerRef: HTMLElement = null;
  public keepOpen = false;

  @observable public isOpen = false;

  isOpenChanged() {
    if (!this.isOpen) {
      document.removeEventListener("click", this.onDocumentClick);
      return;
    }

    // Give time for element to appear
    window.requestAnimationFrame(() => {
      onOutsideClick(
        this.popoverContainerRef,
        () => {
          if (this.keepOpen) return;
          this.isOpen = false;
        },
        [this.clickTriggerRef],
      );

      if (this.closeOnClick) {
        document.addEventListener("click", this.onDocumentClick);
      }
    });
  }

  private onDocumentClick = () => {
    if (!this.isOpen) return;
    this.isOpen = false;
  };

  attached() {}

  public triggerClicked() {
    this.isOpen = !this.isOpen;
  }

  public onPinClicked(): void {
    this.keepOpen = !this.keepOpen;
  }
}
