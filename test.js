/* globals Helpers */

var debugMsg = "";

function onError(message, source, lineno/*, colno, error*/)
{
    debugInfo("Error: " + source + ":" + lineno + " " + message);
}
window.onerror = onError;

function debugInfo(str)
{
    debugMsg += str + "<br>";
    document.getElementById("debugText").innerHTML = debugMsg;
}

var c = document.getElementById("myCanvas");
c.width = window.screen.availWidth - 15;//600;//window.innerWidth - 15;
c.height = window.screen.availHeight - 15;//300;//window.innerHeight + 30;
c.style.width = c.width + "px";
c.style.height = c.height + "px";

var gameSpace = [c.width, c.height];

var ctx = c.getContext("2d");
var startTime = Date.now() * 0.001;
var lastTargetSpawn = 0;
var deltaTime = 0;
var gameTime = 0;
var lastGameTime = 0;
var bullets = [];
var targets = [];
var stars = [];
var gameDebug = "";

var FireState = {
    READY: 1,
    CHAMBERING: 2,
};

function Player()
{
    this.pos = [75, Math.floor(gameSpace[1] * 0.5)];
    this.fireState = FireState.READY;
    this.stateStart = gameTime;
}
Player.chamberingPeriod = 1;

Player.prototype.fire = function (gameTime)
{
    if (this.fireState === FireState.READY)
    {
        this.fireState = FireState.CHAMBERING;
        this.stateStart = gameTime;
        return true;
    }
    return false;
};

Player.prototype.getColor = function ()
{
    if (this.fireState === FireState.READY)
    {
        return "white";
    }
    return "red";
};

Player.prototype.update = function (gameTime)
{
    var stateTime = gameTime - this.stateStart;
    if (this.fireState === FireState.READY)
    {
        return;
    }

    if (stateTime > Player.chamberingPeriod)
    {
        this.fireState = FireState.READY;
    }
};

var player = new Player();

function Star()
{
    this.pos = [Math.random() * gameSpace[0],
                Math.random() * gameSpace[1]];
    var dir = [Math.random(), Math.random()];
    var length = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
    this.dir = [1, 0];
    if (length > 0.01)
    {
        this.dir = [dir[0] / length, dir[1] / length];
    }
}

Star.speed = 30;
Star.size = 2;
Star.numStars = 30;

Star.prototype.update = function(gameTime, deltaTime)
{
    this.pos[0] -= deltaTime * Star.speed;
    if (this.pos[0] < -10)
    {
        this.pos = [gameSpace[0] + Math.random() * 30,
                    Math.random() * gameSpace[1]];
    }
};

function addStars()
{
    var i;
    for (i = 0; i < Star.numStars; i += 1)
    {
        stars.push(new Star());
    }
}
addStars();

