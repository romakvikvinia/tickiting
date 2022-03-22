import React from "react";
import Router from "next/router";

import { useRequest } from "../../hooks/user-request";

export const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => Router.push("/order/[orderId]", `/order/${order.id}`),
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors}
      <button
        type="button"
        onClick={() => doRequest()}
        className="btn btn-primary"
      >
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (context, client, user) => {
  // we ar on server or browser
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};
export default TicketShow;
