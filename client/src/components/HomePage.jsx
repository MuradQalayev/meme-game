import React from 'react';
import { Link } from 'react-router-dom';
import '../navigation.css';

const HomePage = ({ username,attempts }) => {

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div className="text-center">
        <div className="combined-animation">
          <h1 className="display-3">HUGE MEME GAME ALERT!</h1>
          <h2>Welcome to the Meme Game, {username ? username: 'Guest'}!</h2>
          <p className="lead">You have {attempts} {attempts === 1? 'attempt' : 'attempts'} remaining</p>
          <img src="../public/hasbikMag.jpeg" alt="Meme Game GIF"  width="200" height="101" className="img-fluid mb-4" />
        </div>
        <Link to='/game' className="btn btn-primary btn-lg">START THE MEME MADNESS!</Link>
      </div>
    </div>
  );
};

export default HomePage;