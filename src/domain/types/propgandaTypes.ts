export type Propaganda = Record<
  string,
  {
    tags: string[];
    topics: string[];
  }
>;

export type Tag = Record<
  string,
  {
    topics: string[];
    propaganda?: string[];
  }
>;

export type Topic = Record<
  string,
  {
    tags: string[];
    propaganda?: string[];
  }
>;

export interface PropagandaSchema {
  propaganda: Propaganda;
  tags: Tag;
  topics: Topic;
}
