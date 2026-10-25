import React from 'react'

import { Translation } from '@step-wise/i18n'

// groupPossibilities is a React list of possibilities that group members have. It is shown at various points in the app.
export const groupPossibilities = [
	<Translation folder={['pages']} catalog="groups" group={['groupPossibilities']} id="entry1">See who is active in the group and whether they are online/active.</Translation>,
	<Translation folder={['pages']} catalog="groups" group={['groupPossibilities']} id="entry2">At exercises: view the submissions of other group members.</Translation>,
	<Translation folder={['pages']} catalog="groups" group={['groupPossibilities']} id="entry3">Get suggestions on which skill is best to practice, also based on the level of other active group members.</Translation>
]
