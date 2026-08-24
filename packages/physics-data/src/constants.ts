import { Quantity } from '@step-wise/physics-core'

// Mechanics.

export const g = new Quantity('9.81 m/s^2') // Gravitational acceleration.
export const G = new Quantity('6.6743015 * 10^-11 m^3 / kg * s^2') // Universal gravitational constant.

// Elementary physics.

export const c = new Quantity('299792458 m/s').makeExact() // Speed of light.
export const h = new Quantity('6.62607015 * 10^-34 J * s').makeExact() // Planck constant.
export const k = new Quantity('1.380649 * 10^-23 J / K').makeExact() // Boltzmann constant.
export const R = new Quantity('8.314462618 J / mol * K') // Universal gas constant.
export const N = new Quantity('6.02214076 * 10^23 / mol').makeExact() // Avogadro number.

// Molecular constants.

export const e = new Quantity('1.602176634 * 10^-19 C').makeExact() // Elementary charge.
export const me = new Quantity('9.109383701528 * 10^-31 kg') // Electron mass.
export const mp = new Quantity('1.6726219236951 * 10^-27 kg') // Proton mass.
export const mn = new Quantity('1.6749274980495 * 10^-27 kg') // Neutron mass.
