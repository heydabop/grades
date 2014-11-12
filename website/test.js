"use strict";

var chartLoaded = false;
var classArray = [];
var graphArray = [];

function onlyUnique(e, i, self){
    return self.indexOf(e) === i;
}

document.addEventListener("DOMContentLoaded", function(event){

    var deptSel = document.getElementById("deptSelect");
    var o1 = document.createElement("option");

    o1.value = "1";
    o1.text = "Option Value 1";

    deptSel.add(o1);

    $(document).on('submit', '#classForm', function(e){
        $.post($(this).attr('action'),
               $(this).serialize(),
               function(data){
                   console.log(data);
                   var classJson = $.parseJSON(data);
                   if (typeof classJson.classes === 'undefined'){
                       return;
                   }
                   classArray = classJson.classes;
                   console.log(classArray);
                   //var divTest = document.getElementById("testBox");
                   //divTest.innerHTML = data;
                   var i = 0;
                   var cols = [];
                   cols.push("Semester");
                   for(i = 0; i < classArray.length; ++i){
                       cols.push(classArray[i].prof);
                   }
                   var colsUnique = cols.filter(onlyUnique);
                   graphArray.push(colsUnique);
                   var colsMap = new Map();
                   for(i = 0; i < colsUnique.length; ++i){
                       colsMap.set(colsUnique[i], i);
                   }
                   var rowsMap = new Map();
                   for(i = 0; i < classArray.length; ++i){
                       if (typeof classArray[i].gpa === 'undefined'){
                           continue;
                       }
                       var year = classArray[i].year;
                       var sem = classArray[i].semester;
                       var gpa = classArray[i].gpa;
                       var prof = classArray[i].prof;
                       var rowId = i+1;
                       if (typeof map.get(year + ' ' + sem) === 'undefined'){
                           rowsMap.set(year + ' ' + sem, rowId)
                           graphArray.push(new Array(cols.length));
                       } else {
                           rowId = rowsMap.get(year + ' ' + sem);
                       }
                       graphArray[rowId][colsMap.get(prof)] = gpa;
                   }
                   console.log(graphArray);
               });
        e.preventDefault();
    });

});

google.load('visualization', '1.0', {'packages':['corechart']});
google.setOnLoadCallback(function(){
    chartLoaded = true;
});
