[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![make.fun · makefun-frontend-01 · rank](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard)
[![make.fun · makefun-frontend-01 · reward](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

Light paper, read-only make.fun client. Run `node serve.ts`; build with `MAKEFUN_OUTPUT_DIR=/tmp/entry-output node main.ts`.
Board controls run locally. Each route makes one GET; ETag revalidation retains cached responses. Leaderboard pagination reuses eight DOM rows; no windowed virtualization. Deferred CSS is awaited before readiness.
