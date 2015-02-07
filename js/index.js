var console = document.getElementById("console");
var container = document.getElementById("Container");
var htmlSvg = document.getElementById("svg");
var opacityHTML = document.getElementById("OpacitySlide");
var sizeHTML = document.getElementById("PenSize");
var paletteHTML = document.getElementById("Palette");
var layersHTML = document.getElementById("Layers");
var currLayText = document.getElementById("currentLayer");
var layerGroups = document.getElementsByTagName("g");
var layerButtons = document.getElementsByClassName("layerButton");
var undoHTML = document.getElementById("Undo");

htmlSvg.addEventListener("mousedown", makePath, false);
htmlSvg.addEventListener("mouseup", stopPath, false);
htmlSvg.addEventListener("mousemove", drawPath, false);

Palette.addEventListener("click", selectColour, false);
layersHTML.addEventListener("click", layerHandler, false);
undoHTML.addEventListener("click", undoHandler, false);

//newPath array to hold Paths
var newPath =[];
var newPathLock = 0;
var ticktoggle = 0;
var xmlns = "http://www.w3.org/2000/svg";
var currentColour = "rgb(0,0,0)";
var currentLayer = 1; 

//start a new path
function makePath(e){
    var opacity = opacityHTML.value/10;
    var size = sizeHTML.value;
    if (newPathLock == 0){
        var mouseX = e.clientX - container.offsetLeft;
        var mouseY = e.clientY - container.offsetTop;
        var newLine = document.createElementNS(xmlns,"path");
        newLine.setAttributeNS(null,"style",'stroke:' + currentColour + ';stroke-width:'+ size +';stroke-linecap:round;stroke-opacity:'+ opacity +'; fill:none; stroke-linejoin: round;');
        newLine.updatedLine = "M" + mouseX + " " + mouseY;
        newLine.layer = currentLayer;
        newLine.setAttributeNS(null,"d",newLine.updatedLine);
        newPath.push(newLine);

        newPathLock =1;
        drawPath(e);
    }
}


//Allow for a new path to start
function stopPath(){
    newPathLock =0;
}


//draw path
function drawPath(e){
    var mouseX = e.clientX - container.offsetLeft;
    var mouseY = e.clientY - container.offsetTop;

    //Ticktoggle allows for line updates/recording every 20 miliseconds
    //Only run this statement if were still drawing a line
    if(ticktoggle == 0 && newPathLock == 1){
        function recordCoords(){
            if(ticktoggle == 1){ticktoggle = 0;}
        }
        setTimeout(recordCoords,20);
        //Fetch the last entry in the newPath array as we are still drawing the line.
        var lastPath = newPath[newPath.length-1];
        if (lastPath){
            lastPath.updatedLine += " L " + mouseX + " " + mouseY;
            lastPath.setAttributeNS(null,"d",lastPath.updatedLine);
            //add new line to current "g" layer
            layerGroups[currentLayer].appendChild(lastPath);
        }
        ticktoggle = 1; //prevent record of coords until next 20 miliseconds
    }
}

function selectColour(e){
    currentColour = e.target.style.backgroundColor;
}

//selecting layers to make them the current layer
function layerHandler(e){
    var RXP_Lyr = /SetL/; //regexp pattern to look for "SetL"
    var RXP_lyrNum = /\d+/; //regexp pattern to extract the number from layer ID
    var RXP_Togg = /Toggle/; //regexp pattern to look for "Toggle"

    if(RXP_Lyr.test(e.target.id)){
        currentLayer = RXP_lyrNum.exec(e.target.id)[0]; 
        resetLayerBtns();
        e.target.className = "layerButton currentLayer";
    }  

    currLayText.innerHTML = currentLayer; //update current layer text

    if(RXP_Togg.test(e.target.id)){ //if clicked on a layer visibility toggle button
        //toggle eye icon
        //new class toggle function should be used here
        if(e.target.className.search("lyrVisible") >= 0 ){
            e.target.className = "layerVisButton";
        }
        else{e.target.className = "layerVisButton lyrVisible";}

        var lyrNum = RXP_lyrNum.exec(e.target.id)[0];
        toggleLayer(lyrNum);
    }
}

//On new current layer selection, remove "currentLayer" class from all layer buttons
function resetLayerBtns(){
    for(var i=0; i<layerButtons.length; i++){
        layerButtons[i].className = "layerButton";
    }
}

function toggleLayer(layer,lyrClass){
    if(layerGroups[layer].getAttributeNS(null,"visibility") == 'hidden'){
        layerGroups[layer].setAttributeNS(null,"visibility",'visible');
    }
    else{
        layerGroups[layer].setAttributeNS(null,"visibility",'hidden');
    }
}

//undo
function undoHandler(){
    if(newPath.length > 0){
        var lastPathRef = newPath[newPath.length-1]; 
        newPath.splice(newPath.length-1,1); 
        if(lastPathRef.parentElement){
            lastPathRef.parentElement.removeChild(lastPathRef.parentElement.lastChild);
        }//IE supports parentNode, not parentElement on SVG.
        else{lastPathRef.parentNode.removeChild(lastPathRef.parentNode.lastChild);}
    }
}

