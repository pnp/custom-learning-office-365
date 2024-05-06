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

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;



const addColorValues = () => {

    const colorSwatches = document.querySelectorAll('.sg-swatch');
    if (colorSwatches.length === 0) return;

    for (let i = 0; i < colorSwatches.length; i++) {

        console.debug('COLOR Swatch', colorSwatches[i]);
        let curSwatch = colorSwatches[i];
        let sgSwatchColor = curSwatch.querySelector('.sg-color-code');
        let sgSwatchBox = curSwatch.querySelector('.sg-swatchbox');
        let computedStyle = window.getComputedStyle(sgSwatchBox);

        let color = computedStyle.getPropertyValue('background-color');
        // debugger;
        if (color.indexOf("rgb(") !== -1) {
            sgSwatchColor.innerText = `${color} / ${rgb2hex(color)}`;
        } else {
            sgSwatchColor.innerText = color;
        }

        console.debug(computedStyle.getPropertyValue('background-color'), curSwatch);


    }

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

const applyTheme = (themename) => {

    const allThemes = JSON.parse(localStorage.getItem('availableThemes'));

    const currentTheme = allThemes[themename];

    // pattern example check
    const pec = document.querySelectorAll('.pl-js-pattern-example');

    if (pec.length !== 0) {
        document.head.insertAdjacentHTML('beforeend',
            `<style>
    .pl-c-pattern{
        ${currentTheme}';
        color: var(--bodyText);
        background-color: var(--bodyBackground);
    }
    .pl-js-pattern-example{
        color: var(--bodyText);
        padding: 0.5rem 0 1.35rem;
        background-color: var(--bodyBackground);
    }
    .pl-c-pattern__header{
        background-color: white;
    }
</style>`);
        // document.body.style = ;
    } else {
        document.body.style = currentTheme + ';color: var(--bodyText);';
    }

}

const loadThemes = async () => {

    for (let theme in supportedThemes)
        // Load Teams Theme
        await fetch(`../../js/themeswitch/themes/${supportedThemes[theme]}.theme.json`).then(response => {

            return response.json();

        }).then(data => {
            return convertTheme(data, supportedThemes[theme])
        });

}

if (localStorage.getItem('availableThemes') === null) {

    await loadThemes();

}

if (!sessionStorage.getItem('currentTheme')) {

    sessionStorage.setItem('currentTheme', 'teal')
    applyTheme(sessionStorage.getItem('currentTheme'));

} else {

    applyTheme(sessionStorage.getItem('currentTheme'));

}

addColorValues();

// Listen for Storage changes
window.addEventListener('storage', (event) => {
    console.debug(event);
    if (event.key === 'currentTheme') {
        applyTheme(event.newValue);
        addColorValues();
    }
})