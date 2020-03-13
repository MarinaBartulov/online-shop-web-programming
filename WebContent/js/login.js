$(document).ready(function(){
    
    $('#formLogin').submit(function(event){
          event.preventDefault();
          let username = $('#username').val();
          let password = $('#password').val();
          if(!username || !password){
              $('.msg').text("Please enter username and password.").show().delay(2000).fadeOut();
              return;
          }

          $.post({
              url:'rest/userService/login',
              data: JSON.stringify({"username":username, "password": password}),
              contentType: "application/json",
              success: function(user){
                  if(user == null){
                    $('.msg').text("Invalid username and/or password.").show().delay(2000).fadeOut();
                  }else{
                      window.location.href = "homePage.html"
                  }
              }
          })


    });
});