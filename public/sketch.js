let fireworks = [];
let lastFireworkTime = 0;  // Time when the last firework was triggered
let cooldown = 500;  // Cooldown period in milliseconds (2 seconds)
let remainingCooldown = 0;  // Remaining time for cooldown

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  background(0);
  socket = io.connect("https://fireworks-app.onrender.com/");  
  socket.on("firework", (data) => {
    fireworks.push(new Firework(data.x * windowWidth, data.y * windowHeight)); 
  });
  lastFireworkTime = -2000
}

function draw() {
  background(0, 0.1); // fade trails slowly

  // Update the cooldown timer
  let currentTime = millis();
  if (currentTime - lastFireworkTime < cooldown) {
    remainingCooldown = cooldown - (currentTime - lastFireworkTime);
  } else {
    remainingCooldown = 0;
  }

  // Show the cooldown timer
  displayCooldown(remainingCooldown);

  // Update and show fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (remainingCooldown <= 0) {
    socket.emit("firework", { x: mouseX / windowWidth, y: mouseY / windowHeight });
    fireworks.push(new Firework(mouseX, mouseY));
    lastFireworkTime = millis();  // Reset the timer
  }
}

function displayCooldown(timeLeft) {
  // Display the remaining cooldown in the center-bottom of the screen
  textAlign(CENTER, CENTER);
  textSize(64);
  noStroke()
  fill(20, 0.3);  // Light gray with small opacity
  text(Math.ceil(timeLeft / 1000), width / 2, height - 50);  // Display seconds
}

class Firework {
  constructor(targetX, targetY) {
    this.target = createVector(targetX, targetY);
    this.pos = createVector(random(width), height);
    this.vel = p5.Vector.sub(this.target, this.pos);
    this.vel.setMag(8);
    this.exploded = false;
    this.particles = [];
    this.hue = random(360);
  }

  update() {
    if (!this.exploded) {
      this.pos.add(this.vel);
      if (p5.Vector.dist(this.pos, this.target) < 10) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let p of this.particles) {
      p.update();
    }
    this.particles = this.particles.filter(p => !p.finished());
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      this.particles.push(new Particle(this.pos.x, this.pos.y, this.hue));
    }
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  show() {
    if (!this.exploded) {
      stroke(this.hue, 255, 255);
      strokeWeight(4);
      point(this.pos.x, this.pos.y);
    }

    for (let p of this.particles) {
      p.show();
    }
  }
}

class Particle {
  constructor(x, y, hue) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(2, 8));
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.hue = hue;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.applyForce(createVector(0, 0.1)); // gravity
    this.vel.mult(0.9); // air resistance
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifespan -= 4;
  }

  finished() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);
    stroke(this.hue, 255, 255, this.lifespan);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }
}
