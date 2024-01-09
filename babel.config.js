module.exports = function(api,opts) {
    opts = typeof opts =='object' && opts ? opts : {};
    api = api && typeof api =='object'? api : {};
    typeof api.cache =='function' && api.cache(true);
    const options = {...opts,platform:"web"};
    /*** par défaut, les variables d'environnements sont stockés dans le fichier .env situé à la racine du projet, référencée par la prop base  */
    const alias =  require("./babel.config.alias")(options);
    return {
      presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
      plugins : [
        ...(Array.isArray(opts.plugins) ? options.plugins : []),
        ["module-resolver", {"alias": alias}],
      ],
    };
  };