import { GITHUB_ID, GITHUB_SECRET } from '$env/static/private';

import { GitHub } from 'arctic';

export default new GitHub(GITHUB_ID, GITHUB_SECRET);