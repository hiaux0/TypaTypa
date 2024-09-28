import { IVimState } from "../../features/vim/vim-types";

export type Id = string;

export type Language = "vn";

export interface IVocabulary {
  id: string;
  text: string;
}

export interface IApp {
  activeEditorId?: Id;
  todos: ITodo[];
  tags: ITag[];
  files?: ISecondBrainFile[];
  activeFileId?: string;
  vimStates?: IVimState[];
  vocabularies?: Record<Language, IVocabulary[]>;
}

export interface ITag {
  id: Id;
  label: string;
}

export interface ITodo {
  id: Id;
  content: string;
  tagIds?: ITag["id"][];
}

export interface ISecondBrainFile {
  fileName: string;
  id: string;
  content: string;
  vimId?: string;

  tags?: ITag;
  backlinks?: ITag["id"];
  editor?: IEditor;
}

export interface IEditor {
  id: Id;
}
