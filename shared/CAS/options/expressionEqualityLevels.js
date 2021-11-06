module.exports = {
	default: 2,
	exact: 0, // Everything must be exactly the same. So x+y is different from y+x.
	onlyOrderChanges: 1, // Order changes are OK, but the rest is not. So a*x+b equals b+x*a, but x+x does NOT equal 2*x.
	equivalent: 2, // Any equivalent expression works. So sin(pi/6)*x would equal x/sqrt(4). Prior simplification is obviously not needed when using this option.
	constantMultiple: 3, // A constant multiple is still considered equal. So (x+1) is equal to (2x+2) but not to (2x+1).
}
