export function popVimInstanceId(): void {
  //if (window.activeVimInstancesIdMap.length > 1) {
  //  window.activeVimInstancesIdMap.pop();
  //}
  if (window.activeVimInstancesIdMap.length > 1) {
    // keep 1
    window.setTimeout(() => {
      window.activeVimInstancesIdMap.pop();
    }, 66);
  }
}
