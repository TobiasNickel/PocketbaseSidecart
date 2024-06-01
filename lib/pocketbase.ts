import pocketbase from 'pocketbase'
import EventSource from 'eventsource';
(global as any).EventSource = EventSource;

export const PocketBase = pocketbase

// a primitive type
export type Primitive = string | number | boolean | null | undefined

export function objToFilter(obj: {[x: string]: Primitive | Primitive[] }) {
    return Object.keys(obj).map(key => {
        const value = obj[key]
        if (Array.isArray(value)) {
            return `(${value.map((v: Primitive)=>`${key} IN ${JSON.stringify(v)}`).join('||')})`
        } else {
            return `${key}=${JSON.stringify(value)}`
        }
    }).join(' && ')
}

export async function connect(host: string, isAdmin: boolean, userName: string, password: string) {
    const pb = new PocketBase(host)
    pb.autoCancellation(false)

    const authCollection = isAdmin ? pb.admins : pb.collection("SC_user");
    console.log('connecting to pocketbase', {host, userName, password, isAdmin})
    await (authCollection as any).authWithPassword(userName, password)
    console.log('connected to pocketbase')
    return pb
}