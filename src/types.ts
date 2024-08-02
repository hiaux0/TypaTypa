export interface DatabaseType {
  topics: Topic[];
  selectedTopicId?: string;
}

export interface Topic {
  id?: string;
  title: string;
  content: {
    id?: string;
    text: string;
  }[];
}
