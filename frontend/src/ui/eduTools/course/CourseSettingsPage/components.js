import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import { HowToReg as SubscribeIcon } from '@mui/icons-material'

import { LocalizedList, Plural, Translation } from '@step-wise/i18n'
import { moduleTree } from '@step-wise/module-tree'

import { useSubscribeToCourse, useUnsubscribeFromCourse } from 'api'
import { TranslationFile, TranslationSection, Translation as LegacyTranslation } from 'i18n'
import { Head, Par, List, ErrorNote } from 'ui/components'
import { usePaths } from 'ui/routingTools'
import { moduleCatalog } from 'ui/eduContent/moduleCatalog'

import { getOrganization } from '../../organizations'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = `students`

export function CourseTeachers({ course }) {
	// Sort the teachers of this course by name.
	const { teachers: teachersRaw } = course
	const teachers = useMemo(() => teachersRaw && [...teachersRaw].sort((a, b) => a.name.localeCompare(b.name)), [teachersRaw])

	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	if (organization.noTeachers)
		return

	// Show the teachers.
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation group={['students', 'teachers']} id="title">Teachers</Translation></Head>
			<Par style={{ marginBottom: '1.2rem' }}>
				<div style={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'flex-start' }}>
					<div style={{ flex: '0 0 auto', height: '1.3rem', marginLeft: '0.2rem', maxWidth: '3rem' }}>
						<img src={organization.logo} alt={`Logo ${organization.name}`} style={{ display: 'inline-block', height: '100%', width: 'auto', maxWidth: '100%', transform: 'translateY(2pt)' }} />
					</div>
					<div style={{ flex: 1, marginLeft: '0.8rem' }}>
						<Translation group={['students', 'teachers']} id="description"><Plural value={teachers.length}><Plural.Exact value={0}>This <strong>{{ name: organization.name }}</strong> course has no teachers at the moment.</Plural.Exact><Plural.Other>This <strong>{{ name: organization.name }}</strong> course is taught by <LocalizedList items={teachers.map(teacher => <strong key={teacher.id}>{teacher.name}</strong>)} />.</Plural.Other></Plural></Translation>
					</div>
				</div>
			</Par>
		</TranslationSection>
	</TranslationFile>
}

export function CourseLearningGoals({ course }) {
	const paths = usePaths()
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation group={['students', 'learningGoals']} id="title">Learning goals</Translation></Head>
			<Par><Translation group={['students', 'learningGoals']} id="description">The course has the following final <Plural value={course.courseDefinition.learningGoalIds.length}><Plural.One>goal</Plural.One><Plural.Other>goals</Plural.Other></Plural>.</Translation></Par>
			<List>
				{course.courseDefinition.learningGoalIds.map(goalId => {
				const skill = moduleTree[goalId]
				return <List.Item key={goalId}><Link to={paths.skill({ skillId: goalId })}><LegacyTranslation path="eduContent/skillNames" entry={`${skill.groupPath.join('.')}.${skill.id}`}>{moduleCatalog[skill.id].name}</LegacyTranslation></Link></List.Item>
			})}
			</List>
		</TranslationSection>
	</TranslationFile>
}

export function SubscribeButton({ course }) {
	const [subscribeToCourse, { loading, error }] = useSubscribeToCourse()
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Button variant="contained" startIcon={<SubscribeIcon />} onClick={() => subscribeToCourse(course.id).catch(() => {})} disabled={loading} color="primary" style={{ marginTop: '0.2rem', marginBottom: '0.6rem' }}>
				<Translation group={['students', 'subscribe']} id="button">Subscribe to this course</Translation>
			</Button>
			{error && <ErrorNote error={error} />}
		</TranslationSection>
	</TranslationFile>
}

export function UnsubscribeButton({ course }) {
	const [unsubscribeFromCourse, { loading, error }] = useUnsubscribeFromCourse()
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Button variant="contained" startIcon={<SubscribeIcon />} onClick={() => unsubscribeFromCourse(course.id).catch(() => {})} disabled={loading} color="secondary" style={{ marginTop: '0.2rem', marginBottom: '0.6rem' }}>
				<Translation group={['students', 'unsubscribe']} id="button">Unsubscribe from this course</Translation>
			</Button>
			{error && <ErrorNote error={error} />}
		</TranslationSection>
	</TranslationFile>
}
