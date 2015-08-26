function TasksQueue() {
  this._tasks = [];
}
TasksQueue.prototype = {
  hasPendingWorkUnits: function() {
    return this._tasks.length > 0;
  },

  processWorkUnits: function() {
    while (this.hasPendingWorkUnits()) {
      var task = this._tasks.pop();
      task(this)
    }
  },

  pushTask: function(task) {
    this._tasks.push(task);
  }
}

module.exports = TasksQueue;
