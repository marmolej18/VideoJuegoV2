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
            title: 'Nombre inválido',
            text: 'El nombre debe tener entre 4 y 8 caracteres.',
            confirmButtonColor: '#d33'
        });
        return;
    }
    let nombres = JSON.parse(localStorage.getItem("nombresJugadores")) || [];
    nombres.push(nombre);
    localStorage.setItem("nombresJugadores", JSON.stringify(nombres));

    window.location.href = "eligePersonaje.html";
}
