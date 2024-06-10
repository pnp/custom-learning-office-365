const elemPivotBar = '.hoo-pivotbar';
const elemPivotButton = '.hoo-button-pivot';
const dropDownPivotButton = '.hoo-navitem-text';
const stateIsActive = 'is-active';

const changePivot = (event) => {
    event.preventDefault();

    console.log(event.target);

    let currentButton = event.target.classList.contains(elemPivotButton.substr(1)) ? event.target : event.target.closest(elemPivotButton);
    if (!currentButton) {
        currentButton = event.target.classList.contains(dropDownPivotButton.substr(1)) ? event.target : event.target.closest(dropDownPivotButton);
    }

    const currentPivotBar = event.target.closest(elemPivotBar);

    const allButtons = currentPivotBar.querySelectorAll(elemPivotButton);

    allButtons.forEach(item => {
        item.classList.remove(stateIsActive);
    });

    currentButton.classList.add(stateIsActive);
    
}

const cloneOverflowNodes = (pivotBar) => {

    // Getting flyout in current element
    let flyoutMenu = pivotBar.querySelector('.hoo-buttonflyout');

    console.log(
        flyoutMenu,
        pivotBar.querySelector('.hoo-overflow')
    );

    let overflowCtn = pivotBar.querySelector('.hoo-overflow');

    if (overflowCtn.length !== 0) {

        let overflowCtnItems = overflowCtn.children;
        let childNodesToAppend = [];

        console.log("Overflow Container Items", overflowCtnItems);

        console.log("Flyout MENU ::::::::::::", flyoutMenu);

        if (flyoutMenu) {

            for (let i = 0; i < overflowCtnItems.length; i++) {

                let button = overflowCtnItems[i];

                const btnClone = button.cloneNode(true);
                const listItem = document.createElement('li');

                listItem.appendChild(btnClone);

                btnClone.onclick = button.onclick;
                childNodesToAppend.push(listItem);


            };

            flyoutMenu.append(...childNodesToAppend);

        }
    }
}


export const initPivot = () => {

    // register event on regular buttons
    const pivotBarsButtons = document.querySelectorAll(`${elemPivotBar} ${elemPivotButton}`);
    pivotBarsButtons.forEach(pivotBarsButton => {
        pivotBarsButton.dataset.ref = pivotBarsButton.textContent.trim();
        pivotBarsButton.addEventListener('click', changePivot);
    });

}