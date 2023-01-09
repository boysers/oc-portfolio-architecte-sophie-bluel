async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}

function isLogin() {
  return sessionStorage.getItem("user") ? true : false;
}

function getToken() {
  return JSON.parse(sessionStorage.getItem("user")).token;
}
