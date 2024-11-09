const topLeft = document.getElementById("topLeft");
const topRight = document.getElementById("topRight");
const bottomLeft = document.getElementById("bottomLeft");
const bottomRight = document.getElementById("bottomRight");
const inputBoxes = document.getElementsByTagName("input");
const allCorners = document.getElementById("allCorners");
const box = document.getElementById("box");

// make input text be selected on click
for (let i = 0; i < inputBoxes.length; i++){
    if (inputBoxes[i].type != "text")
        continue;

    inputBoxes[i].addEventListener('click', function() {
        this.select();
    });

    inputBoxes[i].addEventListener('input', function() {
        let maxValue = 10;
        
        // remove non numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value == '')
            this.value = '0';
        
        if (inputBoxes[i].classList.contains("cornerInput"))
            maxValue = 100;
        // Enforce a maximum value
        if (parseInt(this.value) > maxValue)
            this.value = maxValue.toString();

        // remove leading 0
        if (this.value.length > 1 && this.value[0] == '0')
            this.value = this.value.slice(1);
    });
}

topLeft.addEventListener('input', function () {
    box.style.borderTopLeftRadius = this.value + "%";
});

topRight.addEventListener('input', function () {
    box.style.borderTopRightRadius = this.value + "%";
});

bottomLeft.addEventListener('input', function () {
    box.style.borderBottomLeftRadius = this.value + "%";
});

bottomRight.addEventListener('input', function () {
    box.style.borderBottomRightRadius = this.value + "%";
});

allCorners.addEventListener('input', function () {
    box.style.borderRadius = this.value + "%";
    topLeft.value = this.value;
    topRight.value = this.value;
    bottomLeft.value = this.value;
    bottomRight.value = this.value;
});

document.getElementById("borderThickness").addEventListener('input', function() {
    box.style.borderWidth = this.value + "px";
}); 

document.getElementById("boxColor").addEventListener('input', function() {
    box.style.backgroundColor = this.value;
});

document.getElementById("borderColor").addEventListener('input', function() {
    box.style.borderColor = this.value;
});

document.getElementById("BackgroundColor").addEventListener('input', function() {
    document.body.style.backgroundColor = this.value;
});