import { customElement } from "aurelia";

const template = `
  <div>
    <h2>Default Slider</h2>
    <ui-slider></ui-slider>

    <h2>Small Slider</h2>
    <ui-slider size="sm"></ui-slider>

    <h2>Large Slider</h2>
    <ui-slider size="lg"></ui-slider>

    <h2>Primary Slider</h2>
    <ui-slider color="primary"></ui-slider>

    <h2>Secondary Slider</h2>
    <ui-slider color="secondary"></ui-slider>

    <h2>Destructive Slider</h2>
    <ui-slider color="destructive"></ui-slider>
  </div>
`;

@customElement({ name: "ui-slider-demo", template })
export class UiSliderDemo {}
