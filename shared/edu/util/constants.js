const { FloatUnit } = require('./inputTypes/FloatUnit')

const g = new FloatUnit('9.81 m/s^2') // Gravitational acceleration.
const G = new FloatUnit('6.6743015 * 10^-11 m^3 / kg * s^2') // Universal gravitational constant.
export { g, G }

const c = new FloatUnit('299792458 m/s') // Speed of light.
const h = new FloatUnit('6.62607015 * 10^-34 J * s') // Planck constant.
const k = new FloatUnit('1.380649 * 10^-23 J / K') // Boltzmann constant.
const R = new FloatUnit('8.314462618 J / mol * K') // Universal gas constant.
const N = new FloatUnit('6.02214076 * 10^23 / mol') // Avogadro number.
export { c, h, k, R, N }

const e = new FloatUnit('1.602176634 * 10^-19 C') // Elementary charge.
const me = new FloatUnit('9.109383701528 * 10^-31 kg') // Electron mass.
const mp = new FloatUnit('1.6726219236951 * 10^-27 kg') // Proton mass.
const mn = new FloatUnit('1.6749274980495 * 10^-27 kg') // Neutron mass.
export { e, me, mp, mn }
