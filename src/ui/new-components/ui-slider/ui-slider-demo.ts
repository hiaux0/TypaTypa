import { UiSlider } from "./ui-slider";

export class UiSliderDemo {
  public message = "ui-slider-demo";

  // Example 1: Default Slider
  public defaultSlider = `
    <ui-slider></ui-slider>
  `;

  // Example 2: Small Slider
  public smallSlider = `
    <ui-slider size="sm"></ui-slider>
  `;

  // Example 3: Large Slider
  public largeSlider = `
    <ui-slider size="lg"></ui-slider>
  `;

  // Example 4: Primary Slider
  public primarySlider = `
    <ui-slider color="primary"></ui-slider>
  `;

  // Example 5: Secondary Slider
  public secondarySlider = `
    <ui-slider color="secondary"></ui-slider>
  `;

  // Example 6: Destructive Slider
  public destructiveSlider = `
    <ui-slider color="destructive"></ui-slider>
  `;
}
