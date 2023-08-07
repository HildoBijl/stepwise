// getCounterNumber returns a number that increments on every request. This allows us to get unique numbers whenever we request one on a page.
let counter = 0
function getCounterNumber() {
  return counter++
}
module.exports.getCounterNumber = getCounterNumber
