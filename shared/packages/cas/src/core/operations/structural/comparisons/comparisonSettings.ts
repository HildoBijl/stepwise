export type ComparisonSettings = {
	allowOrderChanges: boolean
}

// The default comparison settings are relatively loose and accepting.
export const defaultComparisonSettings: ComparisonSettings = {
	allowOrderChanges: true,
}

// A variant is used to compare in a more strict sense.
export const strictComparisonSettings: ComparisonSettings = {
	allowOrderChanges: false,
}
