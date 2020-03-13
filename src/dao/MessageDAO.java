package dao;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
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

import beans.Message;
import beans.User;

public class MessageDAO {

	private HashMap<Integer,Message> messages = new HashMap<Integer,Message>();
	private String messagePath = "";
	
	public MessageDAO() {
		loadTestData();
	}
	
	public MessageDAO(String contextPath) {
		this.messages = new HashMap<Integer,Message>();
		this.messagePath = contextPath;
		//loadTestData();
		loadMessages(messagePath);
	}
	
	public HashMap<Integer, Message> getMessages() {
		return messages;
	}



	public void setMessages(HashMap<Integer, Message> messages) {
		this.messages = messages;
	}
	
	
	
	public Collection<Message> getAllMessages(){
		return messages.values();
	}
	
	
	public int addMessage(String adName, String sender, String roleOfSender, String title, String content, String dateTime,String recipient) {
		int maxId = 0;
		for(Message m:this.messages.values()) {
			if(m.getId()>maxId) {
				maxId = m.getId();
			}
		}
		maxId++;
		this.messages.put(maxId,new Message(maxId,adName,sender,roleOfSender,title,content,dateTime,recipient));
		saveMessages();
		return maxId;
 }
	public void deleteMessage(int id) {
		
		messages.get(id).setDeleted(true);
		saveMessages();
	}
	
	public void editMessage(int id, String content) {
		messages.get(id).setContent(content);
		saveMessages();
	}
	
	public boolean validForSending(User currentUser, User recipient) {
		//if there are the same messages in a seller's delivered messages and a customer's sent messages
		if(!Collections.disjoint(currentUser.getReceivedMessages(), recipient.getSentMessages())) {
			return true;
		}else {
			return false;
		}
		
	}

    private void loadTestData() {
    	SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:MM:ss a");  
	    Date date = new Date(); 
    	Message m1 = new Message(1,"Scottish Fold cat","admin","Administrator","Not Allowed Content","Description of this ad is very short. Please make it longer or administrators will deactivate this ad.",formatter.format(date),"mika");
		Message m2 = new Message(2,"Dell Inspiron 3542","pera","Customer","Question about memory","Which type of drive does this laptop have?",formatter.format(date),"mika");
		messages.put(m1.getId(),m1);
		messages.put(m2.getId(), m2);
    }
    
    @SuppressWarnings("unchecked")
	private void loadMessages(String contextPath) {
		FileWriter fileWriter = null;
		BufferedReader in = null;
		File file = null;
		System.out.println(contextPath);
		try {
			file = new File(contextPath + "/data/messages.txt");
			in = new BufferedReader(new FileReader(file));

			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.setVisibilityChecker(
					VisibilityChecker.Std.defaultInstance().withFieldVisibility(JsonAutoDetect.Visibility.ANY));
			TypeFactory factory = TypeFactory.defaultInstance();
			MapType type = factory.constructMapType(HashMap.class, Integer.class, Message.class);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			messages = ((HashMap<Integer, Message>) objectMapper.readValue(file, type));
		} catch (FileNotFoundException fnfe) {
			System.out.println("The file for messages hasn't been found."); 
			try {
				file.createNewFile();
				System.out.println("Created a new file for messages.");
				fileWriter = new FileWriter(file);
				ObjectMapper objectMapper = new ObjectMapper();
				objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
				objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
				String stringMessages = objectMapper.writeValueAsString(messages);
				fileWriter.write(stringMessages);
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

    public void saveMessages() {
		File file = new File(messagePath + "/data/messages.txt");
		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(file);
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
			objectMapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			String stringMessages = objectMapper.writeValueAsString(messages);
			fileWriter.write(stringMessages);
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
