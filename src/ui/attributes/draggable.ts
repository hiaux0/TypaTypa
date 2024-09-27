import { bindable, INode, resolve } from "aurelia";
import {
  findParentElement,
  getElementPositionAsNumber,
} from "../../modules/htmlElements";

export class DraggableCustomAttribute {
  @bindable() dragContainer: HTMLElement;
  @bindable() cellWidth: number;
  @bindable() cellHeight: number;

  private element = resolve(INode) as HTMLElement;

  private draggedElement: HTMLElement | null = null;
  private isDraggedElement = false;
  /**
   * The position of the dragged element when the drag started.
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
    this.dragContainer.addEventListener("pointerdown", (event) => {
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
    });

    this.dragContainer.addEventListener("pointermove", (event) => {
      if (!this.draggedElement) return;
      if (!this.isDraggedElement) return;
      // Top
      /*prettier-ignore*/ console.log("[draggable.ts,51] event.clientY: ", event.clientY);
      const diffY = event.clientY - this.draggedElementMouseDownY;
      const relativeY = this.draggedElementStartY + diffY;
      this.draggedElement.style.top = `${relativeY}px`;
      // Left
      const diffX = event.clientX - this.draggedElementMouseDownX;
      const relativeX = this.draggedElementStartX + diffX;
      this.draggedElement.style.left = `${relativeX}px`;
    });

    this.dragContainer.addEventListener("pointerup", () => {
      this.isDraggedElement = false;
      this.draggedElement = null;
    });
  };
}
