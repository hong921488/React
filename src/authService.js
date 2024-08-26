import axios from 'axios';
import config from './config.js';

export const getJWTToken = async () => {
  try {
    const response = await axios.post(`${config.dbUrl}/EbedsidecardSpring/jwt/generateToken`, {
      username:"epaper",
      password:"epaper"
    });
    const token = response.data;
    return token;
  } catch (error) {
    console.error('Error fetching JWT token:', error);
    return null;
  }
};
