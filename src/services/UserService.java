package services;

import java.util.ArrayList;
import java.util.Collection;

import javax.annotation.PostConstruct;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import beans.DeliveredAd;
import beans.Message;
import beans.User;
import dao.AdDAO;
import dao.MessageDAO;
import dao.UserDAO;

@Path("/userService")
public class UserService {
	
	@Context
	ServletContext ctx;
	
	public UserService() {
		
	}
	
	@PostConstruct
	public void init() {
		
		if(ctx.getAttribute("userDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("userDAO", new UserDAO(contextPath));
		}
		if(ctx.getAttribute("adDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("adDAO", new AdDAO(contextPath)); 
		}                                          
	}                                              
	
	
	@Path("/users")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<User> allUsers(){
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		return userDAO.findAll();
	}
	
	@Path("/registration")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response registration(User user, @Context HttpServletRequest request) {
		
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		boolean exists = userDAO.usernameExists(user.getUsername());
		if(!exists) {
			User u1 = userDAO.registerUser(user);
			request.getSession().setAttribute("user", u1);
			return Response.status(200).build();
		}else {
			
			return Response.status(400).entity("User with that username already exists.").build();
		}
	}
	
	@Path("/login")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public User login(User user, @Context HttpServletRequest request) {
		
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		User u = userDAO.findUser(user.getUsername(),user.getPassword());
		if(u != null) {
			request.getSession().setAttribute("user", u);
		}
		return u; 
		
	}
	
	@Path("/currentUser")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public User currentUser(@Context HttpServletRequest request) {
		
		User user = (User) request.getSession().getAttribute("user");
		return user;
	}
	
	@Path("/getUser/{username}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public User findUser(@PathParam("username") String username) {
		
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		return userDAO.getUsers().get(username);
	}
	
	@Path("/logout")
	@POST
	public void logout(@Context HttpServletRequest request) {
		
		request.getSession().invalidate();
	}
	
	@Path("/receivedMessages/{username}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Message> getMessages(@PathParam("username") String username){
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		User user = userDAO.getUsers().get(username);
		ArrayList<Message> usersMessages = new ArrayList<Message>();
		for(int i=0;i<user.getReceivedMessages().size();i++) {
			usersMessages.add(messageDAO.getMessages().get(user.getReceivedMessages().get(i)));
		}
		return usersMessages;
		
	}
	
	
	@Path("/changeType/{username}/{type}")
	@PUT
	public Response changeType(@PathParam("username") String username,@PathParam("type") String type,@Context HttpServletRequest request) {
		User currentUser = (User) request.getSession().getAttribute("user");
		if(currentUser.getRole().equals("Administrator")) {
			UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
			AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
			MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
			userDAO.changeType(username,type,currentUser,adDAO,messageDAO); 
				return Response.status(200).build();
			}else {
				return Response.status(400).entity("You are not allowed to do this operation.").build();
			}		
	}
	
	@Path("/getSeller/{id}") //returns the user who has published the ad with that id
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public User getSeller(@PathParam("id") String id) {
		
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		for(User user: userDAO.getUsers().values()) {
			if(user.getRole().equals("Seller")) {
				if(user.getPostedAds().contains(id)) {
					return user;
				}
			}
		}
		return null;
	}
	
	@Path("/likeSeller/{username}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public User likeSeller(@PathParam("username") String seller, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		return userDAO.likeSeller(currentUser,seller);
	}
	
	@Path("/dislikeSeller/{username}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public User dislikeSeller(@PathParam("username") String seller, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		return userDAO.dislikeSeller(currentUser,seller);
	}
	
	@Path("/reportAd/{deliveredAdID}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public DeliveredAd reportAd(@PathParam("deliveredAdID") int deliveredAdID, @Context HttpServletRequest request) {
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		return userDAO.reportAd(deliveredAdID,currentUser,userDAO,messageDAO,adDAO);
	}
	
	@Path("/reportSeller/{deliveredAdID}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public DeliveredAd reportSeller(@PathParam("deliveredAdID") int deliveredAdID, @Context HttpServletRequest request) {
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		return userDAO.reportSeller(deliveredAdID,currentUser,userDAO,messageDAO,adDAO);
	}
	
	@Path("/removeBan/{username}")
	@PUT
	public Response removeBan(@PathParam("username") String username, @Context HttpServletRequest request) {
		User currentUser = (User) request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		if(currentUser.getRole().equals("Administrator")) {
			userDAO.getUsers().get(username).setNumberOfBans(0);
			userDAO.saveUsers();
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
					
		}
	}
	
	
	
	
	
	

}
