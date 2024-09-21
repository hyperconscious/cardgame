

var socket = io();



// Listen for 'chat message' event and display messages
//socket.emit('connection', socket);

socket.emit('hello', 'hi');
// socket.on('test', (msg) => {
//     console.log(msg);
// });
// Create a new PixiJS application
const app = new PIXI.Application({
    backgroundColor: 0x1099bb, // Background color
    resizeTo: window // Resize canvas to fit the window
});

// Append the application canvas to the document body
document.body.appendChild(app.view);

// Load the bunny texture
const texture = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2020/11/28/03/20/deadpool-5783526_640.png');
const heartTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2014/04/02/10/47/red-304570_640.png');
const atkTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2016/03/31/21/40/army-1296582_640.png');
const defTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2014/04/03/00/38/shield-308943_1280.png');
const rectTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2012/04/15/19/10/rectangle-34969_1280.png');

// Set the texture's scale mode to nearest to preserve pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

let cardFields = new Array(5);
for (let i = 0; i < 5; i++) {
    const rect = new PIXI.Sprite(rectTex);
    
    rect.width = 120;
    rect.height = 220;
    rect.anchor.set(0.5);
    rect.x = rect.width * i + app.screen.width/2 - rect.width * 2;
    rect.y = app.screen.height/2;
    rect.currentCard = null;
    app.stage.addChild(rect);
    cardFields[i] = rect;
}

for (let i = 0; i < 5; i++) {
    const rect = new PIXI.Sprite(rectTex);
    
    rect.width = 120;
    rect.height = 220;
    rect.anchor.set(0.5);
    rect.x = rect.width * i + app.screen.width/2 - rect.width * 2;
    rect.y = app.screen.height/2 - rect.height ;
    app.stage.addChild(rect);
}

// Create 10 bunnies at random positions
for (let i = 0; i < 4; i++) {
    createCard( i * 120 + 300, app.screen.height - 200);
}

function spriteInit(tex, width = 100, height = 100, x = 0, y = 0) {
    const obj = new PIXI.Sprite(tex);
    obj.anchor.set(0.5);
    obj.width = width;
    obj.height = height;
    obj.x = x;
    obj.y = y;
    return obj;
}

function createCard(x, y) {
    const container = new PIXI.Container();
    app.stage.addChild(container);

    container.interactive = true;

    // Setup events for mouse + touch using pointer events
    container.on('pointerdown', onDragStart);

    container.isPlayed = false;

    container.x = x;
    container.y = y;

    // Add it to the stage
    
    container.addChild(spriteInit(texture, 100, 200));
    container.addChild(spriteInit(heartTex, 30, 30, -50, 100));
    container.addChild(spriteInit(atkTex, 30, 30, 40, 100));
    container.addChild(spriteInit(defTex, 30, 30, 0, 100));
}

let dragTarget = null;
let distToPlace = 100;
distToPlace*=distToPlace;

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);

function onDragMove(event) {
    if (dragTarget ) {
        dragTarget.position.set(
            event.data.global.x,
            event.data.global.y
        );
        const nearest = getNearestRect(dragTarget.x, dragTarget.y);
        for(let i = 0; i < cardFields.length; i++){
            if(cardFields[i].currentCard || cardFields[i] != nearest[0])
            {
                cardFields[i].tint = 0xffffff;
            }
        }
        if(nearest[1] < distToPlace)
        {
            nearest[0].tint = 0xffff00;
        }else{
            nearest[0].tint = 0xffffff;
        }

    }
}

let startPos = null;

function onDragStart(event) {
    if(this.isPlayed) return;
    this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
    startPos = new PIXI.Point();
    dragTarget.position.copyTo(startPos);
    console.log(startPos);
}

function onDragEnd() {
    
    if (dragTarget ) {
        const nearest = getNearestRect(dragTarget.x, dragTarget.y);
        app.stage.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        if(nearest[1] > distToPlace || nearest[0].currentCard){
            dragTarget.position.copyFrom(startPos);
        }
        else{
            dragTarget.isPlayed = true;
            dragTarget.position.copyFrom(nearest[0].position);
            nearest[0].currentCard = dragTarget;
        }
        dragTarget = null;
        
    }
}

function getNearestRect(x, y) {
    let nearest = cardFields[0];
    let deltaX = cardFields[0].x - x;
    let deltaY = cardFields[0].y - y;
    let distSq = deltaX * deltaX + deltaY * deltaY;
    for(let i = 1; i < cardFields.length; i++){
        deltaX = cardFields[i].x - x;
        deltaY = cardFields[i].y - y;
        let newDistSq = deltaX * deltaX + deltaY * deltaY;
        if(newDistSq < distSq){
            nearest = cardFields[i];
            distSq = newDistSq;
        }
    }
    return [nearest, distSq];
}
