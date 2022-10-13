const isString = function(str){
  return typeof str === "string";
}
export const ltrim = function(current,str) {
    if(typeof current !=="string") return "";
    if (!(str) || typeof str !=="string") {
        return current.trim();
    }
    var index = current.length;
    while(current.startsWith(str) && index >= 0) {
        current = current.slice(str.length);
        --index;
    }
    return current.toString();
};

if(typeof String.prototype.ltrim != 'function'){
    String.prototype.ltrim = function(str) {
        return ltrim(this.toString(),str);
    }
}

export const rtrim = function(current,str) {
    if(typeof current !=="string") return "";
    if (!(str) || typeof str !=="string") {
        return current.trim();
    }
    var index = current.length;
    while(current.endsWith(str) && index >= 0) {
        current = current.slice(0,- str.length);
        --index;
    }
    return current.toString();
}

if(typeof String.prototype.rtrim != 'function'){
    String.prototype.rtrim = function(str) {
        return rtrim(this.toString(),str);
    };
}

function identity(str) {
    return str;
}
/*** WRAP SPECIFIC WORD
 *  wrap('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
 *  @parm str {string} string to wrap
 *  @param options {object|number} : {
 *      width {number} : Default: 50, The width of the text before wrapping to a new line.
 *      indent {string} : Default: `` (none), The string to use at the beginning of each line, example : wrap(str, {indent: '      '});*
 *      newline {string}  : Default: \n, The string to use at the end of each line. example : wrap(str, {newline: '\n\n'});*
 *      escape {function} : Default: function(str){return str;}, An escape function to run on each line after splitting them, example :  wrap(str, {
                        escape: function(string){
                            return xmlescape(string);
                        }
                        })
        trim : {boolean} : Default: false, Trim trailing whitespace from the returned string. This option is included since .trim() would also strip the leading indentation from the first line.
 * }
 *      wrapWord(str,10)
 *      wrapWord(str,{width:10})
 *      
 */
export const wrapWord = function(str, options) {
    if(typeof (options) === "number"){
        options = {width:options}
    }
    options = options && typeof options =='object' ? options : {};
    if(!str || typeof str !=='string'){
        return str;
    }
  
    var width = typeof options.width === 'number' && options.width > 0 ? options.width : typeof options.length == 'number' && options.length > 0 ? options.length : 30;
    if(str.length <= width) return str;
    var indent = (typeof options.indent === 'string')
      ? options.indent
      : '';
  
    var newline = options.newline || '\n' + indent;
    var escape = typeof options.escape === 'function'
      ? options.escape
      : identity;
  
    var regexString = '.{1,' + width + '}';
    if (options.cut !== true) {
      regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
    }
  
    var re = new RegExp(regexString, 'g');
    var lines = str.match(re) || [];
    var result = indent + lines.map(function(line) {
      if (line.slice(-1) === '\n') {
        line = line.slice(0, line.length - 1);
      }
      return escape(line);
    }).join(newline);
  
    if (options.trim === true) {
      result = result.replace(/[ \t]*$/gm, '');
    }
    return result;
};

String.prototype.wrapWord = function(opts){
    return wrapWord(this.toString(),opts)
}
if(typeof window !=='undefined' && window){
    window.wrapWord = wrapWord;
}


/**** substring pollyfill */
if('ab'.substr(-1) != 'b'){
    /**
  *  Get the substring of a string
  *  @param  {integer}  start   where to start the substring
  *  @param  {integer}  length  how many characters to return
  *  @return {string}
  */
 String.prototype.substr = function(substr) {
   return function(start, length) {
     // did we get a negative start?
     let str = this.toString();
     if (start < 0) {
       // calculate how much it is from the beginning of the string
       start = str.length + start;

       // if start is still negative then set it to the beginning of
       // the string
       if (start < 0) start = 0;
     }
     
     // call the original function
     return substr.call(this, start, length);
   }
 }(String.prototype.substr);
}
if(typeof(String.prototype.substring) !== 'function'){
   String.prototype.substring = String.prototype.substr;
}

if(typeof String.prototype.contains != 'function'){
    String.prototype.contains = function(str){
        return (this.toString().indexOf(str) !== -1);
    }
}

if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      if (typeof start !== 'number') {
        start = 0;
      }
  
      if (start + search.length > this.toString().length) {
        return false;
      } else {
        return this.toString().indexOf(search, start) !== -1;
      }
    };
  }

if(typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(needle,startPositionIndex){
        if(typeof startPositionIndex != 'number') startPosition = 0
        return (this.toString().indexOf(needle) == startPositionIndex)
    }
}

if(typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(suffix,endPositionIndex) {
        if(typeof endPositionIndex != 'number') endPosition = 0
        return this.toString().indexOf(suffix, this.toString().length - suffix.length) !== -1;
    };
}
if(typeof String.prototype.replaceAll != 'function'){
    /*** replace all occurance in string
     *
     *
     *
     */
    String.prototype.replaceAll = function(find, replace) {
        return this.toString().split(find).join(replace)
    }
}
String.prototype.trimSlashes = function (value) {
    if(!value) value = this.toString();
    return value.replace(/[\\/]+$/, '').toString();
};
String.prototype.isNumber = function(withDecimal){
  return isStringNumber(this.toString(),withDecimal);
}


/**** vérifie si la chaine de caractère passée en paramètre est constitué uniquement des nombres */
export const isStringNumber = (str,withDecimal)=>{
  if(typeof str !=='string') return false;
  if(withDecimal !== false){
    return /^\d*\.?\d+$/.test(str);
  }
  return /^\d+$/.test(str);
} 

export const isNumberString = isStringNumber;

export const sprintf = function(args){
  args = typeof args =='object' && args ? args : Array.prototype.slice.call(arguments);
  let str = typeof args[0] == "string"? args[0] : "";
  if(!str) return str;
  for(let i = 1;i<args.length;i++){
     const t = typeof args[i] == "boolean" || typeof args[i] =="number" || typeof args[i] == "string"? (args[i]+"") : "";
     str = str.replaceAll("{"+(i-1)+"}",t);
  }
  return str;
}

String.prototype.sprintf = function(){
  const arg = Array.prototype.slice.call(arguments);
  arg.unshift(this.toString());
  return sprintf(arg);
}
String.sprintf = sprintf;