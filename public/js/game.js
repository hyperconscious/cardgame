(async () => {
    // Create a new PixiJS application
    const app = new PIXI.Application({
        backgroundColor: 0x1099bb, // Background color
        resizeTo: window // Resize canvas to fit the window
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.view);

    // Create a gradient texture
    const gradientTexture = PIXI.Texture.from('data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${app.screen.width}" height="${app.screen.height}">
            <defs>
                <linearGradient id="grad1" gradientTransform="rotate(135)">
                    <stop offset="0%" style="stop-color: rgba(40, 10, 80, 0.8);" />
                    <stop offset="100%" style="stop-color: rgba(60, 20, 120, 0.8);" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad1)" />
        </svg>`));

    const gradientSprite = new PIXI.Sprite(gradientTexture);
    gradientSprite.width = app.screen.width;
    gradientSprite.height = app.screen.height;
    app.stage.addChild(gradientSprite);

    // Load textures
    const texture = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2020/11/28/03/20/deadpool-5783526_640.png');
    const heartTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2014/04/02/10/47/red-304570_640.png');
    const atkTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2016/03/31/21/40/army-1296582_640.png');
    const defTex = await PIXI.Assets.load('https://i.ibb.co/16C2ZNq/Pngtree-vector-shield-icon-3785558.png');
    const rectTex = await PIXI.Assets.load('https://cdn.pixabay.com/photo/2012/04/15/19/10/rectangle-34969_1280.png');

    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    let cardFields = new Array(5);
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
        rect.x = rect.width * i + app.screen.width / 2 - rect.width * 2;
        rect.y = app.screen.height / 2 - rect.height;
        app.stage.addChild(rect);
    }

    // Create cards
    for (let i = 0; i < 4; i++) {
        createCard(i * 120 + 300, app.screen.height - 200);
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
        container.on('pointerdown', onDragStart);

        container.isPlayed = false;
        container.x = x;
        container.y = y;

        container.addChild(spriteInit(texture, 100, 200));
        container.addChild(spriteInit(heartTex, 30, 30, -50, 100));
        container.addChild(spriteInit(atkTex, 30, 30, 40, 100));
        container.addChild(spriteInit(defTex, 30, 30, 0, 100));
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
                nearest[0].currentCard = dragTarget;
                nearest[0].tint = 0xffffff; // Reset tint after placement
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
})();
