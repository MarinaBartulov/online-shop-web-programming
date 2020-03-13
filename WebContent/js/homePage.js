function checkUser(){
    $.get({
       url: 'rest/userService/currentUser',
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
    $('#topnav-User').hide();    
    $('#topnav-noUser').show();
    $('#list-options').empty();
    let op1 = $('<li><a id="link-popular" href="">Top 10 most popular ads</a></li>');
    let op2 = $('<li><a href="search.html">Search ads or users</a></li>');
    $('#list-options').append(op1,op2);
    $('#btnOrder').hide();
    $('#btnFavourite').hide();
    $('#btnEdit').hide();
    $('#btnDelete').hide();
    $('#a-send-message').hide();
}
  
function showUserParts(user){
    $('#hello-user').text("Hello, " + user.username + "! (" + user.role + ")");
    $('#topnav-noUser').hide();
    $('#topnav-User').show();    
  
  
    if(user.role === "Administrator"){
        $('#a-profile').hide();
        $('#btnOrder').hide();
        $('#btnFavourite').hide();
        $('#btnEdit').show();
        $('#btnDelete').show();
        let op1 = $('<li><a id="new-category" href="">Create a new category</a></li>');
        let op2 = $('<li><a id="edit-categories" href="">Edit categories</a></li>');
        let op3 = $('<li><a id="change-type" href="">Change a user\'s type</a></li>');
        let op4 = $('<li><a id="banned-users" href="">Banned users</a></li>');
        let op5 = $('<li><a id="edit-ads" href="">Edit ads</a></li>');
        let op6 = $('<li><a id="new-message" href="">Compose a new message</a></li>');
        let op7 = $('<li><a id="sent-messages" href="">Sent messages</a></li>');
        let op8 = $('<li><a id="received-messages" href="">Received messages</a></li>');
        $('#list-options').append(op1,op2,op3,op4,op5,op6,op7,op8);
        $('#new-category').click(clickedNewCategory());
        $('#edit-categories').click(clickedEditCategories());
        $('#change-type').click(clickedChangeType());
        $('#new-message').click(clickedNewMessage());
        $('#received-messages').click(clickedReceivedMessages());
        $('#sent-messages').click(clickedSentMessages());
        $('#edit-ads').click(clickedEditAds());
        $('#banned-users').click(clickedBannedUsers());
  
    }else if(user.role === "Seller"){
        $('#a-profile').show();
        $('#btnOrder').hide();
        $('#btnFavourite').hide();
        $('#btnEdit').hide();
        $('#btnDelete').hide();
        $('#a-send-message').hide();
        if(user.numberOfBans>3){
            $('#hello-user').html("Hello, " + user.username + "! (<del>" + user.role + "</del> BANNED)");
            $('#hello-user').css("color","red");
        }

  
    }else{ //customer
        $('#a-profile').show();
        $('#btnOrder').show();
        $('#btnFavourite').show();
        $('#btnEdit').hide();
        $('#btnDelete').hide();
        $('#a-send-message').show();
    }
}

//ALL
function showCategories(){
    $('#ul-categories').empty();
  $.get({
      url:'rest/categoryService/categories',
      success: function(categories){
          for(let cat of categories){
              if(cat.deleted == false){
                 addCategory(cat);
              }
          }
      }
 });
}


function addCategory(category){
    let ul = $('#ul-categories');
    let li = $('<li></li>');
    let a = $('<a href="">' + category.name + '</a>');
    a.attr("id","li-" + category.id); //when I change a name or remove a category
    a.click(clickCategory(category));
    li.append(a);
    ul.append(li);
}

function clickCategory(category){
  return function(e){
      e.preventDefault();
      $('#table-ads tbody').empty();
      $('#main-div-ad').hide();
      $('#admin-main-div-new-category').hide();
      $('#admin-main-div-edit-categories').hide();
      $('#admin-main-div-edit-category').hide();
      $('#admin-main-div-change-type').hide();
      $('#main-div-edit-ad').hide();
      $('#div-new-message-seller').hide();
      $('#div-new-message').hide();
      $('#div-received-messages').hide();
      $('#div-sent-messages').hide();
      $('#div-message-sent').hide();
      $('#div-message').hide();
      $('#div-edit-ads').hide();
      $('#div-banned-users').hide();
      $('#main-title').text("Category: " + category.name);
      $.get({
        url:'rest/adService/ads',
        success: function(ads){
            for(let ad of ads){                                                                                                               
                if(category.ads.includes(ad.id) && ad.status !== "In realization" && ad.deleted == false && ad.active == true){ //added this because here I retrieve all the ads and I have to filter them
                    addAd(ad,"category"); //mode added here because of returning back
                }
            }
        }
     });
     $('#main-div-table').show();
}
}

//ALL
function showPopularAds(){
    $('#main-title').text("Top 10 most popular ads");
    $('#table-ads tbody').empty();
    $('#main-div-ad').hide();
    $('#admin-main-div-new-category').hide();
    $('#admin-main-div-edit-categories').hide();
    $('#admin-main-div-edit-category').hide();
    $('#admin-main-div-change-type').hide();
    $('#main-div-edit-ad').hide();
    $('#div-new-message-seller').hide();
    $('#div-new-message').hide();
    $('#div-received-messages').hide();
    $('#div-sent-messages').hide();
    $('#div-message-sent').hide();
    $('#div-message').hide();
    $('#div-edit-ads').hide();
    $('#div-banned-users').hide();
    $.get({
        url:'rest/adService/popularAds',
        success: function(ads){ 
            for(let ad of ads){ //selection of ads which are removed or in realization or inactive is done on the server
                addAd(ad,"top"); //mode added here because of returning back
            }
            $('#main-div-table').show();
        }
   });
  }

  //ALL                  
function addAd(ad,mode){ //mode will be category or top, so that I know where details about ads are shown from
    let table = $('#table-ads tbody');
    let tr = $('<tr></tr>');
    tr.attr("id","tr-" + ad.id); //to be able to remove an ad when I order it
    let tdImg = $('<td></td>').addClass("tdImg");
    let img = $('<img>').addClass("imgAd");
    img.attr("src",ad.photo);
    img.attr("alt","");
    tdImg.append(img);
    let tdName = $("<td>" + ad.name + "</td>").addClass("tdName");
    let tdDesc = $("<td>" + ad.description + "</td>").addClass("tdDesc");
    let tdPrice = $("<td>" + ad.price + "</td>").addClass("tdPrice");
    tr.append(tdImg);
    tr.append(tdName);
    tr.append(tdDesc);
    tr.append(tdPrice);
    tr.click(clickAd(ad,mode));
    table.append(tr);
  }
  

function clickAd(ad,mode){
  return function(){
  $('#spanName').text(ad.name);
  $('#spanPrice').text(ad.price);
  $('#spanDesc').text(ad.description);
  $('#main-div-ad img').attr("src",ad.photo);
  $('#spanLikes').text(ad.likes);
  $('#spanDislikes').text(ad.dislikes);
  $('#spanPDate').text(ad.postingDate);
  $('#spanEDate').text(ad.expiryDate);
  if(ad.active){
      $('#spanActive').text("Yes");
  }else{
      $('#spanActive').text("No");
  }
  $('#spanCity').text(ad.city);
  $.get({
       url:'rest/userService/getSeller/' + ad.id,
       success: function(seller){
        $('#spanSeller').text(seller.name + " " + seller.surname + " (" + seller.username + ")");
       }
  });
  $.get({
      url:'rest/userService/currentUser',
      success: function(user){
        if(user != null){
          if(user.role === "Customer"){    
              $('#btnOrder').off("click"); //remove previously added click event to this button, this is required because this one button is used for everything
              $('#btnFavourite').off("click");
              $('#btnOrder').click(clickedOrder(ad));
              $('#btnFavourite').click(clickedFavourite(ad));
              if(user.favouriteAds.includes(ad.id)){ //to be able to see if a customer has already added the ad in the favorites list
                 $('#btnFavourite').text("Added to favourite").addClass("clickedFave");
              }else{
                $('#btnFavourite').text("Add to favourite").removeClass("clickedFave");
              }
              $('#a-send-message').off("click");
              $('#a-send-message').click(showFormNewMessage(ad));
          }
          if(user.role === "Administrator"){ 
              $("#btnEdit").off("click"); //remove a previous click event from some other ad on this button
              $("#btnDelete").off("click");
              $('#btnEdit').click(clickedEdit(ad));
              $('#btnDelete').click(clickedDelete(ad,mode));
              $('#a-send-message').off("click");
              $('#a-send-message').click(showFormNewMessage(ad));
          }
      }
    }
  }); 
  $('#table-review tbody').empty();
  $.get({
      url:'rest/reviewService/reviews',
      success: function(reviews){
          for(let r of reviews){
              if(ad.reviews.includes(r.id) && r.deleted == false){
                  addReview(r);
              }
          }
      }
  });
  
   
//adding different event handlers to the back button; this and mode are added, so that everything can be refreshed when an ad is updated, this can't be done just with hide and show
  if(mode === "category"){
            $('#btnBack').off("click");
            $('#btnBack').click(showCategory(ad.id));   
            $('#main-div-table').hide();
            $('#main-div-ad').show();
  }
  if(mode === "top"){
        $('#btnBack').off("click");
        $('#btnBack').click(showTop());
        $('#main-div-table').hide();
        $('#main-div-ad').show();
  }
  if(mode === "edit"){
      $('#btnBack').off("click");
      $('#btnBack').click(function(){
           showEditAds();
      });
      $('#div-edit-ads').hide();
      $('#main-div-ad').show();
  }
  
}
}


//showing the form for sending a message from an ad to a seller 
function showFormNewMessage(ad){
    return function(e){
        e.preventDefault();
        $('#seller-msg-title').val("");
        $('#seller-msg-content').val("");
        $('#form-new-message-seller').off("submit");
        $('#form-new-message-seller').submit(sendMessageSeller(ad));
        $('#main-div-ad').fadeOut(300,function(){
            $('#div-new-message-seller').fadeIn(300);
        });
    }
}

//submit for the form for sending a message from an ad to a seller
function sendMessageSeller(ad){
    return function(e){
        e.preventDefault();
    let title = $('#seller-msg-title').val();
    let content = $('#seller-msg-content').val();
    $.post({
        url:'rest/messageService/messageForSeller/' + ad.id,
        data: JSON.stringify({"title":title,"content":content}),
        contentType: 'application/json',
        success: function(){
            $('#msg-msg-seller').text("Message sent").css("color","green").show().delay(1000).fadeOut(500,function(){
                $('#div-new-message-seller').fadeOut(300,function(){
                    $('#main-div-ad').fadeIn(300);
                 });
            });
        },
        error: function(message){
            $('#msg-msg-seller').text(message.responseText).css("color","red").show().delay(1000).fadeOut(500);
        }
    });
}
}
                           
function showCategory(id){ //to reload all the ads if someone is returning back and the ad is updated
    return function(){
      $('#table-ads tbody').empty();
      $('#main-div-ad').hide();
      $('#admin-main-div-new-category').hide();
      $('#admin-main-div-edit-categories').hide();
      $('#admin-main-div-edit-category').hide();
      $('#admin-main-div-change-type').hide();
      $('#div-new-message-seller').hide();
      $('#main-div-edit-ad').hide();
      $('#div-new-message').hide();
      $('#div-received-messages').hide();
      $('#div-sent-messages').hide();
      $('#div-message-sent').hide();
      $('#div-message').hide();
      $('#div-edit-ads').hide();
      $('#div-banned-users').hide();

      $.get({
        url:'rest/categoryService/whichCategory/' + id,
        success: function(category){ //returns a category which the ad belongs to
            $('#main-title').text("Category: " + category.name);
            $.get({
              url:'rest/adService/ads',
              success: function(ads){
                  for(let ad of ads){                                                                                                  
                      if(category.ads.includes(ad.id) && ad.status !== "In realization" && ad.deleted == false && ad.active == true){ //added this because I here retrieve all the ads and I have to filter them
                          addAd(ad,"category");
                      }
                  }
              }
           });
           $('#main-div-table').show();
          }
        });
    }   
}

function showTop(){
    return function(){
        $('#main-title').text("Top 10 most popular ads");
        $('#table-ads tbody').empty();
        $('#main-div-ad').hide();
        $('#admin-main-div-new-category').hide();
        $('#admin-main-div-edit-categories').hide();
        $('#admin-main-div-edit-category').hide();
        $('#admin-main-div-change-type').hide();
        $('#main-div-edit-ad').hide();
        $('#div-new-message-seller').hide();
        $('#div-new-message').hide();
        $('#div-received-messages').hide();
        $('#div-sent-messages').hide();
        $('#div-message-sent').hide();
        $('#div-message').hide();
        $('#div-edit-ads').hide();
        $('#div-banned-users').hide();
        $.get({
          url:'rest/adService/popularAds',
          success: function(ads){
              for(let ad of ads){ //selection of ads which are removed or in realization is done on the server
                  addAd(ad,"top");
              }
              $('#main-div-table').show();
        }
      });
    }
}
//***********************Everything above is added for back************* */
//ALL
function addReview(review){
    let table = $('#table-review tbody');
    let tr = $('<tr></tr>');
    tr.attr("id","trReview-" + review.id); //to be able to remove it when admin removes it
    let tdUser = $('<td>' + review.reviewer + '</td>');
    let tdTitle = $('<td>' + review.title + '</td>');
    let tdContent = $('<td>' + review.content + '</td>');
    tr.append(tdUser).append(tdTitle).append(tdContent);
    table.append(tr);
    tr.click(showReview(review));
  }

  function showReview(review){
      return function(){
          $('#review-title').text(review.title);
          $('#review-reviewer').text(review.reviewer);
          $('#review-content').text(review.content);
          $('#div-review img').attr("src",review.photo);
          if(review.descriptionTrue){
              $('#review-description').text("Yes");
          }else{
            $('#review-description').text("No");
          }
          if(review.respectedAgreement){
              $('#review-agreement').text("Yes");
          }else{
              $('#review-agreement').text("No");
          }
          
          $(window).scrollTop(0); 
          $('#main-div-ad').hide();
          $('#div-review').show();
      }
  }


//CUSTOMER
function clickedOrder(ad){
    return function(){
        $.post({
            url: 'rest/adService/orderAd/' + ad.id,
            success: function(){
                $('#main-div-ad').fadeOut(2000,function(){
                    $('#tr-' + ad.id).remove();
                    $('#main-div-table').show();
                });
            },
            error: function(message){
                alert(message.responseText);
            }
        });
    }
}

//CUSTOMER
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

//ADMIN
function clickedDelete(ad,mode){
    return function(){
        $.ajax({
           url: 'rest/adService/deleteAdAdmin/' + ad.id,
           type: 'DELETE',
           success: function(){
               if(mode === "top" || mode === "category"){
                $('#main-div-ad').fadeOut(2000,function(){
                $('#tr-' + ad.id).remove();
                $('#main-div-table').show();
            });
        }  
               if(mode === "edit"){
                $('#main-div-ad').fadeOut(2000,function(){
                    $('#tr-edit-' + ad.id).remove();
                    $('#div-edit-ads').show();
               });
           }
        },
           error: function(message){
            alert(message.responseText);
        }
        });

    }
}

//ADMIN
function clickedEdit(ad){
    return function(){
        $('#ad-edit-name').val(ad.name);
        $('#ad-edit-price').val(ad.price);
        $('#ad-edit-description').val(ad.description);
        $('#ad-edit-pdate').val(ad.postingDate);
        $('#ad-edit-edate').val(ad.expiryDate);
        if(ad.active){
            $('#ad-edit-active-yes').prop("checked",true);
        }else{
            $('#ad-edit-active-no').prop("checked",true);
        }
        $('#ad-edit-city').val(ad.city);
    
        $('#main-div-edit-ad-photo').attr("src",ad.photo);
        $('#ad-edit-photo').val("");

        $('#form-edit-ad').off("submit");
        $("#form-edit-ad").submit(submitEditAd(ad));
        $.get({
            url:'rest/categoryService/categories',
            success: function(categories){
                let selectCategory = $('#ad-edit-new-category');
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
            }
        })
        $('#ad-edit-table-review tbody').empty();
          $.get({
              url:'rest/reviewService/reviews',
              success: function(reviews){
                 for(let r of reviews){
                     if(ad.reviews.includes(r.id) && r.deleted == false){
                       addReviewEdit(r);
                    
                    }
               }
            }
       });
       
        $('#main-div-ad').hide();
        $('#main-div-edit-ad').show();
    }
}

function changeDateFormat(date){
    let parts = date.split("/");
    let newDate = parts[1] + "/" + parts[0] + "/" + parts[2];
    return newDate;       
}


function validDate (d) {
    let parts = d.split("/");
    let newD = parts[1] + "/" + parts[0] + "/" + parts[2];
    let date = new Date(newD); //gives the correct day
    let day = "" + date.getDate();
    if(day.length == 1)
        day = "0" + day;
    let month = "" + (date.getMonth() + 1); //getMonth gives a number that is month=correctMonth-1, so for the date 31/09/2019 a month will be 9 and a day 1
    if(month.length == 1)
        month = "0"+ month;
    let year = "" + date.getFullYear();

    return ((month + "/" + day + "/" + year) == newD);
}

function submitEditAd(ad){
    return function(e){
        e.preventDefault();
          let name = $('#ad-edit-name').val();
          let price = $('#ad-edit-price').val();
          let desc = $('#ad-edit-description').val();
          let city = $('#ad-edit-city').val();
          let pdate = $('#ad-edit-pdate').val();
          let edate = $('#ad-edit-edate').val();
          if(!validDate(pdate) || !validDate(edate)){
              $('#ad-edit-msg').text("Please enter a valid date").css("color","red").show().delay(2000).fadeOut(500);
              return;
          }
          if(Date.parse(changeDateFormat(pdate))> Date.parse(changeDateFormat(edate))){
            $('#ad-edit-msg').text("Expiry date has to be bigger than posting date.").css("color","red").show().delay(2000).fadeOut(500);
            return;
          }
          let active;
          if($('#ad-edit-active-yes').prop("checked")){
              active = true;
          }
          if($('#ad-edit-active-no').prop("checked")){
              active = false;
          }
          let photo = $('#main-div-edit-ad-photo').attr("src"); 
          let categoryID = $('#ad-edit-new-category').val(); //get id from a category

          let reviewsForDelete = [];
          $('input:checkbox[name="r-delete"]:checked').each(function(){ //collect reviews for removing
            reviewsForDelete.push($(this).val()); //ids of reviews for removing
          });

          $.ajax({                                               
              url: 'rest/reviewService/deleteReviews/' + ad.id, //remove reviews which are checked, send the ad's id so that the seller can be found
              type: 'DELETE',
              data: JSON.stringify(reviewsForDelete),
              contentType: 'application/json',
              success: function(){ //updated the ad
                $.ajax({
                    url:'rest/adService/editAdAdmin/' + ad.id + '/' + categoryID + '/' + reviewsForDelete.length, //added this for the number of removed ads
                    type: 'PUT',
                    data: JSON.stringify({"name":name,"price":price,"description":desc, "photo":photo, "postingDate":pdate,"expiryDate":edate,"active":active,"city":city}),
                    contentType: 'application/json',
                    success: function(){  
                           showCategories(); //to add updated category, with updated ads on click
                           showChangedAd(ad.id); //show updated ad
                    }
                });
              }
          });
    }
}



//ADMIN
function addReviewEdit(review){ 
    let table = $('#ad-edit-table-review tbody');
    let tr = $('<tr></tr>');
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
    let tdDelete = $('<td style="text-align:center;"><input type="checkbox" form="form-edit-ad" name="r-delete" value="' + review.id + '"></td>');
    tr.append(tdUser,tdTitle,tdContent,tdPhoto,tdDesc,tdAgree,tdDelete);
    table.append(tr);
  }
   
  
   function showChangedAd(id){ //to show an ad after an admin updates it
    $.get({
        url:'rest/adService/ad/' + id,
        success: function(ad){
            $('#spanName').text(ad.name);
            $('#spanPrice').text(ad.price);
            $('#spanDesc').text(ad.description);
            $('#main-div-ad img').attr("src",ad.photo);
            $('#spanLikes').text(ad.likes);
            $('#spanDislikes').text(ad.dislikes);
            $('#spanPDate').text(ad.postingDate);
            $('#spanEDate').text(ad.expiryDate);
            if(ad.active){
                $('#spanActive').text("Yes");
            }else{
                $('#spanActive').text("No");
            }
            $('#spanCity').text(ad.city);
            $('#main-div-ad-photo').attr("src",ad.photo);
                                        
            $("#btnEdit").off("click"); //remove previous click from some other ad on this button
            $("#btnDelete").off("click");
            $('#btnEdit').click(clickedEdit(ad));
            $('#btnDelete').click(clickedDelete(ad));

            $('#table-review tbody').empty();
            $.get({
                url:'rest/reviewService/reviews',
                success: function(reviews){
                    for(let r of reviews){
                        if(ad.reviews.includes(r.id) && r.deleted == false){
                            addReview(r);
                        }
                    }
                }
            });
            
            $('#main-div-edit-ad').fadeOut(1000,function(){
                $('#main-div-ad').show();
            });
            
        }
    });   
   }


//***************************************************ADMIN************************************************************************** */
function clickedNewCategory(){
  return function(e){
      e.preventDefault();
      $('#main-div-table').hide();
      $('#main-div-ad').hide();
      $('#admin-main-div-edit-categories').hide();
      $('#admin-main-div-edit-category').hide();
      $('#admin-main-div-change-type').hide();
      $('#main-div-edit-ad').hide();
      $('#div-new-message-seller').hide();
      $('#div-new-message').hide();
      $('#div-received-messages').hide();
      $('#div-sent-messages').hide();
      $('#div-message-sent').hide();
      $('#div-message').hide();
      $('#div-edit-ads').hide();
      $('#div-banned-users').hide();
      $('#category-name').val("");  
      $('#category-description').val("");
      $('#admin-main-div-new-category').show();
      $('#main-title').text("Creating a new category");
  }
}
     

function clickedEditCategories(){
  return function(e){
        e.preventDefault();
        $('#main-div-table').hide();
        $('#main-div-ad').hide();
        $('#admin-main-div-new-category').hide();
        $('#admin-main-div-edit-category').hide();
        $('#admin-main-div-change-type').hide();
        $('#main-div-edit-ad').hide();
        $('#div-new-message-seller').hide();
        $('#div-new-message').hide();
        $('#div-received-messages').hide();
        $('#div-sent-messages').hide();
        $('#div-message-sent').hide();
        $('#div-message').hide();
        $('#div-edit-ads').hide();
        $('#div-banned-users').hide();
        $('#main-title').text("Editing categories");
        $('#table-edit-categories tbody').empty();
        showAdminCategories();


  }
}

function showAdminCategories(){
  $('#table-edit-categories tbody').empty();
  $.get({
      url: 'rest/categoryService/categories',
      success: function(categories){
          for(let cat of categories){
              if(cat.deleted == false){
                  addAdminCategory(cat);
              }
          }
      }
  });
  $('#admin-main-div-edit-categories').show();
}

function addAdminCategory(category){
  let table = $('#table-edit-categories tbody');
  let tr = $('<tr></tr>');
  tr.attr("id",category.id);
  let tdName = $('<td>' + category.name + '</td>');
  let tdDesc = $('<td>' + category.description + '</td>');
  let tdEdit = $('<td><a id="edit-' + category.id + '" href="">Edit</a></td>');
  let tdDelete = $('<td><a id="delete-' + category.id + '" href="">Delete</a></td>');
  tr.append(tdName,tdDesc,tdEdit,tdDelete);
  table.append(tr);
  $('#delete-' + category.id).click(clickDeleteCategory(category));
  $('#edit-' + category.id).click(clickEditCategory(category));
  
}

function clickDeleteCategory(category){ //when I delete a category, I have to delete all the ads which belongs to it, send messages to the seller and all the users 
  return function(e){                 //who have ordered those ads from the category and they have status IN REALIZATION or DELIVERED
     e.preventDefault();                                       
     $.ajax({                         
         url:"rest/categoryService/deleteCategory/" + category.id,
         type: "DELETE",
         success: function(){ 
             showCategories(); 
             $('#' + category.id).remove();    
         },
         error: function(message){
             alert(message.responseText);
         }

     });
  }
}

function clickEditCategory(category){
      return function(e){
          e.preventDefault();
          $('#admin-main-div-edit-categories').hide();
          $('#edit-category-name').val(category.name);
          $('#edit-category-description').val(category.description);
          $('#form-edit-category').off("submit");
          $('#form-edit-category').submit(submitEditCategory(category));
          $('#admin-main-div-edit-category').show();
      }
  } 
 
  //submit for the form for a category update
 function submitEditCategory(category){
     return function(e){
         e.preventDefault();
         let name = $('#edit-category-name').val();
         let description = $('#edit-category-description').val();
          if(!name || !description){
            $('#edit-msg-category').text("Please enter a name and description.").css("color","red").show().delay(3000).fadeOut();
             return;
        }
      $.ajax({
          url:'rest/categoryService/editCategory/' + category.id,
          data: JSON.stringify({"name":name, "description":description}),
          type:"PUT",
          contentType: 'application/json',
          success: function(){ 
            $('#edit-msg-category').text("Category has been successfully changed.").css("color","green").show().delay(3000).fadeOut(2000, function(){
              showCategories(); 
              $('#admin-main-div-edit-category').hide();
              showAdminCategories();
            });
          },
          error: function(message){
            $('#edit-msg-category').text(message.responseText).css("color","red").show().delay(3000).fadeOut();
          }
      });
     }
 } 
  
  
function clickedChangeType(){
  return function(e){
      e.preventDefault();
      showUsersForChange();
}
}  

function showUsersForChange(){
  $.get({
      url:'rest/userService/users',
      success: function(users){
          let table = $('#table-change-type tbody');
          table.empty();
          for(let user of users){
          let tr = $('<tr></tr>');
          let tdUsername = $('<td>' + user.username + '</td>');
          let tdName = $('<td>' + user.name + '</td>');
          let tdSurname = $('<td>' + user.surname + '</td>');
          let tdCurrentType = $('<td>' + user.role + '</td>');
          let tdType = $('<td></td>');
          let tdChange = $('<td></td>');
          let sel;
          let btnChange;
          if(user.role === "Customer"){
             sel = $('<select id="type-'+ user.username + '"><option value="none"></option><option value = "Seller">Seller</option><option value = "Administrator">Administrator</option>');
             btnChange = $('<button>Change</button>');
             btnChange.click(changeType(user));
          }else if(user.role === "Seller"){
              sel = $('<select id="type-'+ user.username + '"><option value="none"></option><option value = "Customer">Customer</option><option value = "Administrator">Administrator</option>');
             btnChange = $('<button>Change</button>');
             btnChange.click(changeType(user));
          }else{
              sel = "&times;";
              btnChange = "&times;"
          }
          tdType.append(sel);
          tdChange.append(btnChange);
          tr.append(tdUsername,tdName,tdSurname,tdCurrentType,tdType,tdChange);
          table.append(tr);
          $('#main-div-table').hide();
          $('#main-div-ad').hide();
          $('#admin-main-div-new-category').hide();
          $('#admin-main-div-edit-category').hide();
          $('#admin-main-div-edit-categories').hide();
          $('#main-div-edit-ad').hide();
          $('#div-new-message-seller').hide();
          $('#div-new-message').hide();
          $('#div-received-messages').hide();
          $('#div-sent-messages').hide();
          $('#div-message-sent').hide();
          $('#div-message').hide();
          $('#div-edit-ads').hide();
          $('#div-banned-users').hide();
          $('#main-title').text("Changing users' type");
          $('#admin-main-div-change-type').show();
      }
       
      }
  });
}

function changeType(user){
  return function(){
       let type = $('#type-' + user.username).val();
       if(type === "none"){
           return;
       }else{
           $.ajax({
               url:'rest/userService/changeType/' + user.username + '/' + type,
               type: 'PUT',
               success: function(){
                   showUsersForChange();
               } 
           });
       }
  }
}

//when I click on new messages
function clickedNewMessage(){
    return function(e){
        e.preventDefault();
        $('#main-div-table').hide();
        $('#main-div-ad').hide();
        $('#admin-main-div-new-category').hide();
        $('#admin-main-div-edit-category').hide();
        $('#admin-main-div-edit-categories').hide();
        $('#main-div-edit-ad').hide();
        $('#admin-main-div-change-type').hide();
        $('#div-new-message-seller').hide();
        $('#div-received-messages').hide();
        $('#div-sent-messages').hide();
        $('#div-message-sent').hide();
        $('#div-message').hide();
        $('#div-edit-ads').hide();
        $('#div-banned-users').hide();
        $('#main-title').text("Compose a new message");
        $('#form-new-message').trigger("reset");
        $('#div-new-message').show();
    }
}  

//when I click on received messages
function clickedReceivedMessages(){
    return function(e){
        e.preventDefault();
        $('#table-received-messages tbody').empty();
        $.get({
             url: 'rest/messageService/messages',
             success: function(messages){
                 $.get({
                     url: 'rest/userService/currentUser',
                     success: function(user){
                          for(let msg of messages){
                            if(user.receivedMessages.includes(msg.id) && msg.deleted == false){
                            addReceivedMessage(msg);
                      }
                      $('#main-div-table').hide();
                      $('#main-div-ad').hide();
                      $('#admin-main-div-new-category').hide();
                      $('#admin-main-div-edit-category').hide();
                      $('#admin-main-div-edit-categories').hide();
                      $('#main-div-edit-ad').hide();
                      $('#admin-main-div-change-type').hide();
                      $('#div-new-message').hide();
                      $('#div-new-message-seller').hide();
                      $('#div-sent-messages').hide();
                      $('#div-message-sent').hide();
                      $('#div-message').hide();
                      $('#div-edit-ads').hide();
                      $('#div-banned-users').hide();
                      $('#main-title').text("Received messages");
                      $('#div-received-messages').show();
                      }
                   }
                 });
          }
        });
}}
function addReceivedMessage(msg){
    let table = $('#table-received-messages tbody');
    let tr = $('<tr></tr>');
    let sender = $('<td>' + msg.sender + '</td>');
    let title = $('<td>' + msg.title + '</td>');
    let ad = $('<td>' + msg.adName + '</td>');
    let dateTime = $('<td>' + msg.dateTime + '</td>');
    tr.append(sender,title,ad,dateTime);
    tr.click(clickedMsg(msg));
    table.append(tr);
}
    
function clickedMsg(msg){
    return function(){
            $('#msg-title').text(msg.title);
            $('#msg-from').text(msg.sender);
            $('#msg-to').text(msg.recipient);
            $('#msg-adName').text(msg.adName);
            $('#msg-time').text(msg.dateTime);
            $('#msg-content').text(msg.content);
            $('#div-received-messages').hide();
            $('#div-reply').hide();
            $('#div-message').show();
    }
}

//when I click on sent messages
function clickedSentMessages(){
    return function(e){
        e.preventDefault();
        showSentMessages();
    }
}

function showSentMessages(){
    $('#table-sent-messages tbody').empty();
    $.get({
        url: 'rest/messageService/messages',
        success: function(messages){
            $.get({
                url: 'rest/userService/currentUser',
                success: function(user){
                    for(let msg of messages){
                      if(user.sentMessages.includes(msg.id) && msg.deleted == false){
                        addSentMessage(msg);
                      }
                }
                $('#main-div-table').hide();
                $('#main-div-ad').hide();
                $('#admin-main-div-new-category').hide();
                $('#admin-main-div-edit-category').hide();
                $('#admin-main-div-edit-categories').hide();
                $('#main-div-edit-ad').hide();
                $('#admin-main-div-change-type').hide();
                $('#div-new-message-seller').hide();
                $('#div-new-message').hide();
                $('#div-received-messages').hide();
                $('#div-message-sent').hide();
                $('#div-message').hide();
                $('#div-edit-ads').hide();
                $('#div-banned-users').hide();
                $('#main-title').text("Sent messages");
                $('#div-sent-messages').show();
                }
        });  
      }    
    });
}

function addSentMessage(msg){
    let table = $('#table-sent-messages tbody');
    let tr = $('<tr></tr>');
    let recipient = $('<td>' + msg.recipient + '</td>');
    let title = $('<td>' + msg.title + '</td>');
    let ad = $('<td>' + msg.adName + '</td>');
    let dateTime = $('<td>' + msg.dateTime + '</td>');
    let tdDelete = $('<td><a href="" id="msg-' + msg.id + '">Delete</a></td>')
    tr.append(recipient,title,ad,dateTime,tdDelete);
    tr.click(clickedMsgSent(msg));
    tdDelete.click(clickedDeleteMsg(msg));
    table.append(tr);
}

function clickedDeleteMsg(msg){
    return function(e){
        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            url: 'rest/messageService/deleteMessage/' + msg.id,
            type: 'DELETE',
            success: function(){
                $('#msg-' + msg.id).parent().parent().remove();
            }
        });
    }
}

