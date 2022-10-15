// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export default {
    select_current_date : 'Selectionner la date courante',
    default_datetime_format : 'dd/mm/yyyy HH:MM',
    default_date_format : 'dd/mm/yyyy',
    default_time_format : 'HH:MM',
    before_current_date_an :'Avant jour courant',
    current_day : 'Jour courant',
    current_month : 'Mois courant',
    current_year : 'Année courante',
    current_hour : 'Heure courante',
    specified_date : 'Specifiez la date',
    display_start_date_period : 'A partir du/de',
    display_end_interval : 'Sur interval de',
    hour : 'Heure',
    day : 'Jour',
    day_an : 'Jour',
    week : 'Semaine',
    month : 'Mois',
    month_an:'Moi',
    year_an : 'An',
    year : 'Années',
    datepicker_show_date_selector : 'Afficher le sélecteur de date',
    datepicker_show_time_selector : 'Afficher le sélecteur de temps',
    ms_dateformat_dofn : function DoFn(D) {
        return 'le '+['1er ',' '][D == 1 ? 0:1]+ D;
    },
    ms_date_daynames : ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    ms_date_monthnames : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
}