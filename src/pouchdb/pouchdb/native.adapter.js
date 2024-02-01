// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

'use strict'
import * as SQLite from 'expo-sqlite';
const WebSqlPouchCore = require('@craftzdog/pouchdb-adapter-websql-core').default
const adapter = 'mobile-native-sqlite';
function createOpenDBFunction (opts) {
  return function (name, version, description, size) {
    var openOpts = Object.assign({}, opts, {
      name,
      version: version,
      description: description,
      size: size
    })
    function onError (err) {
      console.error(err)
      if (typeof opts.onError === 'function') {
        opts.onError(err)
      }
    }
    return SQLite.openDatabase(openOpts.name, openOpts.version, openOpts.description, openOpts.size, null, onError)
  }
}

function MobileNativeSQL (opts, callback) {
  var websql = createOpenDBFunction(opts)
  var _opts = Object.assign({
    websql: websql
  }, opts)
  WebSqlPouchCore.call(this, _opts, callback)
}

MobileNativeSQL.valid = function () {
  // if you're using ReactNative, we assume you know what you're doing because you control the environment
  return true
}

// no need for a prefix in ReactNative (i.e. no need for `_pouch_` prefix
MobileNativeSQL.use_prefix = false

function mobileNativeQSLAdapter (PouchDB) {
  PouchDB.adapter(adapter, MobileNativeSQL, true)
}

mobileNativeQSLAdapter.adapter = adapter;
export default mobileNativeQSLAdapter;