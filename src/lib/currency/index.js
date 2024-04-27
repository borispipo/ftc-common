
import currencies from "./currencies";
import isString from "$cutils/isString";
import defaultStr from "$cutils/defaultStr";
import isNonNullString from "$cutils/isNonNullString";
const isObj = x => x && typeof x =='object';
import { getCurrency } from "$capp/currency";
import  extendObj  from "$cutils/extendObj";
const defaultObj = function() {
    var args = Array.prototype.slice.call(arguments,0);
    if(args.length === 1 && isObj(args[0])) return args[0];
    for(var i in args){
        let x = args[i];
        if(isObj(x) && Object.size(x,true)>0) return x;
    }
    return {};
};

export * from "./utils";

// Create the local library object, to be exported or referenced globally later
const lib = {};

/* --- Exposed settings --- */


// The library's settings configuration object. Contains default parameters for
// currency and number formatting
lib.settings = {
		get currency(){
			return {
				symbol : "FCFA",        // default currency symbol is '$'
				format : "%v %s",    // controls output: %s = symbol, %v = value (can be object, see docs)
				decimal : ".",        // decimal point separator
				thousand : " ",        // thousands separator
				decimal_digits : 0,        // decimal places
				grouping : 3,        // digit grouping (not implemented yet)
				...getCurrency()
			}
		},
		number: {
			decimal_digits : 0,		// default decimal_digits on numbers is 0
			grouping : 3,		// digit grouping (not implemented yet)
			thousand : " ",
			decimal : "."
		}
};

/* --- Internal Helper Methods --- */

/**
 * Extends settings object
 *
 * Used for abstracting parameter handling from API methods
 */
function prepareOptions(...rest) {
	const object = extendObj({},lib.settings.currency,...rest);
	if(isNonNullString(object.format)){
		const p = parseFormat(object.format);
		if(p.format){
			object.format = p.format;
		}
		if(typeof p.decimal_digits =="number"){
			object.decimal_digits = p.decimal_digits;
		}
	}
	return object;
}

/**
 * Check and normalise the value of decimal_digits (must be positive integer)
 */
function checkPrecision(val, base) {
	val = Math.round(Math.abs(val));
	return isNaN(val)? base : val;
}


/**
 * Parses a format string or object and returns format obj for use in rendering
 *
 * `format` is either a string with the default (positive) format, or object
 * containing `pos` (required), `neg` and `zero` values (or a function returning
 * either a string or object)
 *
 * Either string or format.pos must contain "%v" (value) to be valid
 */
function checkCurrencyFormat(format) {
	let formatS = lib.settings.currency.format;

	// Allow function as format parameter (should return string or object):
	if ( typeof format === "function" ) format = format();
	if(typeof format ==="string") format = format.toLowerCase();
	// Format can be a string, in which case `value` ("%v") must be present:
	if ( isString( format ) && format.match("%v") ) {

		// Create and return positive, negative and zero formats:
		return {
			pos : format,
			neg : format.replace("-", "").replace("%v", "-%v"),
			zero : format
		};

	// If no format, or object is missing valid positive value, use formatS:
	} else if ( !format || !format.pos || !format.pos.match("%v") ) {
		// If formatS is a string, casts it to an object for faster checking next time:
		return ( !isString( formatS ) ) ? formatS : lib.settings.currency.format = {
			pos : formatS,
			neg : formatS.replace("%v", "-%v"),
			zero : formatS
		};

	}
	// Otherwise, assume format was fine:
	return format;
}


/* --- API Methods --- */

/**
 * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
 * Alias: `accounting.parse(string)`
 *
 * Decimal must be included in the regular expression to match floats (default options to
 * accounting.settings.number.decimal), so if the number uses a non-standard decimal 
 * separator, provide it as the second argument.
 *
 * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
 *
 * Doesn't throw any errors (`NaN`s become 0) but this may change in future
 */
