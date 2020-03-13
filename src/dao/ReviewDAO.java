package dao;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;

import beans.Review;
import beans.User;

public class ReviewDAO {
	
	private HashMap<Integer,Review> reviews = new HashMap<Integer,Review>();
	private String reviewPath = "";
	
	public ReviewDAO() {
		loadTestData();
	}
	
	public ReviewDAO(String contextPath) {
		this.reviews = new HashMap<Integer,Review>();
		this.reviewPath = contextPath;
		//loadTestData();
		loadReviews(reviewPath);
	}
	
	public HashMap<Integer, Review> getReviews() {
		return reviews;
	}


	public void setReviews(HashMap<Integer, Review> reviews) {
		this.reviews = reviews;
	}
	
	
	public Collection<Review> getAllReviews(){
		return reviews.values();
	}
	
	
	public Review addReviewAd(User currentUser, int deliveredAdID, String adID, Review review,AdDAO adDAO,UserDAO userDAO,MessageDAO messageDAO) {
		
		 SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	     Date date = new Date(); 
		 int maxId = 0;
		 for(Review r1 : reviews.values()) {
			 if(r1.getId()>maxId) {
				 maxId = r1.getId();
			 }
		 }
		 
		 maxId++;
		 review.setId(maxId);
		 review.setAd(adID);
		 review.setReviewer(currentUser.getUsername());
		 review.setForAdOrSeller("ad"); //set that this is a review for the ad
		 reviews.put(review.getId(), review); //add the review in the global list of reviews
		 saveReviews();
		 adDAO.getAds().get(adID).getReviews().add(review.getId()); //add id of review in the ad
		 adDAO.saveAds();
		 for(int i=0;i<currentUser.getDeliveredAdsCustomer().size();i++) { //set id of the review in the delivered ad
			 if(currentUser.getDeliveredAdsCustomer().get(i).getId() == deliveredAdID) {
				 currentUser.getDeliveredAdsCustomer().get(i).setIdReviewForAd(review.getId());
			 }
		 }
		 for(User user:userDAO.getUsers().values()) {
			 if(user.getRole().equals("Seller")) {
			    if(user.getPostedAds().contains(adID)) { //send a message to the seller of the ad
			    	int idx = messageDAO.addMessage(adDAO.getAds().get(adID).getName(), currentUser.getUsername(), "Generic", "Review added", "Someone has added a review to your ad.",formatter.format(date).toString(),user.getUsername());
			    	user.getReceivedMessages().add(idx);
			    	currentUser.getSentMessages().add(idx);
		     	 }
			 }
		 }
		 userDAO.saveUsers();
		 return review;
		
	}
	
	
	public Review addReviewSeller(User currentUser,int deliveredAdID, String adID, String seller, Review review,AdDAO adDAO,UserDAO userDAO,MessageDAO messageDAO) {
		
		 SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	     Date date = new Date(); 
		 int maxId = 0;
		 for(Review r1 : reviews.values()) {
			 if(r1.getId()>maxId) {
				 maxId = r1.getId();
			 }
		 }
		 
		 maxId++;
		 review.setId(maxId);
		 review.setAd(adID);
		 review.setReviewer(currentUser.getUsername());
		 review.setForAdOrSeller("seller"); //set that this is a review for the seller
		 reviews.put(review.getId(), review); //add the review in the global list of reviews
		 saveReviews();
		 userDAO.getUsers().get(seller).getReviews().add(review.getId()); //add id of the review in the seller
		 for(int i=0;i<currentUser.getDeliveredAdsCustomer().size();i++) { //set id of the review in the delivered ad
			 if(currentUser.getDeliveredAdsCustomer().get(i).getId() == deliveredAdID) {
				 currentUser.getDeliveredAdsCustomer().get(i).setIdReviewForSeller(review.getId());
			 }
		 }
        //send a message to the seller
		 int idx = messageDAO.addMessage(adDAO.getAds().get(adID).getName(), currentUser.getUsername(), "Generic", "Review added", "Someone has added a review about you.",formatter.format(date).toString(),seller);
		 userDAO.getUsers().get(seller).getReceivedMessages().add(idx);
	     currentUser.getSentMessages().add(idx);
	     userDAO.saveUsers();
		 return review;
		
	}
	
	
	
	public void deleteReviews(ArrayList<Integer> idReviews, String adID) {
		
		for(int i=0;i<idReviews.size();i++) {
			reviews.get(idReviews.get(i)).setDeleted(true);
		}
		saveReviews();
		
	}
	
	
	public Review editReview(Review review,int id,UserDAO userDAO,User currentUser,MessageDAO messageDAO,AdDAO adDAO) { //this can be done together because if I suppose the description is related only to the ad, then it will be always false for the seller and won't change 
		
		Review r = reviews.get(id); //if something has changed, I change review, and then send a message to the seller of the ad
		if(!r.getTitle().equals(review.getTitle()) || !r.getContent().equals(review.getContent()) || r.isDescriptionTrue() != review.isDescriptionTrue() || r.isRespectedAgreement() != review.isRespectedAgreement() || !r.getPhoto().equals(review.getPhoto())) {
			
		r.setTitle(review.getTitle());
		r.setContent(review.getContent());
		r.setDescriptionTrue(review.isDescriptionTrue());
		r.setRespectedAgreement(review.isRespectedAgreement());
		r.setPhoto(review.getPhoto());
		saveReviews();
		
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
		for(User user:userDAO.getUsers().values()) {
			if(user.getRole().equals("Seller")) {
				if(user.getPostedAds().contains(r.getAd())) {
					int idx = messageDAO.addMessage(adDAO.getAds().get(r.getAd()).getName(), currentUser.getUsername(), currentUser.getRole(), "Review changed", "Review on your ad has been changed.", formatter.format(date).toString(), user.getUsername());
					currentUser.getSentMessages().add(idx);
					user.getReceivedMessages().add(idx);
				}
			}
		}
		userDAO.saveUsers();
		
	   }
		return r;
		
	}
	
	private void loadTestData() {
			
	 }
	
   @SuppressWarnings("unchecked")
   private void loadReviews(String contextPath) {
		FileWriter fileWriter = null;
		BufferedReader in = null;
		File file = null;
		System.out.println(contextPath);
		try {
			file = new File(contextPath + "/data/reviews.txt");
			in = new BufferedReader(new FileReader(file));

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.setVisibilityChecker(
					VisibilityChecker.Std.defaultInstance().withFieldVisibility(JsonAutoDetect.Visibility.ANY));
			TypeFactory factory = TypeFactory.defaultInstance();
			MapType type = factory.constructMapType(HashMap.class, Integer.class, Review.class);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			reviews = ((HashMap<Integer, Review>) objectMapper.readValue(file, type));
		} catch (FileNotFoundException fnfe) {
			System.out.println("The file for reviews hasn't been changed."); 
			try {
				file.createNewFile();
				System.out.println("Created a new file for reviews.");
				fileWriter = new FileWriter(file);
				ObjectMapper objectMapper = new ObjectMapper();
				objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
				objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
				String stringReviews = objectMapper.writeValueAsString(reviews);
				fileWriter.write(stringReviews);
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				if (fileWriter != null) {
					try {
						fileWriter.close();
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
			}

		} catch (Exception ex) {
			ex.printStackTrace();
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
   }
   
   public void saveReviews() {
		File file = new File(reviewPath + "/data/reviews.txt");
		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(file);
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			String stringReviews = objectMapper.writeValueAsString(reviews);
			fileWriter.write(stringReviews);
			fileWriter.flush();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (fileWriter != null) {
				try {
					fileWriter.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

}
