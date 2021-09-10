var maxLength =20;

var groupName =[];
var health =[];
var soil =[];
var date =[];

var save;

var chart = 0;
var editValueIndex;
let defaultColor = '#212B2A';

//window.onload = LocalClear();
window.onload = startup();
//window.onload = graph(0);


function startup(){
    //check for local storage key
    if(typeof(Storage) !== "undefined") {
        if(localStorage.keys == null){
            localStorage.keys = makeKey();
        }
        document.getElementById("key").value = localStorage.keys;
    }
    //check for url link
    url = window.location.href;
    url = url.slice(url.length-7);
    if (url[0] ==="?" && url[1] === "/"){
        url = url.slice(2);
        document.getElementById("key").value = url;
        LoadServerData();
    }
    //if url link not found or url load data not found grab local storage data
    if(save === "Key Not Found" || save == null){
        if (typeof(Storage) !== "undefined") {
            document.getElementById("key").value = localStorage.keys;
            if(localStorage.groups !== "null" && localStorage.date !== "null" && localStorage.soil !== "null" && localStorage.health!== "null"){
                groupName = JSON.parse(localStorage.groups);
                date = JSON.parse(localStorage.date);
                soil = JSON.parse(localStorage.soil);
                health = JSON.parse(localStorage.health);
                
                //update
                pushStatsForSelected();

                //add tabs
                let length = groupName.length -1;
                for(i=0;i<length;i++){
                    if(groupName[i] === "null"){break;}
                    else {addNewSet();}
                }
                //add last water
                lastWater();
            }
            else{
                LocalClear();
            }
        }
    }
}

function storeLocalData() {
    if (typeof(Storage) !== "undefined") {
        if (groupName != null || date != null || health != null || soil != null) {
            localStorage.groups = JSON.stringify(groupName);
            localStorage.date = JSON.stringify(date);
            localStorage.health = JSON.stringify(health);
            localStorage.soil = JSON.stringify(soil);
        } else {
            //localStorage.clickcount = 1; 
        }
        var storedGroups = JSON.parse(localStorage.groups);
        console.log("storedGroups"+storedGroups);
  
    } else {
        document.getElementById("result").innerHTML = "Sorry, your browser does not support web storage...";
    }
}
// if key is same as local key, then save. else load new key data
function LoadOrSave(){
    if (document.getElementById("key").value === localStorage.keys){
        SaveServerData();
    }
    else{
        LoadServerData();
    }
}
function SaveServerData(){
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
          save = this.responseText;
          console.log("*save: " + save);
          
          url = window.location.href + "?/" + document.getElementById("key").value;
          prompt("Copy the URL below for:", url);
      }
    };
    let key = document.getElementById("key").value;
    
    let str = key+":"+ JSON.stringify(groupName)+"@"+JSON.stringify(date)+"@"+JSON.stringify(soil)+"@"+JSON.stringify(health);
    xhttp.open("GET", "write.php?q="+str, true);
    xhttp.send();
}

