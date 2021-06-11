const alphabet = {
	alpha: {
		symbol: 'α',
	},
	beta: {
		symbol: 'β',
	},
	gamma: {
		symbol: 'γ',
	},
	delta: {
		symbol: 'δ',
	},
	epsilon: {
		symbol: 'ε',
	},
	zeta: {
		symbol: 'ζ',
	},
	theta: {
		symbol: 'θ',
	},
	iota: {
		symbol: 'ι',
	},
	kappa: {
		symbol: 'κ',
	},
	lambda: {
		symbol: 'λ',
	},
	mu: {
		symbol: 'μ',
	},
	nu: {
		symbol: 'ν',
	},
	xi: {
		symbol: 'ξ',
	},
	omicron: {
		symbol: 'ο',
	},
	pi: {
		symbol: 'π',
	},
	rho: {
		symbol: 'ρ',
	},
	sigma: {
		symbol: 'σ',
	},
	tau: {
		symbol: 'τ',
	},
	upsilon: {
		symbol: 'υ',
	},
	phi: {
		symbol: 'φ',
	},
	chi: {
		symbol: 'χ',
	},
	psi: {
		symbol: 'ψ',
	},
	omega: {
		symbol: 'ω',
	},
	Alpha: {
		symbol: 'A',
	},
	Beta: {
		symbol: 'B',
	},
	Gamma: {
		symbol: 'Γ',
	},
	Delta: {
		symbol: 'Δ',
	},
	Epsilon: {
		symbol: 'E',
	},
	Zeta: {
		symbol: 'Z',
	},
	Theta: {
		symbol: 'Θ',
	},
	Iota: {
		symbol: 'I',
	},
	Kappa: {
		symbol: 'K',
	},
	Lambda: {
		symbol: 'Λ',
	},
	Mu: {
		symbol: 'M',
	},
	Nu: {
		symbol: 'N',
	},
	Xi: {
		symbol: 'Ξ',
	},
	Omicron: {
		symbol: 'O',
	},
	Pi: {
		symbol: 'Π',
	},
	Rho: {
		symbol: 'P',
	},
	Sigma: {
		symbol: 'Σ',
	},
	Tau: {
		symbol: 'T',
	},
	Upsilon: {
		symbol: 'Y',
	},
	Phi: {
		symbol: 'Φ',
	},
	Chi: {
		symbol: 'X',
	},
	Psi: {
		symbol: 'Ψ',
	},
	Omega: {
		symbol: 'Ω',
	},
	// Put eta at the end, to prevent it from taking priority over theta and similar.
	eta: {
		symbol: 'η',
	},
	Eta: {
		symbol: 'H',
	},
}
Object.keys(alphabet).forEach(name => {
	alphabet[name].name = name // Also store the name inside the object.
})
module.exports.alphabet = alphabet