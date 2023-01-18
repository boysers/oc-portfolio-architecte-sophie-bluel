/**
 * Interface Category
 * @typedef ICategory
 * @type {object}
 * @property {number} id
 * @property {string} name
 */

/**
 * Interface Work
 * @typedef IWork
 * @type {object}
 * @property {ICategory} category
 * @property {number} categoryId
 * @property {number} id
 * @property {string} imageUrl
 * @property {string} title
 * @property {number} userId
 */

class Gallery {
  indexCategoryPrevious = 0;

  /** @type {HTMLElement[]} */
  workCardEls = [];

  /** @type {HTMLButtonElement[]} */
  filterButtonEls = [];

  /** @type {HTMLDivElement | null} */
  gallery = null;

  /** @type {HTMLDivElement | null} */
  filter = null;

  /**
   * @param {IWork[]} listWork
   * @param {ICategory[]} listCategory
   */
  constructor(listWork, listCategory) {
    this.listWork = listWork;

    this.listCategory = listCategory;

    this.onFilterWorkEls = this.onFilterWorkEls.bind(this);
  }

  createFilterContainer() {
    const filter = document.createElement("div");

    filter.classList.add("filter");

    return filter;
  }

  /**
   * @param {ICategory} category
   * @param {boolean} isActive
   */
  createFilterButton(category, isActive = false) {
    const filterButton = document.createElement("button");

    filterButton.classList.add("filter-btn");

    if (isActive) filterButton.classList.add("active");

    filterButton.setAttribute("data-category-id", category.id);

    filterButton.innerText = category.name;

    this.filterButtonEls.push(filterButton);
  }

  /** @param {HTMLButtonElement[]} filterButtonEls */
  insertFilterButton(filterButtonEls) {
    filterButtonEls.forEach((filterButtonEl) =>
      this.filter.insertAdjacentElement("beforeend", filterButtonEl)
    );
  }

  /** @param {IWork} work */
  createWorkCardEl(work) {
    const workCardEl = document.createElement("figure");

    workCardEl.setAttribute("data-category-id", work.categoryId);

    workCardEl.setAttribute("data-id", work.id);

    workCardEl.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}" crossorigin="anonymous">
      <figcaption>${work.title}</figcaption>`;

    this.workCardEls.push(workCardEl);

    return workCardEl;
  }

  /** @param {HTMLElement[]} workEls */
  insertGalleryWorks(workEls) {
    workEls.forEach((workEl) =>
      this.gallery.insertAdjacentElement("beforeend", workEl)
    );
  }

  insertGalleryFilter() {
    if (this.filter === null) return;

    this.gallery.insertAdjacentElement("beforebegin", this.filter);
  }

  /** @param {MouseEvent} e */
  onFilterWorkEls(e) {
    e.preventDefault();

    const btn = e.target;

    /** @type {string} */
    const btnCategoryId = btn.getAttribute("data-category-id");

    if (this.indexCategoryPrevious == btnCategoryId) return;

    this.indexCategoryPrevious = Number(btnCategoryId);

    this.filterButtonEls.forEach((btn) => btn.classList.remove("active"));

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

  removeListenerEventFilterButton() {
    this.filterButtonEls.forEach((filterBtn) =>
      filterBtn.removeEventListener("click", this.onFilterWorkEls)
    );
  }

  /**
   * @param {string} selectors
   */
  initGallerySelector(selectors) {
    this.gallery = document.querySelector(selectors);

    this.filter = this.createFilterContainer();

    this.insertGalleryFilter();

    this.listWork.forEach((work) => this.createWorkCardEl(work));

    this.insertGalleryWorks(this.workCardEls);

    this.createFilterButton({ name: "Tous", id: 0 }, true);

    this.listCategory.forEach((category) => this.createFilterButton(category));

    this.insertFilterButton(this.filterButtonEls);

    this.filterButtonEls.forEach((filterBtn) =>
      filterBtn.addEventListener("click", this.onFilterWorkEls)
    );
  }
}
