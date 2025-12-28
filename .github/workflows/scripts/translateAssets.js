
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const LOG_SOURCE = "translateAssets.js";

// Define the paths for source and output files
const manifestPath = 'docs/learningpathways/v4/manifest.json';
const sourcePath = 'docs/learningpathways/v4/en-us/assets.json'; 
const outputPath = 'docs/learningpathways/v4/xx-xx/assets.json';

let assetLangs = [];
let sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

/**
 * Main function to make API calls
 */
async function main() {
  try {
    //Get the supported languages from the manifest file
    assetLangs = await getSupportedLanguages(manifestPath);

    for (let i = 0; i < assetLangs.length; i++) {
      let lang = assetLangs[i];
      console.log(`${LOG_SOURCE} - Starting update of  ${lang}`);
      await getAssets(lang,sourceData);
      console.log(`${LOG_SOURCE} - Ending update of  ${lang}`);
    }
  } catch (err) {
    console.error(`${LOG_SOURCE} - Error: ${err.message}`);
    if (err.response) {
      console.error(`${LOG_SOURCE} - Response status: ${err.response.status}`);
      console.error(`${LOG_SOURCE} - Response data:`, err.response.data);
    }
    process.exit(1);
  }
}

// Get the list of languages from the manifest file
async function getSupportedLanguages(manifestPath) {
  const retVal = [];
  try {
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifestData.Languages && Array.isArray(manifestData.Languages)) {
      manifestData.Languages.forEach(lang => {
        retVal.push(lang.toLowerCase());
      });
    }
  } catch (err) {
    console.error(`${LOG_SOURCE} - getSupportedLanguages:`, err.message);
  }
  return retVal;
}

// Get language assets file
async function getAssets(languageCode, source) {
  const retVal = [];
  try {
    for (let i = 0; i < source.length; i++) {
      let asset = source[i];
      //console.log(`Start Update of ${languageCode} - ${asset.Id}: ${asset.Title}`);
      if (languageCode.toLowerCase() === 'en-us') {
        asset.Url = asset.Url.replace('en-us',languageCode.toLowerCase() );
      }
      const h1Text = await fetchH1(asset.Url);
      if (h1Text) {
        if (((!h1Text.startsWith('Sorry')) && (!h1Text.startsWith('This article has been retired'))) && h1Text != asset.Title) {
          asset.Title = h1Text;
          console.log(`Updated Title for ${languageCode} - ${asset.Id}: from ${asset.Title} to ${h1Text}`);
        }else if ((h1Text.startsWith('Sorry')) || (h1Text.startsWith('This article has been retired'))) {
          asset.StatusTagId = '4eb25076-b5d0-41cb-afa6-4e0c5a1c9664'
          console.log(`Deprecated Title for ${languageCode} - ${asset.Id}: ${h1Text}`);
        }
      } else {
          asset.StatusTagId = '4eb25076-b5d0-41cb-afa6-4e0c5a1c9664'
          console.log(`Asset missing for ${languageCode} - ${asset.Id}: ${h1Text}`);
      }
      retVal.push(asset);
      //console.log(`End Update of ${languageCode} - ${asset.Id}: ${asset.Title}`);
    }
  } catch (err) {
    return `Error processing languages: ${err.message}`;
  }
  
  if (languageCode.toLowerCase() === 'en-us') {
    sourceData = retVal;
  }
  fs.writeFileSync(outputPath.replace('xx-xx', languageCode.toLowerCase()), JSON.stringify(retVal, null, 2), 'utf8');
  console.log(`Updated ${languageCode} to file ${outputPath.replace('xx-xx', languageCode.toLowerCase())}`);
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