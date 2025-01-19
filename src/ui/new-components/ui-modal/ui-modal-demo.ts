import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Modal</h2>
    <ui-modal>
      <div>Default Modal Content</div>
    </ui-modal>

    <h2>Small Modal</h2>
    <ui-modal size="sm">
      <div>Small Modal Content</div>
    </ui-modal>

    <h2>Large Modal</h2>
    <ui-modal size="lg">
      <div>Large Modal Content</div>
    </ui-modal>

    <h2>Modal without Backdrop</h2>
    <ui-modal backdrop="none">
      <div>Modal without Backdrop Content</div>
    </ui-modal>
  </div>
`;

@customElement({ name: "ui-modal-demo", template })
export class UiModalDemo {}
