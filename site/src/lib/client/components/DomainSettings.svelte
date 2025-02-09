<script lang=ts>
    import SuperDebug, { superForm, defaults } from 'sveltekit-superforms';
    import { zod } from 'sveltekit-superforms/adapters';

    import { domain as zodDomain, domainSettings } from "$lib/shared/schema"
	import { fetchAPI } from '../api'
    import { SvelteDate } from "svelte/reactivity"
	import { invalidate } from '$app/navigation'

    let { domain = $bindable(), tainted: _tainted = $bindable() }: { domain: Zod.infer<typeof zodDomain>, tainted: boolean | undefined } = $props()
    
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

    let { form, errors, isTainted, tainted, enhance, reset } = superForm(defaults(zod(domainSettings)), {
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
                await invalidate("app:auth")
            }
        },
        resetForm: false,
        dataType: 'json'
    });

    $effect(() => {
        reset({
            data: {
                NS_records: domain.NS_records
            },
        })
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
        await invalidate("app:auth")
    }
</script>

<h1>{domain.name}.is-a-th.ing</h1>

<hr class="my-2" />

<form class="flex flex-col gap-y-2" use:enhance>
    <ul class="list bg-base-100 rounded-box border">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">NS records</li>
        {#each $form.NS_records as _, i}
            <label class="border list-row group flex flex-col w-full">
                <div class="join">
                    <input class="input w-full peer input-ghost" class:border-error={$errors.NS_records?.[i]} bind:value={
                        () => $form.NS_records[i],
                        (t) => $form.NS_records[i] = t.toLowerCase()
                    } data-invalid={$errors.NS_records?.[i]}>
                    <button type="button" onclick={() => {
                            form.update(f => {
                                f.NS_records.splice(i, 1)
                                return f
                            })
                    }} class="peer-focus:opacity-100 peer-focus:pointer-events-auto focus:opacity-100 focus:pointer-events-auto btn opacity-0 transition-all pointer-events-none duration-200">x</button>
                </div>
                {#if $errors.NS_records?.[i]}
                    <span class="bg-error text-error-content">{$errors.NS_records[i]}</span>
                {/if}
            </label>
        {/each}
        <button type="button" onclick={e => {
            form.update(f => {
                f.NS_records.push('')
                return f
            })
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