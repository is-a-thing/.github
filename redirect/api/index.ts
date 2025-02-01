export async function GET(request: Request) {
    const host = request.headers.get('host') || '';
    if(host.endsWith('is-a-th.ing')) {
        const parts = host.split('.').reverse();
        const subdomain = parts[2];
        return new Response(null, {
            status: 301,
            headers: {
                Location: `https://is-a-th.ing/?sub=${subdomain}`
            }
        })
    }
    return new Response(null, {
        status: 301,
        headers: {
            Location: `https://is-a-th.ing/`
        }
    })
}