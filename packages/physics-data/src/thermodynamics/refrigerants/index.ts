export * from './types'
export * from './utils'

import { type RefrigerantData } from './types'
import * as R134A from './R134A'

export const refrigerants: Readonly<Record<string, RefrigerantData>> = Object.freeze({ R134A: Object.freeze(R134A) })
