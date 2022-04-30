import React from "react";
import TwitterLogin from "react-twitter-login";

const API_KEY = 'Htjji9l5X1C14ooqTnyQvRKDs';
const API_KEY_SECRET = 'kgOHN8MaXJrxrWp7wtrX4JvTieng93ggSw39bHs3kkgCGQSryh';

export default (props) => {
  const authHandler = (err, data) => {
    console.log(err, data);
  };

  return (
    <TwitterLogin
      authCallback={authHandler}
      consumerKey={API_KEY}
      consumerSecret={API_KEY_SECRET}
    />
  );
};
