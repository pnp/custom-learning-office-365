
console.log('Welcome to the Simple Style Guide.');

const showHideMenu = (event) => {

  event.preventDefault();

  const headerPanel = document.querySelectorAll('.learningheader .headerpanel');

  headerPanel.forEach((element) => {

    if (element.classList.contains('show')) {
      element.classList.remove('show');
    } else {
      element.classList.add('show');
    }

  });

}


window.onload = () => {

  let menuButton = document.querySelectorAll('.iconbutton.burger');

  menuButton.forEach((element) => {
    element.addEventListener('click', showHideMenu);
  });

  let iframe = document.getElementById('plImageID');


}
