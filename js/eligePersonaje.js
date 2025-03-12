let tienePersonajeSeleccionado = false;

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);      
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);

    if (event.target.id === "area-drop") {
        event.target.appendChild(draggedElement);
        tienePersonajeSeleccionado = true;
    } else if (event.target.id === "personajes") {
        event.target.appendChild(draggedElement);
        tienePersonajeSeleccionado = false;
    }
     else if (event.target.tagName === "IMG" && event.target.parentElement) {
        event.target.parentElement.appendChild(draggedElement);
        tienePersonajeSeleccionado = false;
    }
}

function allowDrop(event) {
    if (!tienePersonajeSeleccionado && event.target.id === 'area-drop' || event.target.id === 'personajes' || event.target.tagName === 'IMG' && event.target.parentElement.id === 'personajes') {
        event.preventDefault();
    }
}

function comenzar () {
    if (tienePersonajeSeleccionado) {
        window.location.href = "juegoNivel1.html"
    }
}

document.getElementById("personaje1").addEventListener("dragstart", drag);
document.getElementById("personaje2").addEventListener("dragstart",drag);
document.getElementById("personaje3").addEventListener("dragstart", drag);
document.getElementById("personajes").addEventListener("dragover", allowDrop);
document.getElementById("area-drop").addEventListener("dragover", allowDrop);
document.getElementById("personajes").addEventListener("drop", drop);
document.getElementById("area-drop").addEventListener("drop", drop);