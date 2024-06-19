
document.addEventListener('DOMContentLoaded', function() {
    const agregarForm = document.querySelector("#agregar-form");
    const agregarInput = document.querySelector("#agregar-input");
    const agregar = document.querySelector("#agregar");
    const chooseButton = document.getElementById('choose-button');
    const datetimeInput = document.querySelector("#datetime");
    const dateTimeContainer = document.querySelector("#date-time-container");
    const datosReservaDiv = document.querySelector("#datos-reserva");
    const confirmarReservaForm = document.querySelector("#confirmar-reserva-form");

    let selectedDateTime = {
        dateTime: null
    };

    let reservasOcupadas = [];
    let divCantidadElegida;

    function agregarPersonas(e) {
        e.preventDefault();
        const inputValue = parseInt(agregarInput.value, 10);
        agregar.innerHTML = "";

        divCantidadElegida = document.createElement("div");
        divCantidadElegida.className = "cantidadElegida";

        if (inputValue >= 1 && inputValue <= 8) {
            localStorage.setItem("Cantidad de personas", inputValue);
            divCantidadElegida.innerText = " ✅ Hay mesas disponibles, elija una fecha";
            divCantidadElegida.classList.add("visible");
            datetimeInput.disabled = false; 
            chooseButton.disabled = false; 
        } else {
            divCantidadElegida.innerText = " ❌ Elija una opción válida";
            divCantidadElegida.classList.add("visible");
            datetimeInput.disabled = true; 
            chooseButton.disabled = true; 
        }

        agregar.append(divCantidadElegida);
        agregarInput.focus();
        agregarForm.reset();
    }

    function convertirFechas(fechaStr) {
        if (!fechaStr) return null;
        return new Date(fechaStr.replace(' ', 'T'));
    }

    function cargarReservas() {
        fetch('reservas.json')
            .then(response => response.json())
            .then(data => {
                reservasOcupadas = data.map(reserva => convertirFechas(reserva.fechaHora));

                const reservasLocalStorage = JSON.parse(localStorage.getItem("Reservas")) || [];
                const reservasConvertidas = reservasLocalStorage.map(reserva => convertirFechas(reserva.fechaHora));
                reservasOcupadas = reservasOcupadas.concat(reservasConvertidas);

                // Inicializar el calendario de la liobreria Flatpickr
                const fp = flatpickr("#datetime", {
                    enableTime: true,
                    dateFormat: "Y-m-d H:i",
                    time_24hr: true,
                    defaultHour: 17,
                    minTime: "17:00",
                    maxTime: "23:30",
                    minuteIncrement: 15,
                    minDate: "today",
                    locale: {
                        firstDayOfWeek: 1 
                    },
                    onChange: function(selectedDates, dateStr) {
                        selectedDateTime.dateTime = dateStr;
                    }
                });
 
                datetimeInput.disabled = true;
                chooseButton.disabled = true;
            });
    }

   
    cargarReservas();
 
    function mostrarMensajeConfirmacion() {
        let mensajeExistente = document.querySelector(".fechaElegida");
        if (mensajeExistente) {
            mensajeExistente.remove();
        }

        let fechaSeleccionada = localStorage.getItem("Fecha seleccionada");

        if (fechaSeleccionada) {
            let divFechaElegida = document.createElement("div");
            divFechaElegida.className = "fechaElegida";
            divFechaElegida.innerText = ` ✅ Fecha y hora seleccionada: ${fechaSeleccionada}`;
            divFechaElegida.classList.add("visible");
            agregar.append(divFechaElegida);
        }
    }

    agregarForm.addEventListener("submit", agregarPersonas);

    chooseButton.addEventListener("click", function() {
        const fechaSeleccionada = selectedDateTime.dateTime;
        if (reservasOcupadas.some(date => date.getTime() === convertirFechas(fechaSeleccionada).getTime())) {
            Swal.fire({
                icon: "error",
                title: "Hora ocupada",
                text: "La hora seleccionada ya está ocupada. Por favor, elegí otra."
            });
            return;
        }

        localStorage.setItem("Fecha seleccionada", fechaSeleccionada);
        dateTimeContainer.style.display = 'none';

        mostrarMensajeConfirmacion();
       
        const inputs = datosReservaDiv.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);
        const submitButton = datosReservaDiv.querySelector('button');
        submitButton.disabled = false;
        datosReservaDiv.classList.remove('hidden');
    });

   
    confirmarReservaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.querySelector("#nombre").value;
        const apellido = document.querySelector("#apellido").value;
        const celular = document.querySelector("#celular").value;
    
        const cantidadPersonas = localStorage.getItem("Cantidad de personas");
        const fechaSeleccionada = localStorage.getItem("Fecha seleccionada");

        const reserva = {
            nombre: nombre,
            apellido: apellido,
            celular: celular,
            cantidadPersonas: cantidadPersonas,
            fechaHora: fechaSeleccionada
        };

        const reservasLocalStorage = JSON.parse(localStorage.getItem("Reservas")) || [];
        reservasLocalStorage.push(reserva);
        localStorage.setItem("Reservas", JSON.stringify(reservasLocalStorage));

        reservasOcupadas.push(convertirFechas(fechaSeleccionada));

        // Mensaje de confirmación con libreria Sweet Alert
        Swal.fire({
            icon: "success",
            title: "Reserva confirmada",
            text: `${nombre} ${apellido}, tu reserva para: ${cantidadPersonas} personas, se registró correctamente.
                     Te esperamos en la fecha que seleccionaste: ${fechaSeleccionada} hs. Gracias por elegirnos!
                     Ante cualquier eventualidad nos comunicaremos al teléfono: ${celular}`,
            width: 600,
            padding: "3em",
            color: "#700717",
            background: "#fff",
            backdrop: `
                rgba(0,0,123,0.4)
                left top
                no-repeat
            `
        }).then(() => {
            window.location.reload();
        });

        agregarForm.reset();
        confirmarReservaForm.reset();
    });
});
