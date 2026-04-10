import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


import { MainLayout, Layout } from 'layouts/index.jsx';
import routes from "./routes";

const Landing = lazy(() => import("pages/landing/Landing"));
const Dashboard = lazy(() => import("pages/dashboard"));
const PageNotFound = lazy(() => import("pages/404_page"));
const ContactUs = lazy(() => import("pages/footer/ContactUs"));
const Privacy = lazy(() => import("pages/footer/Privacy"));
const Term = lazy(() => import("pages/footer/Term"));
const About = lazy(() => import("pages/footer/About"));
const Cookies = lazy(() => import("pages/footer/Cookies"));
const Blog = lazy(() => import("pages/footer/Blog"));

const PageRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [authStatus, setAuthStatus] = useState(isAuthenticated);

  useEffect(() => {
    setAuthStatus(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ background: "#1e1e1e", width: "100vw", height: "100vh" }} />}>
        <Routes>

          {/* Public Routes */}
          <Route
            path="/"
            element={authStatus ? <Navigate to="/dashboard" replace /> : <Landing />}
          />
          <Route
            path="/home"
            element={authStatus ? <Navigate to="/dashboard" replace /> : <Landing />}
          />

          {/* Auth Routes (only if not logged in) */}
          {!authStatus &&
            routes.auth.map((route) => (
              <Route key={route.path} path={route.path} element={route.component} />
            ))
          }

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            <Route element={authStatus ? <Layout /> : <Navigate to="/auth/login" replace />}>

              {/* Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              {routes.menu.map((route) => (
                <Route key={route.path} path={route.path} element={route.component} />
              ))}
              {routes.submenu.map((route) => (
                <Route key={route.path} path={route.path} element={route.component} />
              ))}
              {routes.profile.map((route) => (
                <Route key={route.path} path={route.path} element={route.component} />
              ))}
              {routes.tabs.map((route) => (
                <Route key={route.path} path={route.path} element={route.component} />
              ))}

            </Route>
          </Route>
            <Route path="/contactus" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<Privacy/>} />
          <Route path="/terms-of-service" element={<Term/>} />
          <Route path="/about-us" element={<About/>} />
          <Route path="/cookie-policy" element={<Cookies/>} />
          <Route path="/blog" element={<Blog/>} />
          {/* Catch-all route - always last */}
          <Route path="*" element={<PageNotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default PageRoute;
