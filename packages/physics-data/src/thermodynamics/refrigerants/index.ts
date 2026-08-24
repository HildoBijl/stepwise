export * from './refrigerantTables'
export * from './refrigerantProperties'

import { type RefrigerantDataset } from './refrigerantTables'
import * as R134A from './R134A'

export const refrigerantDatasets: Readonly<Record<string, RefrigerantDataset>> = Object.freeze({ R134A: Object.freeze(R134A) })
