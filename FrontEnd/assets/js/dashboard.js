const dashboard = document.querySelector("#dashboard");
const modalGallery = document.querySelector("#modalGallery");
const modalTriggerBtnEls = document.querySelectorAll(
  ".modify-btn, .modal-trigger"
);

if (isUserLogged()) {
  dashboard.classList.toggle("admin--active");
  loginBtnEl.innerHTML = "logout";

  modalTriggerBtnEls.forEach((btn) => {
    if (!btn.classList.contains("modal-trigger")) {
      btn.classList.toggle("admin--active");
    }

    btn.addEventListener("click", () => {
      modalGallery.classList.toggle("modal--active");
    });
  });
}
