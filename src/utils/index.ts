export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const samplePhrases = {
  period: [
    { text: "The sun is setting", correctMark: "period" },
    { text: "I love to read books", correctMark: "period" },
    // Add more phrases as needed
  ],
  question: [
    { text: "What time is it", correctMark: "question" },
    { text: "How are you today", correctMark: "question" },
    // Add more phrases as needed
  ],
  // Add more categories as needed
}; 