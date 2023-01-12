const ModalPath = {
  GALLERY: "gallery",
  ADDWORK: "addwork",
};

class Dashboard extends Gallery {
  isOpenModal = false;
  deleteWorks = [];
  modifyBtnEls = [];

  modalPath = ModalPath.GALLERY;

  modalGalleryList = undefined;
  modalRemoveWorkButtons = [];

  constructor(selector, listWork, listCategory, api) {
    super(selector, listWork, listCategory, api);

    this.api = api;

    this.loginLinkEl = document.querySelector(".login-link");

    const { topbar, publishBtnEl } = this.createTopbar();
    this.topbar = topbar;
    this.publishBtnEl = publishBtnEl;

    this.modalContainer = this.createModal();
    this.closeButtons = document.querySelectorAll(".close-modal");
    this.modalRoot = document.querySelector("#modalRoot");
    this.modalGallery = this.createModalGallery();

    this.onDisconnectUser = this.onDisconnectUser.bind(this);
    this.onPublishToApi = this.onPublishToApi.bind(this);
    this.onToggleModal = this.onToggleModal.bind(this);
    this.onDeleteModalWork = this.onDeleteModalWork.bind(this);

    this.loginUser();
  }

  createTopbar() {
    const topbar = document.createElement("div");
    topbar.id = "topbar";
    topbar.innerHTML = `<div>
                          <img src="./assets/icons/edit.svg"/>
                          <h3>Mode édition</h3>
                        </div>`;

    const publishBtnEl = document.createElement("button");
    publishBtnEl.innerText = "publier les changements";

    topbar.insertAdjacentElement("beforeend", publishBtnEl);

    return { topbar, publishBtnEl };
  }

  createModifyButtons() {
    const modifyButtons = [
      { parentSelector: "#introduction > article", position: "afterbegin" },
      { parentSelector: "#introduction > figure", position: "beforeend" },
      { parentSelector: "#portfolio > h2", position: "beforeend" },
    ];

    modifyButtons.forEach(({ parentSelector, position }) => {
      const button = document.createElement("button");
      button.classList.add("modify-btn");
      button.innerHTML = `<img src="./assets/icons/edit_light.svg" alt="">modifier`;

      this.modifyBtnEls.push(button);

      document
        .querySelector(parentSelector)
        .insertAdjacentElement(position, button);
    });
  }

  createModal() {
    const modalContainer = document.createElement("div");
    modalContainer.id = "modalContainer";
    modalContainer.classList.add("modal-container");
    modalContainer.style.display = "none";
    modalContainer.innerHTML = `
      <div class="modal-overlay close-modal"></div>
      <div class="modal">
        <button id="close" class="close-modal"><img src="./assets/icons/close.svg" alt=""></button>
        <button id="back" class="back-home"><img src="./assets/icons/back.svg" alt=""></button>
        <div id="modalRoot"></div>
      </div>`;

    document.body.insertAdjacentElement("beforeend", modalContainer);

    return modalContainer;
  }

  createModalGallery() {
    const modalGallery = document.createElement("div");
    modalGallery.id = "modalGallery";
    modalGallery.style.display = "block";
    modalGallery.innerHTML = `
      <h3 class="modal__title">Galerie photo</h3>
      <div class="modal-gallery-list"></div>
      <hr>
      <button class="modal__add-picture">Ajouter une photo</button>
      <a href="#" class="modal__delete-galerie">Supprimer la galerie</a>`;

    return modalGallery;
  }

  createWorkCardModal(work) {
    const figure = document.createElement("figure");
    figure.setAttribute("data-id", work.id);
    figure.innerHTML = `
      <img title="supprimer" class="js-delete-work" data-id=${work.id} src="./assets/icons/delete.svg" alt="${work.title} icon delete">
      <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
      <figcaption>editer</figcaption>
    `;

    return figure;
  }

  onDeleteModalWork(e) {
    e.preventDefault();
    const deleteBtn = e.target;

    const id = deleteBtn.getAttribute("data-id");

    this.deleteWorks.push(this.listWork.find((work) => work.id == id));

    document
      .querySelector(`.modal-gallery-list > figure[data-id="${id}"]`)
      .remove();
  }

  onToggleModal(e) {
    e.preventDefault();

    if ((this.isOpenModal = !this.isOpenModal)) {
      document.body.style.overflowY = "hidden";
      this.modalContainer.style.display = "block";

      if (this.modalPath === ModalPath.GALLERY) {
        this.modalGallery.style.display = "block";
      } else {
        this.modalGallery.style.display = "none";
      }
    } else {
      document.body.style.overflowY = "auto";
      this.modalContainer.style.display = "none";
    }
  }

  async onPublishToApi(e) {
    e.preventDefault();

    if (this.deleteWorks <= 0) return;

    const responses = await Promise.all(
      this.deleteWorks.map((deleteWork) =>
        fetch(`${this.api}/works/${deleteWork.id}`, {
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

    this.deleteWorks.forEach((deleteWork, index) => {
      if (!responses[index].ok) return;

      document.querySelector(`.gallery [data-id="${deleteWork.id}"]`).remove();

      const workCardElsFiltered = this.workCardEls.filter(
        (el) => el.getAttribute(`data-id`) != deleteWork.id
      );
      this.workCardEls = workCardElsFiltered;

      const listWorkFiltered = this.listWork.filter(
        (work) => work.id != deleteWork.id
      );
      this.listWork = listWorkFiltered;
    });

    this.deleteWorks = [];
  }

  onDisconnectUser(e) {
    e.preventDefault();

    deleteToken();

    this.loginLinkEl.innerHTML = "login";
    document.body.style.paddingTop = "0";

    this.loginLinkEl.removeEventListener("click", this.onDisconnectUser);
    this.publishBtnEl.removeEventListener("click", this.onPublishToApi);
    this.modifyBtnEls.forEach((btn) =>
      btn.removeEventListener("click", this.onToggleModal)
    );
    this.closeButtons.forEach((close) =>
      close.removeEventListener("click", this.onToggleModal)
    );
    this.modalRemoveWorkButtons.forEach((btn) =>
      btn.removeEventListener("click", this.onDeleteModalWork)
    );

    this.modifyBtnEls.forEach((btn) => btn.remove());
    this.modalContainer.remove();
    this.topbar.remove();
  }

  loginUser() {
    this.loginLinkEl.innerHTML = "logout";
    document.body.insertAdjacentElement("afterbegin", this.topbar);
    document.body.style.paddingTop = "60px";

    this.createModifyButtons();

    this.modalRoot.insertAdjacentElement("beforeend", this.modalGallery);

    this.modalGalleryList = document.querySelector(".modal-gallery-list");

    this.listWork.forEach((work) => {
      this.modalGalleryList.insertAdjacentElement(
        "beforeend",
        this.createWorkCardModal(work)
      );
    });

    this.modalRemoveWorkButtons = document.querySelectorAll(".js-delete-work");

    this.loginLinkEl.addEventListener("click", this.onDisconnectUser);
    this.publishBtnEl.addEventListener("click", this.onPublishToApi);
    this.modifyBtnEls.forEach((btn) =>
      btn.addEventListener("click", this.onToggleModal)
    );
    this.closeButtons.forEach((close) =>
      close.addEventListener("click", this.onToggleModal)
    );
    this.modalRemoveWorkButtons.forEach((btn) =>
      btn.addEventListener("click", this.onDeleteModalWork)
    );
  }
}
