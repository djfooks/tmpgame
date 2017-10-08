/* globals Helpers */
/* globals Player */

function App()
{
    var canvas = this.canvas = document.getElementById("myCanvas");
    canvas.width = Math.min(1200, window.screen.availWidth - 15);
    canvas.height = Math.min(700, window.screen.availHeight - 15);
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";

    this.goFullscreen = false;

    var gameSpace = this.gameSpace = [canvas.width, canvas.height];

    //canvas.globalCompositeOperation = "lighter";
    var ctx = this.ctx = canvas.getContext("2d");
    this.startTime = Date.now() * 0.001;
    this.lastTargetSpawn = 0.0;
    this.gameTime = 0.0;
    this.lastGameTime = 0.0;
    this.bullets = [];
    this.targets = [];
    this.gameDebug = "";

    this.player = new Player(gameSpace, this.gameTime);

    var stars = this.stars = [];
    var i;
    for (i = 0; i < Star.numStars; i += 1)
    {
        stars.push(new Star(this.gameSpace));
    }

    canvas.addEventListener("mousedown", this.onMouse.bind(this), false);

    requestAnimationFrame(this.loop.bind(this));
}

App.prototype.loop = function ()
{
    var gameTime = this.gameTime = Date.now() * 0.001 - this.startTime;
    var deltaTime = this.deltaTime = gameTime - this.lastGameTime;
    if (this.deltaTime > 0.4)
    {
        this.deltaTime = 0.4;
    }
    this.lastGameTime = gameTime;
    requestAnimationFrame(this.loop.bind(this));

    this.player.update(gameTime);

    var canvas = this.canvas;
    var ctx = this.ctx;
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";

    var i;
    var j;
    var pos;
    var p0;
    var p1;
    var p2;
    var p3;
    var dir;
    var bullet;
    var gameSpace = this.gameSpace;
    var player = this.player;
    var bullets = this.bullets;
    var targets = this.targets;
    var stars = this.stars;
    for (i = 0; i < stars.length; i += 1)
    {
        stars[i].update(gameSpace, gameTime, deltaTime);
        pos = stars[i].pos;
        dir = stars[i].dir;

        p0 = [pos[0] - dir[0] * Star.size,
              pos[1] - dir[1] * Star.size];
        p1 = [pos[0] + dir[0] * Star.size,
              pos[1] + dir[1] * Star.size];

        dir = [dir[1], -dir[0]];
        p2 = [pos[0] - dir[0] * Star.size,
              pos[1] - dir[1] * Star.size];
        p3 = [pos[0] + dir[0] * Star.size,
              pos[1] + dir[1] * Star.size];

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.moveTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.stroke();
    }

    if (this.gameDebug.length > 0)
    {
        ctx.fillStyle = "white";
        ctx.fillText(this.gameDebug, 10, 50);
    }

    ctx.beginPath();
    ctx.arc(player.pos[0], player.pos[1], 5, 0, 2 * Math.PI);
    ctx.fillStyle = player.getColor();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(canvas.width - 1, 1);
    ctx.lineTo(canvas.width - 1, canvas.height - 1);
    ctx.lineTo(1, canvas.height - 1);
    ctx.lineTo(1, 1);
    ctx.stroke();

    if (/*targets.length === 0 && */gameTime > this.lastTargetSpawn + Target.newTargetPeriod)
    {
        targets.push(new Target(gameSpace));
        this.lastTargetSpawn = gameTime;
    }

    for (i = 0; i < bullets.length; i += 1)
    {
        bullet = bullets[i];
        bullet.update(gameSpace, gameTime, deltaTime);

        var particles = bullet.particles;
        for (j = 0; j < particles.length; j += 1)
        {
            p0 = particles[j].p0;
            p1 = particles[j].p1;
            ctx.beginPath();
            ctx.moveTo(p0[0], p0[1]);
            ctx.lineTo(p1[0], p1[1]);
            ctx.strokeStyle = "rgba(255, 255, 255, " + particles[j].alpha + ")";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.stroke();
        }

        p0 = bullet.p0;
        p1 = bullet.p1;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(p0[0], p0[1], 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(p0[0], p0[1], 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(p1[0], p1[1], 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(p1[0], p1[1], 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (bullet.complete)
        {
            if (bullets.length > 0)
            {
                bullets[i] = bullets[bullets.length - 1];
                i -= 1;
            }
            bullets.pop();
        }
    }

    ctx.strokeStyle = "#FFFFFF";
    for (i = 0; i < targets.length; i += 1)
    {
        var target = targets[i];
        target.update(gameSpace, gameTime, deltaTime);
        pos = target.pos;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], Target.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], Target.radius - 2, 0, 2 * Math.PI);
        ctx.fill();

        for (j = 0; j < bullets.length; j += 1)
        {
            bullet = bullets[j];
            if (Helpers.inteceptCircleLineSeg(pos, Target.radius, bullet.p0, bullet.p1))
            {
                if (targets.length > 0)
                {
                    targets[i] = targets[targets.length - 1];
                    i -= 1;
                }
                targets.pop();
                break;
            }
        }
    }
};

App.prototype.enableFullscreen = function enableFullscreen()
{
    if (this.goFullscreen)
    {
        this.canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
};

App.prototype.onMouse = function onMouse(e)
{
    this.enableFullscreen();
    e.preventDefault();
    var mousePos = this.getMousePos(e);
    if (this.player.fire(this.gameTime))
    {
        this.bullets.push(new Bullet(this.player.pos, mousePos, this.gameTime));
    }
};

App.prototype.getMousePos = function getMousePos(event)
{
    var rect = this.canvas.getBoundingClientRect();
    return [event.clientX - rect.left,
            event.clientY - rect.top];
};

var app = new App();
