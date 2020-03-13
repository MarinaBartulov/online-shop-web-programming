package dao;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.ParseException;
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

import beans.Ad;
import beans.Category;
import beans.DeliveredAd;
import beans.User;

public class AdDAO {
	
	private HashMap<String,Ad> ads = new HashMap<String,Ad>();
	private String adPath = "";
	
	public AdDAO() {
         loadTestData();
	}
	
	public AdDAO(String contextPath) {
		this.ads = new HashMap<String,Ad>();
		this.adPath = contextPath;
		//loadTestData();
		loadAds(adPath);
		
	}
	
	
	public Ad addNewAd(Ad ad) {
		
		Integer maxId = -1; //newId = maxId + 1
		for(String id: ads.keySet()) {
			int idNum = Integer.parseInt(id);
			if(idNum>maxId) {
				maxId = idNum;
			}
		}
		maxId++;
		ad.setId(maxId.toString());
		ad.setReviews(new ArrayList<Integer>());
		ads.put(ad.getId(), ad);
		saveAds();
		return ad;
	}
	
	public Ad findAd(String id) {
		
		if(ads.containsKey(id))
			return ads.get(id);
		else
			return null;
	}
	
	public Collection<Ad> getAllAds(){
		return ads.values();
	}
	
	public void deleteAd(String id) {
		ads.remove(id);
		saveAds();
	}


	public HashMap<String, Ad> getAds() {
		return ads;
	}


	public void setAds(HashMap<String, Ad> ads) {
		this.ads = ads;
	}
	
	
	
	
	public boolean deliverAd(User user, String id,UserDAO userDAO,MessageDAO messageDAO) {
		User u = userDAO.getUsers().get((user.getUsername()));
		if(u.getOrderedAds().contains(id)) {
			SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
		    Date date = new Date(); 
			int i = u.getOrderedAds().indexOf(id);
			u.getOrderedAds().remove(i); //remove from the list of ordered products
			userDAO.saveUsers();
			User seller = null;
			for(User us:userDAO.getUsers().values()) { //find seller
				if(us.getRole().equals("Seller")) {
				    if(us.getPostedAds().contains(id)) {
					    seller = us;
					    break;
				     }
				}
			}
			DeliveredAd deliveredAd = new DeliveredAd(id,user.getUsername(),seller.getUsername(),formatter.format(date).toString());
			int id1 = u.findMaxIdCustomer(); //find the greatest id from both lists and assign the id that follows the greater one
			int id2 = seller.findMaxIdSeller();
			int idMax = 0;
			if(id1>id2) {
				idMax = id1;
			}else {
				idMax = id2;
			}
			idMax++;
			deliveredAd.setId(idMax);
			u.getDeliveredAdsCustomer().add(deliveredAd); //add delivered ad to a customer and seller
			seller.getDeliveredAdsSeller().add(deliveredAd);
			int idx = messageDAO.addMessage(ads.get(id).getName(), u.getUsername(), "Generic", "Delivered.", "Your product has been successfully delivered",formatter.format(date).toString(),seller.getUsername()); 
			seller.getReceivedMessages().add(idx);
			u.getSentMessages().add(idx);
			ads.get(id).setStatus("Delivered"); //change status to Delivered
			saveAds();
			userDAO.saveUsers();
			return true;
		}else {
			return false;
		}
	}
	
	public Ad likeAd(User currentUser, String id) {
		
		if(ads.get(id).getListLikes().contains(currentUser.getUsername())) { //if a user has already liked and clicks the like button again, then he dislikes it 
			int i = ads.get(id).getListLikes().indexOf(currentUser.getUsername());
			ads.get(id).getListLikes().remove(i);
			ads.get(id).setLikes(ads.get(id).getListLikes().size());
		}else {
			if(ads.get(id).getListDislikes().contains(currentUser.getUsername())) { //if a user has already disliked, that dislike is canceled and the user likes it
				int i = ads.get(id).getListDislikes().indexOf(currentUser.getUsername());
				ads.get(id).getListDislikes().remove(i);
				ads.get(id).setDislikes(ads.get(id).getListDislikes().size());
			}
			ads.get(id).getListLikes().add(currentUser.getUsername());
			ads.get(id).setLikes(ads.get(id).getListLikes().size());
		}
		saveAds();
		return ads.get(id);
	}
	
