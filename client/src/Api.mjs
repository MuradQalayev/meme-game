const SERVER_URL = 'http://localhost:3001';


const fetchRandomMeme = async (usedMemeIds) => {
  const response = await fetch(SERVER_URL + '/api/random-meme', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ usedMemeIds })
  });
  if (response.ok) {
    const memeData = await response.json();
    return memeData;
  } else {
    throw new Error('Failed to fetch random meme');
  }
};

const startNewGame = async (userId) => {
  const response = await fetch(SERVER_URL + '/api/start-game', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ userId })
  });
  if (response.ok) {
    const data = await response.json();
    return data; 
  } else {
    throw new Error('Failed to start new game');
  }
};
const saveRoundDetails = async (gameId, memeId, selectedCaptionIds, scores) => {
  const response = await fetch(SERVER_URL + '/api/save-round', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      gameId,
      memeId,
      selectedCaptionIds,
      scores
    })
  });
  if (response.ok) {
    const data = await response.json();
    return data; 
  } else {
    throw new Error('Failed to start new game');
  }

};


const handleStartGame = async (userId) => {
  try {
    const gameId = await startNewGame(userId);
    return gameId
  } catch (error) {
    console.error('Error starting game:', error);
  }
};

const getUserId = async (username) => {
  const response = await fetch(SERVER_URL + `/api/getid/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  if (response.ok) {
    const data = await response.json();
    return data.userId.id;
  } else {
    const errorData = await response.text();
    throw new Error(`Failed to get user id: ${errorData}`);
  }
};


const saveGame = async (userId, score, completed) => {
  try {
    const response = await fetch(SERVER_URL + '/api/savegame', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ userId, score, completed })  
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      // Handling cases where the server returns a non-200 status code
      const errorData = await response.json();
      throw new Error(`Server responded with non-OK status: ${response.status}, ${errorData.message}`);
    }
  } catch (error) {
    // Error handling for network issues or JSON parsing errors
    console.error("Failed to save game data:", error);
    throw new Error('Failed to process saveGame request: ' + error.message);
  }
}



const getCaptionsByRoundId = async (roundId) =>{
  try{
    const response = await fetch(SERVER_URL + `/api/captions/${roundId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
    if (response.ok){
      const data = await response.json();
      return data;
    }
  }
  catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Error fetching game history' });
  }
}
const getRoundsByGameId = async (gameId) => {
  try {
    // Assuming gameId should be included as a path parameter or query parameter
    const response = await fetch(SERVER_URL + `/api/rounds/${gameId}`, {
      method: 'GET', // No body is needed for GET request
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();      
      return data;
    } else {
      // Handle non-ok responses gracefully
      const errorData = await response.json();
      throw new Error(`Server responded with non-OK status: ${response.status}, ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error fetching rounds:', error);
    throw error; // Throw error to be handled by the calling function
  }
}
const getGamesByUserId = async (userId) => {
  try {
    // Assuming gameId should be included as a path parameter or query parameter
    const response = await fetch(SERVER_URL + `/api/games/${userId}`, {
      method: 'GET', // No body is needed for GET request
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();  
        return data;
    } else {
      // Handle non-ok responses gracefully
      const errorData = await response.json();
      throw new Error(`Server responded with non-OK status: ${response.status}, ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error fetching rounds:', error);
    throw error; // Throw error to be handled by the calling function
  }
}
const checkCaptionCorrectness = async (captionId, memeId) => {
  try {
    const url = `${SERVER_URL}/api/check-caption-correctness/${captionId}/${memeId}`;  // Assuming memeid is needed in the URL
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        const errorData = await response.json();
        throw new Error(`Server responded with non-OK status: ${response.status}, ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error fetching caption correctness:', error);
    throw error; // Rethrow error to be handled by the calling function
  }
}


const fetchCorrectCaptions = async (memeId) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/get-correct-captions/${memeId}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch correct captions');
    }
  } catch (error) {
    console.error('Error fetching correct captions:', error);
  }
};




export {startNewGame,fetchCorrectCaptions, saveRoundDetails,handleStartGame,getUserId,saveGame,fetchRandomMeme,getCaptionsByRoundId,getRoundsByGameId,getGamesByUserId,checkCaptionCorrectness};