function clickedMsgSent(msg){
    return function(){
        $('#msg-sent-title').text(msg.title);
        $('#msg-sent-from').text(msg.sender);
        $('#msg-sent-to').text(msg.recipient);
        $('#msg-sent-adName').text(msg.adName);
        $('#msg-sent-time').text(msg.dateTime);
        $('#msg-sent-content').text(msg.content);
        $('#btnConfirm').off("click");
        $('#btnConfirm').click(clickedConfirm(msg));
        $('#div-edit').hide(); //hide the form for update
        $('#div-sent-messages').hide();
        $('#div-message-sent').show();
  }   
}

function clickedConfirm(msg){
    return function(){
    let content = $('#edit-message').val();
    if(!content){
        $('#msg-msg-sent').text("Please enter a content of the message.").css("color","red");
    }else{
        $('#msg-msg-sent').text("Message changed").css("color","green");
    $.ajax({
        url: 'rest/messageService/editMessage/' + msg.id,
        type: 'PUT',
        data: JSON.stringify({"content":content}),
        contentType: 'application/json',
        success:function(){
            $('#msg-sent-content').text(content);
            $('#div-edit').slideUp(1000);
        }
    });
   }
 }
}

function clickedEditAds(){
    return function(e){
        e.preventDefault();
        showEditAds();
    }
}

