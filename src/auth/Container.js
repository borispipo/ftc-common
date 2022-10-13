import { useAuth } from "./AuthProvider";
import React from "$react";
import PropTypes from "prop-types";
import AuthGuard from "./AuthGuard";

/***Wrapper for protected page */
export default function AuthContainer({ children,required,...rest }) {
    const auth = useAuth(); 
    if(required === false){
      return React.isValidElement(children)? children : typeof children =='function'? children(auth): null;
    }
    return <AuthGuard {...rest} children={children}/>
  }

  AuthContainer.propTypes = {
    ///si l'authentification est requis pour afficher la page
    required : PropTypes.bool,
  }