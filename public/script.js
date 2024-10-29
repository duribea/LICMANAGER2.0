document.addEventListener('DOMContentLoaded', function() {
    const clienteSelect = document.getElementById('clienteSelect');
    const clienteGestion = document.getElementById('clienteGestion');
    const clienteEstadoMensual = document.getElementById('clienteEstadoMensual');
    const añoEstadoMensual = document.getElementById('añoEstadoMensual');
    const mesEstadoMensual = document.getElementById('mesEstadoMensual');
    const sistemaAlimentacion = document.getElementById('sistemaAlimentacion');
    const mensaje = document.getElementById('mensaje');

    // Cargar clientes
    function cargarClientes() {
        fetch('/api/clientes')
            .then(response => response.json())
            .then(clientes => {
                [clienteSelect, clienteGestion, clienteEstadoMensual].forEach(select => {
                    select.innerHTML = '<option value="">Seleccione un cliente</option>';
                    // Añadir opción "Todos" solo para gestión y estado mensual
                    if (select !== clienteSelect) {
                        const optionTodos = document.createElement('option');
                        optionTodos.value = 'todos';
                        optionTodos.textContent = 'Todos';
                        select.appendChild(optionTodos);
                    }
                    clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.ClienteID;
                        option.textContent = cliente.NombreCliente;
                        select.appendChild(option);
                    });
                });
            })
            .catch(error => {
                console.error('Error al cargar clientes:', error);
                mostrarMensaje('Error al cargar la lista de clientes');
            });
    }

    // Cargar años
    function cargarAños() {
        const currentYear = new Date().getFullYear();
        añoEstadoMensual.innerHTML = '<option value="">Seleccione un año</option>';
        for (let i = 0; i < 10; i++) {
            const year = currentYear + i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            añoEstadoMensual.appendChild(option);
        }
    }

    // Cargar sistemas de alimentación
    function cargarSistemasAlimentacion() {
        fetch('/api/sistemas-alimentacion')
            .then(response => response.json())
            .then(sistemas => {
                sistemaAlimentacion.innerHTML = '<option value="">Seleccione un sistema</option>';
                sistemas.forEach(sistema => {
                    const option = document.createElement('option');
                    option.value = sistema.SistemaID;
                    option.textContent = sistema.NombreSistema;
                    sistemaAlimentacion.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar sistemas de alimentación:', error);
                mostrarMensaje('Error al cargar la lista de sistemas de alimentación');
            });
    }

    // Añadir nuevo cliente
    document.getElementById('añadirCliente').addEventListener('click', function() {
        const nuevoCliente = {
            NombreCliente: document.getElementById('nuevoClienteNombre').value,
            FechaExpiracionLicencia: document.getElementById('nuevaFechaExpiracion').value,
            VersionAnalytics: document.getElementById('nuevaVersionAnalytics').value,
            VersionConnector: document.getElementById('nuevaVersionConnector').value,
            VersionAdapter: document.getElementById('nuevaVersionAdapter').value,
            FechaActualizacion: document.getElementById('nuevaFechaActualizacion').value
        };

        if (nuevoCliente.NombreCliente) {
            fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarMensaje(data.error);
                } else {
                    mostrarMensaje(`Cliente ${nuevoCliente.NombreCliente} añadido con éxito`);
                    cargarClientes();
                    document.getElementById('clienteForm').reset();
                }
            })
            .catch(error => {
                mostrarMensaje(`Cliente ${nuevoCliente.NombreCliente} añadido con éxito`);
                cargarClientes();
                document.getElementById('clienteForm').reset();
            });
        }
    });

    // Gestión de clientes
    document.getElementById('cargarClientes').addEventListener('click', function() {
        fetch('/api/clientes')
            .then(response => response.json())
            .then(clientes => {
                const tabla = document.getElementById('clientesTabla');
                const tbody = tabla.querySelector('tbody');
                tbody.innerHTML = '';
                clientes.forEach(cliente => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${cliente.NombreCliente}</td>
                        <td>${cliente.FechaExpiracionLicencia || ''}</td>
                        <td>${cliente.VersionAnalytics || ''}</td>
                        <td>${cliente.VersionConnector || ''}</td>
                        <td>${cliente.VersionAdapter || ''}</td>
                        <td>${cliente.FechaActualizacion || ''}</td>
                        <td>
                            <button class="editar-cliente" data-id="${cliente.ClienteID}">Editar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                tabla.style.display = 'table';
            })
            .catch(error => {
                console.error('Error al cargar clientes:', error);
                mostrarMensaje('Error al cargar los clientes');
            });
    });

    // Edición de clientes
    document.getElementById('clientesTabla').addEventListener('click', function(e) {
        if (e.target.classList.contains('editar-cliente')) {
            const clienteId = e.target.dataset.id;
            const row = e.target.closest('tr');
            const cells = row.cells;
            
            row.dataset.originalFechaExpiracion = cells[1].textContent.trim();
            row.dataset.originalFechaActualizacion = cells[5].textContent.trim();

            cells[0].innerHTML = `<input type="text" value="${cells[0].textContent}">`;
            cells[1].innerHTML = `<input type="date" value="${formatDateForInput(cells[1].textContent)}">`;
            cells[2].innerHTML = `<input type="text" value="${cells[2].textContent}">`;
            cells[3].innerHTML = `<input type="text" value="${cells[3].textContent}">`;
            cells[4].innerHTML = `<input type="text" value="${cells[4].textContent}">`;
            cells[5].innerHTML = `<input type="date" value="${formatDateForInput(cells[5].textContent)}">`;
            
            e.target.textContent = 'Guardar';
            e.target.classList.remove('editar-cliente');
            e.target.classList.add('guardar-cliente');
        } else if (e.target.classList.contains('guardar-cliente')) {
            const clienteId = e.target.dataset.id;
            const row = e.target.closest('tr');
            const cells = row.cells;

            const fechaExpInput = cells[1].querySelector('input');
            const fechaActInput = cells[5].querySelector('input');
            
            const clienteActualizado = {
                NombreCliente: cells[0].querySelector('input').value,
                FechaExpiracionLicencia: fechaExpInput.value || null,
                VersionAnalytics: cells[2].querySelector('input').value,
                VersionConnector: cells[3].querySelector('input').value,
                VersionAdapter: cells[4].querySelector('input').value,
                FechaActualizacion: fechaActInput.value || null
            };

            fetch(`/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteActualizado)
            })
            .then(response => response.json())
            .then(data => {
                mostrarMensaje('Cliente actualizado con éxito');
                cells[0].textContent = clienteActualizado.NombreCliente;
                cells[1].textContent = fechaExpInput.value ? 
                    formatDate(fechaExpInput.value) : 
                    row.dataset.originalFechaExpiracion;
                cells[2].textContent = clienteActualizado.VersionAnalytics;
                cells[3].textContent = clienteActualizado.VersionConnector;
                cells[4].textContent = clienteActualizado.VersionAdapter;
                cells[5].textContent = fechaActInput.value ? 
                    formatDate(fechaActInput.value) : 
                    row.dataset.originalFechaActualizacion;

                e.target.textContent = 'Editar';
                e.target.classList.remove('guardar-cliente');
                e.target.classList.add('editar-cliente');
            })
            .catch(error => {
                console.error('Error al actualizar cliente:', error);
                mostrarMensaje('Error al actualizar el cliente');
            });
        }
    });

    // Añadir nuevo centro
    document.getElementById('añadirCentro').addEventListener('click', function() {
        const centro = {
            ClienteID: clienteSelect.value,
            NombreCentro: document.getElementById('nombreCentro').value,
            NombrePonton: document.getElementById('nombrePonton').value,
            SistemaID: sistemaAlimentacion.value,
            VersionSistema: document.getElementById('versionSistema').value,
            FechaInstalacionACA: document.getElementById('fechaInstalacionACA').value,
            FechaTermino: document.getElementById('fechaTermino').value || null
        };

        fetch('/api/centros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(centro)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarMensaje(data.error);
            } else {
                mostrarMensaje(`Centro ${centro.NombreCentro} añadido con éxito`);
                document.getElementById('centroForm').reset();
            }
        })
        .catch(error => {
            mostrarMensaje(`Centro ${centro.NombreCentro} añadido con éxito`);
            document.getElementById('centroForm').reset();
        });
    });

    // Cargar centros para gestión
    document.getElementById('cargarCentros').addEventListener('click', function() {
        const clienteId = clienteGestion.value;
        if (clienteId) {
            cargarCentros(clienteId);
        }
    });

    function cargarCentros(clienteId) {
        fetch(`/api/centros/${clienteId}`)
            .then(response => response.json())
            .then(centros => {
                const tabla = document.getElementById('centrosTabla');
                const tbody = tabla.querySelector('tbody');
                tbody.innerHTML = '';
                centros.forEach(centro => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${centro.NombreCentro}</td>
                        <td>${centro.NombrePonton}</td>
                        <td>${centro.NombreSistema}</td>
                        <td>${centro.VersionSistema}</td>
                        <td>${formatDate(centro.FechaInstalacionACA)}</td>
                        <td>${formatDate(centro.FechaTermino)}</td>
                        <td>
                            <button class="editar-centro" data-id="${centro.CentroID}">Editar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                tabla.style.display = 'table';
            })
            .catch(error => {
                console.error('Error al cargar centros:', error);
                mostrarMensaje('Error al cargar los centros');
            });
    }

    // Cargar estado mensual
    document.getElementById('cargarEstadoMensual').addEventListener('click', function() {
        const clienteId = clienteEstadoMensual.value;
        const año = añoEstadoMensual.value;
        const mes = mesEstadoMensual.value;
        if (clienteId && año && mes) {
            fetch(`/api/estado-mensual?clienteId=${clienteId}&año=${año}&mes=${mes}`)
                .then(response => response.json())
                .then(estados => {
                    const tabla = document.getElementById('estadoMensualTabla');
                    const tbody = tabla.querySelector('tbody');
                    tbody.innerHTML = '';
                    estados.forEach(estado => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${estado.NombreCentro}</td>
                            <td>${estado.NombrePonton}</td>
                            <td>
                                <select class="sistema-select" data-centro-id="${estado.CentroID}">
                                    ${sistemaAlimentacion.innerHTML}
                                </select>
                            </td>
                            <td>
                                <input type="text" class="version-sistema" value="${estado.VersionSistemaMensual || estado.VersionSistema || ''}" placeholder="Versión del sistema">
                            </td>
                            <td>${formatDateEstadoMensual(estado.FechaInstalacionACA)}</td>
                            <td>${formatDateEstadoMensual(estado.FechaTermino)}</td>
                            <td>
                                <select class="estado-select" data-centro-id="${estado.CentroID}">
                                    <option value="1" ${estado.EstadoID === 1 ? 'selected' : ''}>Integrando</option>
                                    <option value="2" ${estado.EstadoID === 2 ? 'selected' : ''}>No Integrando</option>
                                    <option value="3" ${estado.EstadoID === 3 ? 'selected' : ''}>Centro Vacío</option>
                                </select>
                            </td>
                            <td>
                                <input type="checkbox" class="analytics-check" data-centro-id="${estado.CentroID}" ${estado.CentroConAnalytics ? 'checked' : ''}>
                            </td>
                            <td>
                                <textarea class="comentarios" data-centro-id="${estado.CentroID}">${estado.Comentarios || ''}</textarea>
                            </td>
                        `;
                        tbody.appendChild(tr);
                        
                        // Establecer el sistema de alimentación seleccionado
                        const sistemaSelect = tr.querySelector('.sistema-select');
                        sistemaSelect.value = estado.SistemaIDMensual || estado.SistemaID;
                    });
                    tabla.style.display = 'table';
                    document.getElementById('guardarEstadoMensual').style.display = 'block';
                })
                .catch(error => {
                    console.error('Error al cargar estado mensual:', error);
                    mostrarMensaje('Error al cargar el estado mensual');
                });
        }
    });

    // Guardar estado mensual
    document.getElementById('guardarEstadoMensual').addEventListener('click', function() {
        const clienteId = clienteEstadoMensual.value;
        const año = añoEstadoMensual.value;
        const mes = mesEstadoMensual.value;
        const estados = [];

        document.querySelectorAll('#estadoMensualTabla tbody tr').forEach(tr => {
            const centroId = tr.querySelector('.estado-select').dataset.centroId;
            estados.push({
                CentroID: centroId,
                Año: año,
                Mes: mes,
                EstadoID: tr.querySelector('.estado-select').value,
                CentroConAnalytics: tr.querySelector('.analytics-check').checked,
                Comentarios: tr.querySelector('.comentarios').value,
                SistemaID: tr.querySelector('.sistema-select').value,
                VersionSistema: tr.querySelector('.version-sistema').value
            });
        });

        fetch('/api/estado-mensual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estados)
        })
        .then(response => response.json())
        .then(data => {
            mostrarMensaje('Estados mensuales actualizados con éxito');
        })
        .catch(error => {
            console.error('Error al guardar estados mensuales:', error);
            mostrarMensaje('Error al guardar los estados mensuales');
        });
    });

    // Función para formatear fechas
    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    // Función para formatear fechas para input
    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
    }

    // Función específica para formatear fechas en estado mensual
    function formatDateEstadoMensual(dateString) {
        if (!dateString) return '';
        if (dateString.includes('T')) {
            dateString = dateString.split('T')[0];
        }
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    // Inicialización
    cargarClientes();
    cargarAños();
    cargarSistemasAlimentacion();
});