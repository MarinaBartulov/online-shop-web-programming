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

import beans.DeliveredAd;
import beans.User;

public class UserDAO {
	
	public HashMap<String,User> users = new HashMap<String,User>();
	public String userPath = "";
	
	public UserDAO() {
		loadTestData();	
	}
	
	public UserDAO(String contextPath) {
		this.users = new HashMap<String,User>();
		this.userPath = contextPath;
		//loadTestData();
		loadUsers(userPath);
	}
	
	public HashMap<String, User> getUsers() {
		return users;
	}

	public void setUsers(HashMap<String, User> users) {
		this.users = users;
	}
	
	public User findUser(String username, String password) {
		if (!users.containsKey(username)) {
			return null;
		}
		User user = users.get(username);
		if (!user.getPassword().equals(password)) {
			return null;
		}
		return user;
	}
	
	public boolean usernameExists(String username) {
		if (users.containsKey(username)) {
			return true;
		}else {
			return false;
		}
	}
	
	public Collection<User> findAll() {
		return users.values();
	}
	
	public User registerUser(User user) {
		
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");  
	    Date date = new Date();    
		User u = new User(user.getUsername(),user.getPassword(),
				user.getName(),user.getSurname(),"Customer",user.getPhoneNumber(),user.getCity(),user.getEmail(),
				formatter.format(date));
		users.put(u.getUsername(), u);
		saveUsers();
		return u;
	}

	
	
	
	public void changeType(String username,String type, User admin, AdDAO adDAO,MessageDAO messageDAO) {
		//messages are removed if a user changes their role
		//likes, dislikes and reviews which were left on ads and sellers remain the same
		User user = users.get(username);
		if(user.getRole().equals("Customer")) { //if it's a customer who is changing a role
			for(int i=0;i<user.getOrderedAds().size();i++) {
				adDAO.getAds().get(user.getOrderedAds().get(i)).setStatus("New"); //ad which was in realization returns to the other ads
			}
			for(int i=0;i<user.getFavouriteAds().size();i++) { //reduce the number of favorite lists which contain this ad
				int inFave =  adDAO.getAds().get(user.getFavouriteAds().get(i)).getInFavouriteList();
				adDAO.getAds().get(user.getFavouriteAds().get(i)).setInFavouriteList(inFave-1);
			}
			user.setDeliveredAdsCustomer(null);
			user.setOrderedAds(null);
			user.setFavouriteAds(null);
			if(type.equals("Seller")) {
				user.setRole("Seller");
				user.setDeliveredAdsSeller(new ArrayList<DeliveredAd>());
				user.setPostedAds(new ArrayList<String>());
				user.setLikes(0);
				user.setDislikes(0);
				user.setReviews(new ArrayList<Integer>());
				user.setListLikes(new ArrayList<String>());
				user.setListDislikes(new ArrayList<String>());
				user.setNumberOfBans(0);
			}
			if(type.equals("Administrator")) {
				user.setRole("Administrator");
			}
		}
		if(user.getRole().equals("Seller")) { //if it's a seller who is changing a role
			SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:MM:ss a");  
		    Date date = new Date(); 
			for(int i=0;i<user.getPostedAds().size();i++) {
				adDAO.getAds().get(user.getPostedAds().get(i)).setDeleted(true); //remove ads of the seller
				//send messages to the users who have those ads in their ordered or delivered lists
				for(User u: users.values()) {
					if(u.getRole().equals("Customer")) { 
						if(u.getOrderedAds().contains(user.getPostedAds().get(i))) {
							int idx = messageDAO.addMessage(adDAO.getAds().get(user.getPostedAds().get(i)).getName(), admin.getUsername(), admin.getRole(), "Deleted ad", "This ad has been deleted because its seller has changed type.", formatter.format(date).toString(),u.getUsername()); 
							u.getReceivedMessages().add(idx);
							admin.getSentMessages().add(idx);
						}
						int j = i; 
						if(u.getDeliveredAdsCustomer().stream().filter(o -> o.getAdID().equals(user.getPostedAds().get(j))).findFirst().isPresent()) { //this is changed because of deliveredAd
							int idx = messageDAO.addMessage(adDAO.getAds().get(user.getPostedAds().get(i)).getName(), admin.getUsername(), admin.getRole(), "Deleted ad", "This ad has been deleted because its seller has changed type.", formatter.format(date).toString(),u.getUsername()); 
							u.getReceivedMessages().add(idx);
							admin.getSentMessages().add(idx);
							
						}
					}
				}
			}
					
			user.setDeliveredAdsSeller(null);
			user.setPostedAds(null);
			user.setLikes(0);
			user.setDislikes(0);
			user.setReviews(null);
			user.setListLikes(null);
			user.setListDislikes(null);
			user.setNumberOfBans(0);
			
			if(type.equals("Customer")) {
				user.setRole("Customer");
				user.setDeliveredAdsCustomer(new ArrayList<DeliveredAd>());
				user.setOrderedAds(new ArrayList<String>());
				user.setFavouriteAds(new ArrayList<String>());
			}
			if(type.equals("Administrator")) {
				user.setRole("Administrator");
			}
		}
		
		//regardless of a role I delete all the messages that the user has sent and received
		for(int i=0;i<user.getReceivedMessages().size();i++) {
			messageDAO.deleteMessage(user.getReceivedMessages().get(i));
		}
		for(int i=0;i<user.getSentMessages().size();i++) {
			messageDAO.deleteMessage(user.getSentMessages().get(i));
		}
		user.setReceivedMessages(new ArrayList<Integer>());
		user.setSentMessages(new ArrayList<Integer>());
		saveUsers();
		adDAO.saveAds();
	}
	
