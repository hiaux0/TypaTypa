/**
 * TODO
 * - [ ] limit undo redo stack size
 */
export class UndoRedo<T> {
  undoStack: T[];
  redoStack: T[];
  currentState: T;

  constructor(initialState?: T) {
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = initialState;
  }

  public undo(): T {
    if (this.undoStack.length > 0) {
      this.redoStack.push(this.currentState);
      this.currentState = this.undoStack.pop();
      return this.currentState;
    }
  }

  public redo(): T {
    if (this.redoStack.length > 0) {
      this.undoStack.push(this.currentState);
      this.currentState = this.redoStack.pop();
      return this.currentState;
    }
  }

  public getState() {
    return this.currentState;
  }

  public setState(newState: T) {
    if (this.currentState) {
      this.undoStack.push(this.currentState);
    }
    this.currentState = newState;
    this.redoStack = []; // Clear redo stack on new action
  }

  public init(newState: T) {
    this.undoStack = [newState];
    this.currentState = newState;
  }
}

// Example usage
//const editor = new UndoRedo();
//
//editor.setState("First state");
//console.log(editor.getState()); // First state
//
//editor.setState("Second state");
//console.log(editor.getState()); // Second state
//
//editor.undo();
//console.log(editor.getState()); // First state
//
//editor.redo();
//console.log(editor.getState()); // Second state
//
//editor.setState("Third state");
//console.log(editor.getState()); // Third state
//
//editor.undo();
//editor.undo();
//console.log(editor.getState()); // First state
//
//editor.redo();
//console.log(editor.getState()); // Second state
