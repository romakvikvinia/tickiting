import React, { useState, useCallback } from "react";
import Router from "next/router";
import { useRequest } from "../../hooks/user-request";

const SignIn = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: state,
    onSuccess: () => Router.push("/"),
  });
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      doRequest();
    },
    [state]
  );
  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label htmlFor="">Email Address</label>
        <input
          type="text"
          className="form-control"
          name="email"
          value={state.email}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="">Password</label>
        <input
          type="password"
          className="form-control"
          name="password"
          value={state.password}
          onChange={handleChange}
        />
      </div>

      {errors}
      <button type="submit" className="btn btn-primary">
        Sign In
      </button>
    </form>
  );
};
export default SignIn;
