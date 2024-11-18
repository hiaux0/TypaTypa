export function cloneDeep(obj: any) {
  if (structuredClone) return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}
