loadConfig().then(async (config) => {
  const { api } = config;

  if (!api) {
    console.warn("api not found");
    return;
  }

  try {
    let [listWork, listCategory] = await Promise.all(
      ["works", "categories"].map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => res.json())
          .catch((err) => err)
      )
    );

    if (listWork instanceof Error) throw listWork;

    const initValues = [".gallery", listWork, listCategory];

    isLogin()
      ? new Dashboard(...initValues, api).initGallery()
      : new Gallery(...initValues).initGallery();
  } catch (error) {
    error instanceof Error ? console.warn(error.message) : console.error(error);
    document.querySelector(".gallery").innerHTML =
      '<p class="errorMessage">Projets indisponible!</p>';
  }
});
