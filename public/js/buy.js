document.addEventListener("DOMContentLoaded", () => {
    const buyButtons = document.querySelectorAll(".buy");

    buyButtons.forEach((buyButton) => {
        buyButton.addEventListener("click", async (e) => {
            e.preventDefault();

            const productId = buyButton.dataset.productId;  
            const size = buyButton.dataset.size;  

            try {
                const response = await fetch("/buy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId, size })  
                });

                if (response.ok) {
                    showNotification("✅ Покупка успешно оформлена!", "success");
                } else {
                    const message = await response.text();
                    showNotification(`❌ Ошибка: ${message}`, "error");
                }
            } catch (error) {
                console.error("Ошибка при оформлении покупки:", error);
                showNotification("❌ Ошибка при оформлении покупки.", "error");
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