var loop = function ()
{
    gameTime = Date.now() * 0.001 - startTime;
    deltaTime = gameTime - lastGameTime;
    if (deltaTime > 0.4)
    {
        deltaTime = 0.4;
    }
    lastGameTime = gameTime;
    requestAnimationFrame(loop);
    
    player.update(gameTime);
    
    //ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "white";
    
    var i;
    var pos;
    var p0;
    var p1;
    var p2;
    var p3;
    var dir;
    var bullet;
    for (i = 0; i < stars.length; i += 1)
    {    
        stars[i].update(gameTime, deltaTime);
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
    
    
    if (gameDebug.length > 0)
    {
        ctx.fillText(gameDebug, 10, 50);
    }
    
    ctx.beginPath();
    ctx.arc(player.pos[0], player.pos[1], 5, 0, 2 * Math.PI);
    ctx.fillStyle = player.getColor();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(c.width - 1, 1);
    ctx.lineTo(c.width - 1, c.height - 1);
    ctx.lineTo(1, c.height - 1);
    ctx.lineTo(1, 1);
    ctx.stroke();
    
    if (/*targets.length === 0 && */gameTime > lastTargetSpawn + Target.newTargetPeriod)
    {
        targets.push(new Target());
        lastTargetSpawn = gameTime;
    }
    
    for (i = 0; i < bullets.length; i += 1)
    {
        bullet = bullets[i];
        bullet.update(gameTime);
        p0 = bullet.p0;
        p1 = bullet.p1;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
    }
    
    var j;
    for (i = 0; i < targets.length; i += 1)
    {
        var target = targets[i];
        target.update(gameTime, deltaTime);
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
requestAnimationFrame(loop);

function Target()
{
    var y = Math.random() * (c.height - 20) + 10;
    this.state = Target.states.WAIT; 
    this.stateStart = 0;
    this.pos = [c.width + Target.radius, y];
    this.velocity = [0, 0];
    this.dodgeDirection = 0;
}

Target.states = {
    WAIT: 1,
    DODGE: 2
};
Target.speed = 10;
Target.radius = 10;
Target.newTargetPeriod = 3.2;
Target.health = 10;
Target.waitTime = 2.5;
Target.dodgeTime = 0.5;
Target.dodgeSpeed = 100;
Target.dodgeLerp = 0.9;

Target.prototype.update = function (gameTime, deltaTime)
{
    var stateTime = gameTime - this.stateStart;
    var velocity = this.velocity;
    if (this.state === Target.states.WAIT)
    {
        if (stateTime > Target.waitTime)
        {
            this.state = Target.states.DODGE;
            this.stateStart = gameTime;
            stateTime = 0;
            this.dodgeDirection = (Math.random() * 2) - 1;
        }
        this.velocity = [velocity[0] * Target.dodgeLerp,
                         velocity[1] * Target.dodgeLerp];
    }
    
    if (this.state === Target.states.DODGE)
    {
        if (stateTime > Target.dodgeTime)
        {
            this.state = Target.states.WAIT;
            this.stateStart = gameTime;
            stateTime = 0;
        }
        
        var inv = 1 - Target.dodgeLerp;
        this.velocity = [(Target.dodgeSpeed * -inv) + velocity[0] * Target.dodgeLerp,
                         Target.dodgeSpeed * this.dodgeDirection * inv + velocity[1] * Target.dodgeLerp];
    }
    
    var pos = this.pos;
    this.pos = [pos[0] + velocity[0] * deltaTime,
                pos[1] + velocity[1] * deltaTime];
                
    if (this.pos[1] < Target.radius)
    {
        this.pos[1] = Target.radius;
    }
    else if (this.pos[1] > gameSpace[1] - Target.radius)
    {
        this.pos[1] = gameSpace[1] - Target.radius;
    }
};

function Bullet(start, target)
{
    this.startTime = gameTime;
    this.start = [start[0], start[1]];
    this.target = target;
    this.p0 = [start[0], start[1]];
    var dx = target[0] - start[0];
    var dy = target[1] - start[1];
    var length = Math.sqrt(dx * dx + dy * dy);
    var dir = [1, 0];
    if (length > 0.1)
    {
        dir = [dx / length, dy / length];
    }
    this.dir = dir;
    this.p1 = [start[0] - dir[0] * Bullet.size,
               start[1] - dir[1] * Bullet.size];
}

Bullet.size = 20;
Bullet.speed = 200;
Bullet.prototype.update = function(gameTime)
{
    var delta = gameTime - this.startTime;
    this.p0 = [this.start[0] + this.dir[0] * delta * Bullet.speed,
               this.start[1] + this.dir[1] * delta * Bullet.speed];
    var p0 = this.p0;
    var dir = this.dir;     
    this.p1 = [p0[0] - dir[0] * Bullet.size,
               p0[1] - dir[1] * Bullet.size];
};

function enableFullscreen()
{
    c.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
}

function onMouse(e)
{
    enableFullscreen();
    e.preventDefault();
    var mousePos = getMousePos(c, e);
    if (player.fire(gameTime))
    {
        bullets.push(new Bullet(player.pos, mousePos));
    }
}

c.addEventListener("mousedown", onMouse, false);

function getMousePos(canvas, event)
{
    var rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left,
            event.clientY - rect.top];
}




