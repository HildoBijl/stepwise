import createUserModel from './models/User'
import createSurfConextProfileModel from './models/SurfConextProfile'
import createUserSkillModel from './models/UserSkill'
import createExerciseSampleModel from './models/ExerciseSample'
import createExerciseEventModel from './models/ExerciseEvent'

export class Database {
	constructor(sequelize) {
		this._sequelize = sequelize

		// Initialize all models
		this.User = createUserModel(sequelize)
		this.SurfConextProfile = createSurfConextProfileModel(sequelize)
		this.UserSkill = createUserSkillModel(sequelize)
		this.ExerciseSample = createExerciseSampleModel(sequelize)
		this.ExerciseEvent = createExerciseEventModel(sequelize)

		// Setup associations
		this.User.associate(this)
		this.SurfConextProfile.associate(this)
		this.UserSkill.associate(this)
		this.ExerciseSample.associate(this)
		this.ExerciseEvent.associate(this)
	}

	async transaction(procedure) {
		return await this._sequelize.transaction(procedure)
	}
}