    public Ad dislikeAd(User currentUser, String id) {
		
		if(ads.get(id).getListDislikes().contains(currentUser.getUsername())) { //if a user has already disliked and clicks dislike button again, then he cancels that dislike
			int i = ads.get(id).getListDislikes().indexOf(currentUser.getUsername());
			ads.get(id).getListDislikes().remove(i);
			ads.get(id).setDislikes(ads.get(id).getListDislikes().size());
		}else {
			if(ads.get(id).getListLikes().contains(currentUser.getUsername())) { //if a user has already liked, then that like is canceled and he dislikes it
				int i = ads.get(id).getListLikes().indexOf(currentUser.getUsername());
				ads.get(id).getListLikes().remove(i);
				ads.get(id).setLikes(ads.get(id).getListLikes().size());
			}
			ads.get(id).getListDislikes().add(currentUser.getUsername());
			ads.get(id).setDislikes(ads.get(id).getListDislikes().size());
		}
		saveAds();
		return ads.get(id);
	}
    
    public void removeAdFromFavourite(User currentUser, String id, UserDAO userDAO) {
    	
    	int idx = currentUser.getFavouriteAds().indexOf(id);
    	currentUser.getFavouriteAds().remove(idx); //remove that ad from favorites of the user who is currently logged in
    	userDAO.saveUsers();
    	ads.get(id).setInFavouriteList(ads.get(id).getInFavouriteList() - 1); // reduce the number of favorite lists which contain this ad 
    	saveAds();
 
    }
    
    public boolean addToFavourite(User currentUser, String id, UserDAO userDAO) {
    	
    	if(currentUser.getFavouriteAds().contains(id)) { //remove from the favorite list of a customer
    		int idx = currentUser.getFavouriteAds().indexOf(id);
    		currentUser.getFavouriteAds().remove(idx);
    		userDAO.saveUsers();
    		ads.get(id).setInFavouriteList(ads.get(id).getInFavouriteList() - 1); //reduce the number of favorite lists which contain this ad 
    		saveAds();
    		return false;
    	}else { //add to the favorite list of a customer
    		
    		currentUser.getFavouriteAds().add(id);
    		userDAO.saveUsers();
    		ads.get(id).setInFavouriteList(ads.get(id).getInFavouriteList() + 1); 
    		saveAds();
    		return true;
    	}
    }
    
    public void orderAd(User currentUser, String id, UserDAO userDAO) {
    	
    	currentUser.getOrderedAds().add(id); //add to the ordered list of a customer
    	userDAO.saveUsers();
    	ads.get(id).setStatus("In realization"); // change the status of the ad to In realization so that it can't be shown among other ads until it is delivered
    	saveAds();                                          
    }
    
    public void deleteAdAdmin(User currentUser,String id, UserDAO userDAO,MessageDAO messageDAO) {
    	
    	SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
    	ads.get(id).setDeleted(true); //remove the ad from the global list of ads
    	
    	for(User user: userDAO.getUsers().values()) { //send a message to the seller
    		if(user.getRole().equals("Seller")) {
    			if(user.getPostedAds().contains(id)) {
    				int idx = messageDAO.addMessage(ads.get(id).getName(), currentUser.getUsername(), "Admin", "Deleted ad", "Your ad has been deleted.", formatter.format(date).toString(),user.getUsername()); 
    				user.getReceivedMessages().add(idx);
    				currentUser.getSentMessages().add(idx);
    			}
    		}
    		if(user.getRole().equals("Customer")) { //send a message to the customer who has ordered the ad or it has been delivered to him
    			if(user.getOrderedAds().contains(id) || user.getDeliveredAdsCustomer().stream().filter(o -> o.getAdID().equals(id)).findFirst().isPresent()) {
    				int idx = messageDAO.addMessage(ads.get(id).getName(), currentUser.getUsername(), currentUser.getRole(), "Deleted ad", "Ad '" + ads.get(id).getName() + "' has been deleted.", formatter.format(date).toString(),user.getUsername()); 
    				user.getReceivedMessages().add(idx);
    				currentUser.getSentMessages().add(idx);
    			}
    		}
    	}
    	saveAds();
    	userDAO.saveUsers();
    	
    }
    
