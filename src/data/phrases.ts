export type Phrase = {
  text: string;
  answer: 'period' | 'question' | 'exclamation' | 'comma';
  position: 'end' | 'middle';
};

export type PhraseCollection = {
  [key: string]: Phrase[];
};

export const samplePhrases: PhraseCollection = {
  period: [
    { text: "I love to play in the park", answer: "period", position: 'end' },
    { text: "The sun is shining today", answer: "period", position: 'end' },
    { text: "She reads books every day", answer: "period", position: 'end' }
  ],
  question: [
    { text: "What time is it", answer: "question", position: 'end' },
    { text: "How are you today", answer: "question", position: 'end' },
    { text: "Where did you go", answer: "question", position: 'end' }
  ],
  // Add more categories as needed
}; 