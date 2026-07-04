export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

export const questions: Question[] = [
  {
    question: "主角美美的家族守護神是什麼動物？",
    options: ["小熊貓", "狐狸", "老虎"],
    correctAnswer: "小熊貓"
  },
  {
    question: "美美在什麼情緒激動時會變成小熊貓？",
    options: ["所有的強烈情緒", "只有生氣的時候", "只有開心的時候"],
    correctAnswer: "所有的強烈情緒"
  },
  {
    question: "美美和她的朋友們最喜歡的男子團體叫什麼名字？",
    options: ["4*Town", "5*Town", "3*Town"],
    correctAnswer: "4*Town"
  },
  {
    question: "美美的媽媽叫什麼名字？",
    options: ["茗 (Ming)", "萍 (Ping)", "芳 (Fang)"],
    correctAnswer: "茗 (Ming)"
  },
  {
    question: "美美家裡經營什麼設施？",
    options: ["宗祠/寺廟", "餐廳", "雜貨店"],
    correctAnswer: "宗祠/寺廟"
  },
  {
    question: "隱藏小熊貓的儀式需要在什麼時候進行？",
    options: ["紅月之夜", "滿月之夜", "新月之夜"],
    correctAnswer: "紅月之夜"
  },
  {
    question: "美美為了籌錢去看演唱會，做了什麼事？",
    options: ["賣小熊貓周邊和合照", "打工送外賣", "賣餅乾"],
    correctAnswer: "賣小熊貓周邊和合照"
  },
  {
    question: "在演唱會上，美美的媽媽變成了什麼？",
    options: ["巨大的小熊貓", "巨大的龍", "巨大的狐狸"],
    correctAnswer: "巨大的小熊貓"
  },
  {
    question: "儀式最後，美美決定怎麼處理她的小熊貓？",
    options: ["保留小熊貓", "封印小熊貓", "送給朋友"],
    correctAnswer: "保留小熊貓"
  },
  {
    question: "故事發生在哪個城市？",
    options: ["多倫多", "溫哥華", "紐約"],
    correctAnswer: "多倫多"
  }
];

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
