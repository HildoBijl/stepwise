const { ensureNumber } = require('../numbers')

// normalPDF calculates the PDF for a Gaussian (normal) distribution.
function normalPDF(x, mu = 0, sigma = 1) {
	// Check input.
	x = ensureNumber(x)
	mu = ensureNumber(mu)
	sigma = ensureNumber(sigma)
	
	// Calculate the PDF.
	return 1/(sigma * Math.sqrt(2*Math.PI)) * Math.exp(-1/2 * ((x - mu)/sigma) ** 2)
}
module.exports.normalPDF = normalPDF
