import { createCn } from "cn/engine"
import tables from "./cn-tables.ts"

// Merge utilities using the generated CSS theme scales.
export const cn = createCn(tables)
