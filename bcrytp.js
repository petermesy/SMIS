const bcrypt = require('bcrypt');

const password = 'myPassword123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});