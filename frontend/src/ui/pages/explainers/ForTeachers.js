import React from 'react'

import { infoEmail } from 'settings'
import { TranslationSection, Translation } from 'i18n'
import { Par, Head, SubHead, List, Student } from 'ui/components'
import { Drawing, useIdentityTransformationSettings, SvgPortal, Element } from 'ui/figures'

import { PageTranslationFile } from '../PageTranslationFile'

export function ForTeachers() {
	return <PageTranslationFile page="explainers/forTeachers">
		<Translation entry="intro">
			<Par>You can see Step-Wise as a <strong>textbook</strong>: it has theory and lots of practice exercises. No need for you to create any content. It's already there!</Par>
			<Par>
				But Step-Wise goes far beyond a simple textbook.
				<List items={[
					<>It's <strong>interactive</strong>! Students can play around with the contents and experience it more actively.</>,
					<>It's very <strong>modular</strong>. You can select, up to the finest detail, what students need to learn and when.</>,
					<>It <strong>tracks</strong> your students. You always know exactly how far along the class or any individual student is, and how much work they put in.</>,
				]} />
				Want to see how it works? Read on about how to set up a course or inspect your class!
			</Par>
		</Translation>

		<TranslationSection entry="courses">
			<Head><Translation entry="head">Define your course</Translation></Head>
			<Par><Translation entry="intro">If you want your students to use Step-Wise, the first thing you do is set up your course. There are three steps to do so.</Translation></Par>

			<TranslationSection entry="goals">
				<SubHead><Translation entry="head">Choose the end goals</Translation></SubHead>
				<Par><Translation entry="par1">Step-Wise is based around small modules called <strong>skills</strong>. These are things students can actually do, like solve a particular type of equation or calculate a certain quantity. Each skill is roughly 2-10 minutes worth of information.</Translation></Par>
				<Par><Translation entry="par2">Skills have all sorts of links between between them. For example, to execute a skill, you often have to execute two or three subskills in order. These links are visualized in a <strong>skill tree</strong>. Basic skills are at the top, and skills are combined into more advanced skills as we move downwards.</Translation></Par>
				<SettingGoals />
				<Par><Translation entry="par3">To set up your course, you first have to <strong>pick the end goals</strong>. These are the skills that students should have mastered at the end of the course. Skills above them will also be taught. Skills below them will not.</Translation></Par>
			</TranslationSection>

			<TranslationSection entry="priorKnowledge">
				<SubHead><Translation entry="head">Define prior knowledge</Translation></SubHead>
				<Par><Translation entry="par1">If we walk upwards from the final course goals, we find all the skills that the students have to master altogether. But if we go upwards far enough, we will surely reach skills that the students already mastered previously. These skills are not part of the course: they are <strong>prior knowledge</strong>.</Translation></Par>
				<DefiningPriorKnowledge />
				<Par><Translation entry="par2">Step two to set up your course is to define this prior knowledge. We'll simply <strong>walk up from the goals</strong> and you'll have to tell us for each skill "Can students already do this? Or do they need to learn it as part of the course?" Of course, if we find that some students haven't properly mastered the prior knowledge yet, we will support them to learn it.</Translation></Par>
			</TranslationSection>

			<TranslationSection entry="blocks">
				<SubHead><Translation entry="head">Divide into weeks/blocks</Translation></SubHead>
				<Par><Translation entry="par1">Once we know the skills that are part of the course, we can <strong>divide the course into blocks</strong>. Usually a "block" is a week within a course, but it can also be a lecture, a month, or anything else.</Translation></Par>
				<DefiningBlocks />
				<Par><Translation entry="par2">To define your blocks, you <strong>specify the final goals for each block</strong>. From this, the exact contents of the blocks automatically follow. Your course is then fully set up.</Translation></Par>
			</TranslationSection>
		</TranslationSection>

		<TranslationSection entry="tracking">
			<Head><Translation entry="head">Track your students</Translation></Head>
			<Par><Translation entry="intro">Once your course is ready, you can invite your students, or they can add the course themselves. This allows them to easily access the contents, but you can also <strong>follow their progress</strong>.</Translation></Par>

			<TranslationSection entry="classOverview">
				<SubHead><Translation entry="head">Get class overviews</Translation></SubHead>
				<Par><Translation entry="par1">The first thing you can track is the <strong>general class progress</strong>, both per block and per skill. You can investigate the student <strong>level</strong> (have they mastered it) and the <strong>activity</strong> (how many times did they on average practice it). In this way you can immediately detect where the class struggles, and if this is because of their effort or because of other reasons.</Translation></Par>
				<ClassOverview />
			</TranslationSection>

			<TranslationSection entry="studentOverview">
				<SubHead><Translation entry="head">Get student overviews</Translation></SubHead>
				<Par><Translation entry="par1">Next to a full class overview, you can also <strong>check out individual students</strong>. What is the student's progress? And how much has been practiced? This overview is very useful for coaching interviews, not only by course teachers but also by mentors that are not fluent in the content matter.</Translation></Par>
				<StudentOverview />
			</TranslationSection>

			<TranslationSection entry="liveHelping">
				<SubHead><Translation entry="head">Help students live with exercises</Translation></SubHead>
				<Par><Translation entry="par1">Step-Wise is very well suited to be used in the classroom during practice sessions. There is even a <strong>collaboration mode</strong> where students can practice together, ensuring they get the same exercises to solve together. Whenever students struggle, the app will help them out.</Translation></Par>
				<Par><Translation entry="par2">However, there are always special cases where Step-Wise cannot optimally support a student. And that's where the teacher (you) comes in. When a student asks a question, it's possible to <strong>quickly look up a student</strong> on your tablet/smartphone, and directly check out the last active exercise, including solution, to optimally get the student back on track again.</Translation></Par>
				<StudentSearch />
				<Par><Translation entry="par3">Experience has shown that using Step-Wise during live practice sessions allows for an <strong>increase of the student-to-teacher ratio by a factor three</strong>, while keeping (and even increasing) student satisfaction ratings! This allows for lots of extra teacher time, to support the students even more.</Translation></Par>
			</TranslationSection>
		</TranslationSection>

		<TranslationSection entry="getStarted">
			<Head><Translation entry="head">Get started</Translation></Head>
			<Par><Translation entry="intro">Do you want to use Step-Wise in your course? Step-Wise is still in the <strong>beta phase</strong>. So the good news is: it's free to use! The bad news: not all content may be there yet. The best thing you can do is <strong>send an email</strong> to <a href={`mailto:${infoEmail}`}>{{ infoEmail }}</a> (Hildo) and we can check out the possibilities together. It's always great to have more people use Step-Wise!</Translation></Par>
		</TranslationSection>
	</PageTranslationFile>
}

