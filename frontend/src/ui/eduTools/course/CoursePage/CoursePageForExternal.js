import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Head, Par, LogInButtons } from 'ui/components'

import { useCourseData } from '../components'

const translationPath = `eduTools/pages/coursePage`
const translationSection = `externals`

export function CoursePageForExternal() {
	const { course } = useCourseData()

	return <>
		{course.description && <Par><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation></Par>}
		<TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Head><Translation entry="title">Sign in required</Translation></Head>
				<Par><Translation entry="description">To participate in this course, you have to first sign in and then subscribe to the course. No worries, it's all free. This is only so we can track and show you your progress within the course.</Translation></Par>
				<LogInButtons centered={false} />
			</TranslationSection>
		</TranslationFile>
	</>
}
