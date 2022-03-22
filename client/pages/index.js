import React from "react";
import Link from "next/link";

const Index = ({ user, tickets }) => {
  const ticketList = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href={`/ticket/[ticketId]`} as={`/ticket/${ticket.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>actions</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

Index.getInitialProps = async (context, client, user) => {
  // we ar on server or browser

  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};
export default Index;
