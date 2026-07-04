import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { questions, shuffleArray } from '../questions';

interface GameProps {
  playerName: string;
  onGameOver: (score: number) => void;
}

type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  kind: 'cloud' | 'checkpoint' | 'answer';
  text?: string;
  correct?: boolean;
  state?: 'normal' | 'correct' | 'wrong';
};

type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };

const WIDTH = 800;
const HEIGHT = 600;
const STAGE = 650;
const WORLD = questions.length * STAGE + 100;
const TOTAL_LIVES = 5;

export default function Game({ playerName, onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameOverRef = useRef(onGameOver);
  const controls = useRef({ left: false, right: false });
  const jumpRef = useRef<() => void>(() => undefined);
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);

  useEffect(() => {
    gameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    let stopped = false;
    let currentLevel = 0;
    let currentLives = TOTAL_LIVES;
    let cameraY = WORLD - HEIGHT;
    let lockedUntil = 0;
    let previousTime = performance.now();

    const platforms: Platform[] = [];
    questions.forEach((question, stage) => {
      const bottom = WORLD - stage * STAGE;
      platforms.push({ x: 160, y: bottom - 42, width: 480, height: 30, level: stage, kind: 'checkpoint', text: stage ? `ZONE ${stage + 1}` : 'START' });
      const steps = stage % 2 === 0
        ? [[85, 140], [325, 250], [555, 360], [285, 465]]
        : [[555, 140], [315, 250], [85, 360], [355, 465]];
      steps.forEach(([x, rise]) => platforms.push({ x, y: bottom - rise, width: 160, height: 22, level: stage, kind: 'cloud' }));
      const options = shuffleArray(question.options);
      [55, 320, 585].forEach((x, index) => platforms.push({
        x,
        y: bottom - 575,
        width: 160,
        height: 50,
        level: stage,
        kind: 'answer',
        text: options[index],
        correct: options[index] === question.correctAnswer,
        state: 'normal',
      }));
    });

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * WORLD,
      radius: 0.8 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const player = {
      x: WIDTH / 2 - 22,
      y: WORLD - 105,
      previousY: WORLD - 105,
      vx: 0,
      vy: 0,
      width: 44,
      height: 50,
      grounded: false,
      jumpsLeft: 2,
    };
    const sparks: Spark[] = [];

    const checkpoint = (stage: number) => WORLD - stage * STAGE - 105;

    const burst = (x: number, y: number, color: string, amount = 28) => {
      for (let index = 0; index < amount; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
      }
    };

    const respawn = () => {
      player.x = WIDTH / 2 - player.width / 2;
      player.y = checkpoint(currentLevel);
      player.previousY = player.y;
      player.vx = 0;
      player.vy = 0;
      player.jumpsLeft = 2;
    };

    const loseLife = () => {
      if (performance.now() < lockedUntil || stopped) return;
      lockedUntil = performance.now() + 650;
      currentLives -= 1;
      setLives(currentLives);
      burst(player.x + player.width / 2, player.y + player.height / 2, '#fb7185', 36);
      if (currentLives <= 0) {
        stopped = true;
        window.setTimeout(() => gameOverRef.current(currentLevel), 300);
      } else {
        window.setTimeout(() => {
          respawn();
          lockedUntil = 0;
        }, 400);
      }
    };

    const chooseAnswer = (platform: Platform) => {
      if (platform.state !== 'normal' || performance.now() < lockedUntil) return;
      lockedUntil = performance.now() + 800;
      if (platform.correct) {
        platform.state = 'correct';
        burst(platform.x + platform.width / 2, platform.y, '#4ade80', 45);
        player.vy = -18;
        window.setTimeout(() => {
          currentLevel += 1;
          setLevel(currentLevel);
          if (currentLevel >= questions.length) {
            stopped = true;
            gameOverRef.current(questions.length);
            return;
          }
          respawn();
          lockedUntil = 0;
        }, 600);
      } else {
        platform.state = 'wrong';
        burst(platform.x + platform.width / 2, platform.y, '#ef4444', 40);
        player.vy = 4;
        window.setTimeout(() => {
          platform.state = 'normal';
          lockedUntil = 0;
          loseLife();
        }, 300);
      }
    };

    const jump = () => {
      if (stopped || performance.now() < lockedUntil) return;
      if (player.grounded || player.jumpsLeft > 0) {
        player.vy = -13.5;
        player.grounded = false;
        player.jumpsLeft = Math.max(0, player.jumpsLeft - 1);
        burst(player.x + player.width / 2, player.y + player.height, '#e9d5ff', 12);
      }
    };
    jumpRef.current = jump;

    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'arrowup', ' ', 'a', 'd', 'w'].includes(key)) event.preventDefault();
      if (key === 'arrowleft' || key === 'a') controls.current.left = true;
      if (key === 'arrowright' || key === 'd') controls.current.right = true;
      if ((key === 'arrowup' || key === ' ' || key === 'w') && !event.repeat) jump();
    };
    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') controls.current.left = false;
      if (key === 'arrowright' || key === 'd') controls.current.right = false;
    };
    window.addEventListener('keydown', keyDown, { passive: false });
    window.addEventListener('keyup', keyUp);

    const rounded = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    };

    const update = (dt: number) => {
      const acceleration = controls.current.left ? -0.8 : controls.current.right ? 0.8 : 0;
      player.vx = Math.max(-6.5, Math.min(6.5, (player.vx + acceleration) * 0.82));
      player.previousY = player.y;
      player.x = Math.max(0, Math.min(WIDTH - player.width, player.x + player.vx * dt));
      player.vy = Math.min(15, player.vy + 0.5 * dt);
      player.y += player.vy * dt;
      player.grounded = false;

      platforms.forEach((platform) => {
        if (platform.level !== currentLevel) return;
        const overlap = player.x + player.width > platform.x && player.x < platform.x + platform.width;
        if (!overlap) return;
        const oldBottom = player.previousY + player.height;
        const newBottom = player.y + player.height;
        const landing = player.vy >= 0 && oldBottom <= platform.y + 5 && newBottom >= platform.y;
        const headHit = player.vy < 0 && player.previousY >= platform.y + platform.height - 5 && player.y <= platform.y + platform.height;
        if (landing) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.grounded = true;
          player.jumpsLeft = 2;
          if (platform.kind === 'answer') chooseAnswer(platform);
        } else if (headHit && platform.kind === 'answer') {
          player.y = platform.y + platform.height;
          player.vy = 2.5;
          chooseAnswer(platform);
        }
      });

      const bottom = WORLD - currentLevel * STAGE;
      const barrier = bottom - STAGE + 30;
      if (player.y < barrier && performance.now() >= lockedUntil) {
        player.y = barrier;
        player.vy = 2;
      }
      if (player.y > bottom + 140) loseLife();

      sparks.forEach((spark) => {
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.vy += 0.08 * dt;
        spark.life -= 0.025 * dt;
      });
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        if (sparks[index].life <= 0) sparks.splice(index, 1);
      }

      const target = Math.max(0, Math.min(WORLD - HEIGHT, player.y - HEIGHT * 0.56));
      cameraY += (target - cameraY) * Math.min(1, 0.09 * dt);
    };

    const draw = (time: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, '#090528');
      sky.addColorStop(0.55, '#251056');
      sky.addColorStop(1, '#0f172a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      stars.forEach((star) => {
        const y = ((star.y - cameraY * 0.22) % WORLD + WORLD) % WORLD;
        if (y < HEIGHT + 15) {
          ctx.globalAlpha = star.alpha * (0.8 + Math.sin(time / 500 + star.x) * 0.2);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(star.x, y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      platforms.forEach((platform) => {
        if (platform.level !== currentLevel) return;
        const y = platform.y - cameraY;
        if (y < -80 || y > HEIGHT + 80) return;
        if (platform.kind === 'cloud') {
          ctx.fillStyle = 'rgba(76,29,149,0.65)';
          rounded(platform.x, y + 7, platform.width, platform.height, 14);
          ctx.fill();
          const gradient = ctx.createLinearGradient(0, y, 0, y + platform.height);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#c4b5fd');
          ctx.fillStyle = gradient;
          rounded(platform.x, y, platform.width, platform.height, 14);
          ctx.fill();
          return;
        }
        if (platform.kind === 'checkpoint') {
          ctx.fillStyle = '#111827';
          rounded(platform.x, y + 7, platform.width, platform.height, 10);
          ctx.fill();
          const gradient = ctx.createLinearGradient(0, y, 0, y + platform.height);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#312e81');
          ctx.fillStyle = gradient;
          rounded(platform.x, y, platform.width, platform.height, 10);
          ctx.fill();
          ctx.fillStyle = '#fde68a';
          ctx.font = '700 13px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(platform.text ?? '', platform.x + platform.width / 2, y + 20);
          return;
        }
        const colors = platform.state === 'correct' ? ['#86efac', '#16a34a'] : platform.state === 'wrong' ? ['#fda4af', '#dc2626'] : ['#fde68a', '#eab308'];
        ctx.fillStyle = '#713f12';
        rounded(platform.x, y + 9, platform.width, platform.height, 10);
        ctx.fill();
        const gradient = ctx.createLinearGradient(0, y, 0, y + platform.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        rounded(platform.x, y, platform.width, platform.height, 10);
        ctx.fill();
        ctx.fillStyle = platform.state === 'normal' ? '#422006' : '#ffffff';
        ctx.font = '800 15px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = platform.state === 'correct' ? '✓ ' : platform.state === 'wrong' ? '✕ ' : '? ';
        ctx.fillText(`${icon}${platform.text ?? ''}`, platform.x + platform.width / 2, y + platform.height / 2, platform.width - 12);
      });

      sparks.forEach((spark) => {
        ctx.globalAlpha = Math.max(0, spark.life);
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y - cameraY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const px = player.x;
      const py = player.y - cameraY;
      ctx.save();
      ctx.translate(px + player.width / 2, py + player.height / 2);
      ctx.fillStyle = '#ef4444';
      rounded(-13, -2, 26, 25, 7);
      ctx.fill();
      ctx.fillStyle = '#f5c2a8';
      ctx.beginPath();
      ctx.arc(0, -13, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(-4, -14, 2, 0, Math.PI * 2);
      ctx.arc(4, -14, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2563eb';
      rounded(-12, 12, 9, 12, 3);
      ctx.fill();
      rounded(3, 12, 9, 12, 3);
      ctx.fill();
      ctx.restore();
    };

    const loop = (time: number) => {
      if (stopped) return;
      const dt = Math.min(2.2, (time - previousTime) / 16.67);
      previousTime = time;
      update(dt);
      draw(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  const hold = (direction: 'left' | 'right', value: boolean) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    controls.current[direction] = value;
    if (value) event.currentTarget.setPointerCapture(event.pointerId);
  };

  const question = questions[Math.min(level, questions.length - 1)];

  return (
    <div className="flex min-h-screen select-none flex-col items-center bg-black p-3 font-sans text-white sm:p-4">
      <div className="w-full max-w-[800px] rounded-2xl border border-purple-500/30 bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 p-4 shadow-2xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="rounded-lg bg-black/35 px-3 py-2 font-bold text-yellow-300">ZONE {level + 1}/{questions.length}</span>
          <span className="text-lg">{Array.from({ length: TOTAL_LIVES }, (_, index) => index < lives ? '❤️' : '🖤')}</span>
          <span className="rounded-lg bg-black/35 px-3 py-2 text-emerald-300">Player: {playerName}</span>
        </div>
        <h2 className="text-center text-lg font-extrabold leading-snug sm:text-2xl">{question.question}</h2>
      </div>

      <div className="mt-3 w-full max-w-[800px] overflow-hidden rounded-2xl border border-purple-500/30 shadow-[0_0_45px_rgba(139,92,246,0.3)]">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block aspect-[4/3] w-full bg-slate-950" />
      </div>

      <div className="mt-3 flex w-full max-w-[800px] touch-none items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-950/70 p-4">
        <div className="flex gap-3">
          <button aria-label="Move left" onPointerDown={hold('left', true)} onPointerUp={hold('left', false)} onPointerCancel={hold('left', false)} onPointerLeave={hold('left', false)} className="h-16 w-16 rounded-2xl border-2 border-purple-400/50 bg-indigo-900 text-3xl font-bold active:scale-95 sm:h-20 sm:w-20">◀</button>
          <button aria-label="Move right" onPointerDown={hold('right', true)} onPointerUp={hold('right', false)} onPointerCancel={hold('right', false)} onPointerLeave={hold('right', false)} className="h-16 w-16 rounded-2xl border-2 border-purple-400/50 bg-indigo-900 text-3xl font-bold active:scale-95 sm:h-20 sm:w-20">▶</button>
        </div>
        <button aria-label="Jump" onPointerDown={(event) => { event.preventDefault(); jumpRef.current(); }} className="h-20 w-20 rounded-full border-2 border-pink-200 bg-gradient-to-r from-pink-500 to-rose-600 text-lg font-black active:scale-90 sm:h-24 sm:w-24">JUMP</button>
      </div>

      <p className="mt-3 max-w-[800px] text-center text-xs leading-relaxed text-purple-200">電腦：← →／A D 移動，空白鍵／↑／W 跳躍。手機或 iPad：使用畫面按鈕。跳上或撞擊正確答案方塊即可升級。</p>
    </div>
  );
}
