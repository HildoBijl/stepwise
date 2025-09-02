import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Head, Par, LogInButtons } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

const translationPath = `eduTools/pages/coursePage`
const translationSection = `externals`

export function CoursePageForExternal() {
	const { course } = useCourseData()

	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	if (organization.noTeachers)
		return

	return <>
		{course.description && <Par><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation></Par>}
		<TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Head><Translation entry="signin.title">Sign in required</Translation></Head>
				<Par><Translation entry="signin.description">To participate in this course, you have to be signed in. No worries, it's all free. This is so we can show you your progress within the course.</Translation></Par>
				<LogInButtons centered={false} />
				<Head><Translation entry="school.title">School/Institution</Translation></Head>
				<Par style={{ marginBottom: '1.2rem' }}>
					<div style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'flex-start' }}>
						<div style={{ flex: '0 0 auto', height: '1.3rem', marginLeft: '0.2rem', maxWidth: '3rem' }}>
							<img src={organization.logo} alt={`Logo ${organization.name}`} style={{ display: 'inline-block', height: '100%', width: 'auto', maxWidth: '100%', transform: 'translateY(2pt)' }} />
						</div>
						<div style={{ flex: 1, marginLeft: '0.8rem' }}>
							<Translation entry="school.description">This course is taught by <strong>{{ name: organization.name }}</strong>.</Translation>
						</div>
					</div>
				</Par>
			</TranslationSection>
		</TranslationFile>
	</>
}

