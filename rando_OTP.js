exports.generateOtp = (digit) => {
  const otp = Math.floor(
    10 ** (digit - 1) + Math.random() * (10 ** (digit - 1) * 9)
  );
  return otp;
};
