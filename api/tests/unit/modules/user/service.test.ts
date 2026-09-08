import { describe, expect, it, vi } from 'vitest'
import { Op } from 'sequelize'

import { type UserDatabase, type UserRecord, USER_ACTIVITY_UPDATE_INTERVAL_MILLISECONDS, recordUserActivity } from '../../../../src/modules/user/index.ts'

function setup(updatedRows: number) {
	const update = vi.fn().mockResolvedValue([updatedRows])
	const db = { User: { update } } as unknown as UserDatabase
	const user = { id: 'user-id', lastActiveAt: new Date('2026-09-08T11:00:00.000Z') } as UserRecord
	return { db, update, user }
}

describe('user activity', () => {
	it('updates activity only when the stored value is more than thirty minutes old', async () => {
		const now = new Date('2026-09-08T12:00:00.000Z')
		const { db, update, user } = setup(1)
		await recordUserActivity(db, user, { now })

		expect(update).toHaveBeenCalledWith({ lastActiveAt: now }, {
			where: {
				id: user.id,
				lastActiveAt: { [Op.lt]: new Date(now.getTime() - USER_ACTIVITY_UPDATE_INTERVAL_MILLISECONDS) },
			},
		})
		expect(user.lastActiveAt).toBe(now)
	})

	it('skips the database update when the loaded activity is recent', async () => {
		const previousActivity = new Date('2026-09-08T11:45:00.000Z')
		const { db, update, user } = setup(0)
		user.lastActiveAt = previousActivity
		await recordUserActivity(db, user, { now: new Date('2026-09-08T12:00:00.000Z') })
		expect(update).not.toHaveBeenCalled()
		expect(user.lastActiveAt).toBe(previousActivity)
	})
})