    public void editAdAdmin(String adID, int categoryID, Ad ad, User currentUser,UserDAO userDAO,MessageDAO messageDAO,CategoryDAO categoryDAO,int numOfReviews) {
    	
    	Ad adEdit = ads.get(adID); 
    	boolean changed = false;
    	
    	if(numOfReviews>0) {
    		changed = true; //if a review is removed and nothing else is changed, send a message to the seller anyway
    	}
    	if(!adEdit.getName().equals(ad.getName())) {
    		adEdit.setName(ad.getName());
    		changed = true;
    	}
    	if(adEdit.getPrice() != ad.getPrice()) {
    		adEdit.setPrice(ad.getPrice());
    		changed = true;
    	}
    	if(!adEdit.getDescription().equals(ad.getDescription())) {
    		adEdit.setDescription(ad.getDescription());
    		changed = true;
    	}
    	if(!adEdit.getPhoto().equals(ad.getPhoto())) {
    		adEdit.setPhoto(ad.getPhoto());
    		changed = true;
    	}
    	if(!adEdit.getPostingDate().equals(ad.getPostingDate())) {
    		adEdit.setPostingDate(ad.getPostingDate());
    		changed = true;
    	}
    	if(!adEdit.getExpiryDate().equals(ad.getExpiryDate())) {
    		adEdit.setExpiryDate(ad.getExpiryDate());
    		changed = true;
    	}
    	if(adEdit.isActive() != ad.isActive()) {
    		adEdit.setActive(ad.isActive());
    		changed = true;
    	}
    	if(!adEdit.getCity().equals(ad.getCity())) {
    		adEdit.setCity(ad.getCity());
    		changed = true;
    	}
    	saveAds();
    	for(Category cat: categoryDAO.getCategories().values()) {
    		if(cat.getAds().contains(adID)) {
    			if(cat.getId() != categoryID) {
    				changed = true;
    				int idx = cat.getAds().indexOf(adID);
    				cat.getAds().remove(idx);
    				categoryDAO.getCategories().get(categoryID).getAds().add(adID);
    				categoryDAO.saveCategories();
    				break;
    			}
    		}
    	}
    	if(changed) {
    		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
    	    Date date = new Date(); 
    	    for(User user: userDAO.getUsers().values()) { //send a message to the seller
        		if(user.getRole().equals("Seller")) {
        			if(user.getPostedAds().contains(adID)) {
        				int idx = messageDAO.addMessage(ads.get(adID).getName(), currentUser.getUsername(), "Admin", "Edited ad", "Your ad has been edited.", formatter.format(date).toString(),user.getUsername()); 
        				user.getReceivedMessages().add(idx);
        				currentUser.getSentMessages().add(idx);
        			}
        		}
        		if(user.getRole().equals("Customer")) { //send a message to the customer who has ordered the ad or it has been delivered to him
        			if(user.getOrderedAds().contains(adID) || user.getDeliveredAdsCustomer().stream().filter(o -> o.getAdID().equals(adID)).findFirst().isPresent()) {
        				int idx = messageDAO.addMessage(ads.get(adID).getName(), currentUser.getUsername(), "Admin", "Edited ad", "Ad '" + ads.get(adID).getName() + "' has been edited.", formatter.format(date).toString(),user.getUsername()); 
        				user.getReceivedMessages().add(idx);
        				currentUser.getSentMessages().add(idx);
        			}
        		}
        	}
    	    userDAO.saveUsers();
    	}
    	
    }
    
  public void deleteAdSeller(User currentUser,String id, UserDAO userDAO,MessageDAO messageDAO) {
    	
    	SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
    	ads.get(id).setDeleted(true); //remove the ad from the global list of ads
    	saveAds();
    	for(User user: userDAO.getUsers().values()) { //send a message to all the admins
    		if(user.getRole().equals("Administrator")) {
    				int idx = messageDAO.addMessage(ads.get(id).getName(), currentUser.getUsername(), currentUser.getRole(), "Deleted ad", "I have deleted my ad.", formatter.format(date).toString(),user.getUsername()); 
    				user.getReceivedMessages().add(idx);
    				currentUser.getSentMessages().add(idx);
    			}
    		}
    		userDAO.saveUsers();
    	}
  
