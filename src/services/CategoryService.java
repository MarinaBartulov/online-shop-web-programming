package services;

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

import beans.Category;
import beans.User;
import dao.AdDAO;
import dao.CategoryDAO;
import dao.MessageDAO;
import dao.UserDAO;

@Path("/categoryService")
public class CategoryService {
	
	@Context
	ServletContext ctx;
	
	@PostConstruct
	public void init() {
		if(ctx.getAttribute("categoryDAO") == null) {
			String contextPath = ctx.getRealPath("");
			ctx.setAttribute("categoryDAO", new CategoryDAO(contextPath));
		}
	}
	
	@Path("/categories")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Collection<Category> getCategories(){
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		return categoryDAO.findAllCategories();
	}
	
	@Path("/addCategory")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response addCategory(Category category) {
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		if(categoryDAO.addCategory(category)) {
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("Category with that name already exists. Please enter a different one.").build();
		}
	}
	
	
	@Path("/deleteCategory/{id}")
	@DELETE
	public Response deleteCategory(@PathParam("id") int id, @Context HttpServletRequest request){
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		AdDAO adDAO = (AdDAO) ctx.getAttribute("adDAO");
		UserDAO userDAO = (UserDAO) ctx.getAttribute("userDAO");
		MessageDAO messageDAO = (MessageDAO) ctx.getAttribute("messageDAO");
		User currentUser = (User) request.getSession().getAttribute("user");
		if(currentUser.getRole().equals("Administrator")) {
		    categoryDAO.deleteCategory(id,userDAO,messageDAO,adDAO,currentUser);
		    return Response.status(200).build();
		}else {
			return Response.status(400).entity("You are not allowed to do this operation.").build();
		}
	}
	
	@Path("/editCategory/{id}")
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	public Response editCategory(@PathParam("id") int id, Category category) {
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		if(categoryDAO.editCategory(id,category)) {
			return Response.status(200).build();
		}else {
			return Response.status(400).entity("Category with that name already exists. Please choose another one.").build();
		}
	}
	
	@Path("/whichCategory/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Category whichCategory(@PathParam("id") String id) {
		
		CategoryDAO categoryDAO = (CategoryDAO) ctx.getAttribute("categoryDAO");
		return categoryDAO.whichCategory(id);
	}
	
	

}
