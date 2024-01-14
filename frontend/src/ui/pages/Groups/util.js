import React from 'react'

import { Translation } from 'i18n'

// This translationPath defines where the translations of the group pages are located.
export const translationPath = 'pages/groups'

// groupPossibilities is a React list of possibilities that group members have. It is shown at various points in the app.
export const groupPossibilities = [
	<Translation path={translationPath} entry="groupPossibilities.entry1">See who is active in the group and whether they are online/active.</Translation>,
	<Translation path={translationPath} entry="groupPossibilities.entry2">At exercises: view the submissions of other group members.</Translation>,
	<Translation path={translationPath} entry="groupPossibilities.entry3">Get suggestions on which skill is best to practice, also based on the level of other active group members.</Translation>
]
