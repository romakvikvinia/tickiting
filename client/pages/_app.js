import "bootstrap/dist/css/bootstrap.css";
import { jsonRequest } from "../api/build-client";
import { Header } from "../components/Header";

const AppComponent = ({ Component, pageProps, user }) => {
  return (
    <div className="container">
      <Header user={user} />
      <Component user={user} {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  // we ar on server or browser
  const client = jsonRequest(appContext.ctx);
  let response = {};
  try {
    const { data } = await client.get("/api/users/current");
    response = { user: data.user };
  } catch (error) {
    response = { user: null };
  }

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      response.user
    );
  }

  return {
    pageProps,
    user: response.user,
  };
};

export default AppComponent;
