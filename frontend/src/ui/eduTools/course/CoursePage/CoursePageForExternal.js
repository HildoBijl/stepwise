import { Translation } from '@step-wise/i18n'

import { TranslationFile, TranslationSection, Translation as LegacyTranslation } from 'i18n'
import { Head, Par, SignInButtons } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

const translationPath = `eduTools/pages/coursePage`
const translationSection = `externals`

export function CoursePageForExternal() {
	const { course } = useCourseData()

	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	return <>
		{course.description && <Par><LegacyTranslation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</LegacyTranslation></Par>}
		<TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Head><Translation group={['externals', 'signin']} id="title">Sign in required</Translation></Head>
				<Par><Translation group={['externals', 'signin']} id="description">To participate in this course, you have to be signed in. No worries, it's all free. This is so we can show you your progress within the course.</Translation></Par>
				<SignInButtons centered={false} />
				{organization.noTeachers ? null : <>
					<Head><Translation group={['externals', 'school']} id="title">School/Institution</Translation></Head>
					<Par style={{ marginBottom: '1.2rem' }}>
						<div style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'flex-start' }}>
							<div style={{ flex: '0 0 auto', height: '1.3rem', marginLeft: '0.2rem', maxWidth: '3rem' }}>
								<img src={organization.logo} alt={`Logo ${organization.name}`} style={{ display: 'inline-block', height: '100%', width: 'auto', maxWidth: '100%', transform: 'translateY(2pt)' }} />
							</div>
							<div style={{ flex: 1, marginLeft: '0.8rem' }}>
								<Translation group={['externals', 'school']} id="description">This course is taught by <strong>{{ name: organization.name }}</strong>.</Translation>
							</div>
						</div>
					</Par>
				</>}
			</TranslationSection>
		</TranslationFile>
	</>
}

