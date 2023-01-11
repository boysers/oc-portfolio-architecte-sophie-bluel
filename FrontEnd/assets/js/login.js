if (isLogin()) {
  location.href = "./index.html";
} else {
  document.querySelector("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

  const emailEl = document.querySelector("#email");
  const passwordEl = document.querySelector("#password");

  const userData = {
    email: emailEl.value,
    password: passwordEl.value,
  };

  try {
    const response = await postFetch("/users/login", userData);

    sessionStorage.setItem(
      "user",
      JSON.stringify({
        ...response,
        isLogged: true,
      })
    );

    useLocation("./index.html");
  } catch (error) {
    const loginInfo = document.querySelector("#loginInfo");

    loginInfo.classList = "login__info--active";

    const defaultErrorMessage = "Erreur Serveur";

    if (error instanceof Error) {
      console.warn(error.message);

      if (error.message == "Not Found" || error.message == "Unauthorized") {
        loginInfo.innerHTML = "Erreur dans l’identifiant ou le mot de passe";
      } else {
        loginInfo.innerHTML = defaultErrorMessage;
      }
    } else {
      console.error(error);

      loginInfo.innerHTML = defaultErrorMessage;
    }
  }
});
