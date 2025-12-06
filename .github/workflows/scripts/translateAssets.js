let { default: fs } = await import('fs');
let { default: axios } = await import('axios');
let { default: cheerio } = await import('cheerio');
let {default: express} = await import('express');

//import fs from 'fs';
//import axios from 'axios';
//import cheerio from 'cheerio';
//import express from 'express';
////const express = require('express');
//const fs = require('fs');

const app = express();

const manifestPath = 'docs/learningpathways/v4/manifest.json';
const sourcePath = 'docs/learningpathways/v4/en-us/assets.json';
const outputPath = 'docs/learningpathways/v4/xx-xx/assets.json';

let assetLangs = [];


//const axios = require('axios');
//const cheerio = require('cheerio');
// Read and parse the JSON file
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

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
    return `Error processing languages: ${err.message}`;
  }
  return retVal;
}

// Iterate over all entries, detect language, and log if English
// Helper to fetch H1 text from a URL
async function fetchH1(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $('h1').first().text();
  } catch (err) {
    return `Error fetching H1: ${err.message}`;
  }
}

// Get language assets file
async function getAssets(languageCode) {
  const retVal = sourceData;
  try {
    for (const entry of retVal) {
      if (entry.Title && entry.Url) {
        // Check if the Url contains 'en-us' (case-insensitive)
        if (entry.Url.toLowerCase().includes('en-us')) {
          entry.Url = entry.Url.replace('en-us', languageCode.toLowerCase());
        }
      const h1Text = await fetchH1(entry.Url);
      if (h1Text && !h1Text.startsWith('Sorry')) {
        entry.Title = h1Text;
        console.log(`Updated Title for ${entry.Id}: ${h1Text}`);
      }else{
        entry.StatusTagId = '4eb25076-b5d0-41cb-afa6-4e0c5a1c9664'
      }
    }
  }
  } catch (err) {
    return `Error processing languages: ${err.message}`;
  }
  fs.writeFileSync(outputPath.replace('xx-xx', languageCode.toLowerCase()), JSON.stringify(retVal, null, 2), 'utf8');
  return retVal;
}

(async () => {
  let assetLangs = await getSupportedLanguages(manifestPath);
  try {
    if (assetLangs.length > 0 && Array.isArray(assetLangs)) {
      assetLangs.forEach(lang => {
        getAssets(lang);
      });
    }
  } catch (err) {
    return `Error processing languages: ${err.message}`;
  }
  
})();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});