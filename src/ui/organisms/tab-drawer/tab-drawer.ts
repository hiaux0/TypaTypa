import "./tab-drawer.scss";

interface TabDrawerConfig {
  topcis: {
    title: string;
    content: string;
  };
}

const TOPICS: TabDrawerConfig["topcis"][] = [
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
  public message = "tab-drawer.html";
  public topics = TOPICS;
  public activeTopic = this.topics[0];
  public isDrawerOpen = false;

  public toggleDrawer(topicTitle: string) {
    const activeTopic = this.topics.find((topic) => topic.title === topicTitle);
    this.activeTopic = activeTopic;
    const drawer = document.getElementById("drawer");
    drawer.classList.toggle("active");
  }
}
