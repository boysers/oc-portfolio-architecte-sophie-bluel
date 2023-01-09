const state = {
  works: [],
  categories: [],
};

const categoriesEl = document.querySelector(".categories");
const galleryEl = document.querySelector(".gallery");

addWorks(galleryEl);
addCategories(categoriesEl);

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

async function getCategories() {
  const categories = await getFetch("categories");

  if (isUserLogged()) state.categories = categories;

  return categories;
}

async function getWorks() {
  const works = await getFetch(`works`);

  if (isUserLogged()) state.works = works;

  return works;
}

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

async function addWorks(divParent) {
  try {
    const works = await getWorks();

    worksFiltered(works, divParent);
  } catch (error) {
    catchError(error);
  }
}

function createInputSubmit(id, name) {
  const inputAttributes = {
    type: "submit",
    value: name,
    "data-category-id": id,
  };

  const input = document.createElement("input");

  setAttributes(input, inputAttributes);

  return input;
}

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
