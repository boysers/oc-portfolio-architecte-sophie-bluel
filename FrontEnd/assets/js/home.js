if (isLogin()) {
  const loginLink = document.querySelector(".login-link");
  const modifyButtons = [
    { parentSelector: "#introduction > article", position: "afterbegin" },
    { parentSelector: "#introduction > figure", position: "beforeend" },
    { parentSelector: "#portfolio > h2", position: "beforeend" },
  ];

  loginLink.innerHTML = "logout";
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="topbar">
        <h3><img src="./assets/icons/edit.svg"/>Mode édition</h3>
        <button>publier les changements</button>
      </div>`
  );
  modifyButtons.forEach(({ parentSelector, position }) =>
    addModifyBtn(parentSelector, position)
  );

  const modifyButtonEls = document.querySelectorAll(".modify-btn");

  // document.body.style.overflowY = "hidden"

  function disconnectUser(e) {
    e.preventDefault();

    sessionStorage.removeItem("user");

    loginLink.innerHTML = "login";

    document
      .querySelectorAll("#topbar, .modify-btn")
      ?.forEach((el) => el.remove());

    loginLink.removeEventListener("click", disconnectUser);

    modifyButtonEls.forEach((btn) => {
      btn.removeEventListener("click", handleClickDashboard);
    });
  }

  loginLink.addEventListener("click", disconnectUser);

  modifyButtonEls.forEach((btn) => {
    btn.addEventListener("click", handleClickDashboard);
  });
}

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

    filter.innerHTML += filterButton({ id: 0, name: "Tous" }, true);

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

        document.querySelectorAll(".filter-btn").forEach((btn) => {
          btn.classList.remove("active");
        });

        this.classList.add("active");

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
    gallery.innerHTML = '<p class="errorMessage">Projets indisponible!</p>';
  }
});

function workCard(work) {
  return `<figure data-category-id="${work.categoryId}" data-id="${work.id}">
            <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
            <figcaption>${work.title}</figcaption>
          </figure>`;
}

function filterButton(category, isActive) {
  const classNameActive = isActive ? " active" : "";
  return `<button data-category-id="${category.id}" class="filter-btn${classNameActive}">${category.name}</button>`;
}

function addWorks(works, parentEl) {
  works.forEach((work) => {
    parentEl.innerHTML += workCard(work);
  });
}

/**
 * @param {Element} parentSelector
 * @param {"afterbegin" | "beforeend"} position
 * @returns void
 */
function addModifyBtn(parentSelector, position) {
  document
    .querySelector(parentSelector)
    .insertAdjacentHTML(
      position,
      `<button class="modify-btn"><img src="./assets/icons/edit_light.svg"/>modifier</button>`
    );
}

function handleClickDashboard(e) {
  e.preventDefault();

  console.log("open Dashboard");
}
