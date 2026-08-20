#!/usr/bin/env node

'use strict'

/* eslint-disable no-process-exit */

const path = require('path')
const extract = require('./')

const args = process.argv.slice(2)
const source = args[0]
const dest = path.resolve(args[1] || process.cwd())
if (!source) {
  console.error('Usage: extract-zip foo.zip <targetDirectory>')
  process.exit(1)
}

extract(source, { dir: dest })
  .catch(function (err) {
    console.error('error!', err)
    process.exit(1)
  })
