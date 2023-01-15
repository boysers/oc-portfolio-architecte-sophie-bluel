if (isLogin()) {
  locationTo("../");
} else {
  document.querySelector("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!this.reportValidity()) return;

    document.querySelector(".errorMessage")?.remove();

    const [email, password] = [
      ...document.querySelectorAll(
        '#loginForm input:not(input[type="submit"])'
      ),
    ].map((input) => input.value);

    /**
     * @param {string} errorMessage
     */
    const insertErrorMessageElement = (errorMessage) => {
      this.insertAdjacentHTML(
        "afterbegin",
        `<p class="errorMessage">${errorMessage}</p>`
      );
    };

    if (!email) {
      insertErrorMessageElement("Saisissez votre adresse e-mail!");
      return;
    } else if (!password) {
      insertErrorMessageElement("Saisissez votre mot de passe!");
      return;
    }

    loadConfig().then(async (config) => {
      try {
        const res = await fetch(`${config.api}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({ email, password }),
        });

        if (res.status !== 200) {
          const { status, statusText } = res;

          throw new ErrorJson({
            status: status,
            sorry: "Votre e-mail ou votre mot de passe est incorrect!",
            statusText: statusText,
          });
        }

        const result = await res.json();

        setToken(result);

        locationTo("../");
      } catch (error) {
        document.querySelector(".error-container")?.remove();

        const errorBoundary = elementCatchError(error);

        this.insertAdjacentElement("afterbegin", errorBoundary);
      }
    });
  });
}
