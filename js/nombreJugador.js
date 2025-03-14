const nombreInput = document.getElementById("nombreInput");
const guardarNombreBoton = document.getElementById("botonGuardar");

guardarNombreBoton.addEventListener("click", guardarNombre);
nombreInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        guardarNombre();
    }
});

function guardarNombre() {
    let nombre = nombreInput.value.trim();

    // Validar longitud del nombre
    if (nombre.length < 4 || nombre.length > 8) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid name',
            text: 'The name must be between 4 and 8 characters long.',
            confirmButtonColor: '#d33'
        });
        return;
    }

    // Validar caracteres permitidos (solo letras, números y guion bajo)
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(nombre)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid characters',
            text: 'The name can only contain letters, numbers and underscore (_).',
            confirmButtonColor: '#d33'
        });
        return;
    }
    let nombres = JSON.parse(localStorage.getItem("nombresJugadores")) || [];

    // Verificar si el nombre ya existe en el array (ignorando mayúsculas y minúsculas)
    if (nombres.some(n => n.toLowerCase() === nombre.toLowerCase())) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid name',
            text: 'This name is already in use, choose another one.',
            confirmButtonColor: '#f39c12'
        });
        return;
    }

    nombres.push(nombre);
    localStorage.setItem("nombresJugadores", JSON.stringify(nombres));

    window.location.href = "eligePersonaje.html";
}
