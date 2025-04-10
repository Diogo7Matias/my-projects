const fs = require('fs');
const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function json2csv(data){
    const lines = data.split('\n');
    let csvLines = []

    for (const line of lines){
        csvLines.push(parseLine(line));
    }
    return csvLines.join('\n');
}

function parseLine(line){
    let csvContent = ""
    switch (line[0]){
        case '{': { // Objects
            let index = { value: 1};
            let obj = {}

            if (line.length < 3){
                console.log("Error: Invalid JSON line.");
                return;
            }
            if (isWhitespace(line[1]) && line[2] === '}'){
                // empty object
                // * do something *
            }
            parseObjectMember(obj, index);

            // keeps reading more members until we reach the end
            while (line[index] !== '}'){
                if (line[index] !== ','){
                    console.log("Error: Invalid JSON line.");
                    return;
                }
                parseObjectMember(obj, ++index);
            }

            // converts the object to csv lines
            let keysLine = '', valuesLine = ''
            for (const key in obj){
                keysLine += key;
                valuesLine += obj[key].toString();
            }
            csvContent = keysLine + '\n' + valuesLine;
            break;
        }
        case '[': { // Arrays
            let index = { value: 1};

            if (line.length < 3){
                console.log("Error: Invalid JSON line.");
                return;
            }
            if (isWhitespace(line[1]) && line[2] === ']'){
                // empty array
                // * do something *
            }

            // * HANDLE VALUE *

            // keeps reading items until we reach the end
            while (line[index] !== '}'){
                if (line[index] !== ','){
                    console.log("Error: Invalid JSON line.");
                    return;
                }
                // * HANDLE VALUE *
            }
        }
        default:
            console.log("Error: Invalid JSON line.");
            return;
    }
    return csvContent;
}

function parseObjectMember(obj, index){
    let str = '', val;
    if (!isWhitespace(line[index++])){
        console.log("Error: Invalid JSON line.");
        return;
    }

    // read a string until we find whitespace
    while (!isWhitespace(line[index])) str += line[index++];
    index++;
    
    if (!isValidString(str)){
        console.log("Error: Invalid JSON line.");
        return;
    }
    if (line[index++] !== ':'){
        console.log("Error: Invalid JSON line.");
        return;
    }

    // * HANDLE VALUE * (recursively?)

    obj[str] = val;
}

function isValidString(str){
    if (str.length < 2) return false;
    if (str[0] !== '"') return false;
    if (str[1] === '"' && str.length == 2) return true;

    let i, hex = 0;
    let escapeChar = false;
    for (i = 1; i < str.length; i++){
        if (escapeChar){
            if (!(str[i] in ['"','\\', '/', 'b', 'f', 'n', 'r', 't', 'u'])) return false;
            if (str[i] === 'u') hex = 1;
            escapeChar = false;
            continue;
        }
        if (hex > 0){
            if (!(str[i] in hexChars)) return false;
            hex = (hex + 1) % 5; // back to zero after it reaches 4
            continue;
        }
        if (str[i] === "\\") escapeChar = true; continue;
    }
    if (str[--i] !== "\"") return false;
    return true;
}

function isWhitespace(char){
    // reminder: whitespace can be more than one character long
}

function main(){
    const jsonData = fs.readFileSync("input.json", "utf8");
    csvData = json2csv(jsonData);
    fs.writeFile("output.csv", csvData);
}

main();
