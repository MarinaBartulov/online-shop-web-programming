function checkUser(){
    $.get({
        url:'rest/userService/currentUser',
        success: function(user){
            if(user == null){
                window.location.href = "login.html";
            }else{
                if(user.role === "Administrator"){
                    $('#title-name').text("There is no logged in seller or customer.");
                }else{
                    if(user.role === "Customer"){
                       showCustomerParts();
                       $('#title-name').text(user.name + ' ' + user.surname + ' (' + user.role + ')');
                    }
                    else if(user.role === "Seller"){
                       showSellerParts();
                       $('#title-name').text(user.name + ' ' + user.surname + ' (' + user.role + ')');
                       if(user.numberOfBans>3){
                            $('#a-new-ad').html("<del>Create a new ad</del>");
                            $('#a-new-ad').addClass("disabled");
                       }else{
                            $('#a-new-ad').html("Create a new ad");
                            $('#a-new-ad').removeClass("disabled");
                       }
                }
            }
            }
            
        }
    });
}

function showCustomerParts(){
    $('#ul-seller').hide();
    $('#ul-customer').show();
    $('#ul-common').show();
    $('#div-likes-dislikes, #div-reviews, #div-review, #div-ads, #div-ad-seller, #div-ad-review, #div-edit-ad, #div-new-ad').hide(); //samo za prodavca vezano, ne moram da se skriva kod stvari od kupca 
}

function showSellerParts(){
    $('#ul-customer').hide();
    $('#ul-seller').show();
    $('#ul-common').show();
    $('#div-delivered, #div-ordered, #div-favourite, #div-ad');
    $('#div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide(); //this is all related to a customer
    $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide(); //this is all related to a customer
}

/*Display of ordered ads*/
function addAdOrdered(ad){
    let table = $('#table-ordered tbody');
    let tr = $('<tr></tr>');
    let tdPhoto = $('<td><img src="' + ad.photo + '"alt=""></td>');
    let tdName = $('<td>' + ad.name + '</td>');
    let tdDesc = $('<td>' + ad.description + '</td>');
    let tdDelivered = $('<td><button class="btnDelivered" id="btnDelivered-' + ad.id + '">Delivered</button></td>');
    tr.append(tdPhoto,tdName,tdDesc,tdDelivered);
    tr.click(clickedOrderedAd(ad)); //show details about an ad
    table.append(tr);
    $('#btnDelivered-' + ad.id).click(clickedDelivered(ad));
}

function clickedOrderedAd(ad){
    return function(){
        $('#div-ad img').attr("src",ad.photo);
        $('#spanName').text(ad.name);
        $('#spanPrice').text(ad.price);
        $('#spanDesc').text(ad.description);
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
            url: 'rest/userService/getSeller/' + ad.id,
            success: function(user){
                 $('#spanSeller').text(user.name + ' ' + user.surname + ' (' + user.username + ')');
            }
        });
        $('#btnBack').off("click");
        $('#btnBack').click(function(){
                $('#div-ad').fadeOut(1000,function(){
                    $('#div-ordered').show();
                });
        });
        $('#btnOrder').hide(); //when I click on an ordered ad then order button is hidden
        $('#div-ordered').hide();
        $('#div-ad').show();
    }
}

function clickedDelivered(ad){
    return function(e){
        e.stopPropagation();
        $.ajax({
            url:'rest/adService/deliverAd/' + ad.id,
            type: 'PUT',
            success: function(){
                  showOrderedAds();
            },
            error: function(message){
                alert(message.responseText);
            }
        });
    }
}

