export function getRandomId() {
  /**
   * "0.g6ck5nyod4".substring(2, 9)
   * -> g6ck5ny
   */
  return Math.random().toString(36).substring(2, 9);
}

// let lastId = '';
let counter = 0;
export default function generateId(): string {
  let randomByDate = Date.now().toString(25);
  randomByDate += counter++;

  const random = getRandomId();

  const finalId = `${random}-${randomByDate}`;

  return finalId;
}
