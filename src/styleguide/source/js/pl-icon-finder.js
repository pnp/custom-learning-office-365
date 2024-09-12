if (window.location !== window.parent.location) {

} else {
    let header = document.querySelector('.pl-header');
    header.classList.add('show');
}

let filledIcons = document.getElementById('icons-filled');
let regularIcons = document.getElementById('icons-regular');
let iconGrid = document.querySelector('.pl-icongrid');

const domParser = new DOMParser();
const svgNamespace = 'http://www.w3.org/2000/svg';
const info = document.querySelector('.pl-iconname');
const btnDownload = document.querySelector('.pl-act-dwnld .hoo-button-primary');
btnDownload.setAttribute('disabled', true);

let files = document.querySelectorAll('.object-embedd');

const toggleChange = (evt) => {

    if (evt.target.checked) {

        let iconsFilled = document.querySelectorAll("[data-icontype='filled']");
        let iconsRegular = document.querySelectorAll("[data-icontype='regular']");

        for (let icon of iconsFilled) {
            icon.classList.remove('hidden');
        }

        for (let icon of iconsRegular) {
            icon.classList.add('hidden');
        }

    } else {

        let iconsFilled = document.querySelectorAll("[data-icontype='filled']");
        let iconsRegular = document.querySelectorAll("[data-icontype='regular']");

        for (let icon of iconsFilled) {
            icon.classList.add('hidden');
        }

        for (let icon of iconsRegular) {
            icon.classList.remove('hidden');
        }

    }
}



const toTitleCase = (str) => {
    return (str.toLowerCase().replace(/(?:^|[\s-/])\w/g, function (match) {
        return match.toUpperCase();
    })).replace(/-/g, ' ').replace('Icon ', '');
}

const searchItems = (event) => {
    let searchbox = document.querySelector('.pl-iconsearch .hoo-input-text');
    currentValue = searchbox.value;
    let styleChecker = document.querySelector('.hoo-toggle-cb');
    let iconType = "[data-icontype='regular']";

    if (styleChecker.checked) {
        iconType = "[data-icontype='filled']";
    }

    performSearch(currentValue, iconType)
}

const showIconDetails = (event) => {

    let currentElement = event.target;

    if (currentElement.classList.contains('pl-svg-symbol')) {

        if (currentElement.parentElement.classList.contains('pl-icongrid')) {

            currentElement.setAttribute('title', 'Click to add to selection');

        } else {

            currentElement.setAttribute('title', 'Click to remove from selection');

        }

        info.textContent = event.target.getAttribute('data-title');
    }
}

const clearIconDetails = (event) => {
    let currentElement = event.target;

    if (currentElement.classList.contains('pl-svg-symbol')) {

        currentElement.removeAttribute('title');
        info.textContent = '';

    }

}

const addToSelection = (event) => {

    let currentElement = event.target;

    if (currentElement.classList.contains('pl-svg-symbol')) {


        let selection = document.querySelector('.pl-selection-ctn');
        let inCurrentSelection = selection.querySelectorAll(
            `[data-id=${currentElement.getAttribute('data-id')}]`
        );

        if (inCurrentSelection.length === 0) {

            let newSelectedItem = domParser.parseFromString(currentElement.outerHTML, 'text/html');

            selection.appendChild(newSelectedItem.body.firstChild);

            currentElement.classList.add('selected');

        }

        if (selection.children.length !== 0) {

            btnDownload.removeAttribute('disabled');
        }

    }

}

const removeFormSelection = (event) => {

    let currentElement = event.target;
    let selection = document.querySelector('.pl-selection-ctn');

    if (currentElement.classList.contains('pl-svg-symbol')) {

        let currentId = currentElement.getAttribute('data-id');

        let gridItems = document.querySelectorAll(`.pl-icongrid .pl-svg-symbol[data-id=${currentId}]`);

        gridItems.forEach((item) => {
            item.classList.remove('selected')
        })

        currentElement.remove();

        if (selection.children.length === 0) {

            btnDownload.setAttribute('disabled', true);
        }

    }

}

const currentSelection = document.querySelector('.pl-selection-ctn');
currentSelection.addEventListener('mouseover', showIconDetails);
currentSelection.addEventListener('mouseout', clearIconDetails);
currentSelection.addEventListener('click', removeFormSelection);



