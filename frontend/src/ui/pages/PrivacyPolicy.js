import React from 'react'

import { Translation, TranslationCatalog } from '@step-wise/i18n'

import { infoEmail } from 'settings'
import { Head, Link, List, Par, SubHead } from 'ui/components'

export function PrivacyPolicy() {
	return <TranslationCatalog folder={['pages']} name="privacyPolicy">
		<Par><Translation id="intro">This document outlines the way the Step-Wise app (later referred to as "we", "our" or "us") deals with the data of its users (referred to as "you" or "your") and related privacy matters.</Translation></Par>

		<Translation id="section1">
			<Head>1. Version</Head>
			<Par>This is version 1.3 of the Privacy Policy. It was last updated on 2026-11-21.</Par>
			<Par>The English version of this Privacy Policy is authoritative. Translations are provided for convenience. If a translation differs from the English version, the English version prevails.</Par>
		</Translation>

		<Translation id="section2">
			<Head>2. Main philosophy</Head>
			<Par>Our privacy policy is based on two principles:</Par>
			<List>
				<List.Item><strong>Need to know:</strong> you only get access to the specific data you need to accomplish your goals.</List.Item>
				<List.Item><strong>Ask when required:</strong> only when you perform an action that will give others access to your data (like logging in or enrolling in a course) do we ask you for approval. Not before, and not after.</List.Item>
			</List>
		</Translation>

		<Translation id="section3">
			<Head>3. Legal basis</Head>
			<Par>We process your personal data on the legal basis of Article 6(1)(b) GDPR — performance of a contract, as the processing is necessary to provide the Step-Wise app. In addition to Article 6(1)(b) GDPR (performance of a contract), certain processing activities rely on additional legal bases:</Par>
			<List>
				<List.Item>Non-essential email notifications (such as reminders and newsletters) are processed on the basis of your consent under Article 6(1)(a), which you may withdraw at any time through your notification settings.</List.Item>
				<List.Item>Strictly necessary cookies are used under Article 6(1)(f) GDPR (legitimate interest), as they are required to provide the service.</List.Item>
				<List.Item>Research is conducted only with fully anonymized data. As anonymized data is no longer personal data, GDPR does not apply to research use.</List.Item>
			</List>
			<Par>You have the right to lodge a complaint with the <Link to="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noreferrer">Data Protection Authority</Link> (Autoriteit Persoonsgegevens) in the Netherlands.</Par>
		</Translation>

		<Translation id="section4">
			<Head>4. Information we collect</Head>
			<Par>When you do not log in to the website, Step-Wise does not create an account-linked profile or use cookies for analytics, tracking, marketing or advertising. Our web server and hosting infrastructure may nevertheless process limited technical information, such as your IP address, the requested page, the time of the request and browser information. We use this information only to operate and secure the service and to diagnose technical problems.</Par>

			<SubHead>Logging in: third-party identity provider data</SubHead>
			<Par>Step-Wise uses third-party identity providers (primarily Google and SURFconext) to authenticate users. These identity providers act as independent data controllers under GDPR and process your data for their own purposes, such as account management, security and fraud prevention. For more information, please consult the <Link to="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</Link> and the <Link to="https://servicedesk.surf.nl/wiki/spaces/IAM/pages/74225480/Privacy+Policy+SURFconext+EN" target="_blank" rel="noreferrer">SURFconext Privacy Policy</Link>.</Par>
			<Par>The information shared with Step-Wise depends on the provider.</Par>
			<List>
					<List.Item>Google shares your verified email address and may share your name and profile information.</List.Item>
					<List.Item>SURFconext shares your identifying code and email address and may share your name, organization, organization role, organization identifier and preferred language.</List.Item>
			</List>
			<Par>We use this information only to create, identify or update your Step-Wise account and provide the Step-Wise service. Step-Wise does not receive your password or other authentication credentials. We do not use Google sign-in to access Gmail, Google Drive, Google Calendar or other Google services, and we do not sell identity-provider data or disclose it to third parties except as described in this policy.</Par>

			<SubHead>Account information stored by Step-Wise</SubHead>
			<Par>Once an identity provider shares information with us, Step-Wise acts as an independent data controller for the data we receive. Depending on the identity provider and the information available for your account, we store some or all of the following information.</Par>
			<List>
					<List.Item>An ID code: to uniquely identify you.</List.Item>
					<List.Item>Name-related information (first name, last name, etcetera): to properly address you.</List.Item>
					<List.Item>E-mail address: used to send potential notifications, updates to this privacy policy, etcetera.</List.Item>
					<List.Item>Organization (which university/school): used to recommend relevant courses.</List.Item>
					<List.Item>Organization role (student, teacher, etcetera): used to determine who can create new courses.</List.Item>
					<List.Item>Organization ID (student/employee number): used in case a course teacher needs a data export of the performance of the students in the respective course.</List.Item>
					<List.Item>Preferred language: to offer content in the right language, when appropriate.</List.Item>
			</List>

			<SubHead>Exercise practice data</SubHead>
			<Par>Step-Wise is an online platform that keeps track of which skills students have mastered and which skills they are struggling with. To accomplish this, the following information is tracked.</Par>
			<List>
					<List.Item>Exercise data: all exercises that you do and all submissions you make will be remembered.</List.Item>
					<List.Item>Skill data: estimates will be made about your skill level. These estimates are also stored.</List.Item>
			</List>

			<SubHead>Other information</SubHead>
			<Par>The regular operation of the website requires various other trivial information to be recorded. Examples include:</Par>
			<List>
					<List.Item>Site settings and preferences.</List.Item>
					<List.Item>Course enrollments and related data.</List.Item>
					<List.Item>Approvals when you indicate other users (like teachers) may access your data.</List.Item>
					<List.Item>Other trivial information related to the regular usage of the Step-Wise app.</List.Item>
			</List>
		</Translation>

		<Translation id="section5">
			<Head>5. Usage of your information</Head>
			<Par>We use your information for the regular functioning of the Step-Wise app. That is: your data influences what you see in the app. It also influences potential email notifications you may receive, all subject to your notification preferences.</Par>

			<SubHead>Showing data to other Step-Wise users</SubHead>
			<Par>Your personal data is never shown to other Step-Wise users without your express consent. In various cases, we do ask you for this consent. For example, if you enroll in a course, you are asked if the course teachers may access your progress with the course. If you do not provide consent, you may not be able to access the relevant app functionalities.</Par>

			<SubHead>Using data for research</SubHead>
			<Par>At Step-Wise we continuously strive to improve education. To do so, we use bulk data from students for research purposes, with the specific goal of understanding better how people learn and how we can improve the learning process. When we do so, we always make all data anonymous before any sharing takes place: no identifiable data will be used. Anonymized research data may at times be shared with trusted research partners. Research results may be published in journals or likewise publication platforms.</Par>

			<SubHead>Exposing data to third parties</SubHead>
			<Par>We share personal data only with:</Par>
			<List>
					<List.Item>DigitalOcean (our hosting provider and data processor).</List.Item>
					<List.Item>Third-party identity providers you choose to authenticate with (such as Google and SURFconext), who act as independent controllers.</List.Item>
					<List.Item>Our email provider, solely for sending service-related communications (if applicable).</List.Item>
			</List>
			<Par>We will never provide non-anonymized personal data to other third parties for their own purposes without your express consent.</Par>
		</Translation>

		<Translation id="section6">
			<Head>6. Storage of your data and possible breaches</Head>
			<Par>We use DigitalOcean LLC as our hosting provider. DigitalOcean acts as a data processor under the GDPR. DigitalOcean processes personal data solely on our behalf and in accordance with our instructions.</Par>
			<Par>By using DigitalOcean's services under their Customer Terms of Service, we rely on DigitalOcean's publicly available <Link to="https://www.digitalocean.com/legal/data-processing-agreement" target="_blank" rel="noreferrer">Data Processing Agreement (DPA)</Link>. A copy of this DPA is available at their website.</Par>
			<Par>If a personal data breach occurs, we assess the resulting risk to the rights and freedoms of affected people. Unless the breach is unlikely to result in such a risk, we notify the relevant supervisory authority without undue delay and, where feasible, within 72 hours after becoming aware of the breach. If the breach is likely to result in a high risk, we also notify the affected people without undue delay. We document all personal data breaches, including those that do not need to be reported.</Par>
		</Translation>

		<Translation id="section7">
			<Head>7. International data transfers</Head>
			<Par>Step-Wise's primary application data is stored on DigitalOcean servers in Amsterdam. Some service providers, including Google, DigitalOcean and their subprocessors, may process or access personal data outside the European Economic Area (EEA).</Par>
			<Par>Where personal data is transferred outside the EEA, we ensure that the transfer complies with GDPR Chapter V. Depending on the recipient and destination, this may rely on a European Commission adequacy decision, including the EU-US Data Privacy Framework for participating organizations, or on appropriate safeguards such as the European Commission's Standard Contractual Clauses (SCCs).</Par>
		</Translation>

		<Translation id="section8">
			<Head>8. Children under 13</Head>
			<Par>The Step-Wise app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are under 13, please do not provide any information to the Step-Wise app.</Par>
		</Translation>

		<Translation id="section9">
			<Head>9. Usage of cookies</Head>
			<Par>Step-Wise makes minimal use of cookies. We use only strictly necessary cookies that are required for the functioning of the Step-Wise app, such as authentication cookies and preference cookies.</Par>
			<Par>These cookies are essential to provide the service and cannot be disabled as they are necessary for:</Par>
			<List>
				<List.Item>Logging in.</List.Item>
				<List.Item>Maintaining your session.</List.Item>
				<List.Item>Storing technical preferences.</List.Item>
			</List>
			<Par>Because these cookies are strictly necessary, GDPR and the ePrivacy Directive do not require us to ask for your consent. We do not use cookies for analytics, tracking, marketing, or advertising.</Par>
		</Translation>

		<Translation id="section10">
			<Head>10. Removal of data</Head>
			<Par>If you do not wish to use Step-Wise anymore, you are able to remove all data. To do so, delete your account through the Step-Wise app. This will erase all personal data that we have stored of you from our servers. Note that this action is irreversible: the data cannot be retrieved afterwards.</Par>
			<Par>Step-Wise uses your actions related to exercises, courses and similar to build a model of your skill level on various skills. Because your exercise history and skill model are technically interconnected, it is not feasible to remove specific parts of these data sets without impairing the functioning of the service. If you wish to exercise your right to erasure, you may delete your account, which removes all personal data.</Par>
			<Par>As long as you do not delete your account, your data will continue to be stored. This includes account information (name, email, etcetera), exercise and skill data (including the above-mentioned skill model), and functional data like course subscriptions and given permissions. If no activity has been taken for more than 36 months, your account will be considered inactive and the account including all personal data may be deleted without prior notification.</Par>
			<Par>Support emails and direct communications with our support team are retained for up to 24 months for the purpose of resolving your inquiry and improving service quality. After this period they are deleted, unless we are legally required to keep them longer.</Par>
		</Translation>

		<Translation id="section11">
			<Head>11. Loss of data</Head>
			<Par>Step-Wise performs regular back-ups of all relevant data. In case of a data loss, attempts will be made to restore this data from back-ups. If data is nevertheless permanently lost or otherwise not realistically retrievable, then Step-Wise or any associated organizations are not liable for any resulting damages.</Par>
		</Translation>

		<Translation id="section12">
			<Head>12. Communication</Head>
			<Par>We will use your email address to send you crucial Step-Wise-related information, like updates to the privacy policy, changes of ownership of Step-Wise, and other matters directly affecting the functioning of the Step-Wise app. It is not possible to opt out of these crucial emails, except for the complete removal of your Step-Wise account.</Par>
			<Par>We may use your email address to send you non-crucial notifications related to the website. Think of reminders to practice, notifications of approaching course deadlines, newsletters and similar. It is always possible to opt out of non-crucial emails through the notification settings.</Par>
			<Par>We will never use your email address for non-crucial messages that you cannot opt out of. Nor will we share your email address with third parties without your express consent.</Par>
			<Par>If you email us with a problem/question, from the email address that is connected to your account, our support officers may check your data to help you resolve your problem/question. This data may be used in a reply to you, but is otherwise not recorded.</Par>
		</Translation>

		<Translation id="section13">
			<Head>13. Business transfers</Head>
			<Par>In the off-chance that Step-Wise buys, merges or partners with or is sold to other companies or businesses, all Step-Wise functioning and data may be passed along with the transaction. When this happens, you will be notified of this through the email address that is known to us, at least two weeks prior to said transaction. If you do not approve of this transaction, you will be able to delete your account and remove all your data.</Par>
		</Translation>

		<Translation id="section14">
			<Head>14. Future changes to this privacy policy</Head>
			<Par>We may update this Privacy Policy as necessary to reflect changes we make and to satisfy legal requirements. In case of significant changes relating to you, we will provide you with appropriate notice.</Par>
			<List>
				<List.Item>For changes relating only to future interaction with the Step-Wise app, we will ask you, when you log in again, whether you approve of the new Privacy Policy.</List.Item>
				<List.Item>If the changes also encompass passive users, you will be notified through the email address you provided, at least two weeks prior to the effective date of the revised Privacy Policy.</List.Item>
			</List>
			<Par>Changes take immediate effect: users have to approve the new version of the Privacy Policy to continue using the app. If you do not agree with the revised Privacy Policy, you will be able to delete your account, removing all your data from the Step-Wise servers.</Par>
		</Translation>

		<Translation id="section15">
			<Head>15. Data controller</Head>
			<Par>The data controller for Step-Wise is Hildo Bijl, residing at Geldropseweg 198-02, 5643 TP Eindhoven, The Netherlands. The data controller can be contacted through <a href={`mailto:${infoEmail}`}>{{ infoEmail }}</a>.</Par>
		</Translation>

		<Translation id="section16">
			<Head>16. User rights</Head>
			<Par>Compliant to GDPR, users have the right to:</Par>
			<List>
				<List.Item>Access their data.</List.Item>
				<List.Item>Rectify their data.</List.Item>
				<List.Item>Erase their data ("right to be forgotten").</List.Item>
				<List.Item>Restrict processing.</List.Item>
				<List.Item>Object to processing.</List.Item>
				<List.Item>Data portability.</List.Item>
				<List.Item>Withdraw consent.</List.Item>
				<List.Item>Lodge a complaint with a supervisory authority.</List.Item>
			</List>
			<Par>Most of the above items can be directly done through the Step-Wise app. For any other legal requests, contact the data controller.</Par>
		</Translation>

		<Translation id="section17">
			<Head>17. Dispute resolution</Head>
			<Par>If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, contact the data controller mentioned above. We will investigate and attempt to resolve complaints and disputes regarding the use and disclosure of personal information in accordance with this privacy policy and GDPR regulations.</Par>
		</Translation>
	</TranslationCatalog>
}
