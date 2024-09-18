(async () => {
    // Create a new PixiJS application
    const app = new PIXI.Application({
        backgroundColor: 0x1099bb, // Background color
        resizeTo: window // Resize canvas to fit the window
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.view);

    // Load the bunny texture
    const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');

    // Set the texture's scale mode to nearest to preserve pixelation
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

    // Create 10 bunnies at random positions
    for (let i = 0; i < 10; i++) {
        createBunny(Math.floor(Math.random() * app.screen.width), Math.floor(Math.random() * app.screen.height));
    }

    function createBunny(x, y) {
        // Create our little bunny friend
        const bunny = new PIXI.Sprite(texture);

        // Enable the bunny to be interactive
        bunny.interactive = true;
        bunny.buttonMode = true; // Shows hand cursor when hovering

        // Center the bunny's anchor point
        bunny.anchor.set(0.5);

        // Make it a bit bigger, so it's easier to grab
        bunny.scale.set(3);

        // Setup events for mouse + touch using pointer events
        bunny.on('pointerdown', onDragStart);

        // Move the sprite to its designated position
        bunny.x = x;
        bunny.y = y;

        // Add it to the stage
        app.stage.addChild(bunny);
    }

    let dragTarget = null;

    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', onDragEnd);

    function onDragMove(event) {
        if (dragTarget) {
            dragTarget.position.set(
                event.data.global.x - dragTarget.width / 2,
                event.data.global.y - dragTarget.height / 2
            );
        }
    }

    function onDragStart(event) {
        this.alpha = 0.5;
        dragTarget = this;
        app.stage.on('pointermove', onDragMove);
    }

    function onDragEnd() {
        if (dragTarget) {
            app.stage.off('pointermove', onDragMove);
            dragTarget.alpha = 1;
            dragTarget = null;
        }
    }
})();