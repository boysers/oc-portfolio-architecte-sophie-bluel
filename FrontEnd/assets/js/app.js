async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}

function getToken() {
  return JSON.parse(sessionStorage.getItem("user"))?.token;
}

function deleteToken() {
  sessionStorage.removeItem("user");
}

function isLogin() {
  return getToken() ? true : false;
}
