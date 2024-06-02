import PocketBase from "pocketbase";
import { migrations } from "../migrations";

export const runMigrations = async (pb: PocketBase): Promise<void> => {
  const versionModel = await getMigrateVersion(pb);
  const version = versionModel.value;
  console.log("migrations", version, "/", migrations.length);
  for (let i = version; i < migrations.length; i++) {
    console.log("running migration", i);
    await migrations[i].up(pb);
    await pb.collection("SC_config").update(versionModel.id, { value: i + 1 });
    console.log("migrations done", i + 1, "/", migrations.length);
  }
};

async function getMigrateVersion(pb: PocketBase) {
  // todo: try read from SC_config
  try {
    console.log("getMigrateVersion");
    return (
      await pb
        .collection("SC_config")
        .getList(0, 1, { filter: 'key="migrate_version"' })
    ).items[0];
  } catch (e) {
    const userCollection = await pb.collections.create({
      name: "SC_user",
      type: "auth",
      system: false,
      schema: [],
      indexes: [],
      options: {
        allowEmailAuth: true,
        allowOAuth2Auth: false,
        allowUsernameAuth: true,
        exceptEmailDomains: [],
        manageRule: null,
        minPasswordLength: 8,
        onlyEmailDomains: [],
        onlyVerified: false,
        requireEmail: false,
      },
    });
    await pb.collections.update(userCollection.id, {
      listRule: "@request.auth.id = @collection.SC_user.id",
      viewRule: "@request.auth.id = @collection.SC_user.id",
      createRule: "@request.auth.id = @collection.SC_user.id",
      updateRule: "@request.auth.id = @collection.SC_user.id",
      deleteRule: "@request.auth.id = @collection.SC_user.id",
    })
    console.log("creating SC_config");
    await pb.collections.create({
      id: "",
      created: "",
      updated: "",
      name: "SC_config",
      type: "base",
      system: true,
      listRule: "@request.auth.id = @collection.SC_user.id",
      viewRule: "@request.auth.id = @collection.SC_user.id",
      createRule: "@request.auth.id = @collection.SC_user.id",
      updateRule: "@request.auth.id = @collection.SC_user.id",
      deleteRule: "@request.auth.id = @collection.SC_user.id",
      schema: [
        {
          id: "",
          name: "key",
          type: "text",
          system: false,
          required: false,
          unique: false,
          options: { min: 1, max: 100, pattern: "" },
        },
        {
          id: "",
          name: "value",
          type: "json",
          system: false,
          required: true,
          unique: false,
          options: { maxSize: 2000000 },
        },
      ],
      indexes: [],
      options: {},
      originalName: "",
    });
    console.log("creating migrate_version");
    return await pb
      .collection("SC_config")
      .create({ key: "migrate_version", value: "0" });
  }
}

export async function checkMigration(pb: PocketBase) {
  const migrationVersion = await getMigrateVersion(pb);
  if (migrations.length > migrationVersion.value) {
    console.log("Migration needed");
  } else {
    console.log("Migrations up to date");
  }
}
