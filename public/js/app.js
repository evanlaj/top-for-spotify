const access_token = getCookie("access_token");

const headerTitle = document.getElementById('header-title');
const infoList = document.getElementById('info-list');

const headerFromRange = {
  short_term: 'du mois',
  medium_term: 'des 6 derniers mois',
  long_term: 'de tous les temps'
}

var intervalHeader = null;
var intervalList = null;
var range = null;
var posHeaderCursor = 0;
var posCardList = 0;
var listInfos = null;

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

  listInfos = infos.items;

  posCardList = 0;

  if(type == 'artists') intervalList = setInterval(displayArtists, 30);
  if(type == 'tracks') intervalList = setInterval(displayTracks, 30);
}

function displayArtists() {

  if(posCardList == listInfos.length) {
    clearInterval(intervalList);
    return;
  }

  info = listInfos[posCardList];
  console.log(info);

  let infoCard = createInfoCard(info.images[2].url, info.name, '', posCardList, info.uri);
  infoList.appendChild(infoCard);

  posCardList++;
}

function displayTracks() {

  if(posCardList == listInfos.length) {
    clearInterval(intervalList);
    return;
  }

  info = listInfos[posCardList];
  console.log(info);

  let infoCard = createInfoCard(info.album.images[1].url, info.name, '', posCardList, info.uri);
  infoList.appendChild(infoCard);

  posCardList++;
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

  clearInterval(intervalHeader);
  intervalHeader = setInterval(eraseTitle, 40);
}

function eraseTitle() {

  newHeader = headerTitle.innerHTML;

  if(newHeader == "Votre top ") {
    posHeaderCursor = 0;
    clearInterval(intervalHeader);

    setTimeout(function() {
      intervalHeader = setInterval(typeNewTitle, 60);
    }, 200);

    return;
  }

  newHeader = newHeader.substring(0, newHeader.length - 1);

  headerTitle.innerHTML = newHeader;
}

function typeNewTitle() {

  if(posHeaderCursor == headerFromRange[range].length) {
    headerTitle.removeAttribute('updating');
    clearInterval(intervalHeader);

    return;
  }

  newHeader = headerTitle.innerHTML;
  newHeader = newHeader + headerFromRange[range].charAt(posHeaderCursor);

  headerTitle.innerHTML = newHeader;

  posHeaderCursor++;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}


initButtons();
getInfos();
