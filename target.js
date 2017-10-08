
function Target(gameSpace)
{
    var y = Math.random() * (gameSpace[1] - 20) + 10;
    this.state = Target.states.WAIT;
    this.stateStart = 0;
    this.pos = [gameSpace[0] + Target.radius, y];
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

Target.prototype.update = function (gameSpace, gameTime, deltaTime)
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
