/**
 * Interface Config
 * @typedef IConfig
 * @type {object}
 * @property {string} api
 */

/**
 * Interface User
 * @typedef IUser
 * @type {object}
 * @property {string} userId
 * @property {string} token
 */

/**
 * Interface ErrorJson
 * @typedef IErrorJson
 * @type {object}
 * @property {number} status
 * @property {string} sorry
 * @property {string} statusText
 */

async function loadConfig() {
  const config = await fetch("./config.json");

  /** @type {IConfig} */
  const jsonConfig = await config.json();

  return jsonConfig;
}

/**  @returns {string | undefined} */
function getToken() {
  return JSON.parse(sessionStorage.getItem("user"))?.token;
}

/** @param {IUser} user */
function setToken(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
}

function deleteToken() {
  sessionStorage.removeItem("user");
}

function isLogin() {
  return getToken() ? true : false;
}

/** @param {string} to */
function locationTo(to) {
  location.href = to;
}

/** @param {IErrorJson} param0 */
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
  /** @param {IErrorJson} param0 */
  constructor({ status, sorry, statusText }) {
    this.status = status;
    this.sorry = sorry;
    this.statusText = statusText;
  }
}
