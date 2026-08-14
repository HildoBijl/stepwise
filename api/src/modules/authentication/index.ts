import { defineApiModule } from '../types.ts'

import { createSurfConextProfileModel } from './model.ts'

export const authenticationModule = defineApiModule({
	models: { SurfConextProfile: createSurfConextProfileModel },
	associate: models => {
		models.SurfConextProfile.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
	},
})

export * as Google from './google/index.ts'
export * as SurfConext from './surfConext/index.ts'
export * from './model.ts'
export * from './routes.ts'
