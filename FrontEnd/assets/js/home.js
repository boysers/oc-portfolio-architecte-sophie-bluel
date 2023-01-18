loadConfig().then(async (config) => {
  const { api } = config;

  if (!api) {
    console.warn("api not found");

    return;
  }

  try {
    /** @type {[IWork[], ICategory[]] | [Response, Response] | [TypeError | TypeError]} */
    const datas = await Promise.all(
      ["works", "categories"].map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => (res.ok ? res.json() : res))
          .catch((err) => err)
      )
    );

    if (datas[0] instanceof Response || datas[0] instanceof TypeError) {
      const { status, statusText } = datas[0];

      throw new ErrorJson({
        status: status ? status : 500,
        sorry: "Oups! Il y a un problème",
        statusText: statusText,
      });
    }

    const loginLinkEl = document.querySelector(".login-link");

    isLogin() ? admin() : visitor();

    function visitor() {
      const gallery = new Gallery(...datas);

      gallery.initGallerySelector(".gallery");
    }

    function admin() {
      const dashboard = new Dashboard(...datas, api);

      dashboard.initGallerySelector(".gallery");

      loginLinkEl.innerHTML = "logout";

      loginLinkEl.addEventListener("click", onDisconnect, { once: true });

      /**  @param {MouseEvent} e */
      function onDisconnect(e) {
        e.preventDefault();

        dashboard.onDisconnectUser(e);

        loginLinkEl.innerHTML = "login";
      }
    }
  } catch (error) {
    const gallery = document.querySelector(".gallery");

    if (error instanceof ErrorJson) {
      console.warn(error);

      const errorBoundary = elementCatchError(error);

      gallery.insertAdjacentElement("beforeend", errorBoundary);
    } else {
      console.error(error);

      gallery.innerHTML = `<p class="error-container">Projets indisponible!</p>`;
    }
  }
});
