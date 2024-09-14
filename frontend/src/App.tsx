import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import { useLogin } from "./context/UserContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Layout from "./components/layout/Layout";
import Content from "./pages/Content";
import Profile from "./pages/Profile";

function App() {
  const { isLoggedIn, userDetails } = useLogin();

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Layout>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/content/:blob_id"
          element={
            isLoggedIn ? (
              <Layout>
                <Content />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn ? (
              <Layout>
                <Profile address={userDetails.address} />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
