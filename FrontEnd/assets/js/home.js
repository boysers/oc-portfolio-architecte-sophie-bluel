loadConfig().then(async (config) => {
  const { api } = config;

  if (!api) {
    console.warn("api not found");
    return;
  }

  try {
    const datas = await Promise.all(
      ["works", "categories"].map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => (res.ok ? res.json() : res))
          .catch((err) => err)
      )
    );

    if (datas[0] instanceof Response) {
      const { status, statusText } = datas[0];

      throw new ErrorJson({
        status: status,
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

      function onDisconnect(e) {
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
      gallery.innerHTML = `<p>Projets indisponible!</p>`;
    }
  }
});
