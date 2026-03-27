-- Players with signup (password stored as plain text per user request - no security)
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) NOT NULL DEFAULT 'piggy',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  term VARCHAR(255) NOT NULL,
  prompt VARCHAR(255) NOT NULL DEFAULT 'What is a...',
  correct_answer TEXT NOT NULL,
  wrong_answer_1 TEXT NOT NULL,
  wrong_answer_2 TEXT NOT NULL,
  wrong_answer_3 TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'economics'
);

-- Game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP DEFAULT NOW()
);

-- Seed questions
INSERT INTO questions (term, prompt, correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3) VALUES
  ('NEED', 'What is a...', 'Something you must have to survive', 'A physical item like a toy', 'Something you want but don''t need', 'Work done for someone else'),
  ('WANT', 'What is a...', 'Something nice to have but not essential', 'Food and water', 'A job you do for money', 'Money saved in a bank'),
  ('SAVING', 'What is...', 'Keeping money to use later', 'Spending all your money at once', 'Trading items with friends', 'Borrowing money from a bank'),
  ('BUDGET', 'What is a...', 'A plan for how to spend and save money', 'A type of piggy bank', 'A store where you buy things', 'A game about collecting coins'),
  ('EARNING', 'What is...', 'Getting money by working or doing tasks', 'Finding money on the ground', 'Asking your parents for money', 'Winning the lottery'),
  ('SPENDING', 'What is...', 'Using money to buy goods or services', 'Putting money in a jar', 'Giving money to charity', 'Counting your coins'),
  ('GOODS', 'What are...', 'Physical things you can buy and touch', 'Help from other people', 'Money in a bank account', 'Rules about trading'),
  ('SERVICES', 'What are...', 'Work that people do for others', 'Things you can hold in your hands', 'Items on a store shelf', 'Coins and paper money'),
  ('TRADE', 'What is...', 'Exchanging one thing for another', 'Giving things away for free', 'Throwing things in the trash', 'Making things in a factory'),
  ('PRODUCER', 'What is a...', 'Someone who makes goods or provides services', 'Someone who buys things at a store', 'A type of piggy bank', 'A person who saves money'),
  ('CONSUMER', 'What is a...', 'Someone who buys and uses goods or services', 'Someone who makes things in a factory', 'A person who works at a bank', 'Someone who gives away free items'),
  ('PROFIT', 'What is...', 'Money earned after paying all costs', 'The price tag on a toy', 'Money you borrow from a friend', 'The coins in your piggy bank');
