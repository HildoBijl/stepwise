// Return the probability density of the normal (Gaussian) distribution.
export function normalPDF(x: number, mu: number = 0, sigma: number = 1): number {
	if (sigma <= 0) throw new RangeError(`Input error: sigma must be positive, but received "${sigma}".`)
	return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}
