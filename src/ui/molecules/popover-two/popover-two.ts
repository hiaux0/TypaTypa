import { bindable, observable } from "aurelia";
import { onOutsideClick } from "../../../common/modules/htmlElements";
import "./popover-two.scss";

export class PopoverTwo {
  @bindable closeOnClick = false;
  @bindable isOpen = false;
  @bindable title = 'title';

  public popoverContainerRef: HTMLElement = null;
  public clickTriggerRef: HTMLElement = null;

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

  attached() {
    this.isOpenChanged();
  }

  public triggerClicked() {
    this.isOpen = !this.isOpen;
  }
}
