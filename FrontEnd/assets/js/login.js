if (isLogin()) {
  location.href = "./index.html";
} else {
  document.querySelector("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    document.querySelector(".errorMessage")?.remove();

    if (!this.reportValidity()) return;

    const [email, password] = [
      ...document.querySelectorAll(
        '#loginForm input:not(input[type="submit"])'
      ),
    ].map((input) => input.value);

    if (!email) {
      this.insertAdjacentHTML(
        "afterbegin",
        `<p class="errorMessage">Saisissez votre adresse e-mail!</p>`
      );
      return;
    } else if (!password) {
      this.insertAdjacentHTML(
        "afterbegin",
        `<p class="errorMessage">Saisissez votre mot de passe!</p>`
      );
      return;
    }

    loadConfig().then(async (config) => {
      const res = await fetch(`${config.api}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        this.insertAdjacentHTML(
          "afterbegin",
          '<p class="errorMessage">Votre e-mail ou votre mot de passe est incorrect!</p>'
        );
        return;
      }

      const result = await res.json();

      sessionStorage.setItem("user", JSON.stringify(result));

      location.href = "./index.html";
    });
  });
}
