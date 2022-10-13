import date from "./date";
import validator from "./validator";

export const i18nFrLang = {
    fr : {
        ...date,
        ...validator,
        ...require("./auth"),
        home : 'Accueil',
        settings : 'Paramètres',
        meters : 'Compteurs',
        no:'Non',
        yes : 'Oui',
        do_you_really_want_to_delete : 'Voulez vous vraiment supprimer?',
        name : 'Nom',
        remove : 'Supprimer',
        order:'Ordre',
        language : 'Langue',
        choose_your_language : 'Séléctionner la langue de l\'application',
        reload: 'Rafraichir',
        close: 'Fermer',
        search : 'Rechercher',
        selected : 'Sélectionné',
        'checked' : 'Coché',
        'unchecked' : 'Décoché',
          and : 'et',
        characters : 'caractères',
        enabled : 'Actif',
        disabled : 'Inactif',
        loading : 'chargement',
        country : 'Pay',
        coutries : 'Pays',
        dashboard : 'Dashboard',
        no_filter : "Aucun Filtre",
        please_check_your_network : "Ouff!! des soucis internet? Votre connexion internet semble être instable. Veuillez s'il vous plait vérifier vos paramètres internet avant d'essayer d'accéder à nouveau à la ressource demandée."
    }
}