async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}

function getToken() {
  return JSON.parse(sessionStorage.getItem("user"))?.token;
}

function setToken(data) {
  sessionStorage.setItem("user", JSON.stringify(data));
}

function deleteToken() {
  sessionStorage.removeItem("user");
}

function isLogin() {
  return getToken() ? true : false;
}

/**
 * @param {string} to
 */
function locationTo(to) {
  location.href = to;
}

function elementCatchError({ status, sorry, statusText }) {
  const errorContainer = document.createElement("div");
  errorContainer.classList.add("error-container");

  if (status)
    errorContainer.innerHTML += `<h3 class="error__status">${status}</h3>`;

  if (statusText)
    errorContainer.innerHTML += `<p class="error__text">${statusText}</p>`;

  if (sorry) errorContainer.innerHTML += `<p class="error__sorry">${sorry}</p>`;

  return errorContainer;
}

class ErrorJson {
  constructor({ status, sorry, statusText }) {
    this.status = status;
    this.sorry = sorry;
    this.statusText = statusText;
  }
}
