"use strict";
const ModalPath = {
  GALLERY: "gallery",
  ADDWORK: "addwork",
};
Object.freeze(ModalPath);

class Dashboard extends Gallery {
  isOpenModal = false;

  modalPath = ModalPath.GALLERY;

  /** @type {Work[]} */
  deleteWorks = [];

  /** @type {HTMLElement | null}  */
  modalGalleryList = null;

  /** @type {HTMLButtonElement[]} */
  modalRemoveWorkButtons = [];

  /**
   * @param {string} api
   */
  constructor(listWork, listCategory, api) {
    super(listWork, listCategory);

    /** @type {string} */
    this.api = api;

    // Topbar
    const { topbar, publishButtonElement } = this.createTopbar();
    this.topbar = topbar;
    this.publishButtonElement = publishButtonElement;

    // Modify Buttons
    this.modifyButtonElements = this.createModifyButtons();

    // === Modal ===
    this.modalContainer = this.createModal();
    this.closeButtons = this.modalContainer.querySelectorAll(".close-modal");
    this.modalRoot = this.modalContainer.querySelector("#modalRoot");

    // Modal Gallery
    this.modalGallery = this.createModalGallery();
    this.deleteGalleryButton = this.modalGallery.querySelector(
      ".modal__delete-galerie"
    );

    // Event
    this.onDisconnectUser = this.onDisconnectUser.bind(this);
    this.onPublishToApi = this.onPublishToApi.bind(this);
    this.onToggleModal = this.onToggleModal.bind(this);
    this.onDeleteModalWork = this.onDeleteModalWork.bind(this);
    this.onDeleteGalleryEl = this.onDeleteGalleryEl.bind(this);

    // Init
    this.loginUser();
  }

  createTopbar() {
    const topbar = document.createElement("div");
    topbar.id = "topbar";
    topbar.innerHTML = `<div>
                          <img src="./assets/icons/edit.svg"/>
                          <h3>Mode édition</h3>
                        </div>`;

    const publishButtonElement = document.createElement("button");
    publishButtonElement.innerText = "publier les changements";

    topbar.insertAdjacentElement("beforeend", publishButtonElement);

    return { topbar, publishButtonElement };
  }

  createModifyButtons() {
    const modifyButtons = [
      { parentSelector: "#introduction > article", position: "afterbegin" },
      { parentSelector: "#introduction > figure", position: "beforeend" },
      { parentSelector: "#portfolio > h2", position: "beforeend" },
    ];

    return modifyButtons.map(({ parentSelector, position }) => {
      const button = document.createElement("button");
      button.classList.add("modify-btn");
      button.innerHTML = `<img src="./assets/icons/edit_light.svg" alt="">modifier`;

      document
        .querySelector(parentSelector)
        .insertAdjacentElement(position, button);

      return button;
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

  removeModalDeleteWorks() {
    this.deleteWorks.forEach((deleteWork) => {
      document
        .querySelector(
          `.modal-gallery-list > figure[data-id="${deleteWork.id}"]`
        )
        .remove();
    });
  }

  removeAllListenerEvents() {
    this.publishButtonElement.removeEventListener("click", this.onPublishToApi);
    this.modifyButtonElements.forEach((btn) =>
      btn.removeEventListener("click", this.onToggleModal)
    );
    this.closeButtons.forEach((close) =>
      close.removeEventListener("click", this.onToggleModal)
    );
    this.modalRemoveWorkButtons.forEach((btn) =>
      btn.removeEventListener("click", this.onDeleteModalWork)
    );
    this.deleteGalleryButton.addEventListener("click", this.onDeleteGalleryEl);
  }

  addAllListenerEvents() {
    // Modify buttons
    this.modifyButtonElements.forEach((btn) =>
      btn.addEventListener("click", this.onToggleModal)
    );

    // TopBar
    this.publishButtonElement.addEventListener("click", this.onPublishToApi);

    this.modalRemoveWorkButtons =
      this.modalGalleryList.querySelectorAll(".js-delete-work");

    // === Modal ===
    this.closeButtons.forEach((close) =>
      close.addEventListener("click", this.onToggleModal)
    );

    // Modal Gallery
    this.deleteGalleryButton.addEventListener("click", this.onDeleteGalleryEl);
    this.modalRemoveWorkButtons.forEach((btn) =>
      btn.addEventListener("click", this.onDeleteModalWork)
    );
  }

  onDeleteGalleryEl(e) {
    e.preventDefault();

    if (this.deleteWorks.length <= 0) return;

    let really = false;

    const isUserConfirm = confirm("Confirmer la suppression de la gallery ?");
    if (!isUserConfirm) return;

    really = confirm(
      "Etes vous vraiment sur de vouloir supprimer TOUS vos projets ?!"
    );
    if (!really) return;

    this.removeListenerEventFilterButton();

    this.deleteWorks = this.listWork;

    this.gallery.remove();
    this.filter.remove();
    this.removeModalDeleteWorks();

    this.onPublishToApi(e);
  }

  onDeleteModalWork(e) {
    e.preventDefault();
    const deleteBtn = e.target;

    const id = deleteBtn.getAttribute("data-id");

    const isUserConfirm = confirm("Confirmer la suppression ?");

    if (!isUserConfirm) return;

    this.deleteWorks.push(this.listWork.find((work) => work.id == id));

    this.removeModalDeleteWorks();

    this.onPublishToApi(e);
  }

  onToggleModal(e) {
    e.preventDefault();

    const targetEl = e.target;

    if (targetEl.classList.contains("modify-btn")) {
      scroll({
        top: Math.floor(targetEl.offsetParent.offsetTop - 100),
        behavior: "smooth",
      });
    }

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

    const datas = await Promise.all(
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
      if (!datas[index].ok) return;

      this.gallery.querySelector(`[data-id="${deleteWork.id}"]`).remove();

      const indexWorkCardEl = this.workCardEls.findIndex(
        (el) => el.getAttribute(`data-id`) == deleteWork.id
      );
      this.workCardEls.splice(indexWorkCardEl, 1);

      const indexWork = this.listWork.findIndex(
        (work) => work.id == deleteWork.id
      );
      this.listWork.splice(indexWork, 1);
    });

    this.deleteWorks = [];
  }

  onDisconnectUser(e) {
    e.preventDefault();

    this.removeAllListenerEvents();

    deleteToken();

    document.body.style.paddingTop = "0";

    this.modifyButtonElements.forEach((btn) => btn.remove());
    this.modalContainer.remove();
    this.topbar.remove();
  }

  loginUser() {
    document.body.insertAdjacentElement("afterbegin", this.topbar);
    document.body.style.paddingTop = "60px";

    this.modalRoot.insertAdjacentElement("beforeend", this.modalGallery);

    this.modalGalleryList = this.modalGallery.querySelector(
      ".modal-gallery-list"
    );

    this.listWork.forEach((work) => {
      this.modalGalleryList.insertAdjacentElement(
        "beforeend",
        this.createWorkCardModal(work)
      );
    });

    this.addAllListenerEvents();
  }
}
