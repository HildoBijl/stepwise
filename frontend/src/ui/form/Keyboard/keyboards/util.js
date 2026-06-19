import { useState } from 'react'

// useButtonClickFunction manages shift key presses in the keyboard. When the shift is pressed, this is remembered. It is then applied to the next key press on the keyboard.
export function useButtonClickFunction(keyFunction) {
	// Set up states for various keys.
	const [shift, setShift] = useState(false)

	// Set up the button click function for each possible keyID.
	const buttonClickFunction = (keyID, evt) => {
		switch (keyID) {
			case 'Shift':
				setShift(shift => !shift)
				return
			default: // Regular key.
				setShift(false)
				return keyFunction({ key: simplifyKey(keyID), shift }, evt)
		}
	}

	// Return the button click function and the parameters.
	return [buttonClickFunction, { shift }]
}

// simplifyKey takes a key like "Plus" and turns it into a symbol "+". This allows input fields to only check for "+" and not additionally check for "Plus". (And similarly for many other symbols.)
export function simplifyKey(key) {
	switch (key) {
		case 'DecimalSeparator':
		case ',':
			return '.'
		case 'Plus':
			return '+'
		case 'Minus':
			return '-'
		case 'PlusMinus':
			return '±'
		case 'Times':
			return '*'
		case 'Divide':
			return '/'
		case 'Power':
			return '^'
		case 'Underscore':
			return '_'
		case 'BracketOpen':
			return '('
		case 'BracketClose':
			return ')'
		case 'Equals':
			return '='
		case 'eMath':
			return 'e'
		case 'Meter':
			return 'm'
		case 'Spacebar':
			return ' '
		default:
			return key // On normal keys, just keep the key itself.
	}
}

// Export the greek alphabet.
export const greekAlphabet = {
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
		symbol: 'o',
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
Object.keys(greekAlphabet).forEach(name => {
	greekAlphabet[name].name = name // Also store the name inside the object.
})
