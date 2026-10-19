export type XliffValidationIssue = {
	path: string
	message: string
}

export class InvalidXliffError extends Error {
	readonly issues: readonly XliffValidationIssue[]

	constructor(issues: readonly XliffValidationIssue[]) {
		super(`Invalid XLIFF document:\n${issues.map(issue => `${issue.path}: ${issue.message}`).join('\n')}`)
		this.name = 'InvalidXliffError'
		this.issues = issues
	}
}
