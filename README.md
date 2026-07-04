# 2D Jump High

A mobile-friendly React canvas platform game. Players climb through a fantasy sky tower, hit question blocks, answer *Turning Red* quiz questions, collect power-ups, and try to reach the book castle.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Controls

- Desktop: Left/Right arrows or A/D; Space/Up/W to jump and double-jump.
- Mobile/iPad: on-screen left, right, and jump controls.

## Build

```bash
npm run lint
npm run build
npm start
```

The `/api/send-result` endpoint currently records submissions in the server log only. The result screen also provides a `mailto:` button so a player can manually send the score.
