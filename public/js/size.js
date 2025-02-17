document.addEventListener("DOMContentLoaded", function () {
    const sizeSelect = document.getElementById("size-select");
    const addToCartButton = document.querySelector(".add-to-cart");

    sizeSelect.addEventListener("change", function () {
        addToCartButton.disabled = false; // Разблокировать кнопку после выбора размера
    });

    addToCartButton.addEventListener("click", function () {
        const selectedSize = sizeSelect.value;
        const productId = addToCartButton.getAttribute("data-id");

        if (!selectedSize) {
            alert("Please select a size first!");
            return;
        }

        fetch("/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId, size: selectedSize }),
            credentials: "include" // Передает cookie сессии
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Product added to cart!");
            } else {
                alert(data.message); // Выведет "You must be logged in to add to cart", если не авторизован
            }
        })
        .catch(error => console.error("Error:", error));
    });
});