function SettingGoals() {
	const transformationSettings = useIdentityTransformationSettings(600, 340)
	const lineStyle = { fill: 'none', stroke: '#404040', strokeWidth: '2', strokeMiterlimit: 10 }
	const blockStyle = { fill: lineStyle.stroke }
	const targetCenterStyle = { fill: '#ffffff' }
	const targetCircleStyle = { stroke: targetCenterStyle.fill, strokeWidth: 2.5, fill: 'none' }

	return <Drawing transformationSettings={transformationSettings}>
		<SvgPortal>
			<path style={blockStyle} d="M100.4,48.8c0,5-4.1,9-9,9H18.5c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M100.4,140.3c0,4.9-4.1,9-9,9H18.5c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M209.3,48.8c0,5-4.1,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M209.3,140.3c0,4.9-4.1,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M318.3,231.9c0,4.9-4,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M155,231.9c0,4.9-4,9-9,9H73.1c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9H146c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M318.3,48.8c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M427.2,48.8c0,5-4,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<line style={lineStyle} x1="163.9" y1="102.3" x2="163.9" y2="57.8" />
			<path style={lineStyle} d="M54.9,57.8V71c0,4.9,4,9,9,9h75.9c4.9,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M265.3,57.8V71c0,4.9-4.1,9-9,9h-68.4c-4.9,0-9,4-9,9v13.2" />
			<path style={blockStyle} d="M372.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M318.3,323.4c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V323.4z" />
			<path style={blockStyle} d="M481.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M481.6,231.9c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M590.5,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<line style={lineStyle} x1="436.1" y1="193.8" x2="436.1" y2="149.3" />
			<path style={lineStyle} d="M327.2,149.3v13.2c0,5,4.1,9,9,9h75.9c5,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M545.1,149.3v13.2c0,5-4,9-9,9h-75.9c-4.9,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M163.9,149.3v13.2c0,5-4.1,9-9,9H126c-5,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M55.2,149.3v13.2c0,5,4,9,9,9H93c4.9,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M280.3,57.8V71c0,4.9,4,9,9,9h21.4c5,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M381.5,57.8V71c0,4.9-4,9-9,9h-28.9c-4.9,0-9,4-9,9v13.2" />
			<line style={lineStyle} x1="272.8" y1="240.9" x2="272.8" y2="285.3" />
			<path style={lineStyle} d="M436.1,240.9v13.2c0,4.9-4,9-9,9H296.8c-5,0-9,4-9,9v13.2" />
			<path style={lineStyle} d="M109.5,240.9v13.2c0,4.9,4,9,9,9h130.3c4.9,0,9,4,9,9v13.2" />
			<g>
				<circle style={targetCircleStyle} cx="109.5" cy="217.4" r="15" />
				<circle style={targetCircleStyle} cx="109.5" cy="217.4" r="9" />
				<circle style={targetCenterStyle} cx="109.5" cy="217.4" r="4" />
			</g>
			<g>
				<circle style={targetCircleStyle} cx="436.1" cy="217.4" r="15" />
				<circle style={targetCircleStyle} cx="436.1" cy="217.4" r="9" />
				<circle style={targetCenterStyle} cx="436.1" cy="217.4" r="4" />
			</g>
		</SvgPortal>
	</Drawing>
}

