// firstOf takes an array and returns its first item. Yes, you can do [0], but this may look prettier if you already use lastOf.
function firstOf(array) {
	return array[0]
}
module.exports.firstOf = firstOf

// lastOf takes an array and returns its last item. It does not adjust the array.
function lastOf(array) {
	return array[array.length - 1]
}
module.exports.lastOf = lastOf

// secondLastOf returns the second-last element of an array.
function secondLastOf(array) {
	return array[array.length - 2]
}
module.exports.secondLastOf = secondLastOf
