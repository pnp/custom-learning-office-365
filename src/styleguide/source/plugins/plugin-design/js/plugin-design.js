'use strict';
/* global PluginUIExtension, pluginDesign */
const supportedThemes = [
  "blue",
  "gray",
  "purple",
  "darkblue",
  "green",
  "red",
  "darkyellow",
  "orange",
  "teal",
  "teams.light",
  "teams.hc",
  "teams.dark"
]

const localStoredThemes = {};

const loadThemes = async () => {

  for (let theme in supportedThemes)
    // Load Teams Theme
    await fetch(`../../js/themeswitch/themes/${supportedThemes[theme]}.theme.json`).then(response => {

      return response.json();

    }).then(data => {
      return convertTheme(data, supportedThemes[theme])
    });

}

const convertTheme = (data, themeName) => {

  if (typeof data === 'object') {

    const keys = Object.keys(data);

    const themeVars = []
    for (let key in keys) {
      themeVars.push(`--${keys[key]}:${data[keys[key]]}`);
    }

    const themeCSSVars = themeVars.join(';');

    localStoredThemes[themeName] = themeCSSVars;

    localStorage.setItem('availableThemes', JSON.stringify(localStoredThemes));
  }

  return data;
}


var PluginUIExtension = {

  /**
   * The function defined as the onready callback within the plugin configuration.
   */
  init: async function () {

    // let logoImg = document.querySelector(".pl-c-logo__img");

    // if (logoImg) {
    //   logoImg.style.height = "auto";
    //   logoImg.style.width = "100%";
    //   logoImg.style.maxHeight = "100%";
    //   logoImg.removeAttribute('height');
    //   logoImg.removeAttribute('width');
    // }

    let matchMedia = window.matchMedia('screen and (max-width: 768px)');

    if(matchMedia.matches) {
      console.debug('entering match media');
      logoImg.setAttribute('src', "styleguide/images/htwoo-logo-horizontal-sm.png");
      logoImg.setAttribute('srcset', `styleguide/images/htwoo-logo-horizontal-sm.png 200w, ${logoImg.src} 800w`);
      logoImg.setAttribute('sizes', "(max-width: 768px) 200px, 800px");  
    } else {
      console.debug('Do not match');
    }

    let logo = document.querySelector(".pl-c-logo");

    if (logo) {
      logo.style.padding = "0";
    }

    let logoLink = document.querySelector("a.pl-c-logo");

    if (logoLink) {
      logoLink.href = "https://lab.n8d.studio/htwoo/";
    }

    if (localStorage.getItem('availableThemes') === null) {

      await loadThemes();

    }

    this.appendColorSwitcher();

  },
  switchTheme: function (event) {

    const allThemeButtons = document.querySelectorAll('.n8d-themeswitch-btn');
    // rest all buttons
    allThemeButtons.forEach((item) => {
      item.classList.remove('selected')
    });

    console.debug(' ... Switching theme to'+ event.target.dataset.theme);
    // apply selected to current button
    event.target.classList.add('selected');


    let themeLabel = document.querySelector('.n8d-theme-cur');


    const currentlySelected = event.target.dataset.theme;
    themeLabel.innerText = event.target.dataset.theme;
    sessionStorage.setItem('currentTheme', currentlySelected);



  },
  appendColorSwitcher: function () {

    const layoutToggle = document.querySelector('.pl-c-tools__item>pl-toggle-theme').parentElement;
    const availableThemesStorage = localStorage.getItem('availableThemes');

    if (availableThemesStorage) {

      const availableThemes = JSON.parse(availableThemesStorage);


      let keys = Object.keys(availableThemes);
      keys.sort();
      layoutToggle.innerHTML = '';

      layoutToggle.insertAdjacentHTML('afterbegin',
        `
        <div class='n8d-themes'>
        <div class='n8d-themeswitch'>Current Theme: <span class='n8d-theme-cur'>TEAL</span></div>
        <div class='n8d-themeswitch'>SharePoint</div>
        <div class='n8d-themeswitch-selector switch-sp'></div>
        <div class='n8d-themeswitch'>Microsoft Teams</div>
        <div class='n8d-themeswitch-selector switch-teams'></div>
        </div>
      `);
      const themeSwitchSp = document.querySelector('.n8d-themeswitch-selector.switch-sp');
      const themeSwitchTeams = document.querySelector('.n8d-themeswitch-selector.switch-teams');

      if (themeSwitchSp && themeSwitchTeams) {

        for (let key in keys) {

          let switcherTemplate = `<button type="button" class="n8d-themeswitch-btn" style="${availableThemes[keys[key]]}" title="${keys[key].toUpperCase()} - Click to enable" data-theme='${keys[key]}'>
          </button>
          `

          if (keys[key].indexOf('teams') === -1) {

            themeSwitchSp.insertAdjacentHTML('afterbegin', switcherTemplate);

          } else {

            themeSwitchTeams.insertAdjacentHTML('afterbegin', switcherTemplate);

          }

        }

        const allThemeButtons = document.querySelectorAll('.n8d-themeswitch-btn');
        allThemeButtons.forEach((btn) => {
          // console.debug(btn.dataset.theme);
          btn.addEventListener('click', this.switchTheme);
        })

      } else {

        console.error('Pattern-labs: Cannof find theme switch for SharePoint or Teams');

      }

    }

  }


};