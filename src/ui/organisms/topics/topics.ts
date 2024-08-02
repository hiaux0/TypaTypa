import { bindable } from "aurelia";
import "./topics.scss";

export interface Topic {
  id?: string;
  title: string;
  content: {
    id?: string;
    text: string;
  }[];
}

const TOPICS: Topic[] = [
  {
    title: "Living",
    content: [{ text: "live one" }, { text: "live two" }],
  },
  {
    title: "Education",
    content: [{ text: "edu one" }, { text: "edu two" }],
  },
];

export class Topics {
  @bindable() public onTopicChange: (topic: Topic) => void = () => {};
  public topics = TOPICS;
  public selectedTopic: Topic | null = null;

  attached() {
    this.selectedTopic = this.topics[1];
  }

  public addTopic(): void {
    const title = "New Topic";
    this.topics.push({
      title,
      content: [{ text: "" }],
    });
    this.selectTopic(title);
  }

  public addContent(topic: Topic): void {
    const newContent = { text: "" };
    topic.content = [newContent, ...topic.content];
  }

  public selectTopic(topicTitle: string): void {
    const found = this.topics.find((topic) => topic.title === topicTitle);
    this.selectedTopic = found ?? null;
    this.onTopicChange(this.selectedTopic);
  }
}