function showOrderedAds(){
    $('#table-ordered tbody').empty();
    $.get({
        url:'rest/adService/ads',
        success: function(ads){
            $.get({
                url:'rest/userService/currentUser',
                success:function(user){
                     for(let ad of ads){
                         if(user.orderedAds.includes(ad.id) && ad.deleted == false){
                            addAdOrdered(ad);
                         }
                     }
                     $('#div-delivered, #div-favourite, #div-add-review').hide();
                     $('#div-received-messages, #div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
                     $('#div-ad, #div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
                     $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide();
                     $('#div-ordered').show();
                }
            });
        }
    });
}

/*Display of delivered ads*/
function addAdDelivered(deliveredAd,user){
    let table = $('#table-delivered tbody');
    let tr = $('<tr></tr>');
    let tdName;
    $.get({
        url:'rest/adService/ad/' + deliveredAd.adID,
        success: function(ad){
            if(ad.deleted === false){
                tdName = $('<td>' + ad.name + '</td>');
            }
            else{
                tdName = $('<td>' + ad.name + ' (DELETED)</td>');      
           }
           let tdSeller = $('<td>' + deliveredAd.seller + '</td>');
           let tdDateTime = $('<td>' + deliveredAd.dateTime + '</td>');
           let tdDetailsAd = $('<td><a href="" id="ad-' + deliveredAd.id + '">Details about ad</a></td>');
           let tdDetailsSeller = $('<td><a href="" id="seller-' + deliveredAd.id + '">Details about seller</a></td>');
           tr.append(tdName,tdSeller,tdDateTime,tdDetailsAd,tdDetailsSeller);
           table.append(tr);
           $('#ad-' + deliveredAd.id).click(clickedDetailsAd(deliveredAd,ad,user));
           $('#seller-' + deliveredAd.id).click(clickedDetailsSeller(deliveredAd,ad,user));
        }
    });
    
}

/****************************************************Adding reviews and ratings to ads**********************************************/

function clickedDetailsAd(deliveredAd,ad,user){
    return function(e){
        e.preventDefault();
                $('#div-new-review-ad').hide();
                $('#spanAdName').text(ad.name);
                $('#spanAdPrice').text(ad.price);
                $('#spanAdDesc').text(ad.description);
                $('#spanAdLikes').text(ad.likes);
                $('#spanAdDislikes').text(ad.dislikes);
                $('#spanAdPDate').text(ad.postingDate);
                $('#spanAdEDate').text(ad.expiryDate);
                if(ad.active){
                    $('#spanAdActive').text("Yes");
                }else{
                    $('#spanAdActive').text("No");
                }
                $('#spanAdCity').text(ad.city);
                $.get({
                    url: 'rest/userService/getSeller/' + ad.id,
                    success: function(seller){
                        if(seller == null){
                            $('#spanAdSeller').text("This user has changed role and it's not seller anymore.");
                        }else{
                            $('#spanAdSeller').text(seller.name + ' ' + seller.surname + ' (' + seller.username + ')');
                        }
                    }
                });

                if(ad.deleted === true){
                    $('#btnLikeAd, #btnDislikeAd, #btnReportAd, #btnReviewAd').prop("disabled",true);
                }else{
                    $('#btnLikeAd, #btnDislikeAd, #btnReportAd, #btnReviewAd').prop("disabled",false);
                }

                //button for returning back
                $('#btnBack-detailsAd').off("click");
                $('#btnBack-detailsAd').click(function(){
                        $('#div-details-ad').fadeOut(1000,function(){
                            showDeliveredAds(); //to load updated ads on click
                        });
                });
                //button for like
                $('#btnLikeAd').off("click");
                $('#btnLikeAd').click(clickedLikeAd(ad));
                //button for dislike
                $('#btnDislikeAd').off("click");
                $('#btnDislikeAd').click(clickedDislikeAd(ad));

                if(ad.listLikes.includes(user.username)){
                    $('#btnLikeAd').addClass("btnClicked");
                }else{
                    $('#btnLikeAd').removeClass("btnClicked");
                }

                if(ad.listDislikes.includes(user.username)){
                    $('#btnDislikeAd').addClass("btnClicked");
                }else{
                    $('#btnDislikeAd').removeClass("btnClicked");
                }

                $('#btnReportAd').off("click");
                $('#btnReportAd').click(reportAd(deliveredAd));

                 //I have to check if a user has already left a review
                $.get({
                url: 'rest/reviewService/findReview/' + deliveredAd.idReviewForAd,
                success: function(review){
                    let exists;
                    if(review == null){
                        exists = false;
                    }else{
                        if(review.deleted == true){
                            exists = false;
                        }else{
                            exists = true;
                        }
                    }

                    if(!exists){
                        $('#btnReviewAd').off("click");
                        $('#btnReviewAd').text("Add a review");
                        $('#btnReviewAd').click(function(){
                            $('#form-new-review-ad').trigger("reset");
                            $('#div-new-review-ad img').attr("src","");
                            $('#div-new-review-ad').slideDown(1000);
                        });
                        $('#form-new-review-ad').off("submit");
                        $('#form-new-review-ad').submit(sendReviewAd(deliveredAd.id, ad.id));
                        $('#btnCancelNew-ad').off("click");
                        $('#btnCancelNew-ad').click(function(){
                            $('#div-new-review-ad').slideUp(1000);
                        });
                    }else{
                        $('#btnReviewAd').off("click");
                        $('#btnReviewAd').text("Show review");
                        $('#btnReviewAd').click(showReviewAd(review));
                    }
                    $('#div-delivered').hide();
                    $('#div-details-ad').show();

                }
            });
    }
}

function reportAd(deliveredAd){
    return function(){
        if(deliveredAd.reportAd === true){
            $('#msg-review-ad').text("You have already reported this ad.").css("color","red").show().delay(2000).fadeOut(1000);
        }else{
        $.ajax({
            url:'rest/userService/reportAd/' + deliveredAd.id,
            type:'PUT',
            success: function(deliveredAd){
                $('#msg-review-ad').text("You have successfully reported this ad.").css("color","blue").show().delay(2000).fadeOut(1000);
                $('#btnReportAd').off("click");
                $('#btnReportAd').click(reportAd(deliveredAd));
            } 
        });
    }
    }
}

function clickedLikeAd(ad){ 
    return function(){
    $.ajax({
        url:'rest/adService/likeAd/' + ad.id,
        type: 'PUT',
        success: function(ad1){
            if($('#btnDislikeAd').hasClass("btnClicked")){
                $('#btnDislikeAd').removeClass("btnClicked");
            }
            $('#btnLikeAd').toggleClass("btnClicked");
            $('#spanAdLikes').text(ad1.likes);
            $('#spanAdDislikes').text(ad1.dislikes);
        },
         error: function(){
            alert("Something went wrong on server");
        }
    });
}
}
    
function clickedDislikeAd(ad){
    return function(){
    $.ajax({
        url:'rest/adService/dislikeAd/' + ad.id,
        type: 'PUT',
        success: function(ad1){
            if($('#btnLikeAd').hasClass("btnClicked")){
                $('#btnLikeAd').removeClass("btnClicked");
            }
            $('#btnDislikeAd').toggleClass("btnClicked");
            $('#spanAdLikes').text(ad1.likes);
            $('#spanAdDislikes').text(ad1.dislikes);
        },
        error: function(){
            alert("Something went wrong on server.");
        }
    });
}
}

//submit for the form for adding reviews
function sendReviewAd(deliveredAdID,adID){
    return function(e){
    e.preventDefault();
    let title = $('#title-review-ad').val();
    let content = $('#content-review-ad').val();
    let desc = $('input[name="desc-review-ad"]:checked').val();
    let agreement = $('input[name="agreement-review-ad"]:checked').val(); 
    let photo = $('#div-new-review-ad img').attr("src");
    let valid = true;
    let message = "";
    if(!title || !content || !desc){
        message = "You have to enter title, content and information whether description is true or not. Photo is no mandatory.";
        valid = false;
    }
    if(!agreement){
        message += " Please choose if the agreement was respected."
        valid = false;
    }
    if(!valid){
        $('#msg-review-ad').text(message).show().delay(7000).fadeOut().css("color","red");
        return;
    }
    let descValue;
    if(desc === "yes"){
          descValue = true;
    }else{
        descValue = false;
    }
    let agreementValue;
    if(agreement === "yes"){
        agreementValue = true;
    }else{
        agreementValue = false;
    }
    $.post({
        url: 'rest/reviewService/addReviewAd/' + deliveredAdID + '/' + adID,
        data: JSON.stringify({"title":title,"content":content,"descriptionTrue":descValue,"respectedAgreement": agreementValue,"photo":photo}),
        contentType: 'application/json',
        success: function(review){
            $('#msg-review-ad').text("Review successfully added!").css("color","green").show().delay(1500).fadeOut(function(){
                     $('#div-new-review-ad').slideUp(500);         
            });
            $('#btnReviewAd').off("click");
            $('#btnReviewAd').text("Show review");
            $('#btnReviewAd').click(showReviewAd(review));            
        },
        error: function(message){
            alert(message.responseText);
        }
    });
 }
}


//show details about a review
function showReviewAd(r){
    return function(){
    
                     $('#review-title-ad').text(r.title);
                     $('#review-content-ad').text(r.content);
                     if(r.descriptionTrue){
                         $('#review-desc-ad').text("Yes");
                     }else{
                         $('#review-desc-ad').text("No");
                     }
                     if(r.respectedAgreement){
                        $('#review-agreement-ad').text("Yes");
                     }else{
                        $('#review-agreement-ad').text("No");
                     }
                     $('#div-data-review-ad img').attr("src",r.photo);
                     $('#div-details-ad').fadeOut(500,function(){
                         $('#div-data-review-ad').fadeIn(500);
                         $('#btnEdit-review-ad').off("click");
                         $('#btnEdit-review-ad').click(showEditReviewAd(r));
                         $('#btnDelete-review-ad').off("click");
                         $('#btnDelete-review-ad').click(deleteReviewAd(r));
                         $('#btnBack-review-ad').click(function(){
                            $('#div-data-review-ad').fadeOut(500,function(){
                                $('#div-details-ad').fadeIn(500);
                         });
                     });
                 });
}
}

//show the form for a review update
function showEditReviewAd(r){
    return function(){
          $('#title-edit-review-ad').val(r.title);
          $('#content-edit-review-ad').val(r.content);
          if(r.descriptionTrue){
              $('#desc-edit-review-ad-yes').prop("checked",true);
          }else{
            $('#desc-edit-review-ad-no').prop("checked",true);
          }
          if(r.respectedAgreement){
            $('#agreement-edit-review-ad-yes').prop("checked",true);
           }else{
            $('#agreement-edit-review-ad-no').prop("checked",true);
           }
          $('#div-edit-review-ad img').attr("src",r.photo);
          $('#form-edit-review-ad').off("submit");
          $('#form-edit-review-ad').submit(editReviewAd(r));
          $('#btnCancelEdit-ad').off("click");
          $('#btnCancelEdit-ad').click(function(){
              $('#div-edit-review-ad').fadeOut(500,function(){
                    $('#div-data-review-ad').fadeIn(500);
              });
          });
          $('#div-data-review-ad').fadeOut(500,function(){
                   $('#div-edit-review-ad').fadeIn(500); 
          });
    }
}
//submit for the form for update
function editReviewAd(r){
    return function(e){
        e.preventDefault();
        let title = $('#title-edit-review-ad').val();
        let content = $('#content-edit-review-ad').val();
        let desc = $('input[name="desc-edit-review-ad"]:checked').val();
        let agreement = $('input[name="agreement-edit-review-ad"]:checked').val();
        let photo = $('#div-edit-review-ad img').attr("src");
        let valid = true;
        let message = "";
        if(!title || !content || !desc || !agreement){
           message = "You have to enter title, content and information about description and agreement. Photo is not mandatory.";
           valid = false;
        }
        if(!valid){
          $('#msg-edit-review-ad').text(message).show().delay(7000).fadeOut().css("color","red");
            return;
        }
        let descValue;
        if(desc === "yes"){
          descValue = true;
        }else{
          descValue = false;
       }
       let agreementValue;
       if(agreement === "yes"){
           agreementValue = true;
       }else{
           agreementValue = false;
       }

    $.ajax({
        url: 'rest/reviewService/editReview/' + r.id,
        type: 'PUT',
        data: JSON.stringify({"title":title,"content":content,"descriptionTrue":descValue,"respectedAgreement":agreementValue, "photo":photo}),
        contentType: 'application/json',
        success: function(r){
            $('#msg-edit-review-ad').text("Review successfully edited!").css("color","green").show().delay(1500).fadeOut(1000,function(){
                                 $('#review-title-ad').text(r.title);
                                 $('#review-content-ad').text(r.content);
                                 if(r.descriptionTrue){
                                     $('#review-desc-ad').text("Yes");
                                 }else{
                                     $('#review-desc-ad').text("No");
                                 }
                                 if(r.respectedAgreement){
                                    $('#review-agreement-ad').text("Yes");
                                }else{
                                    $('#review-agreement-ad').text("No");
                                }
                                 $('#div-data-review-ad img').attr("src",r.photo);
                                 $('#div-edit-review-ad').fadeOut(500,function(){
                                    $('#div-data-review-ad').fadeIn(500);
                                    $('#btnEdit-review-ad').off("click");
                                    $('#btnEdit-review-ad').click(showEditReviewAd(r));
                                    $('#btnDelete-review-ad').off("click");
                                    $('#btnDelete-review-ad').click(deleteReviewAd(r));
                                    //added this
                                    $('#btnReviewAd').off("click");
                                    $('#btnReviewAd').click(showReviewAd(r)); 
                                    $('#btnBack-review-ad').click(function(){
                                       $('#div-data-review-ad').fadeOut(500,function(){
                                         $('#div-details-ad').fadeIn(500);
                                });
                                 });
                            });                  
            });          
    },
        error: function(message){
            alert(message.responseText);
        }     
    });
}
}

function deleteReviewAd(r){
    return function(){
         $.ajax({
             url:'rest/reviewService/deleteReview/' + r.id,
             type: 'DELETE',
             success: function(){
                    $('#msg-data-review-ad').text("Review successfully deleted.").css("color","green").show().delay(1000).fadeOut(500, function(){
                    $('#div-data-review-ad').fadeOut(500, function(){
                        $('#div-details-ad').fadeIn(500);
                    }); 
                    $('#btnReviewAd').off("click");
                    $('#btnReviewAd').text("Add a review");
                    $('#form-new-review-ad').trigger("reset");
                    $('#div-new-review-ad img').attr("src","");
                    $('#btnReviewAd').click(function(){
                    $('#div-new-review-ad').slideDown(1000);
                     });
           });      
         }
     });
    }
}

/*************************************************Adding reviews and ratings for a seller*******************************************/
function clickedDetailsSeller(deliveredAd,ad,user){
    return function(e){
        e.preventDefault();
        $('#div-new-review-seller').hide();
        $.get({
            url: 'rest/userService/getUser/' + deliveredAd.seller,
            success: function(seller){
                if(seller.role !== "Seller"){ //if they changed a role from a seller to something else 
                    alert("This user has changed a role and it's not a seller anymore.");
                    return;
                }
                $('#spanUsername').text(seller.username);
                $('#spanSellerName').text(seller.name);
                $('#spanSellerSurname').text(seller.surname);
                $('#spanPhoneNumber').text(seller.phoneNumber);
                $('#spanEmail').text(seller.email);
                $('#spanSellerCity').text(seller.city);
                $('#spanSellerLikes').text(seller.likes);
                $('#spanSellerDislikes').text(seller.dislikes);
                $('#spanDateReg').text(seller.dateOfReg);

                //button for returning back
                $('#btnBack-detailsSeller').off("click");
                $('#btnBack-detailsSeller').click(function(){
                    $('#div-details-seller').fadeOut(1000,function(){
                       showDeliveredAds(); //to be able to load updated ads with other reviews, and sellers too
                    });
                });
                
                if(ad.deleted === true){
                    $('#btnLikeSeller, #btnDislikeSeller, #btnReportSeller, #btnReviewSeller').prop("disabled",true);
                }else{
                    $('#btnLikeSeller, #btnDislikeSeller, #btnReportSeller, #btnReviewSeller').prop("disabled",false);
                }

                //button for like
                 $('#btnLikeSeller').off("click");
                 $('#btnLikeSeller').click(clickedLikeSeller(deliveredAd.seller));
                //button for dislike
                 $('#btnDislikeSeller').off("click");
                 $('#btnDislikeSeller').click(clickedDislikeSeller(deliveredAd.seller));

                 $('#btnReportSeller').off("click");
                 $('#btnReportSeller').click(reportSeller(deliveredAd));

                 if(seller.listLikes.includes(user.username)){
                    $('#btnLikeSeller').addClass("btnClicked");
                }else{
                    $('#btnLikeSeller').removeClass("btnClicked");
                }
                if(seller.listDislikes.includes(user.username)){
                    $('#btnDislikeSeller').addClass("btnClicked");
                }else{
                    $('#btnDislikeSeller').removeClass("btnClicked");
                }

                $.get({
                    url: 'rest/reviewService/findReview/' + deliveredAd.idReviewForSeller,
                    success: function(review){
                        let exists;
                        if(review == null){
                            exists = false;
                        }else{
                            if(review.deleted == true){
                                exists = false;
                            }else{
                                exists = true;
                            }
                        }
                        if(!exists){
                            $('#btnReviewSeller').off("click");
                            $('#btnReviewSeller').text("Add a review");
                            $('#btnReviewSeller').click(function(){
                                $('#form-new-review-seller').trigger("reset");
                                 $('#div-new-review-seller img').attr("src","");
                                 $('#div-new-review-seller').slideDown(1000);
                            });
                            $('#form-new-review-seller').off("submit");
                            $('#form-new-review-seller').submit(sendReviewSeller(deliveredAd.id,deliveredAd.adID,deliveredAd.seller));
                            $('#btnCancelNew-seller').off("click");
                            $('#btnCancelNew-seller').click(function(){
                                $('#div-new-review-seller').slideUp(1000);
                            });
                        }else{
                            $('#btnReviewSeller').off("click");
                            $('#btnReviewSeller').text("Show review");
                            $('#btnReviewSeller').click(showReviewSeller(review));  
                        }
                        $('#div-delivered').hide();
                        $('#div-details-seller').show();
                    }
                });
          }      
    });       
 }
}

function reportSeller(deliveredAd){
    return function(){
        if(deliveredAd.reportSeller === true){
            $('#msg-review-seller').text("You have already reported this seller.").css("color","red").show().delay(2000).fadeOut(1000);
        }else{
        $.ajax({
            url:'rest/userService/reportSeller/' + deliveredAd.id,
            type:'PUT',
            success: function(deliveredAd){
                $('#msg-review-seller').text("You have successfully reported this seller.").css("color","blue").show().delay(2000).fadeOut(1000);
                $('#btnReportSeller').off("click");
                $('#btnReportSeller').click(reportSeller(deliveredAd));
            } 
        });
    }
    }
}

function clickedLikeSeller(seller){ 
    return function(){
    $.ajax({
        url:'rest/userService/likeSeller/' + seller,
        type: 'PUT',
        success: function(seller1){
            if($('#btnDislikeSeller').hasClass("btnClicked")){
                $('#btnDislikeSeller').removeClass("btnClicked");
            }
            $('#btnLikeSeller').toggleClass("btnClicked");
            $('#spanSellerLikes').text(seller1.likes);
            $('#spanSellerDislikes').text(seller1.dislikes);
        },
         error: function(){
            alert("Something went wrong on the server.");
        }
    });
}
}

function clickedDislikeSeller(seller){
    return function(){
    $.ajax({
        url:'rest/userService/dislikeSeller/' + seller,
        type: 'PUT',
        success: function(seller1){
            if($('#btnLikeSeller').hasClass("btnClicked")){
                $('#btnLikeSeller').removeClass("btnClicked");
            }
            $('#btnDislikeSeller').toggleClass("btnClicked");
            $('#spanSellerLikes').text(seller1.likes);
            $('#spanSellerDislikes').text(seller1.dislikes);
        },
        error: function(){
            alert("Something went wrong on the server.");
        }
    });
}
}

//submit for the form for adding a review
function sendReviewSeller(deliveredAdID,adID,seller){
    return function(e){
    e.preventDefault();
    let title = $('#title-review-seller').val();
    let content = $('#content-review-seller').val();
    let desc = $('input[name="desc-review-seller"]:checked').val();
    let agreement = $('input[name="agreement-review-seller"]:checked').val();
    let photo = $('#div-new-review-seller img').attr("src");
    let valid = true;
    let message = "";
    if(!title || !content || !agreement || !desc){
        message = "You have to enter title, content and information about description and agreement. Photo is no mandatory.";
        valid = false;
    }
    if(!valid){
        $('#msg-review-seller').text(message).show().delay(7000).fadeOut().css("color","red");
        return;
    }
    let descValue;
    if(desc === "yes"){
          descValue = true;
    }else{
        descValue = false;
    }
    let agreementValue;
    if(agreement === "yes"){
        agreementValue = true;
    }else{
        agreementValue = false;
    }
    $.post({
        url: 'rest/reviewService/addReviewSeller/' + deliveredAdID + '/' + adID + '/' + seller,
        data: JSON.stringify({"title":title,"content":content,"respectedAgreement":agreementValue,"descriptionTrue":descValue, "photo":photo}),
        contentType: 'application/json',
        success: function(review){
            $('#msg-review-seller').text("Review successfully added!").css("color","green").show().delay(1500).fadeOut(function(){
                     $('#div-new-review-seller').slideUp(500);         
            });
            $('#btnReviewSeller').off("click");
            $('#btnReviewSeller').text("Show review");
            $('#btnReviewSeller').click(showReviewSeller(review));            
        },
        error: function(message){
            alert(message.responseText);
        }
    });
 }
}

//show details about a review
function showReviewSeller(r){
    return function(){
    
            $('#review-title-seller').text(r.title);
            $('#review-content-seller').text(r.content);
            if(r.respectedAgreement){
                $('#review-agreement-seller').text("Yes");
            }else{
                $('#review-agreement-seller').text("No");
            }
            if(r.respectedAgreement){
                $('#review-desc-seller').text("Yes");
                }else{
                $('#review-desc-seller').text("No");
                }
            $('#div-data-review-seller img').attr("src",r.photo);
            $('#div-details-seller').fadeOut(500,function(){
            $('#div-data-review-seller').fadeIn(500);
            $('#btnEdit-review-seller').off("click");
            $('#btnEdit-review-seller').click(showEditReviewSeller(r));
            $('#btnDelete-review-seller').off("click");
            $('#btnDelete-review-seller').click(deleteReviewSeller(r));
            $('#btnBack-review-seller').click(function(){
                $('#div-data-review-seller').fadeOut(500,function(){
                    $('#div-details-seller').fadeIn(500);
                });
            });
    });
  }
}

//show the form for a review update
function showEditReviewSeller(r){
    return function(){
          $('#title-edit-review-seller').val(r.title);
          $('#content-edit-review-seller').val(r.content);
          if(r.respectedAgreement){
              $('#agreement-edit-review-seller-yes').prop("checked",true);
          }else{
            $('#agreement-edit-review-seller-no').prop("checked",true);
          }
          if(r.descriptionTrue){
            $('#desc-edit-review-seller-yes').prop("checked",true);
          }else{
             $('#desc-edit-review-seller-no').prop("checked",true);
          }
          $('#div-edit-review-seller img').attr("src",r.photo);
          $('#form-edit-review-seller').off("submit");
          $('#form-edit-review-seller').submit(editReviewSeller(r));
          $('#btnCancelEdit-seller').off("click");
          $('#btnCancelEdit-seller').click(function(){
              $('#div-edit-review-seller').fadeOut(500,function(){
                    $('#div-data-review-seller').fadeIn(500);
              });
          });
          $('#div-data-review-seller').fadeOut(500,function(){
                   $('#div-edit-review-seller').fadeIn(500); 
          });
    }
}

//submit for the form for update
function editReviewSeller(r){
    return function(e){
        e.preventDefault();
        let title = $('#title-edit-review-seller').val();
        let content = $('#content-edit-review-seller').val();
        let agreement = $('input[name="agreement-edit-review-seller"]:checked').val();
        let desc = $('input[name="desc-edit-review-seller"]:checked').val();
        let photo = $('#div-edit-review-seller img').attr("src");
        let valid = true;
        let message = "";
        if(!title || !content || !agreement || !desc){
           message = "You have to enter title, content and information description and agreement. Photo is no mandatory.";
           valid = false;
        }
        if(!valid){
          $('#msg-edit-review-seller').text(message).show().delay(7000).fadeOut().css("color","red");
            return;
        }
        let agreementValue;
        if(agreement === "yes"){
          agreementValue = true;
        }else{
          agreementValue = false;
       }
        let descValue;
        if(desc === "yes"){
            descValue = true;
        }else{
            descValue = false;
        }

    $.ajax({
        url: 'rest/reviewService/editReview/' + r.id,
        type: 'PUT',
        data: JSON.stringify({"title":title,"content":content,"respectedAgreement":agreementValue,"descriptionTrue":descValue, "photo":photo}),
        contentType: 'application/json',
        success: function(r){
            $('#msg-edit-review-seller').text("Review successfully edited!").css("color","green").show().delay(1500).fadeOut(1000,function(){
                                 $('#review-title-seller').text(r.title);
                                 $('#review-content-seller').text(r.content);
                                 if(r.respectedAgreement){
                                     $('#review-agreement-seller').text("Yes");
                                 }else{
                                     $('#review-agreement-seller').text("No");
                                 }
                                 if(r.descriptionTrue){
                                    $('#review-desc-seller').text("Yes");
                                 }else{
                                    $('#review-desc-seller').text("No");
                                 }
                                 $('#div-data-review-seller img').attr("src",r.photo);
                                 $('#div-edit-review-seller').fadeOut(500,function(){
                                    $('#div-data-review-seller').fadeIn(500);
                                    $('#btnEdit-review-seller').off("click");
                                    $('#btnEdit-review-seller').click(showEditReviewSeller(r));
                                    $('#btnDelete-review-seller').off("click");
                                    $('#btnDelete-review-seller').click(deleteReviewSeller(r));
                                    $('#btnBack-review-seller').click(function(){
                                       $('#div-data-review-seller').fadeOut(500,function(){
                                         $('#div-details-seller').fadeIn(500);
                                });
                                 });
                            });                  
            });          
    },
        error: function(message){
            alert(message.responseText);
        }     
    });
}
}

function deleteReviewSeller(r){
    return function(){
         $.ajax({
             url:'rest/reviewService/deleteReview/' + r.id,
             type: 'DELETE',
             success: function(){
                    $('#msg-data-review-seller').text("Review successfully deleted.").css("color","green").show().delay(1000).fadeOut(500, function(){
                    $('#div-data-review-seller').fadeOut(500, function(){
                        $('#div-details-seller').fadeIn(500);
                    }); 
                    $('#btnReviewSeller').off("click");
                    $('#btnReviewSeller').text("Add a review");
                    $('#form-new-review-seller').trigger("reset");
                    $('#div-new-review-seller img').attr("src","");
                    $('#btnReviewSeller').click(function(){
                    $('#div-new-review-seller').slideDown(1000);
                     });
           });      
         }
     });
    }
}


function showDeliveredAds(){
    $.get({
        url:'rest/userService/currentUser',
        success: function(user){
              $('#table-delivered tbody').empty();               
              for(let dA of user.deliveredAdsCustomer){
                  addAdDelivered(dA,user);
              }
              $('#div-ordered, #div-favourite, #div-add-review').hide();
              $('#div-message, #div-sent-messages, #div-received-messages, #div-message-sent, #div-new-message').hide();
              $('#div-ad, #div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
              $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide();
              $('#div-delivered').show();
        }
    });
}

/*Display of favorite ads*/
function addFavourite(ad){
    let table = $('#table-favourite tbody');
    let tr = $('<tr></tr>');
    let tdPhoto = $('<td><img src="' + ad.photo + '" alt=""></td>')
    let tdName = $('<td>' + ad.name + '</td>');
    let tdDesc = $('<td>' + ad.description + '</td>');
    let tdRemove = $('<td><button class="btnRemove" id="remove-' + ad.id + '">Remove from Favourites</button></td>');
    tr.append(tdPhoto,tdName,tdDesc,tdRemove);
    tr.click(clickedFavouriteAd(ad));
    table.append(tr);
    $('#remove-' + ad.id).click(clickedRemoveFavourite(ad));

}

function clickedFavouriteAd(ad){
    return function(){
        $('#div-ad img').attr("src",ad.photo);
        $('#spanName').text(ad.name);
        $('#spanPrice').text(ad.price);
        $('#spanDesc').text(ad.description);
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
            url: 'rest/userService/getSeller/' + ad.id,
            success: function(user){
                 $('#spanSeller').text(user.name + ' ' + user.surname + ' (' + user.username + ')');
            }
        });
        $('#btnBack').off("click");
        $('#btnBack').click(function(){
                $('#div-ad').fadeOut(1000,function(){
                    $('#div-favourite').show();
                });
        });
        if(ad.status == "In realization"){
            $('#btnOrder').hide();
        }else{
        $('#btnOrder').off("click"); //when I click on a favorite ad then order appears if the ad isn't in realization
        $('#btnOrder').click(clickOrder(ad));
        $('#btnOrder').show();
        }
        $('#div-favourite').hide();
        $('#div-ad').show();
    }   
}

function clickOrder(ad){ //all the ads that are in favorites can be ordered because they are not in realization
    return function(e){
        e.preventDefault();
        $.post({
             url:'rest/adService/orderAd/' + ad.id,
             success: function(){
                 $('#msg-order').text("Ad has been successfully ordered.").css("color","green").show().delay(2000).fadeOut(1000, function(){
                    showFavouriteAds();
                 });
             }
        });
    }
}

function clickedRemoveFavourite(ad){
    return function(e){
        e.stopPropagation();
        $.ajax({
           url:'rest/adService/removeAdFromFavourite/' + ad.id,
           type:'DELETE',
           success: function(){
               $('#remove-' + ad.id).parent().parent().remove();
           },
           error: function(message){
             alert(message.responseText);
            }
       });
    }
}

function showFavouriteAds(){
    $('#table-favourite tbody').empty();
    $.get({
        url:'rest/adService/ads',
        success: function(ads){
             $.get({
                 url:'rest/userService/currentUser',
                 success: function(user){
                     for(let ad of ads){ //ads in realization are not in favorites and can't be ordered
                         if(user.favouriteAds.includes(ad.id) && ad.deleted == false){
                                addFavourite(ad);
                         }   
                     }
                 }
             });
        }
    });
    $('#div-ordered, #div-delivered, #div-add-review').hide();
    $('#div-message, #div-sent-messages, #div-received-messages, #div-message-sent, #div-new-message').hide();
    $('#div-ad, #div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
    $('#div-favourite').show();
}

//show delivered messages
function showReceivedMessages(){
    $('#table-received-messages tbody').empty();
    $.get({
        url: 'rest/messageService/messages',
        success: function(messages){
            $.get({
                url: 'rest/userService/currentUser',
                success: function(user){
                    for(let msg of messages){
                      if(user.receivedMessages.includes(msg.id) && msg.deleted === false){
                        addReceivedMessage(msg,user.role);
                      }
                }
                }
        });
        $('#div-ordered, #div-delivered, #div-add-review, #div-favourite').hide();
        $('#div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
        $('#div-ad, #div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
        $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide();
        $('#div-likes-dislikes, #div-reviews, #div-review').hide();
        $('#div-ads, #div-ad-seller, #div-ad-review').hide();
        $('#div-edit-ad, #div-new-ad').hide();
        $('#div-received-messages').show();
      }      
    });
}

function addReceivedMessage(msg,role){
    let table = $('#table-received-messages tbody');
    let tr = $('<tr></tr>');
    let sender = $('<td>' + msg.sender + '</td>');
    let title = $('<td>' + msg.title + '</td>');
    let ad = $('<td>' + msg.adName + '</td>');
    let dateTime = $('<td>' + msg.dateTime + '</td>');
    tr.append(sender,title,ad,dateTime);
    tr.click(clickedMsg(msg,role));
    table.append(tr);
}

function clickedMsg(msg,role){
    return function(){
          $('#msg-title').text(msg.title);
          $('#msg-from').text(msg.sender);
          $('#msg-to').text(msg.recipient);
          $('#msg-adName').text(msg.adName);
          $('#msg-time').text(msg.dateTime);
          $('#msg-content').text(msg.content);
          if(role === "Customer"){
              if(msg.roleOfSender === "Administrator"){ //if an admin sent a message to a customer then the customer can't reply to him but he can reply to a seller
                  $('#btnReply').hide();
              }else{
                  $('#btnReply').show();
              }
          }else{ //seller can reply both admins and customers who sent him a message
              $('#btnReply').show();
          }
          $('#div-received-messages').hide();
          $('#div-reply').hide();
          $('#div-message').show();
    }
}

//show sent messages
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
                }
        });
        $('#div-ordered, #div-delivered, #div-add-review, #div-favourite').hide();
        $('#div-message, #div-received-messages, #div-message-sent, #div-new-message').hide();
        $('#div-ad, #div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
        $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide();
        $('#div-likes-dislikes, #div-reviews, #div-review').hide();
        $('#div-ads, #div-ad-seller, #div-ad-review').hide();
        $('#div-edit-ad, #div-new-ad').hide();
        $('#div-sent-messages').show();
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


//show reviews of a seller on his profile
function showReviews(){
    $('#div-reviews tbody').empty();
    $.get({
        url:'rest/userService/currentUser',
        success: function(user){
           $.get({
               url:'rest/reviewService/reviews',
               success: function(reviews){
                    for(let r of reviews){
                        if(user.reviews.includes(r.id) && r.deleted == false){
                            addReview(r);
                        }
                    }
               }
           });
           $('#div-received-messages, #div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
           $('#div-likes-dislikes').hide();
           $('#div-review').hide();
           $('#div-ads, #div-ad-seller, #div-ad-review').hide();
           $('#div-edit-ad, #div-new-ad').hide();
           $('#div-reviews').show();
        }
    });
}

function addReview(r){
    $.get({
        url: 'rest/adService/ad/' + r.ad,
        success: function(ad){
            let table = $('#table-reviews tbody');
            let tr = $('<tr></tr>');
            let tdAd = $('<td>' + ad.name + '</td>');
            let tdReviewer = $('<td>' + r.reviewer + '</td>');
            let tdTitle = $('<td>' + r.title + '</td>');
            tr.append(tdAd,tdReviewer,tdTitle);
            tr.click(showReview(r,ad))
            table.append(tr);
        }
    });
}

function showReview(r,ad){
    return function(){
    $('#review-adName').text(ad.name);   
    $('#review-reviewer').text(r.reviewer); 
    $('#review-title').text(r.title);
    $('#review-content').text(r.content);
    if(r.respectedAgreement){
        $('#review-agreement').text("Yes");
    }else{
        $('#review-agreement').text("No");
    }
    if(r.descriptionTrue){
        $('#review-desc').text("Yes");
    }else{
        $('#review-desc').text("No");
    }

    $('#div-reviews').fadeOut(500, function(){
        $('#div-review').fadeIn(500);
    });
 }
}

//show a seller's ads on his profile 
function showAds(){
    $.get({
        url:'rest/userService/currentUser',
        success: function(user){
            $.get({
                url:'rest/adService/ads',
                success: function(ads){

                        $('#table-ads tbody').empty();
                        let status = $('#selectStatus').val(); 

                        if(status === "All"){
                            for(let ad of ads){
                                if(user.postedAds.includes(ad.id) && ad.deleted == false){
                                addAd(ad);
                                }
                            }
                        }else{
                            for(let ad of ads){
                                if(user.postedAds.includes(ad.id) && status === ad.status && ad.deleted == false){
                                    addAd(ad);
                                }
                            }
                        } 
                        $('#div-received-messages, #div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
                        $('#div-likes-dislikes, #div-review, #div-reviews').hide();
                        $('#div-ad-seller, #div-ad-review').hide();
                        $('#div-edit-ad, #div-new-ad').hide();
                        $('#div-ads').fadeIn(200);     
                    }
                });  
        }
    });
}

function addAd(ad){
    let table = $('#table-ads tbody');
    let tr = $('<tr id="nesto' + ad.id + '"></tr>');
    let tdPhoto = $('<td><img src="' + ad.photo + '" alt=""></td>');
    let tdName = $('<td>' + ad.name + '</td>');
    let tdDescription = $('<td>' + ad.description + '</td>');
    let tdStatus = $('<td>' + ad.status + '</td>');
    let tdPrice = $('<td>' + ad.price + '</td>');
    tr.append(tdPhoto,tdName,tdDescription,tdStatus,tdPrice);
    tr.click(showAd(ad));
    table.append(tr);
}

function showAd(ad){
   return function(){
       funcShowAd(ad,"#div-ads");

   }
}

function funcShowAd(ad,div){
    $('#ad-photo').attr("src",ad.photo);
    $('#spanName-seller').text(ad.name);
    $('#spanPrice-seller').text(ad.price);
    $('#spanDesc-seller').text(ad.description);
    $('#spanLikes-seller').text(ad.likes);
    $('#spanDislikes-seller').text(ad.dislikes);
    $('#spanPDate-seller').text(ad.postingDate);
    $('#spanEDate-seller').text(ad.expiryDate);
    if(ad.active){
     $('#spanActive-seller').text("Yes");
    }else{
     $('#spanActive-seller').text("No");  
    }
    $('#spanCity-seller').text(ad.city);
    $('#spanStatus-seller').text(ad.status);
    $.get({
        url:'rest/categoryService/whichCategory/' + ad.id,
        success: function(category){
            $('#spanCategory-seller').text(category.name);
        }
    });
    if(ad.status === "In realization" || ad.status === "Delivered"){
        $('#btnDeleteAd').hide();
    }else{
        $('#btnDeleteAd').off("click");
        $('#btnDeleteAd').click(deleteAd(ad));
        $('#btnDeleteAd').show();
    }
    $('#btnEditAd').off("click");
    $('#btnEditAd').click(editAd(ad));
    $('#table-ad-reviews tbody').empty();
    $.get({
        url:'rest/reviewService/reviews',
        success: function(reviews){
            for(let r of reviews){
              if(ad.reviews.includes(r.id) && r.deleted == false){
                  addReviewInAd(r,ad);
              }
            }
            $(div).hide();
            $('#div-ad-seller').show();
            $(window).scrollTop(0); //to go up when an ad is displayed

        }
    });
}
//when a seller removes his ad
function deleteAd(ad){
    return function(){
    $.ajax({
        url:'rest/adService/deleteAdSeller/' + ad.id,
        type:'DELETE',
        success: function(){
            $('#div-ad-seller').fadeOut(500,function(){
                 showAds();
            });
        },
        error: function(message){
            alert(message.responseText);
        }
    });
}
}

function addReviewInAd(review,ad){
    let table = $('#table-ad-reviews tbody');
    let tr = $('<tr></tr>');
    let tdReviewer = $('<td>' + review.reviewer + '</td>');
    let tdTitle = $('<td>' + review.title + '</td>');
    let tdContent = $('<td>' + review.content + '</td>');
    tr.append(tdReviewer,tdTitle,tdContent);
    tr.click(showReviewInAd(review,ad));
    table.append(tr);
}

//show a review on an ad
function showReviewInAd(r,ad){
    return function(){
        $('#review-ad-adName').text(ad.name);   
        $('#review-ad-reviewer').text(r.reviewer); 
        $('#review-ad-title').text(r.title);
        $('#review-ad-content').text(r.content);
        if(r.descriptionTrue){
            $('#review-ad-desc').text("Yes");
        }else{
            $('#review-ad-desc').text("No");
        }
        if(r.respectedAgreement){
            $('#review-ad-agreement').text("Yes");
        }else{
            $('#review-ad-agreement').text("No");
        }
    
        $('#div-ad-seller').hide();
            $('#div-ad-review').show();   
    }
}

//show the form for an ad update
function editAd(ad){
    return function(){
         $('#ad-edit-name').val(ad.name);
         $('#ad-edit-price').val(ad.price);
         $('#ad-edit-description').val(ad.description);
         if(ad.active){
             $('#ad-edit-active-yes').prop("checked",true);
         }else{
             $('#ad-edit-active-no').prop("checked",false);
         }
        
        $('#ad-edit-city').val(ad.city);
        $('#div-edit-ad img').attr("src",ad.photo);
        $('#ad-edit-photo').val("");
        $('#btnCancelEdit').off("click");
        $('#btnCancelEdit').click(function(){
              $('#div-edit-ad').fadeOut(500, function(){
                  $("#div-ad-seller").fadeIn(500);
              }) 
        });
        $('#form-edit-ad').off("submit");
        $('#form-edit-ad').submit(changeAd(ad));
        let selectCat = $('#ad-edit-new-category');
        $('#ad-edit-new-category').empty();
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
                  $('#div-ad-seller').fadeOut(500,function(){
                       $('#div-edit-ad').fadeIn(500);  
                  }); 
            }
        });
    }
}

function changeAd(ad){
    return function(e){
        e.preventDefault();
        let name = $('#ad-edit-name').val();
        let price =  $('#ad-edit-price').val();
        let desc = $('#ad-edit-description').val();
        let activeVal = $('input[name="ad-edit-active"]:checked').val();
        let active;
        if(activeVal === "yes"){
            active = true;
        }else{
            active = false;
        }
        let city = $('#ad-edit-city').val();
        let category = $('#ad-edit-new-category').val();
        let photo = $('#div-edit-ad img').attr("src");

        $.ajax({
            url:'rest/adService/editAdSeller/' + ad.id + '/' + category,
            type: 'PUT',
            data: JSON.stringify({"name":name,"price":price,"description":desc,"active":active,"city":city,"photo":photo}),
            contentType: 'application/json',
            success: function(ad1){
                  funcShowAd(ad1,"#div-edit-ad");
            }
        });       
    }
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

    $('#a-logout').click(function(e){
        e.preventDefault();
        $.post({
            url:'rest/userService/logout',
            success:function(){
                window.location.href="homePage.html";
            }
        })
    });

    $('#a-ordered').click(function(e){
          e.preventDefault();
          showOrderedAds();
          $('#currOption').text("Ordered ads");
    });

    $('#a-delivered').click(function(e){
        e.preventDefault();
        showDeliveredAds();
        $('#currOption').text("Delivered ads");
    });

    $('#a-favourite').click(function(e){
        e.preventDefault();
        showFavouriteAds();
        $('#currOption').text("Favourite ads");
    });

    $('#a-received-messages').click(function(e){
        e.preventDefault();
        showReceivedMessages();
        $('#currOption').text("Received messages");
    });

    //show a delivered message 
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

    $('#a-sent-messages').click(function(e){
        e.preventDefault();
        showSentMessages();
        $('#currOption').text("Sent messages");
    });

    //show a sent message
    $('#btnBack-sent').click(function(){
        $('#div-message-sent').fadeOut(1000,function(){
                showSentMessages(); //to be able to see the change, because if I do just show then the old messages will remain attached to the message click
        });
    });
    $('#btnEdit').click(function(){
        $('#edit-message').val($('#msg-sent-content').text());
        $('#msg-msg-sent').text("");
        $('#div-edit').slideDown(1000);
    });

    $('#btnCancelConfirm').click(function(){
           $('#div-edit').slideUp(1000); 
    });

    //show the form for creating a new message
    $('#a-compose-message').click(function(e){
          e.preventDefault();
          $('#form-new-message').trigger("reset");
          $('#currOption').text("Compose a message");
          $('#msg-msg-new').text("");
          $('#div-ordered, #div-delivered, #div-add-review, #div-favourite').hide();
          $('#div-message, #div-received-messages, #div-sent-messages, #div-message-sent').hide();
          $('#div-details-ad, #div-data-review-ad, #div-edit-review-ad').hide();
          $('#div-details-seller, #div-data-review-seller, #div-edit-review-seller').hide();
          $('#div-likes-dislikes, #div-reviews, #div-review').hide();
          $('#div-ads, #div-ad-seller, #div-ad-review').hide();
          $('#div-edit-ad, #div-new-ad').hide();
          $('#div-new-message').show();
    });

    $('#new-msg-cancel').click(function(){
          $('#currOption').text("Choose an option");
          $('#div-new-message').fadeOut(1000);
    });

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
                    $('#div-new-message').hide();
                    $('#currOption').text("Choose an option");
                });
            },
            error: function(message){
                $('#msg-msg-new').text(message.responseText).css("color","red").show();
            }
        });
    });  
    
    $('#a-likesDislikes').click(function(e){
        e.preventDefault();
        $.get({
            url:'rest/userService/currentUser',
            success: function(user){
                $('#spanNumLikes').text(user.likes);
                $('#spanNumDislikes').text(user.dislikes);
                $('#currOption').text("Number of likes and dislikes");
                $('#div-received-messages, #div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
                $('#div-review, #div-reviews').hide();
                $('#div-ads, #div-ad-seller, #div-ad-review').hide();
                $('#div-edit-ad, #div-new-ad').hide();
                $('#div-likes-dislikes').show();
            }
        });
    });

    $('#a-reviews').click(function(e){
         e.preventDefault();
         showReviews();
         $('#currOption').text("Reviews");
    });

    $('#btnBack-review').click(function(){
        $('#div-review').fadeOut(500, function(){
            $('#div-reviews').fadeIn(500);
        });
    });

    $('#a-allAds').click(function(e){
        e.preventDefault();
        showAds();
        $('#currOption').text("All ads");
    });

    $('#btnFilter').click(function(){
        showAds();
        let status = $('#selectStatus').val();
        $('#currOption').text("Ads: " + status);
    });

    $('#btnBackAd').click(function(){ //when returning back to all the ads they are loaded again in case some of them has been changed
        $.get({
            url:'rest/userService/currentUser',
            success: function(user){
                $.get({
                    url:'rest/adService/ads',
                    success: function(ads){
                            $('#table-ads tbody').empty();
                            if(status === "All"){
                                for(let ad of ads){
                                    if(user.postedAds.includes(ad.id) && ad.deleted == false){
                                    addAd(ad);
                                    }
                                }
                            }else{
                                for(let ad of ads){
                                    if(user.postedAds.includes(ad.id) && status === ad.status && ad.deleted == false){
                                        addAd(ad);
                                    }
                                }
                            } 
                            $('#div-ad-seller').fadeOut(500,function(){
                            $('#div-ads').fadeIn(500);
                            });
                    }
                });
            } 
        }); 
    });  

    $('#btnBack-ad-review').click(function(){
        $('#div-ad-review').fadeOut(500, function(){
            $('#div-ad-seller').fadeIn(500);
        });
    });

    $('#a-new-ad').click(function(e){
         e.preventDefault();
         $.get({
             url:'rest/categoryService/categories',
             success: function(categories){
                 let selectCat = $('#new-ad-category');
                 selectCat.empty();
                 selectCat.append($('<option value="0"></option>'));
                 for(let cat of categories){
                      let op = $('<option value="' + cat.id + '">' + cat.name + '</option>');
                      selectCat.append(op);
                 }
                 
                 $('#div-received-messages, #div-message, #div-sent-messages, #div-message-sent, #div-new-message').hide();
                 $('#div-review, #div-reviews').hide();
                 $('#div-ads, #div-ad-seller, #div-ad-review').hide();
                 $('#div-edit-ad, #div-likes-dislikes').hide();
                 $('#currOption').text("Creating a new ad");
                 $('#form-new-ad').trigger("reset");
                 $('#div-new-ad').fadeIn(500);
             }
         });
    });

    $('#btnCancelNew').click(function(){
        $('#currOption').text("Choose an option");
        $('#div-new-ad').fadeOut(500);
    });

    $('#form-new-ad').submit(function(e){
        e.preventDefault();
        let name = $('#new-ad-name').val();
        let desc = $('#new-ad-description').val();
        let price = $('#new-ad-price').val();
        let edate = $('#new-ad-edate').val(); 
        let activeVal = $('input[name="new-ad-active"]:checked').val();
        let city = $('#new-ad-city').val();
        let category = $('#new-ad-category').val();
        let photo = $('#div-new-ad img').attr("src");
        $('#msg-new-ad').text("");
        if(!name || !desc || !price || !edate || !activeVal || city === "none" || category == 0 || !photo){
            $('#msg-new-ad').text("All fields are mandatory. Please fill out all the fields.").css("color","red").show().delay(3000).fadeOut(2000); 
            return;
        }
        if(!validDate(edate)){
            $('#msg-new-ad').text("Please enter a valid date.").css("color","red").show().delay(3000).fadeOut(2000); 
            return;
        }       
        
            let active;
            if(activeVal === "yes"){
                active = true;
             }else{
                active = false;
             }
             $.post({
                 url:'rest/adService/createNewAd/' + category,
                 data: JSON.stringify({"name":name,"description":desc,"price":price,"expiryDate":edate,"active":active,"city":city,"photo":photo}),
                 contentType: 'application/json',
                 success: function(){
                    $('#msg-new-ad').text("Ad has been successfully created.").css("color","green").show().delay(2000).fadeOut(1000, function(){
                        $('#currOption').text("Choose an option");
                        $('#div-new-ad').fadeOut(500);
                    }); 
                 },
                 error: function(message){
                    $('#msg-new-ad').text(message.responseText).css("color","red").show().delay(3000).fadeOut(2000); 
                 }
             });
        
    });

    $('#new-ad-photo').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-new-ad img').attr("src",base64);
        }
    });

    $('#ad-edit-photo').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-edit-ad img').attr("src",base64);
        }
    });

    $('#photo-review-ad').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-new-review-ad img').attr("src",base64);
        }
    });
    $('#photo-review-seller').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-new-review-seller img').attr("src",base64);
        }
    });
    
    $('#photo-edit-review-ad').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-edit-review-ad img').attr("src",base64);
        }
    });

    $('#photo-edit-review-seller').change(function(e){
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            let base64 = reader.result;
            $('#div-edit-review-seller img').attr("src",base64);
        }
    });
    

});