function DefiningPriorKnowledge() {
	const transformationSettings = useIdentityTransformationSettings(600, 340)
	const lineStyle = { fill: 'none', stroke: '#404040', strokeWidth: '2', strokeMiterlimit: 10 }
	const blockStyle = { fill: lineStyle.stroke }
	const targetCenterStyle = { fill: '#ffffff' }
	const targetCircleStyle = { stroke: targetCenterStyle.fill, strokeWidth: 2.5, fill: 'none' }
	const checkStyle = { fill: '#ffffff' }
	const fadeOut = { opacity: 0.2 }

	return <Drawing transformationSettings={transformationSettings}>
		<SvgPortal>
			<path style={blockStyle} d="M100.4,48.8c0,5-4.1,9-9,9H18.5c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M100.4,140.3c0,4.9-4.1,9-9,9H18.5c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M209.3,48.8c0,5-4.1,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M209.3,140.3c0,4.9-4.1,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeOut }} d="M318.3,231.9c0,4.9-4,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M155,231.9c0,4.9-4,9-9,9H73.1c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9H146c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M318.3,48.8c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<path style={blockStyle} d="M427.2,48.8c0,5-4,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<line style={lineStyle} x1="163.9" y1="102.3" x2="163.9" y2="57.8" />
			<path style={lineStyle} d="M54.9,57.8V71c0,4.9,4,9,9,9h75.9c4.9,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M265.3,57.8V71c0,4.9-4.1,9-9,9h-68.4c-4.9,0-9,4-9,9v13.2" />
			<path style={blockStyle} d="M372.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeOut }} d="M318.3,323.4c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V323.4z" />
			<path style={blockStyle} d="M481.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={blockStyle} d="M481.6,231.9c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={blockStyle} d="M590.5,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<line style={lineStyle} x1="436.1" y1="193.8" x2="436.1" y2="149.3" />
			<path style={lineStyle} d="M327.2,149.3v13.2c0,5,4.1,9,9,9h75.9c5,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M545.1,149.3v13.2c0,5-4,9-9,9h-75.9c-4.9,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M163.9,149.3v13.2c0,5-4.1,9-9,9H126c-5,0-9,4.1-9,9v13.2" />
			<path style={lineStyle} d="M55.2,149.3v13.2c0,5,4,9,9,9H93c4.9,0,9,4.1,9,9v13.2" />
			<path style={lineStyle} d="M280.3,57.8V71c0,4.9,4,9,9,9h21.4c5,0,9,4,9,9v13.2" />
			<path style={lineStyle} d="M381.5,57.8V71c0,4.9-4,9-9,9h-28.9c-4.9,0-9,4-9,9v13.2" />
			<line style={{ ...lineStyle, ...fadeOut }} x1="272.8" y1="240.9" x2="272.8" y2="285.3" />
			<path style={{ ...lineStyle, ...fadeOut }} d="M436.1,240.9v13.2c0,4.9-4,9-9,9H296.8c-5,0-9,4-9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeOut }} d="M109.5,240.9v13.2c0,4.9,4,9,9,9h130.3c4.9,0,9,4,9,9v13.2" />

			<g>
				<circle style={targetCircleStyle} cx="109.5" cy="217.4" r="15" />
				<circle style={targetCircleStyle} cx="109.5" cy="217.4" r="9" />
				<circle style={targetCenterStyle} cx="109.5" cy="217.4" r="4" />
			</g>
			<g>
				<circle style={targetCircleStyle} cx="436.1" cy="217.4" r="15" />
				<circle style={targetCircleStyle} cx="436.1" cy="217.4" r="9" />
				<circle style={targetCenterStyle} cx="436.1" cy="217.4" r="4" />
			</g>

			<path style={checkStyle} d="M62.1,27.7l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L62.1,27.7z M55.2,19.3c-8.3,0-15,6.7-15,15s6.7,15,15,15
	s15-6.7,15-15S63.5,19.3,55.2,19.3 M55.2,46.3c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12S61.8,46.3,55.2,46.3"/>
			<path style={checkStyle} d="M388.4,27.7l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L388.4,27.7z M381.5,19.3c-8.3,0-15,6.7-15,15
	s6.7,15,15,15s15-6.7,15-15S389.8,19.3,381.5,19.3 M381.5,46.3c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12
	S388.1,46.3,381.5,46.3"/>
			<path style={checkStyle} d="M552,119.2l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L552,119.2z M545.1,110.8c-8.3,0-15,6.7-15,15
	s6.7,15,15,15s15-6.7,15-15S553.4,110.8,545.1,110.8 M545.1,137.8c-6.6,0-12-5.4-12-12c0-6.6,5.4-12,12-12s12,5.4,12,12
	C557.1,132.4,551.7,137.8,545.1,137.8"/>
		</SvgPortal>
	</Drawing>
}

