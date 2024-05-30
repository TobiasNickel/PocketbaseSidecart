import PocketBase, { RecordService, type RecordModel } from "pocketbase"
import { CONST } from "./const"
import { compileFunction } from "./compileFunction"

export const functions = new Map<string, Function>()

export const runFunctionSync = async (pb: PocketBase) => {
    const functionCollection = pb.collection(CONST.COLLECTION_NAMES.SC_FUNCTION)
    const records = await functionCollection.getFullList({})
    await Promise.all(records.map(async(record) => {
        await addFunction(record, functionCollection)
    }))
    console.log(records.length,'functions loaded')
    const unsubscribe = await functionCollection.subscribe('*',async (event) => {
        const action = event.action
        const record = event.record
        if (action === 'create' || action === 'update') {
            await addFunction(record, functionCollection)
        } else if (action === 'delete') {
            functions.delete(record.name)
        }
    })
    return async function(){
        Array.from(functions.keys()).forEach(k=>functions.delete(k))
        await unsubscribe()
    }
}

async function addFunction(record: RecordModel, functionCollection: RecordService<RecordModel>
) {
    try {
        functions.set(record.name, await compileFunction(record.code))
    } catch (e) {
        functions.delete(record.name)
        if (e instanceof Error) {
            await functionCollection.update(record.id, { error: e.message + '\n' + e.stack })
        } else {
            await functionCollection.update(record.id, { error: 'unknown error' })
        }
    }
}