function LoadServerData(){
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      //document.getElementById("demo").innerHTML =
      if (this.readyState === 4 && this.status === 200) {
          save = this.responseText;
          
          if(save === "key not found"){
              window.alert("Key Not Found");
              console.log("*save: " + save);
          }
          else{
            save.slice(0,5);
            save = save.split('@');

            groupName = JSON.parse(save[0]);
            date = JSON.parse(save[1]);
            soil = JSON.parse(save[2]);
            health = JSON.parse(save[3]);
            console.log("tempGroup: " + groupName[0] + " tempDate: " + date[0] + " tempSoil: " + soil[0] + " tempHealth: " + health[0]);
        }
      }
    };
    let key = document.getElementById("key").value;
    xhttp.open("GET", "read.php?q="+key, true);
    xhttp.send();
}
//make sure key isn't too long length with no "@'s" on key press
function validateKey(){
    var key = document.getElementById("key").value;
    //reduce length
    if(key.length>5){
        key = key.slice(0,5);
    }
    //remove any @'s and space
    key = key.replace("@", "");
    key = key.replace(" ", "");
    console.log("key" + key);
    document.getElementById("key").value = key;
}
//make sure key isn't too short onchange
function validateKeyFill(){
    var key = document.getElementById("key").value;
    //add length
    if(key.length<5){
        let length = key.length;
        var i=0;
        while(i < 5-length){
            key = key +"0";
            i++;
        }
    }
    validateKey();
}
function makeKey(){
    let length = 5;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
function LocalClear(){
    localStorage.groups = null;
    localStorage.date = null;
    localStorage.soil = null;
    localStorage.health = null;
}



//add water data point set for current time
function addStatButton(){
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    healthBox = document.getElementById("healthComboBox");
    soilBox = document.getElementById("soilComboBox");
    
    let currentDate = new Date();
    dateString = currentDate.toJSON();
    
    for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
        if(date[i] === dateString){
            console.log("1i: "+i);
            health[i] = healthBox.value;
            soil[i] = soilBox.value;
            date[i] = dateString;
            break;
        }
        else if(health[i] == null){
            console.log("2i: "+i);
            health[i] = healthBox.value;
            soil[i] = soilBox.value;
            date[i] = dateString;
            break;
        }
        else if(i===buffedIndex + maxLength -1){  //if even the last value is taken
            health.splice(buffedIndex, 1);
            soil.splice(buffedIndex, 1);
            date.splice(buffedIndex, 1);
            
            health.splice(buffedIndex + maxLength -1, 0, healthBox.value);
            soil.splice(buffedIndex + maxLength -1, 0, soilBox.value);
            date.splice(buffedIndex + maxLength -1, 0, dateString);
        }
    }
    console.log("$$date: "+date);
    graph(buffedIndex);
    grabStatsForSelected();
    pushStatsForSelected();
    storeLocalData();
}
//grab groupName value
function grabStatsForSelected(){
    //store stats
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    
    groupName[index] = document.getElementById("group").value;
    storeLocalData();
}
function pushStatsForSelected(){
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    healthBox = document.getElementById("healthComboBox");
    soilBox = document.getElementById("soilComboBox");
    
    console.log("index: "+ index);
    //title
    if(groupName !=null){
        document.getElementById("group").value = groupName[index];
    }
    else{
        document.getElementById("group").value = "New Group";
    }
    
    //reset
    healthBox.options[0].selected = true;
    soilBox.options[0].selected = true;
    
    //populate graph 
    for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
        if(health[i] !== null){
            graph(buffedIndex);
        }
    }
    lastWater();
    minMax();
    hideEdit();
}

function highlight(element){
    var selectedButton = document.getElementsByClassName("selected");
    grabStatsForSelected(); //final grab before push
    
    if(selectedButton.length >0){
            selectedButton[0].className = "setsButton button";
        }
    element.className = "selected button";
    pushStatsForSelected();
}

function addNewSet(){
    var totalButtons = document.getElementsByClassName("button");
    var input = document.createElement("button");
    
    input.name = totalButtons.length;
    input.className = "setsButton button";
    input.onclick = function(){
        highlight(input);
    };
    var parent = document.getElementById("contained");
    parent.appendChild(input);
    
    if(groupName[totalButtons.length -1] == null){
        groupName[totalButtons.length -1] = "New Group";
    }
}

function removeSet(){
    var selectedButton = document.getElementsByClassName("selected button");
    var totalButtons = document.getElementsByClassName("button");  
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    if(selectedButton.length ===1  && totalButtons.length >1 && selectedButton[0] !== document.getElementById("firstRounded")){
        selectedButton[0].parentNode.removeChild(selectedButton[0]);
        totalButtons = document.getElementsByClassName("button"); 
        
        for(var i=0; i < (totalButtons.length); i++){
            if(totalButtons[i].name > index){
                totalButtons[i].name = totalButtons[i].name -1;
            }
            if(totalButtons[i].name == (index -1) ){
                totalButtons[i].className = "selected button";
            }
            else if(index ==0 &&  totalButtons[i].name == index ){
                totalButtons[i].className = "selected button";
            }
        }
        
    groupName.splice(index,1);
    soil.splice(buffedIndex, maxLength);
    health.splice(buffedIndex,maxLength);
    date.splice(buffedIndex,maxLength);
    }
    else if(selectedButton.length ===1  && totalButtons.length >1 && index == document.getElementById("firstRounded").name){
        totalButtons[totalButtons.length -1].parentNode.removeChild(totalButtons[totalButtons.length-1]);
        
        groupName.splice(index,1);
        soil.splice(buffedIndex, maxLength);
        health.splice(buffedIndex,maxLength);
        date.splice(buffedIndex,maxLength);
    }
    
    pushStatsForSelected();
}

