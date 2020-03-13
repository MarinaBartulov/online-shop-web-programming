package services;

import java.util.ArrayList;
import java.util.Collection;

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

import beans.Review;
import beans.User;
import dao.AdDAO;
import dao.MessageDAO;
import dao.ReviewDAO;
import dao.UserDAO;

@Path("/reviewService")
public class ReviewService {
	
		
		@Context
		ServletContext ctx;
		
		@PostConstruct
		public void init() {
			if(ctx.getAttribute("reviewDAO") == null) {
				String contextPath = ctx.getRealPath("");
				ctx.setAttribute("reviewDAO", new ReviewDAO(contextPath));
			}
			if(ctx.getAttribute("messageDAO") == null) {
				String contextPath = ctx.getRealPath("");
				ctx.setAttribute("messageDAO", new MessageDAO(contextPath));
			}
		}
		
		@Path("/reviews")
		@GET
		@Produces(MediaType.APPLICATION_JSON)
		public Collection<Review> getReviews(){
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			return reviewDAO.getAllReviews();
		}
		
		@Path("/findReview/{id}")
		@GET
		@Produces(MediaType.APPLICATION_JSON)
		public Review findReview(@PathParam("id") int id) {
			
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			return reviewDAO.getReviews().get(id);
		}
		
		
		@Path("/deleteReviews/{adID}")
		@DELETE
		public Response deleteReviews(@PathParam("adID") String adID, ArrayList<Integer> idReviews, @Context HttpServletRequest request) {
			
			User currentUser = (User) request.getSession().getAttribute("user");
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			if(currentUser.getRole().equals("Administrator")) {
			    reviewDAO.deleteReviews(idReviews,adID);
			    return Response.status(200).build();
			}else {
				return Response.status(400).entity("You are not allowed to do this operation.").build();
			}    
		}
		
		@Path("/deleteReview/{id}")
		@DELETE
		public Response deleteReview(@PathParam("id") int id) {
			
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			reviewDAO.getReviews().get(id).setDeleted(true);
			reviewDAO.saveReviews();
			return Response.status(200).build();
		}
		
		
		@Path("/addReviewAd/{deliveredAdID}/{adID}")
		@POST
		@Consumes(MediaType.APPLICATION_JSON)
		@Produces(MediaType.APPLICATION_JSON)
		public Review addReviewAd(Review review, @PathParam("deliveredAdID") int deliveredAdID, @PathParam("adID") String adID,  @Context HttpServletRequest request) {
			
			User currentUser = (User) request.getSession().getAttribute("user");
			AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
			MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
			   
				   return reviewDAO.addReviewAd(currentUser, deliveredAdID, adID, review, adDAO,userDAO,messageDAO);
				   
			   
			   
		}
		
		@Path("/editReview/{id}")
		@PUT
		@Produces(MediaType.APPLICATION_JSON)
		@Consumes(MediaType.APPLICATION_JSON)
		public Review editReview(Review review,@PathParam("id") int id,@Context HttpServletRequest request) {
			
			User currentUser = (User) request.getSession().getAttribute("user");
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
			MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
			AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
			
			return reviewDAO.editReview(review,id,userDAO,currentUser,messageDAO,adDAO);
			
		}
		
		
		@Path("/addReviewSeller/{deliveredAdID}/{adID}/{seller}")
		@POST
		@Consumes(MediaType.APPLICATION_JSON)
		@Produces(MediaType.APPLICATION_JSON)
		public Review addReviewSeller(Review review, @PathParam("deliveredAdID") int deliveredAdID,@PathParam("adID") String adID,@PathParam("seller") String seller, @Context HttpServletRequest request) {
			User currentUser = (User) request.getSession().getAttribute("user");
			AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
			ReviewDAO reviewDAO = (ReviewDAO) ctx.getAttribute("reviewDAO");
			UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
			MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
			  
				   return reviewDAO.addReviewSeller(currentUser, deliveredAdID, adID, seller, review, adDAO,userDAO,messageDAO);
		}
		
		
		

	}


