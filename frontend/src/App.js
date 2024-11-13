import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import SellPlayers from './SellPlayers';
import Navigation from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

// AppContent is where the location check happens
const AppContent = () => {
  const location = useLocation(); // Get the current location (path)

  return (
    <>
      {/* Only show Navigation if we're NOT on the login page */}
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