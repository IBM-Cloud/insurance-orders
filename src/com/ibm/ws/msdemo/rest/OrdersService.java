package com.ibm.ws.msdemo.rest;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.persistence.EntityManager;
import javax.transaction.UserTransaction;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import com.ibm.json.java.JSONObject;
import com.ibm.ws.msdemo.rest.pojo.Order;

/**
 * This class handles post or get requests from UI application
 * and publishes order information to the Shipping application.
 *
 */
//Mapped to /orders via web.xml
@Path("/orders")
public class OrdersService {
	
	private UserTransaction utx;
	private EntityManager em;
	
	private static final String MQLIGHT_SERVICE_NAME = "mqLightService";
    
    /** The topic on which the Orders app publishes data as needed */
    private static final String PUBLISH_TOPIC = "mqlight/orders/request";
    
    /** The topic to which any other endpoints subscrite to as needed, to get information*/
    private static final String SUBSCRIBE_TOPIC = "mqlight/orders/reply";
    
    /** The name of durable subscription */
    private static final String SUBSCRIPTION_NAME = "mqlight.order.subscription";
    
    /** Connection factory */
    private final ConnectionFactory mqlightCF;
    
    /** Simple logging */
    private final static Logger logger = Logger.getLogger(OrdersService.class.getName());
    
    /** JVM-wide initialisation of our subscription */
    private static boolean subInitialised = false;

	public OrdersService(){
		utx = getUserTransaction();
		em = getEm();

		logger.log(Level.INFO,"Initialising...");
        try {
            InitialContext ctx = new InitialContext();
            mqlightCF = (ConnectionFactory)ctx.lookup("java:comp/env/jms/" + MQLIGHT_SERVICE_NAME);
            logger.log(Level.INFO, "Connection factory successfully created");
            ctx.close();
        }
        catch (NamingException e) {
            logger.log(Level.SEVERE, "Failed to initialise", e);
            throw new RuntimeException(e);
        }
        logger.log(Level.INFO,"Completed initialisation.");
	}

	@Context UriInfo uriInfo;
	
	 /**
     * GET all orders
     * @return Response object
     */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response get() {
			List<Order> list = em.createQuery("SELECT t FROM Order t", Order.class).getResultList();
			String json = list.toString();
			return Response.ok(json).build();
	}
	
	/**
     * GET a specific order
     * @param id
     * @return Order
     */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	public Response get(@PathParam("id") long id) {
		System.out.println("Searching for id : " + id);
		Order order = null;
		try {
			utx.begin();
			order = em.find(Order.class, id);
			utx.commit();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR).build();
		} 
		
