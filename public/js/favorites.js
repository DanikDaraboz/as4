document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/favorites", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const favoriteProducts = await response.json();

            // Обновляем UI (без localStorage)
            document.querySelectorAll(".favorites-icon").forEach(icon => {
                const productId = icon.getAttribute("data-id");
                if (favoriteProducts.includes(productId)) {
                    icon.classList.add("favorited");
                }
            });
        } else {
            showNotification("⚠ Ошибка загрузки избранного", "error");
        }
    } catch (error) {
        showNotification("⚠ Ошибка сети", "error");
    }

    document.querySelectorAll(".favorites-icon").forEach(icon => {
        icon.addEventListener("click", async () => {
            const productId = icon.getAttribute("data-id").trim();
            const isFavorited = icon.classList.contains("favorited");

            try {
                const response = await fetch(`/api/favorites/${productId}`, {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" }
                });
                console.log(await response.json());
                if (response.status === 401) {
                    showNotification("❌ Войдите в аккаунт, чтобы добавить в избранное!", "error");
                    return;
                }

                if (response.ok) {
                    icon.classList.toggle("favorited");
                    showNotification(isFavorited ? "❌ Товар удалён из избранного" : "⭐ Товар добавлен в избранное", "success");
                } else {
                    showNotification("⚠ Ошибка при обновлении избранного", "error");
                }
            } catch (error) {
                showNotification("⚠ Ошибка сети", "error");
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
