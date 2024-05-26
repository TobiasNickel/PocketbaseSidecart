import PocketBase from 'pocketbase'
import { migrations } from '../migrations';

export const runMigrations = async (pb: PocketBase): Promise<void> => {
    const versionModel = await getMigrateVersion(pb)
    const version = versionModel.value
    console.log('migrations', version , '/',migrations.length)
    for (let i = version; i < migrations.length; i++) {
        console.log('running migration', i)
        await migrations[i].up(pb)
        await pb.collection('SC_config').update(versionModel.id, { value: i+1 })
        console.log('migrations done', i+1, '/', migrations.length)
    }
}

async function getMigrateVersion(pb: PocketBase) {
    // todo: try read from SC_config
    try {
        return (await pb.collection('SC_config').getList(0,1,{filter: 'key="migrate_version"'})).items[0]
    } catch (e) {
        await pb.collections.create({
            id: "",
            created: "",
            updated: "",
            name: "SC_config",
            type: "base",
            system: true,
            listRule: '@request.auth.id = @collection.SC_user.id',
            viewRule: '@request.auth.id = @collection.SC_user.id',
            createRule: null,
            updateRule: null,
            deleteRule: null,
            schema: [
                { "id": "", "name": "key", "type": "text", "system": false, "required": false, "unique": false, "options": { "min": 1, "max": 100, "pattern": "" } },
                { "id": "", "name": "value", "type": "json", "system": false, "required": true, "unique": false, "options": { "maxSize": 2000000 }},
            ],
            indexes: [],
            options: {},
            originalName: ""
        })
        return await pb.collection('SC_config').create({ key: 'migrate_version', value: '0' })
    }
}

export async function checkMigration(pb: PocketBase) {
    const migrationVersion = await getMigrateVersion(pb)
    if (migrations.length > migrationVersion.value) {
        console.log('Migration needed')
    } else {
        console.log('Migrations up to date')
    }
}