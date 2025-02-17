document.addEventListener("DOMContentLoaded", async () => {
    // Загружаем корзину из localStorage
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];

    // Обновляем UI кнопки "Add to Cart"
    const updateCartUI = () => {
        document.querySelectorAll(".add-to-cart").forEach(button => {
            const productId = button.getAttribute("data-id");
            if (localCart.includes(productId)) {
                button.textContent = "Added to Cart";
                button.disabled = true;
            }
        });
    };
    updateCartUI();

    // Обработчик кнопки "Add to Cart"
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.getAttribute("data-id");
            const selectedSize = document.getElementById("size-select").value;

            if (!selectedSize) {
                alert("⚠️ Please select a size before adding to cart!");
                return;
            }

            try {
                const response = await fetch(`/api/cart/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ size: selectedSize })
                });

                if (response.status === 401) {
                    alert("❌ Please log in to add items to your cart!");
                    return;
                }

                if (response.ok) {
                    localCart.push(productId);
                    localStorage.setItem("cart", JSON.stringify(localCart));
                    updateCartUI();
                } else {
                    console.error("Failed to add item to cart");
                }
            } catch (error) {
                console.error("Network error:", error);
            }
        });
    });
});

// Скрипт для кнопки "Buy"

