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

export function setCssVariable(varName: string, value: string): void {
  if (varName.startsWith("--")) {
    document.documentElement.style.setProperty(varName, value);
    return;
  }

  const finalVarName = `--${kebabCase(varName)}`;
  document.documentElement.style.setProperty(finalVarName, value);
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
