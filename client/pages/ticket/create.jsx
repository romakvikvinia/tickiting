import React, { useCallback, useState } from "react";
import Router from "next/router";
import { useRequest } from "../../hooks/user-request";

const Create = ({ user }) => {
  const [state, setState] = useState({
    title: "",
    price: "",
  });

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title: state.title,
      price: state.price,
    },
    onSuccess: (ticket) => Router.push("/"),
  });

  const handelChange = useCallback((e) => {
    const { value, name } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handlerBlur = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      price: isNaN(parseFloat(prevState.price))
        ? ""
        : parseFloat(prevState.price),
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      doRequest();
    },
    [doRequest]
  );
  return (
    <div>
      <h1>Create Ticket</h1>
      <form action="" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={state.title}
            onChange={handelChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="">Price</label>
          <input
            type="text"
            className="form-control"
            name="price"
            value={state.price}
            onChange={handelChange}
            onBlur={handlerBlur}
          />
        </div>
        {errors}
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
};
Create.getInitialProps = async (context, client, user) => {
  // we ar on server or browser

  return {};
};
export default Create;
