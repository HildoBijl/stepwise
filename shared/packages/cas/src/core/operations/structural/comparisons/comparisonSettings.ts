export type ComparisonSettings = {
	allowOrderChanges: boolean
}

export const defaultComparisonSettings: ComparisonSettings = {
	allowOrderChanges: true,
}

export const strictComparisonSettings: ComparisonSettings = {
	allowOrderChanges: false,
}
