import PocketBase from "pocketbase"
import { publicSyncRun, usedPublicSyncConfigs } from "./publicSync"
import { runCron, usedCronConfigs } from "./cron";
import { jsHooksSyncRun, usedJsHooksSyncConfigs } from "./jsHookSync";
import { ignoreErrors } from "./utils";
import * as fs from 'fs'
import { runFunctionSync, usedFunctionSyncConfigs } from "./functionsSync";
import { configDefaults } from "./configSync";
import { CONST } from "./const";

export async function run(pb: PocketBase){
    const configCollection = pb.collection(CONST.COLLECTION_NAMES.SC_CONFIG);
    const configList = await configCollection.getFullList({})
    const config = {...configDefaults} as Record<string, string>
    configList.forEach((record) => {
        config[record.key] = record.value
    })

    const onlineConfigByKey = configList.reduce((acc, record) => {
        acc[record.key] = record
        return acc
    }, {} as Record<string, any>)
    await Promise.all(Object.keys(config).map(async (key) => {
        if(!onlineConfigByKey[key]){
            const newRecord = await configCollection.create({key, value: config[key]})
            onlineConfigByKey[key] = newRecord
        }
    }))

    await configCollection.update(onlineConfigByKey['lastActive'].id, {value: new Date().toUTCString()})
    setInterval(async () => {
        try {
            await configCollection.update(onlineConfigByKey['lastActive'].id, {value: new Date().toUTCString()})
        }catch(e){}
    }, 1000*60*5)

    ignoreErrors(async () => {
        fs.mkdirSync(config.publicDirectory || './pb_public', { recursive: true})
        //if hooksDirectory is not present, print create it and print warning
        if(!fs.existsSync(config.hooksDirectory || './pb_hooks')){
            console.log('Hooks directory not found. Creating one at ./pb_hooks')
            console.log('  If you intent to use pocketbase hools, you need to restart pocketbase,')
            console.log('  or pocketbase will not load those hooks.')
            fs.mkdirSync(config.hooksDirectory || './pb_hooks', { recursive: true })
        }
    })

    const unSubscribers = await runAll(config, pb)
    configCollection.subscribe('*', async (event) => {
        const key = event.record.key
        if(usedCronConfigs.includes(key)) {
            await unSubscribers.stopCron()
            unSubscribers.stopCron = await runCron(pb, config)
        }
        if(usedPublicSyncConfigs.includes(key)) {
            await unSubscribers.stopPublicSync()
            unSubscribers.stopPublicSync = await publicSyncRun(pb, config)
        }
        if(usedJsHooksSyncConfigs.includes(key)) {
            await unSubscribers.stopJsHooksSync()
            unSubscribers.stopJsHooksSync = await jsHooksSyncRun(pb, config)
        }
        if(usedFunctionSyncConfigs.includes(key)) {
            await unSubscribers.stopFunctionSync()
            unSubscribers.stopFunctionSync = await runFunctionSync(pb)
        }
    })
}   

async function runAll(config: any, pb: PocketBase) {
    const stopFunctionSync = await runFunctionSync(pb)
    console.log('functions loaded')
    const stopPublicSync = await publicSyncRun(pb, config)
    console.log('public sync started')
    const stopCron = await runCron(pb, config)
    console.log('cron started')
    const stopJsHooksSync = await jsHooksSyncRun(pb, config)
    console.log('jsHooks sync started')

    return {
        stopPublicSync,
        stopCron,
        stopJsHooksSync,
        stopFunctionSync,
    }
}