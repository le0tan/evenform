import { rename } from 'node:fs/promises'
// The isolated starter build is deployable at /; Showcase stays a separate entry.
await rename(new URL('../dist-starter/starter.html', import.meta.url), new URL('../dist-starter/index.html', import.meta.url))
