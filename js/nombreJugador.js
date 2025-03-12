const nombreInput = document.getElementById("nombreInput");
const guardarNombreBoton = document.getElementById("botonGuardar")

guardarNombreBoton.addEventListener("click", () => this.guardarNombre());
nombreInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      guardarNombre();
    } else {
        ocultarError();
    }
  });

function guardarNombre () {
    let nombre = document.getElementById("nombreInput").value;

    // validar longitud del nombre
    if (nombre.length < 4 || nombre.length > 8) {
        mostrarError();
        return
    }

    let nombres = JSON.parse(localStorage.getItem("nombres")) || [];
    nombres.push(nombre);
    localStorage.setItem("nombresJugadores", JSON.stringify(nombres));
    window.location.href = "eligePersonaje.html"
}

function mostrarError () {
    const nombreInput = document.getElementById("nombreInput");
    const errorMensaje = document.getElementById("errorMensaje");
    nombreInput.classList.add("is-invalid");
    errorMensaje.classList.remove("d-none");
}

function ocultarError () {
    const nombreInput = document.getElementById("nombreInput");
    const errorMensaje = document.getElementById("errorMensaje");
    nombreInput.classList.remove("is-invalid");
    errorMensaje.classList.add("d-none");
}