const { FloatUnit } = require('../inputTypes')

// Mechanics.
module.exports.g = new FloatUnit('9.81 m/s^2') // Gravitational acceleration.
module.exports.G = new FloatUnit('6.6743015 * 10^-11 m^3 / kg * s^2') // Universal gravitational constant.

// Elementary physics.
module.exports.c = new FloatUnit('299792458 m/s') // Speed of light.
module.exports.h = new FloatUnit('6.62607015 * 10^-34 J * s') // Planck constant.
module.exports.k = new FloatUnit('1.380649 * 10^-23 J / K') // Boltzmann constant.
module.exports.R = new FloatUnit('8.314462618 J / mol * K') // Universal gas constant.
module.exports.N = new FloatUnit('6.02214076 * 10^23 / mol') // Avogadro number.

// Molecular constants.
module.exports.e = new FloatUnit('1.602176634 * 10^-19 C') // Elementary charge.
module.exports.me = new FloatUnit('9.109383701528 * 10^-31 kg') // Electron mass.
module.exports.mp = new FloatUnit('1.6726219236951 * 10^-27 kg') // Proton mass.
module.exports.mn = new FloatUnit('1.6749274980495 * 10^-27 kg') // Neutron mass.
