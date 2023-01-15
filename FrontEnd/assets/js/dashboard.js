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

  postWork = {
    image: undefined,
    title: undefined,
    category: undefined,
  };

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
    this.backGalleryButton = this.modalContainer.querySelector("#back");
    this.modalRoot = this.modalContainer.querySelector("#modalRoot");

    // Modal Gallery
    this.modalGallery = this.createModalGallery();
    this.deleteGalleryButton = this.modalGallery.querySelector(
      ".modal__delete-galerie"
    );
    this.linkToAddWorkButton = this.modalGallery.querySelector(
      ".modal__add-picture"
    );

    // Modal AddWork
    this.modalAddWork = this.createModalAddWork();
    this.modalAddWorkPicture =
      this.modalAddWork.querySelector('input[type="file"]');
    /** @type {HTMLButtonElement} */
    this.modalPostWorkButton =
      this.modalAddWork.querySelector("#js-addWorkApi");
    this.modalAddWorkForm = this.modalAddWork.querySelector("form");

    const [title, category] = this.modalAddWork.querySelectorAll(
      'input[data-type="title"], select'
    );
    this.modalAddWorkTitle = title;
    this.modalAddWorkCategory = category;

    // Event
    this.onDisconnectUser = this.onDisconnectUser.bind(this);
    this.onPublishToApi = this.onPublishToApi.bind(this);
    this.onToggleModal = this.onToggleModal.bind(this);
    this.onDeleteModalWork = this.onDeleteModalWork.bind(this);
    this.onDeleteGalleryEl = this.onDeleteGalleryEl.bind(this);
    this.onSwitchModalPath = this.onSwitchModalPath.bind(this);
    this.onChangeAddWorkPicture = this.onChangeAddWorkPicture.bind(this);
    this.onChangeAddWorkInput = this.onChangeAddWorkInput.bind(this);
    this.onPostWorkToApi = this.onPostWorkToApi.bind(this);

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
        <img id="back" class="back-home" src="./assets/icons/back.svg" alt="">
        <div id="modalRoot"></div>
      </div>`;

    document.body.insertAdjacentElement("afterbegin", modalContainer);

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

  createModalAddWork() {
    const modalAddWork = document.createElement("div");
    modalAddWork.id = "modalAddWork";
    modalAddWork.style.display = "none";
    modalAddWork.innerHTML = `
      <h3 class="modal__title">Ajout photo</h3>
      <form>
        <div class="form__picture">
          <label for="yourPicture"
            ><img src="./assets/icons/your_img.svg" alt="votre image"
          /></label>
          <input
            name="yourPicture"
            type="file"
            id="yourPicture"
            accept="image/*"
            data-type="image"
            required
          />
        </div>

        <label for="title">Titre</label>
        <input data-type="title" type="text" name="title" id="title" required />

        <label for="category">Catégorie</label>
        <select data-type="category" name="categories" id="category">
          <option value="0"></option>
          ${this.listCategory.map(
            (category) => `
              <option value="${category.id}">${category.name}</option>`
          )}
        </select>

        <hr/>

        <button class="modal__postWorkButton" id="js-addWorkApi" disabled>Valider</button>
      </form>`;

    return modalAddWork;
  }

  verifPostWork() {
    let disabled = true;

    for (const key in this.postWork) {
      if (this.postWork[key] === undefined) {
        disabled = true;
        break;
      }
      disabled = false;
    }

    this.modalPostWorkButton.disabled = disabled;

    return disabled;
  }

  /**
   * @param {HTMLElement} element
   * @param {string} to
   */
  linkPath(element, to) {
    if (
      (to == ModalPath.ADDWORK) |
      element?.classList.contains("modal__add-picture")
    ) {
      this.modalPath = ModalPath.ADDWORK;
    } else if ((to == ModalPath.GALLERY) | (element?.id === "back")) {
      this.modalPath = ModalPath.GALLERY;
    }

    this.backGalleryButton.classList.toggle("active");

    if (this.modalPath === ModalPath.GALLERY) {
      this.modalGallery.style.display = "block";
      this.modalAddWork.style.display = "none";
    } else {
      this.modalGallery.style.display = "none";
      this.modalAddWork.style.display = "block";
    }
  }

  resetForm() {
    this.postWork = {
      image: undefined,
      title: undefined,
      category: undefined,
    };
  }

  removeModalDeleteWorks() {
    this.deleteWorks.forEach((deleteWork) => {
      const el = document.querySelector(
        `.modal-gallery-list > figure[data-id="${deleteWork.id}"]`
      );

      el.removeEventListener("click", this.onDeleteModalWork);
      el.remove();
    });
  }

  removeAllListenerEvents() {
    // Modify Buttons
    this.modifyButtonElements.forEach((btn) =>
      btn.removeEventListener("click", this.onToggleModal)
    );

    // TopBar
    this.publishButtonElement.removeEventListener("click", this.onPublishToApi);

    // this.modalRemoveWorkButtons.forEach((btn) =>
    //   btn.removeEventListener("click", this.onDeleteModalWork)
    // );

    document
      .querySelectorAll(".js-delete-work")
      .forEach((btn) =>
        btn.removeEventListener("click", this.onDeleteModalWork)
      );

    this.closeButtons.forEach((close) =>
      close.removeEventListener("click", this.onToggleModal)
    );

    this.deleteGalleryButton.removeEventListener(
      "click",
      this.onDeleteGalleryEl
    );

    this.backGalleryButton.removeEventListener("click", this.onSwitchModalPath);
    this.linkToAddWorkButton.removeEventListener(
      "click",
      this.onSwitchModalPath
    );

    this.modalAddWorkPicture.removeEventListener(
      "change",
      this.onChangeAddWorkPicture
    );

    this.modalAddWorkTitle.removeEventListener(
      "change",
      this.onChangeAddWorkInput
    );

    this.modalAddWorkCategory.removeEventListener(
      "change",
      this.onChangeAddWorkInput
    );

    this.modalAddWorkForm.removeEventListener("submit", this.onPostWorkToApi);
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
    this.backGalleryButton.addEventListener("click", this.onSwitchModalPath);

    this.deleteGalleryButton.addEventListener("click", this.onDeleteGalleryEl);
    // Modal Gallery
    this.modalRemoveWorkButtons.forEach((btn) =>
      btn.addEventListener("click", this.onDeleteModalWork)
    );

    // Modal AddWork
    this.linkToAddWorkButton.addEventListener("click", this.onSwitchModalPath);

    this.modalAddWorkPicture.addEventListener(
      "change",
      this.onChangeAddWorkPicture
    );
    this.modalAddWorkTitle.addEventListener(
      "change",
      this.onChangeAddWorkInput
    );
    this.modalAddWorkCategory.addEventListener(
      "change",
      this.onChangeAddWorkInput
    );
    this.modalAddWorkForm.addEventListener("submit", this.onPostWorkToApi);
  }

  onChangeAddWorkInput(e) {
    e.preventDefault();

    const targetEl = e.target;

    const dataType = targetEl.getAttribute("data-type");
    const value = targetEl.value;

    switch (dataType) {
      case "title":
        this.postWork.title = value ? value : undefined;
        break;
      case "category":
        const id = Number(value);
        this.postWork.category = id ? id : undefined;
        break;
      default:
        return;
    }

    this.verifPostWork();
  }

  onChangeAddWorkPicture(e) {
    const file = e.target.files[0];

    this.postWork.image = file;

    const blobUrl = URL.createObjectURL(file);

    /**@type {HTMLImageElement} */
    const img = this.modalAddWork.querySelector(".form__picture img");

    img.src = blobUrl;

    this.verifPostWork();
  }

  onDeleteGalleryEl(e) {
    e.preventDefault();

    let really = false;

    const isUserConfirm = confirm("Confirmer la suppression de la gallery ?");
    if (!isUserConfirm) return;

    really = confirm(
      "Etes vous vraiment sur de vouloir supprimer TOUS vos projets ?!"
    );
    if (!really) return;

    this.listWork.forEach((work) => this.deleteWorks.push(work));

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

  onSwitchModalPath(e) {
    e.preventDefault();

    const targetEl = e.target;

    this.linkPath(targetEl);
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

      this.gallery.querySelector(`[data-id="${deleteWork.id}"]`)?.remove();

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

  async onPostWorkToApi(e) {
    e.preventDefault();

    if (this.verifPostWork()) return;

    const postWork = this.postWork;
    const formData = new FormData();

    for (const name in postWork) {
      formData.append(name, postWork[name]);
    }

    /** @type {Work} */
    const data = await fetch(`${this.api}/works`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    })
      .then((res) => (res.ok ? res.json() : res))
      .catch((err) => err);

    this.listWork.push(data);

    const workCardEl = this.createWorkCardEl(data);

    if (data.categoryId === this.indexCategoryPrevious) {
      this.gallery.insertAdjacentElement("beforeend", workCardEl);
    }

    const workCardModal = this.createWorkCardModal(data);

    this.modalGalleryList.insertAdjacentElement("beforeend", workCardModal);

    const deleteButton = workCardModal.querySelector(".js-delete-work");

    deleteButton.addEventListener("click", this.onDeleteModalWork);

    this.linkPath(null, ModalPath.GALLERY);

    this.modalAddWorkForm.reset();

    this.modalAddWork.querySelector(".form__picture img").src =
      "./assets/icons/your_img.svg";

    this.resetForm();
    this.verifPostWork();
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
    this.modalRoot.insertAdjacentElement("beforeend", this.modalAddWork);

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
