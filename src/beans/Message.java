package beans;

public class Message {
	private int id; 
	private String adName;
	private String sender; //username of a user who sent the message
	private String roleOfSender; //this is because of sellers, because they can reply only to customers who have already sent them a message
	private String title; 
	private String content; 
	private String dateTime;
	private String recipient; //username of a user who receives the message
	private boolean deleted;
	
	public Message() {
		
	}
	
	public Message(int id, String adName, String sender, String roleOfSender, String title, String content, String dateTime, String recipient) {
		this.id = id;
		this.adName = adName;
		this.sender = sender;
		this.roleOfSender = roleOfSender;
		this.title = title;
		this.content = content;
		this.dateTime = dateTime;
		this.deleted = false;
		this.recipient = recipient;
	}

	public String getAdName() {
		return adName;
	}

	public void setAdName(String adName) {
		this.adName = adName;
	}

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getDateTime() {
		return dateTime;
	}

	public void setDateTime(String dateTime) {
		this.dateTime = dateTime;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getRoleOfSender() {
		return roleOfSender;
	}

	public void setRoleOfSender(String roleOfSender) {
		this.roleOfSender = roleOfSender;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getRecipient() {
		return recipient;
	}

	public void setRecipient(String recipient) {
		this.recipient = recipient;
	}
	
	
	
	
	
	

	
	
	
	
	
	

}
