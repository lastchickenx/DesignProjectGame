//Configuration Globals
const GAME_MAP_SIZE = 39;

//#region Logger
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
//#endregion

//#region Map and Path
class PathNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.previousNode = null;
        this.nextNode = null;
    }

    setPreviousNode(previousNode) {
        this.previousNode = previousNode;
    }

    setNextNode(nextNode) {
        this.nextNode = nextNode;
    }
}

class Path {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
    }
}

class World {
    constructor(map, path) {
        this.map = map;
        this.path = path;
    }
}

//Reminder X is the row
//         Y is how deep in the row

function createStaticWorld(logger) {
    let startX = 0, startY = 12;
    let endX = 39, endY = 20;
    let startNode = null;

    let lastNode = null;
    let blockMove = false;
    let iterationCount = 0;
    while (endX > startX) {
        let current = new PathNode(startX, startY);
        logger.debug("Creation: Current X, Y: " + startX + "," + startY);
        if (lastNode != null) {
            lastNode.setNextNode(current);
            current.setPreviousNode(lastNode);
        } else {
            startNode = current;
        }

        if (!blockMove && (startX % 4) === 0 && startY !== endY) {
            startY += 1;
            blockMove = true;
        } else {
            startX += 1;
            blockMove = false;
        }

        lastNode = current;
        iterationCount += 1;
    }

    const map = new Array(GAME_MAP_SIZE);
    for (let i = 0; i < GAME_MAP_SIZE; i++) {
        map[i] = new Array(GAME_MAP_SIZE).fill(0);
    }

    let unfurledPath = lastNode;
    let furlCount = 0;
    while (unfurledPath != null) {
        map[unfurledPath.x][unfurledPath.y] = 1;
        unfurledPath = unfurledPath.previousNode;
        furlCount += 1;
    }

    logger.debug("iterationCount: " + iterationCount + " furlCount: " + furlCount);
    logger.debug(startNode);
    return new World(map, new Path(startNode, lastNode));
}
//#endregion

//#region Presenter Randomizer
class Distribution {
    constructor(distribution) {
        let max = 0;
        const buckets = [];
        const values = [];

        for (let i = 0; i < distribution.length; i++) {
            max += distribution[i][1];
            buckets.push(max);
            values.push(distribution[i][0]);
        }
        this.max = max;
        this.buckets = buckets;
        this.values = values;
    }

    getNextValue() {
        const val = Math.floor(Math.random() * this.max);
        let selection = this.values[this.values.length - 1];

        for (let i = 0; i < this.buckets.length; i++) {
            if (val <= this.buckets[i]) {
                selection = this.values[i];
                break;
            }
        }

        return selection;
    }
}
//#endregion

//#region Entity
class Entity {
    constructor(id) {
        this.id = id;
    }

    addComponent(component) {
        component.hasOwnProperty("name");

        this[component.name] = component;
    }
}

//#endregion

//#region Drawing System
class DrawingSystem {
    processDrawEvents(entities) {
        entities.forEach(entity => {
            const eleList = document.getElementsByClassName(entity.id);
            for (let i = 0; i < eleList.length; i++) {
                if (!eleList[0].parentElement.classList.contains(entity.position.x + "-" + entity.position.y)) {
                    eleList[0].remove();
                }
            }

            const get = document.getElementsByClassName(entity.position.x + "-" + entity.position.y);
            for (let i = 0; i < get.length; i++) {
                const img = document.createElement("img");
                img.src = entity.drawable.imgPath;
                img.className += `${entity.id}`;
                get[i].appendChild(img);
            }
        });
    }
}
//#endregion

//#region Monster System
class MonsterSystem {

}
//#endregion

//#region Walking Systems
class MovingSystem {
    processPosition(entities, deltaTime) {
        entities.forEach(entity => {
            if (entity.path.node === null) {
                console.log("empty path");
//                entity.addComponent(KillComponent);
                return;
            }

            entity.path.currentTime += deltaTime;

            if (entity.path.currentTime >= entity.path.speed) {
                entity.path.currentTime = 0;
                const pastNode = entity.path.node;
                entity.path.node = entity.path.node.nextNode;

                entity.addComponent(new ChangedPositionComponent(pastNode.x, pastNode.y));
                if (entity.path.node !== null) {
                    entity.position.x = entity.path.node.x;
                    entity.position.y = entity.path.node.y;
                }
            }
        });
    }
}

const cleanUp = ["oldPosition"];
class CleanUpSystem {
    cleanEntities(entities) {
        entities.forEach(entity => {
            for (let i = 0; i < cleanUp.length; i++) {
                delete entity[cleanUp[i]];
            }
        });
    }
}
//#endregion

//#region Components
class PositionComponent {
    constructor(x, y) {
        this.name = "position";
        this.x = x;
        this.y = y;
    }
}

class ChangedPositionComponent {
    constructor(x, y) {
        this.name = "oldPosition";
        this.oldX = x;
        this.oldY = y;
    }
}

class PathComponent {
    constructor(path, speed) {
        this.name = "path";
        this.speed = speed;
        this.node = path.startNode;
        this.currentTime = 0;
    }
}

