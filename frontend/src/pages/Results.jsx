import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarIcon } from '../avatars.jsx';

export default function Results({ player, result, onPlayAgain, onGoHome }) {
  const navigate = useNavigate();
  const accuracy = result.total_questions > 0
    ? Math.round((result.correct_answers / result.total_questions) * 100)
    : 0;
  const won = result.score > (result.opponent_score || 0);
  const tied = result.score === (result.opponent_score || 0);

  const handlePlayAgain = () => {
    onPlayAgain();
    navigate('/waiting');
  };

  const handleHome = () => {
    onGoHome();
    navigate('/');
  };

  let bannerText = 'Lesson Complete!';
  let bannerBg = 'bg-secondary-container';
  let bannerBorder = 'border-secondary';
  let bannerShadow = 'chunky-shadow-secondary';
  if (result.opponent_disconnected) {
    bannerText = 'Opponent Left — You Win!';
  } else if (won) {
    bannerText = 'You Won! 🏆';
    bannerBg = 'bg-primary-container';
    bannerBorder = 'border-primary';
    bannerShadow = 'chunky-shadow-primary';
  } else if (tied) {
    bannerText = "It's a Tie!";
  } else {
    bannerText = 'You Lost — Try Again!';
    bannerBg = 'bg-error-container/20';
    bannerBorder = 'border-error';
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-surface">
        <div className="flex items-center gap-3">
          <AvatarIcon avatarId={player?.avatar} size="sm" />
          <span className="font-headline font-black italic text-primary text-lg">EconoKids</span>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-32 px-6 max-w-2xl mx-auto w-full flex flex-col items-center justify-center space-y-8">
        {/* Banner */}
        <div className={`relative w-full text-center py-6 px-4 ${bannerBg} rounded-xl ${bannerShadow} border-2 ${bannerBorder} overflow-hidden`}>
          <div className="absolute inset-0 gloss-effect pointer-events-none" />
          <h1 className="font-headline font-black text-4xl text-on-surface tracking-tight">{bannerText}</h1>
        </div>

        {/* Mascot */}
        <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 animate-bounce text-4xl">🪙</div>
            <div className="absolute top-1/3 right-0 animate-pulse text-3xl">⭐</div>
            <div className="absolute bottom-1/4 left-0 text-4xl">🎉</div>
          </div>
          <img
            alt="Cheering Piggy Bank"
            className="relative z-10 w-full h-auto drop-shadow-xl transform hover:scale-105 transition-transform duration-300"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV0Kau6a9fqQmZa2rJ9uoN3nY3hQAD82jWNMgWPo51CP-zJ_AacmydvDJypcPrEdHuXJ-ZUA1Hfu4FtKVrQngVnXsS4bjWFA43BqY2PZzfQF09Q2sfHNXJqTlzHklC8Ow73m8c265uVghVSWSaT3uLDkRYQhGMqfPTH4ikuFu-Kt4zMeBImgGTVUb-0Po0XHBt5y3qWhRxPwASGZk0fclQko8LaydlcNu-qv8nG8F92LCsxIrSRXOkdN7ZkbmLipi2MgWtHiT_Nmc"
          />
        </div>

        {/* Score Comparison with avatars */}
        <div className="w-full bg-surface-container-lowest p-6 rounded-xl border-2 border-surface-container-high">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col items-center flex-1 gap-2">
              <AvatarIcon avatarId={player?.avatar} size="md" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">You</p>
              <p className="font-headline font-bold text-lg">{player?.name}</p>
            </div>
            <div className="font-headline font-black italic text-2xl text-outline-variant px-4">VS</div>
            <div className="flex flex-col items-center flex-1 gap-2">
              <AvatarIcon avatarId="dollar" size="md" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Opponent</p>
              <p className="font-headline font-bold text-lg">{result.opponent_name || '???'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <span className={`font-headline font-black text-4xl ${won ? 'text-primary' : 'text-on-surface'}`}>
                {result.score.toLocaleString()}
              </span>
            </div>
            <div className="text-outline-variant text-sm font-bold px-4">PTS</div>
            <div className="text-center flex-1">
              <span className={`font-headline font-black text-4xl ${!won && !tied ? 'text-secondary' : 'text-on-surface'}`}>
                {(result.opponent_score || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-surface-container-lowest p-4 rounded-xl border-2 border-surface-container-high flex flex-col items-center justify-center space-y-1">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Score</span>
            <span className="font-headline font-black text-2xl text-primary">{result.score.toLocaleString()}</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border-2 border-surface-container-high flex flex-col items-center justify-center space-y-1">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Accuracy</span>
            <span className="font-headline font-black text-2xl text-tertiary">{accuracy}%</span>
          </div>
          <div className="bg-secondary-container/20 p-4 rounded-xl border-2 border-secondary/30 flex flex-col items-center justify-center space-y-1">
            <span className="text-secondary font-bold text-xs uppercase tracking-wider">XP</span>
            <div className="flex items-center gap-1">
              <span className="text-sm">⚡</span>
              <span className="font-headline font-black text-2xl text-secondary">+{result.xp_earned}</span>
            </div>
          </div>
        </div>

        {/* Encouragement */}
        <div className="bg-primary/5 p-5 rounded-xl border-2 border-dashed border-primary/20 w-full text-center">
          <p className="font-body font-medium text-on-primary-container text-base leading-relaxed">
            {won
              ? `Amazing work, ${player?.name}! You beat ${result.opponent_name}! 🎉`
              : tied
              ? `Great match, ${player?.name}! You and ${result.opponent_name} tied!`
              : `Good effort, ${player?.name}! Keep practicing to beat ${result.opponent_name} next time!`
            }
          </p>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 w-full bg-white px-6 pt-4 pb-8 flex flex-col sm:flex-row gap-4 items-center justify-center border-t-4 border-surface-container-low shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleHome}
          className="w-full sm:w-auto min-w-[200px] h-14 bg-surface-container-highest rounded-xl border-2 border-surface-dim chunky-shadow-surface active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 group"
        >
          <span>🏠</span>
          <span className="font-headline font-extrabold text-on-surface-variant">Home</span>
        </button>
        <button
          onClick={handlePlayAgain}
          className="w-full sm:w-auto min-w-[240px] h-14 bg-tertiary rounded-xl border-2 border-tertiary-dim chunky-shadow-tertiary active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 gloss-effect" />
          <span className="font-headline font-extrabold text-white text-lg">Play Again</span>
          <span>🔄</span>
        </button>
      </footer>
    </div>
  );
}
