document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const size = e.target.getAttribute('data-size');

        try {
            const response = await fetch("/remove", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, size })
            });

            if (response.ok) {
                e.target.closest('.product-item').remove();
                showNotification("🗑️ Товар удалён из корзины", "error");
            } else {
                showNotification("⚠ Ошибка при удалении товара", "error");
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            showNotification("⚠ Ошибка сети", "error");
        }
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