  public Ad editAdSeller(String adID,int catID,Ad ad, CategoryDAO categoryDAO) {
	  
	  Ad adEdit = ads.get(adID); 
	  adEdit.setName(ad.getName());
	  adEdit.setPrice(ad.getPrice());
	  adEdit.setDescription(ad.getDescription());
	  adEdit.setActive(ad.isActive());
	  adEdit.setCity(ad.getCity());
	  adEdit.setPhoto(ad.getPhoto());
	  saveAds();
	  for(Category cat: categoryDAO.getCategories().values()) {
  		if(cat.getAds().contains(adID)) {
  			if(cat.getId() != catID) {
  				int idx = cat.getAds().indexOf(adID);
  				cat.getAds().remove(idx);
  				categoryDAO.getCategories().get(catID).getAds().add(adID);
  				categoryDAO.saveCategories();
  				break;
  			}
  		}
  	}
	  return adEdit;
  }
  
  public boolean createNewAd(int catID,Ad ad,User currentUser,CategoryDAO categoryDAO,UserDAO userDAO) {
	    if(!isValidDate(ad.getExpiryDate())) { //this is checked in javaScript
	    	return false;
	    }else {
	    SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");  
	    Date date = new Date(); 
	    Integer maxId = 0; 
		for(String id: ads.keySet()) {
			int idNum = Integer.parseInt(id);
			if(idNum>maxId) {
				maxId = idNum;
			}
		}
		maxId++;
		ad.setId(maxId.toString());
		ad.setReviews(new ArrayList<Integer>());
		ad.setLikes(0);
		ad.setListLikes(new ArrayList<String>());
		ad.setDislikes(0);
		ad.setListDislikes(new ArrayList<String>());
		ad.setPostingDate(formatter.format(date).toString());
		ad.setDeleted(false);
		ad.setStatus("New");
		ad.setInFavouriteList(0);
		ads.put(ad.getId(), ad); //add to the global list
		currentUser.getPostedAds().add(ad.getId()); //add to the list of published ads of a seller
		categoryDAO.getCategories().get(catID).getAds().add(ad.getId()); //add to the category
		saveAds();
		userDAO.saveUsers();
		categoryDAO.saveCategories();
		return true;
	    }
  }
  
