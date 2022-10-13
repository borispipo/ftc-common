
import useSWR from 'swr';
import { getFetcherOptions } from '$api';
import {defaultObj} from "$utils";

/****
 * Cette fonction est une abstraction au hook useSWR de @https://swr.vercel.app/docs/with-nextjs
 * Elle a pour rôle de préfixer les url (path) passés en paramètres par l'url de base du site de déploiement de l'application
 * généré par la commande next export, voir https://nextjs.org/docs/advanced-features/static-html-export.
 * Il est à noter que, en utilisant next export, toutes les api routes sont supprimés des fichiés générés. ça rend donc impossible
 * l'utilisation des api pour la récupération des données au serveur.
 * A supposer que les api sont déployé sur un serveur distant dont l'adresse url root est enregistré dans la constante
 * BASE_PATH de ../utils
 * @param opts {string|object} si opts est une chaine de caractère, alors il s'agira de l'url à exécuter la fonction fetch
 * opts est de la forme : {
 *    path : {string}: le chemin de l'api qu'on veut préfixer,
 *    options : {object} : les options à passer à la fonction useSWR : voir https://swr.vercel.app/docs/options
 *    fetcher : {function} : la fonction de récupération des données distante. par défaut, (url)=>fetch(url); ou fetch est par défaut importé du package 'unfetch'
 *    queryParams : {object} : les paramètres queryString à passer à la fonction buildAPIPath
 * }
 * 
 */
export default function useSwr (path,opts) {
    const {fetcher,url,...options} = getFetcherOptions(path,opts);
    const { data, error,...rest } = useSWR(url, fetcher,options)
    return {
      ...defaultObj(rest),
      data,
      isLoading: !error && !data,
      isError: error,
      hasError : error,
      error,
    }
  }