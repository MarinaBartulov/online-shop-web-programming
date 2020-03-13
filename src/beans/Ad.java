package beans;

import java.util.ArrayList;

public class Ad {
	
	private String id;
	private String name;
	private double price;
	private String description;
	private int likes; 
	private int dislikes;
	private String photo;
	private String postingDate;
	private String expiryDate;
	private boolean active;
	private ArrayList<Integer> reviews; //list of ids of reviews that belong to the ad
	private String city;
	
	private boolean deleted;
	private String status; //New,In realization,Delivered
	private int inFavouriteList; //number of favorite lists which contain this ad
	private ArrayList<String> listLikes; //username of users who have liked this ad, so that they can't do it again
	private ArrayList<String> listDislikes; //username of users who have disliked this ad
	
	
	public Ad(){
		
	}

	public Ad(String id, String name, double price, String description, int likes, int dislikes, String photo, String postingDate,
			String expiryDate, boolean active, String city) {
		super();
		this.id = id;
		this.name = name;
		this.price = price;
		this.description = description;
		this.likes = likes;
		this.dislikes = dislikes;
		this.photo = photo;
		this.postingDate = postingDate;
		this.expiryDate = expiryDate;
		this.active = active;
		this.reviews = new ArrayList<Integer>();
		this.city = city;
		this.deleted = false;
		this.status = "New";
		this.inFavouriteList = 0;
	}
	
	
	
	public Ad(String id, String name, double price, String description, String photo, String postingDate,
			String expiryDate, boolean active, String city) {
		super();
		this.id = id;
		this.name = name;
		this.price = price;
		this.description = description;
		this.photo = photo;
		this.postingDate = postingDate;
		this.expiryDate = expiryDate;
		this.active = active;
		this.city = city;
		this.likes = 0; 
		this.dislikes = 0;
		this.reviews = new ArrayList<Integer>();
		this.deleted = false;
		this.status = "New";
		this.listLikes = new ArrayList<String>();
		this.listDislikes = new ArrayList<String>();
	}

	public String getId() {
		return id;
	}
	
	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public String getPostingDate() {
		return postingDate;
	}

	public void setPostingDate(String postingDate) {
		this.postingDate = postingDate;
	}

	public String getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(String expiryDate) {
		this.expiryDate = expiryDate;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public ArrayList<Integer> getReviews() {
		return reviews;
	}

	public void setReviews(ArrayList<Integer> reviews) {
		this.reviews = reviews;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getInFavouriteList() {
		return inFavouriteList;
	}

	public void setInFavouriteList(int inFavouriteList) {
		this.inFavouriteList = inFavouriteList;
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
	
	
	
	
	
	
	
}
