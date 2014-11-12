"use strict";

var chartLoaded = false;

function onlyUnique(e, i, self){
    return self.indexOf(e) === i;
}

$(document).on('submit', '#classForm', function(e){
    $.post($(this).attr('action'),
           $(this).serialize(),
           function(data){
               //console.log(data);
               var classJson = $.parseJSON(data);
               if (typeof classJson.classes === 'undefined'){
                   return;
               }
               var classArray = classJson.classes;
               //console.log(classArray);
               //var divTest = document.getElementById("testBox");
               //divTest.innerHTML = data;
               var i = 0;
               var cols = [];
               cols.push("Semester");
               for(i = 0; i < classArray.length; ++i){
                   cols.push(classArray[i].prof);
               }
               var colsUnique = cols.filter(onlyUnique);
               var graphArray = [];
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
                   var rowId = graphArray.length;
                   if (typeof rowsMap.get(year + ' ' + sem) === 'undefined'){
                       rowsMap.set(year + ' ' + sem, rowId)
                       var newRow = new Array(colsUnique.length);
                       var j = 0;
                       newRow[0] = (year + ' ' + sem);
                       graphArray.push(newRow);
                   } else {
                       rowId = rowsMap.get(year + ' ' + sem);
                   }
                   graphArray[rowId][colsMap.get(prof)] = parseFloat(gpa);
               }
               //console.log(graphArray);

               var graphOptions = {
                   vAxis: {
                       title: 'GPA',
                       gridlines: {
                           count: -1
                       }
                   },
                   hAxis: {
                       title: 'Semester',
                       gridlines: {
                           count: -1
                       }
                   },
                   pointSize: 5,
                   interpolateNulls: true
               };

               if(chartLoaded){
                   var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
                   chart.draw(google.visualization.arrayToDataTable(graphArray), graphOptions);
               } else {
                   //console.log('chart not loaded');
               }
           });
    e.preventDefault();
});

google.setOnLoadCallback(function(){
    chartLoaded = true;
});
google.load('visualization', '1.0', {'packages':['corechart']});
