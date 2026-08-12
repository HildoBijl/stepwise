import { Integer, Minus, namedConstants } from '../core'

import { Expression } from './Expression'

export const constants = {
	// Integer constants.
	minusOne: new Expression(new Minus(Integer.one)),
	zero: new Expression(Integer.zero),
	one: new Expression(Integer.one),
	two: new Expression(Integer.two),
	three: new Expression(Integer.three),
	four: new Expression(Integer.four),
	five: new Expression(Integer.five),
	six: new Expression(Integer.six),
	seven: new Expression(Integer.seven),
	eight: new Expression(Integer.eight),
	nine: new Expression(Integer.nine),
	ten: new Expression(Integer.ten),
	eleven: new Expression(Integer.eleven),
	twelve: new Expression(Integer.twelve),
	twenty: new Expression(Integer.twenty),
	hundred: new Expression(Integer.hundred),

	// Named constants.
	e: new Expression(namedConstants.e),
	pi: new Expression(namedConstants.pi),
	infinity: new Expression(namedConstants.infinity),
}
