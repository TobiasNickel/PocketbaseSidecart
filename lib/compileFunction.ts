/**
 * Compiles a function from a string
 * @example
 *  const fs = await import('fs')
 *  return async function (e) {
 *   fs.writeFileSync('test.txt', JSON.stringify(e.arg))
 * }
 * @note: You can only use dynamic imports to load packages
 * and you return one value, but for us: a function (async or not)
 * @param src 
 * @returns 
 */
export async function compileFunction(src: string): Promise<(e: any)=>any> {
    const initFn = await eval(`(async function init(){
        ${src}
    })`)
    return await initFn()
}
