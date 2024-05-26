import PocketBase from "pocketbase";

export const up = async (db: PocketBase) => {
  await db.collection("SC_user").create({
    username: "sidecart",
    email: "test@example.com",
    emailVisibility: false,
    password: "sidecart",
    passwordConfirm: "sidecart",
  });
  await db.collections.create({
    name: "SC_subscription",
    type: "base",
    system: false,
    schema: [
      {
        name: "name",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: "" },
      },
      {
        name: "filter",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: { min: null, max: null, pattern: "" },
      },
      {
        name: "functionName",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          patters: "",
        },
      },
    ],
    indexes: [],
    listRule: "@request.auth.id = @collection.SC_user.id",
    viewRule: "@request.auth.id = @collection.SC_user.id",
    createRule: "@request.auth.id = @collection.SC_user.id",
    updateRule: "@request.auth.id = @collection.SC_user.id",
    deleteRule: "@request.auth.id = @collection.SC_user.id",
    options: {},
  });
  const functionCollection = await db.collections.create({
    name: "SC_function",
    type: "base",
    system: false,
    schema: [
      {
        name: "name",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      },
      {
        name: "code",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      },
    ],
    indexes: ["CREATE UNIQUE INDEX `idx_A1yFVVJ` ON `SC_function` (`name`)"],
    options: {},
  });
  await db.collections.create({
    name: "SC_cron",
    type: "base",
    system: false,
    schema: [
      {
        name: "pattern",
        type: "text",
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: "",
        },
      },
      {
        name: "function",
        type: "relation",
        system: false,
        required: false,
        unique: false,
        options: {
          collectionId: functionCollection.id,
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: null,
        },
      },
    ],
    indexes: [],
    options: {},
  });
};
