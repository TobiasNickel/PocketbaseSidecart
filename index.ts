import PocketBase from "pocketbase"
import { options } from "./lib/options"
import { runMigrations } from "./lib/migrate"
import { manPage, manPages } from "./lib/manPage"
import { showTable } from "./lib/showTable"
import { run } from "./lib/run"

if (options.opt.help) {
  console.log("Usage: node index.ts --username=USERNAME --password=PASSWORD")
  console.log("Options:")
  console.log("  --help")
  console.log("  --man                    get more information about pocketbaseSidecart")
  console.log("  --username=USERNAME")
  console.log("  --password=PASSWORD")
  console.log("  --admin");
  console.log("  --command=COMMAND        run a command: migrate, run(default),...")
  console.log("  -c=COMMAND               shorthand for --command")
  console.log("  --options");
  console.log("Commands and CommandOptions:")
  console.log("migrate: (--admin also required)")
  console.log("showtable:")
  console.log("  --tablename=TABLENAME")

  process.exit(0)
}

if(options.opt.c){
    options.opt.command = options.opt.c
}

if (options.opt.options) {
  console.log({ options })
  process.exit(0)
}

if(options.opt.man){
    if(options.opt.page){
        const page = manPages[options.opt.page]
        if(page){
            console.log(page)
        }else{
            console.log('page [',options.opt.page,'] not found')
        }
    }else{
        console.log(manPage)
    }
    process.exit(0)
}

if (!options.opt.command) {
  options.opt.command = "run";
}

const HOST = process.env.HOST || "https://localhost/"
const userName = options.opt.username || "sc@example.com" //'sidecart'
const password = options.opt.password || "aaaaaaaaaa" //'sidecart'

const pb = new PocketBase(HOST)
pb.autoCancellation(false)

type Subscription = {
  id: string
  name: string
  filter: string
};
const authCollection = options.opt.admin ? pb.admins : pb.collection("SC_user");

await (authCollection as any)
  .authWithPassword(userName, password)
  .then(async () => {
    // console.log("Logged in");
    // console.log("isValid", pb.authStore.isValid);
    // console.log("token", pb.authStore.token);
    // console.log("user", pb.authStore.model);
    if(!options.opt.command){return}
    if (options.opt.command.toLowerCase() === "migrate") {
      await runMigrations(pb)
      return;
    } else if (options.opt.command.toLowerCase() === "printTable".toLowerCase()) {
      await showTable(pb)
    } else if (options.opt.command.toLowerCase() === "run"){
        await run(pb)
    } else {
        console.log('unknown command, use --help')
    }
    // const subscriptions = await pb.collection<Subscription>('SC_subscription').getList(0,100000)
    // console.log({subscriptions})
  });

