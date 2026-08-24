import { Quantity } from '@step-wise/physics-core'

export const pressureBar = new Quantity('10^5 Pa/bar').makeExact()
export const temperatureCelsius = new Quantity('273.15 K').makeExact()
export const massGram = new Quantity('10^3 g/kg').makeExact()
export const volumeLiter = new Quantity('10^3 l/m^3').makeExact()
export const volumeCubicCentimeter = new Quantity('10^6 cm^3/m^3').makeExact()
