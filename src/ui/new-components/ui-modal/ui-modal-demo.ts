import { UiModal } from "./ui-modal";

export class UiModalDemo {
  public message = "ui-modal-demo";

  // Example 1: Default Modal
  public defaultModal = `
    <ui-modal>
      <div>Default Modal Content</div>
    </ui-modal>
  `;

  // Example 2: Small Modal
  public smallModal = `
    <ui-modal size="sm">
      <div>Small Modal Content</div>
    </ui-modal>
  `;

  // Example 3: Large Modal
  public largeModal = `
    <ui-modal size="lg">
      <div>Large Modal Content</div>
    </ui-modal>
  `;

  // Example 4: Modal without Backdrop
  public noBackdropModal = `
    <ui-modal backdrop="none">
      <div>Modal without Backdrop Content</div>
    </ui-modal>
  `;
}
