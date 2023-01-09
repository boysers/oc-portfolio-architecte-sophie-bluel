if (isLogin()) {
  const loginLink = document.querySelector(".login-link");
  const modifyButtons = [
    { parentSelector: "#introduction > article", position: "afterbegin" },
    { parentSelector: "#introduction > figure", position: "beforeend" },
    { parentSelector: "#portfolio > h2", position: "beforeend" },
  ];

  loginLink.innerHTML = "logout";

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
      <div id="topbar">
        <h3><img src="./assets/icons/edit.svg"/>Mode édition</h3>
        <button>publier les changements</button>
      </div>`
  );

  modifyButtons.forEach(({ parentSelector, position }) =>
    addModifyBtn(parentSelector, position)
  );

  // document.body.style.overflowY = "hidden"

  function disconnectUser(e) {
    e.preventDefault();

    sessionStorage.removeItem("user");

    loginLink.innerHTML = "login";
    document.querySelector("#topbar, .modify-btn")?.remove();

    loginLink.removeEventListener("click", disconnectUser);
  }

  loginLink.addEventListener("click", disconnectUser);
}

async function loadConfig() {
  const config = await fetch("./config.json");

  const jsonConfig = await config.json();

  return jsonConfig;
}

function isLogin() {
  return sessionStorage.getItem("user") ? true : false;
}

/**
 *
 * @param {Element} parentSelector
 * @param {"afterbegin" | "beforeend"} position
 * @returns
 */
function addModifyBtn(parentSelector, position) {
  document
    .querySelector(parentSelector)
    .insertAdjacentHTML(
      position,
      `<button class="modify-btn"><img src="./assets/icons/edit_light.svg"/>modifier</button>`
    );
}
