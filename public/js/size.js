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
            showNotification("❌ Пожалуйста, выберите размер!", "error");
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
                showNotification("✅ Товар добавлен в корзину!", "success");
            } else {
                showNotification(`❌ Ошибка: ${data.message}`, "error");
            }
        })
        .catch(error => {
            console.error("Ошибка:", error);
            showNotification("❌ Ошибка при добавлении в корзину.", "error");
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
