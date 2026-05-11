document.addEventListener("DOMContentLoaded", () => {
  const error = document.querySelector(".error-message");

  if (!error) return;

  setTimeout(() => {
    error.style.opacity = "0";
    error.style.transform = "translateX(20px)";

    setTimeout(() => {
      error.remove();
    }, 300);
  }, 3000);
});
