var Helpers = {};

Helpers.inteceptCircleLineSeg = function (circle, r, p1, p2)
{
    var v1x = p2[0] - p1[0];
    var v1y = p2[1] - p1[1];
    var v2x = p1[0] - circle[0];
    var v2y = p1[1] - circle[1];
    var b = (v1x * v2x + v1y * v2y);
    var c = 2 * (v1x * v1x + v1y * v1y);
    b *= -2;
    var d = Math.sqrt(b * b - 2 * c * (v2x * v2x + v2y * v2y - r * r));
    if(isNaN(d)){ // no intercept
        return false;//[];
    }
    var u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
    var u2 = (b + d) / c;    
    //retP1 = {};   // return points
    //retP2 = {}  
    //ret = []; // return array
    if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
        //retP1.x = line.p1.x + v1.x * u1;
        //retP1.y = line.p1.y + v1.y * u1;
        //ret[0] = retP1;
        return true;
    }
    if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
        //retP2.x = line.p1.x + v1.x * u2;
        //retP2.y = line.p1.y + v1.y * u2;
        //ret[ret.length] = retP2;
        return true;
    }       
    //return ret;
    return false;
};