//remove graph point and data point
function remove(editValueIndex){
    var index = document.getElementsByClassName("selected")[0].name;
    var buffedIndex = index*maxLength;
    
    console.log("!!!!!!!!!!date: "+date);
    //remove item from editValue index
    soil.splice(editValueIndex, 1);
    health.splice(editValueIndex,1);
    date.splice(editValueIndex,1);
    
    //add extra null array at end so support length is maintained.
    soil.splice(buffedIndex + maxLength -1, 0, null);
    health.splice(buffedIndex + maxLength -1, 0, null);
    date.splice(buffedIndex + maxLength -1, 0, null);
    
    console.log("##!!!!!!!date: "+date);
}
//find when it was last watered
function lastWater(){
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    let currentDate = new Date();
    
    var latest;
    if(date[buffedIndex] != null && date[buffedIndex +1] != null){
        for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
            if(date[i+1] !=null){
                //console.log("date[i+1] "+date[i+1]);
                if(date[i+1].valueOf() > date[i].valueOf()){
                    latest = date[i+1];
                    //console.log("latest "+latest);
                }
            } else{break;}
        }
    }
    else if(date[buffedIndex] != null){
        latest = date[buffedIndex];
    }
    else{ //no values yet
        console.log("---here")
        document.getElementById("days").innerHTML = "_";
        document.getElementById("hours").innerHTML = "_";
        return;
    }
    console.log("--+++here")
    var latestDate = new Date(latest);
    console.log("latestDate.valueOf() "+latestDate.valueOf());
    console.log("--currentDate: "+currentDate.toJSON());
    
    var timeBeforeLastWater = currentDate - latestDate;
    
    console.log("last "+timeBeforeLastWater);
    console.log("last days /(86400 *1000) "+timeBeforeLastWater /(86400 *1000));
    console.log("last hour /(86400 *1000) "+(timeBeforeLastWater /(3600 *1000)));
    console.log("last minutes /(86400 *1000) "+(timeBeforeLastWater /(60 *1000)));
    console.log("last seconds /(86400 *1000) "+(timeBeforeLastWater /(1000)));
    
    let days = Math.floor(timeBeforeLastWater/(86400 *1000));
    let hours = Math.round(timeBeforeLastWater/(3600 *1000)) -(days*24);
    
    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
}
//find min and max values between good waterings
function minMax(){
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    let currentDate = new Date();
    
    var max ;
    var min;
    
    var latest;
    //if first two values aren't null
    if(date[buffedIndex] != null && date[buffedIndex +1] != null){
        for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
            if(date[i+1] !=null){   
                if(soil[i] === "Dry" && health[i] === "Green (Healthy)" && soil[i+1] === "Dry" && health[i+1] === "Green (Healthy)"){
                    let found1 = new Date(date[i]);
                    let found2 = new Date(date[i+1]);
                    let temp = found2-found1;
                    
                    //initialise with the only difference found
                    if(max == null && min  == null){
                        max = temp;
                        min = temp;
                    }
                    //adjust if already initial found
                    if(temp < min){
                        min = temp;
                    }
                    if(temp > max){
                        max =temp;
                    }
        }}}
    }
    if(max == null){ //no values yet
        document.getElementById("max").innerHTML = "_";
    }
    else{
        let days = Math.floor(max/(86400 *1000));
        let hours = Math.round(max/(3600 *1000)) -(days*24);
        
        document.getElementById("max").innerHTML = days + "d " + hours + "h";
    }
    
    if(min == null){ //no values yet
        document.getElementById("min").innerHTML = "_";
    }
    else{
        let days = Math.floor(min/(86400 *1000));
        let hours = Math.round(min/(3600 *1000)) -(days*24);
        
        document.getElementById("min").innerHTML = days + "d " + hours + "h";
    }
}


function editValue(){
    hpBox = document.getElementById("healthComboBox");
    soilBox = document.getElementById("soilComboBox");
    
    day = document.getElementById("dayComboBox").value;
    month = document.getElementById("monthComboBox").value;
    year = document.getElementById("yearComboBox").value;
    
    health[editValueIndex] = hpBox.value;
    soil[editValueIndex] = soilBox.value;
    
    //let tempDate = date[editValueIndex];
    let tail = date[editValueIndex].split('T')[1];
    
    let newDate = year+"-"+month+"-"+day+"T"+ tail;
    
    date[editValueIndex] = newDate;
    
    console.log("date: " + newDate);
    
    //check for error
    if(new Date(newDate)){
        console.log("fine!!!");
        sort(editValueIndex);
        pushStatsForSelected();
    } 
    else{
        console.log("error!!!");
    }
    
}

