import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import { AvatarIcon } from '../avatars.jsx';

export default function Waiting({ player, onMatchFound }) {
  const [dots, setDots] = useState('');
  const [queueSize, setQueueSize] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('join_queue', player);

    const onQueueUpdate = ({ position }) => {
      setQueueSize(position);
    };

    const onMatched = (data) => {
      onMatchFound(data);
      navigate('/game');
    };

    socket.on('queue_update', onQueueUpdate);
    socket.on('matched', onMatched);

    return () => {
      socket.off('queue_update', onQueueUpdate);
      socket.off('matched', onMatched);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = () => {
    socket.emit('leave_queue');
    navigate('/');
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 overflow-x-hidden">
      <main className="w-full max-w-lg flex flex-col items-center space-y-10">
        <div className="text-center">
          <h1 className="font-headline font-black italic text-5xl text-primary tracking-tighter mb-2">
            EconoKids
          </h1>
        </div>

        <div className="w-full bg-surface-container-lowest p-10 rounded-xl space-y-8 relative shadow-[0_8px_0_0_rgba(0,0,0,0.05)] text-center">
          {/* Animated search */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="text-7xl">🔍</span>
            </div>
          </div>

          <div>
            <h2 className="font-headline font-black text-3xl text-on-surface mb-2">
              Waiting for player{dots}
            </h2>
            <p className="font-body text-on-surface-variant text-lg">
              Looking for an opponent to match with <strong>{player.name}</strong>
            </p>
          </div>

          {/* Player VS ??? */}
          <div className="flex items-center justify-center gap-4 p-4 bg-surface-container-low rounded-xl">
            <AvatarIcon avatarId={player.avatar} size="md" />
            <div className="text-left">
              <p className="font-headline font-bold text-lg">{player.name}</p>
              <p className="text-on-surface-variant text-sm">Ready to play!</p>
            </div>

            <div className="font-headline font-black italic text-2xl text-primary mx-4">VS</div>

            <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-dashed border-outline-variant animate-pulse">
              <span className="text-3xl">❓</span>
            </div>
            <div className="text-left">
              <p className="font-headline font-bold text-lg text-outline-variant">???</p>
              <p className="text-on-surface-variant text-sm">Searching{dots}</p>
            </div>
          </div>

          <p className="text-on-surface-variant text-sm">
            Players in queue: <strong className="text-primary">{queueSize}</strong> — need 2 to start
          </p>

          <button
            onClick={handleCancel}
            className="w-full py-4 bg-surface-container-highest text-on-surface-variant font-headline font-bold text-lg rounded-xl chunky-shadow-surface transition-all active:translate-y-1 active:shadow-none"
          >
            Cancel
          </button>
        </div>

        <div className="bg-secondary/5 px-6 py-4 rounded-xl border-2 border-dashed border-secondary/20 text-center">
          <p className="font-body text-on-surface-variant text-sm">
            💡 <strong>Tip:</strong> Open this page in another browser tab to match as a second player!
          </p>
        </div>
      </main>

      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
