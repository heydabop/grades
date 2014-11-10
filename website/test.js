"use strict";

document.addEventListener("DOMContentLoaded", function(event){
    var deptSel = document.getElementById("deptSelect");
    var o1 = document.createElement("option");

    o1.value = "1";
    o1.text = "Option Value 1";

    deptSel.add(o1);


    $.post("/grades/getData/",
           'reqJSON={"dept":"MEEN","number":"221","year":"2012","semester":"SPRING"}',
           function(data){
               var divTest = document.getElementById("testBox");
               divTest.innerHTML = data;
           });
});
