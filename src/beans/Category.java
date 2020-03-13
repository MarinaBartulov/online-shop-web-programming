package beans;


import java.util.ArrayList;


public class Category {
	private int id; 
	private String name; 
	private String description;
	private ArrayList<String> ads; //list of ids of ads that belong to this category
	private boolean deleted;
	
	public Category() {
		
	}
	
	public Category(int id, String name, String description) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.ads = new ArrayList<String>();
		this.deleted = false;
	}
	

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public ArrayList<String> getAds() {
		return ads;
	}

	public void setAds(ArrayList<String> ads) {
		this.ads = ads;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}	

}
