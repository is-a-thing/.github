import { Hono } from 'hono'
import type { Router } from 'hono/router'
import { type Component } from 'svelte'

const router = new Hono().router as unknown as Router<Component>

const glob = import.meta.glob('./content/**.md', { eager: true, import: 'default' })
const components = Object.entries(glob).map(([name, value]) => {
	let newName = name.substring('./content'.length).slice(0, -'.md'.length)
	if (newName.endsWith('index')) newName = newName.slice(0, -'/index'.length)
	console.log(newName)
	return [newName, value] as const
})

components.forEach(([path, component]) => router.add('get', path, component))

const TOC: {
	[x: string]:
		| {
				[y: string]: string
		  }
		| string
} = {}

Object.keys(glob).forEach((file) => {
	const pathParts = file.substring('./content/'.length).slice(0, -'.md'.length).split('/')
	let section: string
	let title: string

	if (pathParts.length === 1) {
		section = pathParts[0].replaceAll('-', ' ')
		if (pathParts[0] === 'index') return (TOC[section] = `/`)
		return (TOC[section] = `/${pathParts[0]}`)
	} else if (pathParts[1] === 'index') {
		section = pathParts[0].replaceAll('-', ' ')
		title = '_'
		pathParts.pop()
	} else {
		section = pathParts[0].replaceAll('-', ' ')
		title = (pathParts[1] || 'index').replaceAll('-', ' ')
	}
	const routePath = `/${pathParts.join('/')}`

	if (!TOC[section]) {
		TOC[section] = {}
	}
	TOC[section][title] = routePath
})

export function match(page: string) {
	const result = router.match('get', page)
	if (!result[0].length) return null
	const [[[component]]] = result
	return component
}

export { TOC }
