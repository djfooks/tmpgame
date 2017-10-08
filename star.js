
function Star(gameSpace)
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

Star.prototype.update = function(gameSpace, gameTime, deltaTime)
{
    this.pos[0] -= deltaTime * Star.speed;
    if (this.pos[0] < -10)
    {
        this.pos = [gameSpace[0] + Math.random() * 30,
                    Math.random() * gameSpace[1]];
    }
};
