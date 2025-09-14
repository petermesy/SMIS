const axios = require('axios');

const email = 'dani@gmail.com'; // replace with student's email
const password = 'dani123';     // replace with student's password

async function checkEligibility() {
  try {
    // 1. Login to get JWT token
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', { email, password });
    const token = loginRes.data.token;

    // 2. Call eligibility endpoint with token
    const eligRes = await axios.get('http://localhost:4000/api/students/registration-eligibility', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 3. Print result
    if (eligRes.data.eligible) {
      console.log('Student is eligible for next semester.');
    } else {
      console.log('Student is NOT eligible:', eligRes.data.reason || 'criteria not met');
    }
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

checkEligibility();