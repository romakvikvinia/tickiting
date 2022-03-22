import React from "react";
import Link from "next/link";

export const Header = ({ user }) => {
  const links = [
    !user && {
      label: "Sign Up",
      href: "/auth/signup",
    },
    !user && {
      label: "Sign In",
      href: "/auth/signin",
    },
    user && {
      label: "Sell tickets",
      href: "/ticket/create",
    },
    user && {
      label: "My Orders",
      href: "/order",
    },
    user && {
      label: "Sign Out",
      href: "/auth/signout",
    },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => (
      <li key={href} className="nav-item">
        <Link href={href}>
          <a className="navbar-brand">{label}</a>
        </Link>
      </li>
    ));
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end ">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
