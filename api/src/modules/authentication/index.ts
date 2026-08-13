import { defineApiModule } from '../types'
import { createSurfConextProfileModel } from './model'

export const authenticationModule = defineApiModule({
	models: { SurfConextProfile: createSurfConextProfileModel },
	associate: models => {
		models.SurfConextProfile.belongsTo(models.User, { onDelete: 'CASCADE' })
		models.User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
	},
})

export * as Google from './google'
export * as SurfConext from './surfConext'
export * from './model'
export * from './routes'
