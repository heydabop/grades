(function(){
    "use strict";

    var chartLoaded = false;

    function onlyUnique(e, i, self){
        return self.indexOf(e) === i;
    }

    var deptInput = document.getElementById('classForm').elements[0];
    var numberInput = document.getElementById('classForm').elements[1];

    $(document).on('submit', '#classForm', function(e){
        //clear chart and table for new data
        document.getElementById('chartDiv').innerHTML = "";
        document.getElementById('dataTable').innerHTML = "<thead></thead><tbody></tbody>";

        //make dept input case-insensitive
        deptInput.value = deptInput.value.trim().toUpperCase();

        if(typeof deptInput.value !== 'undefined' && typeof numberInput.value !== 'undefined' &&
           deptInput.value !== '' && numberInput.value !== ''){
            //change URL to show GET parameters for permalinking
            window.history.pushState(new Object, '', location.origin + location.pathname + '?dept=' + deptInput.value + '&number=' + numberInput.value);
        } else {
            document.getElementById('chartDiv').innerHTML = "Invalid input.";
            e.preventDefault();
            return;
        }

        $.post($(this).attr('action'),
               $(this).serialize(),
               function(data){
                   //console.log(data);
                   var classJson = new Object;
                   try {
                       classJson = $.parseJSON(data);
                   } catch(err) {
                       document.getElementById('chartDiv').innerHTML = "Invalid data returned. Is your input correct?";
                   }
                   if (typeof classJson.classes === 'undefined' || classJson.classes.length == 0){
                       document.getElementById('chartDiv').innerHTML = "No data returned. Is your input correct?";
                       e.preventDefault();
                       return;
                   }
                   var classArray = classJson.classes;
                   //console.log(classArray);

                   for(var i = 0; i < classArray.length; ++i){ //separate honors sections from normal sections in chart
                       if (classArray[i].section[0] === "2"){
                           classArray[i].prof = classArray[i].prof + " (H)";
                       }
                   }

                   //make column headings for chart
                   var cols = [];
                   cols.push("Semester");
                   for(var i = 0; i < classArray.length; ++i){
                       cols.push(classArray[i].prof);
                   }
                   var colsUnique = cols.filter(onlyUnique); //ensure each prof only appears once in columns

                   var graphArray = [];
                   graphArray.push(colsUnique);

                   var colsMap = new Map();
                   for(var i = 0; i < colsUnique.length; ++i){
                       colsMap.set(colsUnique[i], i); //map prof name to column index
                   }

                   var rowsMap = new Map(); //map semester to row in chart data
                   var studentsMap = new Map(); //map semester + prof to number of students taught by that prof in that semsester
                   for(var i = 0; i < classArray.length; ++i){ //add GPAs to chart data
                       if (typeof classArray[i].gpa === 'undefined'){ //skip secions with no GPA
                           continue;
                       }
                       var year = classArray[i].year;
                       var sem = classArray[i].semester;
                       var gpa = parseFloat(classArray[i].gpa);
                       var students = parseInt(classArray[i].A, 10)
                           + parseInt(classArray[i].B, 10)
                           + parseInt(classArray[i].C, 10)
                           + parseInt(classArray[i].D, 10)
                           + parseInt(classArray[i].F, 10);
                       var prof = classArray[i].prof;
                       var rowId = graphArray.length;
                       var yearSem = year + ' ' + sem;
                       if (typeof studentsMap.get(yearSem + ' ' + prof) === 'undefined'){ //if first section prof has taught this semester
                           studentsMap.set(yearSem + ' ' + prof, students); //set number of students in section
                       } else { //if not first section prof has taught this semester
                           studentsMap.set(yearSem + ' ' + prof,
                                           studentsMap.get(yearSem + ' ' + prof) + students); //increment number of students taught this semester
                       }
                       if (typeof rowsMap.get(yearSem) === 'undefined'){ //if row for semester doesn't exist in chart data
                           //initialize row
                           rowsMap.set(yearSem, rowId);
                           var newRow = new Array(colsUnique.length);
                           newRow[0] = (yearSem);
                           graphArray.push(newRow);
                       } else {
                           //existing row into which to add GPA data
                           rowId = rowsMap.get(yearSem);
                       }
                       if (typeof graphArray[rowId][colsMap.get(prof)] === 'undefined') { //initialize cell
                           graphArray[rowId][colsMap.get(prof)] = 0;
                       }
                       graphArray[rowId][colsMap.get(prof)] += gpa*students; //increment student-weighted GPA
                   }
                   for(var i = 1; i < graphArray.length; ++i){
                       for(var j = 1; j < graphArray[i].length; ++j){
                           if (typeof graphArray[i][j] !== 'undefined') {
                               graphArray[i][j] /= studentsMap.get(graphArray[i][0] + ' ' + graphArray[0][j]); //student-weighted average GPAs
                               graphArray[i][j] = parseFloat(graphArray[i][j].toFixed(3)) //round to 3 (for cleanliness in tooltip)
                           }
                       }
                   }
                   //console.log(graphArray);

                   var graphOptions = {
                       vAxis: {
                           title: 'GPA',
                           gridlines: {
                               count: -1 //auto
                           }
                       },
                       hAxis: {
                           title: 'Semester',
                           gridlines: {
                               count: -1 //auto
                           }
                       },
                       pointSize: 5,
                       interpolateNulls: true //lines between point gaps
                   };

                   if(chartLoaded){ //chart API is loaded
                       var chart = new google.visualization.LineChart(document.getElementById('chartDiv'));
                       chart.draw(google.visualization.arrayToDataTable(graphArray), graphOptions);
                   } else {
                       console.log('chart API not loaded');
                   }

                   var table = document.getElementById('dataTable');
                   table.innerHTML= "<thead></thead><tbody></tbody>"; //make sure table is clear
                   var tableHead = document.getElementById('dataTable').tHead;
                   var tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
                   var newRow = tableHead.insertRow(0); //add header row to table
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
                   for(var i = 0; i < classArray.length; ++i){ //add data rows to table
                       var row = tableBody.insertRow(i);
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

    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
        }
        return(false);
    }

    google.charts.load('current', {'packages':['corechart']});

    google.charts.setOnLoadCallback(function(){
        chartLoaded = true;
        var dept = getQueryVariable("dept");
        var number = getQueryVariable("number");
        if (typeof dept !== 'undefined' && dept !== false){
            deptInput.value = dept;
        }
        if (typeof number !== 'undefined' && number !== false){
            numberInput.value = number;
        }
        if (typeof dept !== 'undefined' && typeof number !== 'undefined' &&
            dept !== false && number !== false){
            $('#classForm').trigger('submit');
        }
    });
})();