function sort(editValueIndex){
    var selectedButton = document.getElementsByClassName("selected");
    var index = selectedButton[0].name;
    var buffedIndex = index*maxLength;
    
    
    let dateValue = new Date(date[editValueIndex]);
    var found = false;
    let tempDate = date[editValueIndex];
    let tempHealth = health[editValueIndex];
    let tempSoil = soil[editValueIndex];
    
    if(date[buffedIndex] != null){
        //remove value for proper sorting
        date.splice(editValueIndex, 1);
        health.splice(editValueIndex, 1);
        soil.splice(editValueIndex, 1);

        for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
            if(date[i] != null){
                let test = new Date(date[i]);
                if(dateValue < test){
                    found = true;;
                    date.splice(i, 0, tempDate);
                    health.splice(i, 0, tempHealth);
                    soil.splice(i, 0, tempSoil);
                    break;
                }
            }
            else{ //found empty space and date is past all previous values
                found = true;;
                date.splice(i, 0, tempDate);
                health.splice(i, 0, tempHealth);
                soil.splice(i, 0, tempSoil);
                break;
            }
        }
        if(!found){
            date.splice(buffedIndex + maxLength -1, 0, null);
            health.splice(buffedIndex + maxLength -1, 0, null);
            soil.splice(buffedIndex + maxLength -1, 0, null);
            console.log("error! could not find position for date");
        }
    }
}

var reference;
function hideEdit(){
    document.getElementsByClassName("editButton")[0].style.display = "none";
    document.getElementsByClassName("editButton")[1].style.display = "none";
    
    document.getElementById("timeanddateHead").style.display = "none";
    document.getElementById("dayComboBox").style.display = "none";
    document.getElementById("monthComboBox").style.display = "none";
    document.getElementById("yearComboBox").style.display = "none";
    
    document.getElementById("healthComboBox").value = "Green (Healthy)";
    document.getElementById("soilComboBox").value = "Dry";
    
    document.getElementById("healthComboBox").style.border = '1px solid White';
    document.getElementById("soilComboBox").style.border = '1px solid White';
    
    document.getElementById("dayComboBox").style.border = '1px solid White';
    document.getElementById("monthComboBox").style.border = '1px solid White';
    document.getElementById("yearComboBox").style.border = '1px solid White';
    
    for(i  = 0;  i< maxLength; i++){
        reference[i] = defaultColor;
    }
    chart.update();
}


