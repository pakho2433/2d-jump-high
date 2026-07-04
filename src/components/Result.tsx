import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ResultProps {
  name: string;
  score: number;
  total: number;
  onRestart: () => void;
}

export default function Result({ name, score, total, onRestart }: ResultProps) {
  const [emailStatus, setEmailStatus] = useState('Recording result...');
  const passed = score === total;
  const targetEmail = 'yuetki1999@gmail.com';

  useEffect(() => {
    if (passed) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }

    fetch('/api/send-result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        score,
        total,
        passed,
        email: targetEmail,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to record result.');
        }
        return response.json() as Promise<{ delivered?: boolean }>;
      })
      .then((data) => {
        if (data.delivered) {
          setEmailStatus(`Result successfully sent to ${targetEmail}`);
        } else {
          setEmailStatus('Result recorded. Tap the button below to email it.');
        }
      })
      .catch(() => {
        setEmailStatus('Could not record the result. Tap the button below to email it.');
      });
  }, [name, passed, score, total]);

  const subject = encodeURIComponent(`星空跳躍 Game Result - ${name}`);
  const body = encodeURIComponent(
    `Player: ${name}\nScore: ${score}/${total}\nStatus: ${passed ? 'Victory! Reached the Book Castle.' : 'Game Over'}`,
  );
  const mailtoLink = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-950 to-black p-4 font-sans text-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md"
      >
        <div className="mb-4 text-6xl">{passed ? '🏰🎉' : '💔🌟'}</div>

        <h1 className="mb-2 text-4xl font-bold">
          {passed ? '恭喜通關！' : '遊戲結束'}
        </h1>

        <p className="mb-6 text-xl text-gray-200">
          {name} 的分數：
          <span className="font-bold text-yellow-400">{score} / {total}</span>
        </p>

        <div className="mb-8 rounded-lg bg-black/30 p-4">
          <p className="mb-2 text-sm text-gray-300">Result status:</p>
          <p className="text-sm font-medium text-purple-300">{emailStatus}</p>
        </div>

        <div className="space-y-4">
          <a
            href={mailtoLink}
            className="block w-full rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg transition hover:bg-indigo-500"
          >
            手動發送郵件 (Email Result)
          </a>

          <button
            onClick={onRestart}
            className="w-full rounded-lg border border-white/30 bg-transparent py-3 font-bold text-white transition hover:bg-white/10"
          >
            再玩一次 (Play Again)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
