import PocketBase from "pocketbase"
import { publicSyncRun } from "./publicSync"

export function run(pb: PocketBase){
    publicSyncRun(pb, './public')
}