async function deleteProduct(btn) {
  const productItem = btn.closest(".product-item");
  const productId = productItem.querySelector("[name=productId]").value;
  const csrf = productItem.querySelector("[name=_csrf]").value;

  try {
    const response = await fetch(`/admin/product/${productId}`, {
      method: "DELETE",
      headers: {
        "csrf-token": csrf,
      },
    });

    if (!response.ok) {
      throw new Error("Deleting product failed.");
    }

    const data = await response.json();

    console.log(data.message);

    productItem.remove();

    const productsLeft = document.querySelectorAll(".product-item");

    if (productsLeft.length === 0) {
      const url = new URL(window.location);

      const currentPage = Number(url.searchParams.get("page")) || 1;

      if (currentPage > 1) {
        url.searchParams.set("page", currentPage - 1);
        window.location.href = url.toString();
      } else {
        window.location.reload();
      }
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while deleting the product.");
  }
}
