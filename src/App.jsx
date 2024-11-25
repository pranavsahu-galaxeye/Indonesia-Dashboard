import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './components/Map/Map';
import Sidebar from './components/Sidebar/Sidebar';
import SignIn from './components/Authentication/SignIn';
import { AuthProvider, AuthContext } from './components/Authentication/AuthContext';
import logo from '../public/galaxeye-white.png'; // Update the path based on your directory structure
import './App.css';

const App = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    const fetchGeojson = async () => {
      try {
        const response = await fetch('/telangana_ponds_final_cleaned.geojson');
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON data: ${response.statusText}`);
        }
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchGeojson();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} geojsonData={geojsonData} />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

const Dashboard = ({ geojsonData }) => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="navbar">
        <img src={logo} alt="Company Logo" className="logo" />
        <div className="navbar-title"></div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      <div className="content">
        <Map />
        <Sidebar geojsonData={geojsonData} />
      </div>
    </>
  );
};

const ProtectedRoute = ({ component: Component, geojsonData, ...rest }) => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? <Component geojsonData={geojsonData} {...rest} /> : <SignIn />;
};

export default App;
