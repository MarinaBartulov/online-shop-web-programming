$(document).ready(function(){

    $('#formReg').submit(function(e){
        e.preventDefault();
        let username = $('#username').val();
        let password = $('#password').val();
        let passwordC = $('#passwordC').val();
        let name = $('#name').val();
        let surname = $('#surname').val();
        let phoneNumber = $('#phoneNumber').val();
        let city = $('#city').val();
        let email = $('#email').val();
        let valid = true;
        
        $('.msg').text("");
        if(!username){
            $('#msgUsername').text("Please enter a username.");
            valid = false;
        }else{
            if(!/^[a-zA-Z0-9_]+$/.test(username)){
                $('#msgUsername').text("Only letters, numbers and underscores are allowed.");
                valid = false;
            }
        }
        if(!password){
            $('#msgPassword').text("Please enter a password.");
            valid = false;
        }
        if(!passwordC){
            $('#msgPasswordC').text("Please confirm the password.");
            valid = false;
        }else{
            if(password !== passwordC){
                $('#msgPasswordC').text("Passwords don't match.");
                valid = false;
            }
        }

        if(!name){
            $('#msgName').text("Please enter a name.");
            valid = false;
        }
        if(!surname){
            $('#msgSurname').text("Please enter a surname.");
            valid = false;
        }
        if(!phoneNumber){
            $('#msgPhoneNumber').text("Please enter a phone number.");
            valid = false;
        }else{
            if(phoneNumber[0] !== "+" && isNaN(phoneNumber[0])){
                $('#msgPhoneNumber').text("Invalid phone number.");
                valid = false;
            }else{
                if(isNaN(phoneNumber.substring(1,phoneNumber.length))){
                    $('#msgPhoneNumber').text("Invalid phone number.");
                    valid = false;
                }
            }
        }
        if(!city){
            $('#msgCity').text("Please choose a city.");
            valid = false;
        }
        if(!email){
            $('#msgEmail').text("Please enter an email.");
            valid = false;
        }
   
        if(valid){

            $.post({
                url: 'rest/userService/registration',
                data: JSON.stringify({"username":username, "password":password, "name":name, "surname":surname, "phoneNumber":phoneNumber, 
                     "city":city, "email":email}),
                contentType: "application/json",
                success: function(){
                    window.location.href = "homePage.html";
                },
                error: function(message){
                    $('#msgUsername').text(message.responseText);
                }     

            })

        }
    });

    




});