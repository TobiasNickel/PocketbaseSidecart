
export const manPages = {
users:`
Most of the commands require an admin user authentication, because they verify the schema, create tables, and such setup tasks.
However the most important command the "run" command is made to run as an SC_user to have only the permissions it needs.

In most cases, the SC_user table, will only contain one user.
`,
SC_tables:`
All tables that the SideCart is using, are prefixed with "SC_".
    SC_config: basically a key value store to influence the behavior of the pocketbaseSideCart.
    SC_functions: javascript functions that can be executed by different triggers.
    SC_cron: defining cronjob with cron pattern and function name from SC_functions.
    SC_tasks: describe the need to call a function. with its name and arguments.
    SC_public_files: for uploading files to public with support for zip archives. and replacement of directories (useful for deployments through UI or API)
    SC_web_push_subscriptions: web-push subscriptions
    SC_notifications: messages to be send to the subscriptions
`,
SC_config:`
The SC_config table is a key value store to influence the behavior of the pocketbaseSideCart.
    migrate_version: the current migration version
    public_files: the public files directory
`,
SC_functions:`
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
`,
commands:`
The available commands are:
    - run: run the pocketbaseSideCart
    - migrate: run the migrations
    - printTable: show the tables
    - testFunction: test a function
    - printFunctions: print all functions
    - printCron: print all cronjobs
`,
} as {[x: string]: string}

Object.keys(manPages).forEach(key=>{
    manPages[key] = manPages[key].trim()
})

export const manPage = `
With --man you can read more about pocketbasesidecart.
use it together with the --page=PAGE page flag to read about a specific topic.
the available pages are:
  - ${Object.keys(manPages).join('\n  - ')}
`.trim()
