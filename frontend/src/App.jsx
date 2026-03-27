import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import socket from './socket';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Waiting from './pages/Waiting';
import Game from './pages/Game';
import Results from './pages/Results';

export default function App() {
  const [player, setPlayer] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    socket.connect();
    return () => { socket.disconnect(); };
  }, []);

  const handlePlayerCreated = (p) => setPlayer(p);
  const handleMatchFound = (data) => setMatchData(data);
  const handleGameEnd = (result) => setGameResult(result);

  const handlePlayAgain = () => {
    setGameResult(null);
    setMatchData(null);
  };

  const handleGoHome = () => {
    setGameResult(null);
    setMatchData(null);
    setPlayer(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Signup onPlayerCreated={handlePlayerCreated} />} />
      <Route path="/login" element={<Login onPlayerCreated={handlePlayerCreated} />} />
      <Route
        path="/waiting"
        element={player ? <Waiting player={player} onMatchFound={handleMatchFound} /> : <Navigate to="/" />}
      />
      <Route
        path="/game"
        element={matchData ? <Game player={player} matchData={matchData} onGameEnd={handleGameEnd} /> : <Navigate to="/" />}
      />
      <Route
        path="/results"
        element={gameResult ? <Results player={player} result={gameResult} onPlayAgain={handlePlayAgain} onGoHome={handleGoHome} /> : <Navigate to="/" />}
      />
    </Routes>
  );
}
