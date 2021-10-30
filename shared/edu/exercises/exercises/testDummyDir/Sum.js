import Expression from './Expression'

export default class Sum extends Expression {
	constructor(terms) {
		this.terms = terms
	}
}