const performSearch = (curValue, iconType) => {

    console.debug("Input;", curValue, iconType);

    if (curValue === '') {

        let result = document.querySelectorAll(`.pl-icongrid .pl-svg-symbol${iconType}`);
        result.forEach(item => item.classList.remove('hidden'));

        let notResult = document.querySelectorAll(`.pl-icongrid .pl-svg-symbol:not(${iconType})`);
        notResult.forEach(item => item.classList.add('hidden'));

        console.debug(`Result: ${result.length}\nNo Result ${notResult.length}`);

    } else {

        let result = document.querySelectorAll(`.pl-icongrid .pl-svg-symbol[data-srch*='${curValue}']${iconType}`);
        result.forEach(item => item.classList.remove('hidden'));

        let notResult = document.querySelectorAll(`.pl-icongrid .pl-svg-symbol:not([data-srch*='${curValue}']${iconType})`);
        notResult.forEach(item => item.classList.add('hidden'));

        console.debug(`.pl-svg-symbol[data-srch*='${curValue}']${styleFilter}
        Result: ${result.length}
        No Result ${notResult.length}`);

    }



}

const searchField = document.querySelector('.pl-iconsearch .hoo-input-text');
searchField.addEventListener('keyup', searchItems);

let toggle = document.getElementsByName('pl-overview-toggle');
if (toggle.length > 0) {
    toggle[0].addEventListener('change', searchItems)
}

/** Init - Loading **/
(async () => {

    const t0 = performance.now();
    const allUrls = [];

    for (const file of files) {
        console.debug(file.href);
        allUrls.push(file.href);
    }

    const texts = await Promise.all(allUrls.map(async (url) => {

        const resp = await fetch(url, {
            cache: 'force-cache'
        });

        return resp.text();

    }))

    const docFragment = new DocumentFragment();

    texts.forEach((text, index) => {

        const doc = domParser.parseFromString(text, 'text/html');

        const svgSymbols = doc.body.getElementsByTagName('symbol');

        // const svgRoot = doc.body.querySelector('svg');

        for (const svgSymbol of svgSymbols) {

            const svgType = svgSymbol.getAttribute('data-icontype')

            let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            svg.innerHTML = svgSymbol.innerHTML;

            svg.setAttribute('data-id', svgSymbol.id);
            if (svgSymbol.hasAttribute('viewBox')) {
                console.debug('has Viewbox')
                // set viewBox with namespace
                svg.setAttributeNS('http://www.w3.org/2000/svg', 'viewBox', svgSymbol.getAttribute('viewBox'));

            }

            svg.setAttribute('data-icontype', svgType);

            let iconSpan = document.createElement('span');

            if (svgType !== 'regular') {
                iconSpan.classList.add('hidden');
            }

            iconSpan.appendChild(svg);
            iconSpan.classList.add('pl-svg-symbol');
            iconSpan.setAttribute('data-id', svgSymbol.id);
            iconSpan.setAttribute('data-title', toTitleCase(svgSymbol.id));

            iconSpan.setAttribute('data-srch', toTitleCase(svgSymbol.id).toLowerCase());
            iconSpan.setAttribute('data-icontype', svgType);


            docFragment.appendChild(iconSpan);

        };

    });

    // console.debug(docFragment);

    iconGrid.appendChild(docFragment);

    const t1 = performance.now();
    console.debug(`Call to doSomething took ${t1 - t0} milliseconds.`);


    const plIconGrid = document.querySelector('.pl-icongrid');

    plIconGrid.addEventListener('mouseover', showIconDetails);
    plIconGrid.addEventListener('mouseout', clearIconDetails);
    plIconGrid.addEventListener('click', addToSelection);



})();

const createSymbolSet = () => {

    const icons = document.querySelectorAll('.pl-selection-ctn .pl-svg-symbol');

    console.debug(icons);

    const svgDocument = document.createElementNS(svgNamespace, 'svg');
    svgDocument.setAttribute('xmlns', svgNamespace);
    svgDocument.ariaHidden = true;
    svgDocument.style = 'position:absolute;width:0;height:0;overflow:hidden';

    const defs = document.createElement('defs');

    icons.forEach(item => {

        let svg = item.querySelector('svg');
        let symbol = document.createElement('symbol');

        symbol.setAttribute('id', item.getAttribute('data-id'));
        symbol.setAttributeNS('http://www.w3.org/2000/svg', 'viewBox', svg.getAttribute('viewBox'));
        symbol.setAttribute('data-icontype', svg.getAttribute('data-icontype'));

        symbol.innerHTML = svg.innerHTML;

        defs.appendChild(symbol);
        console.debug(symbol);


    })

    svgDocument.appendChild(defs);

    // icons.forEach(icon => {
    console.debug(svgDocument);

    return svgDocument;



}

document.getElementsByTagName('button')[0].addEventListener('click', () => {

    let filename = "hoo-iconset.svg";

    let content = createSymbolSet();

    const element = document.createElement('a');

    element.setAttribute('href', window.URL.createObjectURL(new Blob([content.outerHTML], {
        type: 'image/svg+xml'
    })));

    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);

    console.debug(element);

    element.click();
    document.body.removeChild(element);

})