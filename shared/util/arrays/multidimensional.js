// getDimensions takes a multi-dimensional matrix and extracts its dimensions.
function getDimensions(matrix) {
	const dimensions = []
	while (Array.isArray(matrix)) {
		dimensions.push(matrix.length)
		matrix = matrix[0]
	}
	return dimensions
}
module.exports.getDimensions = getDimensions

// getMatrixElement takes a matrix and set of indices and returns its value from the matrix. For instance, getMatrixElement(matrix, [2,0,1]) will extract matrix[2][0][1]. It returns undefined if the result does not exist.
function getMatrixElement(matrix, indices) {
	indices.forEach(index => {
		matrix = matrix && matrix[index]
	})
	return matrix
}
module.exports.getMatrixElement = getMatrixElement
