document.addEventListener("DOMContentLoaded", () => {
  Game.loadAssets();

  class Vector2 {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }

    copy() {
      return new Vector2(this.x, this.y);
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

  const initialWidth = 1920; // Set initial screen width
  const initialHeight = 911; // Set initial screen height

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
 
  const balls = [];
  function createBall(sprite, x, y) {
    const ball = new Konva.Image({
      x,
      y,
      image: sprite,
      width: 38,
      height: 38,
      offset: { x: 38 / 2, y: 38 / 2 },
    });
    ball.position = new Vector2(x, y);
    ball.velocity = Vector2.zero;
    balls.push(ball);
    layer.add(ball);
    return ball;
  }

 
  const initialBallX = 525;
  const initialBallY = 440;
// New black ball position
const blackBallPosition = { x: 1395, y: 456 };

// Offsets based on the new black ball position
const xOffset = 313; // Difference in x (1395 - 1082)
const yOffset = 43;  // Difference in y (456 - 413)

// Updated red ball positions relative to the new black ball position
const redBallPositions = [
  { x: 1056 + xOffset, y: 430 + yOffset },
  { x: 1082 + xOffset, y: 383 + yOffset },
  { x: 1110 + xOffset, y: 400 + yOffset },
  { x: 1110 + xOffset, y: 463 + yOffset },
  { x: 1140 + xOffset, y: 353 + yOffset },
  { x: 1140 + xOffset, y: 383 + yOffset },
  { x: 1140 + xOffset, y: 445 + yOffset },
];

// Updated yellow ball positions relative to the new black ball position
const yellowBallPositions = [
  { x: 1030 + xOffset, y: 413 + yOffset },
  { x: 1056 + xOffset, y: 395 + yOffset },
  { x: 1082 + xOffset, y: 445 + yOffset },
  { x: 1110 + xOffset, y: 370 + yOffset },
  { x: 1110 + xOffset, y: 433 + yOffset },
  { x: 1140 + xOffset, y: 413 + yOffset },
  { x: 1140 + xOffset, y: 476 + yOffset },
];


  const whiteBall = createBall(sprites.ball, initialBallX, initialBallY);
  // Create red balls
  redBallPositions.forEach((pos) => createBall(sprites.redBall, pos.x, pos.y));
  // Create yellow balls
  yellowBallPositions.forEach((pos) =>
    createBall(sprites.yellowBall, pos.x, pos.y)
  );
  // Create black ball
  createBall(sprites.blackBall, blackBallPosition.x, blackBallPosition.y);

  const whiteBallRadius = whiteBall.width() / 2;
  const cueStickLength = stage.width() * 0.5;

  const cueStick = new Konva.Image({
    x: whiteBall.x() - 25,
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

  window.addEventListener("resize", () => {
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Calculate scale ratios based on initial dimensions
    const scaleX = width / initialWidth;
    const scaleY = height / initialHeight;

    // Adjust stage and background
    stage.width(width);
    stage.height(height);
    tableImage.width(width);
    tableImage.height(height);

    // Update white ball position based on scaling ratio
    whiteBall.position({ x: initialBallX * scaleX, y: initialBallY * scaleY });
    whiteBall.width(whiteBallRadius * 2 * scaleX); // Scale radius as well
    whiteBall.height(whiteBallRadius * 2 * scaleY);

    // Update cue stick position based on new white ball position
    cueStick.width(stage.width() * 0.5);
    cueStick.position({
      x: whiteBall.x() - 25,
      y: whiteBall.y(),
    });

    layer.batchDraw();
  });

  /// Define an orbit radius that’s slightly larger than the white ball's radius to avoid overlap
  const bufferDistance = whiteBallRadius + -140; // 10px buffer to keep tip outside white ball
  const adjustedOrbitRadius = bufferDistance + cueStickLength * 0.1; // Adjust as needed

  // Helper function to position cue stick around white ball
  function positionCueStick(angle) {
    // Calculate the butt position based on the adjusted orbit radius
    const cueStickButtX = whiteBall.x() + adjustedOrbitRadius * Math.cos(angle);
    const cueStickButtY = whiteBall.y() + adjustedOrbitRadius * Math.sin(angle);

    // Update cue stick's position and rotation
    cueStick.position({ x: cueStickButtX, y: cueStickButtY });
    cueStick.rotation((angle * 180) / Math.PI); // Convert radians to degrees
    layer.batchDraw();
  }

  // Mousemove event for cue stick rotation around white ball
  stage.on("mousemove", (e) => {
    const pointerPosition = stage.getPointerPosition();
    console.log(pointerPosition);
    if (pointerPosition) {
      const dx = pointerPosition.x - whiteBall.x();
      const dy = pointerPosition.y - whiteBall.y();
      const angle = Math.atan2(dy, dx);
      positionCueStick(angle); // Update cue stick position relative to white ball
    }
  });

  let power = 0; // Persistent power value
  let accumulatingPower = false; // Flag to determine if we are currently accumulating power
  let cueStickOrigin = cueStick.position(); // Store the initial position of the cue stick

  // Function to visually represent increasing power by pulling the cue stick back
  function increasePower() {
    if (accumulatingPower) {
      power += 2; // Increment power while mouse is down

      // Adjust cue stick position to visually represent pulling back
      const newCueStickX =
        cueStickOrigin.x -
        power * Math.cos((cueStick.rotation() * Math.PI) / 180);
      const newCueStickY =
        cueStickOrigin.y -
        power * Math.sin((cueStick.rotation() * Math.PI) / 180);
      cueStick.position({ x: newCueStickX, y: newCueStickY });

      // Log current power and cue stick position for debugging
      console.log("Power:", power, "Cue Stick Position:", cueStick.position());

      // Keep increasing power using requestAnimationFrame
      requestAnimationFrame(increasePower);
    }
  }

  // Start accumulating power on mousedown
  stage.on("mousedown", (e) => {
    if (e.evt.button === 0) {
      // Only act if the left mouse button is pressed
      accumulatingPower = true; // Set the flag to true
      cueStickOrigin = cueStick.position(); // Capture the cue stick's starting position
      increasePower(); // Start pulling the cue stick back
    }
  });

  // Release and shoot on mouseup
  stage.on("mouseup", (e) => {
    if (e.evt.button === 0 && accumulatingPower) {
      accumulatingPower = false; // Stop accumulating power

      // Use the current power to calculate the white ball's velocity
      const angle = cueStick.rotation() * (Math.PI / 180);
      whiteBall.velocity = new Vector2(
        Math.cos(angle),
        Math.sin(angle)
      ).multiply(power);

      // Reset power and cue stick position after shooting
      power = 0;
      cueStick.position(cueStickOrigin); // Reset cue stick to its original position
      console.log("Shot fired with power:", power);
    }
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
