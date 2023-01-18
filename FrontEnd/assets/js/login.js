if (isLogin()) {
  locationTo("../");
} else {
  document.querySelector("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    /** @type {HTMLFormElement} */
    const targetEl = e.target;

    if (!targetEl.reportValidity()) return;

    document.querySelector(".errorMessage")?.remove();

    /** @type {[string, string]} */
    const [email, password] = [
      ...document.querySelectorAll(
        '#loginForm input:not(input[type="submit"])'
      ),
    ].map(({ value }) => (value ? value : ""));

    /** @param {string} errorMessage */
    const insertErrorMessageElement = (errorMessage) => {
      targetEl.insertAdjacentHTML(
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

        /** @type {IUser} */
        const result = await res.json();

        setToken(result);

        locationTo("../");
      } catch (error) {
        if (error instanceof ErrorJson) {
          document.querySelector(".error-container")?.remove();

          const errorBoundary = elementCatchError(error);

          targetEl.insertAdjacentElement("afterbegin", errorBoundary);
        } else {
          console.log(error);
        }
      }
    });
  });
}
