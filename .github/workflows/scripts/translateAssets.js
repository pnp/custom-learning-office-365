
const axios = require('axios');
const fs = require('fs');
const LOG_SOURCE = "translateAssets.js";

// Define the paths for source and output files
const manifestPath = 'docs/learningpathways/v4/manifest.json';
const sourcePath = 'docs/learningpathways/v4/en-us/assets.json';
const outputPath = 'docs/learningpathways/v4/xx-xx/assets.json';

let assetLangs = [];
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

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


// let { default: fs } = await import('fs');
// let { default: axios } = await import('axios');
// app.use('axios', require("axios"));
// let { default: cheerio } = await import('cheerio');
// let {default: express} = await import('express');
// const app = express();



// let assetLangs = [];


// //const axios = require('axios');
// //const cheerio = require('cheerio');
// // Read and parse the JSON file
// const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

// // Get the list of languages from the manifest file
// async function getSupportedLanguages(manifestPath) {
//   const retVal = [];
//   try {
//     const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
//     if (manifestData.Languages && Array.isArray(manifestData.Languages)) {
//       manifestData.Languages.forEach(lang => {
//         retVal.push(lang.toLowerCase());
//       });
//     }
//   } catch (err) {
//     return `Error processing languages: ${err.message}`;
//   }
//   return retVal;
// }

// // Iterate over all entries, detect language, and log if English
// // Helper to fetch H1 text from a URL
// async function fetchH1(url) {
//   try {
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);
//     return $('h1').first().text();
//   } catch (err) {
//     return `Error fetching H1: ${err.message}`;
//   }
// }

// // Get language assets file
// async function getAssets(languageCode) {
//   const retVal = sourceData;
//   try {
//     for (const entry of retVal) {
//       if (entry.Title && entry.Url) {
//         // Check if the Url contains 'en-us' (case-insensitive)
//         if (entry.Url.toLowerCase().includes('en-us')) {
//           entry.Url = entry.Url.replace('en-us', languageCode.toLowerCase());
//         }
//       const h1Text = await fetchH1(entry.Url);
//       if (h1Text && !h1Text.startsWith('Sorry')) {
//         entry.Title = h1Text;
//         console.log(`Updated Title for ${entry.Id}: ${h1Text}`);
//       }else{
//         entry.StatusTagId = '4eb25076-b5d0-41cb-afa6-4e0c5a1c9664'
//       }
//     }
//   }
//   } catch (err) {
//     return `Error processing languages: ${err.message}`;
//   }
//   fs.writeFileSync(outputPath.replace('xx-xx', languageCode.toLowerCase()), JSON.stringify(retVal, null, 2), 'utf8');
//   return retVal;
// }

// (async () => {
//   let assetLangs = await getSupportedLanguages(manifestPath);
//   try {
//     if (assetLangs.length > 0 && Array.isArray(assetLangs)) {
//       assetLangs.forEach(lang => {
//         getAssets(lang);
//       });
//     }
//   } catch (err) {
//     return `Error processing languages: ${err.message}`;
//   }
  
// })();