export const unformat = lib.unformat = lib.parse = function(value, decimal) {
	// Recursively unformat arrays:
	if ((value) && typeof value === 'object') {
		return Object.mapToArray(value,function(val) {
			return unformat(val, decimal);
		});
	}

	// Fails silently (need decent errors):
	value = value || 0;

	// Return the value as-is if it's already a number:
	if (typeof value === "number") return value;

	// Default decimal point comes from settings, but could be set to eg. "," in opts:
	decimal = decimal || lib.settings.number.decimal;

		// Build regex to strip out everything except digits, decimal point and minus sign:
	var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
		unformatted = parseFloat(
			("" + value)
			.replace(/\((?=\d+)(.*)\)/, "-$1") // replace bracketed values with negatives
			.replace(regex, '')         // strip out any cruft
			.replace(decimal, '.')      // make sure decimal point is standard
		);

	// This will fail silently which may cause trouble, let's wait and see:
	return !isNaN(unformatted) ? unformatted : 0;
};

export const parse = unformat;

/**
 * Implementation of toFixed() that treats floats more like decimals
 *
 * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
 * problems for accounting- and finance-related software.
 */
export const toFixed = lib.toFixed = function(value, decimal_digits) {
	decimal_digits = checkPrecision(decimal_digits, lib.settings.number.decimal_digits);

	var exponentialForm = Number(lib.unformat(value) + 'e' + decimal_digits);
	var rounded = Math.round(exponentialForm);
	var finalResult = Number(rounded + 'e-' + decimal_digits).toFixed(decimal_digits);
	return finalResult;
};


/**
 * Format a number, with comma-separated thousands and custom decimal_digits/decimal places
 * Alias: `accounting.format()`
 *
 * Localise by overriding the decimal_digits and thousand / decimal separators
 * 2nd parameter `decimal_digits` can be an object matching `settings.number`
 */
export const formatNumber = lib.formatNumber = lib.format = function(number, decimal_digits, thousand, decimal) {
	// Resursively format arrays:
	if ((number) && typeof number === 'object') {
		return Object.mapToArray(number, function(val) {
			return formatNumber(val, decimal_digits, thousand, decimal);
		});
	}

	// Clean up number:
	number = unformat(number);
	
	// Build options object from second param (if object) or all params, extending default options :
	var opts = prepareOptions(
			(isObj(decimal_digits) ? decimal_digits : {
				decimal_digits : decimal_digits,
				thousand : thousand,
				decimal : decimal
			}),
		),

		// Clean up decimal_digits
		usePrecision = checkPrecision(opts.decimal_digits),

		// Do some calc:
		negative = number < 0 ? "-" : "",
		base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
		mod = base.length > 3 ? base.length % 3 : 0;
		
	let decimalStr = "";
	if(usePrecision){
		const fNum = String(parseFloat(toFixed(Math.abs(number), usePrecision)) || 0);
		if(fNum.includes(".")){
			decimalStr = defaultStr(fNum.split(".")[1]).trim();
		}
	}
	// Format the number:
	return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision && decimalStr ? (opts.decimal + decimalStr) : "");
};

/*** use for digit grouping 
 * 
 * 
function commafy( number,separator,decimal ) {
	if(isNonNullString(separator)){
		separator = " ";
	}
	if(typeof decimal != 'string') decimal = prepareOptions({},lib.settings.currency).decimal
	number += '';                                         // stringify
	var num = number.split(decimal);                          // incase decimals
	if (typeof num[0] !== 'undefined'){
		var int = num[0];                               // integer part
		if (int.length > 4){
			int     = int.split('').reverse().join('');  // reverse
			int     = int.replace(/(\d{3})/g, "$1,");    // add commas
			int     = int.split('').reverse().join('');  // unreverse
		}
	}
	if (typeof num[1] !== 'undefined'){
		var dec = num[1];                               // float part
		if (dec.length > 4){
			dec     = dec.replace(/(\d{3})/g, "$1"+separator);    // add spaces
		}
	}
	
	return (typeof num[0] !== 'undefined'?int:'') 
			+ (typeof num[1] !== 'undefined'?'.'+dec:'');
	}*/

