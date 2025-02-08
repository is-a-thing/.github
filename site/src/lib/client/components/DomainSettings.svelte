<script lang=ts>
    import SuperDebug, { superForm, defaults } from 'sveltekit-superforms';
    import { zod } from 'sveltekit-superforms/adapters';

    import { domain as zodDomain, domainSettings } from "$lib/shared/schema"
	import { fetchAPI } from '../api'
    import { SvelteDate } from "svelte/reactivity"
	import { invalidate } from '$app/navigation'

    let { domain, tainted: _tainted = $bindable() }: { domain: Zod.infer<typeof zodDomain>, tainted: boolean | undefined } = $props()
    
    function useClock() {
        let val = $state(new SvelteDate());
        let timeout: number;
        const update = () => {
            val = new SvelteDate()
            timeout = window.setTimeout(update, 1000)
        }
        $effect(() => {
            update()
            return () => {
                clearTimeout(timeout)
            }
        })
        return () => val
    }

    const _clock = useClock()
    let clock = $derived(_clock())
    let timeSinceLastPush = $derived(domain.last_push ? clock.getTime() - domain.last_push.getTime() : undefined)
    const FIFTEEN_MINUTES = 15 * 60 * 1000
    let timeICanUpdate = $derived(timeSinceLastPush && timeSinceLastPush < FIFTEEN_MINUTES ? domain.last_push?.getTime() + FIFTEEN_MINUTES : undefined)
    let timeTillUpdate = $derived(timeICanUpdate ? timeICanUpdate - clock.getTime() : undefined)

    let elapsedTillUpdate = $derived.by(() => {
        if(!timeTillUpdate) return undefined
        const elapsedTimeMin = Math.floor(timeTillUpdate / 60000);
        const elapsedTimeSec = Math.floor((timeTillUpdate % 60000) / 1000);
        return `${elapsedTimeMin.toFixed(0).toString().padStart(2, '0')}:${elapsedTimeSec.toFixed(0).toString().padStart(2, '0')}`
    })

    $inspect(clock, 'last_push', timeSinceLastPush, 'time_updatable',  timeICanUpdate, 'time_till_updatable', timeTillUpdate)
    const { form, errors, isTainted, tainted, enhance } = superForm(defaults(zod(domainSettings), {
        defaults: {
            NS_records: domain.NS_records
        }
    }), {
        SPA: true,
        validators: zod(domainSettings),
        async onUpdate({ form }) {
            if(form.valid) {
                await fetchAPI(`/domains/settings/${domain.name}`, {
                    init: {
                        method: "POST",
                        body: JSON.stringify(form.data)
                    }
                })
            }
        },
        dataType: 'json'
    })

    _tainted = false

    tainted.subscribe(t => {
        _tainted = isTainted(t)
    })

    async function push() {
        if(timeTillUpdate) return;
        await fetchAPI(`/domains/settings/${domain.name}/push`, {
            init: {
                method: "POST"
            }
        })
        invalidate("app:auth")
    }
</script>

<h1>{domain.name}.is-a-th.ing</h1>

<hr class="my-2" />

<form class="flex flex-col gap-y-2" use:enhance>
    <ul class="list bg-base-100 rounded-box border">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">NS records</li>
        {#each $form.NS_records as _, i}
            <label class="border list-row group flex flex-col w-full">
                <input class="input w-full input-ghost validator" bind:value={
                    () => $form.NS_records[i],
                    (t) => $form.NS_records[i] = t.toLowerCase()
                } data-invalid={$errors.NS_records?.[i]}>
                <button onclick={() => form.update(f => {
                    f.NS_records.splice(i, 1)
                    return f
                })} class="group-hover:opacity-100 group-hover:visible btn btn-xs invisible opacity-0 transition-all">x</button>
                {#if $errors.NS_records?.[i]}
                <span class="invalid">{$errors.NS_records[i]}</span>
                {/if}
            </label>
        {/each}
        <button onclick={() => {
            $form.NS_records.push('')
            $form.NS_records = $form.NS_records
        }} class="btn btn-block btn-xs btn-outline btn-primary">+</button>
    </ul>
    
    <button class="btn btn-primary" disabled={!isTainted($tainted)}>save</button>
</form>

<hr class="my-2" />

<span>last push to DNS: {#if domain.last_push}{domain.last_push}{:else}<span class="text-accent">(never)</span>{/if}</span>

<p class="text-accent text-sm">
    this means that was the last time that the values above were actually sent to the DNS servers, to send them again press the button below. you can only push every 15 minutes
</p>

<button onclick={push} class="btn btn-primary" disabled={!!timeTillUpdate}>
    push {elapsedTillUpdate?`(${elapsedTillUpdate})`:''}
</button>