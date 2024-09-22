
class Card {
    constructor({id, character_name, avatar, attack, defense, cost}) {
        this.id = id;
        this.character_name = character_name;
        this.avatar = avatar;
        this.attack = attack;
        this.defense = defense;
        this.cost = cost;
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

async function loadPlayersData(players, isFirstPlayer) {
    
    await loadAvatar(isFirstPlayer ? players.user.id : players.enemy.id, 'player-avatar');
    await loadAvatar(isFirstPlayer ? players.enemy.id : players.user.id, 'enemy-avatar');

    document.getElementById('player-nickname').textContent = isFirstPlayer ? players.user.name : players.enemy.name;
    document.getElementById('enemy-nickname').textContent = isFirstPlayer ? players.enemy.name : players.user.name;
}


(async () => {
    const socket = io();

    const roomId = new URLSearchParams(window.location.search).get('roomId');

    socket.emit('joinRoom', roomId);

    socket.on('disconnect', () => {
        document.getElementById('status').innerText = 'Disconnected from the server.';
    });

    const app = new PIXI.Application({
        backgroundColor:  0x282c34,
        resizeTo: window 
    });

    socket.on('gameStarted', async (isTurn, players, isFirstPlayer) => {
        document.getElementById('info').style.display = 'none';
        document.getElementById('status').style.display = 'none';
        document.getElementById('player-container').style.display = 'flex';
        document.getElementById('enemy-container').style.display = 'flex';

        myPoints = 10;
        await loadPlayersData(players, isFirstPlayer);
        updateEnemyInfo(40);
        updatePlayerInfo(40);

        socket.emit('getRandCard', null);

        socket.emit('getTurn');
        
        // Append the application canvas to the document body
        document.body.appendChild(app.view);

        // Load textures
        const buttonTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2015/07/25/07/58/the-button-859345_1280.png');
        const heartTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2014/04/02/10/47/red-304570_640.png');
        const atkTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2016/03/31/21/40/army-1296582_640.png');
        const costTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2017/02/22/20/03/crystal-ball-2090496_1280.png');

        //shield img 'https://i.ibb.co/16C2ZNq/Pngtree-vector-shield-icon-3785558.png'
        const defTex = await PIXI.Assets.load('https://i.ibb.co/16C2ZNq/Pngtree-vector-shield-icon-3785558.png');
        const rectTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2023/01/10/02/16/pattern-7708699_1280.png');
    
        const basicText = new PIXI.Text('Not your turn\n just wait(', {
            fontFamily: 'Arial',     
            fontSize: 36,           
            fill: 0xffffff,        
            align: 'center',        
            stroke: 0x000000,       
            strokeThickness: 4       
        });

        basicText.x = app.screen.width - 300;
        basicText.y = 100;
        app.stage.addChild(basicText);

        const pointsText = new PIXI.Text('Points: ' + myPoints, {
            fontFamily: 'Arial',     
            fontSize: 36,           
            fill: 0xffffff,        
            align: 'center',        
            stroke: 0x000000,       
            strokeThickness: 4       
        });

        pointsText.x = 50;
        pointsText.y = app.screen.height - 200;
        app.stage.addChild(pointsText);
        isMyTurn = isTurn;
        basicText.text = isTurn ? 'Your turn' : 'Not your turn\n just wait(';

        button = new PIXI.Sprite(buttonTex);
        button.width = 120;
        button.height = 30;
        button.x = app.screen.width - 100;
        button.y = app.screen.height * 0.5;
        button.interactive = true;
        button.anchor.set(0.5);
        button.eventMode = 'static';
        button.cursor = 'pointer';
        button.on('pointerdown', nextTurn);
        button.on('pointerover', () => {
            button.tint = 0x555555; 
        });
        button.on('pointerout', () => {
            button.tint = 0xffffff; 
        });
        app.stage.addChild(button);

        const nextTurnText = new PIXI.Text('Next turn', {
            fontFamily: 'Arial',
            fontSize: 240,         
            fill: 0xffffff,        
            align: 'center',       
            stroke: 0x000000,      
            strokeThickness: 4     
        });

        nextTurnText.anchor.set(0.5);
        nextTurnText.interactive = false;
        button.addChild(nextTurnText);



        let cardFields = new Array(5);
        let enemyCardFields = new Array(5);
        let handFields = new Array(5);

        socket.on('receiveCards', async (cards) => {
            //createCard(card, app.screen.width / 2, app.screen.height - 200);
            ind = 0;
            let isBug = false;
            for(let i = 0; i < handFields.length; i++) {
                

                if(!handFields[i]) {
                    handFields[i] = await createCard(cards[ind], app.screen.width / 2 + (200 * (i - 2)), app.screen.height - 200);
                    if(!handFields[i]) isBug = true;
                    ind++;
                }
                
            }
            if(isBug) getFullHand();
        });

        function getFullHand()
        {
            let needCount = 0;
            for(let i = 0; i < handFields.length; i++){
                if(!handFields[i]){
                    needCount++;
                }
            }
            if(needCount>0){
                socket.emit('getRandCards', needCount);
            }
        
            
        }
        
        getFullHand();
        
        socket.on('enemyCardPlayed', async (card, field) => {

            const rect = await createCard(card, enemyCardFields[field].x, enemyCardFields[field].y);
            rect.isPlayed = true;
            rect.costText.visible = false;
            enemyCardFields[field].currentCard = rect;
        });

        socket.on('changeTurn', (isMyTurn) => {
            setTurn(isMyTurn);
            if(isMyTurn) {
                getFullHand();
            }
        });

        socket.on('updateBattleField', (playerHp, enemyHp, myCardsOnField, enemyCardsOnField) => {
            updatePlayerInfo(playerHp);
            updateEnemyInfo(enemyHp);
            for(let i = 0; i < cardFields.length; i++)
            {
                console.log('i = ' + i + ' ' + myCardsOnField);
                if(cardFields[i].currentCard)
                    if(!myCardsOnField[i]) {
                        cardFields[i].currentCard.destroy();
                        cardFields[i].currentCard = null;
                    } else {
                        cardFields[i].currentCard.card = myCardsOnField[i];
                        console.log(myCardsOnField[i].defense);
                        updateCardView(cardFields[i].currentCard);
                    }
                if(enemyCardFields[i].currentCard)
                    if(!enemyCardsOnField[i]) {
                        enemyCardFields[i].currentCard.destroy();
                    } else if (enemyCardsOnField[i]){
                        enemyCardFields[i].currentCard.card = enemyCardsOnField[i];
                        updateCardView(enemyCardFields[i].currentCard);
                    }
            }
        });

        function calculatePoints(currentPoints, income, incomeRate, level, maxPoints){
            let newPoints = currentPoints + income + incomeRate * level;

            if (newPoints > maxPoints) {
                newPoints = maxPoints;
            }

            return Math.ceil(newPoints);
        }

        function setTurn(val){
            isMyTurn = val;
            basicText.text = val ? 'Your turn' : 'Not your turn\n just wait(';
            if(!val){
                setPoints(calculatePoints(myPoints, 3, (myPoints / 5), 3, 24));
            }
        }

        for (let i = 0; i < 5; i++) {
            const rect = new PIXI.Sprite(rectTex);
    
            rect.width = 160;
            rect.height = 260;
            rect.anchor.set(0.5);
            rect.x = (rect.width + 30) * i + app.screen.width / 2 - (rect.width + 30) * 2;
            rect.y = app.screen.height / 2;
            rect.zIndex = 2;
            rect.currentCard = null;    
            app.stage.addChild(rect);
            cardFields[i] = rect;
    
            // // Add hover effect
            // rect.interactive = true;
            // rect.on('pointerover', () => {
            //     rect.tint = 0x555555; 
            // });
            // rect.on('pointerout', () => {
            //     if (!rect.currentCard) rect.tint = 0xffffff; 
            // });
        }

        for (let i = 0; i < 5; i++) {
            const rect = new PIXI.Sprite(rectTex);
    
            rect.width = 160;
            rect.height = 260;
            rect.anchor.set(0.5);
            rect.currentCard = null;
            rect.x = (rect.width + 30) * i + app.screen.width / 2 - (rect.width + 30) * 2;
            rect.y = app.screen.height / 2 - rect.height;
            rect.zIndex = 2;
            app.stage.addChild(rect);
            enemyCardFields[i] = rect;
        }
    
        // Create cards
        // for (let i = 0; i < 4; i++) {

        //     creataeCrd(texture, i * 120 + 300, app.screen.height - 200);
        // }
        
        function nextTurn() {
            console.log('try');
            if(!isMyTurn) return;
            socket.emit('nextTurn');
        }
    
        function spriteInit(    tex, width = 100, height = 100, x = 0, y = 0) {
            const obj = new PIXI.Sprite(tex);
            obj.anchor.set(0.5);
            obj.width = width;
            obj.height = height;
            obj.x = x;
            obj.y = y;
            return obj;
        }
        
        async function createCard(card, x, y) {
            if (!card) {
                console.error("Card is null or undefined");
                return;
            }
        
            if (!card.avatar) {
                console.error("Card avatar is null or undefined");
                return;
            }
        
            let container = new PIXI.Container();
            app.stage.addChild(container);
        
            container.interactive = true;
            container.on('pointerdown', onDragStart);
        
            container.isPlayed = false;
            container.x = x;
            container.y = y;
            container.zIndex = 1;
            container.card = card;
        
            heart = spriteInit(heartTex, 30, 30, -50, 100);
            attack = spriteInit(atkTex, 30, 30, 40, 100);
            heart.zIndex = 0;
        
            console.log('card: ', card.avatar);
            avatar = await PIXI.Assets.load(String(card.avatar));
            container.addChild(spriteInit(avatar, 150, 250));
            container.addChild(heart);
            container.addChild(attack);
        
            const healthText = createText(heart.position);
            healthText.zIndex = 1;
            container.hpText = healthText;
            container.addChild(healthText);
        
            const attackText = createText(attack.position);
            container.atkText = attackText;
            container.addChild(attackText);
        
            const costText = createText({ x: 0, y: -100 });
            container.costText = costText;
            container.addChild(costText);
            updateCardView(container);
        
            return container;
        }
        

        function updateCardView(card)
        {
            card.hpText.text = card.card.defense;
            card.atkText.text = card.card.attack;
            card.costText.text = card.card.cost;
        }
        
        function createText(pos) {
            const text = new PIXI.Text('0', {
                fontFamily: 'Arial',
                fontSize: 20,         
                fill: 0xffffff,        
                align: 'center',       
                stroke: 0x000000,      
                strokeThickness: 4     
            });
            text.anchor.set(0.5);
            text.position.copyFrom(pos);
            return text;
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
        
        function setPoints(val)
        {
            myPoints = val;
            pointsText.text = 'Points: ' + val;
        }

        let startPos = null;
    
        function onDragStart(event) {
            if (this.isPlayed || !isMyTurn || this.card.cost > myPoints) return;
            this.alpha = 0.5;
            dragTarget = this;
            
            // Предотвращаем стандартное поведение
            event.stopPropagation();
            this.costText.visible = false;
            app.stage.on('pointermove', onDragMove);
            startPos = new PIXI.Point();
            dragTarget.position.copyTo(startPos);
            setPoints(myPoints - this.card.cost);
        }
        
        function onDragEnd() {
            if (dragTarget) {
                const nearest = getNearestRect(dragTarget.x, dragTarget.y);
                app.stage.off('pointermove', onDragMove);
                dragTarget.alpha = 1;
                
                if (nearest[1] > distToPlace || nearest[0].currentCard) {
                    dragTarget.position.copyFrom(startPos);
                    setPoints(myPoints + dragTarget.card.cost);
                    dragTarget.costText.visible = true;
                } else {
                    dragTarget.isPlayed = true;
                    dragTarget.position.copyFrom(nearest[0].position);
                    socket.emit('playCard', dragTarget.card, cardFields.indexOf(nearest[0]));
                    handFields[handFields.indexOf(dragTarget)] = null;
                    console.log('index of = ' + dragTarget.card + ' ' + dragTarget.handIndex);
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

