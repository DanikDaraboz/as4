document.addEventListener("DOMContentLoaded", async () => {
    // Загружаем избранные товары из localStorage
    let localFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Обновляем UI на основе localStorage
    document.querySelectorAll(".favorites-icon").forEach(icon => {
        const productId = icon.getAttribute("data-id");
        if (localFavorites.includes(productId)) {
            icon.classList.add("favorited");
        }
    });

    // Загружаем избранные товары с сервера
    try {
        const response = await fetch("/api/favorites", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const favoriteProducts = await response.json();

            // Обновляем localStorage, если сервер вернул данные
            localFavorites = favoriteProducts;
            localStorage.setItem("favorites", JSON.stringify(localFavorites));

            // Обновляем UI
            document.querySelectorAll(".favorites-icon").forEach(icon => {
                const productId = icon.getAttribute("data-id");
                if (favoriteProducts.includes(productId)) {
                    icon.classList.add("favorited");
                }
            });
        } else {
            console.error("Ошибка при загрузке избранных товаров");
        }
    } catch (error) {
        console.error("Ошибка сети:", error);
    }

    // Обработчик клика по иконке избранного
    document.querySelectorAll(".favorites-icon").forEach(icon => {
        icon.addEventListener("click", async () => {
            const productId = icon.getAttribute("data-id");

            // Обновляем локально
            if (localFavorites.includes(productId)) {
                localFavorites = localFavorites.filter(id => id !== productId);
                icon.classList.remove("favorited");
            } else {
                localFavorites.push(productId);
                icon.classList.add("favorited");
            }

            // Сохраняем в localStorage
            localStorage.setItem("favorites", JSON.stringify(localFavorites));

            // Отправляем запрос на сервер для сохранения состояния
            try {
                const response = await fetch(`/api/favorites/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" }
                });

                if (response.status === 401) {
                    alert("❌ Войдите в аккаунт, чтобы добавить в избранное!");
                    return;
                }

                if (!response.ok) {
                    console.error("Ошибка при добавлении в избранное");
                }
            } catch (error) {
                console.error("Ошибка сети:", error);
            }
        });
    });
});
