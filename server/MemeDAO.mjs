import db from "./db.mjs";

const memeDao = {
  // We use this data object for fetching random meme and regarding the memeId we get fetch 2 correct captions
  getRandomMemeWithCaptions: async function (usedMemeIds) {
    try {
        let query = `SELECT * FROM memes ORDER BY RANDOM() LIMIT 1`;
        let params = [];

        if (usedMemeIds.length > 0) {
            query = `SELECT * FROM memes WHERE id NOT IN (${usedMemeIds.map(() => '?').join(',')}) ORDER BY RANDOM() LIMIT 1`;
            params = usedMemeIds;
        }

        const meme = await new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!meme) throw new Error('No memes available');
        //correct ones
        const correctCaptions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT c.id, c.text
                FROM captions c
                JOIN meme_captions mc ON c.id = mc.caption_id
                WHERE mc.meme_id = ? AND mc.is_best_match = 1
                ORDER BY RANDOM()
                LIMIT 2`, [meme.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        //incorrect ones
        let incorrectCaptions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT c.id, c.text
                FROM captions c
                JOIN meme_captions mc ON c.id = mc.caption_id
                WHERE mc.meme_id = ? AND mc.is_best_match = 0
                ORDER BY RANDOM()
                LIMIT 5`, [meme.id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        // additional check if we have less than 5 incorrect captions `it was made because additionally we have a different db and for later checks we did not remove them`
        if (incorrectCaptions.length < 5) {
            const additionalCaptionsNeeded = 5 - incorrectCaptions.length;
            const extraIncorrectCaptions = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT c.id, c.text
                    FROM captions c
                    WHERE c.id NOT IN (
                        SELECT mc.caption_id
                        FROM meme_captions mc
                        WHERE mc.meme_id = ?
                    ) AND c.id NOT IN (${incorrectCaptions.length > 0 ? incorrectCaptions.map(caption => '?').join(', ') : 'NULL'})
                    ORDER BY RANDOM()
                    LIMIT ?`, [meme.id, ...incorrectCaptions.map(caption => caption.id), additionalCaptionsNeeded], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            incorrectCaptions = incorrectCaptions.concat(extraIncorrectCaptions);
        }

        let allCaptions = [...correctCaptions, ...incorrectCaptions];
        this.shuffleArray(allCaptions);

        return { meme, captions: allCaptions };
    } catch (err) {
        console.error('Database error:', err);
        throw err;
    }
  },

  // By calling shuffle, we are trying to make them in random order
  shuffleArray: function (array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  },

  // We assign a gameId for the game for the further codes, such as rounds and etc.
  startNewGame: async function (userId) {
    const sql = 'INSERT INTO games(user_id, total_score, completed) VALUES(?, 0, 0)';
    return new Promise((resolve, reject) => {
      db.run(sql, [userId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  saveGame: async function (userId, score, completed) {
    const sql = 'INSERT INTO games(user_id, total_score, completed) VALUES(?, ?, ?)';
    return new Promise((resolve, reject) => {
      db.run(sql, [userId, score, completed], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  saveRoundDetails: async function (gameId, memeId, selectedCaptionId, score) {
    gameId = gameId + 1;
    const sql = 'INSERT INTO rounds(game_id, meme_id, selected_caption_id, score, completed) VALUES(?,?,?,?,1)';
    return new Promise((resolve, reject) => {
      db.run(sql, [gameId, memeId, selectedCaptionId, score], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  },

  // Fetches all games for a specific user, for using them in userProfile
  getGamesByUserId: async function (userId) {
    const sql = 'SELECT * FROM games WHERE user_id = ? and  completed = 1';

    return new Promise((resolve, reject) => {
      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },  

  // Fetches all rounds for a specific game, for using them in userProfile
  getRoundsByGameId: async function (gameId) {
    const sql = 'SELECT * FROM rounds WHERE game_id = ?';
    return new Promise((resolve, reject) => {
      db.all(sql, [gameId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },  
  

  // Fetches captions for a specific round, for using them in userProfile
  getCaptionsByRoundId: async function (roundId) {
    const sql = `
      SELECT c.id, c.text
      FROM captions c
      JOIN rounds r ON c.id = r.selected_caption_id
      WHERE r.id = ?`;
    return new Promise((resolve, reject) => {
      db.all(sql, [roundId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  // In GamePage when we submit the choosen caption, it calls this api and check this given caption id with meme id and if they are best match it return true
  checkCaptionCorrectness: async function (captionId,memeId) {
    const sql = `SELECT is_best_match FROM meme_captions WHERE caption_id = ? AND meme_id = ?`;
    return new Promise((resolve,reject)=>{
      db.get(sql,[captionId,memeId], (err,rows)=>{
        if(err) reject(err);
        else{
          resolve(rows)
        }
      })
    })

  },
  // for using in the game history
  getCorrectCaptions: async function (memeId) {
    const sql = `SELECT text FROM meme_captions mc, captions c WHERE c.id = mc.caption_id AND mc.is_best_match = 1 AND mc.meme_id = ? `
    return new Promise((resolve,reject)=>{
      db.all(sql,[memeId],(err,rows)=>{
        if(err) reject(err);
        else{
          resolve(rows)
        }
      })
    })
  }
}

export default memeDao;
