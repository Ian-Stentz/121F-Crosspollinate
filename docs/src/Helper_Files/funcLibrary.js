function randRange(min, max){
    const dif = max - min;
    return(min + (Math.random() * dif));
}

function roundToDec(num, dec){
    const e = 10 ** dec;
    return(Math.round(num*e)/e)
}

function cellDistManhattan(c1, c2){
    return(Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]));
}

function cellDistOctal(c1, c2){
    return(Math.max(Math.abs(c1[0] - c2[0]), Math.abs(c1[1] - c2[1])));
}