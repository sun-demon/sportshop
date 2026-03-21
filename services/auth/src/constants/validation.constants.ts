export const VALIDATION = {
  EMAIL: {
    MAX_LENGTH: 254, // RFC 5321: maximum for email
    REGEX: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
  },
  PASSWORD: {
    MAX_LENGTH: 72,  // bcrypt restriction (for registration)
    MIN_LENGTH: 6,
    REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, // Minimum of 6 characters, at least one letter and one digit
  },
  NAME: {
    MAX_LENGTH: 100,
  },
  LOGIN: {
    MAX_PASSWORD_LENGTH: 1000,  // to protect against DoS in login
  },
};
