import { kebabCase } from "aurelia";

export function getCssVar(
  varName: string,
  isPixel = true,
  documentElement = document.documentElement,
): number {
  const cssVar = getComputedStyle(documentElement).getPropertyValue(varName);

  if (isPixel) {
    return getValueFromPixelString(cssVar);
  }
  return Number(cssVar);
}

export function setCssVariable(varName: string, value: string | number): void {
  const valueAsString = typeof value === "number" ? `${value}px` : value;
  if (varName.startsWith("--")) {
    document.documentElement.style.setProperty(varName, valueAsString);
    return;
  }

  const finalVarName = `--${kebabCase(varName)}`;
  document.documentElement.style.setProperty(finalVarName, valueAsString);
}

/**
 * '480px' --> 480
 */
export function getValueFromPixelString(pixelString: string): number {
  return Number(pixelString.replace(/px$/, ""));
}

export function getComputedValueFromPixelString(
  element: Element | HTMLElement,
  value: string,
): number {
  // @ts-ignore
  return getValueFromPixelString(getComputedStyle(element)[value]);
}
