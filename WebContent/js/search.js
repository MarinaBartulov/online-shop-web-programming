function checkUser(){
    $.get({
        url:'rest/userService/currentUser',
        success: function(user){
             if(user == null){
                 showNoUserParts();
             }else{
                 showUserParts(user);
             }
        }
    });
}

function showNoUserParts(){
    $('#topnav-user-admin').hide();
    $('#topnav-user').hide();
    $('#topnav-noUser').show();
    $('#trStatus').hide();
    $('#pStatus').hide();
}

function showUserParts(user){
     
    if(user.role === "Administrator"){
        $('#topnav-noUser').hide();
        $('#topnav-user').hide();
        $('#topnav-user-admin').show();
        $('#trStatus').hide();
        $('#pStatus').hide();
    }else{
        $('#topnav-noUser').hide();
        $('#topnav-user-admin').hide();
        $('#topnav-user').show();
        $('#trStatus').show();
        $('#pStatus').show();
    }
}

function addAd(ad,user){

    let tr = $('<tr></tr>');
    let tdPhoto = $('<td><img src="' + ad.photo + '" alt="No photo"></td>');
    let tdName = $('<td>' + ad.name + '</td>');
    let tdDescription = $('<td>' + ad.description + '</td>');
    let tdPrice = $('<td>' + ad.price + '</td>');
    tr.append(tdPhoto,tdName,tdDescription,tdPrice);
    tr.click(clickedAd(ad,user));
    tr.attr("id","ad-" + ad.id);
    $('#table-ads tbody').append(tr);

}

function clickedAd(ad,user){
    return function(){
        $('#div-ad-photo').attr("src",ad.photo);
        $('#spanName').text(ad.name);
        $('#spanPrice').text(ad.price);
        $('#spanDesc').text(ad.description);
        $('#spanLikes').text(ad.likes);
        $('#spanDislikes').text(ad.dislikes);
        $('#spanPDate').text(ad.postingDate);
        $('#spanEDate').text(ad.expiryDate);
        $('#spanCity').text(ad.city);
        $('#spanStatus').text(ad.status);
        if(ad.active){
            $('#spanActive').text("Yes");
        }else{
            $('#spanActive').text("No");
        }
        if(user == null){
            $('#btnEditAdmin, #btnDeleteAdmin, #btnOrder, #btnFavourite, #btnEditSeller, #btnEditSeller').hide();
        }else{
            if(user.role === "Administrator"){

              $('#btnEditAdmin, #btnDeleteAdmin').show();
              $('#btnOrder, #btnFavourite, #btnEditSeller, #btnEditSeller').hide();
              $('#btnEditAdmin').off("click");
              $('#btnEditAdmin').click(clickedEditAdmin(ad));
              $('#btnDeleteAdmin').off("click");
              $('#btnDeleteAdmin').click(clickedDeleteAdmin(ad));

            }else if(user.role === "Seller"){
              if(user.postedAds.includes(ad.id)){
                  if(ad.status == "In realization"){
                    $('#btnEditSeller').show();
                    $('#btnDeleteSeller').hide();
                  }else{
                    $('#btnEditSeller, #btnDeleteSeller').show();
                  }
                  $('#btnEditSeller').off("click");
                  $('#btnEditSeller').click(clickedEditSeller(ad));
                  $('#btnDeleteSeller').off("click");
                  $('#btnDeleteSeller').click(clickedDeleteSeller(ad));
                  $('#btnOrder, #btnFavourite, #btnEditAdmin, #btnEditAdmin').hide();
              }else{
                  $('#btnEditSeller, #btnDeleteSeller').hide();
              }
            }else{
                if(ad.status === "In realization"){
                    $('#btnFavourite').show();
                    $('#btnOrder').hide();
                }else{
                    $('#btnOrder, #btnFavourite').show();
                }
                if(user.favouriteAds.includes(ad.id)){
                    $('#btnFavourite').text("Added to favourite");
                }else{
                    $('#btnFavourite').text("Add to favourite");
                }
                $('#btnOrder').off("click");
                $('#btnOrder').click(clickedOrder(ad));
                $('#btnFavourite').off("click");
                $('#btnFavourite').click(clickedFavourite(ad));
                $('#btnEditAdmin, #btnDeleteAdmin, #btnEditSeller, #btnEditSeller').hide();
            }
        }
 
        
        $.get({
            url:'rest/userService/getSeller/' + ad.id,
            success: function(user){
                $('#spanSeller').text(user.name + " " + user.surname + " (" + user.username + ")");

                $.get({
                    url:'rest/reviewService/reviews',
                    success: function(reviews){
                        $('#table-review tbody').empty();
                        for(let r of reviews){
                            if(ad.reviews.includes(r.id) && r.deleted == false){
                                addReviewAd(r);
                            }
                        }
                        $('#div-table-ads').hide();
                        $('#div-ad').show();
                    }
                });
            }
        });
    }
}
//Button for a customer
function clickedOrder(ad){
    return function(){
        $.post({
            url: 'rest/adService/orderAd/' + ad.id,
            success: function(){
                $('#div-ad').fadeOut(2000,function(){
                   $('#form-ads').trigger("submit"); //in a customer shows new ads and then he orders one, then that ordered ad disappears from the list
                });
            },
            error: function(message){
                alert(message.responseText);
            }
        });
    }
}

