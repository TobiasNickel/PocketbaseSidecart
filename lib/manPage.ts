
export const manPages = {
users:`
Most of the commands require an admin user authentication, because they verify the schema, create tables, and such setup tasks.
However the most important command the "run" command is made to run as an SC_user to have only the permissions it needs.

In most cases, the SC_user table, will only contain one user.
`,
SC_tables:`
All tables that the SC is using, are prefixed with "SC_".
    SC_user: the user table
    SC_config: basically a key value store to influence the behavior of the SC.
    SC_function: javascript functions that can be executed by different triggers.
    SC_cron: defining cronjob with cron pattern and function name from SC_function.
    SC_tasks: describe the need to call a function. with its name and arguments.
    SC_public_files: for uploading files to public with support for zip archives. and replacement of directories (useful for deployments through UI or API)
    SC_web_push_subscriptions: web-push subscriptions
    SC_status: the status of the SC
for all tables, you can decide to add custom rules and fields.
`,
SC_config:`
The SC_config table is a key value store to influence the behavior of the SC.
    migrate_version: the current migration version
    public_files: the public files directory
    web_push_vapid_public_key: the public key for web-push
    web_push_vapid_public_key_public_path: path to save the key in a public file, 
            default to /sc/vapid_public_key
    web_push_vapid_private_key: the private key for web-push
`,
SC_status:`
SC_status is an internal key value store to store the status of the SC.
    last_active: the last time the SC was active updated every minute. So if this time is older than 5 minutes, the SC is considered inactive/disconnected.
    last_error: the last error that occurred in the SC
    sidecart_id: the id of the active SC. with this, we ensure only one SideCart is active.
    sidecart_version: the version of the active SC.
`,
SC_tasks:`
The SC_tasks table is used to describe the need to execute a function. with its name and arguments.
fields:
    - name: the name of the function
    - args: the arguments that are passed to the function
    - need_result: boolean, if true, the result of the function will be stored in the result field. otherwise the task is deleted afterwords.
    - result: the result of the function
    - error: the error of the function
    - status: pending, running, done, error
You decide the access rules for this table. 
In the API's-Create-Rules you can specify for each function name who is allowed to create a task.
    (@request.data.name = "functionName" && @request.auth.id = @collections.userRoles.userId && @collections.userRoles.role = "publisher")
    || ... the same structure again

`,
SC_public_files:`
The SC_public_files table is used to upload or edit files to the public directory.
fields:
    - path: the path of the file including the name
    - content: the content of the file in text format
    - file: usually null, but when you upload a file here, SC will write this content to the public directory and remove the content from the collection.
    - delete: false, when you set this to true, the file will be deleted from the public directory and SC will remove it from this table.
When SC is starting this table is completely deleted. Read all directories within public and write them to this collection.
`,
SC_function:`
Javascript functions that can be executed by different triggers.
    name: the name of the function
    code: the javascript code
`,
Functions:`
Functions are javascript code that can be executed by different triggers. The function has access to all Bun APIs including:
    - pb: the PocketBase instance
    - collection: the collection that triggered the function
    - args: the arguments that are passed to the function
    - triggerType: string that describes the trigger type
    - fetch api
    - web-push package
    - imap package
    - sendmail package
    - nodemailer package
    - axios package
    - underscore package
    - cheerio package
    please open a github issue for adding more useful libraries.
example: here is an example of a function:
    name: test
    code: |
        const fs = await import('fs')
        return async function (e) {
            fs.writeFileSync('test.txt', JSON.stringify(e.arg))
        }
1. You can only use dynamic imports to load packages.
2. You return one function (async or not)
EventArguments:
    - pb: PocketBase
    - arg: any - besides one complex parameter to the function, you can pass any complex object to this property.
    - trigger: about the source of the event (including type an potentially the user)
    - notification
`,
commands:`
The available commands are:
    - run: run the pocketbaseSideCart (SC)
    - migrate: run the migrations
    - printTable: show the tables
    - testFunction: test a function
    - printFunctions: print all functions
    - printCron: print all cronjobs
`,
notifications:`
Notifications also work through the SC_function. 
The SC_subscription table is used to store the subscriptions.
The idKey field is used to identify the user from any auth-collection you need.
The idKey field could also group subscriptions into some kind of topic. you choose.
The SC_subscription table is intended that the user input his own subscription into the table.
pocketbaseSideCart will automatically delete expired and invalid subscriptions.
`
} as {[x: string]: string}

Object.keys(manPages).forEach(key=>{
    manPages[key] = manPages[key].trim()
})

export const manPage = `
With --man you can read more about pocketbasesidecart (SC).
use it together with the --page=PAGE page flag to read about a specific topic.
the available pages are:
  - ${Object.keys(manPages).join('\n  - ')}
`.trim()
