const axios = require('axios');
const fs = require('fs');
const path = require('path');
const LOG_SOURCE = "apiCall.js";

/**
 * Main function to make API calls and update files
 */
async function main() {
  try {
    console.log(`${LOG_SOURCE} - Starting API call...`);
    
    // Example API call to GitHub API
    const response = await axios.get('https://api.github.com');
    
    console.log(`${LOG_SOURCE} - API call successful`);
    console.log(`${LOG_SOURCE} - Status: ${response.status}`);
    
    // Example: Update a file with the API response
    const outputPath = path.join(__dirname, '../../../docs/api-response.json');
    const dataToWrite = {
      timestamp: new Date().toISOString(),
      status: response.status,
      data: response.data
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(dataToWrite, null, 2), 'utf8');
    console.log(`${LOG_SOURCE} - File updated: ${outputPath}`);
    
    // You can add more API calls or file updates here
    
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
