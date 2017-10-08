
function Bullet(start, target, gameTime)
{
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

    this.particles = [];
}

Bullet.size = 20;
Bullet.speed = 200;
Bullet.numParticles = 100;
Bullet.prototype.update = function(gameSpace, gameTime, deltaTime)
{
    var p0 = this.p0;
    this.p0 = [p0[0] + this.dir[0] * deltaTime * Bullet.speed,
               p0[1] + this.dir[1] * deltaTime * Bullet.speed];
    var dir = this.dir;
    this.p1 = [p0[0] - dir[0] * Bullet.size,
               p0[1] - dir[1] * Bullet.size];

    if (p0[0] + Bullet.size < 0 ||
        p0[0] - Bullet.size > gameSpace[0] ||
        p0[1] + Bullet.size < 0 ||
        p0[1] - Bullet.size > gameSpace[1])
    {
        this.complete = true;
    }

    var particles = this.particles;
    if (particles.length < Bullet.numParticles)
    {
        particles.push(new BulletParticle(this, gameTime));
    }

    var i;
    for (i = 0; i < particles.length; i += 1)
    {
        particles[i].update(gameTime, deltaTime);
        if (particles[i].complete)
        {
            if (particles.length > 0)
            {
                particles[i] = particles[particles.length - 1];
                i -= 1;
            }
            particles.pop();
        }
    }
};

function BulletParticle(bullet, gameTime)
{
    this.bullet = bullet;
    var lerp = Math.random();
    var p0 = this.p0 = [bullet.p0[0] * lerp + bullet.p1[0] * (1.0 - lerp),
                        bullet.p0[1] * lerp + bullet.p1[1] * (1.0 - lerp)];

    this.startTime = gameTime;
    var noiseX = Math.random() * BulletParticle.noiseX;
    var noiseY = (Math.random() - 0.5) * BulletParticle.noiseY;
    this.dir = [bullet.dir[0] * (BulletParticle.speed + noiseX) - bullet.dir[1] * noiseY,
                bullet.dir[1] * (BulletParticle.speed + noiseX) + bullet.dir[0] * noiseY];

    this.p1 = [p0[0] - this.dir[0] * Bullet.size,
               p0[1] - this.dir[1] * Bullet.size];
    this.alpha = 1.0;
    this.complete = false;
}

BulletParticle.prototype.update = function(gameTime, deltaTime)
{
    var dir = this.dir;
    var ratio = 1.0 - ((gameTime - this.startTime) / BulletParticle.drag);
    var newDir = [dir[0] * ratio, dir[1] * ratio];
    var p0 = this.p0;
    this.p0 = [p0[0] + newDir[0] * deltaTime * Bullet.speed,
               p0[1] + newDir[1] * deltaTime * Bullet.speed];

    var bulletTip = this.bullet.p0;
    var d0 = bulletTip[0] - p0[0];
    var d1 = bulletTip[1] - p0[1];
    var length = Math.sqrt(d0 * d0 + d1 * d1);
    this.p1 = [p0[0] - d0 / length * BulletParticle.size,
               p0[1] - d1 / length * BulletParticle.size];

    var life = 1.0 - ((gameTime - this.startTime) / BulletParticle.lifeTime);
    this.alpha = life;
    if (life <= 0.0)
    {
        this.complete = true;
    }
}

BulletParticle.speed = 0.9;
BulletParticle.noiseX = 0.1;
BulletParticle.noiseY = 0.2;
BulletParticle.lifeTime = 0.8;
BulletParticle.drag = 1.0;
BulletParticle.size = 4;
