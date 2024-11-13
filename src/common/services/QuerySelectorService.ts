export class QuerySelectorService {
  constructor(
    private container: HTMLElement | undefined,
    private childSelector: string | undefined,
  ) {}

  public getInputContainerChildren() {
    const $children = QuerySelectorService.getInputContainerChildren(
      this.container,
      this.childSelector,
    );
    return $children;
  }

  public getInputContainerChildrenText() {
    /*prettier-ignore*/ console.log("[QuerySelectorService.ts,17] this.container: ", this.container);
    const $children = QuerySelectorService.getInputContainerChildren(
      this.container,
      this.childSelector,
    );
    return $children;
  }

  public static getInputContainerChildren(
    container: HTMLElement | undefined,
    childSelector: string | undefined,
  ) {
    const $children = container?.querySelectorAll<HTMLElement>(
      `.${childSelector}`,
    );
    return $children;
  }

  public static getInputContainerChildrenText(
    container: HTMLElement | undefined,
    childSelector: string | undefined,
  ) {
    const $children = container?.querySelectorAll<HTMLElement>(
      `.${childSelector} .editorText`,
    );
    return $children;
  }
}
