/* eslint-disable import/no-anonymous-default-export */
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../services/api";

export default ({user,setUser}) => {
  const responseGoogle = async (authResult) => {
    console.log("authResult", authResult);

    // {
	//  code: '4/0AanRRrvTfUZMbynGp60RjlbqyQXoU-_K1LmeSXvs8X6hLsqqq9Jc2-N18oP4MMRDX53qFA',
	//  scope: 'email profile openid https://www.googleapis.com/au…le https://www.googleapis.com/auth/userinfo.email',
	//  authuser: '0', 
	// hd: 'klizos.com',
	//  prompt: 'consent'
	// }



    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);//// sending authorization code to the node server
        console.log("result", result);

        setUser(result.data.data.user);
        alert("successfuly logged in");
      } else {
		
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
	  
      console.log(e);
    }
  };



  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,  /// get authorization code
    onError: responseGoogle,
    flow: "auth-code",
  });




  return (
    <button
      style={{
        padding: "10px 20px",
      }}
      onClick={googleLogin}
    >
      Sign in with Google
    </button>
  );
};