class DrawComponent {
    constructor(imgPath) {
        this.name = "drawable";
        this.imgPath = imgPath;
    }
}

class TowerFactoryComponent {
    constructor(create, type, minRange, maxRange) {
        this.name = "towerFactory";
        this.create = create;
        this.min = minRange;
        this.max = maxRange;
        this.type = type;
    }
}
//#endregion

//#region EntityFactories
let entityCounter = 0;

function createGhost(path) {
    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new PathComponent(path, 1300));
    entity.addComponent(new DrawComponent("images/ghost.png"));
    entity.addComponent(new PositionComponent(path.startNode.x, path.startNode.y));
    entity.addComponent(new ChangedPositionComponent(path.startNode.x, path.startNode.y));

    return entity;
}

function createSkeleton(path) {
    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new PathComponent(path, 1000));
    entity.addComponent(new DrawComponent("images/skeleton.png"));
    entity.addComponent(new PositionComponent(path.startNode.x, path.startNode.y));
    entity.addComponent(new ChangedPositionComponent(path.startNode.x, path.startNode.y));

    return entity;
}

function createRat(path) {
    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new PathComponent(path, 9200));
    entity.addComponent(new DrawComponent("images/rat.png"));
    entity.addComponent(new PositionComponent(path.startNode.x, path.startNode.y));
    entity.addComponent(new ChangedPositionComponent(path.startNode.x, path.startNode.y));

    return entity;
}

class MonsterGenerator {
    constructor(path, entityArrayRef) {
        this.path = path;
        this.time = 0;
        this.maxMonster = 10;
        this.currentMonster = 0;
        this.entityArrayRef = entityArrayRef;
        this.factoryFunctions = [createGhost, createRat, createSkeleton];
    }

    generateNextMonster(deltaTime) {
        if (this.currentMonster >= this.maxMonster) {
            return;
        }

        this.time += deltaTime;

        if (this.time >= 3000) {
            const index = Math.floor(Math.random() * this.factoryFunctions.length);

            this.entityArrayRef.push(this.factoryFunctions[index](this.path));
            this.time = 0;
            this.currentMonster += 1;
        }

    }
}
//#endregion

//#region Tower

function createArrowTowerFactory() {
    
    function createArrowTower(x, y) {
        const entity = new Entity(crypto.randomUUID());
        entity.addComponent(new DrawComponent("images/arrowTower1.png"));
        entity.addComponent(new PositionComponent(x, y));
        entity.addComponent(new ChangedPositionComponent(x, y));
    }

    const towerEntity = new Entity("arrowFactory");
    towerEntity.addComponent(new DrawComponent("images/arrowTower1.png"));
    towerEntity.addComponent(new PositionComponent(-1, -1));
    towerEntity.addComponent(new TowerFactoryComponent(createArrowTower, "arrow", 2, 5));

    return towerEntity;
}

function createMagicTowerFactory() {

    function createMagicTower(x, y) {
        const entity = new Entity(crypto.randomUUID());
        entity.addComponent(new DrawComponent("images/magicTower1.png"));
        entity.addComponent(new PositionComponent(x, y));
        entity.addComponent(new ChangedPositionComponent(x, y));
    }

    const towerEntity = new Entity("magicFactory");
    towerEntity.addComponent(new DrawComponent("images/magicTower1.png"));
    towerEntity.addComponent(new PositionComponent(-1, -1));
    towerEntity.addComponent(new TowerFactoryComponent(createMagicTower, "magic", 0, 2));

    return towerEntity;
}

//#endregion

class TowerMoveEvent {
    constructor(entity, oldX, oldY, x, y) {
        this.entity = entity;
        this.oldX = oldX;
        this.oldY = oldY;
        this.x = x;
        this.y = y;
    }
}

const logger = new Logger(DEBUG_LEVEL);
const world = createStaticWorld(logger);
const grassDistribution = new Distribution([[3, 70], [2, 20], [1,10]]);
const dirtDistribution = new Distribution([[2, 50], [1, 25], [3, 5]]);

const drawSystem = new DrawingSystem();
const moveSystem = new MovingSystem();
const cleanUpSystem = new CleanUpSystem();

const entities = [];
const generator = new MonsterGenerator(world.path, entities);

const towerFactories = [createArrowTowerFactory(), createMagicTowerFactory()];
towerFactories.forEach(factory => entities.push(factory));
const towerMoveEvents = {};

const factoriesBuildIcon = {}
var currentTowerFactory = null;

var previousTime;

