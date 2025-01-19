import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Aspect Ratio</h2>
    <ui-aspect-ratio>
      <div>Default Aspect Ratio Content</div>
    </ui-aspect-ratio>

    <h2>1/1 Aspect Ratio</h2>
    <ui-aspect-ratio ratio="1/1">
      <div>1/1 Aspect Ratio Content</div>
    </ui-aspect-ratio>

    <h2>4/3 Aspect Ratio</h2>
    <ui-aspect-ratio ratio="4/3">
      <div>4/3 Aspect Ratio Content</div>
    </ui-aspect-ratio>

    <h2>21/9 Aspect Ratio</h2>
    <ui-aspect-ratio ratio="21/9">
      <div>21/9 Aspect Ratio Content</div>
    </ui-aspect-ratio>
  </div>
`;

@customElement({ name: "ui-aspect-ratio-demo", template })
export class UiAspectRatioDemo {}
