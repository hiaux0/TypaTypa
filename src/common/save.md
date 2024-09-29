-----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------------

[VIM_COMMAND.visualMoveToOtherEndOfMarkedArea]: () => {
  const tempA = this.dragStartColumnIndex;
  const tempB = this.dragStartRowIndex;
  this.dragEndColumnIndex = this.dragEndColumnIndex;
  this.dragEndRowIndex = this.dragEndRowIndex;
  this.dragEndColumnIndex = tempA;
  this.dragEndRowIndex = tempB;
},

