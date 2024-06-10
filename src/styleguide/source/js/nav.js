/** MENU ITEM */

const handleMenuItems = (event) => {

    let curNavItem = event.target;
    let curNavMenu = curNavItem.closest('.hoo-navitem');

    // console.log(curNavMenu);
    // console.log(curNavMenu.getAttribute('aria-expanded'));
    // console.log(typeof curNavMenu.getAttribute('aria-expanded'));

    if (curNavMenu.getAttribute('aria-expanded') === 'false') {

        curNavMenu.setAttribute('aria-expanded', true);

    } else {

        curNavMenu.setAttribute('aria-expanded', false);

    }

}

export const initMenu = () => {

    let menuItems = document.querySelectorAll('.hoo-navitem[aria-expanded]');

    menuItems.forEach(item => {

        item.addEventListener('click', handleMenuItems);

    })


}