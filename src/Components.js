function evaluate(functionEquation, x) {
    const app = window.mainDisplay;

    //console.log("Function value evaluated");

    if(functionEquation.search('x') === -1) {
        return "";
    }

    let x_substituted = functionEquation.replace(/x/g, "(" + x[0] + ")");
    
    if(x.length === 2) {
        x_substituted = x_substituted.replace(/y/g, "(" + x[1] + ")");
    }

    let result = app.evalCommandCAS("Numeric(" + x_substituted + ", 50)");

    if (result === '?' || result === "") {
        return "";
    } else {
        return parseFloat(result);
    }
}

function randomNumberInRange(minimum, maximum) {
    // console.log("Random number generated");

    return minimum + Math.random() * (maximum - minimum);
}

// https://stackoverflow.com/a/35599181
function gaussianRandom(mean, stdev) {
    var y2;
    var use_last = false;
    var y1;
    if (use_last) {
        y1 = y2;
        use_last = false;
    } else {
        var x1, x2, w;
        do {
            x1 = 2.0 * Math.random() - 1.0;
            x2 = 2.0 * Math.random() - 1.0;
            w = x1 * x1 + x2 * x2;
        } while (w >= 1.0);
        w = Math.sqrt((-2.0 * Math.log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        use_last = true;
    }

    var retval = mean + stdev * y1;
    if (retval > 0)
        return retval;
    return -retval;
}


function addPoints(functionEquation, values) {
    const app = window.mainDisplay;

    let labels = [];

    for (let i = 0; i < values.length; ++i) {
        const label = app.evalCommandGetLabels("(" + values[i].join() + "," + evaluate(functionEquation, values[i].slice(0, values[i].length)) + ")");
        labels.push(label);
    }

    return labels;
}

function removePoints(labels) {
    const app = window.mainDisplay;

    for (let i = 0; i < labels.length; ++i) {
        app.deleteObject(labels[i])
    }
}

export { evaluate, randomNumberInRange, gaussianRandom, addPoints, removePoints };