import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';

interface HomeProps {
  onStart: (name: string) => void;
}

export default function Home({ onStart }: HomeProps) {
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-4 font-sans text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6 flex justify-center space-x-4 text-5xl">
          <span>🌟</span>
          <span>👦🏻</span>
          <span>🏰</span>
        </div>

        <h1 className="mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          星空跳躍
        </h1>
        <h2 className="mb-8 text-lg text-purple-200">《熊抱青春記》挑戰</h2>

        <p className="mb-6 text-left text-sm text-gray-300">
          控制小男孩向上跳躍，撞擊或踏上正確答案方塊，逐層前往天空書城！
          <br /><br />
          <b>操作方式：</b><br />
          • 電腦：方向鍵 ⬅️ ➡️ 或 A／D 移動<br />
          • 空格鍵、⬆️ 或 W 跳躍及二段跳<br />
          • 手機／iPad：使用畫面上的左右及 JUMP 按鈕
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="請輸入你的名字 (Player Name)"
            className="w-full rounded-lg border border-purple-500/50 bg-black/30 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 py-3 font-bold text-black shadow-lg transition active:scale-95 hover:from-yellow-400 hover:to-orange-400"
          >
            開始遊戲 (Start Game)
          </button>
        </form>
      </motion.div>
    </div>
  );
}