function showEditAds(){
    $.get({
        url:'rest/adService/getSortedAds',
        success: function(ads){
            $('#table-edit-ads tbody').empty();

            for(let ad of ads){
                if(ad.deleted === false){
                   addEditAd(ad);
                }
            }

            $('#main-div-table').hide();
            $('#main-div-ad').hide();
            $('#admin-main-div-new-category').hide();
            $('#admin-main-div-edit-category').hide();
            $('#admin-main-div-edit-categories').hide();
            $('#main-div-edit-ad').hide();
            $('#admin-main-div-change-type').hide();
            $('#div-new-message-seller').hide();
            $('#div-new-message').hide();
            $('#div-received-messages').hide();
            $('#div-message-sent').hide();
            $('#div-message').hide();
            $('#div-sent-messages').hide();
            $('#div-edit-ads').hide();
            $('#div-banned-users').hide();
            $('#main-title').text("Edit ads");
            $('#div-edit-ads').show();
        }
    });
}

function addEditAd(ad){
    let tr = $('<tr></tr>');
    tr.attr("id","tr-edit-" + ad.id);
    let tdName = $('<td>' + ad.name + '</td>');
    let tdDescription = $('<td>' + ad.description + '</td>');
    $.get({
      url: 'rest/categoryService/whichCategory/' + ad.id,
      success: function(cat){
           let tdCat = $('<td>' + cat.name + '</td>');
           tr.append(tdName,tdDescription,tdCat);
           tr.click(clickAd(ad,"edit"));
           $('#table-edit-ads tbody').append(tr);
      }
    });
}

