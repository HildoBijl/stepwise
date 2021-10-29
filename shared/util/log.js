// vlog (short for verbose-defined log) logs only when the given verbose parameter is set to true.
export function vlog(text, verbose = true) {
	if (verbose)
		console.log(text)
}
