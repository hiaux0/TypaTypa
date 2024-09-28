import { bindable, INode, resolve } from "aurelia";
import {
  findParentElement,
  getElementPositionAsNumber,
} from "../../common/modules/htmlElements";

export class DraggableCustomAttribute {
  @bindable() dragContainer: HTMLElement;
  @bindable() cellWidth: number;
  @bindable() cellHeight: number;

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
  private draggedElementSoFarX = NaN;
  private draggedElementSoFarY = NaN;

  attached(): void {
    this.addPointerEventListeners();
  }

  private addPointerEventListenersByPixel = (): void => {
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

  private addPointerEventListeners = (): void => {
    this.dragContainer.addEventListener("pointerdown", (event) => {
      //
      this.draggedElement = findParentElement(
        event.target as HTMLElement,
        this.element,
      );
      if (!this.draggedElement) return;

      this.isDraggedElement = true;
      //
      this.draggedElementStartX = getElementPositionAsNumber(
        this.draggedElement,
        "left",
      );

      this.draggedElementStartY = getElementPositionAsNumber(
        this.draggedElement,
        "top",
      );
      //
      this.draggedElementMouseDownX = event.clientX;
      this.draggedElementMouseDownY = event.clientY;
    });

    this.dragContainer.addEventListener("pointermove", (event) => {
      if (!this.draggedElement) return;
      if (!this.isDraggedElement) return;
      // Top
      const diffY = event.clientY - this.draggedElementMouseDownY;
      this.draggedElementSoFarY = diffY;
      const diffYInCells = diffY / this.cellHeight;
      if (diffYInCells !== 0) {
        if (diffYInCells < 0) {
          const moveBy = Math.ceil(diffYInCells);
          this.moveGridCell(Math.abs(moveBy), "up");
        } else {
          const moveBy = Math.floor(diffYInCells);
          this.moveGridCell(moveBy, "down");
        }
      }
      // Left
      const diffX = event.clientX - this.draggedElementMouseDownX;
      this.draggedElementSoFarX = diffX;
      const diffXInCells = diffX / this.cellWidth;
      if (diffXInCells !== 0) {
        if (diffXInCells < 0) {
          const moveBy = Math.ceil(diffXInCells);
          this.moveGridCell(Math.abs(moveBy), "left");
        } else {
          const moveBy = Math.floor(diffXInCells);
          this.moveGridCell(moveBy, "right");
        }
      }
    });

    this.dragContainer.addEventListener("pointerup", () => {
      this.isDraggedElement = false;
      this.draggedElement = null;
    });
  };

  private moveGridCell = (
    amount: number,
    direction: "up" | "down" | "left" | "right",
  ) => {
    switch (direction) {
      case "up": {
        const relativeY = this.draggedElementStartY - amount * this.cellHeight;
        this.draggedElement.style.top = `${relativeY}px`;
        break;
      }
      case "down": {
        const relativeY = this.draggedElementStartY + amount * this.cellHeight;
        this.draggedElement.style.top = `${relativeY}px`;
        break;
      }
      case "left": {
        const relativeX = this.draggedElementStartX - amount * this.cellWidth;
        this.draggedElement.style.left = `${relativeX}px`;
        break;
      }
      case "right": {
        const relativeX = this.draggedElementStartX + amount * this.cellWidth;
        this.draggedElement.style.left = `${relativeX}px`;
        break;
      }
    }
  };
}
