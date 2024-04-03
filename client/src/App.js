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

  return (
      <Routes>
        <Route path='/' element={<Layout isAuthenticated={isAuthenticated}/>} />
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
        <Route path='dashboard' element={<Dashboard isAuthenticated={isAuthenticated} />} />
      </Routes>
  );
}

function Layout ({ isAuthenticated }) {
  return (
    <>
      <nav>
            <button>Log Out</button>
      </nav>
      <Outlet />
    </>
  );
}

export default App;