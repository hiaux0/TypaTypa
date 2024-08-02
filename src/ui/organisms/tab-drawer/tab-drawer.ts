import { bindable } from "aurelia";
import "./tab-drawer.scss";

export interface Tabs {
  title: string;
}

export class TabDrawer {
  public drawerRef: HTMLElement | null = null;
  public message = "tab-drawer.html";
  @bindable() public tabs = [];
  @bindable() public activeTab: Tabs | null = null;
  public isDrawerOpen = true;

  attached() {
    this.activeTab = this.tabs[0];
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
