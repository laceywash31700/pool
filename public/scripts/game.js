document.addEventListener("DOMContentLoaded", () => {
  Game.loadAssets();

  class Vector2 {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }
    add(vector) {
      return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
      return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
      return new Vector2(this.x * scalar, this.y * scalar);
    }
    distanceFrom(vector) {
      return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
    }
    static get zero() {
      return new Vector2(0, 0);
    }
  }

  const container = document.getElementById("container");
  const stage = new Konva.Stage({
    container: "container",
    width: container.offsetWidth,
    height: container.offsetHeight,
  });
  const layer = new Konva.Layer();
  stage.add(layer);

  const tableImage = new Konva.Image({
    x: 0,
    y: 0,
    image: sprites.background,
    width: stage.width(),
    height: stage.height(),
  });
  layer.add(tableImage);

  window.addEventListener("resize", () => {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    stage.width(width);
    stage.height(height);
    tableImage.width(width);
    tableImage.height(height);
    cueStick.width(width * 0.7);
    cueStick.height(height * 0.025);
    cueStick.position({ x: stage.width() / 2, y: stage.height() * 0.8 });
    whiteBall.position = new Vector2(413, 413);
    whiteBall.x(413);
    whiteBall.y(413);
    layer.batchDraw();
  });

  function createBall(sprite, x, y) {
    const ball = new Konva.Image({
      x,
      y,
      image: sprite,
      width: 38,
      height: 38,
      offset: {
        x: 38 / 2, // Center horizontally
        y: 38 / 2, // Center vertically
      },
    });
    ball.position = new Vector2(x, y);
    ball.velocity = Vector2.zero;
    balls.push(ball);
    layer.add(ball);
    return ball;
  }

  // const redBallPositions = [
  //     { x: 1056, y: 433 }, { x: 1090, y: 374 }, { x: 1126, y: 393 },
  //     { x: 1126, y: 472 }, { x: 1162, y: 335 }, { x: 1162, y: 374 },
  //     { x: 1162, y: 452 },
  // ];
  // const yellowBallPositions = [
  //     { x: 1022, y: 413 }, { x: 1056, y: 393 }, { x: 1090, y: 452 },
  //     { x: 1126, y: 354 }, { x: 1126, y: 433 }, { x: 1162, y: 413 },
  //     { x: 1162, y: 491 },
  // ];
  // redBallPositions.forEach(pos => createBall(sprites.redBall, pos.x, pos.y));
  // yellowBallPositions.forEach(pos => createBall(sprites.yellowBall, pos.x, pos.y));
  // createBall(sprites.blackBall, 1090, 413);
  const balls = [];
  const whiteBallRadius = 19;
  let wbX = 525;
  let wbY = 440;
  console.log(`This is the x of WhiteBall: ${wbX}, y of WhiteBall: ${wbY}`);

  const whiteBall = createBall(sprites.ball, wbX, wbY);

  // Cue stick settings
  const cueStickLength = stage.width() * 0.5;
  const orbitRadius = whiteBallRadius * 5; // Maintain clearance from the white ball

  const cueStick = new Konva.Image({
    x: whiteBall.x(),
    y: whiteBall.y(),
    image: sprites.stick,
    width: cueStickLength,
    height: stage.height() * 0.025,
    offset: {
      x: cueStickLength, // Set pivot to the butt of the cue stick
      y: (stage.height() * 0.025) / 2, // Center vertically
    },
  });
  layer.add(cueStick);

  // Helper function to position cue stick around white ball
  function positionCueStick(angle) {
    const cueStickButtX = (whiteBall.x() + Math.cos(angle) / (orbitRadius));
    const cueStickButtY = (whiteBall.y() + Math.sin(angle) / (orbitRadius));

    cueStick.position({ x: cueStickButtX, y: cueStickButtY });
    cueStick.rotation((angle * 180) / Math.PI); // Rotate to face mouse
    layer.batchDraw();
  }

  // Mousemove event for cue stick rotation around white ball
  stage.on("mousemove", (e) => {
    const pointerPosition = stage.getPointerPosition();
    if (pointerPosition) {
      const dx = pointerPosition.x - whiteBall.x();
      const dy = pointerPosition.y - whiteBall.y();
      const angle = Math.atan2(dy, dx);
      positionCueStick(angle); // Update cue stick position
    }
  });

  stage.on("mousedown", () => {
    const power = 50;
    const angle = cueStick.rotation() * (Math.PI / 180);
    whiteBall.velocity = new Vector2(Math.cos(angle), Math.sin(angle)).multiply(
      power
    );
  });

  function handleCollision(ball1, ball2) {
    const distance = ball1.position.distanceFrom(ball2.position);
    if (distance < 38) {
      const angle = Math.atan2(
        ball2.position.y - ball1.position.y,
        ball2.position.x - ball1.position.x
      );
      const velocity1 = new Vector2(Math.cos(angle), Math.sin(angle)).multiply(
        ball1.velocity.distanceFrom(Vector2.zero)
      );
      const velocity2 = new Vector2(
        Math.cos(angle + Math.PI),
        Math.sin(angle + Math.PI)
      ).multiply(ball2.velocity.distanceFrom(Vector2.zero));
      ball1.velocity = velocity2;
      ball2.velocity = velocity1;
    }
  }

  function gameLoop() {
    balls.forEach((ball) => {
      if (ball.velocity.x !== 0 || ball.velocity.y !== 0) {
        ball.position = ball.position.add(ball.velocity);
        ball.x(ball.position.x);
        ball.y(ball.position.y);
        ball.velocity = ball.velocity.multiply(0.98);
      }
    });
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        handleCollision(balls[i], balls[j]);
      }
    }
    layer.batchDraw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
