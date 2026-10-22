import { createCn } from "cn/engine"
import tables from "./cn-tables.ts"

// Generated from CSS @theme scales, including Evenform semantic typography.
// Shared by every component and host; no bundler alias for the cn package.
export const cn = createCn(tables)
