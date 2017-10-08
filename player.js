
function Player(gameSpace, gameTime)
{
    this.pos = [75, Math.floor(gameSpace[1] * 0.5)];
    this.fireState = FireState.READY;
    this.stateStart = gameTime;
}

var FireState = {
    READY: 1,
    CHAMBERING: 2,
};
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
