// Toggle the dropdown menu on and off
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');

    menuButton.addEventListener('click', () => {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'block';
        }
    });
});
