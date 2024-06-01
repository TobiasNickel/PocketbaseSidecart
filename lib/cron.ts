import { CronJob } from 'cron'
import PocketBase, { RecordService, type RecordModel } from 'pocketbase'
import { CONST } from './const'
import { functions } from './functionsSync'

export const usedCronConfigs: string[] = [];

export async function runCron(pb: PocketBase, config: any) {
    const cronJobMap = new Map()
    const cronCollection = pb.collection(CONST.COLLECTION_NAMES.SC_CRON)
    const cronList = await cronCollection.getFullList({})
    cronList.forEach((record) => {
        const job = createCronjob(record, cronCollection, pb)
        job.start()
        cronJobMap.set(record.id, job)
    })
    const unsubscribe = await cronCollection.subscribe('*', async (event) => {
        if (event.action === 'create') {
            const record = event.record
            const job = createCronjob(record, cronCollection, pb)
            job.start()
            cronJobMap.set(event.record.id, job)
        } else if (event.action === 'update') {
            const job = cronJobMap.get(event.record.id)
            if (job) {
                job.stop()
            }
            const newJob = createCronjob(event.record, cronCollection, pb)
            newJob.start()
            cronJobMap.set(event.record.id, newJob)
        } else if (event.action === 'delete') {
            const job = cronJobMap.get(event.record.id)
            if (job) {
                job.stop()
            }
            cronJobMap.delete(event.record.id)
        }
    })
    return async ()=>{
        cronJobMap.forEach((job) => {
            job.stop()
        });
        await unsubscribe()
    }
}

function createCronjob(record: RecordModel, cronCollection: RecordService<RecordModel>, pb: PocketBase) {
    return new CronJob(record.schedule, async () => {
        try {
            const func = functions.get(record.function)
            if (func) {
                await func({
                    pb,
                    trigger: 'cron',
                    arg: record.arg
                })
            }
        } catch (e) {
            if (e instanceof Error) {
                await cronCollection.update(record.id, { error: e.message + '\n' + e.stack })
            }
        }
    })
}
