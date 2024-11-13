import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

function Navigation() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand >Kickbase Manager</Navbar.Brand>
            <Nav className="ml-auto">
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/sell-players">Sell Players</Nav.Link>
            </Nav>
        </Navbar>
    );
}

export default Navigation;