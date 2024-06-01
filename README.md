# Pocketbase SideCart
The Pocketbase SideCart is an open source project that adds extra functionality to work with the Pocketbase database. It aims to provide an easy way to implement common features not currently supported by Pocketbase natively.

## Features
Cron jobs - Schedule tasks to run on a repeating schedule
Email - Send and receive emails (planned also receiving via IMAP)
Notifications - Push notifications via web and mobile (planned)
Functions - Execute JavaScript functions, just code them inside the PB admin interface and use all npm modules.
Triggers - Execute functions that use the npm packages ecosystem
Replication - Mirror data between databases (planned)
Files - Upload/update files through the UI to a public folder (single file upload working)
Hooks - edit js hooks right in your PB admin interface.

Data migrations - Easily migrate data between databases
More features coming soon!
Usage
To use the SideCart, run it alongside your Pocketbase server:

```sh
./pocketbase serve
./pocketbasesidecart -c=migrate --admin --username=name --password=password --host=http://localhost:8090
./pocketbasesidecart -c=run
```
This will subscribe the SideCart to your Pocketbase database. Features are then configured via collections like SC_cron and exposed through a simple API.

Documentation
For a available options use `./pocketbasesidecart --help` or read in dept documentation with `./pocketbasesidecart --man`. 

Learn how to:

Configure cron jobs
Upload and edit files right from admin interface
Run JavaScript functions (planned)

We welcome issues, pull requests, and any feedback! Reach out if you have any other questions.

