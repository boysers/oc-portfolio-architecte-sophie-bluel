loadConfig().then(async (config) => {
  const paths = ["works", "categories"];

  const gallery = document.querySelector(".gallery");
  const filter = document.querySelector(".filter");

  try {
    const [listWork, listCategory] = await Promise.all(
      paths.map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => res.json())
          .catch((err) => err)
      )
    );

    if (listWork instanceof Error) throw listWork;

    filter.innerHTML += filterButton({ id: 0, name: "Tous" });

    addWorks(listWork, gallery);

    listCategory.forEach((category) => {
      filter.innerHTML += filterButton(category);
    });

    let preventIndexCategory = 0;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const btnCategoryId = this.getAttribute("data-category-id");

        if (preventIndexCategory == btnCategoryId) return;

        preventIndexCategory = btnCategoryId;

        gallery.innerHTML = "";

        if (btnCategoryId == 0) {
          addWorks(listWork, gallery);
          return;
        }

        const listWorkFiltered = listWork.filter((work) =>
          work.categoryId == btnCategoryId ? 1 : 0
        );

        addWorks(listWorkFiltered, gallery);
      });
    });
  } catch (error) {
    gallery.innerHTML = '<p id="errorProjectMessage">Projets indisponible!</p>'
  }
});

function workCard(work) {
  return `<figure data-category-id="${work.categoryId}" data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
            <figcaption>${work.title}</figcaption>
          </figure>`;
}

function filterButton(category) {
  return `<button data-category-id="${category.id}" class="filter-btn">${category.name}</button>`;
}

function addWorks(works, parentEl) {
  works.forEach((work) => {
    parentEl.innerHTML += workCard(work);
  });
}