//Button for a customer
function clickedFavourite(ad){
    return function(){
        $.post({
            url: 'rest/adService/addInFavourite/' + ad.id,
            success: function(isFavourite){
                if(isFavourite){
                   $('#btnFavourite').text("Added to favourite").addClass("clickedFave");
                }else{
                    $('#btnFavourite').text("Add to favourite").removeClass("clickedFave");
                }
            }
        });
    }
}
//Button for an admin
function clickedDeleteAdmin(ad){
    return function(){
        $.ajax({
            url: 'rest/adService/deleteAdAdmin/' + ad.id,
            type: 'DELETE',
            success: function(){
                $('#div-ad').fadeOut(2000,function(){
                $('#ad-' + ad.id).remove();
                $('#div-table-ads').show();
            });
            },
            error: function(message){
               alert(message.responseText);
            }
        });

    }
}
//Button for a seller
function clickedDeleteSeller(ad){
    return function(){
    $.ajax({
        url:'rest/adService/deleteAdSeller/' + ad.id,
        type:'DELETE',
        success: function(){
            $('#div-ad').fadeOut(500,function(){
                $('#ad-' + ad.id).remove();
                $('#div-table-ads').show();
            });
        },
        error: function(message){
            alert(message.responseText);
        }
    });
}
}

//Button for a seller
function clickedEditSeller(ad){
    return function(){
         $('#ad-edit-seller-name').val(ad.name);
         $('#ad-edit-seller-price').val(ad.price);
         $('#ad-edit-seller-description').val(ad.description);
         if(ad.active){
             $('#ad-edit-seller-active-yes').prop("checked",true);
         }else{
             $('#ad-edit-seller-active-no').prop("checked",false);
         }
        $('#ad-edit-seller-city').val(ad.city);
    
        $('#div-edit-ad-seller img').attr("src",ad.photo);
        $('#ad-edit-seller-photo').val("");
        $('#btnCancelEdit-seller').off("click");
        $('#btnCancelEdit-seller').click(function(){
              $('#div-edit-ad-seller').fadeOut(500, function(){
                  $('#div-ad').fadeIn(500);
              }) 
        });
        $('#form-edit-ad-seller').off("submit");
        $('#form-edit-ad-seller').submit(changeAdSeller(ad));
        let selectCat = $('#ad-edit-seller-new-category');
        $('#ad-edit-seller-new-category').empty();
        $.get({
            url:'rest/categoryService/categories',
            success: function(categories){
                  for(let cat of categories){
                        let op;
                      if(cat.deleted === false){  
                         if(cat.ads.includes(ad.id)){
                            op =$('<option value="' + cat.id +'" selected>' + cat.name + '</option>');
                         }else{
                            op =$('<option value="' + cat.id +'">' + cat.name + '</option>'); 
                        }
                      selectCat.append(op);
                    }
                  }
                  $('#div-ad').fadeOut(500,function(){
                       $('#div-edit-ad-seller').fadeIn(500);  
                  }); 
            }
        });
    }
}

