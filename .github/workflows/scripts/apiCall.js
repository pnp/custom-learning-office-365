const axios = require('axios');
const LOG_SOURCE = "apiCall.js";

/**
 * Main function to make API calls
 */
async function main() {
  try {
    console.log(`${LOG_SOURCE} - Starting API call...`);
    
    // Example API call to GitHub API
    const response = await axios.get('https://api.github.com');
    
    console.log(`${LOG_SOURCE} - API call successful`);
    console.log(`${LOG_SOURCE} - Status: ${response.status}`);
    console.log(`${LOG_SOURCE} - Response data:`, JSON.stringify(response.data, null, 2));
    
    // You can add more API calls or logic here
    
  } catch (err) {
    console.error(`${LOG_SOURCE} - Error: ${err.message}`);
    if (err.response) {
      console.error(`${LOG_SOURCE} - Response status: ${err.response.status}`);
      console.error(`${LOG_SOURCE} - Response data:`, err.response.data);
    }
    process.exit(1);
  }
}

// Run the main function
main();
