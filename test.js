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
c.width = window.innerWidth - 15;
c.height = window.innerHeight + 30;
c.style.width = c.width + "px";
c.style.height = c.height + "px";
var ctx = c.getContext("2d");
var startTime = Date.now() * 0.001;
var lastTargetSpawn = 0;
var deltaTime = 0;
var gameTime = 0;
var lastGameTime = 0;
var bullets = [];
var targets = [];
var player = {
    pos: [75, 0],
    angleSpeed: 1
};
var loop = function ()
{
    gameTime = Date.now() * 0.001 - startTime;
    deltaTime = gameTime - lastGameTime;
    lastGameTime = gameTime;
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    player.pos[1] = 120 + Math.sin(gameTime * player.angleSpeed) * 100;
    ctx.arc(player.pos[0], player.pos[1], 5, 0, 2 * Math.PI);
    ctx.stroke();
    
    if (targets.length === 0 && gameTime > lastTargetSpawn + Target.newTargetPeriod)
    {
        targets.push(new Target());
        lastTargetSpawn = gameTime;
    }
    
    var i;
    var pos;
    var bullet;
    for (i = 0; i < bullets.length; i += 1)
    {
        bullet = bullets[i];
        bullet.update(gameTime);
        pos = bullet.pos;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], Bullet.radius, 0, 2 * Math.PI);
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
        
        for (j = 0; j < bullets.length; j += 1)
        {
            bullet = bullets[j];
            var dx = bullet.pos[0] - pos[0];
            var dy = bullet.pos[1] - pos[1];
            var length = Math.sqrt(dx * dx + dy * dy);
            if (length < Target.radius + Bullet.radius)
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
    this.stateStart = gameTime;
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
Target.newTargetPeriod = 5;
Target.health = 10;
Target.waitTime = 2;
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
};

function Bullet(start, target)
{
    this.start = [start[0], start[1]];
    this.target = target;
    this.pos = [start[0], start[1]];
    var dx = target[0] - start[0];
    var dy = target[1] - start[1];
    var length = Math.sqrt(dx * dx + dy * dy);
    if (length < 0.1)
    {
        this.dir = [0, 0];
    }
    else
    {
        this.dir = [dx / length, dy / length];
    }
    this.startTime = gameTime;
}

Bullet.radius = 3;
Bullet.speed = 200;
Bullet.prototype.update = function(gameTime)
{
    var delta = gameTime - this.startTime;
    this.pos = [this.start[0] + this.dir[0] * delta * Bullet.speed,
                this.start[1] + this.dir[1] * delta * Bullet.speed];
};


c.addEventListener("touchstart", function (e)
{
    e.preventDefault();
    var mousePos = getTouchPos(c, e);
    bullets.push(new Bullet(player.pos, mousePos));
}, false);

function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return [
    touchEvent.touches[0].clientX - rect.left,
    touchEvent.touches[0].clientY - rect.top
  ];
}