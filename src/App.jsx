import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Navigation from "./components/Navigation";
import ChatPage from "./pages/chat/Chat";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import NotFound from "./404";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { setUserFromStorage } from "./redex/saga/store";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(setUserFromStorage());
  }, [dispatch]);

  const hideNavbarPages = ["/login", "/register"];
  const shouldHideNavbar = hideNavbarPages.includes(location.pathname);

  return (
    <>
      <Navigation />
      <div
        className={`main-content ${shouldHideNavbar ? "no-navbar" : ""} page-transition`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute restricted>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute restricted>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="*"
            element={
              <PublicRoute>
                <NotFound />
              </PublicRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;