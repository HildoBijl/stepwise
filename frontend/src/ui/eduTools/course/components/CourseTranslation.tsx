import { useTextTranslation } from '@step-wise/i18n'

type Course = {
	organization: string
	code: string
	name: string
	description?: string
	blockNames?: readonly string[]
}

type CourseTranslationProps = {
	course: Course
	property?: 'name' | 'description'
	block?: number
}

export function useCourseTranslation({ course, property = 'name', block }: CourseTranslationProps): string {
	const isBlock = block !== undefined
	return useTextTranslation({
		folder: ['eduContent'],
		catalog: 'courseInfo',
		group: [course.organization, course.code, ...(isBlock ? ['blocks'] : [])],
		id: isBlock ? String(block) : property,
		source: isBlock ? course.blockNames?.[block] ?? '' : course[property] ?? '',
	})
}

export function CourseTranslation(props: CourseTranslationProps) {
	return <>{useCourseTranslation(props)}</>
}
