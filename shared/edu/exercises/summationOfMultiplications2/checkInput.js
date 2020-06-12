function checkInput({ a, b, c }, { ans }) {
	return a * b + c === parseInt(ans)
}
module.exports = checkInput
