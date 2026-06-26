export * from './types'
export * from './utils'

import { type RefrigerantData } from './types'
import * as R134A from './R134A'

export const refrigerants: Record<string, RefrigerantData> = { R134A }
