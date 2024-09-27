import { INode, resolve } from "aurelia";
import { getElementPositionAsNumber } from "../../modules/htmlElements";

export class DraggableCustomAttribute {
  private element = resolve(INode) as HTMLElement;

  private draggedElement: HTMLElement | null = null;
  private isDraggedElement = false;
  private draggedElementStartX = NaN;
  private draggedElementStartY = NaN;
  private draggedElementMouseDownX = NaN;
  private draggedElementMouseDownY = NaN;

  constructor() {
    this.element.addEventListener("pointerdown", (event) => {
      this.isDraggedElement = true;
      this.draggedElement = event.target as HTMLElement;
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
    this.element.addEventListener("pointermove", (event) => {
      if (!this.isDraggedElement) return;
      // Top
      const diffY = event.clientY - this.draggedElementMouseDownY;
      const relativeY = this.draggedElementStartY + diffY;
      this.draggedElement.style.top = `${relativeY}px`;
      // Left
      const diffX = event.clientX - this.draggedElementMouseDownX;
      const relativeX = this.draggedElementStartX + diffX;
      this.draggedElement.style.left = `${relativeX}px`;
    });
    this.element.addEventListener("pointerup", () => {
      this.isDraggedElement = false;
      this.draggedElement = null;
    });
  }
}