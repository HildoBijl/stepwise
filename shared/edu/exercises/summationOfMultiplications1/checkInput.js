function checkInput({ a, b, c, d }, { ans }) {
	return a * b + c * d === parseInt(ans)
}
module.exports = checkInput
