var keys = require("@nathanfaucett/keys"),
    isArrayLike = require("@nathanfaucett/is_array_like"),
    isFunction = require("@nathanfaucett/is_function"),
    emptyFunction = require("@nathanfaucett/empty_function"),
    fastSlice = require("@nathanfaucett/fast_slice");


module.exports = series;


function series(tasks, callback) {
    return (
        isArrayLike(tasks) ?
        arraySeries(tasks, callback || emptyFunction) :
        objectSeries(Object(tasks), callback || emptyFunction)
    );
}

function arraySeries(tasks, callback) {
    var index = 0,
        length = tasks.length,
        results = new Array(length),
        called = false,
        task;

    function next(error) {
        var argsLength, nextTask;

        if (called === false) {
            if (error) {
                called = true;
                callback(error);
            } else {
                argsLength = arguments.length;
                if (argsLength > 1) {
                    results[index] = argsLength > 2 ? fastSlice(arguments, 1) : arguments[1];
                }

                index += 1;
                if (index === length) {
                    called = true;
                    callback(undefined, results);
                } else {
                    nextTask = tasks[index];

                    if (isFunction(nextTask)) {
                        nextTask(next);
                    } else {
                        throw new TypeError("series(tasks, callback) tasks must be functions");
                    }
                }
            }
        }
    }

    task = tasks[index];

    if (isFunction(task)) {
        task(next);
    } else {
        throw new TypeError("series(tasks, callback) tasks must be functions");
    }
}

function objectSeries(tasks, callback) {
    var index = 0,
        objectKeys = keys(tasks),
        length = objectKeys.length,
        results = {},
        called = false,
        task;

    function next(error) {
        var argsLength, nextTask;

        if (called === false) {
            if (error) {
                called = true;
                callback(error);
            } else {
                argsLength = arguments.length;
                if (argsLength > 1) {
                    results[objectKeys[index]] = argsLength > 2 ? fastSlice(arguments, 1) : arguments[1];
                }

                index += 1;
                if (index === length) {
                    called = true;
                    callback(undefined, results);
                } else {
                    nextTask = tasks[objectKeys[index]];

                    if (isFunction(nextTask)) {
                        nextTask(next);
                    } else {
                        throw new TypeError("series(tasks, callback) tasks must be functions");
                    }
                }
            }
        }
    }

    task = tasks[objectKeys[index]];

    if (isFunction(task)) {
        task(next);
    } else {
        throw new TypeError("series(tasks, callback) tasks must be functions");
    }
}
