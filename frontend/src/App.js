import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // React Router for routing
import Login from './Login';      // Import Login page
import Dashboard from './Dashboard'; // Import Dashboard page
import SellPlayers from './SellPlayers'; // Import SellPlayers page
import Navigation from './Navbar'; // Import Navigation (Navbar) component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles
import { Container } from 'react-bootstrap'; // Container for Bootstrap layout

const App = () => {
  return (
    <AppContent />
  );
};

// AppContent manages what components should be shown
const AppContent = () => {
  const location = useLocation(); // Get the current location (path)

  return (
    <>
      {/* Only show Navigation if we are NOT on the login page */}
      {location.pathname !== '/' && <Navigation />}
      
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sell-players" element={<SellPlayers />} />
        </Routes>
      </Container>
    </>
  );
};

export default App;