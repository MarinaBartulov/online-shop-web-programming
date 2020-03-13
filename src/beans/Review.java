package beans;

public class Review {
	
	private int id;
	private String ad; //id of an ad
	private String reviewer;
	private String title; 
	private String content; 
	private String photo;
	private boolean descriptionTrue; //if a description in the ad is valid
	private boolean respectedAgreement; //if an agreement between a seller and customer is respected
	private boolean deleted;
	
	private String forAdOrSeller; //for an ad or the seller of the ad
	
	public Review() {
		
	}

	public Review(int id, String ad, String reviewer, String title, String content, String photo, boolean descriptionTrue,
			boolean respectedAgreement,String forAdOrSeller) {
		this.id = id;
		this.ad = ad;
		this.reviewer = reviewer;
		this.title = title;
		this.content = content;
		this.photo = photo;
		this.descriptionTrue = descriptionTrue;
		this.respectedAgreement = respectedAgreement;
		this.deleted = false;
		this.forAdOrSeller = forAdOrSeller;
	}

	public String getAd() {
		return ad;
	}

	public void setAd(String ad) {
		this.ad = ad;
	}

	public String getReviewer() {
		return reviewer;
	}

	public void setReviewer(String reviewer) {
		this.reviewer = reviewer;
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

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public boolean isDescriptionTrue() {
		return descriptionTrue;
	}

	public void setDescriptionTrue(boolean descriptionTrue) {
		this.descriptionTrue = descriptionTrue;
	}

	public boolean isRespectedAgreement() {
		return respectedAgreement;
	}

	public void setRespectedAgreement(boolean respectedAgreement) {
		this.respectedAgreement = respectedAgreement;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public String getForAdOrSeller() {
		return forAdOrSeller;
	}

	public void setForAdOrSeller(String forAdOrSeller) {
		this.forAdOrSeller = forAdOrSeller;
	}
	
	
	
	
	
	

}
