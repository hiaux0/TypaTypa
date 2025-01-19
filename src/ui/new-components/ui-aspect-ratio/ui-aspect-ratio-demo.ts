export class UiAspectRatioDemo {
  public message = "ui-aspect-ratio-demo";

  // Example 1: Default Aspect Ratio
  public defaultAspectRatio = `
    <ui-aspect-ratio>
      <div>Default Aspect Ratio Content</div>
    </ui-aspect-ratio>
  `;

  // Example 2: 1/1 Aspect Ratio
  public oneToOneAspectRatio = `
    <ui-aspect-ratio ratio="1/1">
      <div>1/1 Aspect Ratio Content</div>
    </ui-aspect-ratio>
  `;

  // Example 3: 4/3 Aspect Ratio
  public fourToThreeAspectRatio = `
    <ui-aspect-ratio ratio="4/3">
      <div>4/3 Aspect Ratio Content</div>
    </ui-aspect-ratio>
  `;

  // Example 4: 21/9 Aspect Ratio
  public twentyOneToNineAspectRatio = `
    <ui-aspect-ratio ratio="21/9">
      <div>21/9 Aspect Ratio Content</div>
    </ui-aspect-ratio>
  `;
}
