const classNames = function(){
    const classes = [];
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!arg) continue;

        var argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        } else if (Array.isArray(arg) && arg.length) {
            var inner = classNames.apply(null, arg);
            if (inner) {
                classes.push(inner);
            }
        } else if (argType === 'object') {
            for (var key in arg) {
                if ({}.hasOwnProperty.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
}

export default classNames;