import { Quantity } from '@step-wise/physics-core'

export const barToPascalFactor = new Quantity('10^5 Pa/bar').makeExact()
export const celsiusToKelvinOffset = new Quantity('273.15 K').makeExact()
export const kilogramsToGramsFactor = new Quantity('10^3 g/kg').makeExact()
export const cubicMetersToLitersFactor = new Quantity('10^3 l/m^3').makeExact()
export const cubicMetersToCubicCentimetersFactor = new Quantity('10^6 cm^3/m^3').makeExact()
