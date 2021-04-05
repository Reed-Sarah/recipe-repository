document.getElementById("saveRecipe").addEventListener('click', saveRecipe);

    function saveRecipe() {  
    data = {};
    data['title'] = $("#title").val();
    data["ingredients"] = $("#ingredients").val();
    data["directions"] = $("#directions").val();
  console.log(data);
  $.post("/saveRecipe", {data: data}, function(result){
    window.location.href = "/";
  });
}



