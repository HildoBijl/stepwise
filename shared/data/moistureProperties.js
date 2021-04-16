module.exports.mollierDiagram = {
	labels: ['Temperature'],
	headers: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(T => new FloatUnit({ float: T, unit: 'dC' }).makeExact()),
	grid: [1.77225, 1.91700, 2.07240, 2.23882, 2.41710, 2.60797, 2.81200, 3.03041, 3.26361, 3.51243, 3.77260, 4.05790, 4.36190, 4.68609, 5.03165, 5.39979, 5.79182, 6.20910, 6.65304, 7.12515, 7.62701, 8.16025, 8.72663, 9.32795, 9.96613, 10.64318, 11.36121, 12.04430, 12.92917, 13.8388, 14.68912, 15.64759, 16.66214, 17.73576, 18.87159, 20.07294, 21.34330, 22.53493, 24.10594, 25.60617, 27.19136, 28.86606, 30.63508, 32.50350, 34.47672, 36.56045].map(x => new FloatUnit({ float: x, unit: 'g/kg' })),
}

