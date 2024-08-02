import "./tab-drawer.scss";

interface Topic {
  title: string;
  content: string;
}

interface TabDrawerConfig {
  topcis: Topic;
}

const TOPICS: Topic[] = [
  {
    title: "Topics",
    content: "Manage your Topics here.",
  },
  {
    title: "Remember",
    content: "Manage your Remembers here.",
  },
];

export class TabDrawer {
  public drawerRef: HTMLElement | null = null;
  public message = "tab-drawer.html";
  public topics = TOPICS;
  public activeTopic: Topic | null = this.topics[0];
  public isDrawerOpen = false;

  attached() {
    /*prettier-ignore*/ console.log("[tab-drawer.ts,32] this.activeTopic: ", this.activeTopic);
    /*prettier-ignore*/ console.log("[tab-drawer.ts,34] this.isDrawerOpen: ", this.isDrawerOpen);
  }

  public openDrawer(topicTitle: string): void {
    this.isDrawerOpen = true;
    const activeTopic = this.topics.find((topic) => topic.title === topicTitle);
    this.activeTopic = activeTopic;
  }

  public closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  public toggleDrawer(topicTitle: string): void {
    if (!this.isDrawerOpen) {
      this.openDrawer(topicTitle);
      return;
    }

    const activeTopic = this.topics.find((topic) => topic.title === topicTitle);
    const isSameTopic = this.activeTopic?.title === activeTopic?.title;
    if (isSameTopic) {
      this.closeDrawer();
      return;
    }

    this.activeTopic = activeTopic;
  }
}