	public User likeSeller(User currentUser, String seller) {
		if(users.get(seller).getListLikes().contains(currentUser.getUsername())) { //if a user has already liked it and again clicked that button, then he canceled it
			int i = users.get(seller).getListLikes().indexOf(currentUser.getUsername());
			users.get(seller).getListLikes().remove(i);
			users.get(seller).setLikes(users.get(seller).getListLikes().size());
		}else {
			if(users.get(seller).getListDislikes().contains(currentUser.getUsername())) { //if a user has already disliked it, then it cancels dislike and he likes it
				int i = users.get(seller).getListDislikes().indexOf(currentUser.getUsername());
				users.get(seller).getListDislikes().remove(i);
				users.get(seller).setDislikes(users.get(seller).getListDislikes().size());
			}
			users.get(seller).getListLikes().add(currentUser.getUsername());
			users.get(seller).setLikes(users.get(seller).getListLikes().size());
		}
		saveUsers();
		return users.get(seller);
	}
	
	public User dislikeSeller(User currentUser, String seller) {
		if(users.get(seller).getListDislikes().contains(currentUser.getUsername())) { //if a user has already disliked it and again clicked that button, then he canceled it
			int i = users.get(seller).getListDislikes().indexOf(currentUser.getUsername());
			users.get(seller).getListDislikes().remove(i);
			users.get(seller).setDislikes(users.get(seller).getListDislikes().size());
		}else {
			if(users.get(seller).getListLikes().contains(currentUser.getUsername())) { //if a user has already liked it, then it cancels like and he dislikes it
				int i = users.get(seller).getListLikes().indexOf(currentUser.getUsername());
				users.get(seller).getListLikes().remove(i);
				users.get(seller).setLikes(users.get(seller).getListLikes().size());
			}
			users.get(seller).getListDislikes().add(currentUser.getUsername());
			users.get(seller).setDislikes(users.get(seller).getListDislikes().size());
		}
		saveUsers();
		return users.get(seller);
	}
	
	public DeliveredAd reportAd(int deliveredAdID,User currentUser,UserDAO userDAO,MessageDAO messageDAO,AdDAO adDAO) {
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy ss:MM:hh a");  
	    Date date = new Date(); 
	    DeliveredAd delAd = null;
		for(int i=0;i<currentUser.getDeliveredAdsCustomer().size();i++) {
			if(currentUser.getDeliveredAdsCustomer().get(i).getId() == deliveredAdID) {
				delAd = currentUser.getDeliveredAdsCustomer().get(i);
				delAd.setReportAd(true); //set that the customer reported the ad
				User seller = userDAO.getUsers().get(delAd.getSeller());
				seller.setNumberOfBans(seller.getNumberOfBans() + 1); //increase the number of reports for the seller
				//admins send a message to the seller
				for(User u: userDAO.getUsers().values()) {
					if(u.getRole().equals("Administrator")) {
						int idx = messageDAO.addMessage(adDAO.getAds().get(delAd.getAdID()).getName(), u.getUsername(), "Administrator", "Reported ad", "Your ad \"" + adDAO.getAds().get(delAd.getAdID()).getName() + "\" has been reported for invalid description by the customer " + currentUser.getUsername() + ".", formatter.format(date).toString(), seller.getUsername());
						u.getSentMessages().add(idx);
						seller.getReceivedMessages().add(idx);
						break; //just one of them sends the message, the first one
					}
				}
				break;
			}
		}
		saveUsers();
		return delAd;
		
	}
	
