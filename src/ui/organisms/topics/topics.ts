import { bindable } from "aurelia";
import "./topics.scss";
import { generateId } from "../../../common/modules/random";
import { getTranslation } from "../../../common/modules/translations";
import { Topic } from "../../../types";
import { typingDatabase } from "../../../common/modules/database/typingDatabase";

const TOPICS: Topic[] = [
  {
    id: generateId(),
    title: "Living",
    content: [{ text: "live one" }, { text: "live two" }],
  },
  {
    id: generateId(),
    title: "Education",
    content: [{ text: "edu one" }, { text: "edu two" }],
  },
];

export class Topics {
  @bindable() public onTopicChange: (topic: Topic) => void = () => {};
  public getTranslation = getTranslation;
  public topics = [];
  public selectedTopic: Topic | null = null;
  public isEditTopicTitle = false;

  attached() {
    const dbData = typingDatabase.getItem();
    this.topics = dbData.topics ?? TOPICS;

    const targetTopic = typingDatabase.getSelectedTopic();
    if (targetTopic) {
      this.selectedTopic = targetTopic;
    } else {
      this.selectedTopic = this.topics[1];
    }
  }

  public addTopic(): void {
    this.isEditTopicTitle = true;
    let title = getTranslation("untitled");
    const alreadyHasUntitleTopic = this.findTopicByTitle(title);
    if (alreadyHasUntitleTopic) {
      title += this.getNumOfUntitledTitles();
    }

    const newTopic = {
      id: generateId(),
      title,
      content: [{ id: generateId(), text: "" }],
    };
    this.topics = [newTopic, ...this.topics];
    this.selectTopic(title);

    typingDatabase.setItem({ topics: this.topics });
  }

  public isEmptyTopic(topic: Topic): boolean {
    const isEmptyContent =
      topic.content.length === 1 && topic.content[0].text === "";
    const isUntitled = topic.title === getTranslation("untitled");
    const is = isUntitled && isEmptyContent;
    return is;
  }

  public findTopicByTitle(title: string): Topic | undefined {
    return this.topics.find((topic) => topic.title === title);
  }

  public findTopicById(id: string): Topic | undefined {
    return this.topics.find((topic) => topic.id === id);
  }

  public getNumOfUntitledTitles(): number {
    const filtered = this.topics.filter((topic) =>
      topic.title.includes(getTranslation("untitled")),
    );
    const amount = filtered.length;
    return amount;
  }

  public titleForNewTopicAdded(topic: Topic) {
    this.isEditTopicTitle = false;
    // To have Aurelia re-render the component, first remove, then add the topic again
    this.topics = this.topics.filter((t) => t.id !== topic.id);
    this.topics = [topic, ...this.topics];
    typingDatabase.setItem({ topics: this.topics });
  }

  public addContent(topic: Topic): void {
    const newContent = { id: generateId(), text: "" };
    topic.content = [newContent, ...topic.content];
    typingDatabase.setItem({ topics: this.topics });
  }

  public selectTopic(topicTitle: string): void {
    const found = this.topics.find((topic) => topic.title === topicTitle);
    this.selectedTopic = found ?? null;
    this.onTopicChange(this.selectedTopic);

    typingDatabase.setItem({ selectedTopicId: this.selectedTopic?.id });
  }

  public refreshTopic(): void {
    const dbData = typingDatabase.getItem();
    this.topics = dbData.topics ?? TOPICS;

    const targetTopic = typingDatabase.getSelectedTopic();
    if (targetTopic) {
      this.selectedTopic = targetTopic;
    } else {
      this.selectedTopic = this.topics[1];
    }
  }

  public contentChanged(contentId: string, contentText: string): void {
    const targetTopic = this.findTopicById(this.selectedTopic.id);
    const targetContent = targetTopic.content.find(
      (content) => content.id === contentId,
    );
    targetContent.text = contentText;
    typingDatabase.setItem({ topics: this.topics });
    this.refreshTopic();
    this.onTopicChange(targetTopic);
  }
}
