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
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;

import beans.Category;
import beans.User;


public class CategoryDAO {
	
	private HashMap<Integer,Category> categories = new HashMap<Integer,Category>();
	private String categoryPath = "";
	
	public CategoryDAO() {
             loadTestData(); 
	}
	
	public CategoryDAO(String contextPath) {
		this.categories = new HashMap<Integer,Category>();
		this.categoryPath = contextPath;
		//loadTestData();
		loadCategories(categoryPath);
	}
	
	public HashMap<Integer, Category> getCategories() {
		return categories;
	}




	public void setCategories(HashMap<Integer, Category> categories) {
		this.categories = categories;
	}
	
	
	public boolean addCategory(Category category) {
		
		
		int maxId = 0;
		for(Category cat:categories.values()) {
			if(cat.getId()>maxId) {
				maxId = cat.getId();
			}
			if(cat.getName().equals(category.getName())) {
				return false;
			}
		}
		maxId++;
		category.setId(maxId);
		category.setAds(new ArrayList<String>());
		categories.put(category.getId(), category);
		saveCategories();
		return true;
		
	}
	
	
	public void deleteCategory(int id, UserDAO userDAO, MessageDAO messageDAO,AdDAO adDAO,User admin) {
		categories.get(id).setDeleted(true);
		saveCategories();
		ArrayList<String> ids = categories.get(id).getAds();
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
		
	    //first I remove all the ads that belonged to the category that has been removed
		for(int i=0;i<ids.size();i++) {
			adDAO.getAds().get(ids.get(i)).setDeleted(true); 
		}
		adDAO.saveAds();
		//go through all the sellers and check whether those ads were their ads and then send them messages
		//go through all the customers and check whether they ordered those ads or they are delivered to them
		for(User user: userDAO.getUsers().values()) {
			if(user.getRole().equals("Seller")) {
				if(!Collections.disjoint(user.getPostedAds(), ids)) { //I am going to find them only if they exist 
					for(int i=0;i<ids.size();i++) {
						 if(user.getPostedAds().contains(ids.get(i))) {
								int idx = messageDAO.addMessage(adDAO.getAds().get(ids.get(i)).getName(), admin.getUsername(), admin.getRole(), "Deleted ad", "This ad has been deleted because its category had been deleted.", formatter.format(date).toString(),user.getUsername()); //add the message in the global list of messages
								user.getReceivedMessages().add(idx);
								admin.getSentMessages().add(idx);
							}
						}
					}
				}
			if(user.getRole().equals("Customer")) {
				if(!Collections.disjoint(user.getOrderedAds(), ids)) { //I am going to find them only if they exist
					for(int i=0;i<ids.size();i++) {
						 if(user.getOrderedAds().contains(ids.get(i))) { {
								int idx = messageDAO.addMessage(adDAO.getAds().get(ids.get(i)).getName(), admin.getUsername(), admin.getRole(), "Deleted ad", "This ad has been deleted because its category had been deleted.", formatter.format(date).toString(),user.getUsername()); 
								user.getReceivedMessages().add(idx);
								admin.getSentMessages().add(idx);
								
							}
						}
					}
				}
				//go through the list of ordered ads and check whether they are present in the list of removed ads
				for(int i=0;i<user.getDeliveredAdsCustomer().size();i++) {
					if(ids.contains(user.getDeliveredAdsCustomer().get(i).getAdID())) {
						int idx = messageDAO.addMessage(adDAO.getAds().get(user.getDeliveredAdsCustomer().get(i).getAdID()).getName(), admin.getUsername(), admin.getRole(), "Deleted ad", "This ad has been deleted because its category had been deleted.", formatter.format(date).toString(),user.getUsername()); 
						user.getReceivedMessages().add(idx);
						admin.getSentMessages().add(idx);
					}
				}
					
				
			}
		}
		userDAO.saveUsers();
		
	}
	
	public Collection<Category> findAllCategories(){
		return categories.values();
	}
	
	public boolean editCategory(int id,Category category) {
		for(Category cat: categories.values()) {
			if(cat.getName().equals(category.getName()) && cat.getId() != id) {
				return false;
			}
		}
		categories.get(id).setName(category.getName());
		categories.get(id).setDescription(category.getDescription());
		saveCategories();
		return true;
	}
	
	public Category whichCategory(String id) {
		
		for(Category cat: categories.values()) {
			if(cat.getAds().contains(id)) {
				return cat;
			}
		}
		return null;
	}

   private void loadTestData() {

		Category c1 = new Category(1,"Cars and Motorcycles","All types of cars.");
		Category c2 = new Category(2,"Consumer Electronics","All electronic devices for personal use.");
		Category c3 = new Category(3,"Women's Fashion","All clothes for women.");
		Category c4 = new Category(4,"Furniture","Furniture of all kinds and for all situations.");
		Category c5 = new Category(5,"Pet","Pet of all kinds and stuff for them.");
		Category c6 = new Category(6,"Food","All kinds of food and beverages.");

		c1.getAds().add("1");
		c1.getAds().add("12");
		c2.getAds().add("2");
		c2.getAds().add("7");
		c3.getAds().add("3");
		c3.getAds().add("9");
		c4.getAds().add("4");
		c4.getAds().add("8");
		c5.getAds().add("5");
		c5.getAds().add("10");
		c6.getAds().add("6");
		c6.getAds().add("11");

		categories.put(c1.getId(),c1);
		categories.put(c2.getId(), c2);
		categories.put(c3.getId(), c3);
		categories.put(c4.getId(), c4);
		categories.put(c5.getId(), c5);
		categories.put(c6.getId(), c6);

		 
   }
   
@SuppressWarnings("unchecked")
private void loadCategories(String contextPath) {
		FileWriter fileWriter = null;
		BufferedReader in = null;
		File file = null;
		System.out.println(contextPath);
		try {
			file = new File(contextPath + "/data/categories.txt");
			in = new BufferedReader(new FileReader(file));

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.setVisibilityChecker(
					VisibilityChecker.Std.defaultInstance().withFieldVisibility(JsonAutoDetect.Visibility.ANY));
			TypeFactory factory = TypeFactory.defaultInstance();
			MapType type = factory.constructMapType(HashMap.class, Integer.class, Category.class);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			categories = ((HashMap<Integer, Category>) objectMapper.readValue(file, type));
		} catch (FileNotFoundException fnfe) {
			System.out.println("The file for categories hasn't been found."); 
			try {
				file.createNewFile();
				System.out.println("Created a new file for categories.");
				fileWriter = new FileWriter(file);
				ObjectMapper objectMapper = new ObjectMapper();
				objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
				objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
				String stringCategories = objectMapper.writeValueAsString(categories);
				fileWriter.write(stringCategories);
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

public void saveCategories() {
	File file = new File(categoryPath + "/data/categories.txt");
	FileWriter fileWriter = null;
	try {
		fileWriter = new FileWriter(file);
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
		objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
		String stringCategories = objectMapper.writeValueAsString(categories);
		fileWriter.write(stringCategories);
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
