const api = "http://localhost:5678/api";

const categoriesEl = document.querySelector(".categories");
const galleryEl = document.querySelector(".gallery");

addWorks(galleryEl);
addCategories(categoriesEl);

/**
 *
 * @param {any[]} works
 * @param {Element} divParent
 */
function worksFiltered(works, divParent) {
  works.forEach((work) => {
    const { title, imageUrl, categoryId } = work;

    const card = createCard(title, imageUrl, categoryId);

    divParent.appendChild(card);
  });

  let indexCate = 0;

  categoriesEl.addEventListener("click", (e) => {
    e.preventDefault();

    const targetCateId = Number(e.target.getAttribute("data-category-id"));

    if (targetCateId === indexCate) return;

    const removeCards = document.querySelectorAll(`figure[data-category-id]`);

    removeCards.forEach((card) => {
      card.remove();
    });

    works
      .filter((work) => targetCateId == 0 || targetCateId == work.categoryId)
      .forEach((workFiltered) => {
        const { title, imageUrl, categoryId } = workFiltered;

        const card = createCard(title, imageUrl, categoryId);

        divParent.appendChild(card);
      });

    indexCate = targetCateId;
  });
}

/**
 *
 * @param {Element} divParent
 */
async function addCategories(divParent) {
  try {
    const categories = await getCategories();

    divParent.appendChild(createInputSubmit(0, "Tous"));

    categories.forEach((category) => {
      const { id, name } = category;

      const input = createInputSubmit(id, name);

      divParent.appendChild(input);
    });
  } catch (error) {
    catchError(error);
  }
}

/**
 *
 * @param {Element} divParent
 */
async function addWorks(divParent) {
  try {
    const works = await getWorks();

    worksFiltered(works, divParent);
  } catch (error) {
    catchError(error);
  }
}

/**
 *
 * @returns any[]
 */
async function getCategories() {
  const categories = await getFetch("categories");

  return categories;
}

/**
 *
 * @returns any[]
 */
async function getWorks() {
  const works = await getFetch(`works`);

  return works;
}

/**
 *
 * @param {string} path
 * @returns any[]
 */
async function getFetch(path) {
  const newPath = path.charAt(0) === "/" ? path.substring(1) : path;

  const response = await fetch(`${api}/${newPath}`);

  if (!response.ok) throw new Error("api error");

  const data = await response.json();

  return data;
}

/**
 *
 * @param {number} id
 * @param {string} name
 * @returns HTMLInputElement
 */
function createInputSubmit(id, name) {
  const inputAttribute = {
    type: "submit",
    value: name,
    "data-category-id": id,
  };

  const input = document.createElement("input");

  setAttributes(input, inputAttribute);

  return input;
}

/**
 *
 * @param {string} title
 * @param {string} imageUrl
 * @param {number} categoryId
 * @returns Element
 */
function createCard(title, imageUrl, categoryId) {
  const imgAttributes = {
    crossorigin: "anonymous",
    src: imageUrl,
    alt: title,
  };

  const [img, figcaption, figure] = createElements(
    "img",
    "figcaption",
    "figure"
  );

  setAttributes(img, imgAttributes);

  figcaption.innerText = title;

  figure.setAttribute("data-category-id", categoryId);

  figure.appendChild(img);
  figure.appendChild(figcaption);

  return figure;
}

/**
 *
 * @param {Element} element
 * @param {*} attributesObject
 */
function setAttributes(element, attributesObject) {
  Object.keys(attributesObject).forEach((attribute) => {
    element.setAttribute(attribute, attributesObject[attribute]);
  });
}

/**
 *
 * @param  {...any} tagsName
 * @returns Element[]
 */
function createElements(...tagsName) {
  const elements = [];
  for (let i = 0; i < tagsName.length; i++) {
    const element = document.createElement(tagsName[i]);

    elements.push(element);
  }

  return elements;
}

/**
 *
 * @param {Error} error
 */
function catchError(error) {
  if (error instanceof Error) {
    console.warn(error.message);
  } else {
    console.error(error);
  }
}