function DefiningBlocks() {
	const transformationSettings = useIdentityTransformationSettings(600, 340)
	const lineStyle = { fill: 'none', stroke: '#404040', strokeWidth: '2', strokeMiterlimit: 10 }
	const blockStyle = { fill: lineStyle.stroke }
	const targetCenterStyle = { fill: '#ffffff' }
	const targetCircleStyle = { stroke: targetCenterStyle.fill, strokeWidth: 1.5, fill: 'none' }
	const checkStyle = { fill: '#ffffff' }
	const fadeOut = { opacity: 0.2 }
	const fadePK = { opacity: 0.4 }
	const fadeB1 = { opacity: 0.7 }
	const fadeB2 = { opacity: 0.85 }
	const fadeB3 = { opacity: 1 }
	const number = { fill: '#ffffff', fontSize: '20px' }

	return <Drawing transformationSettings={transformationSettings}>
		<SvgPortal>
			<path style={{ ...blockStyle, ...fadePK }} d="M100.4,48.8c0,5-4.1,9-9,9H18.5c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={{ ...blockStyle, ...fadeB2 }} d="M100.4,140.3c0,4.9-4.1,9-9,9H18.5c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeB1 }} d="M209.3,48.8c0,5-4.1,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c4.9,0,9,4.1,9,9V48.8z" />
			<path style={{ ...blockStyle, ...fadeB1 }} d="M209.3,140.3c0,4.9-4.1,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-5,4.1-9,9-9h72.9c4.9,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeOut }} d="M318.3,231.9c0,4.9-4,9-9,9h-72.9c-4.9,0-9-4.1-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={{ ...blockStyle, ...fadeB2 }} d="M155,231.9c0,4.9-4,9-9,9H73.1c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9H146c5,0,9,4.1,9,9V231.9z" />
			<path style={{ ...blockStyle, ...fadeB1 }} d="M318.3,48.8c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<path style={{ ...blockStyle, ...fadePK }} d="M427.2,48.8c0,5-4,9-9,9h-72.9c-5,0-9-4-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V48.8z" />
			<line style={{ ...lineStyle, ...fadeB1 }} x1="163.9" y1="102.3" x2="163.9" y2="57.8" />
			<path style={{ ...lineStyle, ...fadeB1 }} d="M54.9,57.8V71c0,4.9,4,9,9,9h75.9c4.9,0,9,4,9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB1 }} d="M265.3,57.8V71c0,4.9-4.1,9-9,9h-68.4c-4.9,0-9,4-9,9v13.2" />
			<path style={{ ...blockStyle, ...fadeB3 }} d="M372.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeOut }} d="M318.3,323.4c0,5-4,9-9,9h-72.9c-4.9,0-9-4-9-9v-29c0-4.9,4.1-9,9-9h72.9c5,0,9,4.1,9,9V323.4z" />
			<path style={{ ...blockStyle, ...fadeB3 }} d="M481.6,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<path style={{ ...blockStyle, ...fadeB3 }} d="M481.6,231.9c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-4.9,4-9,9-9h72.9c5,0,9,4.1,9,9V231.9z" />
			<path style={{ ...blockStyle, ...fadePK }} d="M590.5,140.3c0,4.9-4,9-9,9h-72.9c-5,0-9-4.1-9-9v-29c0-5,4-9,9-9h72.9c5,0,9,4,9,9V140.3z" />
			<line style={{ ...lineStyle, ...fadeB3 }} x1="436.1" y1="193.8" x2="436.1" y2="149.3" />
			<path style={{ ...lineStyle, ...fadeB3 }} d="M327.2,149.3v13.2c0,5,4.1,9,9,9h75.9c5,0,9,4.1,9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB3 }} d="M545.1,149.3v13.2c0,5-4,9-9,9h-75.9c-4.9,0-9,4.1-9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB2 }} d="M163.9,149.3v13.2c0,5-4.1,9-9,9H126c-5,0-9,4.1-9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB2 }} d="M55.2,149.3v13.2c0,5,4,9,9,9H93c4.9,0,9,4.1,9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB3 }} d="M280.3,57.8V71c0,4.9,4,9,9,9h21.4c5,0,9,4,9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeB3 }} d="M381.5,57.8V71c0,4.9-4,9-9,9h-28.9c-4.9,0-9,4-9,9v13.2" />
			<line style={{ ...lineStyle, ...fadeOut }} x1="272.8" y1="240.9" x2="272.8" y2="285.3" />
			<path style={{ ...lineStyle, ...fadeOut }} d="M436.1,240.9v13.2c0,4.9-4,9-9,9H296.8c-5,0-9,4-9,9v13.2" />
			<path style={{ ...lineStyle, ...fadeOut }} d="M109.5,240.9v13.2c0,4.9,4,9,9,9h130.3c4.9,0,9,4,9,9v13.2" />

			<g>
				<circle style={targetCircleStyle} cx="197.3" cy="114.3" r="7.5" />
				<circle style={targetCircleStyle} cx="197.3" cy="114.3" r="4.5" />
				<circle style={targetCenterStyle} cx="197.3" cy="114.3" r="2" />
			</g>
			<g>
				<circle style={targetCircleStyle} cx="143" cy="205.7" r="7.5" />
				<circle style={targetCircleStyle} cx="143" cy="205.7" r="4.5" />
				<circle style={targetCenterStyle} cx="143" cy="205.7" r="2" />
			</g>
			<g>
				<circle style={targetCircleStyle} cx="469.6" cy="205.7" r="7.5" />
				<circle style={targetCircleStyle} cx="469.6" cy="205.7" r="4.5" />
				<circle style={targetCenterStyle} cx="469.6" cy="205.7" r="2" />
			</g>

			<path style={checkStyle} d="M62.1,27.7l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L62.1,27.7z M55.2,19.3c-8.3,0-15,6.7-15,15s6.7,15,15,15
	s15-6.7,15-15S63.5,19.3,55.2,19.3 M55.2,46.3c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12S61.8,46.3,55.2,46.3"/>
			<path style={checkStyle} d="M388.4,27.7l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L388.4,27.7z M381.5,19.3c-8.3,0-15,6.7-15,15
	s6.7,15,15,15s15-6.7,15-15S389.8,19.3,381.5,19.3 M381.5,46.3c-6.6,0-12-5.4-12-12s5.4-12,12-12s12,5.4,12,12
	S388.1,46.3,381.5,46.3"/>
			<path style={checkStyle} d="M552,119.2l-9.9,9.9l-5.4-5.4l-2.1,2.1l7.5,7.5l12-12L552,119.2z M545.1,110.8c-8.3,0-15,6.7-15,15
	s6.7,15,15,15s15-6.7,15-15S553.4,110.8,545.1,110.8 M545.1,137.8c-6.6,0-12-5.4-12-12c0-6.6,5.4-12,12-12s12,5.4,12,12
	C557.1,132.4,551.7,137.8,545.1,137.8"/>

			<text transform="matrix(1 0 0 1 158.2349 41.8)" style={number}>1</text>
			<text transform="matrix(1 0 0 1 158.2349 133.3)" style={number}>1</text>
			<text transform="matrix(1 0 0 1 49.5848 133.3)" style={number}>2</text>
			<text transform="matrix(1 0 0 1 321.5846 133.3)" style={number}>3</text>
			<text transform="matrix(1 0 0 1 430.5344 133.3)" style={number}>3</text>
			<text transform="matrix(1 0 0 1 430.5344 223.8963)" style={number}>3</text>
			<text transform="matrix(1 0 0 1 103.885 223.8963)" style={number}>2</text>
			<text transform="matrix(1 0 0 1 267.1848 41.8)" style={number}>1</text>
		</SvgPortal>
	</Drawing>
}

