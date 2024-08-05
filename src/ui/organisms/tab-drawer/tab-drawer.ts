import { bindable } from "aurelia";
import "./tab-drawer.scss";
import { onOutsideClick } from "../../../modules/htmlElements";

export interface Tabs {
  title: string;
}

export class TabDrawer {
  @bindable() public tabs = [];
  @bindable() public activeTab: Tabs | null = null;
  @bindable() public activeTabName = "";
  @bindable() public isDrawerOpen = true;
  public drawerContentRef: HTMLElement | null = null;
  public tabBarRef: HTMLElement | null = null;
  public message = "tab-drawer.html";

  activeTabNameChanged(tabName: string): void {
    this.openDrawer(tabName);
  }

  attached() {
    this.activeTab = this.tabs[1];

    onOutsideClick(
      this.drawerContentRef,
      () => {
        if (!this.isDrawerOpen) return;
        this.isDrawerOpen = false;
      },
      [this.tabBarRef],
    );
  }

  public openDrawer(topicTitle: string): void {
    this.isDrawerOpen = true;
    const activeTab = this.tabs.find((topic) => topic.title === topicTitle);
    this.activeTab = activeTab;
  }

  public closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  public toggleDrawer(topicTitle: string): void {
    if (!this.isDrawerOpen) {
      this.openDrawer(topicTitle);
      return;
    }

    const activeTopic = this.tabs.find((topic) => topic.title === topicTitle);
    const isSameTopic = this.activeTab?.title === activeTopic?.title;
    if (isSameTopic) {
      this.closeDrawer();
      return;
    }

    this.activeTab = activeTopic;
  }
}