		if (order != null) {
			return Response.ok(order.toString()).build();
		} else {
			return Response.status(javax.ws.rs.core.Response.Status.NOT_FOUND).build();
		}
	}
	
	/**
     * Create new order
     * @param order
     * @return id of created order
     */
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response create(Order order) {
		System.out.println("New order: " + order.toString());
		try {
			utx.begin();
			em.persist(order);
			utx.commit();
			//Notify Order information to the Shipping app to proceed. 
			notifyShipping(order.toString());
			return Response.status(201).entity(String.valueOf(order.getId())).build();
		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR).build();
		} finally {
			try {
				if (utx.getStatus() == javax.transaction.Status.STATUS_ACTIVE) {
					utx.rollback();
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}


	}
	
	// There are two ways of obtaining the connection information for some services in Java 
	
	// Method 1: Auto-configuration and JNDI
	// The Liberty buildpack automatically generates server.xml configuration 
	// stanzas for the SQL Database service which contain the credentials needed to 
	// connect to the service. The buildpack generates a JNDI name following  
	// the convention of "jdbc/<service_name>" where the <service_name> is the 
	// name of the bound service. 
	// Below we'll do a JNDI lookup for the EntityManager whose persistence 
	// context is defined in web.xml. It references a persistence unit defined 
	// in persistence.xml. In these XML files you'll see the "jdbc/<service name>"
	// JNDI name used.

	private EntityManager getEm() {
		InitialContext ic;
		try {
			ic = new InitialContext();
			return (EntityManager) ic.lookup("java:comp/env/openjpa-order/entitymanager");
		} catch (NamingException e) {
			e.printStackTrace();
		}
		return null;
	}

	// Method 2: Parsing VCAP_SERVICES environment variable
    // The VCAP_SERVICES environment variable contains all the credentials of 
	// services bound to this application. You can parse it to obtain the information 
	// needed to connect to the SQL Database service. SQL Database is a service
	// that the Liberty buildpack auto-configures as described above, so parsing
	// VCAP_SERVICES is not a best practice.
	
	// see HelloResource.getInformation() for an example
	
	private UserTransaction getUserTransaction() {
		InitialContext ic;
		try {
			ic = new InitialContext();
			return (UserTransaction) ic.lookup("java:comp/UserTransaction");
		} catch (NamingException e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * Sending order information to the Shipping app
	 * @param order
	 */
    private void notifyShipping(String order) {
        logger.log(Level.INFO,"Publishing order to shipping app");
        // Before connecting to the MQ to publish, need to ensure our subscription has been
        // initialised, otherwise responses might be missed.
        checkSubInitialised(mqlightCF);
        
        Connection jmsConn = null;
        try {
            // Connect to the service using the connection factory from the resource reference (inside web.xml)
            jmsConn = mqlightCF.createConnection();
            
            // Create a session.
            Session jmsSess = jmsConn.createSession(false, Session.AUTO_ACKNOWLEDGE);
            
            // Create a producer on the topic
            Destination publishDest = jmsSess.createTopic(PUBLISH_TOPIC);
            MessageProducer producer = jmsSess.createProducer(publishDest);
            
            // Set an expiry on our messages
            producer.setTimeToLive(60*60*1000 /* 1 hour */ );
            
            // Create the JSON payload
            JSONObject jsonPayload = new JSONObject();
            jsonPayload.put("order", order);
          
            // Send it
            TextMessage textMessage = jmsSess.createTextMessage(jsonPayload.serialize());
            logger.log(Level.INFO,"Publishing order " + textMessage.getText());
            producer.send(textMessage);
            
            // Cleanup
            producer.close();
            jmsSess.close();
            logger.log(Level.INFO,"Publishing order, Done");
            
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Exception sending message to MQ Light", e);
            
        } finally {
            // Ensure we cleanup our connection
            try {
                if (jmsConn != null) jmsConn.close();
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Exception closing connection to MQ Light", e);
            }
        }
    }
    
     /**
     * Check to ensure subscription has been initialised before using it.
     * @param mqlightCF
     * @return
     */
    private static synchronized void checkSubInitialised(ConnectionFactory mqlightCF) {
        if (subInitialised) return;
        Connection jmsConn = null;
        try {
            // Connect to the service using the connection factory from the resource reference (inside web.xml)
            jmsConn = mqlightCF.createConnection();
            
            // Create a session
            Session jmsSess = jmsConn.createSession(false, Session.AUTO_ACKNOWLEDGE);
            
            // Access our subscription, just to check.
            Topic notificationDest = jmsSess.createTopic(SUBSCRIBE_TOPIC);
            MessageConsumer consumer =
            jmsSess.createDurableSubscriber(notificationDest, SUBSCRIPTION_NAME);
            
            // Cleanup
            consumer.close();
            jmsSess.close();
            
            // We're done
            subInitialised = true;
            logger.log(Level.INFO, "Subscription correctly initialised");
            
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Exception initialising subscription with MQ Light", e);
            throw new RuntimeException(e);
        } finally {
            // Ensure we cleanup our connection
            try {
                if (jmsConn != null) jmsConn.close();
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Exception closing connection to MQ Light", e);
            }
        }
    }
}
