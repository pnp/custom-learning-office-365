
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const LOG_SOURCE = "depricationReport.js";

// Define the paths for source and output files
const sourcePath = 'docs/learningpathways/v4/en-us/assets.json'; 

/**
 * Main function to make API calls
 */
async function main() {
  try {
    //We are only going to check English
    const lang = 'en-us';
    console.log(`${LOG_SOURCE} - Starting update of ${lang}`);
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    await getAssets(lang,sourceData);
    
    console.log(`${LOG_SOURCE} - Ending update of ${lang}`);
    console.log(`------------------------------------------------------------------------------------------------------------`);
  } catch (err) {
    console.error(`${LOG_SOURCE} - Error: ${err.message}`);
    if (err.response) {
      console.error(`${LOG_SOURCE} - Response status: ${err.response.status}`);
      console.error(`${LOG_SOURCE} - Response data:`, err.response.data);
    }
    process.exit(1);
  }
}
// Get language assets file
async function getAssets(languageCode, source) {
  const retVal = [];
  console.log(`Source length ${source.length}`);
  try {
    for (let i = 0; i < source.length; i++) {
      let asset = source[i];
      const h1Text = await fetchH1(asset.Url);
      if (h1Text) {
        if ((h1Text.startsWith('Sorry')) || (h1Text.startsWith('This article has been retired'))) {
          console.log(`Deprecated Title for ${languageCode} - ${asset.Id}: ${h1Text}`);
        }
      } else {
          console.log(`Asset missing for ${languageCode} - ${asset.Id}: ${h1Text}`);
      }
      retVal.push(asset);
    }
  } catch (err) {
    return `Error processing languages: ${err.message}`;
  }
  return retVal;
}

//Make a call to the page and get the H1 tag that is translated
async function fetchH1(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $('h1').first().text();
  } catch (err) {
    return `Error fetching H1: ${err.message}`;
  }
}

// Run the main function
main();