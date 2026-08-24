export * from './refrigerantTables'
export * from './refrigerantProperties'

import { type RefrigerantDataset } from './refrigerantTables'
import { criticalPoint, saturationTable, tablesByPressure } from './R134A'

const R134A: RefrigerantDataset = Object.freeze({ criticalPoint, saturationTable, tablesByPressure })

export const refrigerantDatasets: Readonly<Record<string, RefrigerantDataset>> = Object.freeze({ R134A })
