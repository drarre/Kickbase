import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Row, Col } from 'react-bootstrap';
import './Navbar.css';

function Navigation() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        navigate('/');
    };

    const isLoggedIn = !!localStorage.getItem('authToken');

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Row style={{ width: '100%' }} className="w-100">
                <Col className="d-flex justify-content-start">
                    <Nav>
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/sell-players">Sell Players</Nav.Link>
                    </Nav>
                </Col>
                <Col className="d-flex justify-content-end">
                    {isLoggedIn && (
                        <Button
                            variant="outline-light"
                            onClick={handleLogout}
                            className="my-auto"
                        >
                            Logout
                        </Button>
                    )}
                </Col>
            </Row>
        </Navbar>
    );
}

export default Navigation;