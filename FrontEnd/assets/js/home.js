loadConfig().then(async (config) => {
  const { api } = config;

  const gallery = document.querySelector(".gallery");
  const paths = ["works", "categories"];

  try {
    let [listWork, listCategory] = await Promise.all(
      paths.map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => res.json())
          .catch((err) => err)
      )
    );

    if (listWork instanceof Error) throw listWork;

    if (isLogin()) {
      new Dashboard(".gallery", listWork, listCategory, api).initGallery();
    } else {
      new Gallery(".gallery", listWork, listCategory).initGallery();
    }
  } catch (error) {
    console.warn(error);

    gallery.innerHTML = '<p class="errorMessage">Projets indisponible!</p>';
  }
});
