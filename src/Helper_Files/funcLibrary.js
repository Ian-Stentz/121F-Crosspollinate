function randRange(min, max){
    const dif = max - min;
    return(min + (Math.random() * dif));
}

//inclusive min and max
function randIntRange(min, max) {
    return Math.floor(randRange(min, max + 1));
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

//TODO : Replace below
function cropToNumber(cropName) {
    switch (cropName) {
        case "wheat":
            return 0;
        case "brambleberry":
            return 1;
        case "gilderberry":
            return 2;
        default:
            return -1;
    }
}

function numberToCrop(number) {
    switch(number) {
        case 0:
            return "wheat";
        case 1:
            return "brambleberry";
        case 2:
            return "gilderberry";
        default:
            return "";
    }
}

function createButton(icon, callback) {
    const button = document.createElement("button");
    button.addEventListener("click", callback);
    button.innerHTML = icon;
    buttonShelf.append(button);
}