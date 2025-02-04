import { ID_GITHUB, SECRET_GITHUB } from '$util/env.ts'

import { GitHub } from '$auth/_github.ts'

export default new GitHub(ID_GITHUB, SECRET_GITHUB, null)
