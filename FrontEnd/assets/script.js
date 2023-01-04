const api = "http://localhost:5678/api";

addGalleryWorks(document.querySelector(".gallery"));

/**
 *
 * @param {Element} divParent
 */
async function addGalleryWorks(divParent) {
  try {
    const works = await getWorks();

    works.forEach((work) => {
      const { title, imageUrl } = work;

      const card = createCard(title, imageUrl);

      divParent.appendChild(card);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.warn(error.message);
    } else {
      console.error(error);
    }
  }
}

async function getWorks() {
  const works = await getFetch(`works`);

  return works;
}

/**
 *
 * @param {string} title
 * @param {string} imageUrl
 */
function createCard(title, imageUrl) {
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

  Object.keys(imgAttributes).forEach((attribute) => {
    img.setAttribute(attribute, imgAttributes[attribute]);
  });

  figcaption.innerText = title;

  figure.appendChild(img);
  figure.appendChild(figcaption);

  return figure;
}

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
 * @param {string} path
 */
async function getFetch(path) {
  const newPath = path.charAt(0) === "/" ? path.substring(1) : path;

  const response = await fetch(`${api}/${newPath}`);

  if (!response.ok) throw new Error("api error");

  const data = await response.json();

  return data;
}
