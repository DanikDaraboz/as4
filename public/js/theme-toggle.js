function toggleTheme() {
    const body = document.body;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    body.classList.toggle('dark-theme');

    // Сохраняем выбранную тему в localStorage
    if (body.classList.contains('dark-theme')) {
        sunIcon.style.display = 'none'; // Скрыть солнце
        moonIcon.style.display = 'block'; // Показать луну
        localStorage.setItem('theme', 'dark');
    } else {
        sunIcon.style.display = 'block'; // Показать солнце
        moonIcon.style.display = 'none'; // Скрыть луну
        localStorage.setItem('theme', 'light');
    }
}

// При загрузке страницы проверяем сохраненную тему
window.onload = () => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('sun-icon').style.display = 'none'; // Скрыть солнце
        document.getElementById('moon-icon').style.display = 'block'; // Показать луну
    } else {
        document.body.classList.remove('dark-theme');
        document.getElementById('sun-icon').style.display = 'block'; // Показать солнце
        document.getElementById('moon-icon').style.display = 'none'; // Скрыть луну
    }
};