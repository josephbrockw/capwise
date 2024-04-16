import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom'
import axios from 'axios';
import './App.css';
import { getUser, removeAppStorage } from './services/AuthService';
import Landing from "./components/Landing";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import Dashboard from "./components/Dashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return window.localStorage.getItem('auth') !== null;
  });

  const logIn = async (username, password) => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/login`;
    console.log(url);
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'app.auth', JSON.stringify(response.data)
      );
      console.log(`getUser: ${JSON.stringify(getUser())}`);
      window.localStorage.setItem('app.user', JSON.stringify(getUser()));

      setIsAuthenticated(true);
      return { response, isError: false };
    } catch (error) {
      console.error(error);
      return { response: error, isError: true };
    }
  }

  const logOut = () => {
    removeAppStorage();
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