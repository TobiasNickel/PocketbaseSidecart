import * as fs from "fs/promises";
import PocketBase from "pocketbase";
import { CONST } from "./const";
import { lookup } from "mime-types";

export const usedJsHooksSyncConfigs: string[] = ["hooksDirectory"];

export async function jsHooksSyncRun(pb: PocketBase, config: any) {
  const directory = config.hooksDirectory || "./pb_hooks";
  const allFiles = await fs.readdir(directory, {
    withFileTypes: true,
    recursive: true,
  });
  const fileCollection = pb.collection(CONST.COLLECTION_NAMES.SC_HOOKS_FILES);
  const fileIDs = (await fileCollection.getFullList({ fields: "id" })).map(
    (i) => i.id
  );
  console.log(fileIDs);
  await Promise.all(fileIDs.map((id) => fileCollection.delete(id)));
  console.log("deleted all files in db");
  await Promise.all(
    allFiles.map(async (file) => {
      if (file.isFile()) {
        const mime = lookup(directory + "/" + file.name) || "";
        console.log("file", file.name, mime);
        const isText =
          mime.startsWith("text") ||
          mime.startsWith("application/js") ||
          mime.startsWith("application/javascript");
        await fileCollection.create({
          name: file.name.endsWith('.pb.js')?file.name.substring(0, file.name.length-6):file.name,
          textContent: (await fs.readFile(directory + "/" + file.name)).toString(),
          delete: false,
        });
      }
    })
  );
  console.log("file sync done");
  const subscription = await fileCollection.subscribe("*", async (event) => {
    if (event.action === "delete") {
      return;
    }
    console.log("fileSync event", event.record.name);
    if (event.record.delete) {
      await fs.rm(directory + "/" + event.record.name+'.pb.js');
      await fileCollection.delete(event.record.id);
    } else {
      const mime = lookup(event.record.name+'.pb.js') || "";
      const isText =
        mime.startsWith("text") || mime.startsWith("application/javascript");
      if (isText) {
        if (event.record.textContent) {
          await fs.writeFile(
            directory + "/" + event.record.name+'.pb.js',
            event.record.textContent
          );
        } else {
          fs.writeFile(directory + "/" + event.record.name+'.pb.js', "");
        }
      }
      await fs.writeFile(
        directory + "/" + event.record.name+'.pb.js',
        event.record.textContent
      );
    }
    console.log("event", event);
  });
  return async function () {
    await subscription();
  };
}
