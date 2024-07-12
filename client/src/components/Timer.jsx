import React, { useEffect, useState } from 'react';

const Timer = ({ isSubmitted, setIsTimerFinished}) => {
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer((prev) => prev - 1);
      }
    }, 1000);

    if (isSubmitted) clearInterval(countdown);

    return () => clearInterval(countdown);
  }, [timer, isSubmitted]);
  // Manage setIsTimerFinished for handle submit and handle next buttons and also for the calculation of score.

  useEffect(() => {
    if (timer === 0) {
      setIsTimerFinished(true);
    } else {
      setIsTimerFinished(false);
    }
  }, [timer, setIsTimerFinished]);

  return <h1>Timer: {timer}</h1>;
};

export default Timer;