function changeAdSeller(ad){
    return function(e){
        e.preventDefault();
        let name = $('#ad-edit-seller-name').val();
        let price =  $('#ad-edit-seller-price').val();
        let desc = $('#ad-edit-seller-description').val();
        let activeVal = $('input[name="ad-edit-seller-active"]:checked').val();
        let active;
        if(activeVal === "yes"){
            active = true;
        }else{
            active = false;
        }
        let city = $('#ad-edit-seller-city').val();
        let category = $('#ad-edit-seller-new-category').val();
        let photo = $('#div-edit-ad-seller img').attr("src");

        $.ajax({
            url:'rest/adService/editAdSeller/' + ad.id + '/' + category,
            type: 'PUT',
            data: JSON.stringify({"name":name,"price":price,"description":desc,"active":active,"city":city,"photo":photo}),
            contentType: 'application/json',
            success: function(ad1){
                  showAdSeller(ad1);
            }
        });       
    }
}

function showAdSeller(ad){
    $('#div-ad-photo').attr("src",ad.photo);
    $('#spanName').text(ad.name);
    $('#spanPrice').text(ad.price);
    $('#spanDesc').text(ad.description);
    $('#spanLikes').text(ad.likes);
    $('#spanDislikes').text(ad.dislikes);
    $('#spanPDate').text(ad.postingDate);
    $('#spanEDate').text(ad.expiryDate);
    $('#spanCity').text(ad.city);
    $('#spanStatus').text(ad.status);
    if(ad.active){
        $('#spanActive').text("Yes");
    }else{
        $('#spanActive').text("No");
    }
    $('#btnEditSeller').off("click");
    $('#btnEditSeller').click(clickedEditSeller(ad));
    $('#div-edit-ad-seller').fadeOut(500,function(){
           $('#div-ad').fadeIn(300);
    });
}

//Button for an admin
function clickedEditAdmin(ad){
    return function(){
        $('#ad-edit-admin-name').val(ad.name);
        $('#ad-edit-admin-price').val(ad.price);
        $('#ad-edit-admin-description').val(ad.description);
        $('#ad-edit-admin-pdate').val(ad.postingDate);
        $('#ad-edit-admin-edate').val(ad.expiryDate);
        if(ad.active){
            $('#ad-edit-admin-active-yes').prop("checked",true);
        }else{
            $('#ad-edit-admin-active-no').prop("checked",true);
        }
        $('#ad-edit-admin-city').val(ad.city);
        $('#div-edit-ad-admin-photo').attr("src",ad.photo);
        $('#ad-edit-admin-photo').val("");

        $('#btnCancelEdit-admin').off("click");
        $('#btnCancelEdit-admin').click(function(){
            $('#div-edit-ad-admin').fadeOut(500, function(){
                $('#div-ad').fadeIn(500);
            }) 
        });
        $('#form-edit-ad-admin').off("submit");
        $('#form-edit-ad-admin').submit(changeAdAdmin(ad));

        $.get({
            url:'rest/categoryService/categories',
            success: function(categories){
                let selectCategory = $('#ad-edit-admin-new-category');
                selectCategory.empty();
                for(let cat of categories){
                    let option
                    if(cat.deleted == false){
                        if(cat.ads.includes(ad.id)){
                           option = $('<option value="' + cat.id + '" selected>' + cat.name + '</option>');
                        }else{
                            option = $('<option value="' + cat.id + '">' + cat.name + '</option>');
                       }
                     selectCategory.append(option);
                    }
                }
                $('#ad-edit-admin-table-review tbody').empty();
                $.get({
                  url:'rest/reviewService/reviews',
                  success: function(reviews){
                     for(let r of reviews){
                        if(ad.reviews.includes(r.id) && r.deleted == false){
                        addReviewEdit(r,ad);
                        }
                    }
                    $('#div-ad').fadeOut(300,function(){
                        $('#div-edit-ad-admin').fadeIn(300);  
                   }); 
                  }
                });
            }
        });

    }
}
function addReviewEdit(review){
    let table = $('#ad-edit-admin-table-review tbody');
    let tr = $('<tr></tr>');
    tr.attr("id","trEditReview-" + review.id); //to be able to remove from the table when I click delete
    let tdUser = $('<td>' + review.reviewer + '</td>');
    let tdTitle = $('<td>' + review.title + '</td>');
    let tdContent = $('<td>' + review.content + '</td>');
    let tdPhoto = $('<td></td>');
    let img = $('<img>').attr("src",review.photo);
    img.attr("alt","");
    tdPhoto.append(img);
    let tdDesc;
    if(review.descriptionTrue){
        tdDesc = $('<td>Valid</td>');
    }else{
        tdDesc = $('<td>Not valid</td>');
    }
    let tdAgree;
    if(review.respectedAgreement){
        tdAgree = $('<td>Respected</td>');
    }else{
        tdAgree = $('<td>Not respected</td>');
    }
    let tdDelete = $('<td style="text-align:center;"><input type="checkbox" form="form-edit-ad-admin" name="r-delete" value="' + review.id + '"></td>');
    tr.append(tdUser,tdTitle,tdContent,tdPhoto,tdDesc,tdAgree,tdDelete);
    table.append(tr);
}

