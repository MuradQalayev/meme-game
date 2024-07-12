import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';

const Login = ({ setHideNav, setUsername, setPassword, setAttempts,setExpanded}) => {
  const navigate = useNavigate();
  const { setIsGuest, setIsLoggedIn } = useAppContext();
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState('');

  const onSubmitLogin = async (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors ? data.errors.map(e => e.msg).join(', ') : 'Login failed');
      }
      // Update app context and state after successful login
      setIsGuest(false);
      setIsLoggedIn(true);
      setAttempts(3);
      setHideNav(false);
      setUsername(username); 
      setPassword(password);  
      navigate('/home');
      setExpanded(false)    
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    setIsLoggedIn(true);
    setAttempts(1);
    setHideNav(false);
    navigate('/home');
  };

  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} md={6} lg={4} className="bg-white p-5 rounded shadow">
          <h2 className="text-center mb-4">Login to Meme Game</h2>
          <Form onSubmit={onSubmitLogin}>
            {error && <p className="text-danger" aria-live="polite">{error}</p>}
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUser(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPass(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 btn-lg">
              Login
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Button variant="secondary" onClick={handleGuestLogin}>
              Continue as a guest
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
