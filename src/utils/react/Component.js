import {uniqid,defaultObj,isFunction,isBool,autobind,debounce} from "$utils";
import { observable,addObserver } from "$lib/observable";
const previousStateSymbol = uniqid("prev-state-react-comopp");
import React from "react";
import PropTypes from "prop-types";
import APP from "$app/instance";

export class BaseComponent extends React.PureComponent {
    constructor(props){
        super(props);
        this.state = {};
        this.__isMounted = false; 
        /*** ajout de l'objet _events aux classe, pour la prise en compte de la gestion des évènements */
        Object.defineProperties(this,{
            _events : {value:{},override:false,writable:false}
        })
        Object.defineProperties(this,{
            _isMounted : {
                value : ()=>{
                    if(isFunction(super._isMounted)){
                        super._isMounted();
                    }
                    return this.__isMounted;
                },override : false,writable:false
            }
        });
        this.autobind = this.autobind.bind(this);
        this.autobind();
    }
    /*** cette fonction peut être appelé juste à l'instant où le contenu react veut être rendu */
    componentWillRender(props){
        return null;
    }
    /**** supprime tous les évènements enregistrés au composant */
    clearEvents (){
        if(isObj(this._events)){
            for(let i in this._events){
                if(APP.off){
                    APP.off(i,this._events[i]);
                }
                delete this._events[i];
            }
        }
        delete this[previousStateSymbol];
    }
    forceRender(cb){ 
        cb = isFunction(cb)? cb : x =>{};
        this.setState({____key:!this.state.____key},cb);
    }
    /*** si le state du composant est en train d'être modifié */
    isStateUpdating(){
        return this.isSettingCurrentComponentState? true : false;
    }
    /*** si l'état du composant react est en train d'être mis à jour */
    isBeingUpdate (){
        return this.isSettingCurrentComponentState? true : false;
    }
    /*** callback de rappel lorsqu'on met à jour le state */
    onUpdateState(){
        return true;
    }
    /**** la fonction a été overrided, pour éviter les erreurs de mise à jours des états de composant
     *  @param : le nouvel état
     *  @parm : le callback à appeler
     *  @param : le boolean pour spécifier si le composant sera mise à jour indépendemment de l'état en cours de mise à jour ou pas
     */
    setState (state,cb,force){
        if(!this._isMounted()) return this;
        if(isFunction(force)){
            cb = isFunction(cb)? cb : force;
            force = undefined;
        }
        if(isBool(cb)){
            let t = cb;
            cb = defaultFunc(force);
            force = t;
        }
        if(this.isSettingCurrentComponentState && !force){
            if(isFunction(cb)){
                cb({context:this});
            }
            return this;
        }
        this.isSettingCurrentComponentState = true;
        super.setState(state,()=>{
            this.isSettingCurrentComponentState = undefined;
            if(isFunction(cb)){
                cb()
            }
            this.onUpdateState(state);
        });
        return this;
    }
    static getDerivedStateFromError(error,info) {
        console.log(error,info," will return wil dkdkdkdd")
        // Update state so the next render will show the fallback UI.
        return {
            caughtAnError : true,
            caughtError:error,
            caughtInfo:info 
        };
    }
    componentDidCatch(error, info) {
        //(error, info);
    }
    getPreviousState(){
        return defaultObj(this[previousStateSymbol]);
    }
    UNSAFE_componentWillMount(){}
    componentWillUnmount(){
        this.__isMounted = false;
        if(isFunction(this.props.onUnmount)){
            this.props.onUnmount({context:this,props:this.props});
        };
    }
    componentDidMount(){
        this.__isMounted = true;
        if(isFunction(this.props.onMount)){
            this.props.onMount({context:this,props:this.props});
        }
    }
    componentDidUpdate(){}
    autobind (){
        autobind.apply(this,Array.prototype.slice.call(arguments,0));
    }
}



export default class Component extends BaseComponent {
    constructor(props){
        super(props);
        this.state.caughtAnError = false;
    }
    resetCatchedError(){
        this.setState({caughtAnError:false})
    }
}

Component.propTypes = {
    onMount : PropTypes.func
}
export class ObservableComponent extends Component {
    constructor(props){
        super(props);
        observable(this);
        addObserver(this);
    }
    componentWillUnmount(){
      super.componentWillUnmount();
      this.offAll();
    }
};