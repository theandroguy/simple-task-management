// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskDeadline = document.getElementById('taskDeadline');
    const taskStartTime = document.getElementById('taskStartTime');
    const taskEndTime = document.getElementById('taskEndTime');
    const taskPriority = document.getElementById('taskPriority');
    const taskCategory = document.getElementById('taskCategory');
    const taskLabels = document.getElementById('taskLabels');
    const recurringTask = document.getElementById('recurringTask');
    const recurrenceInterval = document.getElementById('recurrenceInterval');
    const recurringOptions = document.getElementById('recurringOptions');
    const filterCategory = document.getElementById('filterCategory');
    const sortTasks = document.getElementById('sortTasks');
    const taskList = document.getElementById('taskList');
    const completedTasksCount = document.getElementById('completedTasksCount');
    const averageCompletionTime = document.getElementById('averageCompletionTime');
    const workTimeSpent = document.getElementById('workTimeSpent');
    const personalTimeSpent = document.getElementById('personalTimeSpent');
  
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isEditing = false;
    let currentEditId = null;
  
    // Show/Hide Recurring Options
    recurringTask.addEventListener('change', () => {
      recurringOptions.classList.toggle('hidden', !recurringTask.checked);
    });
  
    // Add Task Function
    function addTask(title, deadline, startTime, endTime, priority, category, labels, recurring, recurrence) {
      const task = {
        id: Date.now(),
        title,
        deadline,
        startTime,
        endTime,
        priority,
        category,
        labels: labels.split(',').map(label => label.trim()),
        recurring,
        recurrence,
        status: 'Pending',
        completionTime: null,
        timeSpent: 0,
        subtasks: [],
      };
      tasks.push(task);
      saveTasksToLocalStorage();
      renderTasks();
      updateAnalytics();
    }
  
    // Save Tasks to Local Storage
    function saveTasksToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    // Render Tasks Function
    function renderTasks() {
      taskList.innerHTML = '';
      const filteredTasks = tasks.filter(task => {
        return !filterCategory.value || task.category === filterCategory.value;
      });
      const sortedTasks = sortTasks.value ? sortTasksBy(filteredTasks, sortTasks.value) : filteredTasks;
  
      sortedTasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
      });
    }
  
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.classList.add('p-4', 'border', 'rounded-lg', 'shadow-sm', 'draggable', 'bg-white');
        li.setAttribute('draggable', true);
        li.dataset.id = task.id;
      
        const completeButtonClass = task.status === 'Completed' 
          ? 'text-green-700' 
          : 'text-green-500 hover:text-green-700';
      
        li.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-lg font-semibold ${task.status === 'Completed' ? 'line-through' : ''}">${task.title}</h4>
              <p class="text-sm text-gray-600">
                <i class="far fa-calendar-alt"></i> ${task.deadline} 
                <i class="far fa-clock ml-2"></i> ${task.startTime} - ${task.endTime}
              </p>
              <p class="text-sm">
                <span class="font-semibold">Priority:</span> 
                <span class="px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}">${task.priority}</span>
              </p>
              <p class="text-sm"><span class="font-semibold">Category:</span> ${task.category}</p>
              <p class="text-sm"><span class="font-semibold">Labels:</span> ${task.labels.join(', ')}</p>
              <p class="text-sm"><span class="font-semibold">Recurring:</span> ${task.recurring ? task.recurrence : 'No'}</p>
              <p class="text-sm"><span class="font-semibold">Status:</span> ${task.status}</p>
            </div>
            <div class="flex flex-col space-y-2">
              <button class="editTask text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
              <button class="deleteTask text-red-500 hover:text-red-700"><i class="fas fa-trash-alt"></i></button>
              <button class="completeTask ${completeButtonClass}"><i class="fas fa-check"></i></button>
            </div>
          </div>
        `;
      
        addTaskEventListeners(li, task);
        return li;
      }
  
// Add Task Event Listeners
function addTaskEventListeners(li, task) {
    li.querySelector('.editTask').addEventListener('click', () => editTask(task));
    li.querySelector('.deleteTask').addEventListener('click', () => deleteTask(task.id));
    li.querySelector('.completeTask').addEventListener('click', () => completeTask(task.id));
  }
  
  // Complete Task
  function completeTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      const task = tasks[taskIndex];
      if (task.status !== 'Completed') {
        task.status = 'Completed';
        task.completionTime = new Date().toISOString();
      } else {
        task.status = 'Pending';
        task.completionTime = null;
      }
      saveTasksToLocalStorage();
      renderTasks();
      updateAnalytics();
    }
  }
    // Edit Task
    function editTask(task) {
      isEditing = true;
      currentEditId = task.id;
      taskTitle.value = task.title;
      taskDeadline.value = task.deadline;
      taskStartTime.value = task.startTime;
      taskEndTime.value = task.endTime;
      taskPriority.value = task.priority;
      taskCategory.value = task.category;
      taskLabels.value = task.labels.join(', ');
      recurringTask.checked = task.recurring;
      recurringOptions.classList.toggle('hidden', !task.recurring);
      recurrenceInterval.value = task.recurrence;
    }
  
    // Delete Task
    function deleteTask(taskId) {
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasksToLocalStorage();
      renderTasks();
      updateAnalytics();
    }
  
    // Complete Task
    function completeTask(taskId) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
        tasks[taskIndex].completionTime = new Date().toISOString();
        tasks[taskIndex].status = 'Completed';
        saveTasksToLocalStorage();
        renderTasks();
        updateAnalytics();
      }
    }
  
    // Sort Tasks
    function sortTasksBy(tasksToSort, criterion) {
      return tasksToSort.sort((a, b) => {
        if (criterion === 'deadline') {
          return new Date(a.deadline) - new Date(b.deadline);
        } else if (criterion === 'priority') {
          const priorityOrder = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (criterion === 'creation') {
          return a.id - b.id;
        }
        return 0;
      });
    }
  
// Update Analytics
function updateAnalytics() {
    const completedTasks = tasks.filter(task => task.status === 'Completed');
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0);
    const completedThisWeek = completedTasks.filter(task => new Date(task.completionTime) >= weekStart);

    // Update completed tasks count
    completedTasksCount.textContent = `Tasks Completed This Week: ${completedThisWeek.length}`;

    // Calculate average completion time
    const totalCompletionTime = completedTasks.reduce((total, task) => {
      const startTime = new Date(`${task.deadline}T${task.startTime}`);
      const endTime = new Date(task.completionTime);
      return total + (endTime - startTime);
    }, 0);
    const averageTime = completedTasks.length ? totalCompletionTime / completedTasks.length : 0;
    const averageHours = (averageTime / (1000 * 60 * 60)).toFixed(2);
    averageCompletionTime.textContent = `Average Completion Time: ${averageHours} hours`;

    // Calculate time spent on different categories
    const timeSpent = { Work: 0, Personal: 0 };
    completedTasks.forEach(task => {
      const startTime = new Date(`${task.deadline}T${task.startTime}`);
      const endTime = new Date(task.completionTime);
      const timeDiff = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
      if (task.category === 'Work') {
        timeSpent.Work += timeDiff;
      } else if (task.category === 'Personal') {
        timeSpent.Personal += timeDiff;
      }
    });

    workTimeSpent.textContent = `Time Spent on Work Tasks: ${timeSpent.Work.toFixed(2)} hours`;
    personalTimeSpent.textContent = `Time Spent on Personal Tasks: ${timeSpent.Personal.toFixed(2)} hours`;
  }

  // Get Priority Color
  function getPriorityColor(priority) {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  // Event Listeners
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitle.value.trim();
    const deadline = taskDeadline.value;
    const startTime = taskStartTime.value;
    const endTime = taskEndTime.value;
    const priority = taskPriority.value;
    const category = taskCategory.value;
    const labels = taskLabels.value;
    const recurring = recurringTask.checked;
    const recurrence = recurring ? recurrenceInterval.value : '';

    if (isEditing) {
      const taskIndex = tasks.findIndex(task => task.id === currentEditId);
      if (taskIndex > -1) {
        tasks[taskIndex] = { 
          ...tasks[taskIndex], 
          title, 
          deadline, 
          startTime, 
          endTime, 
          priority, 
          category, 
          labels: labels.split(',').map(label => label.trim()), 
          recurring, 
          recurrence 
        };
        isEditing = false;
        currentEditId = null;
      }
    } else {
      addTask(title, deadline, startTime, endTime, priority, category, labels, recurring, recurrence);
    }

    saveTasksToLocalStorage();
    renderTasks();
    taskForm.reset();
    recurringOptions.classList.add('hidden');
  });

  filterCategory.addEventListener('change', renderTasks);
  sortTasks.addEventListener('change', renderTasks);

  // Initial render
  renderTasks();
  updateAnalytics();
});