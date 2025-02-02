import { Hono } from 'hono'
import type { Router } from 'hono/router'
import { type Component } from 'svelte'

const router = new Hono().router as unknown as Router<Component>

const glob = import.meta.glob('./content/**.md', { eager: true })
const components = Object.entries(glob)
	.map(([name, value]) => {
		let newName = name.substring('./content'.length).slice(0, -'.md'.length)
		if (newName.endsWith('index')) newName = newName.slice(0, -'index'.length)
		return [newName, value] as const
	})
	.map(([name, value]) => {
		return [name, value.default] as const
	})

components.forEach(([path, component]) => router.add('get', path, component))

export function match(page: string) {
	const [[[component]]] = router.match('get', page)
	return component
}
