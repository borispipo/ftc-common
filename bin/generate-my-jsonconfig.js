require("./generate-jsonconfig")({
    projectRoot : process.cwd(),
    alias : require('../babel.config.alias')({
    })
});