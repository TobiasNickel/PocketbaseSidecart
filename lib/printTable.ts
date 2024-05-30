import PocketBase from "pocketbase"
import { options } from "./options"

export async function printTable(pb: PocketBase) {
    const collections = (await pb.collections.getList(0, 1000)).items
    if (options.opt.tablename) {
        const collection = collections.find(
            (c) => c.name === options.opt.tablename
        )
        if (collection) {
            console.log(JSON.stringify(collection, undefined, "  "))
        } else {
            console.log("collection not found")
        }
    } else {
        console.log(JSON.stringify(collections, undefined, "  "))
    }
}
