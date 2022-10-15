// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default {
    default_datetime_format : 'yyyy/mm/dd H:M:ss',
    default_date_format : 'yyyy/mm/dd',
    default_time_format : 'hh:MM TT',
    before_current_date_an : 'Before current day',
    unselected_row : 'Unchecked',
    current_day : 'Current day',
    current_month : 'Current Month',
    current_year : 'Current Year',
    current_hour : 'Current Hour',
    specified_date : 'Specified Date',
    start_date_period : 'Form Start Date',
    display_end_interval : 'For the Duration',
    hour : 'Hour',
    day : 'Day',
    day_an : 'Day',
    week : 'Week',
    month : 'Month',
    month_an:'Month',
    year_an : 'Year',
    year : 'Year',
    datepicker_show_date_selector : 'Display date selector',
    datepicker_show_time_selector : 'Display Time selector',
    'ms_dateformat_dofn' : function DoFn(D) {
        return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
    },
    ms_date_daynames : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ms_date_monthnames : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}