package beans;

import java.util.ArrayList;

public class User {
	
	private String username;
	private String password;
	private String name;
	private String surname;
	private String role;
	private String phoneNumber;
	private String city;
	private String email;
	private String dateOfReg; //date of registration
	private ArrayList<Integer> receivedMessages; //all users can receive messages
	private ArrayList<Integer> sentMessages; //all users can send messages
	//Customers
	private ArrayList<String> orderedAds; //list of ads that represent ordered ads for customer
	private ArrayList<DeliveredAd> deliveredAdsCustomer;
	private ArrayList<String> favouriteAds;
	//Sellers
	private ArrayList<String> postedAds; 
	private ArrayList<DeliveredAd> deliveredAdsSeller;
	private int likes; 
	private int dislikes; 
	private ArrayList<Integer> reviews;
	private ArrayList<String> listLikes;
	private ArrayList<String> listDislikes;
	private int numberOfBans;
	
	
	public User() {
		
	}

	public User(String username, String password, String name, String surname, String role, String phoneNumber,
			String city, String email, String dateOfReg) {
		super();
		this.username = username;
		this.password = password;
		this.name = name;
		this.surname = surname;
		this.role = role;
		this.phoneNumber = phoneNumber;
		this.city = city;
		this.email = email;
		this.dateOfReg = dateOfReg;
		this.receivedMessages = new ArrayList<Integer>();
		this.sentMessages = new ArrayList<Integer>();
		if(role.equals("Customer")) {
			this.orderedAds = new ArrayList<String>();
			this.deliveredAdsCustomer = new ArrayList<DeliveredAd>();
			this.favouriteAds = new ArrayList<String>();
			
		}else if(role.equals("Seller")) {
			this.deliveredAdsSeller = new ArrayList<DeliveredAd>();
			this.postedAds = new ArrayList<String>();
			this.likes = 0;
			this.dislikes = 0;
			this.reviews = new ArrayList<Integer>();
			this.listLikes = new ArrayList<String>();
			this.listDislikes = new ArrayList<String>();
			this.numberOfBans = 0;
		}
	}


	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSurname() {
		return surname;
	}

	public void setSurname(String surname) {
		this.surname = surname;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getDateOfReg() {
		return dateOfReg;
	}

	public void setDateOfReg(String dateOfReg) {
		this.dateOfReg = dateOfReg;
	}

	public ArrayList<Integer> getReceivedMessages() {
		return receivedMessages;
	}

	public void setReceivedMessages(ArrayList<Integer> receivedMessages) {
		this.receivedMessages = receivedMessages;
	}

	public ArrayList<Integer> getSentMessages() {
		return sentMessages;
	}

	public void setSentMessages(ArrayList<Integer> sentMessages) {
		this.sentMessages = sentMessages;
	}


	public ArrayList<String> getFavouriteAds() {
		return favouriteAds;
	}

	public void setFavouriteAds(ArrayList<String> favouriteAds) {
		this.favouriteAds = favouriteAds;
	}

	public ArrayList<String> getPostedAds() {
		return postedAds;
	}

	public void setPostedAds(ArrayList<String> postedAds) {
		this.postedAds = postedAds;
	}

	public int getLikes() {
		return likes;
	}

	public void setLikes(int likes) {
		this.likes = likes;
	}

	public int getDislikes() {
		return dislikes;
	}

	public void setDislikes(int dislikes) {
		this.dislikes = dislikes;
	}
	

	public ArrayList<String> getOrderedAds() {
		return orderedAds;
	}

	public void setOrderedAds(ArrayList<String> orderedAds) {
		this.orderedAds = orderedAds;
	}

	public ArrayList<DeliveredAd> getDeliveredAdsCustomer() {
		return deliveredAdsCustomer;
	}

	public void setDeliveredAdsCustomer(ArrayList<DeliveredAd> deliveredAdsCustomer) {
		this.deliveredAdsCustomer = deliveredAdsCustomer;
	}

	public ArrayList<DeliveredAd> getDeliveredAdsSeller() {
		return deliveredAdsSeller;
	}

	public void setDeliveredAdsSeller(ArrayList<DeliveredAd> deliveredAdsSeller) {
		this.deliveredAdsSeller = deliveredAdsSeller;
	}

	public ArrayList<Integer> getReviews() {
		return reviews;
	}

	public void setReviews(ArrayList<Integer> reviews) {
		this.reviews = reviews;
	}

	public ArrayList<String> getListLikes() {
		return listLikes;
	}

	public void setListLikes(ArrayList<String> listLikes) {
		this.listLikes = listLikes;
	}

	public ArrayList<String> getListDislikes() {
		return listDislikes;
	}

	public void setListDislikes(ArrayList<String> listDislikes) {
		this.listDislikes = listDislikes;
	}
	
	public int findMaxIdCustomer() {
		int idx = 0;
		for(DeliveredAd da : deliveredAdsCustomer) {
			if(da.getId()>idx) {
				idx = da.getId();			}
		}
		return idx;
	}
	
	public int findMaxIdSeller() {
		int idx = 0;
		for(DeliveredAd da : deliveredAdsSeller) {
			if(da.getId()>idx) {
				idx = da.getId();			}
		}
		return idx;
	}

	public int getNumberOfBans() {
		return numberOfBans;
	}

	public void setNumberOfBans(int numberOfBans) {
		this.numberOfBans = numberOfBans;
	}
	
	
    
	
	
	
	

}
