import "./topics.scss";

interface Topic {
  title: string;
  content: string[];
}

const TOPICS: Topic[] = [
  {
    title: "Living",
    content: ["live one", "live two"],
  },
  {
    title: "Education",
    content: ["edu one", "edu two"],
  },
];

export class Topics {
  public topics = TOPICS;
  public selectedTopic: Topic | null = null;

  attached() {
    this.selectedTopic = this.topics[1];
  }

  public selectTopic(topicTitle: string): void {
    const found = this.topics.find((topic) => topic.title === topicTitle);
    this.selectedTopic = found ?? null;
  }
}
