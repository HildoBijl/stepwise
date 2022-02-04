// This is a legacy type. In the past Multiple Choice answers were stored in a convoluted way { multiple: false/true, selection: [2] }. The function below turns these old types into a proper answer: an array of indices in case multiple is true and otherwise just an index.
// ToDo: remove this file as well as the corresponding data type after the major overhaul and after clearing out all old exercise data.

module.exports.SItoFO = (SI) => {
	const { multiple, selection } = SI
	return multiple ? [...selection] : selection[0]
}