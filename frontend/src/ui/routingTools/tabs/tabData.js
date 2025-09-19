import { MenuBook as Book, OndemandVideo as Video, Create as Pencil, AttachFile as Paperclip, Info } from '@mui/icons-material'

import { applyMapping } from 'step-wise/util'

import { Books, Sqrt, BulletList, Teacher } from 'ui/components/icons'

const tabData = {
	theory: {
		icon: Book,
		title: 'Theory',
		order: 1,
	},
	video: {
		icon: Video,
		title: 'Video',
		order: 2,
	},
	background: {
		icon: Books,
		title: 'Background',
		order: 3,
	},
	summary: {
		icon: BulletList,
		title: 'Summary',
		order: 4,
	},
	example: {
		icon: Teacher,
		title: 'Example',
		order: 5,
	},
	practice: {
		icon: Pencil,
		title: 'Practice',
		order: 6,
	},
	formulas: {
		icon: Sqrt,
		title: 'Formulas',
		order: 7,
	},
	references: {
		icon: Paperclip,
		title: 'Attachments',
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
export { tabData }
