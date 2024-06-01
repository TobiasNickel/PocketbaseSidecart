export async function ignoreErrors(fn: () => any) {
    try {
        return await fn()
    } catch (e) {
        return undefined
    }
}