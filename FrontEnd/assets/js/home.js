loadConfig().then(async (config) => {
  const gallery = document.querySelector(".gallery");
  const paths = ["works", "categories"];
  let preventIndexCategory = 0;

  try {
    const [listWork, listCategory] = await Promise.all(
      paths.map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => res.json())
          .catch((err) => err)
      )
    );

    if (listWork instanceof Error) throw listWork;

    addWorksCard(listWork, gallery);
    addFilterBtnEls(listCategory, document.querySelector(".filter"));

    if (isLogin()) {
      let isOpenModal = false;
      const modifyButtons = [
        { parentSelector: "#introduction > article", position: "afterbegin" },
        { parentSelector: "#introduction > figure", position: "beforeend" },
        { parentSelector: "#portfolio > h2", position: "beforeend" },
      ];

      /* HTML Elements */
      document.querySelector(".login-link").innerHTML = "logout";
      document.body.style.paddingTop = "60px";
      // Topbar
      document.body.insertAdjacentHTML(
        "afterbegin",
        `
          <div id="topbar">
            <h3><img src="./assets/icons/edit.svg"/>Mode édition</h3>
            <button>publier les changements</button>
          </div>`
      );
      // Button open modal
      modifyButtons.forEach(({ parentSelector, position }) => {
        document
          .querySelector(parentSelector)
          .insertAdjacentHTML(
            position,
            `<button class="modify-btn"><img src="./assets/icons/edit_light.svg"/>modifier</button>`
          );
      });

      function handleClickDashboard(e) {
        e.preventDefault();

        if (isOpenModal) {
          console.log("close Dashboard");
          isOpenModal = false;
          document.body.style.overflowY = "auto";
        } else {
          console.log("open Dashboard");
          isOpenModal = true;
          document.body.style.overflowY = "hidden";
        }
      }

      function disconnectUser(e) {
        e.preventDefault();

        deleteToken();

        document.querySelector(".login-link").innerHTML = "login";
        document.body.removeAttribute("style");

        document
          .querySelectorAll("#topbar, .modify-btn")
          ?.forEach((el) => el.remove());

        document
          .querySelector(".login-link")
          .removeEventListener("click", disconnectUser);

        document.querySelectorAll(".modify-btn").forEach((btn) => {
          btn.removeEventListener("click", handleClickDashboard);
        });
      }

      document
        .querySelector(".login-link")
        .addEventListener("click", disconnectUser);

      document.querySelectorAll(".modify-btn").forEach((btn) => {
        btn.addEventListener("click", handleClickDashboard);
      });
    }

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
          addWorksCard(listWork, gallery);
          return;
        }

        const listWorkFiltered = listWork.filter((work) =>
          work.categoryId == btnCategoryId ? 1 : 0
        );

        addWorksCard(listWorkFiltered, gallery);
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

function addWorksCard(works, parentEl) {
  works.forEach((work) => {
    parentEl.innerHTML += workCard(work);
  });
}

function addFilterBtnEls(listCategory, parentEl) {
  parentEl.innerHTML += filterButton({ id: 0, name: "Tous" }, true);
  listCategory.forEach((category) => {
    parentEl.innerHTML += filterButton(category);
  });
}
