import React from 'react'

import { useUser } from 'api'

import { Translation, Check } from 'i18n'
import { Head, Par, List, Term, Warning } from 'ui/components'

export function Theory() {
	const isLoggedIn = !!useUser()
	return <>
		<Translation entry="intro">
			<Par>Welcome to the Step-Wise tutorial! Here you can learn how the web-app is set up and freely play around with the main functionalities.</Par>
			<Warning>Honestly, don't do this tutorial. This is the 21st century. Apps should be intuitive enough to not need a manual or tutorial, and Step-Wise certainly meets those requirements. Or if you really want to do the tutorial, just play around with the exercises and only check the theory in the unlikely case that you get stuck. Learn by doing.</Warning>
		</Translation>

		<Translation entry="skills">
			<Head>Skills</Head>
			<Par>Step-Wise is structured around the concept of <Term>skills</Term>. Every skill is something that you can actually do. For instance (like for this skill) simply entering a number into a field.</Par>
			<Par>For every skill we estimate the <Term>likelihood</Term> that you will do it correctly. We developed our own probability theory script for this, which takes into account lots of different factors. <Check value={isLoggedIn}><Check.True>For you it's simple: you can always see the success chance through the skill orb in the top right corner. Feel free to hover over it for more information.</Check.True><Check.False>If you were logged in, you could also see that success chance in the top right corner of the screen.</Check.False></Check></Par>
		</Translation>

		<Translation entry="exercises">
			<Head>Exercises</Head>
			<Par>To get better with a skill, you can practice with a variety of randomly generated <Term>exercises</Term>. There are two types.</Par>
			<List items={[
				<>The <Term>example exercises</Term> are basic exercises for free experimentation. You can view the solution in advance if you so desire. Playing around with them doesn't affect your ratings in any way.</>,
				<>The <Term>practice exercises</Term> are slightly more involved exercises to practice on. Every action you make there does effect your estimated success chance.</>
			]} />
			<Par>Go ahead and try it out! The Step-Wise input system is <Term>smartphone-compatible</Term> with our own internally designed keyboards. It's all easy to use. You'll figure it out.</Par>
			<Par>Once you've reached the goal set for the skill level, you'll get a notification that you can continue to the next skill. Keep on practicing until you've got it!</Par>
		</Translation>
	</>
}
