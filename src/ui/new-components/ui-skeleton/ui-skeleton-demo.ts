import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Skeleton</h2>
    <ui-skeleton></ui-skeleton>

    <h2>Small Skeleton</h2>
    <ui-skeleton size="sm"></ui-skeleton>

    <h2>Large Skeleton</h2>
    <ui-skeleton size="lg"></ui-skeleton>

    <h2>Square Skeleton</h2>
    <ui-skeleton shape="square"></ui-skeleton>

    <h2>Circle Skeleton</h2>
    <ui-skeleton shape="circle"></ui-skeleton>
  </div>
`;

@customElement({ name: "ui-skeleton-demo", template })
export class UiSkeletonDemo {}
