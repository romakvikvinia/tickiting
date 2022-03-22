import { Router } from "next/router";
import React, { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/user-request";

const ShowDetail = ({ order, user }) => {
  const [state, setState] = useState({
    timeLeft: 0,
  });

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/order"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const timeLeft =
        new Date(order.expiresAt) - new Date(new Date().toISOString());
      setState((prevState) => ({
        ...prevState,
        timeLeft: Math.round(timeLeft / 1000),
      }));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  // if (state.timeLeft < 0) return <div>Order Expired</div>;

  return (
    <div>
      Time left to pay: {state.timeLeft} seconds
      <StripeCheckout
        token={(token) => doRequest({ token: token.id })}
        stripeKey="pk_test_51KcYouIIgp7YKA6FzeF2quFJvHt8DTMbXoNGLpT9itiNilenhlBj0zW7ckhYYqkOr7W85ErwGWFnJElc0U3sTouu00sOYghBC4"
        amount={order.ticket.price * 1000}
        email={user.email}
      />
      {errors}
    </div>
  );
};

ShowDetail.getInitialProps = async (context, client, user) => {
  // we ar on server or browser
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default ShowDetail;
