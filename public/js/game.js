
class Card {
    constructor({id, character_name, avatar, attack, defence }) {
        this.id = id;
        this.character_name = character_name;
        this.avatar = avatar;
        this.attack = attack;
        this.defence = defence;
    }
}

function updatePlayerInfo(hp) {
    document.getElementById('player-hp').textContent = `HP: ${hp}`;
}


function updateEnemyInfo(hp) {
    document.getElementById('enemy-hp').textContent = `HP: ${hp}`;
}

async function loadAvatar(userId, targetElementId) {
    try {
        const response = await fetch(`/api/user-avatar/${userId}`);
        const data = await response.json();
        document.getElementById(targetElementId).src = data.avatar;
    } catch (error) {
        console.error('Error loading avatar:', error);
    }
}

async function loadPlayersData(players) {
    
    await loadAvatar(players.isFirstPlayer ? players.user.id : players.enemy.id, 'player-avatar');
    await loadAvatar(players.isFirstPlayer ? players.enemy.id : players.user.id, 'enemy-avatar');

    document.getElementById('player-nickname').textContent = players.isFirstPlayer ? players.user.name : players.enemy.name;
    document.getElementById('enemy-nickname').textContent = players.isFirstPlayer ? players.enemy.name : players.user.name;
}


(async () => {
    const socket = io();

    const roomId = new URLSearchParams(window.location.search).get('roomId');

    socket.emit('joinRoom', roomId);

    socket.on('disconnect', () => {
        document.getElementById('status').innerText = 'Disconnected from the server.';
    });
    // Create a new PixiJS application
    const app = new PIXI.Application({
        backgroundColor:  0x282c34, // Background color
        resizeTo: window // Resize canvas to fit the window
    });

    socket.on('gameStarted', async (players) => {
        document.getElementById('info').style.display = 'none';
        document.getElementById('status').style.display = 'none';
        document.getElementById('player-container').style.display = 'flex';
        document.getElementById('enemy-container').style.display = 'flex';


        loadPlayersData(players);
        updateEnemyInfo(40);
        updatePlayerInfo(40);

        socket.emit('getRandCard', null);

        
        // Append the application canvas to the document body
        document.body.appendChild(app.view);

        // Load textures
        const texture = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2020/11/28/03/20/deadpool-5783526_640.png');
        const heartTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2014/04/02/10/47/red-304570_640.png');
        const atkTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2016/03/31/21/40/army-1296582_640.png');
        const defTex = await PIXI.Assets.load('https://i.ibb.co/16C2ZNq/Pngtree-vector-shield-icon-3785558.png');
        const rectTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2012/04/15/19/10/rectangle-34969_1280.png');
    
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    
        let cardFields = new Array(5);
        let enemyCardFields = new Array(5);

        socket.on('receiveCard', (card) => {
            console.log(card);
            createCard(card, app.screen.width / 2, app.screen.height - 200);
        });
        
        for(let i = 0; i < 5; i++)
        {
            socket.emit('getRandCard', null);
        }
        

        socket.on('enemyCardPlayed', (card, field) => {
            console.log('field = ' + field);
            const rect = createCard(card, enemyCardFields[field].x, enemyCardFields[field].y);
            rect.isPlayed = true;
            enemyCardFields[field].currentCard = card;
        });

        for (let i = 0; i < 5; i++) {
            const rect = new PIXI.Sprite(rectTex);
    
            rect.width = 120;
            rect.height = 220;
            rect.anchor.set(0.5);
            rect.x = rect.width * i + app.screen.width / 2 - rect.width * 2;
            rect.y = app.screen.height / 2;
            rect.currentCard = null;
            app.stage.addChild(rect);
            cardFields[i] = rect;
    
            // Add hover effect
            rect.interactive = true;
            rect.on('pointerover', () => {
                rect.tint = 0x555555; // Dark gray on hover
            });
            rect.on('pointerout', () => {
                if (!rect.currentCard) rect.tint = 0xffffff; // Reset if no card placed
            });
        }

        for (let i = 0; i < 5; i++) {
            const rect = new PIXI.Sprite(rectTex);
    
            rect.width = 120;
            rect.height = 220;
            rect.anchor.set(0.5);
            rect.currentCard = null;
            rect.x = rect.width * i + app.screen.width / 2 - rect.width * 2;
            rect.y = app.screen.height / 2 - rect.height;
            app.stage.addChild(rect);
            enemyCardFields[i] = rect;
        }
    
        // Create cards
        // for (let i = 0; i < 4; i++) {

        //     creataeCrd(texture, i * 120 + 300, app.screen.height - 200);
        // }
        

    
        function spriteInit(tex, width = 100, height = 100, x = 0, y = 0) {
            const obj = new PIXI.Sprite(tex);
            obj.anchor.set(0.5);
            obj.width = width;
            obj.height = height;
            obj.x = x;
            obj.y = y;
            return obj;
        }
    
        async function createCard(card, x, y) {
            const container = new PIXI.Container();
            app.stage.addChild(container);
    
            container.interactive = true;
            container.on('pointerdown', onDragStart);
    
            container.isPlayed = false;
            container.x = x;
            container.y = y;
            container.card = card;

            container.addChild(spriteInit(await PIXI.Assets.load(card.avatar), 150, 250));
            container.addChild(spriteInit(heartTex, 30, 30, -50, 100));
            container.addChild(spriteInit(atkTex, 30, 30, 40, 100));
            container.addChild(spriteInit(defTex, 30, 30, 0, 100));
            return container;
        }
    
        let dragTarget = null;
        let distToPlace = 100;
        distToPlace *= distToPlace;
    
        app.stage.interactive = true;
        app.stage.hitArea = app.screen;
        app.stage.on('pointerup', onDragEnd);
        app.stage.on('pointerupoutside', onDragEnd);
    
        function onDragMove(event) {
            if (dragTarget) {
                dragTarget.position.set(event.data.global.x, event.data.global.y);
                const nearest = getNearestRect(dragTarget.x, dragTarget.y);
                cardFields.forEach(field => {
                    if (field.currentCard) {
                        field.tint = 0xffffff; // Reset if a card is already placed
                    } else {
                        field.tint = 0xffffff; // Reset all fields
                    }
                });
                if (nearest[1] < distToPlace) {
                    nearest[0].tint = 0xffff00; // Highlight nearest field
                }
            }
        }
    
        let startPos = null;
    
        function onDragStart(event) {
            if (this.isPlayed) return;
            this.alpha = 0.5;
            dragTarget = this;
            
            // Предотвращаем стандартное поведение
            event.stopPropagation();
            
            app.stage.on('pointermove', onDragMove);
            startPos = new PIXI.Point();
            dragTarget.position.copyTo(startPos);
        }
        
        function onDragEnd() {
            if (dragTarget) {
                const nearest = getNearestRect(dragTarget.x, dragTarget.y);
                app.stage.off('pointermove', onDragMove);
                dragTarget.alpha = 1;
                
                if (nearest[1] > distToPlace || nearest[0].currentCard) {
                    dragTarget.position.copyFrom(startPos);
                } else {
                    dragTarget.isPlayed = true;
                    dragTarget.position.copyFrom(nearest[0].position);
                    socket.emit('playCard', dragTarget.card, cardFields.indexOf(nearest[0]));
                    nearest[0].currentCard = dragTarget;
                    nearest[0].tint = 0xffffff; // Сбросить оттенок после размещения
                }
                
                dragTarget = null;
            }
        }
        
    
        function getNearestRect(x, y) {
            let nearest = cardFields[0];
            let deltaX = cardFields[0].x - x;
            let deltaY = cardFields[0].y - y;
            let distSq = deltaX * deltaX + deltaY * deltaY;
            for (let i = 1; i < cardFields.length; i++) {
                deltaX = cardFields[i].x - x;
                deltaY = cardFields[i].y - y;
                let newDistSq = deltaX * deltaX + deltaY * deltaY;
                if (newDistSq < distSq) {
                    nearest = cardFields[i];
                    distSq = newDistSq;
                }
            }
            return [nearest, distSq];
        }


    });

})();