function graph(buffedIndex){
    var score = 0;
    var xValues = [];
    var yValues = [];
    var j = 0;
    var pointBackgroundColors = [defaultColor];
    
    if(groupName != null && date != null && soil != null && health != null){
        for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
            if(date[i] !=null){
                xValues[j] = date[i];
                j++;
            }
        }
        j = 0;
        for(i = buffedIndex; i< (buffedIndex + maxLength); i++){
            score = 0;
            if(health[i] !=null){
                if(health[i] === "Green (Healthy)"){ score+=2;}
                else if(health[i] === "Wilting (Needs Water)"){ score+=1;}
                else if(health[i] === "Yellow (Over/Under Watered)"){ score+=0;}

                if(soil[i] === "Dry"){ score+=2;}
                else if(soil[i] === "Damp"){ score+=1;}
                else if(soil[i] === "Wet"){ score+=0;}

                yValues[j]  = score;
                j++;
            }
        }
    }
    else{
        xValues = 0;
        yVallues = 0;
    }

    if(chart===0){    
        reference = pointBackgroundColors;
        chart = new Chart("chartContainer", {
            type: "line",
            name: "test",
            id: "chartContainer",
            data: {
              datasets: [{
                label: 'Quality of Watering',
                fill: {
                    target: 'origin',
                    above: 'rgba(0, 0, 0,0.6)',   // Area will be red above the origin
                    below: 'rgb(0, 0, 255)'    // And blue below the origin
                  },
                //pointRadius: 4,
                //pointBackgroundColor: "rgb(20,20,30)",
                
                borderJoinStyle: 'miter',
                pointBorderColor: "rgb(20,20,30)",
                pointBackgroundColor: pointBackgroundColors,
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                //pointHoverBackgroundColor: "rgb(20,20,30,0.2)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 5,
                pointHitRadius: 10,
                data: yValues
              }],
            labels: xValues
            },
            
            options: {
                onClick: function(evt) {   
                    var element = chart.getElementsAtEventForMode(evt, 'index', { intersect: true }, false);
                    console.log("clicked!!");
                    
                    if(element.length > 0){
                        var ind = element[0].index;
                        var index = document.getElementsByClassName("selected")[0].name;
                        var buffedIndex = index*maxLength;
                        editValueIndex = buffedIndex + ind;

                        //show edit buttons
                        document.getElementsByClassName("editButton")[0].style.display = "block";
                        document.getElementsByClassName("editButton")[1].style.display = "block";
                        
                        document.getElementById("timeanddateHead").style.display = "block";
                        document.getElementById("dayComboBox").style.display = "block";
                        document.getElementById("monthComboBox").style.display = "block";
                        document.getElementById("yearComboBox").style.display = "block";
                        
                        document.getElementById("healthComboBox").style.border = '1px dashed #E4DC37';
                        document.getElementById("soilComboBox").style.border = '1px dashed #E4DC37';
                        
                        document.getElementById("dayComboBox").style.border = '1px dashed #E4DC37';
                        document.getElementById("monthComboBox").style.border = '1px dashed #E4DC37';
                        document.getElementById("yearComboBox").style.border = '1px dashed #E4DC37';
                        

                        //check for remove if selected twice
                        if(pointBackgroundColors[ind] === '#E4DC37'){
                              if(confirm('Do you want to remove this point?')){
                                //chart.data.datasets[0].data.splice(ind, 1);
                                //chart.data.labels.splice(ind, 1);
                                
                                //remove data point
                                remove(editValueIndex);
                                graph(buffedIndex);
                                //chart.update();
                              }
                        }
                        else{
                          //update combo boxes to show value click from chart
                          document.getElementById("healthComboBox").value = health[editValueIndex];
                          document.getElementById("soilComboBox").value = soil[editValueIndex];
                          
                          year = date[editValueIndex].split('-')[0];
                          month = date[editValueIndex].split('-')[1];
                          day = date[editValueIndex].split('-')[2];
                          day = day.split('T')[0];
                          
                          console.log("year: " + year +" month: " + month +" day: " + day );
                          
                          document.getElementById("dayComboBox").value = day;
                          document.getElementById("monthComboBox").value = month;
                          document.getElementById("yearComboBox").value = year;
                          
                          //reset colors to default
                          for(i  = 0;  i< maxLength; i++){
                            pointBackgroundColors[i] = '#212B2A';
                          }
                          //apply highlighted color to indexed
                          pointBackgroundColors[ind] = '#E4DC37';
                          //chart.config.data.datasets[0]['pointBackgroundColor'][ind] = '#E4DC37';
                        }
                        chart.update();
                          //}
                      }
                    },
                
                interaction: {
                intersect: true,
                mode: 'index'
                }, 
                
              //legend: {display: false},
              scales: {
                y: {
                    grid: {
                       color: '#A1A1A180',
                       borderColor: 'grey',  // <-- this line is answer to initial question
                       borderDash: [10,10]
                    },
                    color: "white",
                    max: 5,
                    min: 0,
                    ticks: {
                        stepSize: 1,
                        color: '#DFDFDF'
                    }
                },
                x: {
                    type: 'time',
                    grid: {
                       color: '#A1A1A180',
                       borderColor: 'grey',  // <-- this line is answer to initial question
                       borderDash: [10,10]
                    },
                    time: {
                    displayFormats: {
                        quarter: 'MMM YYYY'
                        }
                    },
                    ticks: {
                        //display = false,
                        //stepSize: 1,
                        //maxTicksLimit: 20,
                        maxRotation: 0,
                        autoSkip: false,
                        color: '#DFDFDF'
                    },
                    
                    display: true,
                    title: {
                      display: true,
                      text: ''
                    }
                    /*ticks: {
                      major: {
                        enabled: true
                      },
                      color: (context) => context.tick && context.tick.major && '#FF0000',
                      font: function(context) {
                        if (context.tick && context.tick.major) {
                          return {
                            weight: 'bold'
                          };
                        }
                      }
                    }*/
                  }
            },
              plugins:{
                  legend: {
                    display: false
                  },
                  tooltip: {
                      displayColors: false,
                  enabled: true,
                  position: 'nearest'
                  /*callbacks: {
                      title: function(tooltipItem){
                            var resin =  (tooltipItem[0].label*180);
                            return "Resin: " + resin;
                      },
                      
                      label: function(context) {
                        var label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += Math.round(context.parsed.y*1000)/1000 + "%";
                        }
                        return label;
                    },
                    afterLabel: function(context){
                        var num =context.parsed.x + 1;
                        var days = "Day: " + num;
                        return days;
                      }
                      
                  }*/
                        
                        
                  
                  }
              }
              
              
              
            }
        });
    }
    
    chart.data.datasets[0].data = yValues;
    chart.data.labels = xValues;
    chart.update();
}
