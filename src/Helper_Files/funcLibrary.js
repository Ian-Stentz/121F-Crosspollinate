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
        case "pond":
            return 0;
        case "wheat":
            return 1;
        case "brambleberry":
            return 2;
        case "carrot":
            return 3;
        case "gilderberry":
            return 4;
        default:
            return -1;
    }
}

function numberToCrop(number) {
    switch(number) {
        case 0:
            return "pond";
        case 1:
            return "wheat";
        case 2:
            return "brambleberry";
        case 3:
            return "carrot";
        case 4:
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