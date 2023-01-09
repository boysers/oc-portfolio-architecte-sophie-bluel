if (isLogin()) {
  const loginLink = document.querySelector(".login-link");
  loginLink.innerHTML = "logout";

  function disconnectUser(e) {
    e.preventDefault();
    sessionStorage.removeItem("user");
    loginLink.innerHTML = "login";

    loginLink.removeEventListener("click", disconnectUser);
  }

  loginLink.addEventListener("click", disconnectUser);
}

async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}

function isLogin() {
  return sessionStorage.getItem("user") ? true : false;
}
