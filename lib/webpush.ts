import PocketBase from 'pocketbase'

export function webPushInit(pb: PocketBase){
    const configCollection = pb.collection('SC_config');
    const keys = configCollection.getFirstListItem(`key="webpush"`);
}

export function webpush() {

}