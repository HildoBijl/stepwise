import { defineApiModule } from '../types.ts'

import { type SurfConextProfileModel, createSurfConextProfileModel } from './model.ts'

declare module '../types.ts' {
	interface ApiModels {
		SurfConextProfile: SurfConextProfileModel
	}
}

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