function ClassOverview() {
	const transformationSettings = useIdentityTransformationSettings(600, 300)

	const blockStyle = { fill: '#e2e2e2' }
	const skillStyle = { fill: '#ededed' }
	const blockTextStyle = { fontSize: '16px', fontFamily: 'roboto' }
	const headStyle = { ...blockTextStyle, fontWeight: 'bold' }
	const indicatorTextStyle = { ...blockTextStyle, fontSize: '9px', fontWeight: 600 }
	const indicatorBGStyle = { fill: 'none', stroke: '#a9a9a9', strokeWidth: '4px' }
	const indicatorLineStyle = { ...indicatorBGStyle, stroke: '#000000' }
	const arrowActiveStyle = { fill: 'none', stroke: '#000000', strokeWidth: '2px' }
	const arrowInactiveStyle = { ...arrowActiveStyle, opacity: 0.2 }

	return <TranslationSection entry="classOverviewImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<Element position={[264.3, 14]} style={headStyle}><Translation entry="head1">Mastery</Translation></Element>
				<Element position={[374.8, 14]} style={headStyle}><Translation entry="head2">Exercises</Translation></Element>
				<Element position={[480.5, 14]} style={headStyle}><Translation entry="head3">Time spent</Translation></Element>

				<path style={blockStyle} d="M582.9,68.6c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10V40.9c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V68.6z" />
				<path style={blockStyle} d="M582.9,122c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10V94.3c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V122z" />
				<path style={skillStyle} d="M582.9,175.4c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V175.4z" />
				<path style={skillStyle} d="M582.9,228.8c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V228.8z" />
				<path style={blockStyle} d="M582.9,282.2c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V282.2z" />

				<Element position={[30.5, 54.8]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block1">Opening week</Translation></Element>
				<Element position={[30.5, 108.2]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block2">Middle week</Translation></Element>
				<Element position={[30.5, 161.6]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="skill1">Some basic skill</Translation></Element>
				<Element position={[30.5, 215.1]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="skill2">A more advanced skill</Translation></Element>
				<Element position={[30.5, 268.4]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block3">Closing week</Translation></Element>

				<Element position={[264.3, 54.8]} style={indicatorTextStyle}>22/25</Element>
				<Element position={[374.8, 54.8]} style={indicatorTextStyle}>7,8</Element>
				<Element position={[480.5, 54.8]} style={indicatorTextStyle}>2:36</Element>
				<Element position={[264.3, 108.2]} style={indicatorTextStyle}>11/25</Element>
				<Element position={[374.8, 108.2]} style={indicatorTextStyle}>6,4</Element>
				<Element position={[480.5, 108.2]} style={indicatorTextStyle}>4:11</Element>
				<Element position={[264.3, 161.6]} style={indicatorTextStyle}>19/25</Element>
				<Element position={[374.8, 161.6]} style={indicatorTextStyle}>2,5</Element>
				<Element position={[480.5, 161.6]} style={indicatorTextStyle}>0:58</Element>
				<Element position={[264.3, 215.0]} style={indicatorTextStyle}>11/25</Element>
				<Element position={[374.8, 215.0]} style={indicatorTextStyle}>4,9</Element>
				<Element position={[480.5, 215.0]} style={indicatorTextStyle}>3:13</Element>
				<Element position={[264.3, 268.4]} style={indicatorTextStyle}>2/25</Element>
				<Element position={[374.8, 268.4]} style={indicatorTextStyle}>0,6</Element>
				<Element position={[480.5, 268.4]} style={indicatorTextStyle}>0:18</Element>

				<polyline style={arrowActiveStyle} points="552,105.1 559.1,112.1 566.2,105.1 " />
				<polyline style={arrowInactiveStyle} points="566.2,58.3 559.1,51.2 552,58.3 " />
				<polyline style={arrowInactiveStyle} points="566.2,271.9 559.1,264.8 552,271.9 " />

				<circle style={indicatorBGStyle} cx="264.3" cy="54.8" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,37.9c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-9.3,0-16.9-7.5-16.9-16.9c0-5,2.2-9.5,5.6-12.6" />

				<circle style={indicatorBGStyle} cx="374.8" cy="54.8" r="16.9" />
				<circle style={indicatorLineStyle} cx="374.8" cy="54.8" r="16.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="54.8" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,37.9c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-4.6,0-8.7-1.8-11.8-4.8" />

				<circle style={indicatorBGStyle} cx="264.3" cy="108.2" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,91.8c9.3,0,16.9,7.5,16.9,16.9c0,6.9-4.1,12.8-10,15.4" />

				<circle style={indicatorBGStyle} cx="374.8" cy="108.2" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,91.8c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9s-16.9-7.5-16.9-16.9c0-2.2,0.4-4.4,1.2-6.3" />

				<circle style={indicatorBGStyle} cx="480.5" cy="108.2" r="16.9" />
				<circle style={indicatorLineStyle} cx="480.5" cy="108.2" r="16.9" />

				<circle style={indicatorBGStyle} cx="264.3" cy="161.6" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,145c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-9.3,0-16.9-7.5-16.9-16.9c0-0.3,0-0.5,0-0.8" />

				<circle style={indicatorBGStyle} cx="374.8" cy="161.6" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,145c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-0.3,0-0.6,0-0.9,0" />

				<circle style={indicatorBGStyle} cx="480.5" cy="161.6" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,145c9.3,0,16.9,7.5,16.9,16.9c0,1.4-0.2,2.7-0.5,3.9" />

				<circle style={indicatorBGStyle} cx="264.3" cy="215.1" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,198.2c9.3,0,16.9,7.5,16.9,16.9c0,6.9-4.1,12.8-10,15.4" />

				<circle style={indicatorBGStyle} cx="374.8" cy="215.1" r="16.9" />
				<circle style={indicatorLineStyle} cx="374.8" cy="215.1" r="16.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="215.1" r="16.9" />
				<circle style={indicatorLineStyle} cx="480.5" cy="215.1" r="16.9" />

				<circle style={indicatorBGStyle} cx="264.3" cy="268.3" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,251.5c2.7,0,5.2,0.6,7.5,1.7" />

				<circle style={indicatorBGStyle} cx="374.8" cy="268.3" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,251.5c2.8,0,5.4,0.7,7.7,1.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="268.3" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,251.5c2.3,0,4.5,0.5,6.6,1.3" />
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}

function StudentOverview() {
	const transformationSettings = useIdentityTransformationSettings(600, 300)

	const blockStyle = { fill: '#e2e2e2' }
	const skillStyle = { fill: '#ededed' }
	const blockTextStyle = { fontSize: '16px', fontFamily: 'roboto' }
	const headStyle = { ...blockTextStyle, fontWeight: 'bold' }
	const indicatorTextStyle = { ...blockTextStyle, fontSize: '9px', fontWeight: 600 }
	const indicatorBGStyle = { fill: 'none', stroke: '#a9a9a9', strokeWidth: '4px' }
	const indicatorLineStyle = { ...indicatorBGStyle, stroke: '#000000' }
	const arrowActiveStyle = { fill: 'none', stroke: '#000000', strokeWidth: '2px' }
	const arrowInactiveStyle = { ...arrowActiveStyle, opacity: 0.2 }
	const flaskBGStyle = { fill: '#d3d3d3' }
	const flaskContentStyle = { fill: '#414141' }

	return <TranslationSection entry="studentOverviewImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<Element position={[30.5, 14]} style={headStyle} anchor={[0, 0.5]}><Translation entry="student">Alex Adams</Translation></Element>
				<Element position={[264.3, 14]} style={headStyle}><Translation entry="head1">Mastery</Translation></Element>
				<Element position={[374.8, 14]} style={headStyle}><Translation entry="head2">Exercises</Translation></Element>
				<Element position={[480.5, 14]} style={headStyle}><Translation entry="head3">Time spent</Translation></Element>

				<path style={blockStyle} d="M582.9,68.6c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10V40.9c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V68.6z" />
				<path style={blockStyle} d="M582.9,122c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10V94.3c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V122z" />
				<path style={skillStyle} d="M582.9,175.4c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V175.4z" />
				<path style={skillStyle} d="M582.9,228.8c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V228.8z" />
				<path style={blockStyle} d="M582.9,282.2c0,5.5-4.5,10-10,10H24.9c-5.5,0-10-4.5-10-10v-27.7c0-5.5,4.5-10,10-10h548.1c5.5,0,10,4.5,10,10V282.2z" />

				<Element position={[30.5, 54.8]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block1">Opening week</Translation></Element>
				<Element position={[30.5, 108.2]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block2">Middle week</Translation></Element>
				<Element position={[30.5, 161.6]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="skill1">Some basic skill</Translation></Element>
				<Element position={[30.5, 215.1]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="skill2">A more advanced skill</Translation></Element>
				<Element position={[30.5, 268.4]} anchor={[0, 0.5]} style={blockTextStyle}><Translation entry="block3">Closing week</Translation></Element>

				<Element position={[264.3, 54.8]} style={indicatorTextStyle}>3/3</Element>
				<Element position={[374.8, 54.8]} style={indicatorTextStyle}>11</Element>
				<Element position={[480.5, 54.8]} style={indicatorTextStyle}>2:51</Element>
				<Element position={[264.3, 108.2]} style={indicatorTextStyle}>1/2</Element>
				<Element position={[374.8, 108.2]} style={indicatorTextStyle}>7</Element>
				<Element position={[480.5, 108.2]} style={indicatorTextStyle}>3:23</Element>
				<Element position={[264.3, 161.6]} style={{ ...indicatorTextStyle, color: '#ffffff' }}>68%</Element>
				<Element position={[374.8, 161.6]} style={indicatorTextStyle}>2</Element>
				<Element position={[480.5, 161.6]} style={indicatorTextStyle}>0:35</Element>
				<Element position={[264.3, 215.0]} style={indicatorTextStyle}>21%</Element>
				<Element position={[374.8, 215.0]} style={indicatorTextStyle}>5</Element>
				<Element position={[480.5, 215.0]} style={indicatorTextStyle}>2:48</Element>
				<Element position={[264.3, 268.4]} style={indicatorTextStyle}>0/3</Element>
				<Element position={[374.8, 268.4]} style={indicatorTextStyle}>1</Element>
				<Element position={[480.5, 268.4]} style={indicatorTextStyle}>0:06</Element>

				<polyline style={arrowActiveStyle} points="552,105.1 559.1,112.1 566.2,105.1 " />
				<polyline style={arrowInactiveStyle} points="566.2,58.3 559.1,51.2 552,58.3 " />
				<polyline style={arrowInactiveStyle} points="566.2,271.9 559.1,264.8 552,271.9 " />

				<circle style={indicatorBGStyle} cx="264.3" cy="54.8" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,37.9c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-6.1,0-11.4-3.2-14.4-8.1" />

				<circle style={indicatorBGStyle} cx="374.8" cy="54.8" r="16.9" />
				<circle style={indicatorLineStyle} cx="374.8" cy="54.8" r="16.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="54.8" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,37.9c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-9.3,0-16.9-7.5-16.9-16.9c0-2.4,0.5-4.6,1.4-6.6" />

				<circle style={indicatorBGStyle} cx="264.3" cy="108.2" r="16.9" />
				<path style={indicatorLineStyle} d="M264.3,91.8c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9" />

				<circle style={indicatorBGStyle} cx="374.8" cy="108.2" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,91.8c9.3,0,16.9,7.5,16.9,16.9s-7.5,16.9-16.9,16.9c-5.2,0-9.8-2.3-12.9-6" />

				<circle style={indicatorBGStyle} cx="480.5" cy="108.2" r="16.9" />
				<circle style={indicatorLineStyle} cx="480.5" cy="108.2" r="16.9" />

				<circle style={flaskBGStyle} cx="264.3" cy="161.6" r="18.8" />
				<path style={flaskContentStyle} d="M247.3,153.6c-1.2,2.5-1.9,5.3-1.9,8.2c0,10.4,8.4,18.9,18.9,18.9c10.4,0,18.9-8.4,18.9-18.9c0-3-0.7-5.7-1.9-8.2H247.3z" />

				<circle style={indicatorBGStyle} cx="374.8" cy="161.6" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,145c9.3,0,16.9,7.5,16.9,16.9c0,6.4-3.6,12-8.9,14.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="161.6" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,145c8,0,14.6,5.5,16.4,12.9" />

				<circle style={flaskBGStyle} cx="264.3" cy="215.1" r="18.8" />
				<path style={flaskContentStyle} d="M248.4,225.1c3.3,5.2,9.2,8.7,15.9,8.7c6.7,0,12.5-3.5,15.9-8.7H248.4z" />

				<circle style={indicatorBGStyle} cx="374.8" cy="215.1" r="16.9" />
				<circle style={indicatorLineStyle} cx="374.8" cy="215.1" r="16.9" />

				<circle style={indicatorBGStyle} cx="480.5" cy="215.1" r="16.9" />
				<circle style={indicatorLineStyle} cx="480.5" cy="215.1" r="16.9" />

				<circle style={indicatorBGStyle} cx="264.3" cy="268.3" r="16.9" />

				<circle style={indicatorBGStyle} cx="374.8" cy="268.3" r="16.9" />
				<path style={indicatorLineStyle} d="M374.8,251.5c3.6,0,7,1.2,9.8,3.1" />

				<circle style={indicatorBGStyle} cx="480.5" cy="268.3" r="16.9" />
				<path style={indicatorLineStyle} d="M480.5,251.5c1.6,0,3.2,0.2,4.7,0.7" />
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}

function StudentSearch() {
	const transformationSettings = useIdentityTransformationSettings(400, 170)
	const blockStyle = { fill: '#e4e4e4' }
	const nameStyle = { fontSize: '13px', fontFamily: 'roboto' }

	return <TranslationSection entry="studentSearchImage">
		<Drawing transformationSettings={transformationSettings}>
			<SvgPortal>
				<path style={{ fill: '#ffffff', stroke: '#000000' }} d="M381,36.6c0,5.5-4.5,10-10,10H29.6c-5.5,0-10-4.5-10-10V25.2c0-5.5,4.5-10,10-10H371c5.5,0,10,4.5,10,10V36.6z" />

				<path style={{ fill: '#bebebe' }} d="M38.9,33.8h-0.8l-0.3-0.3c1-1.1,1.6-2.6,1.6-4.2c0-3.6-2.9-6.5-6.5-6.5s-6.5,2.9-6.5,6.5s2.9,6.5,6.5,6.5
				c1.6,0,3.1-0.6,4.2-1.6l0.3,0.3v0.8l5,5l1.5-1.5L38.9,33.8z M32.9,33.8c-2.5,0-4.5-2-4.5-4.5c0-2.5,2-4.5,4.5-4.5c2.5,0,4.5,2,4.5,4.5C37.4,31.7,35.4,33.8,32.9,33.8"/>

				<text transform="matrix(1 0 0 1 49.3966 36.1551)" style={{ fill: '#bebebe', fontSize: '16px', fontFamily: 'roboto' }}><Translation entry="search">Search</Translation></text>

				<Element position={[75.9, 136]} style={nameStyle}><Translation entry="name1">Alex Adams</Translation></Element>
				<Element position={[199.4, 136]} style={nameStyle}><Translation entry="name2">Bob Baker</Translation></Element>
				<Element position={[322.8, 136]} style={nameStyle}><Translation entry="name3">Carmen Clarke</Translation></Element>
				<Element position={[75.9, 102]} style={nameStyle} scale={2}><Student /></Element>
				<Element position={[199.4, 102]} style={nameStyle} scale={2}><Student /></Element>
				<Element position={[322.8, 102]} style={nameStyle} scale={2}><Student /></Element>

				<path style={blockStyle} d="M132.1,144.3c0,5.5-4.5,10-10,10H29.6c-5.5,0-10-4.5-10-10V71.1c0-5.5,4.5-10,10-10h92.5c5.5,0,10,4.5,10,10V144.3z" />
				<path style={blockStyle} d="M255.6,144.3c0,5.5-4.5,10-10,10h-92.5c-5.5,0-10-4.5-10-10V71.1c0-5.5,4.5-10,10-10h92.5c5.5,0,10,4.5,10,10V144.3z" />
				<path style={blockStyle} d="M381,144.3c0,5.5-4.5,10-10,10h-92.5c-5.5,0-10-4.5-10-10V71.1c0-5.5,4.5-10,10-10H371c5.5,0,10,4.5,10,10V144.3z" />
			</SvgPortal>
		</Drawing>
	</TranslationSection>
}