function clickedBannedUsers(){
    return function(e){
        e.preventDefault();
        showBannedUsers();
    }
}

function showBannedUsers(){
    $('#table-banned-users tbody').empty();
    $.get({
        url: 'rest/userService/users',
        success: function(users){
            for(let user of users){
                if(user.role === "Seller"){ 
                    if(user.numberOfBans >3){
                        addBannedUser(user);
                    }
                }
            }
            $('#main-div-table').hide();
            $('#main-div-ad').hide();
            $('#admin-main-div-new-category').hide();
            $('#admin-main-div-edit-category').hide();
            $('#admin-main-div-edit-categories').hide();
            $('#main-div-edit-ad').hide();
            $('#admin-main-div-change-type').hide();
            $('#div-new-message-seller').hide();
            $('#div-new-message').hide();
            $('#div-received-messages').hide();
            $('#div-message-sent').hide();
            $('#div-message').hide();
            $('#div-sent-messages').hide();
            $('#div-edit-ads').hide();
            $('#div-edit-ads').hide();
            $('#main-title').text("Banned users");
            $('#div-banned-users').show();

        }
    });
}

function addBannedUser(user){
    let table = $('#table-banned-users tbody');
    let tr = $('<tr></tr>');
    let tdUsername = $('<td>' + user.username + '</td>');
    let tdName = $('<td>' + user.name + '</td>');
    let tdSurname = $('<td>' + user.surname + '</td>');
    let aRemoveBan = $('<a href="">Remove ban</a>');
    let tdRemoveBan = $('<td></td>');
    tdRemoveBan.append(aRemoveBan);
    tr.append(tdUsername,tdName,tdSurname,tdRemoveBan);
    aRemoveBan.click(removeBan(user));
    table.append(tr);
}

