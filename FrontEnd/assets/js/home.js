loadConfig().then(async (config) => {
  const gallery = document.querySelector(".gallery");
  const paths = ["works", "categories"];
  let preventIndexCategory = 0;

  try {
    let [listWork, listCategory] = await Promise.all(
      paths.map((path) =>
        fetch(`${config.api}/${path}`)
          .then((res) => res.json())
          .catch((err) => err)
      )
    );

    if (listWork instanceof Error) throw listWork;

    addWorksCard(listWork, gallery);
    addFilterBtnEls(listCategory, document.querySelector(".filter"));
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

    if (isLogin()) {
      let isOpenModal = false;
      let deleteWorks = [];
      const modifyButtons = [
        { parentSelector: "#introduction > article", position: "afterbegin" },
        { parentSelector: "#introduction > figure", position: "beforeend" },
        { parentSelector: "#portfolio > h2", position: "beforeend" },
      ];

      /* HTML Elements */
      // Login Link
      document.querySelector(".login-link").innerHTML = "logout";
      // Body
      document.body.style.paddingTop = "60px";
      // Topbar
      document.body.insertAdjacentHTML(
        "afterbegin",
        `
          <div id="topbar">
            <h3><img src="./assets/icons/edit.svg"/>Mode édition</h3>
            <button id="publish">publier les changements</button>
          </div>`
      );
      // Button open modal
      modifyButtons.forEach(({ parentSelector, position }) => {
        document
          .querySelector(parentSelector)
          .insertAdjacentHTML(
            position,
            `<button class="modify-btn"><img src="./assets/icons/edit_light.svg" alt="">modifier</button>`
          );
      });

      async function publishToApi(e) {
        e.preventDefault();

        if (deleteWorks.length <= 0) return;

        const responses = await Promise.all(
          deleteWorks.map((deleteWork) =>
            fetch(`${config.api}/works/${deleteWork.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                Authorization: `Bearer ${getToken()}`,
              },
            })
              .then((res) => res)
              .catch((err) => err)
          )
        );

        deleteWorks.forEach((deleteWork, index) => {
          if (!responses[index].ok) return;

          document.querySelectorAll(".gallery > figure").forEach((work) => {
            if (work.getAttribute("data-id") == deleteWork.id) {
              work.remove();
              return;
            }
          });
        });

        deleteWorks = [];
      }

      function handleClickDashboard(e) {
        e.preventDefault();

        if (!isOpenModal) {
          isOpenModal = true;
          document.body.style.overflowY = "hidden";
          document.body.insertAdjacentHTML(
            "beforeend",
            `
              <div class="modal-container">
                <div class="modal-overlay modal-close"></div>
                <div class="modal">
                  <button class="modal-close"><img src="./assets/icons/close.svg" alt=""></button>
                  <button class="back-home"><img src="./assets/icons/back.svg" alt=""></button>
                  <div id="modal-root"></div>
                </div>
              </div>`
          );

          modalGalerie();

          function modalGalerie() {
            document.querySelector("#modal-root").innerHTML = `
              <h3 class="modal__title">Galerie photo</h3>
              <div class="modal-root-galerie"></div>
              <hr>
              <button class="modal__add-picture">Ajouter une photo</button>
              <a href="#" class="modal__delete-galerie">Supprimer la galerie</a>
            `;

            addWorkCardAdmin(
              listWork,
              document.querySelector(".modal-root-galerie")
            );

            document
              .querySelectorAll(".js-delete-work")
              .forEach((deleteWorkEl) => {
                deleteWorkEl.addEventListener("click", function () {
                  const id = this.getAttribute("data-id");

                  deleteWorks.push(listWork.find((work) => work.id == id));

                  listWork = listWork.filter((work) => work.id != id);

                  document
                    .querySelectorAll(".modal-root-galerie > figure")
                    .forEach((work) => {
                      if (work.getAttribute("data-id") == id) {
                        work.remove();
                        return;
                      }
                    });
                });
              });
          }

          document.querySelectorAll(".modal-close").forEach((btn) => {
            btn.addEventListener("click", closeModal);

            function closeModal() {
              isOpenModal = false;
              document.body.style.overflowY = "auto";
              document.querySelector(".modal-container")?.remove();
              btn.removeEventListener("click", closeModal);
            }
          });
        }
      }

      function disconnectUser(e) {
        e.preventDefault();

        deleteToken();

        /* Remove HTML Elements */
        // Login Link
        document.querySelector(".login-link").innerHTML = "login";
        // Body
        document.body.removeAttribute("style");
        // Topbar and Button open modal
        document
          .querySelectorAll("#topbar, .modify-btn")
          ?.forEach((el) => el.remove());

        /* EventListener */
        // Remove Event Publish Button
        document
          .querySelector("#publish")
          .removeEventListener("click", publishToApi);

        // Remove Event HandleClick Open Modal
        document.querySelectorAll(".modify-btn").forEach((btn) => {
          btn.removeEventListener("click", handleClickDashboard);
        });

        // Remove Event Login Link
        document
          .querySelector(".login-link")
          .removeEventListener("click", disconnectUser);
      }

      // Add Event Publish Button
      document
        .querySelector("#publish")
        .addEventListener("click", publishToApi);

      // Add Event HandleClick Open Modal
      document.querySelectorAll(".modify-btn").forEach((btn) => {
        btn.addEventListener("click", handleClickDashboard);
      });

      // Add HTML Elements and Event Login Link
      document
        .querySelector(".login-link")
        .addEventListener("click", disconnectUser);
    }
  } catch (error) {
    gallery.innerHTML = '<p class="errorMessage">Projets indisponible!</p>';
  }

  function workCard(work) {
    return `<figure data-category-id="${work.categoryId}" data-id="${work.id}">
              <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
              <figcaption>${work.title}</figcaption>
            </figure>`;
  }

  function addWorksCard(works, parentEl) {
    works.forEach((work) => {
      parentEl.innerHTML += workCard(work);
    });
  }

  function filterButton(category, isActive) {
    const classNameActive = isActive ? " active" : "";
    return `<button data-category-id="${category.id}" class="filter-btn${classNameActive}">${category.name}</button>`;
  }

  function addFilterBtnEls(listCategory, parentEl) {
    parentEl.innerHTML += filterButton({ id: 0, name: "Tous" }, true);
    listCategory.forEach((category) => {
      parentEl.innerHTML += filterButton(category);
    });
  }

  function workCardAdmin(work) {
    return `<figure data-id="${work.id}">
              <img title="supprimer" class="js-delete-work" data-id=${work.id} src="./assets/icons/delete.svg" alt="">
              <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
              <figcaption>editer</figcaption>
            </figure>`;
  }

  function addWorkCardAdmin(works, parentEl) {
    works.forEach((work) => {
      parentEl.innerHTML += workCardAdmin(work);
    });
  }
});
