
function Bullet(start, target, gameTime)
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
    this.complete = false;
}

Bullet.size = 20;
Bullet.speed = 200;
Bullet.prototype.update = function(gameSpace, gameTime)
{
    var delta = gameTime - this.startTime;
    this.p0 = [this.start[0] + this.dir[0] * delta * Bullet.speed,
               this.start[1] + this.dir[1] * delta * Bullet.speed];
    var p0 = this.p0;
    var dir = this.dir;
    this.p1 = [p0[0] - dir[0] * Bullet.size,
               p0[1] - dir[1] * Bullet.size];

    if (p0[0] - Bullet.size < 0 ||
        p0[0] + Bullet.size > gameSpace[0] ||
        p0[1] - Bullet.size < 0 ||
        p0[1] + Bullet.size > gameSpace[1])
    {
        this.complete = true;
    }
};
