import { NavigationInstruction, Params, RouteNode } from "@aurelia/router-lite";
import "./ui-lib-welcome.scss";

export class UiLibWelcome {
  public message = "ui-lib-welcome.html";
  private fragment: string;
  public viewModelName: string;
  public componentPath: string;
    templatePath: string;

  canLoad(params: Params, next: RouteNode): boolean | NavigationInstruction {
    /*prettier-ignore*/ console.log("[ui-lib-welcome.ts,11] params: ", params);
    if (params.viewModelName) {
      const { viewModelName, category } = params;
      /*prettier-ignore*/ console.log("[ui-lib-welcome.ts,14] category: ", category);
      /*prettier-ignore*/ console.log("[ui-lib-welcome.ts,13] viewModelName: ", viewModelName);
      this.viewModelName = viewModelName;
      this.templatePath = `../pages/ui-lib-page/uilib-${category}/${viewModelName}/${viewModelName}.html`;
      this.componentPath = `../pages/ui-lib-page/uilib-${category}/${viewModelName}/${viewModelName}.ts`;
      /*prettier-ignore*/ console.log("[ui-lib-welcome.ts,18] this.componentPath: ", this.componentPath);
    }
    return true;
  }
}
