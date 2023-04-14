import { MenuBook as Book, OndemandVideo as Video, Create as Pencil, AttachFile as Paperclip, Info } from '@material-ui/icons'

import { applyToEachParameter } from 'step-wise/util/objects'

import { Books, Sqrt, BulletList, Teacher } from 'ui/components/icons'

const tabData = {
	theory: {
		icon: Book,
		title: 'Theorie',
	},
	background: {
		icon: Books,
		title: 'Achtergrond',
	},
	video: {
		icon: Video,
		title: 'Video',
	},
	summary: {
		icon: BulletList,
		title: 'Samenvatting',
	},
	example: {
		icon: Teacher,
		title: 'Voorbeeld',
	},
	practice: {
		icon: Pencil,
		title: 'Oefenen',
	},
	formulas: {
		icon: Sqrt,
		title: 'Formules',
	},
	references: {
		icon: Paperclip,
		title: 'Bijlagen',
	},
	meta: {
		icon: Info,
		title: 'Meta-info',
	},
}

// Apply post-processing.
applyToEachParameter(tabData, (tab, id) => {
	tab.id = id
})

// Export the result.
export default tabData
