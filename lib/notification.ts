import * as webpush from 'web-push'

export const notification = async (email: string)=>{
    return {
        send: async function (pb: any, message: string, title: string, url: string, user: string) {
            const subscriptions = pb.collection('SC_subscriptions');
            const subscriptionsList = await subscriptions.getListItems(`user="${user}"`);
            for (const subscription of subscriptionsList) {
                const subscriptionData = JSON.parse(subscription.data);
                webpush.setVapidDetails(
                    `mailto:${email}`,
                    subscriptionData.publicKey,
                    subscriptionData.privateKey
                );
                webpush.sendNotification(subscriptionData, JSON.stringify({ title, message, url }));
            }
        }
    }
}