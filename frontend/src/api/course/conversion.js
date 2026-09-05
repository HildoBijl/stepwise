import { userWithSkillsRecordToUser } from '../skill/conversion'

export function courseRecordToCourseData({ accessData, teacherData, ...course }) {
	return {
		...course,
		...(accessData ?? {}),
		...(teacherData ? { ...teacherData, students: teacherData.students.map(userWithSkillsRecordToUser) } : {}),
	}
}
