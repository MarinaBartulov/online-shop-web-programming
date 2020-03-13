package services;

import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;

import javax.annotation.PostConstruct;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import beans.Ad;
import beans.Message;
import beans.User;
import dao.AdDAO;
import dao.MessageDAO;
import dao.UserDAO;

@Path("/messageService")
public class MessageService {

	@Context
	ServletContext ctx;
	
	public MessageService() {
		
	}
	
	@PostConstruct
	public void init() {
		
		if(ctx.getAttribute("messageDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("messageDAO", new MessageDAO(contextPath));
		}		                                        
	}  
	
	
	@Path("/messages")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Message> getAllMessages(){
		
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		return messageDAO.getAllMessages();
	}
	
	
	@Path("/replyMessage")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response replyMessage(Message message, @Context HttpServletRequest request) {
		
		User sender = (User) request.getSession().getAttribute("user");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
		int id = messageDAO.addMessage(message.getAdName(), sender.getUsername(), sender.getRole(), message.getTitle(), message.getContent(), formatter.format(date).toString(), message.getRecipient());
		sender.getSentMessages().add(id);
		userDAO.getUsers().get(message.getRecipient()).getReceivedMessages().add(id);
		userDAO.saveUsers();
		return Response.status(200).build();
		
	}
	
	@Path("/deleteMessage/{id}")
	@DELETE
	public Response deleteMessage(@PathParam("id") int id) {
		
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		messageDAO.deleteMessage(id);
		return Response.status(200).build();
	}
	
	@Path("/editMessage/{id}")
	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editMessage(@PathParam("id") int id, Message message) {
		
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		messageDAO.editMessage(id,message.getContent());
		return Response.status(200).build();
	}
	
	@Path("/messageForSeller/{idAD}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response messageForSeller(Message msg,@PathParam("idAD") String idAD, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
	    Date date = new Date(); 
		if(currentUser.getRole().equals("Customer") || currentUser.getRole().equals("Administrator")) {
			String adName = "";
			for(Ad ad:adDAO.getAds().values()) {
				if(ad.getId().equals(idAD)) {
					adName = ad.getName();
					break;
				}
			}
			String recipientSeller="";
			for(User u:userDAO.getUsers().values()) {
				if(u.getRole().equals("Seller")) {
				  if(u.getPostedAds().contains(idAD)) {
					 recipientSeller = u.getUsername();
					 break;
				}
			  }
			}
			
			int idx = messageDAO.addMessage(adName, currentUser.getUsername(), currentUser.getRole(), msg.getTitle(), msg.getContent(),formatter.format(date).toString(), recipientSeller);
			currentUser.getSentMessages().add(idx);
			userDAO.getUsers().get(recipientSeller).getReceivedMessages().add(idx);
			userDAO.saveUsers();
			return Response.status(200).build();
			
		}else {
			return Response.status(400).entity("You are not allowed to send this message.").build();
		}
		
	}
	
	@Path("/newMessage")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response newMessage(Message m,@Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		String response = "";
		boolean adExists = false;
		boolean bad = false;
		boolean validAd = false;
		
		if(m.getAdName().equals("")) { //if a title of the ad is empty String then the ad is not going to be searched
			adExists = true;
		}else {
		  for(Ad ad:adDAO.getAds().values()) {
			if(ad.getName().equals(m.getAdName())) { //if the ad exists
				adExists = true;
				break;
			}
		  }
		}
		if(!adExists) {
			response += "Ad with that name doesn't exist. ";
			bad = true;
		}
		
		if(!userDAO.getUsers().containsKey(m.getRecipient())) {
			response += "User with that username doesn't exist. ";
			bad = true;
		}
		if(bad) {
			return Response.status(400).entity(response).build();
		}
		
		
		  //it should be checked whether the recipient is a seller and whether he has the ad with that name
			if(userDAO.getUsers().get(m.getRecipient()).getRole().equals("Seller")) {
				User seller = userDAO.getUsers().get(m.getRecipient());
				for(int i=0;i<seller.getPostedAds().size();i++) {
					if(adDAO.getAds().get(seller.getPostedAds().get(i)).getName().equals(m.getAdName())) {
						validAd = true;
						break;
					}
				}
				if(!validAd) {
					response += "This seller doesn't have the ad with that name.";
					bad = true;
				}
			}
			
			if(currentUser.getRole().equals("Customer")) {
				if(!userDAO.getUsers().get(m.getRecipient()).getRole().equals("Seller")) {
					response += "You are not allowed to send a message to this user.";
					bad = true;
				}
			}
			if(currentUser.getRole().equals("Seller")) {
				if(userDAO.getUsers().get(m.getRecipient()).getRole().equals("Seller")) {
					response += "You are not allowed to send a message to this user.";
					bad = true;
				}
				if(userDAO.getUsers().get(m.getRecipient()).getRole().equals("Customer")) {
					  response += "You are not allowed to send message to this user.";
					  bad = true;
				}
				
			}
			//if the user is an administrator then he can send messages to everyone
		
		
		if(bad) {
			return Response.status(400).entity(response).build();
		}else {
			SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss a");  
		    Date date = new Date(); 
			int id = messageDAO.addMessage(m.getAdName(), currentUser.getUsername(), currentUser.getRole(), m.getTitle(), m.getContent(),  formatter.format(date).toString(), m.getRecipient());
			currentUser.getSentMessages().add(id);
			userDAO.getUsers().get(m.getRecipient()).getReceivedMessages().add(id);
			userDAO.saveUsers();
			return Response.status(200).build();
		}
	}
}
