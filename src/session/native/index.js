/*** for usage, @see : https://github.com/raphaelpor/sync-storage */
import AsyncStorage from '@react-native-async-storage/async-storage';
import isPromise from "$utils/isPromise";
import {handleError} from './helpers';
import {stringify} from "$utils/json";

let currentInitSession = undefined;

export const isInitialized = x=> isPromise(currentInitSession);

class SyncStorage {
  data = new Map();
  loading = true;

  init() {
    if(isInitialized()){
      return currentInitSession;
    }
    currentInitSession = AsyncStorage.getAllKeys().then((keys) =>
      AsyncStorage.multiGet(keys).then((data) => {
        data.forEach(this.saveItem.bind(this));
        this.isInitialized = true;
        return [...this.data];
      }),
    );
    return currentInitSession;
  }

  get(key) {
    return this.data.get(key);
  }

  set(key, value) {
    if (!key) return handleError('set', 'a key');
    this.data.set(key, value);
    value = stringify(value);
    return AsyncStorage.setItem(key, value).then((v)=>{return {[key]:value}});
  }

  remove(key) {
    if (!key) return handleError('remove', 'a key');

    this.data.delete(key);
    return AsyncStorage.removeItem(key);
  }

  saveItem(item) {
    let value;

    try {
      value = JSON.parse(item[1]);
    } catch (e) {
      [, value] = item;
    }

    this.data.set(item[0], value);
    this.loading = false;
  }

  getAllKeys(){
    return Array.from(this.data.keys());
  }
}


const syncStorage = new SyncStorage();

syncStorage.init();

export default syncStorage;