	public DeliveredAd reportSeller(int deliveredAdID,User currentUser,UserDAO userDAO,MessageDAO messageDAO,AdDAO adDAO) {
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy ss:MM:hh a");  
	    Date date = new Date(); 
	    DeliveredAd delAd = null;
		for(int i=0;i<currentUser.getDeliveredAdsCustomer().size();i++) {
			if(currentUser.getDeliveredAdsCustomer().get(i).getId() == deliveredAdID) {
				delAd = currentUser.getDeliveredAdsCustomer().get(i);
				delAd.setReportSeller(true); //set that the customer reported the seller
				User seller = userDAO.getUsers().get(delAd.getSeller());
				seller.setNumberOfBans(seller.getNumberOfBans() + 1); //increase the number of reports for the seller
				//admins send a message to the seller
				for(User u: userDAO.getUsers().values()) {
					if(u.getRole().equals("Administrator")) {
						int idx = messageDAO.addMessage(adDAO.getAds().get(delAd.getAdID()).getName(), u.getUsername(), "Administrator", "Reported seller", "You have been reported for fraud  (ad \"" + adDAO.getAds().get(delAd.getAdID()).getName() + "\")  by customer " + currentUser.getUsername() + ".", formatter.format(date).toString(), seller.getUsername());
						u.getSentMessages().add(idx);
						seller.getReceivedMessages().add(idx);
						break; //just one of them sends the message, the first one
					}
				}
				break;
			}
		}
		saveUsers();
		return delAd;
		
	}
	
	private void loadTestData() {
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy");  
	    Date date = new Date(); 
	    User u1 = new User("admin","admin","Marina","Bartulov","Administrator","0652534655","Novi Sad","admin@gmail.com",formatter.format(date));
	    User u2 = new User("mika","mika","Mika","Mikic","Seller","0646824377","Subotica","mika@gmail.com",formatter.format(date));
	    User u3 = new User("zika","zika","Zika","Zikic","Seller","0614563399","Beograd","zika@gmail.com",formatter.format(date));
	    User u4 = new User("pera","pera","Petar","Petrovic","Customer","0627486624","Novi Sad","pera@gmail.com",formatter.format(date));
	    User u5 = new User("zora","zora","Zora","Zoric","Customer","0663458966","Vranje","zora@gmail.com",formatter.format(date));
	    u2.getPostedAds().add("1");
	    u2.getPostedAds().add("2");
	    u2.getPostedAds().add("3");
	    u2.getPostedAds().add("4");
	    u2.getPostedAds().add("5");
	    u2.getPostedAds().add("6");
	    u3.getPostedAds().add("7");
	    u3.getPostedAds().add("8");
	    u3.getPostedAds().add("9");
	    u3.getPostedAds().add("10");
	    u3.getPostedAds().add("11");
	    u3.getPostedAds().add("12");

	    u4.getOrderedAds().add("1");  //Pera has been ordered the ad 1
	    u4.getFavouriteAds().add("1");
	    u4.getFavouriteAds().add("2");
	    u4.getFavouriteAds().add("3");
	    u4.getFavouriteAds().add("4");
	    u4.getFavouriteAds().add("5");
	    u5.getFavouriteAds().add("6");
	    u5.getFavouriteAds().add("7");
	    u5.getFavouriteAds().add("8");
	    u5.getFavouriteAds().add("9");
	    u5.getFavouriteAds().add("10");

	    u2.getReceivedMessages().add(1); //admin sent the message to Mika
	    u2.getReceivedMessages().add(2); //pera sent the message to Mika
	    u1.getSentMessages().add(1);
	    u4.getSentMessages().add(2);
	    
		users.put(u1.getUsername(), u1);
		users.put(u2.getUsername(), u2);
		users.put(u3.getUsername(), u3);
		users.put(u4.getUsername(), u4);
		users.put(u5.getUsername(), u5);
	}
	
	@SuppressWarnings("unchecked")
	private void loadUsers(String contextPath) {
		FileWriter fileWriter = null;
		BufferedReader in = null;
		File file = null;
		System.out.println(contextPath);
		try {
			file = new File(contextPath + "/data/users.txt");
			in = new BufferedReader(new FileReader(file));

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.setVisibilityChecker(
					VisibilityChecker.Std.defaultInstance().withFieldVisibility(JsonAutoDetect.Visibility.ANY));
			TypeFactory factory = TypeFactory.defaultInstance();
			MapType type = factory.constructMapType(HashMap.class, String.class, User.class);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			users = ((HashMap<String, User>) objectMapper.readValue(file, type));
		} catch (FileNotFoundException fnfe) {
			System.out.println("The file for users hasn't been found."); 
			try {
				file.createNewFile();
				System.out.println("Created a new file for users.");
				fileWriter = new FileWriter(file);
				ObjectMapper objectMapper = new ObjectMapper();
				objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
				objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
				String stringUsers = objectMapper.writeValueAsString(users);
				fileWriter.write(stringUsers);
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
	
	public void saveUsers() {
		File file = new File(userPath + "/data/users.txt");
		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(file);
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			String stringUsers = objectMapper.writeValueAsString(users);
			fileWriter.write(stringUsers);
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
