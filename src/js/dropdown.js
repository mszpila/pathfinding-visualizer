export function toggleDropdown(element) {
    for (const dropdown of document.getElementsByClassName('dropdownMenu')) {
        if (dropdown.id !== element) {
            dropdown.classList.remove('show');
        }
    }
    document.getElementById(element).classList.toggle('show');
}

window.toggleDropdown = toggleDropdown;

window.onclick = function(event) {
    if (!event.target.matches('.dropOk')) {
        for (const dropdown of document.getElementsByClassName('dropdownMenu')) {
            dropdown.classList.remove('show');
        }
    }
};
