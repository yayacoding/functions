const bcrypt = require('bcrypt');
const { env } = require('../constant/index');

const saltRounds = env.SALT_ROUND;

exports.generateHash = async (password) => {
  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password.toString(), salt);
    return hash;
  } catch (err) {
    return err;
  }
};
// you can compare hash otp by below function
exports.comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

exports.generateRandomPass = async () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*_+-';
  const string_length = 10;
  let randomstring = '';
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }

  return randomstring;
};


//generate random password new function
exports.passwordGenerator = async() => {
  const uChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lChars = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const countArr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const sChars = '@#';
  let randomstring = '';
  let counter = 0;
  let rN;

  while (randomstring.length < 10) {
    counter = countArr[Math.floor(Math.random() * countArr.length)];
    countArr.splice(countArr.indexOf(counter), 1);
    if (counter >= 0 && counter <= 1) {
      rN = Math.floor(Math.random() * uChars.length);
      randomstring += uChars[rN];
    } else if (counter < 6 && counter > 1) {
      rN = Math.floor(Math.random() * lChars.length);
      randomstring += lChars[rN];
    } else if (counter >= 6 && counter <= 7) {
      rN = Math.floor(Math.random() * nums.length);
      randomstring += nums[rN];
    } else {
      rN = Math.floor(Math.random() * sChars.length);
      randomstring += sChars[rN];
    }
  }
  return randomstring;
};
