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
               var cols = [];
               cols.push("Semester");
               for(var i = 0; i < classArray.length; ++i){
                   cols.push(classArray[i].prof);
               }
               var colsUnique = cols.filter(onlyUnique);
               var graphArray = [];
               graphArray.push(colsUnique);
               var colsMap = new Map();
               for(var i = 0; i < colsUnique.length; ++i){
                   colsMap.set(colsUnique[i], i);
               }
               var rowsMap = new Map();
               var studentsMap = new Map();
               for(var i = 0; i < classArray.length; ++i){
                   if (typeof classArray[i].gpa === 'undefined'){
                       continue;
                   }
                   var year = classArray[i].year;
                   var sem = classArray[i].semester;
                   var gpa = classArray[i].gpa;
                   var students = parseInt(classArray[i].A, 10)
                       + parseInt(classArray[i].B, 10)
                       + parseInt(classArray[i].C, 10)
                       + parseInt(classArray[i].D, 10)
                       + parseInt(classArray[i].F, 10);
                   var prof = classArray[i].prof;
                   var rowId = graphArray.length;
                   var yearSem = year + ' ' + sem
                   if (typeof studentsMap.get(yearSem + ' ' + prof) === 'undefined'){
                       studentsMap.set(yearSem + ' ' + prof, students);
                   } else {
                       studentsMap.set(yearSem + ' ' + prof,
                                       studentsMap.get(yearSem + ' ' + prof) + students);
                   }
                   if (typeof rowsMap.get(yearSem) === 'undefined'){
                       rowsMap.set(yearSem, rowId)
                       var newRow = new Array(colsUnique.length);
                       var j = 0;
                       newRow[0] = (yearSem);
                       graphArray.push(newRow);
                   } else {
                       rowId = rowsMap.get(yearSem);
                   }
                   if (typeof graphArray[rowId][colsMap.get(prof)] === 'undefined') {
                       graphArray[rowId][colsMap.get(prof)] = 0;
                   }
                   graphArray[rowId][colsMap.get(prof)] += parseFloat(gpa*students);
               }
               for(var i = 1; i < graphArray.length; ++i){
                   for(var j = 1; j < graphArray[i].length; ++j){
                       if (typeof graphArray[i][j] !== 'undefined') {
                           graphArray[i][j] /= studentsMap.get(graphArray[i][0] + ' ' + graphArray[0][j]);
                       }
                   }
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
                   var chart = new google.visualization.LineChart(document.getElementById('chartDiv'));
                   chart.draw(google.visualization.arrayToDataTable(graphArray), graphOptions);
               } else {
                   //console.log('chart not loaded');
               }

               var table = document.getElementById('dataTable');
               table.innerHTML = "";
               var newRow = table.insertRow(0);
               newRow.insertCell(0).innerHTML = "Year";
               newRow.insertCell(1).innerHTML = "Semester";
               newRow.insertCell(2).innerHTML = "Prof";
               newRow.insertCell(3).innerHTML = "GPA";
               newRow.insertCell(4).innerHTML = "Section";
               newRow.insertCell(5).innerHTML = "A";
               newRow.insertCell(6).innerHTML = "B";
               newRow.insertCell(7).innerHTML = "C";
               newRow.insertCell(8).innerHTML = "D";
               newRow.insertCell(9).innerHTML = "F";
               newRow.insertCell(10).innerHTML = "I";
               newRow.insertCell(11).innerHTML = "Q";
               newRow.insertCell(12).innerHTML = "S";
               newRow.insertCell(13).innerHTML = "U";
               newRow.insertCell(14).innerHTML = "X";
               for(var i = 0; i < classArray.length; ++i){
                   var row = table.insertRow(i+1);
                   row.insertCell(0).innerHTML = classArray[i].year;
                   row.insertCell(1).innerHTML = classArray[i].semester;
                   row.insertCell(2).innerHTML = classArray[i].prof;
                   if (classArray[i].hasOwnProperty("gpa")){
                       row.insertCell(3).innerHTML = parseFloat(classArray[i].gpa).toFixed(3);
                   } else {
                       row.insertCell(3);
                   }
                   row.insertCell(4).innerHTML = classArray[i].section;
                   row.insertCell(5).innerHTML = classArray[i].A;
                   row.insertCell(6).innerHTML = classArray[i].B;
                   row.insertCell(7).innerHTML = classArray[i].C;
                   row.insertCell(8).innerHTML = classArray[i].D;
                   row.insertCell(9).innerHTML = classArray[i].F;
                   row.insertCell(10).innerHTML = classArray[i].I;
                   row.insertCell(11).innerHTML = classArray[i].Q;
                   row.insertCell(12).innerHTML = classArray[i].S;
                   row.insertCell(13).innerHTML = classArray[i].U;
                   row.insertCell(14).innerHTML = classArray[i].X;
               }
           });
    e.preventDefault();
});

google.setOnLoadCallback(function(){
    chartLoaded = true;
});
google.load('visualization', '1.0', {'packages':['corechart']});
