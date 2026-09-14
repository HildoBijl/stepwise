import { hasOnlyKeys, isBoolean, isPlainDataObject, isPlainObject } from '@step-wise/js-utils'

import type { CheckInputResult, GroupInputExerciseReport, InputExerciseReport } from './types.ts'

export function normalizeCheckInputResult(result: CheckInputResult): { correct: boolean, report?: InputExerciseReport } {
	if (isBoolean(result)) return { correct: result }
	if (!isPlainObject(result) || !hasOnlyKeys(result, ['correct', 'report']) || !isBoolean(result.correct)) throw new TypeError(`Invalid checkInput result: expected a boolean or an object with a boolean "correct" property and an optional report.`)
	if (result.report !== undefined && !isPlainDataObject(result.report)) throw new TypeError(`Invalid checkInput report: expected a plain data object.`)
	return result
}

export function getGroupInputExerciseReport(userIds: readonly (string | undefined)[], reports: readonly (InputExerciseReport | undefined)[]): GroupInputExerciseReport | undefined {
	const report = Object.fromEntries(reports.flatMap((userReport, index) => {
		if (userReport === undefined) return []
		const userId = userIds[index]
		if (userId === undefined) throw new TypeError(`A userId is required when creating a group exercise report.`)
		return [[userId, userReport]]
	}))
	return Object.keys(report).length === 0 ? undefined : report
}

export function mergeInputExerciseReports(previousReport: InputExerciseReport | undefined, report: InputExerciseReport | undefined): InputExerciseReport | undefined {
	if (report === undefined) return previousReport
	return { ...previousReport, ...report }
}
