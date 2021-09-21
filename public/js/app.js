//These 3 lines allow us to get the username of the user from the URL parameters
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const access_token = params.access_token;

const headerTitle = document.getElementById('header-title');
const infoList = document.getElementById('info-list');

const headerFromRange = {
  short_term: 'du mois',
  medium_term: 'des 6 derniers mois',
  long_term: 'de tous les temps'
}

var interval = null;
var range = null;
var pos = null;

function initButtons() {
  buttons = document.getElementsByClassName("toggle-button");

  for(button of buttons) {
    if(button.classList.contains("type")) {
      button.addEventListener('click', (e) => {
        if(e.target.hasAttribute('activeSelection')) return;
        let typeButtons = document.getElementsByClassName("type");
        for(typeButton of typeButtons) typeButton.removeAttribute('activeSelection');
        e.target.setAttribute('activeSelection', '');
        getInfos();
      });
    }
    else if(button.classList.contains("range")) {
      button.addEventListener('click', (e) => {
        if(e.target.hasAttribute('activeSelection')) return;
        let rangeButtons = document.getElementsByClassName("range");
        for(rangeButton of rangeButtons) rangeButton.removeAttribute('activeSelection');
        e.target.setAttribute('activeSelection', '');
        range = e.target.id;
        updateHeader();
        getInfos();
      });
    }
  }
}

function getInfos() {

  let type = document.querySelector(".type[activeSelection]").id;
  let range = document.querySelector(".range[activeSelection]").id;

  let req = new XMLHttpRequest();

  console.log("getting the infos !!!!!! type : " + type + ", range : " + range + " !!!!!!!!!!");

  req.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(req.responseText);
        displayInfos(response, type);
      }
  }

  req.open("GET", "https://api.spotify.com/v1/me/top/" + type + "?time_range=" + range, true);
  req.setRequestHeader('Authorization', 'Bearer ' + access_token);
  req.send();
}

function displayInfos(infos, type) {
  infoList.innerHTML = '';

  if(type == 'artists') displayArtists(infos);
  if(type == 'tracks') displayTracks(infos);
}

function displayArtists(infos) {
  for(info of infos.items) {
    console.log(info);
    let infoCard = createInfoCard(info.images[2].url, info.name, '', 0, info.uri);
    infoList.appendChild(infoCard);
  }
}

function displayTracks(infos) {
  for(info of infos.items) {
    console.log(info);
    let infoCard = createInfoCard(info.album.images[1].url, info.name, '', 0, info.uri);
    console.log(info.uri);
    infoList.appendChild(infoCard);
  }
}

function createInfoCard(imgUrl, title, description, position, redirect) {
  let infoCard = document.createElement('a');
  infoCard.className = 'info-card';
  infoCard.href = redirect;

  let infoImg = document.createElement('div');
  infoImg.className = 'info-img';
  infoImg.style.backgroundImage =  'url(' + imgUrl + ')';

  let infoTitle = document.createElement('div');
  infoTitle.className = 'info-title';
  infoTitle.appendChild(document.createTextNode(title));

  let infoDesc = document.createElement('div');

  infoCard.appendChild(infoImg);
  infoCard.appendChild(infoTitle);

  return infoCard;
}

function updateHeader() {

  headerTitle.setAttribute('updating', '');

  clearInterval(interval);
  interval = setInterval(eraseTitle, 50);
}

function eraseTitle() {

  newHeader = headerTitle.innerHTML;

  if(newHeader == "Votre top ") {
    pos = 0;
    clearInterval(interval);

    setTimeout(function() {
      interval = setInterval(typeNewTitle, 70);
    }, 200);

    return;
  }

  newHeader = newHeader.substring(0, newHeader.length - 1);

  headerTitle.innerHTML = newHeader;
}

function typeNewTitle() {

  if(pos == headerFromRange[range].length) {
    headerTitle.removeAttribute('updating');
    clearInterval(interval);

    return;
  }

  newHeader = headerTitle.innerHTML;
  newHeader = newHeader + headerFromRange[range].charAt(pos);

  headerTitle.innerHTML = newHeader;

  pos++;
}

initButtons();
getInfos();
