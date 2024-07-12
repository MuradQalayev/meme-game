import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import memeDao from './MemeDAO.mjs';
import { getIdByUsername, getUser } from './userDao.mjs';

//Setting a server with port 3001
const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));
passport.use(new LocalStrategy(async (username, password, cb) => {
  const user = await getUser(username, password);
  if (!user) {
    return cb(null, false, { message: 'Incorrect username or password' });
  }
  return cb(null, user);
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.use(session({
  secret: "Ohhh its my secret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

//Handling Login with passport js and UserDao, also passwords are hashed
app.post('/api/login', [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required')
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate('local', (err, user, info) => {
      try {
        if (err) {
          throw err;  
        }
        if (!user) {
          return res.status(401).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        req.login(user, (err) => {
          if (err) {
            throw err;  
          }
          return res.status(200).json({ message: 'Logged in successfully' });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  } catch (error) {
    return next(error);
  }
});


app.get('/api/getid/:username', ensureAuthenticated, async (req, res)=>{
  const username = req.params.username;
  try{
    const userId = await getIdByUsername(username);
    res.status(200).json({ userId });
  }
  catch (error){
    res.status(500).json({ message: error.message });
  }
  

})

app.post('/api/random-meme', async (req, res) => {
  const { usedMemeIds } = req.body; 
  try {
    const result = await memeDao.getRandomMemeWithCaptions(usedMemeIds);
    if (!result) {
      return res.status(404).json({ error: 'No available memes' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during fetch:', error);
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});



// Starting a game for further usage of rounds
app.post('/api/start-game', ensureAuthenticated, async (req, res) => {
  const { userId } = req.body;
  try {
    const gameId = await memeDao.startNewGame(userId);
    res.status(200).json({ gameId });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data', details: error.message });
  }
});

app.post('/api/save-round', ensureAuthenticated, async (req, res) => {
  const { gameId, memeId, selectedCaptionIds, scores } = req.body;
  try {
    const data = await memeDao.saveRoundDetails(gameId, memeId, selectedCaptionIds, scores);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/savegame', ensureAuthenticated, async (req, res) => {
  const { userId, score, completed } = req.body;
  try {
    const savedGame = await memeDao.saveGame(userId, score, completed);
    res.status(200).json({ savedGame });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/games/:userId', ensureAuthenticated, async (req, res) => {
  const { userId } = req.params;
  try {
    const games = await memeDao.getGamesByUserId(userId);
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching games' });
  }
});


app.get('/api/rounds/:gameId', async (req, res) => {
  const { gameId } = req.params;
  try {
    const rounds = await memeDao.getRoundsByGameId(gameId);
    res.status(200).json(rounds);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching rounds' });
  }
});

app.get('/api/captions/:roundId', async (req, res) => {
  const { roundId } = req.params;
  try {
    const captions = await memeDao.getCaptionsByRoundId(roundId);
    res.status(200).json(captions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching captions' });
  }
});

app.get('/api/check-caption-correctness/:captionId/:memeId', async (req, res) => {
  const { captionId, memeId } = req.params;
  try {
    const result = await memeDao.checkCaptionCorrectness(captionId, memeId);
    if (result) {
      res.json({ isCorrect: result });
    } else {
      // As because of the database structure, we have 50 captions and 10 memes, so practicaly sometimes its normal to haveempty objects as 
      // response body, to handle this we use the logic, that if we have is_best_match equal to 1 its best match in any other ones they are
      // considered as 0
      res.json({ isCorrect: { is_best_match: 0 } });
    }
  } catch (error) {
    console.error('Failed to check caption correctness:', error);
    res.status(500).json({ isCorrect: { is_best_match: 0 }, message: 'Error checking caption correctness' });
  }
});

app.get('/api/get-correct-captions/:memeId', async (req, res) => {
  const { memeId } = req.params;
  try {
    const correctCaptions = await memeDao.getCorrectCaptions(memeId);
    res.status(200).json(correctCaptions);
  } catch (error) {
    console.error('Failed to get correct captions:', error);
    res.status(500).json({ message: 'Error retrieving correct captions' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