/**
 * Format a number into currency
 *
   le symbole peut être un objet, dans ce cas les autres propriétés peuvent être nulles
 * Usage: accounting.formatMoney(number, symbol, decimal_digits, thousandsSep, decimalSep, format)
 * prepareOptions: (0, "$", 2, ",", ".", "%s%v")
 *
 * Localise by overriding the symbol, decimal_digits, thousand / decimal separators and format
 * Second param can be an object matching `settings.currency` which is the easiest way.
 *
 * To do: tidy up the parameters
 */
export const formatMoney = lib.formatMoney = function(number, symbol, decimal_digits, thousand, decimal, format,returnObject) {
	// Resursively format arrays:
	if ((number) && typeof number === 'object') {
		return Object.mapToArray(number, function(val){
			return formatMoney(val, symbol, decimal_digits, thousand, decimal, format,returnObject);
		});
	}

	// Clean up number:
	number = unformat(number);

	// Build options object from second param (if object) or all params, extending default options :
	const opts = prepareOptions(
			(isObj(symbol) ? symbol: {
				symbol,
				decimal_digits,
				thousand,
				decimal,
				format
			})),

		// Check format (returns object with pos, neg and zero):
		formats = defaultObj(checkCurrencyFormat(opts.format)),

		// Choose which format to use for this value:
		useFormat = defaultStr(number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero);
    const formattedValue = useFormat.replace('%s', opts.symbol);
	const formattedNumber =  formatNumber(Math.abs(number), checkPrecision(opts.decimal_digits), opts.thousand, opts.decimal);
	const formattedResult = formattedValue.replace('%v',formattedNumber);
	if(returnObject ===true){
		return {
			...opts,
			formattedValue,
			formattedNumber,
			symbol : opts.symbol,
			useFormat,
			formattedResult,
		}
	}
	// Return with currency symbol added:
	return formattedResult;
};


/**
 * Format a list of numbers into an accounting column, padding with whitespace
 * to line up currency symbols, thousand separators and decimals places
 *
 * List should be an array of numbers
 * Second parameter can be an object containing keys that match the params
 *
 * Returns array of accouting-formatted number strings of same length
 *
 * NB: `white-space:pre` CSS rule is required on the list container to prevent
 * browsers from collapsing the whitespace in the output strings.
 */
lib.formatColumn = function(list, symbol, decimal_digits, thousand, decimal, format) {
	if (!list || !isArray(list)) return [];
	var opts = prepareOptions(
			(isObj(symbol) ? symbol : {
				symbol : symbol,
				decimal_digits : decimal_digits,
				thousand : thousand,
				decimal : decimal,
				format : format
			})
		),

		// Check format (returns object with pos, neg and zero), only need pos for now:
		formats = checkCurrencyFormat(opts.format),

		// Whether to pad at start of string or after currency symbol:
		padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

		// Store value for the length of the longest string in the column:
		maxLength = 0,

		// Format the list according to options, store the length of the longest string:
		formatted = Object.mapToArray(list, function(val, i) {
			if (isArray(val)) {
				// Recursively format columns if list is a multi-dimensional array:
				return lib.formatColumn(val, opts);
			} else {
				// Clean up the value
				val = unformat(val);

				// Choose which format to use for this value (pos, neg or zero):
				var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

					// Format this value, push into formatted list and save the length:
					fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.decimal_digits), opts.thousand, opts.decimal));

				if (fVal.length > maxLength) maxLength = fVal.length;
				return fVal;
			}
		});

	// Pad each number in the list and send back the column of numbers:
	return Object.mapToArray(formatted, function(val, i) {
		// Only if this is a string (not a nested array, which would have already been padded):
		if (isString(val) && val.length < maxLength) {
			// Depending on symbol position, pad after symbol or at index 0:
			return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
		}
		return val;
	});
};

