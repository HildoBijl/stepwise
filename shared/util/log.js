// vlog (short for verbose-defined log) logs only when the given verbose parameter is set to true.
function vlog(text, verbose = true) {
	if (verbose)
		console.log(text)
}
module.exports.vlog = vlog