// first takes an array and returns its first item. Yes, you can do [0], but this may look prettier if you already use last.
function first(array) {
	return array[0]
}
module.exports.first = first

// last takes an array and returns its last item. It does not adjust the array.
function last(array) {
	return array[array.length - 1]
}
module.exports.last = last

// secondLast returns the second-last element of an array.
function secondLast(array) {
	return array[array.length - 2]
}
module.exports.secondLast = secondLast