document.addEventListener("DOMContentLoaded",
    function () {

        function getCellsWithinTowerRange(factory, x, y) {
            const output = [];

            const min = factory.towerFactory.min;
            const max = factory.towerFactory.max;
            
            for (let startX = x - max; startX < x + max + 1; startX++) {
                for (let startY = y - max; startY < y + max + 1; startY++) {
                    if (startY < 0 || startX < 0 || startX >= world.map.length || startY >= world.map.length) {
                        continue;
                    }
                    const dx = x - startX;
                    const dy = y - startY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= max && distance > min) {
                        const eleList = document.getElementsByClassName(startX + "-" + startY);
                        if (eleList.length !== 1) {
                            logger.error("Got more than one element by position??? Should never happen");
                            throw Error("Got more than one element by position??? Should never happen");
                        }
                        output.push(eleList[0]);
                    }
                }
            }

            return output;
        }

        //#region Initial Game Map
        const mainBody = document.getElementById("game");

        for (var i = 0; i < world.map.length; i++) {
            var row = document.createElement("div");
            row.classList.add("game-row");

            for (var j = 0; j < world.map[i].length; j++) {
                var cell = document.createElement("div");
                cell.classList.add("game-cell");

                const worldCellValue = world.map[i][j];
                if (worldCellValue === 0) {
                    cell.classList.add(`grass-${grassDistribution.getNextValue()}`);
                } else if (worldCellValue === 1) {
                    cell.classList.add(`dirt-${dirtDistribution.getNextValue()}`);
                }

                cell.classList.add(i + "-" + j);

                const refI = i;
                const refJ = j;
                cell.addEventListener("mouseenter", () => {
                    logger.trace(`entering: ${refI}, ${refJ}`);
                    const mouseEnterTime = Date.now();
                    if (currentTowerFactory != null) {
                        currentTowerFactory.addComponent(new ChangedPositionComponent(currentTowerFactory.position.x, currentTowerFactory.position.y));
                        currentTowerFactory.position.x = refI;
                        currentTowerFactory.position.y = refJ;

                        const highlights = getCellsWithinTowerRange(currentTowerFactory, refI, refJ);
                        highlights.forEach(highlight => {
                            highlight.classList.add("highlight-green");
                        });
                    }
                    logger.debug(`mouse enter time: ${Date.now() - mouseEnterTime}`);
                });
                cell.addEventListener("mouseleave", () => {
                    logger.trace(`leaving: ${refI}, ${refJ}`);
                    const mouseLeaveTime = Date.now();
                    if (currentTowerFactory != null) {
                        currentTowerFactory.addComponent(new ChangedPositionComponent(refI, refJ));
                        currentTowerFactory.position.x = -1;
                        currentTowerFactory.position.y = -1;

                        const highlights = getCellsWithinTowerRange(currentTowerFactory, refI, refJ);
                        highlights.forEach(highlight => {
                            highlight.classList.remove("highlight-green");
                        });
                    }
                    logger.debug(`mouse leave time: ${Date.now() - mouseLeaveTime}`);
                });
                cell.addEventListener("click", () => {
                    logger.trace(`clicking: ${refI}, ${refJ}`);
                    if (currentTowerFactory != null) {
                        currentTowerFactory.towerFactory.create(refI, refJ);
                    }
                });
                row.appendChild(cell);
            }

            mainBody.appendChild(row);
        }

        //#endregion

        //#region Draw Build Menu
        const buildSection = document.getElementById("build");

        towerFactories.forEach(towerFactoryEntity => {
            const container = document.createElement("div");
            const img = document.createElement("img");
            img.src = towerFactoryEntity.drawable.imgPath;

            img.addEventListener("click", () => {
                logger.debug(`clicking ${towerFactoryEntity.id}`);
                if (currentTowerFactory == null) {
                    factoriesBuildIcon[towerFactoryEntity.id].classList.add("selected");
                    currentTowerFactory = towerFactoryEntity;
                } else if (currentTowerFactory === towerFactoryEntity) {
                    factoriesBuildIcon[towerFactoryEntity.id].classList.remove("selected");
                    currentTowerFactory = null;
                } else {
                    factoriesBuildIcon[currentTowerFactory.id].classList.remove("selected");
                    factoriesBuildIcon[towerFactoryEntity.id].classList.add("selected");
                    currentTowerFactory = towerFactoryEntity;
                }
            });

            factoriesBuildIcon[towerFactoryEntity.id] = container;

            container.classList.add("info-img");
            container.appendChild(img);
            buildSection.appendChild(container);
        });
        //#endregion

        previousTime = Date.now();
        gameLoop();
    });



function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - previousTime;

    logger.trace(`Test: elapsed seconds: ${deltaTime}`);

    generator.generateNextMonster(deltaTime);



    const moveSystemTime = Date.now();
    moveSystem.processPosition(
        entities.filter(entity => entity.hasOwnProperty("path") && entity.hasOwnProperty("position")), deltaTime);
    logger.debug(`processPosition: elapsed seconds: ${Date.now() - moveSystemTime}`);

    const drawSystemTime = Date.now();
    drawSystem.processDrawEvents(entities.filter(entity => entity.hasOwnProperty("position") && entity.hasOwnProperty("oldPosition")));
    logger.debug(`processDrawEvents: elapsed seconds: ${Date.now() - drawSystemTime}`);

    const cleanSystemTime = Date.now();
    cleanUpSystem.cleanEntities(entities);
    logger.debug(`cleanEntities: elapsed seconds: ${Date.now() - cleanSystemTime}`);

    previousTime = currentTime;
    sleep(10).then(gameLoop);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
