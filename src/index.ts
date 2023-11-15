#!/usr/bin/env node

import yargs from "yargs"

const argv = yargs(process.argv.slice(2))
  .options({ a: { type: "boolean", default: false } })
  .parseSync()

console.log(argv)
