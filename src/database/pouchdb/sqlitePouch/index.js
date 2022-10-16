// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default function(){
  var WebSqlPouchCore = require('@craftzdog/pouchdb-adapter-websql-core')
  let sqlitePlugin = window.sqlitePlugin;
  if(typeof(sqlitePlugin) !=='object' || !sqlitePlugin || typeof(sqlitePlugin.openDatabase) !=='function'){
    alert("L'application ne pourra pas charger car le plugin de base de données sql est indisponible");
  }
  /* global , sqlitePlugin, openDatabase */
  function createOpenDBFunction (opts,callback) {
    return function (name, version, description, size) {
       let openOpts = Object.assign({}, opts, {
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
    var _opts = Object.assign({
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

  // no need for a prefix in  (i.e. no need for `_pouch_` prefix
  SQLitePouch.use_prefix = false
  return SQLitePouch;
}