import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PaperBackground from "./PaperBackground";

// Shared shell for every route. The header stays mounted across navigation,
// so each page change only swaps the content — scroll back to the top when it does.
export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <PaperBackground />
      <Header />
      <main className="site-main">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
