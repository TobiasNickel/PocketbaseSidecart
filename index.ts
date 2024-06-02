import PocketBase from "pocketbase"
import { options } from "./lib/options"
import { runMigrations } from "./lib/migrate"
import { manPage, manPages } from "./lib/manPage"
import { printTable } from "./lib/printTable"
import { run } from "./lib/run"
import { connect } from "./lib/pocketbase"

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

const HOST = options.opt.host || process.env.HOST || "https://localhost/"
const userName = options.opt.username || "sidecart"
const password = options.opt.password || "sidecart"

async function main(){
  const pb = await connect(HOST, options.opt.admin, userName, password)
  console.log('connected to pocketbase', {HOST, userName, password, isAdmin: options.opt.admin})
  

  if(!options.opt.command){ return }
  if (options.opt.command.toLowerCase() === "migrate") {
    await runMigrations(pb)
    return;
  } else if (options.opt.command.toLowerCase() === "printTable".toLowerCase()) {
    await printTable(pb)
  } else if (options.opt.command.toLowerCase() === "run") {
    await run(pb)
  } else {
    console.log('unknown command, use --help')
  }
}

main().catch(e=>{
  console.error(e)
  console.log(e.stack)
  process.exit(1)
})

