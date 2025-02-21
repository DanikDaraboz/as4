document.addEventListener("DOMContentLoaded", async () => {
    // Загружаем корзину из localStorage
    let localCart = JSON.parse(localStorage.getItem("cart")) || [];

    // Обработчик кнопки "Add to Cart"
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", async () => {
            const productId = button.getAttribute("data-id");
            const selectedSize = document.getElementById("size-select").value;

            if (!selectedSize) {
                showNotification("⚠️ Выберите размер перед добавлением в корзину!", "error");
                return;
            }

            try {
                const response = await fetch(`/api/cart/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ size: selectedSize })
                });

                if (response.status === 401) {
                    showNotification("❌ Войдите в аккаунт, чтобы добавить в корзину!", "error");
                    return;
                }

                if (response.ok) {
                    localCart.push(productId);
                    localStorage.setItem("cart", JSON.stringify(localCart));
                    showNotification("🛒 Товар добавлен в корзину!", "success");
                } else {
                    showNotification("⚠ Не удалось добавить товар в корзину!", "error");
                }
            } catch (error) {
                console.error("Ошибка сети:", error);
                showNotification("⚠ Ошибка сети!", "error");
            }
        });
    });
});

// Функция показа уведомления
function showNotification(message, type) {
    let notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("show");
    }, 100);

    setTimeout(() => {
        notification.classList.add("hide");
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}
