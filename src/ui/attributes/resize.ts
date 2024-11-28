import { bindable, INode, resolve } from "aurelia";
import {
  findParentElement,
  getElementPositionAsNumber,
} from "../../common/modules/htmlElements";

export class ResizeCustomAttribute {
  // used for better resize experience. When only use `this.element`, then the mouse moves too fast
  @bindable() resizeContainer: HTMLElement;
  @bindable() onResize: (moveByX: number, moveByY: number) => {};
  @bindable() onResizeEnd: () => {};

  private element = resolve(INode) as HTMLElement;

  private draggedElement: HTMLElement | null = null;
  private isDraggedElement = false;
  /**
   * The position of the dragged element when the drag started.
   * Assume it is always 'snapped' to the grid
   */
  private draggedElementStartX = NaN;
  private draggedElementStartY = NaN;
  /**
   * The position of the mouse when the drag started.
   * Need this to calculate the relative position of the dragged element.
   */
  private draggedElementMouseDownX = NaN;
  private draggedElementMouseDownY = NaN;

  attached(): void {
    this.addPointerEventListeners();
  }

  private addPointerEventListeners = (): void => {
    this.resizeContainer.addEventListener("pointerdown", (event) => {
      /*prettier-ignore*/ console.log("[resize.ts,37] event.target: ", event.target);
      this.draggedElement = findParentElement(
        event.target as HTMLElement,
        this.element,
      );
      if (!this.draggedElement) return;

      this.isDraggedElement = true;
      this.draggedElementStartX = getElementPositionAsNumber(
        this.draggedElement,
        "left",
      );
      this.draggedElementStartY = getElementPositionAsNumber(
        this.draggedElement,
        "top",
      );
      this.draggedElementMouseDownX = event.clientX;
      this.draggedElementMouseDownY = event.clientY;
      event.stopPropagation();
    });

    this.resizeContainer.addEventListener("pointermove", (event) => {
      if (!this.draggedElement) return;
      if (!this.isDraggedElement) return;
      // Top
      const diffY = event.clientY - this.draggedElementMouseDownY;
      const relativeY = this.draggedElementStartY + diffY;
      // this.draggedElement.style.top = `${relativeY}px`;
      // Left
      const diffX = event.clientX - this.draggedElementMouseDownX;
      const relativeX = this.draggedElementStartX + diffX;
      // /*prettier-ignore*/ console.log("[resize.ts,65] relativeX: ", relativeX);
      // this.draggedElement.style.left = `${relativeX}px`;
      this.onResize?.(diffX, diffY);
      event.stopPropagation();
    });

    this.resizeContainer.addEventListener("pointerup", (event) => {
      if (!this.draggedElement) return;
      this.isDraggedElement = false;
      this.draggedElement = null;
      this.onResizeEnd();
      event.stopPropagation();
    });
  };
}
