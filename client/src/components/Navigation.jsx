import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';

const Navigation = ({ hideNav, setUsername, setPassword, setExpanded, expanded }) => {
  const { loggedIn, isGuest, setIsLoggedIn, setIsGuest } = useAppContext();
  const navigate = useNavigate();

  //For managing login out of the user, setting the states to default
  const handleLogOut = () => {
    setUsername('');
    setPassword('');
    setIsLoggedIn(false);
    setIsGuest(false);
    setExpanded(false);
    navigate('/');  
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed='top' expanded={expanded}>
      <Container>
        <Navbar.Brand>Meme Game</Navbar.Brand>
        {loggedIn && (
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            onClick={() => setExpanded(expanded ? false : true)} 
          />
        )}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {loggedIn && !isGuest && (
              <>
                <Nav.Link as={Link} to="/home" onClick={() => setExpanded(false)}>Home</Nav.Link>
                <Nav.Link as={Link} to="/profile" onClick={() => setExpanded(false)}>Profile</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {loggedIn && (
              <Nav.Link as={Link} to="/" onClick={handleLogOut}>Log out</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
