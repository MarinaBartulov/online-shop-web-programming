package beans;


public class DeliveredAd {
	
	private int id;
	private String adID;
	private String customer;
	private String seller;
	private String dateTime;
	private int idReviewForAd;
	private int idReviewForSeller;
	private boolean reportAd;
	private boolean reportSeller;
	
	public DeliveredAd() {
		
	}
	
	public DeliveredAd(String adID, String customer, String seller, String dateTime) {
		this.adID = adID;
		this.customer = customer;
		this.seller = seller;
		this.dateTime = dateTime;
		this.idReviewForAd = 0;
		this.idReviewForSeller = 0;
		this.reportAd = false;
		this.reportSeller = false;
	}

	public String getAdID() {
		return adID;
	}

	public void setAdID(String adID) {
		this.adID = adID;
	}
	

	public String getCustomer() {
		return customer;
	}

	public void setCustomer(String customer) {
		this.customer = customer;
	}

	public String getDateTime() {
		return dateTime;
	}

	public void setDateTime(String dateTime) {
		this.dateTime = dateTime;
	}

	public String getSeller() {
		return seller;
	}

	public void setSeller(String seller) {
		this.seller = seller;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}


	public int getIdReviewForAd() {
		return idReviewForAd;
	}

	public void setIdReviewForAd(int idReviewForAd) {
		this.idReviewForAd = idReviewForAd;
	}

	public int getIdReviewForSeller() {
		return idReviewForSeller;
	}

	public void setIdReviewForSeller(int idReviewForSeller) {
		this.idReviewForSeller = idReviewForSeller;
	}

	public boolean isReportAd() {
		return reportAd;
	}

	public void setReportAd(boolean reportAd) {
		this.reportAd = reportAd;
	}

	public boolean isReportSeller() {
		return reportSeller;
	}

	public void setReportSeller(boolean reportSeller) {
		this.reportSeller = reportSeller;
	}	

}
