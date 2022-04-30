import React from "react";
import ReactFacebookLogin from "react-facebook-login";
export default function FacebookLogin(props) {
  const onResponse = resp => {
    console.log(resp);
    let { email, userID } = resp;
    
  };
  return (
    <ReactFacebookLogin
      appId="1286280471904588"
      autoLoad={true}
      fields="name,email,picture"
      callback={onResponse}
      cssClass="facebook-btn"
      onFailure={onResponse}
    />
  );
}
