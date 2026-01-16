export const generateQuotes = (count: number) => {
  const baseQuotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Strive not to be a success, but rather to be of value.",
    "The mind is everything. What you think you become.",
    "An unexamined life is not worth living.",
    "The journey of a thousand miles begins with a single step.",
    "That which does not kill us makes us stronger.",
    "Life is what happens when you're busy making other plans.",
    "The best way to predict the future is to create it.",
    "Innovation distinguishes between a leader and a follower.",
    "Your time is limited, don't waste it living someone else's life.",
    "The only impossible journey is the one you never begin.",
    "Do not wait for a leader; do it alone, person to person.",
    "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "The way to get started is to quit talking and begin doing.",
    "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
    "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
    "Life is 10% what happens to you and 90% how you react to it."
  ];

  const quotes = [];
  for (let i = 0; i < count; i++) {
    quotes.push(`Quote ${i + 1}: ${baseQuotes[i % baseQuotes.length]}`);
  }
  return quotes;
};

export const quotes = generateQuotes(1200); // Generate 1200 quotes to ensure 1000+ are available