function changeAdAdmin(ad){
    return function(e){
        e.preventDefault();
          let name = $('#ad-edit-admin-name').val();
          let price = $('#ad-edit-admin-price').val();
          let desc = $('#ad-edit-admin-description').val();
          let city = $('#ad-edit-admin-city').val();
          let pdate = $('#ad-edit-admin-pdate').val();
          let edate = $('#ad-edit-admin-edate').val();
          if(!validDate(pdate) || !validDate(edate)){
              $('#ad-edit-admin-msg').text("Please enter a valid date").css("color","red").show().delay(2000).fadeOut(500);
              return;
          }
          if(Date.parse(changeDateFormat(pdate))> Date.parse(changeDateFormat(edate))){
            $('#ad-edit-admin-msg').text("Expiry date has to be bigger than posting date.").css("color","red").show().delay(2000).fadeOut(500);
            return;
          }
          let active;
          if($('#ad-edit-admin-active-yes').prop("checked")){
              active = true;
          }
          if($('#ad-edit-admin-active-no').prop("checked")){
              active = false;
          }
          let photo = $('#div-edit-ad-admin-photo').attr("src"); 
          let categoryID = $('#ad-edit-admin-new-category').val(); //get a category's id

          let reviewsForDelete = [];
          $('input:checkbox[name="r-delete"]:checked').each(function(){ //collect reviews for removing
            reviewsForDelete.push($(this).val()); //ids of reviews for removing
          });

          $.ajax({
              url: 'rest/reviewService/deleteReviews/' + ad.id, //remove checked reviews, send id of the ad so that I can find the seller
              type: 'DELETE',
              data: JSON.stringify(reviewsForDelete),
              contentType: 'application/json',
              success: function(){ //updated the ad
                $.ajax({
                    url:'rest/adService/editAdAdmin/' + ad.id + '/' + categoryID + '/' + reviewsForDelete.length,
                    type: 'PUT',
                    data: JSON.stringify({"name":name,"price":price,"description":desc, "photo":photo, "postingDate":pdate,"expiryDate":edate,"active":active,"city":city}),
                    contentType: 'application/json',
                    success: function(){
                           $.get({
                                url:'rest/adService/ad/' + ad.id,
                                success: function(ad1){
                                    showAdAdmin(ad1);
                                }
                           });
                    }
                });
              }
          });
    }
}

function showAdAdmin(ad){
    $('#div-ad-photo').attr("src",ad.photo);
    $('#spanName').text(ad.name);
    $('#spanPrice').text(ad.price);
    $('#spanDesc').text(ad.description);
    $('#spanLikes').text(ad.likes);
    $('#spanDislikes').text(ad.dislikes);
    $('#spanPDate').text(ad.postingDate);
    $('#spanEDate').text(ad.expiryDate);
    $('#spanCity').text(ad.city);
    $('#spanStatus').text(ad.status);
    if(ad.active){
        $('#spanActive').text("Yes");
    }else{
        $('#spanActive').text("No");
    }
    $('#btnEditAdmin').off("click");
    $('#btnEditAdmin').click(clickedEditAdmin(ad));
    $.get({
        url:'rest/reviewService/reviews',
        success: function(reviews){
            $('#table-review tbody').empty();
            for(let r of reviews){
                if(ad.reviews.includes(r.id) && r.deleted == false){
                    addReviewAd(r);
                }
            }
            $('#div-edit-ad-admin').fadeOut(300,function(){
                $('#div-ad').fadeIn(300);
            });
        }
    });
}

