import "./khong-a-page.scss";

const titleQuestions = [
  "What do you want to denied of today?",
  "No is no, yes is no",
];

enum LifeAreas {
  "Relationships",
  "Career",
  "Health",
  "Wealth",
  "Personal Growth",
  "Family",
  "Social Life",
  "Hobbies",
  "Spirituality",
}

const possibleQuestions = [
  "Should I",
  "Can I",
  "Will I",
  "Is it a good idea to",
  "Is it possible to",
  "Is it a good time to",
  "Is it a good time for me to",
  "Are there any reasons for me to",
  "Are there any reasons not to",
];

const possibleNos = [
  "No.",
  "No!",
  "Nooooo",
  "Absolutely no.",
  "Ye.., No.",
  "Nope",
  "Nope.",
  "Nope!",
  "Hmm, no.",
  "Let me think... No.",
  "Let's count the leaves on the tree. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. No.",
  "Ok, let's see. No.",
  "Well considering the circumstances, no.",
];

export class KhongAPage {
  public message = "khong-a-page.html";
}
