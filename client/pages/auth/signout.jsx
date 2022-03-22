import React, { useEffect } from "react";
import Router from "next/router";
import { useRequest } from "../../hooks/user-request";

const SignOut = () => {
  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    onSuccess: () => Router.push("/"),
  });
  useEffect(() => {
    doRequest();
  }, []);
  return <div>Signing you out ...</div>;
};

export default SignOut;
