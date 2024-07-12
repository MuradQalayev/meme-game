import db from './db.mjs';
import crypto from 'crypto';

//Using hashPassword to make it secure 
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = { id: row.id, username: row.username };

        crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

export const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({ error: 'User not found!' });
      } else {
        const user = { id: row.id, username: row.username };
        resolve(user);
      }
    });
  });
};

export const getIdByUsername = (username) =>{
  return new Promise((resolve,reject)=>{
    const sql = 'SELECT id FROM users WHERE username = ?';
    try{
      db.get(sql,[username], (err,row)=>{
        if(err){
          reject(err);
        }
        else{
          resolve(row);
        }
      })
    }
    catch{
      reject({error:"User not found!"});
    }
  })
}
