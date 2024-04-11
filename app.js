// Este código se ejecuta después de que se ha cargado el contenido HTML de la página
document.addEventListener('DOMContentLoaded', () => {
    // Se seleccionan elementos del DOM necesarios
    const form = document.getElementById('todo-form'); // Formulario de tareas
    const input = document.getElementById('todo-input'); // Campo de entrada de tareas
    const pendingTasksList = document.getElementById('pending-tasks'); // Lista de tareas pendientes
    const completedTasksList = document.getElementById('completed-tasks'); // Lista de tareas completadas
    const allTasksList = document.getElementById('all-tasks'); // Lista de todas las tareas
    const allTasksButton = document.getElementById('all-tasks-btn'); // Botón para mostrar todas las tareas
    const completedTasksButton = document.getElementById('completed-tasks-btn'); // Botón para mostrar tareas completadas
    const pendingTasksButton = document.getElementById('pending-tasks-btn'); // Botón para mostrar tareas pendientes

    // Se seleccionan los campos de entrada para fechas y horas
    const startDateInput = document.getElementById('start-date');
    const startTimeInput = document.getElementById('start-time');
    const endDateInput = document.getElementById('end-date');
    const endTimeInput = document.getElementById('end-time');

    // Se obtienen las tareas almacenadas en el almacenamiento local o se inicializa un array vacío
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Se recorren las tareas existentes para mostrarlas en las listas correspondientes
    tasks.forEach(task => {
        const li = createTaskElement(task); // Se crea un elemento de lista para la tarea
        if (task.completed) {
            // Si la tarea está completada, se añade a la lista de tareas completadas
            const undoButton = createActionButton('Deshacer', 'undo'); // Botón para deshacer la tarea completada
            undoButton.addEventListener('click', () => {
                undoTask(task); // Función para deshacer la tarea completada
                renderTasks(); // Se vuelven a renderizar las tareas
            });
            li.querySelector('.actions').appendChild(undoButton); // Se añade el botón a la tarea
            completedTasksList.appendChild(li); // Se añade la tarea a la lista de tareas completadas
        } else {
            // Si la tarea está pendiente, se añade a la lista de tareas pendientes
            const completeButton = createActionButton('Completar', 'completePending'); // Botón para completar la tarea
            completeButton.addEventListener('click', () => {
                completeTask(li, task); // Función para completar la tarea
            });
            li.querySelector('.actions').appendChild(completeButton); // Se añade el botón a la tarea
            const editButton = createActionButton('Editar nombre', 'edit'); // Botón para editar la tarea
            editButton.addEventListener('click', () => editTask(li, task)); // Función para editar la tarea
            const deleteButton = createActionButton('Eliminar', 'delete'); // Botón para eliminar la tarea
            deleteButton.addEventListener('click', () => deleteTask(li, task)); // Función para eliminar la tarea
            li.querySelector('.actions').appendChild(editButton); // Se añade el botón a la tarea
            li.querySelector('.actions').appendChild(deleteButton); // Se añade el botón a la tarea
            pendingTasksList.appendChild(li); // Se añade la tarea a la lista de tareas pendientes
        }
    });

    // Evento para mostrar todas las tareas
    document.getElementById('active-tasks-btn').addEventListener('click', showActiveTasks);

    // Función para mostrar solo las tareas activas (pendientes)
    function showActiveTasks() {
        allTasksList.innerHTML = ''; // Se vacía la lista de todas las tareas

        // Se filtran las tareas activas (pendientes)
        const activeTasks = tasks.filter(task => !task.completed); 

        // Se crea un elemento de lista para cada tarea activa y se añade a la lista de todas las tareas
        activeTasks.forEach(task => {
            const li = createTaskElement(task); 
            allTasksList.appendChild(li); 
        });
    }

    // Evento para agregar una nueva tarea al formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Se previene la acción por defecto del formulario

        // Se obtienen los valores de la tarea y las fechas/horas
        const taskText = input.value.trim();
        const startDate = startDateInput.value;
        const startTime = startTimeInput.value;
        const endDate = endDateInput.value;
        const endTime = endTimeInput.value;
        
        // Se verifica que los campos no estén vacíos
        if (taskText !== '' && startDate !== '' && startTime !== '' && endDate !== '' && endTime !== '') {
            // Se agrega la tarea a la lista de tareas y se limpian los campos del formulario
            addTask(taskText, startDate, startTime, endDate, endTime);
            input.value = '';
            startDateInput.value = '';
            startTimeInput.value = '';
            endDateInput.value = '';
            endTimeInput.value = '';
        }
    });

    // Eventos para mostrar diferentes vistas de las tareas
    allTasksButton.addEventListener('click', () => showAllTasks()); // Todas las tareas
    completedTasksButton.addEventListener('click', () => showCompletedTasks()); // Tareas completadas
    pendingTasksButton.addEventListener('click', () => showPendingTasks()); // Tareas pendientes

    // Función para agregar una nueva tarea
    function addTask(taskText, startDate, startTime, endDate, endTime) {
        // Se crea un objeto tarea con la información proporcionada
        const task = {
            text: taskText,
            startDate: startDate,
            startTime: startTime,
            endDate: endDate,
            endTime: endTime,
            completed: false,
            createdAt: new Date()
        };

        // Se añade la tarea al array de tareas y se guarda en el almacenamiento local
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Se crea un elemento de lista para la tarea y se añade a la lista de tareas pendientes
        const li = createTaskElement(task);
        const completeButton = createActionButton('Completar', 'completePending');
        completeButton.addEventListener('click', () => completeTask(li, task));
        li.querySelector('.actions').appendChild(completeButton);
        const editButton = createActionButton('Editar nombre', 'edit');
        editButton.addEventListener('click', () => editTask(li, task));
        const editDateTimeButton = createActionButton('Editar Fechas y Horas 1', 'editDateTime', task);
        editDateTimeButton.addEventListener('click', () => editDateTime(li, task));

        const deleteButton = createActionButton('Eliminar', 'delete');
        deleteButton.addEventListener('click', () => deleteTask(li, task));
        li.querySelector('.actions').appendChild(editButton);
        li.querySelector('.actions').appendChild(deleteButton);
        li.querySelector('.actions').appendChild(editDateTimeButton);
        pendingTasksList.appendChild(li);
    }

    // Función para crear un elemento de lista para una tarea
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.textContent = `${task.text} - Inicio: ${task.startDate} ${task.startTime}, Fin: ${task.endDate} ${task.endTime}`;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        li.appendChild(actionsDiv);
        return li;
    }

    // Función para crear un botón de acción para una tarea
    function createActionButton(text, action, task) {
        const button = document.createElement('button');
        button.textContent = text;
        button.dataset.action = action;
        button.dataset.taskId = tasks.indexOf(task);
        return button;
    }

    // Función para completar una tarea
    function completeTask(taskElement, task) {
        task.completed = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Función para deshacer una tarea completada
    function undoTask(task) {
        task.completed = false;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Función para renderizar las tareas en las listas correspondientes
    function renderTasks() {
        pendingTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        tasks.forEach(task => {
            const li = createTaskElement(task);
            if (task.completed) {
                const undoButton = createActionButton('Deshacer', 'undo');
                undoButton.addEventListener('click', () => {
                    undoTask(task);
                });
                li.querySelector('.actions').appendChild(undoButton);
                completedTasksList.appendChild(li);
            } else {
                const completeButton = createActionButton('Completar', 'completePending');
                completeButton.addEventListener('click', () => {
                    completeTask(li, task);
                });
                li.querySelector('.actions').appendChild(completeButton);

                const editButton = createActionButton('Editar nombre', 'edit');
                editButton.addEventListener('click', () => editTask(li, task));

                const editDateTimeButton = createActionButton('Editar Fechas y Horas 3', 'editDateTime', task);
                editDateTimeButton.addEventListener('click', () => editDateTime(li, task));

                const deleteButton = createActionButton('Eliminar', 'delete');

                deleteButton.addEventListener('click', () => deleteTask(li, task));
                li.querySelector('.actions').appendChild(editButton);
                li.querySelector('.actions').appendChild(deleteButton);
                pendingTasksList.appendChild(li);


            }
        });
    }

    // Función para mostrar todas las tareas
    function showAllTasks() {
        allTasksList.innerHTML = '';
        tasks.forEach(task => {
            const li = createTaskElement(task);
            allTasksList.appendChild(li);
        });
    }

    // Función para mostrar solo las tareas completadas
    function showCompletedTasks() {
        allTasksList.innerHTML = '';
        tasks.filter(task => task.completed).forEach(task => {
            const li = createTaskElement(task);
            allTasksList.appendChild(li);
        });
    }

    // Función para mostrar solo las tareas pendientes
    function showPendingTasks() {
        allTasksList.innerHTML = '';
        tasks.filter(task => !task.completed).forEach(task => {
            const li = createTaskElement(task);
            allTasksList.appendChild(li);
        });
    }

    // Función para editar una tarea
    function editTask(taskElement, task) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.addEventListener('click', () => saveEditedTask(taskElement, task, input.value));

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar';
        cancelButton.addEventListener('click', () => cancelEdit(taskElement, task));

        const actionsDiv = taskElement.querySelector('.actions');
        actionsDiv.replaceWith(input, saveButton, cancelButton);
    }

    // Función para guardar los cambios realizados en una tarea editada
    function saveEditedTask(taskElement, task, newText) {
        task.text = newText.trim();
        taskElement.textContent = task.text;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const editButton = createActionButton('Editar nombre', 'edit');
        const deleteButton = createActionButton('Eliminar', 'delete');
        const completeButton = createActionButton('Completar', 'complete');
        const editDateTimeButton = createActionButton('Editar Fechas y Horas 4', 'editDateTime', task);

        editButton.addEventListener('click', () => editTask(taskElement, task));
        deleteButton.addEventListener('click', () => deleteTask(taskElement, task));
        completeButton.addEventListener('click', () => completeTask(taskElement, task));
        editDateTimeButton.addEventListener('click', () => editDateTime(task));

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        actionsDiv.appendChild(completeButton);
        actionsDiv.appendChild(editDateTimeButton);

        taskElement.appendChild(actionsDiv);

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Función para editar fechas y horas de una tarea
    function editDateTime(task) {
        const newStartDate = prompt('Ingrese la nueva fecha de inicio (YYYY/MM/DD):', task.startDate);
        const newStartTime = prompt('Ingrese la nueva hora de inicio (HH:mm):', task.startTime);
        const newEndDate = prompt('Ingrese la nueva fecha de fin (YYYY/MM/DD):', task.endDate);
        const newEndTime = prompt('Ingrese la nueva hora de fin (HH:mm):', task.endTime);

        // Se actualizan las fechas/horas de la tarea
        if (newStartDate && newStartTime && newEndDate && newEndTime) {
            task.startDate = newStartDate;
            task.startTime = newStartTime;
            task.endDate = newEndDate;
            task.endTime = newEndTime;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks(); // Se vuelven a renderizar las tareas para reflejar los cambios
        }
    }

    // Función para eliminar una tarea
    function deleteTask(taskElement, task) {
        const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta tarea?');
        if (confirmDelete) {
            const index = tasks.findIndex(t => t === task);
            if (index !== -1) {
                tasks.splice(index, 1); // Se elimina la tarea del array
                localStorage.setItem('tasks', JSON.stringify(tasks)); // Se actualiza el almacenamiento local
                taskElement.remove(); // Se elimina la tarea del DOM
            }
        }
    }
});
