// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/**
 *  @see : https://www.npmjs.com/package/dateformat
 *  dateFormat.masks = {
      'default':               'ddd mmm dd yyyy HH:MM:ss',
      'ordinalDate'            'ddd S mmmm yyyy'
      'shortDate':             'm/d/yy',
      'mediumDate':            'mmm d, yyyy',
      'longDate':              'mmmm d, yyyy',
      'fullDate':              'dddd, mmmm d, yyyy',
      'shortTime':             'h:MM TT',
      'mediumTime':            'h:MM:ss TT',
      'longTime':              'h:MM:ss TT Z',
      'isoDate':               'yyyy-mm-dd',
      'isoTime':               'HH:MM:ss',
      'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
      'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
      'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
    }
 */
    import i18n from "../i18n";
    import defaultStr from "$cutils/defaultStr";
    import isDateObj from "$cutils/isDateObj";
    
    export const SQLDateFormat = "yyyy-mm-dd";
    export const SQLDateTimeFormat = "yyyy-mm-dd HH:MM:ss"
    export const SQLTimeFormat = "HH:MM:ss";
    
    const isNonNullString = x => x && typeof x =="string";
    
    let global = typeof window =='object' && window ? window : {}
    
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
    if(typeof Date.prototype.getDays != 'function'){
        Date.prototype.getDays = function() { return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate(); };
    }
    
    Date.prototype.withoutTime = function () {
        var d = new Date(this);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    
    Date.isLeapYear = function (year) { 
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)); 
    };
    if(typeof Date.prototype.isLeapYear != 'function'){
        Date.prototype.isLeapYear = function () { 
            return Date.isLeapYear(this.getFullYear()); 
        }; 
    }
    if(typeof Date.prototype.getDaysInMonth != 'function'){        
            Date.getDaysInMonth = function (year, month) {
            return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        };
        Date.prototype.getDaysInMonth = function () { 
            return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
        };    
    }
    
    Date.prototype.addMonths = function (value) {
        var n = this.getDate();
        this.setDate(1);
        this.setMonth(this.getMonth() + value);
        this.setDate(Math.min(n, this.getDaysInMonth()));
        return this;
    };
    
    Date.prototype.toSQL = Date.prototype.toISODate = Date.prototype.toSQLDate = function(){
        return DateLib.SQLDate(this.valueOf());
    }
    Date.prototype.toSQLTime = Date.prototype.toISOTime = function(){
        return DateLib.SQLTime(this.valueOf());
    }
    /*** formate la date passé en paramètre à un format spécifique */
    Date.prototype.format = Date.prototype.toFormat = Date.prototype.toDateFormat = function(format){
        return dateFormat(this.valueOf(),format);
    }
    
    /*** formate la date passé en paramètre à un format spécifique */
    Date.prototype.toSQLFormat = Date.prototype.toSQLDateFormat = function(){
        return dateFormat(this.valueOf(),DateLib.SQLDateFormat);
    }
    
    Date.prototype.toSQLDateTimeFormat = Date.prototype.toSQLDateTime = function(){
        return dateFormat(this.valueOf(),DateLib.SQLDateTimeFormat);
    }
    
    Date.prototype.toSQLTimeFormat = function(){
        return dateFormat(this.valueOf(),DateLib.SQLTimeFormat);
    }
    
    Date.prototype.toDefaultFormat = Date.prototype.toDefaultDateFormat = function(){
        return dateFormat(this.valueOf(),DateLib.defaultDateFormat);
    }
    
    Date.prototype.toDefaultTimeFormat = function(){
        return dateFormat(this.valueOf(),DateLib.defaultTimeFormat);
    }
    Date.prototype.toDefaultDateTimeFormat = function(){
        return dateFormat(this.valueOf(),DateLib.defaultDateTimeFormat);
    }
    Date.prototype.resetHours = function(){
        this.setHours(0);
        return this;
    }
    Date.prototype.resetMinutes = function(){
        this.setMinutes(0);
        return this;
    }
    Date.prototype.resetSeconds = function(){
        this.setSeconds(0);
        return this;
    }
    var dateFormat = (function() {
        var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        var timezoneClip = /[^-+\dA-Z]/g;
    
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc, gmt) {
            if(isNullOrEmpty(date)) {
                date = undefined;
            }
            if (typeof date === 'number') {
                date = new Date(date);
            } else if(typeof date == 'string'){
                var defM = (dateFormat.masks[mask] || mask);
                if(!isNonNullString(defM)){
                    defM = dateFormat.masks['default'];
                }
                var p = parse(date,defM,false);
                if(isDateObj(p)){
                    date = p;
                } else  {
                if(isNonNullString(date) && !isNonNullString(mask)){
                    mask = date;
                }
                date  = undefined;
                }
            }
            if(!(isDateObj(date))) {
                date = new Date();
            }
            mask = (dateFormat.masks[mask] || mask);
            if(!isNonNullString(mask)){
                mask = dateFormat.masks['default'];
            }
    
            // Allow setting the utc/gmt argument via the mask
            var maskSlice = mask.slice(0, 4);
            if (maskSlice.toUpperCase() === 'UTC:' || maskSlice.toUpperCase() === 'GMT:') {
                mask = mask.slice(4);
                utc = true;
                if (maskSlice.toUpperCase() === 'GMT:') {
                    gmt = true;
                }
            }
    
            var _ = utc ? 'getUTC' : 'get';
            var d = date[_ + 'Date']();
            var D = date[_ + 'Day']();
            var m = date[_ + 'Month']();
            var y = date[_ + 'FullYear']();
            var H = date[_ + 'Hours']();
            var M = date[_ + 'Minutes']();
            var s = date[_ + 'Seconds']();
            var L = date[_ + 'Milliseconds']();
            var o = utc ? 0 : date.getTimezoneOffset();
            var W = getWeek(date);
            var N = getDayOfWeek(date);
            if(!isNonNullString(DaysAndMonths.monthNames[m])){
                resetDaysAndMonth();
            }
            var flags = {
            d:    d,
            dd:   pad(d),
            ddd:  DaysAndMonths.dayNames[D],
            dddd: DaysAndMonths.dayNames[D + 7],
            m:    m + 1,
            mm:   pad(m + 1),
            mmm:  defaultStr(DaysAndMonths.monthNames[m]),
            mmmm: defaultStr(DaysAndMonths.monthNames[m + 12]),
            yy:   String(y).slice(2),
            yyyy: y,
            h:    H % 12 || 12,
            hh:   pad(H % 12 || 12),
            H:    H,
            HH:   pad(H),
            M:    M,
            MM:   pad(M),
            s:    s,
            ss:   pad(s),
            l:    pad(L, 3),
            L:    pad(Math.round(L / 10)),
            t:    H < 12 ? 'a'  : 'p',
            tt:   H < 12 ? 'am' : 'pm',
            T:    H < 12 ? 'A'  : 'P',
            TT:   H < 12 ? 'AM' : 'PM',
            Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
            o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S:    i18n.lang("ms_dateformat_dofn")(d),
            W:    W,
            N:    N
            };
            var _r = mask.replace(token, function (match) {
            if (match in flags) {
                if(match === "mmm" || match === "mmmm"){
                    if(!isNonNullString(flags[match])){
                        resetDaysAndMonth();
                        flags.mmm = defaultStr(DaysAndMonths.monthNames[m]);
                        flags.mmmm = defaultStr(DaysAndMonths.monthNames[m + 12]);
                    }
                }
                return flags[match];
            }
            return match.slice(1, match.length - 1);
            });
            return _r;
        };
        })();
    var hoursTok = ["h","hh","H","HH","M","MM","o","s",'l','L','t',"tt","TT",'Z']
    //retourne le format des heures dans le formattage passé en paramètres
    var retrieveTimeFormat = function(format){
        if(!isNonNullString(format)){
            format = dateFormat.masks.default;
        }
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
        return format.replace(token, function (match) {
            if(arrayValueExists(match,hoursTok)) return match;
            return '';
        });
    }
    
    
    function shorten(arr, sLen) {
        var newArr = [];
        for (var i = 0, len = arr.length; i < len; i++) {
        newArr.push(arr[i].substr(0, sLen));
        }
        return newArr;
    }
    
    
    //const SQLDateFormat = "yyyy-mm-dd",SQLDateTimeFormat = "yyyy-mm-dd\'T\'HH:MM:sso",SQLTimeFormat = "HH:MM:ss";
    var defaultD = null;
    dateFormat.masks = {
        'default': isNonNullString(defaultD)? defaultD : 'dd/mm/yyyy HH:MM:ss',
        'defaultDate' : 'dd/mm/yyyy',
        'defaultTime' : 'HH:MM:ss',
        'shortDate':             'm/d/yy',
        'mediumDate':            'mmm d, yyyy',
        'longDate':              'mmmm d, yyyy',
        'fullDate':              'dddd, mmmm d, yyyy',
        'shortTime':             'h:MM TT',
        'mediumTime':            'h:MM:ss TT',
        'longTime':              'h:MM:ss TT Z',
        'isoDate':               SQLDateFormat,
        'isoTime':               SQLTimeFormat,
        'isoDateTime':           SQLDateTimeFormat,
        'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
        'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
    };
    dateFormat.exportableDateFormats = {
        'Short Date1' : 'dd/mm/yyyy',
        'Short Date2':   'd/m/yy',
        'Short Date3':   'm/d/yy',
        'court3':             'yy/m/d',
        'court4':             'dmyy',
        'court5':             'mdyy',
        'Intermédiaire1':      'mmm d, yyyy',
        'long':              'mmmm d, yyyy',
        'complet':              'dddd, mmmm d, yyyy',
        'ISO':                   SQLDateFormat,
        'UTC':        'UTC:yyyy-mm-dd',
        };
    
    // Internationalization strings
    let DaysAndMonths = {
        dayNames: [],
        monthNames: []
    };
    
    export const defaultDateTimeFormat = dateFormat.masks.default;
    export const defaultDateFormat = dateFormat.masks.defaultDate;

    let resetDaysAndMonth = ()=>{
        var dayNames = i18n.lang("ms_date_daynames");
        var monthNames = i18n.lang("ms_date_monthnames");
        var monthNamesShort = shorten(monthNames, 3);
        var dayNamesShort = shorten(dayNames, 3);
    
        DaysAndMonths.dayNames = dayNamesShort;
        DaysAndMonths.monthNames = monthNamesShort;
        DaysAndMonths.monthNamesShort = {};
        /*for(let i in monthNamesShort){
            DaysAndMonths.monthNamesShort[monthNamesShort[i]] = monthNamesShort[i];
        }*/
        for(var i in dayNames){
            DaysAndMonths.dayNames.push(dayNames[i]);
        }
        for(var i in monthNames){
            DaysAndMonths.monthNames.push(monthNames[i]);
        }
    }
    
    function pad(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) {
        val = '0' + val;
        }
        return val;
    }
    
    var isInteger = function (str) {
        if (str.match(/^(\d+)$/)) {
            return true;
        }
        return false;
    };
    var getInt = function (str, i, minlength, maxlength) {
        for (var x = maxlength; x >= minlength; x--) {
            var token = str.substring(i, i + x);
            if (token.length < minlength) {
                return null;
            }
            if (isInteger(token)) {
                return token;
            }
        }
        return null;
    };
    
    /**
     * parsing a date string
     * @param {String} val - date string
     * @param {String} format - format string || null, if null, default format will be get
     * @param {boolelan} returnObj - check if object containaing date,hour,minute,
     * @returns {Object} || NaN the constructed date
     */
    export const parse = function (val, format,returnObj) {
        if(isNullOrEmpty(val)){
            val = new Date();
        }
        if(isDateObj(val)){
            var date = new Date(val);
            if(returnObj === true){
                let month = date.getMonth()+1;
                month = month < 10 ? ('0' + month) : ('' + month);
                return {date: date, year: date.getFullYear(), month,day: ((date.getDate() < 10 ? '0' : '') + date.getDate()),hour:date.getHours(),minute:date.getMinutes(),second:date.getSeconds(),milli:date.getMilliseconds()};
            }
            return date;
        }
        if(!isNonNullString(val)){
            if(returnObj) return null;
            return NaN;
            //throw new Error("invalid date string to parse",date);
        }
        format = defaultStr(format,DateLib.SQLDateFormat);
        val = val + "";
        var iVal = 0;
        var iFormat = 0;
        var c = "";
        var token = "";
        var token2 = "";
        var x, y;
        var now = new Date();
        var year = now.getYear();
        var month = now.getMonth() + 1;
        var date = 1;
        var hh = 0;
        var mm = 0;
        var ss = 0;
        var millis = 0;
        var ampm = "";
        let returnValue = undefined,newDate = null;
        while (iFormat < format.length) {
            // Get next token from format string
            c = format.charAt(iFormat);
            token = "";
            while ((format.charAt(iFormat) === c) && (iFormat < format.length)) {
                token += format.charAt(iFormat++);
            }
            // Extract contents of value based on format token
            if (token === "yyyy" || token === "yy" || token === "y") {
                if (token === "yyyy") {
                    x = 4;
                    y = 4;
                }
                if (token === "yy") {
                    x = 2;
                    y = 2;
                }
                if (token === "y") {
                    x = 2;
                    y = 4;
                }
                year = getInt(val, iVal, x, y);
                if (year === null) {
                    returnValue = NaN;
                    break;
                }
                iVal += year.length;
                if (year.length === 2) {
                    if (year > 70) {
                        year = 1900 + (year - 0);
                    } else {
                        year = 2000 + (year - 0);
                    }
                }
            } else if (token === "mmm" | token === "mmmm") {
                month = 0;
                for (var i = 0; i < DaysAndMonths.monthNames.length; i++) {
                    var monthName = DaysAndMonths.monthNames[i];
                    if (val.substring(iVal, iVal + monthName.length).toLowerCase() === monthName.toLowerCase()) {
                        month = i + 1;
                        if (month > 12) {
                            month -= 12;
                        }
                        iVal += monthName.length;
                        break;
                    }
                }
                if ((month < 1) || (month > 12)) {
                    returnValue = NaN;
                    break;
                }
            } else if (token === "dddd" || token === "ddd") {
                for (var n = 0; n < DaysAndMonths.dayNames.length; n++) {
                    var dayName = DaysAndMonths.dayNames[n];
                    if (val.substring(iVal, iVal + dayName.length).toLowerCase() === dayName.toLowerCase()) {
                        iVal += dayName.length;
                        break;
                    }
                }
            } else if (token === "m" || token === "mm") {
                month = getInt(val, iVal, token.length, 2);
                if (month === null || (month < 1) || (month > 12)) {
                    returnValue = NaN;
                    break;
                }
                iVal += month.length;
            } else if (token === "dd" || token === "d") {
                date = getInt(val, iVal, token.length, 2);
                if (date === null || (date < 1) || (date > 31)) {
                    returnValue = NaN;
                    break;
                }
                iVal += date.length;
            } else if (token === "hh" || token === "h") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 12)) {
                    returnValue = NaN;
                    break;
                }
                iVal += hh.length;
            } else if (token === "HH" || token === "H") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 23)) {
                    returnValue = NaN;
                    break;
                }
                iVal += hh.length;
            } else if (token === "KK" || token === "K") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 11)) {
                    returnValue = NaN;
                    break;
                }
                iVal += hh.length;
            } else if (token === "kk" || token === "k") {
                hh = getInt(val, iVal, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 24)) {
                    returnValue = NaN;
                    break;
                }
                iVal += hh.length;
                hh--;
            } else if (token === "MM" || token === "M") {
                mm = getInt(val, iVal, token.length, 2);
                if (mm === null || (mm < 0) || (mm > 59)) {
                    returnValue = NaN;
                    break;
                }
                iVal += mm.length;
            } else if (token === "l") {//Milliseconds; gives 3 digits.
                millis = getInt(val, iVal, 1, 3);
                if (millis === null || (millis < 0) || (millis >= 1000)) {
                    returnValue =  NaN;
                    break;
                }
                iVal += millis.length;
            }  else if (token === "L") {//Milliseconds; gives 2 digits.
                millis = getInt(val, iVal, 1, 2);
                if (millis === null || (millis < 0) || (millis >= 100)) {
                    returnValue = NaN;
                    break;
                }
                iVal += millis.length;
            } else if (token === "ss" || token === "s") {
                ss = getInt(val, iVal, token.length, 2);
                if (ss === null || (ss < 0) || (ss > 59)) {
                    returnValue = NaN;
                    break;
                }
                iVal += ss.length;
            } else if (token =="tt" | token =='TT') {
                if (val.substring(iVal, iVal + 2).toLowerCase() === "am") {
                    ampm = (token == 'tt')? "am":"AM";
                } else if (val.substring(iVal, iVal + 2).toLowerCase() === "pm") {
                    ampm = (token === 'tt')? 'pm':"PM";
                } else {
                    returnValue = NaN;
                    break;
                }
                iVal += 2;
            } else if (token =="t" | token =='T') {
                if (val.substring(iVal, iVal + 1).toLowerCase() === "a") {
                    ampm = (token == 't')? "a":"A";
                } else if (val.substring(iVal, iVal + 1).toLowerCase() === "p") {
                    ampm = (token === 't')? 'p':"P";
                } else {
                    returnValue = NaN;
                    break;
                }
                iVal += 2;
            } else {
                if (val.substring(iVal, iVal + token.length) !== token) {
                    returnValue = NaN;
                    break;
                } else {
                    iVal += token.length;
                }
            }
        }
        // If there are any trailing characters left in the value, it doesn't match
        if (iVal !== val.length) {
            returnValue = NaN;
        }
        if(returnValue != NaN){
            // Is date valid for month?
            if (month === 2) {
                // Check for leap year
                if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) { // leap year
                    if (date > 29) {
                        returnValue = NaN;
                    }
                } else {
                    if (date > 28) {
                        returnValue = NaN;
                    }
                }
            }
            if(returnValue != NaN && (month === 4) || (month === 6) || (month === 9) || (month === 11)){
                if (date > 30) {
                    returnValue = NaN;
                }
            }
            if(returnValue != NaN){
                // Correct hours value
                if (hh < 12 && ampm && arrayValueExists(ampm,["p","pm","PM"])) {
                    hh = hh - 0 + 12;
                } else if (hh > 11 && ampm && arrayValueExists(ampm,["a","am","AM"])) {
                    hh -= 12;
                }
                newDate = new Date(year, month - 1, date, hh, mm, ss,millis);
            }
        }

        if(returnValue == NaN){
            try {
                let d = new Date(val);
                if(d && d != NaN){
                    newDate = d;
                }
            } catch{}
        }
        if(returnValue != NaN && newDate){
            if(returnObj === true) return {date: newDate, year: year, month: month ,day: date,hour:hh,minute:mm,second:ss,milli:millis};
            return newDate;
        }
        if(returnObj === true){
            return NaN;
        }
        return NaN;
    };
    /**
     * Get the ISO 8601 week number
     * Based on comments from
     * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     *
     * @param  {Object} `date`
     * @return {Number}
     */
    function getWeek(date) {
        // Remove time components of date
        var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Change date to Thursday same week
        targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);
        
        // Take January 4th as it is always in week 1 (see ISO 8601)
        var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
        
        // Change date to Thursday same week
        firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
        
        // Check if daylight-saving-time-switch occurred and correct for it
        var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
        targetThursday.setHours(targetThursday.getHours() - ds);
        
        // Number of weeks between target Thursday and first Thursday
        var weekDiff = (targetThursday - firstThursday) / (86400000*7);
        return 1 + Math.floor(weekDiff);
    }
    
    /**
     * Get ISO-8601 numeric representation of the day of the week
     * 1 (for Monday) through 7 (for Sunday)
     * 
     * @param  {Object} `date`
     * @return {Number}
     */
    function getDayOfWeek(date) {
        var dow = date.getDay();
        if(dow === 0) {
            dow = 7;
        }
        return dow;
    }
    
    // return the number of days in a date's month
    var daysInMonth = function ( dt ) {
        if(isNullOrEmpty(dt)) td = new Date();
        if(isNonNullString(dt) && isValidDate(dt)){
            dt = new Date(dt);
        }
        if(!isDateObj(dt)) {
            console.error("could not retrieve days in month of invalid date object ",dt);
            return 0;
        }
        return dt.getDaysInMonth();
    };
    
    var __addToDate = function(days,date,format,returnDateObj,type) {
        if(!isDecimal(days)) days = 0;
        if(isNullOrEmpty(date)){
            date = new Date();
        }
        if(isValidDate(date) && isNonNullString(date)){
            date = new Date(date);
        }
        if(isBool(format)){
            let t = format;
            format = defaultStr(returnDateObj);
            returnDateObj = t;
        }
        if(!isValidDate(date)&& isNonNullString(date)){
            var t = date;
            if(isValidDate(format)){
                date = new Date(format);
            }
            format = t;
        }
        if(!isValidDate(date)){
        date = isNonNullString(date)? new Date(date): new Date();
        }
        let set = 'set'+type, get = 'get'+type;
        date = date[set](date[get]() + days);
        if(returnDateObj === true) return new Date(date);
        return dateFormat(date,format);
    };
    /*** retourne l'objet date à partir d'une chaine de caractère où un objet date 
         *   @param date : string, dateObj, l'objet date
         *   @param format : le format source de la date à parser si c'est une date en chaine de caractère
         *   @param returnObj : si un objet sera retourné en lieu et place de l'objet date
         *   @return : dateObj or null
         */
    export const toDateObj = function(date,format,returnObj){
        if(isBool(format)){
            let t = returnObj;
            returnObj = format;
            format = t;
        }
        format = defaultStr(format,SQLDateFormat);
        const isDateTime = isValidSQLDateTime(date);
        if(isNonNullString(date)){
            date = date.trim();
        }
        if((isDateTime || isValidSQLDate(date))){
            format = SQLDateTimeFormat;
            ///on ramène au format SQLDateTime
            if(!isDateTime){
                date += " 00:00:00";
            }
            return parse(new Date(date),format,returnObj)
        }
        if(isDateObj(date)) {
            return parse(date,format,returnObj)
        }
        if(!isNonNullString(date)) return null;
        date = parse(date,format,returnObj);
        if(returnObj){
            return isObj(date) && isDateObj(date.date)? date : null;
        }
        if(isDateObj(date)) return date;
        return null;
    }
    
    
    export const isValidDate = function (sDate,format) {  
        if(isBool(sDate)) return false;
        //if(isNullOrEmpty(sDate)) return false;
        if(isDateObj(sDate)) return true;
        if(isNonNullString(sDate)){
            var f = parse(sDate,format,true);
            return (f && isPlainObject(f) && Object.size(f,true)>0);
        }
        if(sDate?.toString() == parseInt(sDate).toString()) return false; 
        var tryDate = new Date(sDate);
        return (tryDate && tryDate.toString() != "NaN" && tryDate != "Invalid Date");  
        }
    
        export const isValidIsoTime = (strTime) =>{
        let timeFormat = /^(?:[01]?\d|2[0-3]):[0-5]\d:[0-5]\d$/;
        return timeFormat.test(strTime);
    };
    let DateLib = {}
    export const isValidSQLDate = (date)=>{
        if(!isNonNullString(date)) return false;
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!date.match(regEx)) return false;  // Invalid format
        var d = new Date(date);
        if(typeof d !='object' || !d) return false;
        var dNum = d.getTime();
        if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return d.toISOString().slice(0,10) === date;
    }
    export const isValidSQLDateTime = (dateTime)=>{
        if(!isNonNullString(dateTime)) return false;
        var regEx = /^\d{4}-\d{2}-\d{2} (?:[01]?\d|2[0-3]):[0-5]\d:[0-5]\d/;
        if(!dateTime.match(regEx)) return false;  // Invalid format
        var d = new Date(dateTime);
        if(typeof d !== 'object' || !d) return false;
        var dNum = d.getTime();
        if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return true;
    }
    export const isSQLDate = function isISODate(value){
        if(isDateObj(value)) return true;
        var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
        if(!isNonNullString(value)) return false;
        // STRING FORMAT yyyy-mm-dd
        var str = value;
        // m[1] is year 'YYYY' * m[2] is month 'MM' * m[3] is day 'DD'					
        var m = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    
        // STR IS NOT FIT m IS NOT OBJECT
        if( m === null || typeof m !== 'object'){return false;}				
    
        // CHECK m TYPE
        if (typeof m !== 'object' && m !== null && m.size!==3){return false;}
    
        var ret = true; //RETURN VALUE						
        var thisYear = new Date().getFullYear(); //YEAR NOW
        var minYear = 1700; //MIN YEAR
    
        // YEAR CHECK
        if( (m[1].length < 4) || m[1] < minYear || m[1] > thisYear){ret = false;}
        // MONTH CHECK			
        if( (m[2].length < 2) || m[2] < 1 || m[2] > 12){ret = false;}
        // DAY CHECK
        if( (m[3].length < 2) || m[3] < 1 || m[3] > 31){ret = false;}
    
        return ret;	
    }
    /*** retourne la première date courante du mois
     * @param {int|Date} year, l'année où la date pour laquelle on veut récuperer la date
     * @param {int} month, le mois pour lequel on veut récupérer la date (valeur comprise entre 0 et 11)
     */
    function getFirstDayOfMonth(year, month) {
        if(year && isDateObj(year)){
            year = date.getFullYear();
            month = date.getMonth();
        } else {
            if(typeof year =='object') year = undefined;
            if(!year && typeof year !='number'){
                year = new Date().getFullYear();
            }
            if(!month || typeof month !='number' || month <0 || month>11){
                month = new Date().getMonth();
            }
        }
        return new Date(year, month, 1);
    }
    /**** prend en paramètre une date au format from =>to et formatte au format français par défaut
     * @param {string} periodDate, la date au format [from] => [to] où from est soit au format SQLDateTime|SQLDate et to est soit au format SQLDateTime|SQLTime
     * @param {boolean} {isDateTime} si la date est au format dateTime où non
     * @return {string} chaine de caractère au format parsé
     */
    function formatDatePeriod(periodDate,isDateTime){
        if(isNonNullString(periodDate)){
            const lang = i18n.getLang();
            const isFR = lang && typeof lang =="string" && lang.toLowerCase() == 'fr';
            const split = periodDate.split("=>");
            let from = split[0], to = split[1];
            if(isValidSQLDateTime(from)){
                isDateTime = true;
                from = parse(from,SQLDateTimeFormat);
            } else if(isValidSQLDate(from)){
                from = parse(from,SQLDateFormat);
            }
            if(isValidSQLDateTime(to)){
                isDateTime = true;
                to = parse(to,SQLDateTimeFormat);
            } else if(isValidSQLDate(from)){
                to = parse(to,SQLDateFormat);
            }
            const dateFormat = isDateTime ? (isFR?defaultDateTimeFormat:SQLDateTimeFormat) : (isFR?defaultDateFormat:SQLDateFormat);
            if(isValidDate(from) && isValidDate(to)){
                return "{0} {1} {2} {3}".sprintf(isFR?"Du":"From",from.toFormat(dateFormat),isFR?"au":"to",to.toFormat(dateFormat));
            }
        }
        return "";
    }
    Object.defineProperties(DateLib,{
        daysInMonth : {
            value : daysInMonth,
            override : false,
            writable : false
        },
        getFirstDayOfMonth : {
            value : getFirstDayOfMonth,
        },
        dateDiff : {
            /*** determine difference of from date to toDate 
             *   @param fromDate {date} : la date de départ
             *   @param toDate {date} : la date à utiliser pour soustraite à fromDate et déterminer la différence
             *        si toDate est nulle où on définie alors il prendra la valeur de la date actuelle
             */
            value : function datediff(fromDate, toDate) {
            if (!fromDate || !isDateObj(fromDate)) {
                console.log(fromDate,' bad date object to evaluate dateDiff funcion');
                //throw new Error('Date should be specified');
                return {};
            }
            var startDate = new Date(1970, 0, 1, 0).getTime(),
                now = new Date(),
                toDate = isDateObj(toDate)? toDate : now,
                diff = toDate - fromDate,
                date = new Date(startDate + diff),
                years = date.getFullYear() - 1970,
                months = date.getMonth(),
                days = date.getDate() - 1,
                hours = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                diffDate = {
                    years: 0,
                    months: 0,
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
    
            if (years < 0) return diffDate;
            diffDate.years = years > 0 ? years : 0;
            diffDate.months = months > 0 ? months : 0;
            diffDate.days = days > 0 ? days : 0;
            diffDate.hours = hours > 0 ? hours : 0;
            diffDate.minutes = minutes > 0 ? minutes : 0;
            diffDate.seconds = seconds > 0 ? seconds : 0;
            return diffDate;
        },
        override:false,
        writable : false
        },
        format : {
            value : (date,toFormat,fromFormat,dateFormatArg1,dateFormatArg2)=>{
                if(isNonNullString(date)){
                    date = DateLib.toObj(date,fromFormat);
                }
                return dateFormat(date,toFormat,dateFormatArg1,dateFormatArg2);
            },
            override : false, writable : false
        },
        parse : {
            value : parse,
            override : false, writable : false
        },
        formatDatePeriod : {
            value : formatDatePeriod,override : false, writable :false
        },
        formatPeriod : {
            value : formatDatePeriod, override : false, writable : false,
        },
        /*** parse une chaine de caractère de type date passée en paramètre issue du format fromFormat et le formate
         *    en la date parsée au forma toFormat
         *  @param : string : la date passé en paramètre au format formFormat
         *  @param : string {undefined} : le format source de la date, par défaut : la date au format sql
         *  @param : string {undefined} l: le format destination de la date à retourner
         *  @return : la date formatté au format toFormat où une chaine de caractère vide
         */
        parse2Format : {
            value : function(date,fromFormat,toFormat){
            fromFormat = typeof fromFormat =='string' && fromFormat ? fromFormat : typeof SQLDateFormat =='string' && SQLDateFormat ? SQLDateFormat :'';
            toFormat = typeof toFormat =='string' && toFormat ? toFormat : DateLib.defaultDateFormat;
            let d = toDateObj(date,fromFormat,false);
            if(d){
                return dateFormat(d,toFormat);
            }
            return defaultStr(date);
            },override:false,writable:false
        },
        formats : {
            value : dateFormat.masks,override:false,writable:false
        },
        masks : {
            value : dateFormat.masks,
            override : false, writable : false
        },
        isDateObj : {
            value : isDateObj,
            override : false, writable : false
        },
		isObj : {
			value : isDateObj,
			override : false, writable : false
		},
        isSQLDate : {
            value : isSQLDate,
            override : false, writable : false
        },
        retrieveTimeFormat : {
            value : retrieveTimeFormat,
            override : false,
            writable : false
        },
        addDays : {
            /**ajoute le nombre de jours jours à l'objet date
             * @param days : number le nombre de jour à ajouter à la date
             * @param date : null la date courante
             * @param format : string or null, le format de la date à  retourner
             * format et date peuvent avoir des rôles inverses
             * @param {bool}, si la date objet sera retournée où la date formattée
             * @return string
             */
            value :  function(days,date,format,returnDateObj){
            return __addToDate(days,date,format,returnDateObj,'Date');
            },
        override : false,
        writable : false
        },
        removeDays : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addDays.apply(this,args);
            },
            override : false,
            writable : false
        }, //les paramètres systèmes, renseignés au niveau de la base de données
        system : {
        writable : false,
        override:false,
        value : {
            time_format : SQLTimeFormat,
            date_format : SQLDateFormat,
            date_time_format : SQLDateTimeFormat,
        },
        },
        addMonths : {
            /**ajoute le nombre de mois à l'objet date
             * @param months : number le nombre de mois à ajouter à la date
             * @param date : null la date courante
             * @param format : string or null, le format de la date à  retourner
             * format et date peuvent avoir des rôles inverses
             * @param {bool}, si la date objet sera retournée où la date formattée
             * @return string
             */
            value :  function(months,date,format,returnDateObj){
            return __addToDate(months,date,format,returnDateObj,'Month');
            },
        override : false,
        writable : false
        },
        addWeeks : {
            value : function(weeks,date,format,returnDateObj){
                weeks = defaultDecimal(weeks)* 7;
                return __addToDate(weeks,date,format,returnDateObj,'Date');
            },override : false, writable : false
        },
        removeWeeks : {
            value : function(weeks,date,format,returnDateObj){
                weeks = -1*Math.abs(defaultDecimal(weeks))* 7;
                return __addToDate(weeks,date,format,returnDateObj,'Date');
            },override : false, writable : false
        },
        removeMonths : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addMonths.apply(this,args);
            },
            override : false,
            writable : false
        },
        addYears : {
            /**ajoute le nombre d'années à l'objet date
             * @param years : number le nombre de mois à ajouter à la date
             * @param date : null la date courante
             * @param format : string or null, le format de la date à  retourner
             * format et date peuvent avoir des rôles inverses
             * @return string
             */
            value  : function(years,date,format,returnObj){
                if(!isDecimal(years)) years = 0;
                if(isBool(format)){
                let t = format;
                format = defaultStr(returnObj);
                returnObj = t;
                }
                date = new Date(DateLib.addDays(0,date,true));
                if(isDateObj(date)){
                    var year = date.getFullYear();
                    if((year+years)<0) years = 0;
                    else years+= year;
                    date = date.setFullYear(years);
                    if(returnObj){
                        return new Date(date);
                    }
                    return DateLib.format(date,format) 
                }
                return null;
            },
            override : false,
            writable : false
        },
        removeYears : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addYears.apply(this,args);
            },
            override : false,
            writable : false
        },
        
        addHours : {
            value : function(hours,dateObj){
                if(!isDecimal(hours)){
                    hours = 0;
                }
                return DateLib.addMilliseconds(hours * 3600000,dateObj);
            },
            override : false,
            writable:false
        },
        removeHours : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addHours.apply(this,args);
            },
            override : false,
            writable : false
        },
        addMinutes : {
            value : function(minutes,dateObj){
                if(!isDecimal(minutes)){
                    minutes = 0;
                }
                return DateLib.addMilliseconds(minutes * 60000,dateObj);
            },
            override : false,
            writable:false
        },
        removeMinutes : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addMinutes.apply(this,args);
            },
            override : false,
            writable : false
        },
        addSeconds : {
            value : function(seconds,dateObj){
                if(!isDecimal(seconds)){
                    seconds = 0;
                }
                return DateLib.addMilliseconds(seconds * 1000,dateObj);
            },
            override : false,
            writable:false
        },
        removeSeconds : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addSeconds.apply(this,args);
            },
            override : false,
            writable : false
        },
        removeMilliSeconds : {
            value : function(){
                var args = Array.prototype.slice.call(arguments,0);
                if(!isDecimal(args[0])) args[0] = 0;
                args[0] = -1*args[0];
                return DateLib.addMilliseconds.apply(this,args);
            },
            override : false,
            writable : false
        },
        /**
         * adding milliseconds
         * @param {Object} dateObj - date object
         * @param {Number} milliseconds - adding millisecond
         * @returns {Object} the date after adding the value
         */
        addMilliseconds : {
            value : function(milliseconds,dateObj){
                if(!isDateObj(dateObj)){
                    dateObj = new Date();
                }
                return new Date(dateObj.getTime() + milliseconds);
            },
            override : false,
            writable : false
        },
        SQLDateFormat : {
            value : SQLDateFormat,override:false,writable:false
        },
        defaultDateFormat : {
            value : dateFormat.masks.defaultDate,override:false,writable:false
        },
        defaultTimeFormat : {
            value : dateFormat.masks.defaultTime,override:false,writable:false
        },
        defaultDateTimeFormat : {
            value : defaultDateTimeFormat,override:false,writable:false
        },
        SQLDateTimeFormat : {
            value : SQLDateTimeFormat,override:false,writable:false
        },
        SQLTimeFormat : {
            value : SQLTimeFormat,override:false,writable:false
        },
        isValidTime : {
            value : (strTime) => {
            if(!isNonNullString(strTime)) return false;
            let timeFormat = /^(?:1[0-2]|0?[0-9]):[0-5][0-9]\s?(?:am|pm)?/;
            return timeFormat.test(strTime);
        },override : false, writable : false
        },
        /**** teste s'il s'agit d'une heure valide au format hh:mm:ss */
        isValidIsoTime : {
            value : isValidIsoTime,override : false, writable : false,
        },
        isValidSQLTime : {
            value : isValidIsoTime,override : false, writable : false,
        },
        isValidSQLDateTime : {
        value : isValidSQLDateTime,override:false, writable:false
        },
        isValid : {
            value : isValidDate,
        },
        isValidDate : {
            value : isValidDate,
            override : false, writable : false
        },//return current date to SQL
        isValidSQLDate : {
            value : isValidSQLDate,
            override : false, writable : false
        },
        isValidISODate : {
        value : isValidSQLDate,
        override : false, writable : false
        },
        SQLDate : {
            value : function(date){
                return dateFormat(date,SQLDateFormat);
            },
            override : false, writable : false
        },
        isoDate : {
        value : function(date){
                return dateFormat(date,SQLDateFormat);
            },
            override : false, writable : false
        },
        DAYS_AND_MONTHS : {
            value : DaysAndMonths,override:false, writable : false,
        },
        decompose : {
        /*** prend en paramètre une date de type chaine de caractère puis retourne un objet contenant : 
         *  {
         *      dateStr : ///la valeur de la date au format dateFormat, défault : dd/mm/yyyy ou au format passé en paramètre
         *      year : // l'année de la date,
         *      month : // le mois correspondant
         *      day : // le jour correspondant
         *  }
         *  @param : le format de retour de la date
         */
        value : function(dateStr,format){
            if(dateStr){
                let date = DateLib.toObj(dateStr,true);
                if(isObj(date) && isNonNullString(date.day)){
                    dateStr = DateLib.format(date.date,defaultStr(format,DateLib.formats.defaultDate));
                    date.shortMonth = "";
                    if(isObj(DaysAndMonths) && isArray(DaysAndMonths.monthNames)){
                        let m = parseInt(date.month)-1;
                        date.shortMonth = defaultStr(DaysAndMonths.monthNames[m]);
                    }
                    return {...date,dateStr}
                }
            }
            return {dateStr : '',month:'',year:'',day:'',shortMonth:''}
        },
        override : false, writable : false
        },
        /*** retourne l'objet date à partir d'une chaine de caractère où un objet date 
         *   @param date : string, dateObj, l'objet date
         *   @param format : le format source de la date à parser si c'est une date en chaine de caractère
         *   @return : dateObj or null
         */
        toDateObj : {
        value : toDateObj,
        override : false, writable : false
        },
        toTimeObj : {
        value : function(date,format){
            return toDateObj(date,defaultStr(format,SQLTimeFormat))
        },
        override : false, writable : false
        },
        toObj : {
        value : toDateObj,
        override : false, writable : false
        }, 
        toObject : {
        value : toDateObj,
        override : false, writable : false
        },
        //current date to sql date time
        SQLTime : {
            value : function(date){
                return dateFormat(date,SQLTimeFormat);
            },
            override : false, writable : false
        },
        isoTime : {
            value : function(date){
                return dateFormat(date,SQLTimeFormat);
            },
            override : false, writable : false
        },
        SQLDateTime : {
            value : function(date){
                return dateFormat(date,SQLDateTimeFormat);
            },
            override : false, writable : false
        },
        isoDateTime : {
        value : function(date){
            return dateFormat(date,SQLDateTimeFormat);
        },
        override : false, writable : false
        },
        now : {
            value : function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift(new Date());
            return dateFormat.apply(this,args);
            },
            override : false, writable : false
        },
        toDay : {
        value : function(){
            return new Date();
            },
            override : false, writable : false
        },
        token : {
            value : token,
            override:false,
            writable : false
        },
        previousWeekDaysLimits : {
            ///retourne les dates limites de la semaine passée 
            value : (date)=>{
                let cDate = isValidDate(date)? new Date(date) : new Date();
                var beforeOneWeek = new Date(cDate.getTime() - 60 * 60 * 24 * 7 * 1000)
                var beforeOneWeek2 = new Date(beforeOneWeek);
                let day = beforeOneWeek.getDay()
                let diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
                return {first:new Date(beforeOneWeek.setDate(diffToMonday)),last:new Date(beforeOneWeek2.setDate(diffToMonday + 6))}
            },override : false
        },
        currentWeekDaysLimits : {
            ///retourne les dates limites de la semaine courante 
            value : (date)=>{
                const currentDate = isValidDate(date)? new Date(date) : new Date();
                const day = currentDate.getDay(), diff = currentDate.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
                return {first:new Date(currentDate.setDate(diff)),last:currentDate}
            },override : false
        },
        currentMonthDaysLimits : {
            ///retourne les dates limites de la semaine courante 
            value : (date)=>{
                const currentDate = isValidDate(date)? new Date(date) : new Date();
                return {first:new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),last:currentDate}
            },override : false
        },
        /***** retourne la date calculée depuis le nombre count et selon l'intervale since
         * @param {number}: count : le nombre à additionner à la date courante selon l'intervale interval
         * @param {[years,months,weeks,days,hours]} : interval, l'intervalle à utiliser pour le calcul, compris entre 
         * @param {date} : fromDate, la date à partir de laquelle l'on désire déterminer la date courante; 
         * @return {dateObj || null}, date object resultat du calcul, ou null si les paramètres sont invalides
         * par exemple : 
         *    getDateSince(1,"months") : retourne la date calculée en additionnant 1 mois sur la date courante
         *    getDateSince(-1,"months") : retourne la date calculée en retrachant 1 mois sur la date courante
         */
        getDateSince : {
            value : (count,interval,fromDate)=>{
            if(!isDecimal(count) || !isNonNullString(interval)){
                return null;
            }
            let t = "add"+interval.trim().toLowerCase().ucFirst();
            if(!isFunction(DateLib[t])){
                return null;
            }
            fromDate = fromDate && isValidDate(fromDate)? new Date(fromDate) : new Date();
            let date = DateLib[t](count,fromDate,true);
            if(!isDateObj(date)){
                return null;
            }       
            return date;
            }, override : false
        }
    })
    
    DateLib.toSQLDate = DateLib.SQLDate;
    DateLib.toSQLDateTime = DateLib.SQLDateTime;
    DateLib.toSQLTime = DateLib.SQLTime;
    
    i18n.on("ready",()=>{
        resetDaysAndMonth();
    })
    
    export default DateLib;
    

    const isNullOrEmpty = function (object){
        if(isDateObj(object)) return false;
        if(typeof object == 'number') return false;
        if(typeof object == 'undefined' || object === null || object === undefined || object === '') return true;
        if(typeof object == 'string'){
            return (object == null | object == '');
        }
        if(Array.isArray(object)){
            return object.length ? false : true;
        }
        if(typeof object == 'object'){
            for(let i in object){
                return false;
            }
            return true; 
        }
        return false;
    }