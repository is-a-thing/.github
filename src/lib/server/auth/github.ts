import { ID_GITHUB, SECRET_GITHUB } from '$env/static/private';
console.log(await import('$env/static/private'))
import { GitHub } from 'arctic';

export default new GitHub(ID_GITHUB, SECRET_GITHUB);