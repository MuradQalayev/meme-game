import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

// Renders a list of captions as interactive buttons.
const CaptionList = ({
  captions,
  selectedCaption,
  handleCaptionClick,
  isSubmitted,
  isTimerFinished,
  showAnswers
}) => {
  return (
    <Row>
      {captions.map((caption, index) => (
        <Col key={index} md={6} className="mb-3">
          <Button
            variant={selectedCaption && selectedCaption.id === caption.id ? 'secondary' : 'outline-secondary'}
            onClick={() => handleCaptionClick(caption)}
            disabled={isSubmitted || isTimerFinished}
            style={{
              backgroundColor: showAnswers && caption.isCorrect ? 'green' : '',
              color: showAnswers && caption.isCorrect ? 'white' : ''
            }}
          >
            {caption.text}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default CaptionList;
