var assert = require("assert");

function SimpleReactor() {
  this._tasks = [];
  this._stopped = true;
}

SimpleReactor.prototype = {
  run: function() {
    this._stopped = false;
    try {
      this.processTasks();
    } finally {
      this._stopped = true;
    }
  },

  processTasks: function() {
    while (this._tasks.length > 0) {
      var task = this._tasks.pop();
      task(this)
    }
  },

  isStopped: function() {
    return this._stopped;
  },

  doLater: function(task) {
    this._tasks.push(task);
  }
}

describe("simple reactor", function() {
  var reactor = new SimpleReactor();
  
  it("ends when nothing is scheduled", function(){
    reactor.run();
    assert(reactor.isStopped());
  });

  it("can enqueue single task", function(){
    var x = 0;

    reactor.doLater(function(){ x++; });

    assert(reactor.isStopped());
    assert(x == 0);
  });


  it("can execute enqued tasks", function(){
    var x = 0;

    reactor.doLater(function(){ x++; });

    reactor.run();
    assert(reactor.isStopped());
    assert.equal(x, 1);
  });

  it("can is not stopped while running", function(done){

    reactor.doLater(function(){
      assert(!reactor.isStopped());
      done();
    });

    reactor.run();
  });

  it("can schedule more tasks within a task", function(done){

    reactor.doLater(function(reactor){
      reactor.doLater(function(){
        done();
      })
    });

    reactor.run();
    assert(reactor.isStopped());
  });


  it("is stoped on exception", function(){

    reactor.doLater(function(){
      throw new Error("ups");
    });

    try {
      reactor.run();
      assert.fail();
    } catch(e) {
      assert(reactor.isStopped());
    }
  });


})