import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Container, Button, Image, Modal, Alert } from 'react-bootstrap';
import { getGamesByUserId, getRoundsByGameId, getCaptionsByRoundId, fetchCorrectCaptions } from '../Api.mjs';
import '../UserProfile.css';

const UserProfileHeader = ({ username, totalScore, gamesLength }) => {
  return (
    <Card style={{ height: '300px ', overflowY: 'hidden', alignContent: 'center', justifyContent: 'center' }}>
      <Card.Header className="user-profile-header">
        <div className="user-photo">
          <img src={username === 'murad' ? 'murad.png' : './public/testuser.webp'} alt={`${username}'s profile`} className="user-photo-img" />
        </div>
        <h2>{username}</h2>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Total Score:</strong> {totalScore}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total Games:</strong> {gamesLength}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

const UserProfileGames = ({ games, handleGameSelect }) => {
  return (
    <Card style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <Card.Header as="h2">Game History</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {games.map((game, index) => (
            <ListGroup.Item key={game.id}>
              <Button variant="link" onClick={() => handleGameSelect(game.id)}>
                Game {index + 1}: Score {game.total_score}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

const UserProfile = ({ username, userId }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const gamesData = await getGamesByUserId(userId);
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Failed to fetch games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [userId]);

  const handleGameSelect = async (gameId) => {
    setLoading(true);
    setError(null);
    try {
      const rounds = await getRoundsByGameId(gameId);
      const roundsWithDetails = await Promise.all(rounds.map(async (round) => {
        const captions = await getCaptionsByRoundId(round.id);
        const correctCaptions = await fetchCorrectCaptions(round.meme_id);
        return { ...round, captions, correctCaptions };
      }));
      setSelectedGame({ gameId, rounds: roundsWithDetails });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching game details:', error);
      setError(`Failed to load game details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGame(null);
  };

  if (loading) {
    return (
      <Container className="my-5 h-100" fluid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 h-100" fluid>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5 h-100" fluid style={{ padding: '40px', maxHeight: '90vh', overflowY: 'hidden' }}>
      <div className="row">
        <div className="col-md-3">
          <UserProfileHeader username={username} totalScore={games.reduce((total, game) => total + game.total_score, 0)} gamesLength={games.length} />
        </div>
        <div className="col-md-9">
          <UserProfileGames games={games} handleGameSelect={handleGameSelect} />
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Game Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGame && selectedGame.rounds.map((round, index) => (
            <ListGroup.Item key={index}>
              <h5>Round {index + 1}: Score - {round.score}</h5>
              <div>
                <p>Correct Captions:</p>
                <ul>
                  {round.correctCaptions.map((caption, j) => (
                    <li key={j}>{caption.text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p>Your Captions:</p>
                <ul>
                  {round.captions.map((caption, j) => (
                    <li key={j}>{caption.text}</li>
                  ))}
                </ul>
              </div>
              {round.meme_id && (
                <div>
                  <h5>Meme</h5>
                  <div className="center-image-container">
                    <Image
                      src={`./public/meme${round.meme_id}.jpg`}
                      alt={`Meme for Round ${index + 1}`}
                      className="img-fluid"
                    />
                  </div>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserProfile;
