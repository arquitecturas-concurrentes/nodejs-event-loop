var Polling = function () {
    this.predicate = function () {
        return false
    };
    this.timeout_ms = 0;
    this.quantum_ms = 5000;
};

Polling.prototype = {

    every: function (time) {
        this.quantum_ms = time;
        return this
    },

    until: function (predicate) {
        this.predicate = predicate;
        return this
    },

    timeout: function (time) {
        this.timeout_ms = time;
        return this
    },

    with_callback: function (callback) {
        this.callback = callback;
        return this;
    },

    run: function (op) {
        this.started = Date.now;
        this.op = op;
        return this;
    },

    poll_loop: function () {
        this.op(function decision() {
            var elapsed = Date.now() - this.started;

            this.predicate.apply(null, arguments) || (this.timeout_ms && elapsed >= this.timeout_ms)
                ? this.callback.apply(null, arguments)
                : setTimeout(function () { this.op(decision) }, this.quantum_ms)
        })
    }
}

var poll = new Polling();

poll.run(function () {
    setTimeout(function () {
        console.log('polling...');
        poll.callback(Math.random());
        }, 1)
    })
    .until(function (num) {
        return num > 2
    })
    .every(100)
    .timeout(150000)
    .with_callback(function (num) {
        console.log('Finished with: ' + num)
    })
    .poll_loop();
