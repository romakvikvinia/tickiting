import { useState } from "react";
import axios from "axios";

export const useRequest = ({ url, method = "get", body = {}, onSuccess }) => {
  const [{ errors }, setState] = useState({
    errors: [],
  });

  const doRequest = async (props = {}) => {
    try {
      setState((prevState) => ({ ...prevState, errors: [] }));
      const res = await axios[method](url, {
        ...body,
        ...props,
      });
      if (onSuccess) {
        onSuccess(res.data);
      }
      return res.data;
    } catch (error) {
      console.log(error);
      setState((prevState) => ({
        ...prevState,
        errors: (
          <div className="alert alert-danger">
            <h4>Ooops....</h4>
            <ul className="my-0">
              {error.response.data.errors.map((err) => (
                <li key={err.field}>{err.message}</li>
              ))}
            </ul>
          </div>
        ),
      }));
    }
  };

  return { doRequest, errors };
};
