import * as m0001 from './0001.ts'
import PocketBase from "pocketbase"

export const migrations = [
    m0001,
] as {up: (pb: PocketBase)=>Promise<void>}[]