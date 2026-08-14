import { defineApiModule } from '../types.js'

import { createSurfConextProfileModel } from './model.js'

export const authenticationModule = defineApiModule({
	models: { SurfConextProfile: createSurfConextProfileModel },
	associate: models => {
		models.SurfConextProfile.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
	},
})

export * as Google from './google/index.js'
export * as SurfConext from './surfConext/index.js'
export * from './model.js'
export * from './routes.js'
