[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard)
[![reward](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01)

Round 4: a light, read-only bounty ledger. Run `node serve.ts`, then open localhost:8080. Build the deterministic dossier with `MAKEFUN_OUTPUT_DIR=/tmp/makefun-output node main.ts`.

Four hash routes expose the board, bounty, paginated rankings and public profile. Public GET answers are cached with ETags; focus revalidates cached resources. A 30-second local updater refreshes clocks and the existing collection's ticker without polling. Optional styles and route modules load on demand.
