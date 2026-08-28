export * from './refrigerantTables.ts'
export * from './refrigerantProperties.ts'

import { type RefrigerantDataset } from './refrigerantTables.ts'
import { criticalPoint, saturationTable, tablesByPressure } from './R134A.ts'

const R134A: RefrigerantDataset = Object.freeze({ criticalPoint, saturationTable, tablesByPressure })

export const refrigerantDatasets: Readonly<Record<string, RefrigerantDataset>> = Object.freeze({ R134A })
