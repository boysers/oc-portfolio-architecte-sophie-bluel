const api = "http://localhost:5678/api";

const loginBtnEl = document.querySelector("#loginBtn");

loginBtnEl.addEventListener("click", (e) => {
  e.preventDefault();

  if (isUserLogged()) {
    deleteUserLoginSessionStorage()
    location.reload();
  } else {
    useLocation("./login.html");
  }
});

async function postFetch(path, userData) {
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(userData),
  };

  const response = await fetch(`${api}/${removeSlash(path)}`, init);

  if (!response.ok) throw new Error(response.statusText);

  const data = await response.json();

  return data;
}

async function getFetch(path) {
  const response = await fetch(`${api}/${removeSlash(path)}`);

  if (!response.ok) throw new Error(response.statusText);

  const data = await response.json();

  return data;
}

function setAttributes(element, attributesObject) {
  Object.keys(attributesObject).forEach((attribute) => {
    element.setAttribute(attribute, attributesObject[attribute]);
  });
}

function createElements(...tagsName) {
  const elements = [];
  for (let i = 0; i < tagsName.length; i++) {
    const element = document.createElement(tagsName[i]);

    elements.push(element);
  }

  return elements;
}

function catchError(error) {
  if (error instanceof Error) {
    console.warn(error.message);
  } else {
    console.error(error);
  }
}

function removeSlash(path) {
  const newPath = path.charAt(0) === "/" ? path.substring(1) : path;

  return newPath;
}

function deleteUserLoginSessionStorage() {
  sessionStorage.removeItem("user");
}

function getUserLoginSessionStorage() {
  const userData = JSON.parse(sessionStorage.getItem("user"));

  return userData;
}

function isUserLogged() {
  return getUserLoginSessionStorage()?.isLogged ? true : false;
}

function useLocation(path) {
  window.location.href = path;
}
