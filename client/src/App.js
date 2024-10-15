import React from 'react';
import { Outlet, Route, Routes } from 'react-router-dom'
import axios from 'axios';
import './App.css';
import { getUser, removeAppStorage } from './services/AuthService';
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import SignIn from './pages/SignIn';
import SignUpUp from './pages/SignUpUp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return window.localStorage.getItem('app.auth') !== null;
  });

  const logIn = async (username, password) => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/login`;
    try {
      const response = await axios.post(url, { username, password });
      window.localStorage.setItem(
        'app.auth', JSON.stringify(response.data)
      );
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
        {/*<Route*/}
        {/*  path='sign-up-up'*/}
        {/*  element={<SignUpUp isAuthenticated={isAuthenticated} />}*/}
        {/*/>*/}
        <Route path='log-in' element={<SignIn isAuthenticated={isAuthenticated} logIn={logIn} />} />
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