function addReviewAd(r){
     let tr = $('<tr></tr>');
     let tdReviewer = $('<td>' + r.reviewer + '</td>');
     let tdTitle = $('<td>' + r.title + '</td>');
     let tdContent = $('<td>' + r.content + '</td>');
     tr.append(tdReviewer,tdTitle,tdContent);
     tr.click(clickedReview(r,"ad"));
     $('#table-review').append(tr);
}

function clickedReview(r,mode){
    return function(){
         $('#review-title').text(r.title);
         $('#div-review img').attr("src",r.photo);
         $('#review-reviewer').text(r.reviewer);
         $('#review-content').text(r.content);
         if(r.descriptionTrue){
             $('#review-description').text("Yes");
         }else{
             $('#review-description').text("No");
         }
         if(r.respectedAgreement){
             $('#review-agreement').text("Yes");
         }else{
             $('#review-agreement').text("No");
         }
         $('#btnBack-review').off("click");
         $('#btnBack-review').click(function(){
                 if(mode=="ad"){
                     $('#div-review').fadeOut(500,function(){
                          $('#div-ad').fadeIn(500);
                     });
                 }
                 if(mode=="user"){
                    $('#div-review').fadeOut(500,function(){
                        $('#div-user').fadeIn(500);
                   });
                 }
         });
         if(mode === "user"){
             $('#div-user').hide();
             $('#div-review').show();
         }
         if(mode === "ad"){
             $('#div-ad').hide();
             $('#div-review').show();
         }
    }
}

function addUser(user){
      let tr = $('<tr></tr>');
      let tdName = $('<td>' + user.name + '</td>');
      let tdSurname = $('<td>' + user.surname + '</td>');
      let tdUsername = $('<td>' + user.username + '</td>');
      let tdCity = $('<td>' + user.city + '</td>');
      tr.append(tdName,tdSurname,tdUsername,tdCity);
      tr.click(clickedUser(user));
      $('#table-users tbody').append(tr);
}

function clickedUser(user){
    return function(){
        $('#spanUser-username').text(user.username);
        $('#spanUser-name').text(user.name);
        $('#spanUser-surname').text(user.surname);
        $('#spanUser-phoneNumber').text(user.phoneNumber);
        $('#spanUser-email').text(user.email);
        $('#spanUser-city').text(user.city);
        $('#spanUser-likes').text(user.likes);
        $('#spanUser-dislikes').text(user.dislikes);
        $('#spanUser-dateReg').text(user.dateOfReg);
        $('#spanUser-role').text(user.role);
        if(user.role == "Seller"){
            $.get({
                url:'rest/reviewService/reviews',
                success: function(reviews){
                    for(let r of reviews){
                        if(user.reviews.includes(r.id) && r.deleted == false){
                                addReviewUser(r);
                        }
                    }
                    $('#div-table-review-user').show();
                    $('#div-table-users').hide();
                    $('#div-user').show();
                }
            });
        }else{
            $('#div-table-review-user').show();
            $('#div-table-users').hide();
            $('#div-user').show();
        }
    }
}

function addReviewUser(r){
    let tr = $('<tr></tr>');
    let tdReviewer = $('<td>' + r.reviewer + '</td>');
    let tdTitle = $('<td>' + r.title + '</td>');
    let tdContent = $('<td>' + r.content + '</td>');
    tr.append(tdReviewer,tdTitle,tdContent);
    tr.click(clickedReview(r,"user"));
    $('#table-review-user').append(tr);
}

function changeDateFormat(date){
    let parts = date.split("/");
    let newDate = parts[1] + "/" + parts[0] + "/" + parts[2];
    return newDate;       
}

