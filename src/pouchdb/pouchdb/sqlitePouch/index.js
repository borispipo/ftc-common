// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function(){
  const WebSqlPouchCore = require('@craftzdog/pouchdb-adapter-websql-core')
  const sqlitePlugin = window.sqlitePlugin;
  if(typeof(sqlitePlugin) !=='object' || !sqlitePlugin || typeof(sqlitePlugin.openDatabase) !=='function'){
    alert("L'application ne pourra pas charger car le plugin de base de données sql est indisponible");
  }
  /* global , sqlitePlugin, openDatabase */
  function createOpenDBFunction (opts,callback) {
    return function (name, version, description, size) {
       const openOpts = Object.assign({}, opts, {
          name: name,
          version: version,
          description: description,
          size: size
        });
        function onError (err) {
          console.log(err," getting pouchdb local websql")
          if (typeof opts.onError === 'function') {
            opts.onError(err)
          } else if(isFunction(opts.error)){
             opts.error(err);
          }

        }
        //return sqlitePlugin.openDatabase(sqlitePluginOpts)
        return sqlitePlugin.openDatabase(openOpts.name, openOpts.version, openOpts.description, openOpts.size, null, onError)
    }
  }

  function SQLitePouch (opts, callback) {
    const _opts = Object.assign({
      websql: createOpenDBFunction(opts)
    }, opts)

    if ('default' in WebSqlPouchCore && typeof WebSqlPouchCore.default.call === 'function') {
      WebSqlPouchCore.default.call(this, _opts, callback)
    } else {
      WebSqlPouchCore.call(this, _opts, callback)
    }
  }

  SQLitePouch.valid = function () {
    return true
  }
  if(typeof window?.sqlitePluginAdater =="string"){
    SQLitePouch.adapter = window?.sqlitePluginAdater;
  }
  // no need for a prefix in  (i.e. no need for `_pouch_` prefix
  SQLitePouch.use_prefix = false
  return SQLitePouch;
}