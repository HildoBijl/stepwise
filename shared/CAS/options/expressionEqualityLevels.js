module.exports = {
	default: 2,
	exact: 0, // Everything must be exactly the same. So x+y is different from y+x.
	onlyOrderChanges: 1, // Order changes are OK, but the rest is not. So a*x+b equals b+x*a, but x+x does NOT equal 2*x.
	equivalent: 2, // Any equivalent expression works. So sin(pi/6)*x would equal x/sqrt(4). Prior simplification is obviously not needed when using this option.
	integerMultiple: 3, // An integer multiple is still considered equal. So 2(x+1) is equal to (4x+4) but not to 3(x+1).
	constantMultiple: 4, // A constant multiple is still considered equal. So 2(x+1) is equal to (3x+3) but not to (3x+2) or y(x+1).
}
