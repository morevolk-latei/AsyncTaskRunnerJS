const TaskRunner = (function () {
  /* private member function */

  function canTaskExecute() {
    return this.runningTasks < this.concurrency && this.taskQueue.length > 0;
  }

  function updateRunningTasksCount(tasksCount) {
    getNode('#runningTasksCount').textContent = tasksCount;
  }

  function insertTaskIntoQueueUI(task) {
    getNode('#taskQueue').appendChild(
      createNode('div', { class: 'task flex justify-center align-center', content: task.id })
    )
  }

  function removeTaskFromQueueUI(task) {
    getNode(`#taskQueue #T${task.id}`).classList.add('remove');

    setTimeout((task) => {
      getNode(`#taskQueue #T${task.id}`).remove();
    }, 2000, task)
  }

  function updateTotalTasksInQueueCount(tasksCount) {
    getNode('#totalTasks').textContent = tasksCount;
  }

  function insertTaskIntoCallStackUI(task) {
    getNode('#callStack').appendChild(
      createNode('div', { class: 'task flex justify-center align-center insert', content: task.id })
    )
  }

  function removeTaskFromCallStackUI(task) {
    getNode(`#callStack #T${task.id}`).classList.remove('insert');
    getNode(`#callStack #T${task.id}`).classList.add('remove');

    setTimeout((task) => {
      getNode(`#callStack #T${task.id}`).remove();
    }, 2000, task)
  }

  /* private member function ends */

  function TaskRunner(concurrency = 3, runnerCycle = 0.5) {
    this.taskQueue = [];
    this.concurrency = concurrency;
    this.runningTasks = 0;
    this.runnerCycle = runnerCycle;
    this.startTaskRunner();
  }

  TaskRunner.prototype.push = function (task) {
    this.taskQueue.push(task);
    this.updateUI('taskQueue', { data: task, insert: true });
    this.updateUI('totalTasks', { data: this.taskQueue.length });
  };

  TaskRunner.prototype.setRunnerActive = function () {
    this.taskRunnerActive = true;

    getNode('#runnerActiveChip').classList.add('active');
    getNode('#runnerStoppedChip').classList.remove('active');
  }

  TaskRunner.prototype.updateUI = function (updateElement, nodeData) {
    switch (updateElement) {
      case 'runningTasksCount': updateRunningTasksCount(this.runningTasks); break;
      case 'taskQueue':
        nodeData.insert && insertTaskIntoQueueUI(nodeData.data);
        nodeData.remove && removeTaskFromQueueUI(nodeData.data);
        break;
      case 'totalTasks': updateTotalTasksInQueueCount(nodeData.data); break;
      case 'callStack':
        nodeData.insert && insertTaskIntoCallStackUI(nodeData.data);
        nodeData.remove && removeTaskFromCallStackUI(nodeData.data);
        break;
    }
  }

  TaskRunner.prototype.constructor = function () {
    this.setRunnerActive();

    function asyncTaskRunner() {
      if (this.runningTasks < this.concurrency && this.taskQueue.length > 0) {
        // threads are available to execute the task
        const taskToExecute = this.taskQueue.shift();
        this.updateUI('taskQueue', { data: taskToExecute, remove: true });
        this.updateUI('totalTasks', { data: this.taskQueue.length });

        this.runningTasks++;

        this.updateUI('runningTasksCount');

        console.log(
          `Lock ${this.runningTasks} acquired by task - `,
          taskToExecute.displayName || taskToExecute.name
        );
        taskToExecute.timer &&
          console.log(
            taskToExecute.displayName || taskToExecute.name,
            "Timer = ",
            taskToExecute.timer
          );

        this.updateUI('callStack', { data: taskToExecute, insert: true });
        taskToExecute().finally(() => {
          const lockId = this.runningTasks;
          this.runningTasks--;
          this.updateUI('runningTasksCount');
          this.updateUI('callStack', { data: taskToExecute, remove: true });

          console.log(
            `Lock ${lockId} released by task - `,
            taskToExecute.displayName || taskToExecute.name
          );
        });
      } else {
        this.runningTasks < this.concurrency
          ? console.log("Task queue is empty.")
          : console.log("All threads are busy, waiting to acquire the lock");
      }
    }

    this.runnerInstanceId = setInterval(
      asyncTaskRunner.bind(this),
      this.runnerCycle * 1000
    );
  };

  TaskRunner.prototype.stopTaskRunner = function () {
    this.taskRunnerActive = false;
    clearInterval(this.runnerInstanceId);
    getNode('#runnerActiveChip').classList.remove('active');
    getNode('#runnerStoppedChip').classList.add('active');

    console.log("Runner stopped!!");
  };

  TaskRunner.prototype.startTaskRunner = function () {
    console.log("Runner starting...");
    !this.taskRunnerActive && this.constructor();
  }

  return TaskRunner;
})();





/**
 * ======================================================
 * ======================================================
 * ======================================================
 */
const tasks = new TaskRunner(3, 0.25);

// Below code is to create the task and push it in the queue
function createTask(id, time = 0.5) {
  task.displayName = `Task${id}`;
  task.timer = time;
  task.id = id;

  function task() {
    console.log(`Running task ${id}`);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const taskId = id;
        console.log(`Task ${taskId} executed.`);

        resolve(`Task ${taskId} executed.`);
      }, time * 1000);
    });
  }
  return task;
}

setTimeout(() => {
  console.log("New tasks feeded to runner.");
  const getRandomTimeDistibution = () => (Math.random() * 5.5).toFixed(2);

  for (let i = 1; i < 10 + 7; i++) {
    tasks.push(createTask(i, getRandomTimeDistibution()));
  }
}, 1 * 1000);

console.log("-- Tasks feeding to TaskRunner complete. --\n");



// Attaching handlers to actions
getNode('#runnerStopBtn')
  .addEventListener("click", () => tasks.stopTaskRunner());

getNode('#runnerStartBtn')
  .addEventListener('click', () => tasks.startTaskRunner());