function removeBan(user){
    return function(e){
        e.preventDefault();
        $.ajax({
            url:'rest/userService/removeBan/' + user.username,
            type: 'PUT',
            success: function(){
                 showBannedUsers();
            },
            error: function(message){
                alert(message.responseText);
            }
        });
    }
}


/**************************************************************DOCUMENT READY***************************************************************** */

$(document).ready(function(){
 
  showCategories();
  showPopularAds();
  checkUser();
   

  //link for logout
  $('#a-logout').click(function(e){
    e.preventDefault();
     $.post({
         url:'rest/userService/logout',
         success: function(){   
          window.location.href = "homePage.html";
         }
     }) 
     
  });

  //link for going to the profile
  $('#a-profile').click(function(e){
      e.preventDefault();
      $.get({
          url:'rest/userService/currentUser',
          success: function(user){
              if(user.role === "Customer" || user.role === "Seller"){
                  window.location.href="profile.html";
              }
             
          }
      })
  });

  //show top 10 ads
  $('#link-popular').click(function(e){
      e.preventDefault();
      showPopularAds();

  });


  //form for adding a new category
  $('#form-new-category').submit(function(e){
      e.preventDefault();
      let name = $('#category-name').val();
      let description = $('#category-description').val();
      if(!name || !description){
          $('#msg-category').text("Please enter a name and description.").css("color","red").show().delay(3000).fadeOut();
          return;
      }
      $.post({
          url:'rest/categoryService/addCategory',
          data: JSON.stringify({"name":name, "description":description}),
          contentType: 'application/json',
          success: function(){ 
            $('#msg-category').text("New category has been successfully created.").css("color","green").show().delay(3000).fadeOut();
            $('#category-name').val("");  
            $('#category-description').val("");
            showCategories(); 
          },
          error: function(message){
            $('#msg-category').text(message.responseText).css("color","red").show().delay(3000).fadeOut();
          }
      });
  });   
  
    //button for leaving an ad update and returning to the ad
    $('#btnCancelEdit').click(function(){
            $('#main-div-edit-ad').fadeOut(1000, function(){
                   $('#main-div-ad').show();
            });
    });
    
    //stop writing a message to a seller on an ad
    $('#btn-seller-msg-cancel').click(function(){
        $('#div-new-message-seller').fadeOut(300,function(){
            $('#main-div-ad').fadeIn(300);
         });
      });
    //returning from a review to an ad  
    $('#btnBack-review').click(function(){
        $('#div-review').fadeOut(300,function(){
              $('#main-div-ad').fadeIn(300);
        });
    }); 
    //leaving the form for a category update
    $('#btnCancelEditCategory').click(function(){
         $('#admin-main-div-edit-category').fadeOut(300,function(){
            $('#admin-main-div-edit-categories').fadeIn(300);
         });
    });

    $('#ad-edit-photo').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#main-div-edit-ad-photo').attr("src",base64);
        }
    });

