import {defaultStr,isFunction,uniqid,isNonNullString} from "$cutils";
import React from "react";
import {flattenStyle} from "$theme/utils";
import ReactDOM  from "react-dom";
import PropTypes from "prop-types";

const PortalComponent = React.forwardRef((props,ref)=>{
    const {id,nodeId:customNodeId,children,cb,...rest} = props;
    const nodeId = React.useRef(defaultStr(id,customNodeId,props.node,uniqid("app-portail-id"))).current;
    let node = document.getElementById(nodeId);
    if (!(isDOMElement(node))) {
        node = document.createElement('div');
        document.body.appendChild(node);
    } 
    node.id = nodeId;
    if(isFunction(props.onClick)){
        node.onclick = props.onClick;
    }
    if(isNonNullString(props.className)){
        node.setAttribute("class",classNames(props.className));
    }
    Object.assign(node.style,flattenStyle(props.style));
    React.useEffect(()=>{
        return ()=>{
            if(isDOMElement(node)){
                node.remove();
            }
        }
    },[]);
   return ReactDOM.createPortal(
        children,
        node,cb
    );
})
  
  PortalComponent.displayName = "PortalComponent";
  PortalComponent.propTypes = {
    /*** le neoud ou concatener le composant */
    children: PropTypes.node.isRequired,
    /*** si node est une chaine de caractère alors cette chaine sera considéré comme l'id de l'élément qui sera créé */
    node: PropTypes.oneOfType([
        PropTypes.string, //au cas où l'id est passé en paramètre
        PropTypes.node //au cas où c'est un élement dom
    ])
  };

  export default PortalComponent;