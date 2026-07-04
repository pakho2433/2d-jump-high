import { useState } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import Result from './components/Result';
import { questions } from './questions';

type Screen = 'HOME' | 'GAME' | 'RESULT';

export default function App() {
  const [screen, setScreen] = useState<Screen>('HOME');
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);

  const handleStart = (name: string) => {
    setPlayerName(name);
    setScreen('GAME');
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setScreen('RESULT');
  };

  const handleRestart = () => {
    setScreen('HOME');
    setScore(0);
  };

  return (
    <>
      {screen === 'HOME' && <Home onStart={handleStart} />}
      {screen === 'GAME' && <Game playerName={playerName} onGameOver={handleGameOver} />}
      {screen === 'RESULT' && (
        <Result
          name={playerName}
          score={score}
          total={questions.length}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
