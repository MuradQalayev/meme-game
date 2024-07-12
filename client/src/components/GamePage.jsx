import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Button, Alert, Modal,  Toast, ToastContainer } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { startNewGame, saveRoundDetails, saveGame, fetchRandomMeme, checkCaptionCorrectness, fetchCorrectCaptions } from '../Api.mjs';
import Timer from './Timer';
import LoadingSpinner from './LoadingSpinner';
import CaptionList from './CaptionList';
import Confetti from 'react-confetti';


const GamePage = ({ memeImage, setMemeImage, captions, setCaptions, userId }) => {
  const { isGuest } = useAppContext();
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScore, setShowScore] = useState(false);
  const [roundScores, setRoundScores] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [usedMemeIds, setUsedMemeIds] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(null);
  const [isTimerFinished, setIsTimerFinished] = useState(false);
  const [attempts, setAttempts] = useState(isGuest ? 1 : 3);
  const [imageData, setImageData] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameSaved, setGameSaved] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [correctCaptions, setCorrectCaptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalOver, setShowModalOver] = useState(false);
  const [dataFinish, setDataFinish] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success'); // 'success' or 'danger'


  const navigate = useNavigate();

  // useEffect(() => {
  //   if (toastMessage && showToast) {
  //     // The Toast is shown only when the toastMessage is updated and showToast is true
  //     setShowToast(true);
  //   }
  // }, [toastMessage, showToast]);


  useEffect(() => {
    if (!isGuest && userId) {
      startNewGameProcess();
    } else {
      fetchRandomMemeCaptions();
    }
  }, [userId]);

  useEffect(() => {
    // Triggers celebration when score threshold is met
    if (totalScore == 15 && attempts <= 1) {
      setCelebrate(true);
    }
  }, [totalScore, attempts]);

  const startNewGameProcess = async () => {
    // Starts a new game and fetches meme captions
    try {
      const game = await startNewGame(userId);
      setGameId(game.gameId);
      fetchRandomMemeCaptions();
    } catch (error) {
      console.error("Failed to start a new game:", error);
      setError("Failed to start a new game. Please try again.");
    }
  };

  const fetchAndSetCaptions = async (imageData) => {
    const correctCaptions = await fetchCorrectCaptions(imageData);
    setCorrectCaptions(correctCaptions);   
  };

  const fetchRandomMemeCaptions = async () => {
      // Fetches a random meme and captions not yet used in the game
    setLoading(true);
    try {
      const { meme, captions } = await fetchRandomMeme(usedMemeIds);
      setImageData({ url:meme.image_url, id: meme.id });
      setMemeImage(meme.image_url);
      setCaptions(captions);
      setSelectedCaption(null);
      setUsedMemeIds(prevIds => [...prevIds, meme.id]);
      setShowAnswers(false);
    } catch (error) {
      console.error('Failed to fetch random meme captions:', error);
      setError('Failed to fetch new meme. Please try again.');
    } finally {
      setLoading(false);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
    return () => controller.abort();
  };

  const handleCaptionClick = (caption) => {
    // Handles caption selection by the player
    if (!isTimerFinished &&!isSubmitted) {
      setSelectedCaption(caption);
    }
  };
    // Function to open the modal
  const handleOpenModalOver = () => setShowModalOver(true);

    // Function to close the modal
  const handleCloseModalOver = () => setShowModalOver(false);

  const handleSubmit = async () => {
    // Submits the selected caption and updates scores
    if (isSubmitting) return; // Prevent further submissions while one is in progress
    setIsSubmitting(true);

    let score = 0; // Default score is 0
    let selectedCaptionId = selectedCaption? selectedCaption.id : null; // Initialize caption ID

    try {
        if (!isTimerFinished && selectedCaption) {
            const result = await checkCaptionCorrectness(selectedCaption.id, imageData.id);
            // Check if result and result.isCorrect are defined before accessing is_best_match
            if (result && result.isCorrect && result.isCorrect.is_best_match === 1) {
                score = 5; // Only set score to 5 if is_best_match is exactly 1
                setToastMessage('You answered correctly! Round finished.');
                setToastVariant('success');
                setDataFinish(prev => [...prev, { caption: selectedCaption, imageData: imageData }]);
                
            }
            else {
              const correctAnswersString = await fetchCorrectCaptions(imageData.id);
              const correctANS = correctAnswersString.map(caption => caption.text).join(', ');              
              setToastMessage(`You answered wrong. Your correct answers are: ${correctANS}`);
              setToastVariant('danger');
          }
          setShowToast(true);
        }
        fetchAndSetCaptions(imageData.id);             

        setRoundScores(prev => [...prev, score]); // Update round scores
       setTotalScore(prev =>prev + score); // Update total score


        if (!isGuest) {
          await saveRoundDetails(gameId, imageData.id, selectedCaptionId, score);
        }

        setIsSubmitted(true); 
    } catch (error) {
        console.error('Failed to process caption submission:', error);
        setError('Failed to submit caption. Please try again.');
    } finally {
        setIsSubmitting(false); 
    }
  };

  const handleNextMeme = async () => {
    if (attempts <= 1) {
      setShowScore(true);
      if (!gameSaved &&!isGuest) {
        saveGameDetails();
      }
    } else {
      setAttempts(prev => prev - 1);
      fetchRandomMemeCaptions();
      setIsSubmitted(false);
      setIsTimerFinished(false);  
      setToastMessage('');
      setShowToast(false);
    }
  };

  const saveGameDetails = async () => {
    if (gameSaved) return;

    try {
      await saveGame(userId, totalScore, 1);
      setGameSaved(true);
    } catch (error) {
      console.error("Failed to save the game:", error);
      setError("Failed to save the game. Please try again.");
    }
  };

  const resetGame = () => {
    setAttempts(isGuest? 1 : 3);
    setShowScore(false);
    setRoundScores([]);
    setTotalScore(0);
    setUsedMemeIds([]);
    setGameSaved(false);
    navigate('/home');
  };

  const roundNumberConversion = () => {
    if (isGuest) {
      return "1";
    } else {
      if (attempts === 3) {
        return '1';
      } else if (attempts === 1) {
        return '3';
      } else {
        return '2';
      }
    }
  };

  const handleShowAnswers= () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container fluid="md" className="my-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {loading? (
        <LoadingSpinner />
      ) : showScore? (
        <div className="text-center game-over">
          <h1 className="mb-4">Game Over</h1>
          <h2 className="mb-4">Total Score: {totalScore}</h2>
          <Modal show={showModalOver} onHide={handleCloseModalOver}>
            <Modal.Header closeButton>
              <Modal.Title>Best matches</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {dataFinish.map((item, index) => (
                <div key={index}>
                  <p><strong>Caption:</strong> {item.caption.text}</p>
                  <img src={item.imageData.url} alt="Meme" style={{ width: '100%', maxWidth:'100', maxHeight:'100'}} />
                </div>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={handleCloseModalOver} // Changed to close the modal
                variant="primary"
                size="lg"
                style={{ margin: 'auto', display: 'block' }} // Updated for testing
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {celebrate && (
            <div>
              <h2>Congratulations! You scored {totalScore} in 3 rounds!</h2>
              <Confetti />
              <img
                src="./public/congratulations.jpg"
                alt="Celebratory Image"
                style={{ maxWidth: '100%', height: '200px' }}
              />
            </div>
          )}
          <Button onClick={handleOpenModalOver} variant="primary" size="lg">
            Review best matchs
          </Button>
          <Button
            onClick={resetGame}
            style={{ position: 'fixed', bottom: '20px', left: '47%', transform: 'translateX(-50%)', margin: '40px' }}
            variant="primary"
            size="lg"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-center">Meme Game</h1>
          <Row className="justify-content-center">
            <Col md={4}>
              <img src={memeImage} alt="Meme" className="img-fluid" />
            </Col>
            <Col md={5}>
              <CaptionList
                captions={captions}
                selectedCaption={selectedCaption}
                handleCaptionClick={handleCaptionClick}
                isSubmitted={isSubmitted}
                isTimerFinished={isTimerFinished}
                showAnswers={showAnswers}
              />
              {isSubmitted && (
                <Button onClick={handleShowAnswers} className="btn btn-secondary mt-4">
                  Show Answers
                </Button>
              )}
            </Col>
            <Col md={3} className="text-center">
              <Timer
                isSubmitted={isSubmitted}
                setIsTimerFinished={setIsTimerFinished}
                key={attempts}
              />
              <h2>Round {roundNumberConversion()} of {isGuest? '1' : '3'}</h2>
              {!isSubmitted? (
                <Button onClick={handleSubmit} className="btn btn-primary mt-4">
                  Submit
                </Button>
              ) : (
                <Button onClick={handleNextMeme} className="btn btn-primary mt-4">
                  {attempts > 1? 'Next Meme' : 'Finish'}
                </Button>
              )}
            </Col>
          </Row>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Correct Answers</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {correctCaptions.map((caption, index) => (
                <p key={index} style={{ color: 'green' }}>
                  {caption.text}
                </p>
              ))}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
      <ToastContainer position="top-end" className="p-3">
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={4500} autohide bg={toastVariant}>
        <Toast.Header>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
    </Container>
  );
};

export default GamePage;