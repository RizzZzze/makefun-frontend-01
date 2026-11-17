[![make.fun](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Rank](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01)
[![Reward](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

Light paper, read-only make.fun client. Run `node serve.ts`; build with `MAKEFUN_OUTPUT_DIR=/tmp/entry-output node main.ts`.
Board controls run locally. Each route makes one GET; ETag revalidation retains cached responses. Leaderboard pagination reuses eight DOM rows; no windowed virtualization. Deferred CSS is awaited before readiness.
