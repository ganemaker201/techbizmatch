import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { AvatarIcon } from '../avatars.jsx';

const ANSWER_COLORS = [
  { bg: 'bg-kahoot-red', shadow: 'chunky-shadow-red', shape: '🔺' },
  { bg: 'bg-kahoot-blue', shadow: 'chunky-shadow-blue', shape: '🟦' },
  { bg: 'bg-kahoot-yellow', shadow: 'chunky-shadow-yellow', shape: '🔵' },
  { bg: 'bg-kahoot-green', shadow: 'chunky-shadow-green', shape: '⭐' },
];

const TIMER_SECONDS = 15;
const POINTS_PER_CORRECT = 250;
const XP_PER_CORRECT = 20;

export default function Game({ player, matchData, onGameEnd }) {
  const { opponent, questions, roomId } = matchData;
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedback, setFeedback] = useState(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentQ, setOpponentQ] = useState(0);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onOpponentUpdate = ({ score: s, currentQ: q }) => {
      setOpponentScore(s);
      setOpponentQ(q);
    };
    const onOpponentFinished = ({ score: s }) => {
      setOpponentScore(s);
    };
    const onGameOver = (result) => {
      onGameEnd({
        score: result.your_score,
        correct_answers: result.your_correct,
        total_questions: result.total_questions,
        xp_earned: result.your_correct * XP_PER_CORRECT,
        opponent_score: result.opponent_score,
        opponent_correct: result.opponent_correct,
        opponent_name: result.opponent_name,
      });
      navigate('/results');
    };
    const onOpponentDisconnected = () => {
      setOpponentDisconnected(true);
    };

    socket.on('opponent_update', onOpponentUpdate);
    socket.on('opponent_finished', onOpponentFinished);
    socket.on('game_over', onGameOver);
    socket.on('opponent_disconnected', onOpponentDisconnected);

    return () => {
      socket.off('opponent_update', onOpponentUpdate);
      socket.off('opponent_finished', onOpponentFinished);
      socket.off('game_over', onGameOver);
      socket.off('opponent_disconnected', onOpponentDisconnected);
    };
  }, []);

  useEffect(() => {
    if (feedback || finished) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, feedback, finished]);

  const handleTimeout = useCallback(() => {
    setFeedback('timeout');
    socket.emit('answer', { roomId, questionIndex: currentQ, correct: false, score });
    setTimeout(() => advance(), 1500);
  }, [currentQ, score, roomId]);

  const handleAnswer = (answer, idx) => {
    if (selected !== null || feedback) return;
    setSelected(idx);

    let newScore = score;
    let newCorrect = correctCount;

    if (answer.correct) {
      const timeBonus = Math.round((timeLeft / TIMER_SECONDS) * POINTS_PER_CORRECT);
      newScore = score + timeBonus;
      newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    socket.emit('answer', { roomId, questionIndex: currentQ, correct: answer.correct, score: newScore });
    setTimeout(() => advance(newScore, newCorrect), 1500);
  };

  const advance = (latestScore, latestCorrect) => {
    const s = latestScore !== undefined ? latestScore : score;
    const c = latestCorrect !== undefined ? latestCorrect : correctCount;
    const nextQ = currentQ + 1;
    if (nextQ >= questions.length) {
      finishGame(s, c);
    } else {
      setCurrentQ(nextQ);
      setSelected(null);
      setFeedback(null);
      setTimeLeft(TIMER_SECONDS);
    }
  };

  const finishGame = async (finalScore, finalCorrect) => {
    setFinished(true);
    socket.emit('finish', { roomId, score: finalScore, correctCount: finalCorrect });
    try {
      await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          score: finalScore,
          total_questions: questions.length,
          correct_answers: finalCorrect,
          xp_earned: finalCorrect * XP_PER_CORRECT,
        }),
      });
    } catch { /* continue */ }
  };

  useEffect(() => {
    if (opponentDisconnected && !finished) {
      onGameEnd({
        score,
        correct_answers: correctCount,
        total_questions: questions.length,
        xp_earned: correctCount * XP_PER_CORRECT,
        opponent_score: opponentScore,
        opponent_correct: 0,
        opponent_name: opponent.name,
        opponent_disconnected: true,
      });
      navigate('/results');
    }
  }, [opponentDisconnected]);

  const q = questions[currentQ];
  if (!q) return null;
  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface border-b-2 border-surface-container-high">
        <div className="flex items-center gap-3">
          <AvatarIcon avatarId={player.avatar} size="sm" />
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{player.name}</p>
            <p className="font-headline font-bold text-sm">{score} pts</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-headline font-black italic text-xl text-primary">VS</span>
          <span className="text-xs font-bold text-on-surface-variant">Q{currentQ + 1}/{questions.length}</span>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">{opponent.name}</p>
            <p className="font-headline font-bold text-sm text-secondary-dim">
              {opponentQ < questions.length ? `Q${opponentQ + 1}` : 'Done'} · {opponentScore} pts
            </p>
          </div>
          <AvatarIcon avatarId={opponent.avatar || 'dollar'} size="sm" />
        </div>
      </header>

      <main className="pt-24 pb-8 px-4 max-w-2xl mx-auto min-h-screen flex flex-col items-center">
        {/* Timer */}
        <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden mb-8 relative">
          <div
            className={`h-full rounded-full transition-all duration-1000 linear ${timeLeft <= 5 ? 'bg-error' : 'bg-primary-fixed-dim'}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Waiting overlay */}
        {finished && (
          <div className="fixed inset-0 z-40 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <span className="text-6xl animate-spin inline-block">⏳</span>
              <p className="font-headline font-bold text-2xl text-on-surface">Waiting for {opponent.name} to finish...</p>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="w-full text-center mb-10 mt-4">
          <span className="bg-primary/10 text-primary px-4 py-1 rounded-full font-bold text-xs tracking-widest uppercase mb-4 inline-block">
            MATCH THIS TERM
          </span>
          <p className="font-headline font-bold text-lg text-on-surface-variant mb-1">{q.prompt}</p>
          <h1 className="font-headline font-black italic text-5xl text-on-surface uppercase tracking-tight">{q.term}</h1>
        </div>

        {/* Answer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-2">
          {q.answers.map((answer, idx) => {
            const c = ANSWER_COLORS[idx];
            let extraClass = '';
            if (feedback && selected === idx) {
              extraClass = answer.correct ? 'animate-pulse-correct ring-4 ring-white' : 'animate-shake-error opacity-60';
            }
            if (feedback && answer.correct && selected !== idx) {
              extraClass = 'ring-4 ring-white';
            }
            if (feedback && !answer.correct && selected !== idx) {
              extraClass = 'opacity-40';
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(answer, idx)}
                disabled={!!feedback}
                className={`w-full aspect-[3/1] sm:aspect-square flex items-center justify-center p-6 ${c.bg} text-white rounded-2xl ${c.shadow} active:translate-y-1 active:shadow-none transition-all hover:brightness-110 relative overflow-hidden disabled:cursor-default ${extraClass}`}
              >
                <div className="absolute top-3 left-3 opacity-30 text-3xl">
                  {c.shape}
                </div>
                <span className="font-headline font-extrabold text-xl sm:text-2xl text-center z-10">{answer.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-6 px-6 py-3 rounded-xl font-headline font-bold text-lg ${
            feedback === 'correct' ? 'bg-primary/10 text-primary' :
            feedback === 'wrong' ? 'bg-error/10 text-error' :
            'bg-secondary/10 text-secondary'
          }`}>
            {feedback === 'correct' && 'Correct! Great job! 🎉'}
            {feedback === 'wrong' && 'Oops! Not quite right 😅'}
            {feedback === 'timeout' && "Time's up! ⏰"}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-30 flex justify-around items-center px-4 pb-6 pt-2 bg-white rounded-t-[3rem] border-t-4 border-surface-container-low shadow-[0_-4px_0_0_rgba(0,0,0,0.04)]">
        <span className="flex flex-col items-center justify-center bg-primary text-white rounded-[2rem] px-6 py-2 shadow-[0_4px_0_0_#1a4300]">
          <span className="text-base">📚</span>
          <span className="font-body font-bold text-[12px]">Learn</span>
        </span>
        <span className="flex flex-col items-center justify-center text-secondary px-6 py-2 rounded-[2rem]">
          <span className="text-base">🏪</span>
          <span className="font-body font-bold text-[12px]">Market</span>
        </span>
        <span className="flex flex-col items-center justify-center text-secondary px-6 py-2 rounded-[2rem]">
          <AvatarIcon avatarId={player.avatar} size="sm" />
          <span className="font-body font-bold text-[12px]">Profile</span>
        </span>
      </nav>
    </div>
  );
}
