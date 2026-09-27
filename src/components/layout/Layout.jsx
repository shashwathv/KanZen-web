import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import GridBackground from "../landing/GridBackground";

// Shared shell for every route. Keeping the header here (rather than in each
// page) means it stays mounted across navigation, so the API health check
// and scroll state aren't reset on every page change.
export default function Layout() {
  return (
    <>
      <GridBackground />
      <div className="app-content">
        <Header />
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
}
