import React from 'react'
import { Link } from 'react-router-dom'

import { infoEmail } from 'settings'
import { TranslationSection, Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { Par, Head, List } from 'ui/components'

import { PageTranslationFile } from '../PageTranslationFile'

export function About() {
	const paths = usePaths()
	return <PageTranslationFile page="explainers/about">
		<Par><Translation entry="intro">Step-Wise is a free tutoring web-app that brushes up mathematics, physics and/or mechanics skills to (pre-)university level. Want to know how it works? Then read the dedicated pages <Link to={paths.forStudents()}>for students</Link> and <Link to={paths.forTeachers()}>for teachers</Link>. Below you find more historic and technical information about Step-Wise.</Translation></Par>

		<TranslationSection entry="contact">
			<Head><Translation entry="head">Contact us</Translation></Head>
			<Par><Translation entry="par1">Want to report a bug? Ask for a new feature? Or simply have an interesting discussion on education? Whatever the reason: we're always open for a quick exchange of ideas! Just send an email to <a href={`mailto:${infoEmail}`}>{{ infoEmail }}</a> (Hildo) and you'll get a reply within the day.</Translation></Par>
		</TranslationSection>

		<TranslationSection entry="origins">
			<Head><Translation entry="head">Step-Wise origins</Translation></Head>
			<Par><Translation entry="par1">In 2020, when the corona pandemic hit, everyone was stuck at home. Sure, teachers could provide digital lectures, but the more useful practice sessions were not. You can't exactly quickly look over a student's shoulder and give feedback through a video connection. Students were missing out on proper support.</Translation></Par>
			<Par><Translation entry="par2">With too much time available during the lock-down, Utrecht University of Applied Sciences teacher <a href="https://www.hildobijl.com/" target="_blank" rel="noreferrer">Hildo Bijl</a> decided to program a small web app that could provide at least some support and coaching. And so Step-Wise was born.</Translation></Par>
			<Par><Translation entry="par3">During the first year the focus was on basic thermodynamics. Students were very enthusiastic, especially about the infinite practice material, the intuitive input, and the automated feedback provided by the intelligent physics engine. As a result, the next year also mathematics and engineering mechanics subjects were added. The amount of content grew steadily.</Translation></Par>
			<Par><Translation entry="par4">With the pandemic subsiding, students went back into the classroom. It turned out that Step-Wise also added significant value there. With the app supporting students and automatically answering most questions, teachers had more time available to support the students that had bigger struggles than could be solved by a web-app. On top of that, a collaboration mode was added so that students could also practice together during classroom sessions.</Translation></Par>
			<Par><Translation entry="par5">In 2023 Hildo moved to Germany, which led to Step-Wise being available in both English and German as well, on top of Dutch. Various trial applications arose at the Bochum University of Applied Sciences. Slowly more functionalities are being added, allowing multiple universities across various countries to use Step-Wise simultaneously in a fluent manner.</Translation></Par>
		</TranslationSection>

		<TranslationSection entry="technical">
			<Head><Translation entry="head">Technical details</Translation></Head>
			<Par><Translation entry="par1">The Step-Wise app is a so-called <strong>Progressive Web App</strong>: a website that can pretend to be a smartphone app too. It is designed for usage on a laptop, but it can also be added to the home screen of your smartphone.</Translation></Par>
			<Par><Translation entry="par2">Do you want to know more about how it works behind the scenes? The app is open-source, so all source code is available on the <a href="https://github.com/HildoBijl/stepwise" target="_blank" rel="noreferrer">GitHub repository</a>. But we'll briefly give you the summary.</Translation></Par>
			<Translation entry="list"><List items={[
				<><strong>Front-end:</strong> The front side of the app is made using <a href="https://react.dev/" target="_blank" rel="noreferrer">React</a> on top of the <a href="https://create-react-app.dev/" target="_blank" rel="noreferrer">Create-React-App</a>. This allows us to easily add interactive elements.</>,
				<><strong>Design:</strong> The looks of the app are based on the <a href="https://mui.com/material-ui/" target="_blank" rel="noreferrer">Material UI guidelines</a>, with styling done through <a href="https://cssinjs.org/?v=v10.10.0" target="_blank" rel="noreferrer">JSS</a>.</>,
				<><strong>Images:</strong> Not being satisfied with existing tools, we have developed our own <a href="https://github.com/HildoBijl/stepwise/tree/master/frontend/src/ui/figures" target="_blank" rel="noreferrer">easy-to-use toolbox</a> to dynamically generate simple web images, ranging from mathematical geometries to interactive plots.</>,
				<><strong>Equations:</strong> Mathematical expressions and equations are rendedered using <a href="https://katex.org/" target="_blank" rel="noreferrer">KaTeX</a>, although we have added our own plug-ins to easily convert equations and physics quantities into TeX code.</>,
				<><strong>Mathematics/physics:</strong> Wanting to stick to only one programming language (Javascript), no suitable Computer Algebra System (CAS) was available. So we have set up <a href="https://github.com/HildoBijl/stepwise/tree/master/shared/CAS" target="_blank" rel="noreferrer">our own CAS</a>, including a physics engine, to handle all evaluations in Step-Wise.</>,
				<><strong>Back-end:</strong> When an exercise is submitted, it is sent to our <a href="https://graphql.org/" target="_blank" rel="noreferrer">GraphQL API</a> to be evaluated. This API runs on <a href="https://www.apollographql.com/" target="_blank" rel="noreferrer">Apollo</a>.</>,
				<><strong>Server:</strong> We use a server based in Amsterdam, provided and maintained by <a href="https://www.digitalocean.com/" target="_blank" rel="noreferrer">DigitalOcean</a>.</>,
				<><strong>Database:</strong> All user data is stored in a <a href="https://www.postgresql.org/" target="_blank" rel="noreferrer">PostgreSQL database</a>. It is kept up-to-date and secure by <a href="https://www.digitalocean.com/" target="_blank" rel="noreferrer">DigitalOcean</a>.</>,
			]} /></Translation>
			<Par><Translation entry="par3">With Step-Wise being open source, everyone can contribute too. Do you want to get involved? (With or without programming knowledge.) Then drop us a note at <a href={`mailto:${infoEmail}`}>{{ infoEmail }}</a> and we'll see what's possible!</Translation></Par>
		</TranslationSection>

		<TranslationSection entry="privacy">
			<Head><Translation entry="head">Privacy</Translation></Head>
			<Par><Translation entry="par1">At Step-Wise we take your privacy seriously. Proper user data handling is built into every part of the app. It's based on two fundamental ideas.</Translation></Par>
			<Translation entry="list"><List items={[
				<><strong>Need to know:</strong> You only get access to the data that you need to do what you want to do. Nothing more, nothing less.</>,
				<><strong>Ask when needed:</strong> When you engage in an action that allows others to access some of your data (like registering for a course) we will note this and ask for your permission at that exact moment. Not before, and certainly not after.</>
			]} /></Translation>
			<Par><Translation entry="par2">This gives you a fluent user experience, while at the same time keeping your data secure. Want to know more about how we treat your data? Then check out our full <a href={`${process.env.PUBLIC_URL}/PrivacyPolicy.pdf`} target="_blank" rel="noreferrer">Privacy Policy</a>. This is also the policy you approve of when first logging in.</Translation></Par>
		</TranslationSection>
	</PageTranslationFile>
}
