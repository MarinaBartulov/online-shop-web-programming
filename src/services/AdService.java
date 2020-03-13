package services;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

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
import beans.Category;
import beans.User;
import dao.AdDAO;
import dao.CategoryDAO;
import dao.MessageDAO;
import dao.UserDAO;


@Path("adService")
public class AdService {
	
	@Context
	ServletContext ctx;
	
	@PostConstruct
	public void init() {
		if(ctx.getAttribute("adDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("adDAO", new AdDAO(contextPath));
		}
		if(ctx.getAttribute("messageDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("messageDAO", new MessageDAO(contextPath));
		}
		
	}
	
	@Path("/ads")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Ad> getAds(){
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		return adDAO.getAllAds();
	}
	
	@Path("/ad/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Ad getAd(@PathParam("id") String id) {
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		return adDAO.getAds().get(id);
	}
	
	@Path("/popularAds")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Ad> getPopularAds(){
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		List<Ad> popular = new ArrayList<Ad>();
		if(!adDAO.getAllAds().isEmpty()) {
		   for(Ad ad : adDAO.getAllAds()) {
			  if(!ad.isDeleted() && !ad.getStatus().equals("In realization") && ad.isActive() == true) { //if it's neither removed, nor inactive nor has the status "In realization" then it goes in the comparing for the most popular ads
			      popular.add(ad);
			  }
		   }
		   Collections.sort(popular, new ComparatorAd());
		}
		   
		   if(popular.size()>10) {
			   popular = popular.subList(0,10);
		   }
		   return popular;
		}
	
	
	@Path("/deliverAd/{id}")
	@PUT
	public Response deliverAd(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User user = (User)request.getSession().getAttribute("user");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		
		if(user == null) {
			return Response.status(400).entity("There are no logged in users.").build();
		}else {
			if(adDAO.deliverAd(user,id,userDAO,messageDAO)) {
				return Response.status(200).build();
			}else {
				return Response.status(400).entity("Some error occured while delivering the product.").build();
			}
		}
		
	}
	
	@Path("/likeAd/{id}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public Ad likeAd(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		
			return adDAO.likeAd(currentUser,id);
	
	}
	
	@Path("/dislikeAd/{id}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public Ad dislikeAd(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		
			return adDAO.dislikeAd(currentUser,id);
			
	}
	
	@Path("/removeAdFromFavourite/{id}")
	@DELETE
    public Response removeAdFromFavourite(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		if(currentUser.getRole().equals("Customer")) {
			adDAO.removeAdFromFavourite(currentUser, id,userDAO);
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
	}
	
	
	@Path("/orderAd/{id}")
	@POST
	public Response orderAd(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		if(currentUser.getRole().equals("Customer")) {
			adDAO.orderAd(currentUser,id,userDAO);
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
	}
	
	@Path("/addInFavourite/{id}")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public boolean addToFavourite(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		return adDAO.addToFavourite(currentUser,id,userDAO);
	}
	
	@Path("/deleteAdAdmin/{id}")
	@DELETE
	public Response deleteAd(@PathParam("id") String id, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		
		if(currentUser.getRole().equals("Administrator")) {
			adDAO.deleteAdAdmin(currentUser,id,userDAO,messageDAO);
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
		
	}
	
	@Path("/editAdAdmin/{adID}/{categoryID}/{numOfReviewsForDelete}")
	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editAdAdmin(@PathParam("adID") String adID, @PathParam("categoryID") int categoryID, @PathParam("numOfReviewsForDelete") int numOfReviews, Ad ad, @Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		if(currentUser.getRole().equals("Administrator")) {
			adDAO.editAdAdmin(adID,categoryID,ad,currentUser,userDAO,messageDAO,categoryDAO,numOfReviews);
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
		
	}
	
	@Path("/deleteAdSeller/{id}")
	@DELETE
	public Response deleteAdSeller(@PathParam("id") String id,@Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		
		if(currentUser.getRole().equals("Seller")) {
			adDAO.deleteAdSeller(currentUser,id,userDAO,messageDAO);
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
		
	}
	
	@Path("/editAdSeller/{id}/{categoryID}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	public Ad editAdSeller(@PathParam("id") String adID,@PathParam("categoryID") int catID,Ad ad) {
		
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		return adDAO.editAdSeller(adID,catID,ad,categoryDAO);
	}
	
	@Path("/createNewAd/{catID}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createNewAd(@PathParam("catID") int catID,Ad ad,@Context HttpServletRequest request) {
		
		User currentUser = (User) request.getSession().getAttribute("user");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		boolean valid = adDAO.createNewAd(catID,ad,currentUser,categoryDAO,userDAO);
		if(valid) {
		  return Response.status(200).build();
		}else {
			return Response.status(400).entity("Please enter a valid expiry date.").build();
		}
	}
	
	@Path("/getSortedAds")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Ad> getSortedAds(){
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		ArrayList<Ad> sortedAds = new ArrayList<Ad>();
		for(Category cat : categoryDAO.getCategories().values()) {
			for(int i=0;i<cat.getAds().size();i++) {
				sortedAds.add(adDAO.getAds().get(cat.getAds().get(i)));
			}
		}
		
		return sortedAds;
	}
	
	
}



class ComparatorAd implements Comparator<Ad> {

	@Override
	public int compare(Ad ad1, Ad ad2) {
		return ad2.getInFavouriteList() - ad1.getInFavouriteList();
	}	
}