export const getDefaultCurrency = ()=>{
	let currency = {};
	if(lib.settings.currency){
		const symbol = defaultStr(lib.settings.currency.symbol);
		if(symbol){
			for(let i in currencies){
				currency = currencies[i];
				if(!isObj(currency)) continue;
				if(currency.symbol == symbol && isNonNullString(currency.name_plural)){
					return currency;
				}
			}
		}
	}
	return defaultObj(lib.settings.currency);
};
/***
	parse le format de la devise, et retourne un objet portant le cas échéants 2 propriétés : 
	format : le format de la dévise parsé
	decimals : le nombre de décimales le cas où il est inclut dans le format
	@param {string} format, le format de la dévise, chaine de caractère combinant les caractères %s, %v et .#{0,n}, où : 
		- %s représente le code de la dévise d'affichage,
		- %v représente la valeur du nombre à formatté
		- .#{0,n} représeente le nombre de décimales que l'on souhaite utiliser pour le format. avec n le n'ombre de décimales
	 Par exemple, le format %v %s .### permet de formatter le nombre 12555.6893300244 en $ de la sorte : [12555.689 $], avec 3 décimales
	 Si l'on souhaite n'avoir pas de décimales dans le format, il suffit de ne préciser aucun # après le point (.); par example : %s %v .
*/
export const parseFormat = lib.parseFormat = (format)=>{
	format = defaultStr(format).trim();
	const ret = {};
	if(format){
		const reg = /(\.)(\#{0,9}\s*$)/; //le format contient le nombre de décimales spécifiés. 
		const m = format.match(reg);
		if(Array.isArray(m)){
			if(m.length === 3){
				//on récupère le nombre de décimales
				ret.decimal_digits = defaultStr(m[2]).trim().length; //le nombre de décimales est récupéré
			}
			format = format.replace(reg,""); //on remplace l'expression regulière trouvée dans le format
		}
		//si le format inclut le motif .[d], avec d un nombre alors le nombre suivant represente le nombre de décimale
		ret.format = format;
	}
	return ret;
}
export const formatDescription = `Format d'affichage des valeurs numériques : une chaine de caractère constituée des lettre %v et %s où %v représente la valeur du montant et %s représente la devise : exemple %s%v => $10 et %v %s => 10 $.
	Pour définir les décimales, utiliser le motif [.][#{0,n}], exemple : .### pour l'affichage avec 3 decimales et . pour ne pas inclure les decimales dans l'affichage. 
	par exemple, Le format %v %s .## retourne : 12.35 $ pour la valeur 12.357777 convertie en dollard.  
`;

const CurrenCy =  {
	updateCurrency : (currency,format,decimal_digits)=>{
		const options = typeof currency =="object" && currency ? currency : {};
		if(isNonNullString(options.currency) && currencies[options.currency]){
			currency = options.currency;
		}
		if(isNonNullString(currency) && currencies[currency]){
			currency = currencies[currency];
		}
		lib.settings.currency = {
			...lib.settings.currency,
			...defaultObj(currency)
		}
		decimal_digits = typeof decimal_digits =='number'? decimal_digits : typeof options.currencyDecimalDigits =='number'? options.currencyDecimalDigits : undefined;
		const p = parseFormat(defaultStr(format,options.currencyFormat).trim())
		if(p.format){
			lib.settings.currency.format = p.format;
		}
		if(typeof p.decimal_digits =="number"){
			decimal_digits = p.decimal_digits;
		}
		if(typeof decimal_digits == "number"){
			lib.settings.number.decimal_digits =lib.settings.currency.decimal_digits = decimal_digits;
		}
		return lib.settings;
	},
	/**** retourne l'objet currency actuel */
	getDefaultCurrency,
	currencies,
	format : lib.formatMoney,
	...lib,
	formatDescription,
}


export default CurrenCy;

export {currencies};