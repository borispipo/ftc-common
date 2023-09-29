// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


import useSWR from 'swr';
import { getFetcherOptions as apiGetFetcherOptions } from '$capi';
import {defaultStr ,extendObj,isNonNullString,isObjOrArray} from "$cutils";
import {setQueryParams} from "$cutils/uri";
import appConfig from "$capp/config";
import React from 'react';
import useNativeSWRInfinite from 'swr/infinite'

/****
 * Cette fonction est une abstraction au hook useSWR de https://swr.vercel.app
 * Elle a pour rôle de préfixer les url (path) passés en paramètres par l'url de base du site de déploiement de l'application
 * généré par la commande next export, voir https://nextjs.org/docs/advanced-features/static-html-export.
 * Il est à noter que, en utilisant next export, toutes les api routes sont supprimés des fichiés générés. ça rend donc impossible
 * l'utilisation des api pour la récupération des données au serveur.
 * A supposer que les api sont déployé sur un serveur distant dont l'adresse url root est enregistré dans la constante
 * BASE_PATH de ../utils
 * @param opts {string|object} si opts est une chaine de caractère, alors il s'agira de l'url à exécuter la fonction fetch
 * opts est de la forme : {
 *    path : {string}: le chemin de l'api qu'on veut préfixer,
 *    swrOptions : {object} les options à passer à la fonction swr, voir https://swr.vercel.app/docs/options
 *    options : {object} : les options à passer à la fonction useSWR : voir https://swr.vercel.app/docs/options
 *    fetcher : {function} : la fonction de récupération des données distante. par défaut, (url)=>fetch(url); ou fetch est par défaut importé du package 'unfetch'
 *    queryParams : {object} : les paramètres queryString à passer à la fonction buildAPIPath, @see api/fetch {@link api/fetch}
 * }
 * 
 */
export default function useSwr (path,opts) {
  const {swrOptions,...options} = defaultObj(opts);
  const { data, error,mutate,...rest } = useSWR(path,(url)=>{
    const {url:fUrl,fetcher,...rest} = getFetcherOptions(url,options);
    return fetcher(fUrl,rest);
  },swrOptions);
  return {
    ...rest,
    mutate,
    refresh : (key, customData, options)=>{
       return mutate(defaultStr(key,path),isObjOrArray(customData) && Object.size(customData,true) ? customData : data,options);
    },
    data,
    isLoading: !error && !data,
    isError: error,
    hasError : error,
    error,
  }
}
/***
 * @see : https://swr.vercel.app/docs/pagination#infinite-loading
 * @param {function|string} la fonction permettant de construire l'url à effectuer la requête, où le chemin de base de l'url
 * @param {object} les options supplémentaires à passer à la fonction fetch
 */
export const useSWRInfinite = (getKey,opts)=>{
  const {swrOptions,fetcher,...options} = defaultObj(opts);
  const pageRef = React.useRef(null);
  const urlRef = React.useRef(null);
  const { data, error,mutate,...rest } = useNativeSWRInfinite((pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null // reached the end
    pageRef.current = pageIndex;
    const fetchUrl = typeof getKey =='function'? getKey({page:pageIndex,previousData:previousPageData,prevData:previousPageData}) : typeof getKey =='string' ? getKey : undefined;
    if(!isNonNullString(fetchUrl)){
       console.warn("l'url à utiliser pour la récupération des données useInfinieSWR ne doit pas être null",options);
       return null;
    }
    return setQueryParams(fetchUrl,{page:pageIndex});
  },typeof fetcher =='function'?fetcher : (url)=>{
    const {url: fUrl,fetcher:cFetcher,...opts2} = getFetcherOptions(url,options);
    return cFetcher(fUrl,opts2);
  },swrOptions);
  return {
    ...rest,
    mutate,
    refresh : (key, data, options)=>{
       return mutate(urlRef.current,data,options);
    },
    data,
    isLoading: !error && !data,
    isError: error,
    hasError : error,
    error,
  }
}
export const useInfinite = useSWRInfinite;

  export const getFetcherOptions = (path,opts)=>{
    const {swrOptions,...rest} = apiGetFetcherOptions(path,opts);
    return {...rest,swrOptions :extendObj(true,{},appConfig.swr,swrOptions)};
  }

  export * from "swr";