TRACE_LEVEL = 1;
DEBUG_LEVEL = 2;
INFO_LEVEL = 3;
WARNING_LEVEL = 4;
ERROR_LEVEL = 5;

class Logger {

    constructor(logLevel) {
        this.logLevel = logLevel;
    }

    trace(msg) {
        this.log(TRACE_LEVEL, msg);
    }

    debug(msg) {
        this.log(DEBUG_LEVEL, msg);
    }

    info(msg) {
        this.log(INFO_LEVEL, msg);
    }

    warn(msg) {
        this.log(WARNING_LEVEL, msg);
    }

    error(msg) {
        this.log(ERROR_LEVEL, msg);
    }

    log(intendedLevel, msg) {
        if (intendedLevel >= this.logLevel) {
            console.log(msg);
        }
    }
}

const logger = new Logger(TRACE_LEVEL);

var previousTime;

document.addEventListener('DOMContentLoaded',
    function () {
        const size = 25;
        const mainBody = document.getElementById("game");

        if (!mainBody) {
            console.log("Doesn't exist yet");
        }

        for (var i = 0; i < size; i++) {
            var row = document.createElement("div");
            row.classList.add("game-row");

            for (var j = 0; j < size; j++) {
                var cell = document.createElement("div");
                cell.classList.add("game-cell");
                row.appendChild(cell);
            }

            mainBody.appendChild(row);
        }

        previousTime = Date.now();
        gameLoop();
    });

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - previousTime;

    logger.trace("Test: elapsed seconds: " + deltaTime);
    previousTime = currentTime;
    sleep(20).then(gameLoop);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
