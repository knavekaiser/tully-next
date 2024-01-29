import { Provider } from "../SiteContext";
import "../styles/globals.scss";

import NProgress from "nprogress";
import Router, { useRouter } from "next/router";

Router.onRouteChangeStart = (url) => NProgress.start();

Router.onRouteChangeComplete = () => NProgress.done();

Router.onRouteChangeError = (err) => NProgress.done();

String.prototype.bn = function () {
  return this.replace(/1/g, "১")
    .replace(/2/g, "২")
    .replace(/3/g, "৩")
    .replace(/4/g, "৪")
    .replace(/5/g, "৫")
    .replace(/6/g, "৬")
    .replace(/7/g, "৭")
    .replace(/8/g, "৮")
    .replace(/9/g, "৯")
    .replace(/0/g, "০");
};

NProgress.configure({
  easing: "ease",
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200,
  showSpinner: false,
  parent: "#__next .gred",
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
