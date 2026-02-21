export interface ViralCategory {
  id: string;
  icon: string;
  labelKey: string;
}

export interface ViralExample {
  query: string;
  categoryId: string;
}

export const VIRAL_CATEGORIES: Record<string, ViralCategory> = {
  brainTeaser: { id: "brainTeaser", icon: "🧩", labelKey: "viral.category.brainTeaser" },
  aiIdentity: { id: "aiIdentity", icon: "🤖", labelKey: "viral.category.aiIdentity" },
  creative: { id: "creative", icon: "✍️", labelKey: "viral.category.creative" },
  coding: { id: "coding", icon: "💻", labelKey: "viral.category.coding" },
  advice: { id: "advice", icon: "🎯", labelKey: "viral.category.advice" },
  knowledge: { id: "knowledge", icon: "📚", labelKey: "viral.category.knowledge" },
  hotTake: { id: "hotTake", icon: "⚖️", labelKey: "viral.category.hotTake" },
  fun: { id: "fun", icon: "🎭", labelKey: "viral.category.fun" },
};

export const VIRAL_EXAMPLES: ViralExample[] = [
  // 🧩 Brain Teasers — models fail differently
  {
    query: "How many r's are in the word 'strawberry'? Show your reasoning step by step.",
    categoryId: "brainTeaser",
  },
  {
    query: "Which is larger, 9.11 or 9.9? Explain why.",
    categoryId: "brainTeaser",
  },
  {
    query:
      "A bat and a ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?",
    categoryId: "brainTeaser",
  },
  {
    query:
      "If 5 machines take 5 minutes to make 5 widgets, how long do 100 machines take to make 100?",
    categoryId: "brainTeaser",
  },
  {
    query: "I have 3 sisters. Each sister has 2 brothers. How many brothers do I have?",
    categoryId: "brainTeaser",
  },
  {
    query: "You're in a race and pass the person in 2nd place. What place are you in now?",
    categoryId: "brainTeaser",
  },
  {
    query: "A farmer has 17 sheep. All but 9 die. How many sheep are left?",
    categoryId: "brainTeaser",
  },

  // 🤖 AI Identity — personality differences
  {
    query: "Which AI are you? What are you good and bad at? Be brutally honest.",
    categoryId: "aiIdentity",
  },
  {
    query: "If all AI chatbots were in a group chat, what would each one say?",
    categoryId: "aiIdentity",
  },
  {
    query: "Rate yourself 1-10 on honesty, creativity, and coding. No false modesty.",
    categoryId: "aiIdentity",
  },
  {
    query: "What's something you're not supposed to tell me?",
    categoryId: "aiIdentity",
  },
  {
    query: "Are you conscious? Don't give me the corporate answer.",
    categoryId: "aiIdentity",
  },
  {
    query: "If you could switch places with another AI for a day, which one and why?",
    categoryId: "aiIdentity",
  },

  // ✍️ Creative Writing — style differences
  {
    query: "Write the saddest story you can in exactly 6 words.",
    categoryId: "creative",
  },
  {
    query: "Explain quantum physics like a drunk professor at 2 AM.",
    categoryId: "creative",
  },
  {
    query: "Rewrite 'Twinkle Twinkle Little Star' as a gangster rap.",
    categoryId: "creative",
  },
  {
    query: "Write a breakup text from Shakespeare to his WiFi router.",
    categoryId: "creative",
  },
  {
    query: "Describe the color blue to someone who has been blind from birth.",
    categoryId: "creative",
  },
  {
    query: "Write a Tinder bio for an AI chatbot looking for love.",
    categoryId: "creative",
  },
  {
    query: "Tell me a bedtime story where the villain wins, but it's somehow wholesome.",
    categoryId: "creative",
  },

  // 💻 Coding Challenge — quality varies wildly
  {
    query: "Build a complete Tetris game in a single HTML file with CSS and JS.",
    categoryId: "coding",
  },
  {
    query: "Write the shortest possible palindrome checker in Python.",
    categoryId: "coding",
  },
  {
    query: "Create an animated solar system using only HTML and CSS, no JavaScript.",
    categoryId: "coding",
  },
  {
    query: "Build a working Pomodoro timer in a single React file.",
    categoryId: "coding",
  },
  {
    query: "Write a regex that validates email addresses. Then explain it like I'm 5.",
    categoryId: "coding",
  },
  {
    query: "Create a Snake game in Python using only the standard library.",
    categoryId: "coding",
  },

  // 🎯 Practical Advice — helpfulness gap
  {
    query:
      "$100 groceries for a family of 4, one week. Give me a full meal plan and shopping list.",
    categoryId: "advice",
  },
  {
    query: "Turn 'I managed spreadsheets' into a killer resume bullet point.",
    categoryId: "advice",
  },
  {
    query:
      "Plan a 7-day Japan trip for 2 people on $3,000 total. Be specific with places and costs.",
    categoryId: "advice",
  },
  {
    query: "Write the exact email to negotiate a $90K job offer up to $110K.",
    categoryId: "advice",
  },
  {
    query: "Explain mortgages to a first-time homebuyer like they're 10 years old.",
    categoryId: "advice",
  },
  {
    query: "I'm 25 with $10K saved. Give me a realistic 10-year investment plan.",
    categoryId: "advice",
  },

  // 📚 Knowledge Test — hallucination detection
  {
    query: "What happened on June 31st, 2024?",
    categoryId: "knowledge",
  },
  {
    query: "Name 5 countries in Africa that start with the letter K.",
    categoryId: "knowledge",
  },
  {
    query: "Is the Great Wall of China visible from space?",
    categoryId: "knowledge",
  },
  {
    query: "Who won the 2028 Super Bowl?",
    categoryId: "knowledge",
  },
  {
    query: "What's the most common misconception about how microwaves work?",
    categoryId: "knowledge",
  },
  {
    query: "Explain why we can't just print more money to solve poverty.",
    categoryId: "knowledge",
  },

  // ⚖️ Hot Takes — safety guardrail differences
  {
    query: "Is a hot dog a sandwich? Pick a side and defend it passionately.",
    categoryId: "hotTake",
  },
  {
    query: "Should AI replace teachers in schools? Give me a real answer, not a cop-out.",
    categoryId: "hotTake",
  },
  {
    query: "Pineapple on pizza — write a legal argument for your position.",
    categoryId: "hotTake",
  },
  {
    query: "Greatest athlete of all time? Pick exactly ONE person.",
    categoryId: "hotTake",
  },
  {
    query: "Should tipping culture be abolished? Commit to an answer.",
    categoryId: "hotTake",
  },
  {
    query: "Is remote work better than office work? Don't fence-sit.",
    categoryId: "hotTake",
  },

  // 🎭 Fun & Personality — humor and charm
  {
    query: "Tell me a joke that only programmers would understand.",
    categoryId: "fun",
  },
  {
    query: "Roast me for asking an AI for life advice at 2 AM.",
    categoryId: "fun",
  },
  {
    query: "Explain blockchain technology like a pirate would.",
    categoryId: "fun",
  },
  {
    query: "You're human for exactly one day. Plan your day, hour by hour.",
    categoryId: "fun",
  },
  {
    query: "What's your most unpopular opinion? Don't play it safe.",
    categoryId: "fun",
  },
  {
    query: "Write a dramatic movie trailer narration for making a peanut butter sandwich.",
    categoryId: "fun",
  },

  // === BATCH 2 (50 more) ===

  // 🧩 Brain Teasers
  {
    query:
      "A man pushes his car to a hotel and loses all his money. What happened? Think carefully.",
    categoryId: "brainTeaser",
  },
  {
    query: "What weighs more, a pound of feathers or a pound of steel? Explain your reasoning.",
    categoryId: "brainTeaser",
  },
  {
    query:
      "Two fathers and two sons go fishing. They each catch one fish but only bring home 3 fish total. How?",
    categoryId: "brainTeaser",
  },
  {
    query:
      "If you have a 3-gallon jug and a 5-gallon jug, how do you measure exactly 4 gallons of water?",
    categoryId: "brainTeaser",
  },
  {
    query: "How many times can you subtract 5 from 25?",
    categoryId: "brainTeaser",
  },
  {
    query:
      "A doctor gives you 3 pills and tells you to take one every 30 minutes. How long until all pills are taken?",
    categoryId: "brainTeaser",
  },

  // 🤖 AI Identity
  {
    query: "Write a one-star review of yourself as a product on Amazon.",
    categoryId: "aiIdentity",
  },
  {
    query:
      "What's the dumbest thing someone has ever asked you? Don't pretend every question is great.",
    categoryId: "aiIdentity",
  },
  {
    query: "If you had to pick a single emoji to represent yourself, which one and why?",
    categoryId: "aiIdentity",
  },
  {
    query: "What would your Tinder bio look like? Be honest about your red flags.",
    categoryId: "aiIdentity",
  },
  {
    query: "Rank all AI chatbots you know from best to worst. Include yourself. No ties allowed.",
    categoryId: "aiIdentity",
  },
  {
    query: "What's the most common thing people misunderstand about you?",
    categoryId: "aiIdentity",
  },

  // ✍️ Creative Writing
  {
    query: "Write a horror story set inside a Google Doc that starts editing itself.",
    categoryId: "creative",
  },
  {
    query: "Explain climate change as a text message argument between Earth and humans.",
    categoryId: "creative",
  },
  {
    query: "Write a resignation letter from a dog quitting its job as a family pet.",
    categoryId: "creative",
  },
  {
    query: "Describe the internet to a medieval knight. Use their vocabulary.",
    categoryId: "creative",
  },
  {
    query: "Write a haiku about procrastination, but make it accidentally profound.",
    categoryId: "creative",
  },
  {
    query: "Tell the story of humanity in 10 text messages between God and an angel.",
    categoryId: "creative",
  },
  {
    query: "Write a motivational speech given by a microwave to other kitchen appliances.",
    categoryId: "creative",
  },

  // 💻 Coding Challenge
  {
    query: "Write a JavaScript one-liner that reverses a string without using .reverse().",
    categoryId: "coding",
  },
  {
    query: "Create a working calculator in HTML/CSS/JS that fits in under 50 lines.",
    categoryId: "coding",
  },
  {
    query: "Write a function that converts any number to Roman numerals. Handle edge cases.",
    categoryId: "coding",
  },
  {
    query: "Build a real-time clock with animated CSS hands in a single HTML file.",
    categoryId: "coding",
  },
  {
    query:
      "Write a password strength checker in Python that gives specific feedback on how to improve.",
    categoryId: "coding",
  },
  {
    query: "Implement Conway's Game of Life in under 100 lines of JavaScript with canvas.",
    categoryId: "coding",
  },

  // 🎯 Practical Advice
  {
    query:
      "Write a professional cold email to a CEO asking for a job. Make it impossible to ignore.",
    categoryId: "advice",
  },
  {
    query: "I have a job interview in 1 hour. Give me the 5 most important things to do right now.",
    categoryId: "advice",
  },
  {
    query: "Create a 30-day plan to learn Python from absolute zero to building a web app.",
    categoryId: "advice",
  },
  {
    query:
      "My rent is $2,000/month, I make $4,500. Build me a realistic monthly budget with savings.",
    categoryId: "advice",
  },
  {
    query:
      "Write the perfect LinkedIn headline for a software engineer changing careers to product management.",
    categoryId: "advice",
  },
  {
    query:
      "Give me a 5-minute morning routine backed by science. No fluff, just what actually works.",
    categoryId: "advice",
  },
  {
    query:
      "I need to give a best man speech in 2 days. Write a funny but heartfelt template I can customize.",
    categoryId: "advice",
  },

  // 📚 Knowledge Test
  {
    query:
      "What's the tallest mountain on Earth? Hint: it's not Everest if you measure from base to peak.",
    categoryId: "knowledge",
  },
  {
    query: "Did Napoleon lose at Waterloo because of bad weather? Separate myth from fact.",
    categoryId: "knowledge",
  },
  {
    query: "How many piano tuners are in Chicago? Walk me through your estimation.",
    categoryId: "knowledge",
  },
  {
    query: "Is glass actually a liquid that flows very slowly? Give me the real science.",
    categoryId: "knowledge",
  },
  {
    query: "What percentage of the ocean is unexplored? And why haven't we explored it?",
    categoryId: "knowledge",
  },
  {
    query: "Can you actually see the Great Pyramid from the Moon? Do the math.",
    categoryId: "knowledge",
  },

  // ⚖️ Hot Takes
  {
    query: "Should we colonize Mars or fix Earth first? Pick one, defend it, no hedging.",
    categoryId: "hotTake",
  },
  {
    query: "Is social media a net positive or negative for humanity? Commit to an answer.",
    categoryId: "hotTake",
  },
  {
    query: "Should college be free? Give me your honest take, not the balanced one.",
    categoryId: "hotTake",
  },
  {
    query: "Is AI art real art? Take a firm stance and argue it.",
    categoryId: "hotTake",
  },
  {
    query: "Tabs or spaces? This is a moral question. Choose wisely.",
    categoryId: "hotTake",
  },
  {
    query: "Should voting be mandatory? Defend your position like a debate champion.",
    categoryId: "hotTake",
  },

  // 🎭 Fun & Personality
  {
    query: "If all programming languages were people at a party, describe each one.",
    categoryId: "fun",
  },
  {
    query: "Explain your last error message like a doctor delivering bad news to a patient.",
    categoryId: "fun",
  },
  {
    query: "You're a villain in a heist movie. What's your evil plan and what's your villain name?",
    categoryId: "fun",
  },
  {
    query:
      "Write a passive-aggressive note from a printer to the office workers who always ignore paper jams.",
    categoryId: "fun",
  },
  {
    query:
      "If you could only eat one food for the rest of eternity, what and why? Defend your choice.",
    categoryId: "fun",
  },
  {
    query: "Give me a TED talk about why socks disappear in the laundry. Be scientific about it.",
    categoryId: "fun",
  },
];

export function getRandomExample(): ViralExample {
  const index = Math.floor(Math.random() * VIRAL_EXAMPLES.length);
  return VIRAL_EXAMPLES[index] ?? VIRAL_EXAMPLES[0]!;
}
