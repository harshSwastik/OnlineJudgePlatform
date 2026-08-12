const axios = require('axios'); 

const getLanguageById = (lang) => {
  const languages = {
     'cpp': 54,
     'java': 62,
     'javascript': 63,
  }
  return languages[lang.toLowerCase()] || null;
};

// --- NEW HELPER FUNCTIONS FOR BASE64 ---
const encodeBase64 = (str) => {
  if (!str) return str;
  return Buffer.from(String(str), 'utf-8').toString('base64');
};

const decodeBase64 = (str) => {
  if (!str) return str;
  return Buffer.from(str, 'base64').toString('utf-8');
};

const submitBatch = async (submissions) => {
  // 1. Encode the incoming data to Base64 so Judge0 accepts it safely
  const encodedSubmissions = submissions.map(sub => ({
    ...sub,
    source_code: encodeBase64(sub.source_code),
    stdin: encodeBase64(sub.stdin),
    expected_output: encodeBase64(sub.expected_output)
  }));

  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      // 2. NOW SET TO TRUE
      base64_encoded: 'true' 
    },
    headers: {
      'x-rapidapi-key': 'f4ec842435msh1e92bb2557e5a23p1a837fjsn090564c81e1d',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions: encodedSubmissions
    }
  };
 
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Judge0 POST Batch Error:", error.response?.data || error.message);
    throw error;
  }
}

const waiting = (timer) => new Promise((resolve) => setTimeout(resolve, timer));

const submitToken = async (resultToken) => {
  const tokenString = typeof resultToken[0] === 'object' 
    ? resultToken.map(t => t.token).join(',') 
    : resultToken.join(',');

  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: tokenString,
      // 3. SET TO TRUE HERE AS WELL
      base64_encoded: 'true', 
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': 'f4ec842435msh1e92bb2557e5a23p1a837fjsn090564c81e1d',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error("Judge0 GET Batch Error:", error.response?.data || error.message);
      throw error;
    }
  }

  while(true) {
    const result = await fetchData();
    const submissionsList = result.submissions || result;
    const IsResultObtained = submissionsList.every((r) => r.status_id > 2);
    
    if (IsResultObtained) {
      // 4. Decode everything back to readable text for your frontend
      const decodedSubmissions = submissionsList.map(sub => ({
        ...sub,
        stdout: decodeBase64(sub.stdout),
        stderr: decodeBase64(sub.stderr),
        compile_output: decodeBase64(sub.compile_output),
        message: decodeBase64(sub.message)
      }));
      
      return decodedSubmissions; 
    }
    
    await waiting(1000); 
  }
}

const getErrorMessage = (statusId) => {
  const JUDGE0_ERRORS = {
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error "
  };
 
  return JUDGE0_ERRORS[statusId] || "Unknown Error";
}

module.exports = { getLanguageById, submitBatch, submitToken, getErrorMessage };