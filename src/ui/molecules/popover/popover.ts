import { onOutsideClick } from "../../../modules/htmlElements";
import "./popover.scss";

export class Popover {
  public popoverContainerRef: HTMLElement = null;
  public clickTriggerRef: HTMLElement = null;
  public isOpen = false;
  public keepOpen = false;

  attached() {
    onOutsideClick(
      this.popoverContainerRef,
      () => {
        if (this.keepOpen) return;
        this.isOpen = false;
      },
      [this.clickTriggerRef],
    );
  }

  public triggerClicked() {
    this.isOpen = !this.isOpen;
  }

  public onPinClicked(): void {
    this.keepOpen = !this.keepOpen;
  }
}
