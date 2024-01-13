// bracketLevels are used when displaying an element as a string or LaTeX. Should we use brackets in a summation, multiplication, division or power?
module.exports = {
	addition: 0, // Should we use brackets for x + [...]?
	multiplication: 1, // Should we use brackets for x*[...]?
	division: 2, // Should we use brackets for x/[...]?
	powers: 3, // Should we use brackets for x^[...] or [...]^x?
}
