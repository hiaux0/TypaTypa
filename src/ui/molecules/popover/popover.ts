import "./popover.scss";

function onOutsideClick(
  element: HTMLElement,
  callback: () => void,
  okayElements?: HTMLElement[],
) {
  function onClickCallback(event: MouseEvent) {
    const isOkayElementClicked = okayElements?.some((okayElement) => {
      return okayElement.contains(event.target as HTMLElement);
    });
    const isClickInside = element?.contains(event.target as HTMLElement);
    if (!isClickInside && !isOkayElementClicked) {
      callback();
    }
  }

  document.addEventListener("click", onClickCallback);
}

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
