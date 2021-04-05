document.getElementById("login").addEventListener('click', login);
    
function login() {  
    data = {};
    data["email"] = $("#email").val();
    data["password"] = $("#password").val();
  console.log(data);
  $.post("/login", {data: data}, function(result){
    if (result == true){
      window.location.href = "/";
    }
    else {
        console.log("invalid credentials")
    }
  }); 
}