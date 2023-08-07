import { MenuBook as Book, OndemandVideo as Video, Create as Pencil, AttachFile as Paperclip, Info } from '@material-ui/icons'

import { applyMapping } from 'step-wise/util/objects'

import { Books, Sqrt, BulletList, Teacher } from 'ui/components/icons'

const tabData = {
	theory: {
		icon: Book,
		title: 'Theorie',
		order: 1,
	},
	video: {
		icon: Video,
		title: 'Video',
		order: 2,
	},
	background: {
		icon: Books,
		title: 'Achtergrond',
		order: 3,
	},
	summary: {
		icon: BulletList,
		title: 'Samenvatting',
		order: 4,
	},
	example: {
		icon: Teacher,
		title: 'Voorbeeld',
		order: 5,
	},
	practice: {
		icon: Pencil,
		title: 'Oefenen',
		order: 6,
	},
	formulas: {
		icon: Sqrt,
		title: 'Formules',
		order: 7,
	},
	references: {
		icon: Paperclip,
		title: 'Bijlagen',
		order: 8,
	},
	meta: {
		icon: Info,
		title: 'Meta-info',
		order: 9,
	},
}

// Apply post-processing.
applyMapping(tabData, (tab, id) => {
	tab.id = id
})

// Export the result.
export default tabData
