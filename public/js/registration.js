document.getElementById("register").addEventListener('click', register);
    
function register() {  
    data = {};
    data['fname'] = $("#fname").val();
    data["lname"] = $("#lname").val();
    data["email"] = $("#email").val();
    data["password"] = $("#password").val();
  console.log(data);
  $.post("/register", {data: data}, function(result){
      console.log("navigate to login page")
    window.location.href = "/login";
  });
}