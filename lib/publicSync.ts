import * as fs from 'fs/promises'
import PocketBase from 'pocketbase'
import { CONST } from './const'
import { lookup } from 'mime-types'


export async function publicSyncRun(pb: PocketBase, directory: string) {
    const allFiles = await fs.readdir(directory, { withFileTypes: true, recursive: true})
    console.log('allFiles', allFiles)
    const fileCollection = pb.collection(CONST.COLLECTION_NAMES.SC_PUBLIC_FILES)
    const fileIDs = (await fileCollection.getFullList({fields:'id'})).map(i=>i.id)
    console.log(fileIDs)
    await Promise.all(fileIDs.map(id=>fileCollection.delete(id))) 
    console.log('deleted all files')
    await Promise.all(allFiles.map(async (file) => {
        if (file.isFile()) {
            const mime = lookup(directory+'/'+file.name) ||''
            console.log('file', file.name, mime)
            const isText = mime.startsWith('text') || mime.startsWith('application/js') || mime.startsWith('application/javascript')
            await fileCollection.create({
                path: file.name,
                textContent: isText ? (await fs.readFile(directory+'/'+file.name)).toString():'',
                delete: false,
            })
        }
    }))
    console.log('file sync done')
    const subscription = await fileCollection.subscribe('*',async (event) => {
        if(event.action==='delete'){
            return;
        }
        if(event.record.delete){
            await fs.rm(directory+'/'+event.record.path)
            await fileCollection.delete(event.record.id)
        }else{
            const mime = lookup(event.record.path) ||''
            const isText = mime.startsWith('text') || mime.startsWith('application/javascript')
            if(isText){
                if(event.record.textContent){
                    await fs.rm(directory+'/'+event.record.path)
                    await fs.writeFile(directory+'/'+event.record.path, event.record.textContent)
                }else if(event.record.file){
                    const file = await fetch(event.record.file).then(r=>r.blob())
                    await fs.writeFile(directory+'/'+event.record.path, Buffer.from(await file.arrayBuffer()))
                }else{
                    fs.writeFile(directory+'/'+event.record.path, '')
                }
            }else{
                if(event.record.file){
                    const file = await fetch(event.record.file).then(r=>r.blob())
                    await fs.writeFile(directory+'/'+event.record.path, Buffer.from(await file.arrayBuffer()))
                }else{
                    await fs.rm(directory+'/'+event.record.path)
                    await fileCollection.delete(event.record.id)
                }
            }
            await fs.writeFile(directory+'/'+event.record.path, event.record.textContent)
        }
        console.log('event', event)
    })
    return async function(){
        await subscription()
    }
}