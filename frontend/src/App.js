import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dasboard';
import SellPlayers from './SellPlayers';
import Navigation from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

const App = () => {
  return (
    <Router>
      <Navigation />
      <Container className = "mt-4">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sell-players" element={<SellPlayers />} />
      </Routes>
      </Container>
    </Router>
  );
};

export default App;