  private  boolean isValidDate(String inDate) {
	    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
	    dateFormat.setLenient(false);
	    try {
	      dateFormat.parse(inDate.trim());
	    } catch (ParseException pe) {
	      return false;
	    }
	    return true;
	  }
  
  
 private void loadTestData() {
	    Ad ad1 = new Ad("1","Tesla Model S (2018)",60000,"Electric car. It has a powerful battery, which is charged by electricity.","images/Penguins.jpg","15/08/2019","15/09/2019",true,"Sombor");
		ad1.setStatus("In realization"); //Pera has ordered it
		Ad ad2 = new Ad("2","Dell Inspiron 3542",600,"Laptop with great specifications. Excellent for gaming and high performances. CPU Intel Core i5. 8GB RAM. NVIDIA GeForce.","images/profi.jpg","10/09/2019","10/10/2019",true,"Subotica");
		Ad ad3 = new Ad("3","Prada shoes",1000,"Beige high heels shoes made of leather. Very comfortable and for everyday use.","images/Penguins.jpg","10/09/2019","10/11/2019",true,"Beograd");
		Ad ad4 = new Ad("4","Office chair",50,"Comfortable office chair, black color. Made for people who spend a lot of time sitting, like programmers or writers.","images/Penguins.jpg","01/09/2019","02/11/2019",true,"Sombor");
		Ad ad5 = new Ad("5","Scottish Fold cat",1000,"Beautiful pedigree Scottish Fold kitten. Mum is 5th generation and dad is 6th generation, with papers. This kitten will be sold without breeding registration unless requested.","images/Penguins.jpg","10/09/2019","31/12/2019",true,"Novi Sad");
		Ad ad6 = new Ad("6","Green apples",4,"Very delicious green apples, price is per kilogram.","images/Penguins.jpg","10/09/2019","12/01/2020",true,"Kragujevac");
		Ad ad7 = new Ad("7","Samsung 55 Inch Flat Smart",700,"4k UHD Processor. High Dynamic Range 10+. Slim with Modern Simplicity","images/Penguins.jpg","10/09/2019","15/12/2019",true,"Sombor");
		Ad ad8 = new Ad("8","Furniture Sofa with Down-Filled Pillows",500,"Very comfortable sofa. Pillows come in different colors. Customer can choose design and color of sofa and its pillows.","images/Penguins.jpg","10/09/2019","01/02/2020",true,"Beograd");
		Ad ad9 = new Ad("9","Converse Chuck Taylor All Star shoes",50,"Unisex shoes. High top. Different colours.","images/Penguins.jpg","10/09/2019","10/10/2019",true,"Vranje");
		Ad ad10 = new Ad("10","Beagle dog",4,"Six months old puppy. Mum is 5th generation and dad is 6th generation, with papers. This puppy will be sold without breeding registration unless requested.","images/Penguins.jpg","10/09/2019","10/11/2019",true,"Kikinda");
		Ad ad11 = new Ad("11","Tea tree oil",4,"Original oil from Australia. Very good at treating many diseases, especially good for skin problems.","images/Penguins.jpg","10/09/2019","23/12/2019",true,"Novi Sad");
		Ad ad12 = new Ad("12","BMW X3 (2017)",50000,"Two years old, in very good condition.","images/Penguins.jpg","10/09/2019","26/03/2020",true,"Novi Sad");
     
		
		ad1.setInFavouriteList(ad1.getInFavouriteList() + 1); //all of them are in Pera's favorite list
		ad2.setInFavouriteList(ad2.getInFavouriteList() + 1);
		ad3.setInFavouriteList(ad3.getInFavouriteList() + 1);
		ad4.setInFavouriteList(ad4.getInFavouriteList() + 1);
		ad5.setInFavouriteList(ad5.getInFavouriteList() + 1);
		ad6.setInFavouriteList(ad6.getInFavouriteList() + 1);
		ad7.setInFavouriteList(ad7.getInFavouriteList() + 1);
		ad8.setInFavouriteList(ad8.getInFavouriteList() + 1);
		ad9.setInFavouriteList(ad9.getInFavouriteList() + 1);		
		ad10.setInFavouriteList(ad10.getInFavouriteList() + 1);

		ads.put(ad1.getId(), ad1);
		ads.put(ad2.getId(), ad2);
		ads.put(ad3.getId(), ad3);
		ads.put(ad4.getId(), ad4);
		ads.put(ad5.getId(), ad5);
		ads.put(ad6.getId(), ad6);	
		ads.put(ad7.getId(), ad7);	
		ads.put(ad8.getId(), ad8);	
		ads.put(ad9.getId(), ad9);	
		ads.put(ad10.getId(), ad10);	
		ads.put(ad11.getId(), ad11);
		ads.put(ad12.getId(), ad12);
	
 }
 
 @SuppressWarnings("unchecked")
private void loadAds(String contextPath) {
		FileWriter fileWriter = null;
		BufferedReader in = null;
		File file = null;
		System.out.println(contextPath);
		try {
			file = new File(contextPath + "/data/ads.txt");
			in = new BufferedReader(new FileReader(file));

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.setVisibilityChecker(
					VisibilityChecker.Std.defaultInstance().withFieldVisibility(JsonAutoDetect.Visibility.ANY));
			TypeFactory factory = TypeFactory.defaultInstance();
			MapType type = factory.constructMapType(HashMap.class, String.class, Ad.class);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			ads = ((HashMap<String, Ad>) objectMapper.readValue(file, type));
		} catch (FileNotFoundException fnfe) {
			System.out.println("The file for ads hasn't been found."); 
			try {
				file.createNewFile();
				System.out.println("Created a new file for ads");
				fileWriter = new FileWriter(file);
				ObjectMapper objectMapper = new ObjectMapper();
				objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
				objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
				String stringAds = objectMapper.writeValueAsString(ads);
				fileWriter.write(stringAds);
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
 
 public void saveAds() {
		File file = new File(adPath + "/data/ads.txt");
		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(file);
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			String stringAds = objectMapper.writeValueAsString(ads);
			fileWriter.write(stringAds);
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