function validDate (d) {
    let parts = d.split("/");
    let newD = parts[1] + "/" + parts[0] + "/" + parts[2];
    let date = new Date(newD); 
    let day = "" + date.getDate();
    if(day.length == 1)
        day = "0" + day;
    let month = "" + (date.getMonth() + 1); 
    if(month.length == 1)
        month = "0"+ month;
    let year = "" + date.getFullYear();

    return ((month + "/" + day + "/" + year) == newD);
}



$(document).ready(function(){ 

    checkUser();
    
    $('#btnSearch-ad').click(function(){
        if($('#btnSearch-ad').hasClass("clicked")){
            $('#btnSearch-ad').removeClass("clicked");
            $('#div-search-ad').slideUp(1000); 
        }else{
            if($('#btnSearch-user').hasClass("clicked")){
                $('#btnSearch-user').removeClass("clicked");
                $('#btnSearch-ad').addClass("clicked");
                $('#div-search-user').slideUp(1000, function(){
                    $('#div-search-ad').slideDown(1000);
                }); 
            }else{
                $('#btnSearch-ad').addClass("clicked");
                $('#div-search-ad').slideDown(1000);
            }
        }
    });

    $('#btnSearch-user').click(function(){
        if($('#btnSearch-user').hasClass("clicked")){
            $('#btnSearch-user').removeClass("clicked");
            $('#div-search-user').slideUp(1000); 
        }else{
            if($('#btnSearch-ad').hasClass("clicked")){
                $('#btnSearch-ad').removeClass("clicked");
                $('#btnSearch-user').addClass("clicked");
                $('#div-search-ad').slideUp(1000, function(){
                    $('#div-search-user').slideDown(1000);
                }); 
            }else{
                $('#btnSearch-user').addClass("clicked");
                $('#div-search-user').slideDown(1000);
            }
        }
   });

   $('.a-logout').click(function(e){
          e.preventDefault();
          $.post({
              url:'rest/userService/logout',
              success: function(){
                    window.location.href = "search.html";
              }
          });
   });

   //Returning back from a specific ad
   $('#btnBack').click(function(){
         $('#div-ad').fadeOut(300, function(){
              $('#form-ads').trigger("submit");
         });
         
   });

   //Returning back from a specific user
   $('#btnBack-detailsUser').click(function(){
        $('#div-user').hide();
        $('#div-table-users').show(); 
   });


   $('#form-users').submit(function(e){
    e.preventDefault();
    let name = $('#user-name').val();
    let city = $('#user-city').val();
    let nameEntered = true;
    let cityEntered = true;
    if(!name){
        nameEntered = false;
    }
    if(!city){
        cityEntered = false;
    }
    if(!name && !city){
        $('#msg-search-user').text("You have to fill at least one field.").css("color","red").show().delay(2000).fadeOut(1000);
        return;
    }

    $.get({
        url:'rest/userService/users',
        success: function(users){
            $('#table-users tbody').empty();
            for(let user of users){
                let foundName = false;
                let foundCity = false;
                if(nameEntered){
                    let userName = user.name.toLowerCase(); 
                    let partsName = name.split(" "); //split the input in words
                    for(let i=0;i<partsName.length;i++){
                        if(userName.includes(partsName[i].toLowerCase())){
                            foundName = true;
                        }
                    }

                }
                if(cityEntered){
                     if(city === user.city){
                         foundCity = true;
                     }
                }

                if(nameEntered && cityEntered && foundName && foundCity){
                    addUser(user);
                }
                if(!nameEntered && cityEntered && foundCity){
                    addUser(user);
                }
                if(!cityEntered && nameEntered && foundName){
                    addUser(user);
                }
            }
            $('#div-review').hide();
            $('#div-ad, #div-user').hide();
            $('#div-table-ads').hide();
            $('#div-table-users').show();
        }
    });
});

$('#form-ads').submit(function(e){
    e.preventDefault();

    let adName = $('#ad-name').val();
    let minPrice = $('#minPrice').val();
    let maxPrice = $('#maxPrice').val();
    let minLikes = $('#minLikes').val();
    let maxLikes = $('#maxLikes').val();
    let minED = $('#minED').val();
    let maxED = $('#maxED').val();
    let adCity = $('#ad-city').val();
    let status = $('#status').val();

     if(!adName && !minPrice && !maxPrice && !minLikes && !maxLikes && !minED && !maxED && !adCity && !status){
        $('#msg-search-ad').text("You have to fill at least one field.").css("color","red").show().delay(2000).fadeOut(1000);
        return;
     }
     let validDates = true;
     let validLikes = true;
     let validPrice = true;
     let message = "";

     if(minLikes > maxLikes){
         message += "Maximum number of likes has to be greater than minimum number of likes."
         validLikes = false;
     }
     if(minPrice > maxPrice){
         message += " Maximum price has to be higher than minimum price.";
         validPrice = false;
     }
     if(minED != ""){
        if(!validDate(minED)){
            message += " Min expiry date is not valid.";
            validDates = false;
        }
     }
     if(maxED != ""){
        if(!validDate(maxED)){
            message += " Max expiry date is not valid.";
            validDates = false;
        }
     }
     if(validDates){
         if(Date.parse(changeDateFormat(maxED))<Date.parse(changeDateFormat(minED))){
             message += " Max expiry date has to be after min expiry date.";
             validDates = false;
         }
     }
     if(!validDates || !validLikes || !validPrice){
        $('#msg-search-ad').text(message).css("color","red").show().delay(4000).fadeOut(1000);
        return;
     }

     $.get({
          url: 'rest/userService/currentUser',
          success: function(user){
            $.get({
                url: 'rest/adService/ads',
                success: function(ads){
                    $('#table-ads tbody').empty();
                    for(let ad of ads){
                      if(ad.deleted == false && ad.active == true){
                        let found = false;
                        if(adName != ""){
                            let partsName = adName.split(" ");
                            for(let i=0;i<partsName.length;i++){
                                if(ad.name.toLowerCase().includes(partsName[i].toLowerCase())){
                                    found = true;
                                }
                            }
                            if(!found){
                                continue; //go to the next iteration if the name doesn't exist
                            }
                        }
                        if(minPrice != ""){
                            if(ad.price<minPrice){
                                found = false;
                                continue;
                            }
                        }
                        if(maxPrice != ""){
                            if(ad.price>maxPrice){
                                found = false;
                                continue;
                            }
                        }
                        if(minLikes != ""){
                            if(ad.likes < minLikes){
                                found = false;
                                continue;
                            }
                        }
                        if(maxLikes != ""){
                            if(ad.likes > maxLikes){
                               found = false;
                               continue;
                            }
                        }
                        if(minED != ""){
                             if(Date.parse(changeDateFormat(ad.expiryDate)) < Date.parse(changeDateFormat(minED))){
                                 found = false;
                                 continue;
                             }
                        }
                        if(maxED != ""){
                           if(Date.parse(changeDateFormat(ad.expiryDate)) > Date.parse(changeDateFormat(maxED))){
                               found = false;
                               continue;
                           }
                       }
       
                       if(adCity != ""){
                           if(ad.city !== adCity){
                               found = false;
                               continue;
                           }
                       }
       
                       if(status != ""){
                           if(ad.status !== status){
                               found = false;
                               continue;
                           }
                       }

                       if(user == null){ //if a user is not logged in and the ad is found but it's in realization
                           if(ad.status == "In realization"){
                               continue;
                           }
                       }else{
                           if(user.role == "Administrator"){ //the same case if an admin is logged in
                            if(ad.status == "In realization"){
                               continue;
                            }
                           }
                       }
                       addAd(ad,user);
                   }
       
                }
                    $('#div-review').hide();
                    $('#div-ad, #div-user').hide();
                    $('#div-table-users').hide();
                    $('#div-table-ads').show();
                }
            });
       
          }
     });
});

$('#ad-edit-admin-photo').change(function(e){
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event){
        let base64 = reader.result;
        $('#div-edit-ad-admin-photo').attr("src",base64);
    }
});

$('#ad-edit-seller-photo').change(function(e){
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event){
        let base64 = reader.result;
        $('#div-edit-ad-seller img').attr("src",base64);
    }
});

});