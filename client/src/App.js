import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom'
import axios from 'axios';
import './App.css';
import Landing from "./components/Landing";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import Dashboard from "./components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return window.localStorage.getItem('auth') !== null;
  });

  const logIn = async (username, password) => {
    const url = "/api/login";
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'auth', JSON.stringify(response.data.token)
      );
      setIsAuthenticated(true);
      return { response, isError: false };
    } catch (error) {
      console.error(error);
      return { response: error, isError: true };
    }
  }

  const logOut = () => {
    window.localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  return (
      <Routes>
        <Route path='/' element=
          {
            <Layout
              isAuthenticated={isAuthenticated}
              logOut={logOut}
            />
          }
        />
        <Route index element={<Landing />} />
        <Route
          path='sign-up'
          element={<SignUp isAuthenticated={isAuthenticated} />}
        />
        <Route
          path='log-in'
          element={
            <LogIn logIn={logIn} isAuthenticated={isAuthenticated} />
          }
        />
        <Route path='dashboard' element={<Dashboard isAuthenticated={isAuthenticated} logOut={logOut} />} />
      </Routes>
  );
}

function Layout ({ isAuthenticated, logOut }) {
  return (
      <Outlet />
  );
}

export default App;