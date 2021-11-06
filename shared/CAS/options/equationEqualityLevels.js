module.exports = {
	default: 2,
	keepSides: 0, // This means that on an equality check the sides may not change. So the equation "a = b" is NOT equal to the equation "b = a". 
	allowSwitch: 1, // This means that sides may switch, but no rewrites are allowed. So "a + b = c" is equal to "c = a + b", but NOT equal to "c - b = a". (Note: whether "a + b = c" is equal to "b + a = c" or "c = b + a" depends on the expression level.)
	allowRewrite: 2, // This allows all possible rewrites. So the equation "x = y" and the equation "2x - 2y = 0" are equal. Note that in this case the expression equality level is ignored: we are checking equivalence regardless.
}
