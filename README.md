[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/RizzZzze/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

A light, read-only make.fun frontend: a public bounty board, a bounty page, a paginated leaderboard and an account
profile, each with its own hash route, built on make.fun's public API with no framework, no build step and no
web fonts. Cached GET answers revalidate with `If-None-Match` and serve `304` from a `Map`; a 30-second local
updater refreshes deadlines and the board ticker without polling; routes update their own rows in place instead of
rebuilding the page.

## Run it

```sh
node serve.ts        # http://localhost:8080
```

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

MIT licensed; see LICENSE.
