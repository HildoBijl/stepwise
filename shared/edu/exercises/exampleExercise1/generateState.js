import { getRandomInteger } from '../../../util/random'

export default function generateState() {
	const a = getRandomInteger(1,10)
	const x = getRandomInteger(1,10)
	return {
		a,
		b: a*x,
	}
}
