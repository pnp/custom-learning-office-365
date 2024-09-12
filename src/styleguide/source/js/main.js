import { HOODialog } from './dialog.js';

import {
    ariaSelect
} from './select.js';
/** Table Helper */
import {
    initTables
} from './table.js';
/** Pivot Helpers */
import {
    initPivot
} from './pivot.js';

/** Menu Helpers */
import {
    initMenu
} from './nav.js';

/** Overflow */
import * as overflow from './overflow.js';

const splitButtonReg = (classSelector, handleWith) => {

    let allSplitButtons = document.querySelectorAll(classSelector);

    allSplitButtons.forEach(element => {

        element.addEventListener('click', (event) => {
            handleWith(event);
        });

    });

}

const _btnFlyOut = (curSplitButton, parentElement) => {

    // console.log(curSplitButton)
    // set aria values
    let ariaPressed = curSplitButton.getAttribute('aria-pressed');
    if (ariaPressed === undefined) {
        curSplitButton.setAttribute('aria-pressed', true);
    } else {
        curSplitButton.setAttribute('aria-pressed', !ariaPressed);
    }

    parentElement.classList.toggle('show-flyout');

}

const buttonClick = (event) => {

    let curSplitButton = event.target;
    let parentElement = curSplitButton.parentElement;

    _btnFlyOut(curSplitButton, parentElement);

}

const splitButtonClick = (event) => {

    console.log("\nEVENT: splitButtonClick");
    let curSplitButton = event.target;
    let parentElement = curSplitButton.parentElement;

    _btnFlyOut(curSplitButton, parentElement);

}

const animateDeleteAndSlide = (event) => {


    let eventTarget = event.target;
    let animationClass = eventTarget.parentElement.dataset.animation;

    // Add class
    eventTarget.classList.add(animationClass);

    let computedStyles = window.getComputedStyle(eventTarget);
    let animationDuration = parseFloat(computedStyles.getPropertyValue('animation-duration')) * 1000;


    console.log(
        computedStyles,
        computedStyles.getPropertyValue('animation-duration'),
        animationDuration
        // parseFloat(computedStyles.getPropertyValue('animation-duration')),
        // parseInt("16s")
    );

    setTimeout(
        () => {
            eventTarget.remove();
        }, animationDuration
    )

}

const animateAddAndSlide = (event) => {

    let eventTarget = event.target;

    let animationClass = eventTarget.parentElement.dataset.animation;

    // Add class
    eventTarget.classList.add(animationClass);

    let newDomElement = document.importNode(eventTarget, true);
    newDomElement.classList.add(animationClass);

    let computedStyles = window.getComputedStyle(newDomElement);
    let animationDuration = parseFloat(computedStyles.getPropertyValue('animation-duration')) * 1000;


    event.target.parentElement.appendChild(newDomElement);

    newDomElement.addEventListener('click', animateAddAndSlide);

    console.log(
        computedStyles,
        computedStyles.getPropertyValue('animation-duration'),
        animationDuration
        // parseFloat(computedStyles.getPropertyValue('animation-duration')),
        // parseInt("16s")
    );

    setTimeout(
        () => {
            newDomElement.classList.remove('anim-add-slide');
        }, animationDuration
    )

}

const registerAnimation = (classname, handleWith) => {

    let animAtionBlocks = document.querySelectorAll(classname + ' > .sg-anim-block');

    animAtionBlocks.forEach(element => {
        element.addEventListener('click', handleWith);
    })

}

const registerAriaSelect = () => {

    let selects = document.querySelectorAll('.hoo-select');

    if (selects) {
        selects.forEach((item, idx) => {
            console.debug(item)
            item.ariaExpanded = false;
            const curDropDown = item.querySelector('.hoo-select-dropdown');

            if (curDropDown) {
                curDropDown.classList.add('hidden-all');
            }
            ariaSelect(item);
        });
    }
}

const registerDialog = () => {

    try {
        let dialog1 = new HOODialog('#btn-dialog', '#myDialog', HOODialog.dialogType.DIALOG, { closer: '#closer-dlg' });
        let dialog2 = new HOODialog('#btn-modal-dialog', '#myDialog-1', HOODialog.dialogType.MODAL, { closer: '#closer-mdl' });
    } catch (e) {
        void e;
    }

}


const afterLoaded = () => {

    registerDialog();

    splitButtonReg('.hoo-buttonsplit > .hoo-buttonsplit-carret', splitButtonClick);
    splitButtonReg('.hoo-buttonsplit-primary > .hoo-buttonsplit-carret', splitButtonClick);
    splitButtonReg('button.hoo-buttonicon-overflow', buttonClick);

    splitButtonReg('button.hoo-buttoncmd', buttonClick);
    splitButtonReg('button.hoo-buttoncmdbar', buttonClick);
    splitButtonReg('button.hoo-buttonicon-flyout', buttonClick);
    splitButtonReg('button.hoo-buttoncontext', buttonClick);


    registerAnimation('.anim-deleteNslide', animateDeleteAndSlide);
    registerAnimation('.anim-addNslide', animateAddAndSlide);

    // registerDialog();
    registerAriaSelect();

    /** Init Table Helper */
    initTables();
    /** Init Pivot Bars */
    initPivot();
    /** Init Menu Bars */
    initMenu();

    overflow.init();

    setTimeout(() => {
        let tmpHidden = document.querySelectorAll('.tmp-hidden');

        console.log(tmpHidden);

        tmpHidden.forEach(item => {
            item.addEventListener("focus", (event) => {

                event.target.classList.remove('.tmp-hidden');

                console.log(tmpHidden);

            })
        })
    }, 1000);


}

window.onload = afterLoaded();