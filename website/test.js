"use strict";

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
                   var divTest = document.getElementById("testBox");
                   divTest.innerHTML = data;
               });
        e.preventDefault();
    });

});
