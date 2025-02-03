import { ID_GITHUB, SECRET_GITHUB } from '$util/env.ts'

import { GitHub } from 'arctic'

export default new GitHub(ID_GITHUB, SECRET_GITHUB, null)
