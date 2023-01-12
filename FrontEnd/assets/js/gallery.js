class Gallery {
  workCardEls = [];
  filterButtonEls = [];
  preventIndexCategory = 0;

  /**
   * ElementHTML Gallery
   * @param {string} selector
   */
  constructor(selector, listWork, listCategory) {
    this.gallery = document.querySelector(selector);
    this.filter = this.createFilterContainer();
    this.listWork = listWork;
    this.listCategory = listCategory;

    this.handleClickFilterWorkEls = this.handleClickFilterWorkEls.bind(this);
  }

  createFilterContainer() {
    const filter = document.createElement("div");
    filter.classList.add("filter");
    return filter;
  }

  createFilterButton(category, isActive) {
    const filterButton = document.createElement("button");
    filterButton.classList.add("filter-btn");
    if (isActive) filterButton.classList.add("active");

    filterButton.setAttribute("data-category-id", category.id);
    filterButton.innerText = category.name;

    this.filterButtonEls.push(filterButton);
  }

  insertFilterButton(filterButtonEls) {
    filterButtonEls.forEach((filterButtonEl) => {
      this.filter.insertAdjacentElement("beforeend", filterButtonEl);
    });
  }

  createWorkCardEl(work) {
    const workCardEl = document.createElement("figure");
    workCardEl.setAttribute("data-category-id", work.categoryId);
    workCardEl.setAttribute("data-id", work.id);
    workCardEl.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
      <figcaption>${work.title}</figcaption>`;

    this.workCardEls.push(workCardEl);
  }

  insertGalleryWorks(workEls) {
    workEls.forEach((workEl) => {
      this.gallery.insertAdjacentElement("beforeend", workEl);
    });
  }

  insertGalleryFilter() {
    this.gallery.insertAdjacentElement("beforebegin", this.filter);
  }

  handleClickFilterWorkEls(e) {
    e.preventDefault();

    const btn = e.target;
    const btnCategoryId = btn.getAttribute("data-category-id");

    if (this.preventIndexCategory == btnCategoryId) return;

    this.preventIndexCategory = btnCategoryId;

    this.filterButtonEls.forEach((btn) => {
      btn.classList.remove("active");
    });
    btn.classList.add("active");

    this.gallery.innerHTML = "";

    if (btnCategoryId == 0) {
      this.insertGalleryWorks(this.workCardEls);
      return;
    }

    const listWorkFiltered = this.workCardEls.filter((workEl) =>
      workEl.getAttribute("data-category-id", btnCategoryId) == btnCategoryId
        ? 1
        : 0
    );

    this.insertGalleryWorks(listWorkFiltered);
  }

  // Retire l'EventListener des boutons filterButtonEls
  removeEventListenerFilterButton() {
    this.filterButtonEls.forEach((filterBtn) => {
      filterBtn.removeEventListener("click", this.handleClickFilterWorkEls);
    });
  }

  initGallery() {
    this.insertGalleryFilter();

    this.listWork.forEach((work) => this.createWorkCardEl(work));
    this.insertGalleryWorks(this.workCardEls);

    this.createFilterButton({ name: "Tous", id: 0 }, true);
    this.listCategory.forEach((category) => this.createFilterButton(category));
    this.insertFilterButton(this.filterButtonEls);

    this.filterButtonEls.forEach((filterBtn) => {
      filterBtn.addEventListener("click", this.handleClickFilterWorkEls);
    });
  }
}