//creating a new message
$('#form-new-message').submit(function(e){
    e.preventDefault();
    let to = $('#new-msg-to').val();
    let adName = $('#new-msg-adName').val();
    let title = $('#new-msg-title').val();
    let content = $('#new-msg-content').val();

    $.post({
        url:'rest/messageService/newMessage',
        data: JSON.stringify({"adName":adName,"title":title,"content":content,"recipient":to}),
        contentType: 'application/json',
        success: function(){
            $('#msg-msg-new').text("Message sent").css("color","green").show().delay(2000).fadeOut(1000, function(){
                $('#div-new-message').fadeOut(300, function(){
                    showPopularAds();
                });
                
            });
        },
        error: function(message){
            $('#msg-msg-new').text(message.responseText).css("color","red").show();
        }
    });
}); 
    
$('#new-msg-cancel').click(function(){
    $('#div-new-message').fadeOut(300, function(){
        showPopularAds(); 
    });
});

//show a received message
$('#btnBack-received').click(function(){
   $('#div-message').fadeOut(1000,function(){
        $('#div-received-messages').show();    
    });
});
$('#btnReply').click(function(){
    $('#reply-message').val("");
    $('#msg-msg').text("");
    $('#div-reply').slideDown(1000);
});

$('#btnSend').click(function(){
       let title = $('#msg-title').text();
       let adName = $('#msg-adName').text();
       let recipient = $('#msg-from').text();
       let content = $('#reply-message').val();
       if(!content){
           $('#msg-msg').text("Please enter a content of the message.").css("color","red");
       }else{
           $('#msg-msg').text("Message sent").css("color","green");
       $.post({
           url: 'rest/messageService/replyMessage',
           data: JSON.stringify({"adName":adName,"title":title,"content":content,"recipient":recipient}),
           contentType: 'application/json',
           success:function(){
               $('#div-reply').slideUp(1000);
           }
       });
    }
});

$('#btnCancelSend').click(function(){
       $('#div-reply').slideUp(1000); 
});

//show a sent message
$('#btnBack-sent').click(function(){
    $('#div-message-sent').fadeOut(1000,function(){
            showSentMessages(); //to be able to see the change, because if I do just show then the old messages will remain attached to the message click   
    });
});
$('#btnEdit-sent').click(function(){
    $('#edit-message').val($('#msg-sent-content').text());
    $('#msg-msg-sent').text("");
    $('#div-edit').slideDown(1000);
});

$('#btnCancelConfirm').click(function(){
       $('#div-edit').slideUp(1000); 
});
     

});

