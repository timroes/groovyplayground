package de.timroes.groovyplayground;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Tim Roes - mail@timroes.de
 */
@Singleton
@Path("/script")
public class ScriptApi {
	
	private final GroovyExecutor groovy = new GroovyExecutor();
	
	@POST
	@Consumes({ MediaType.APPLICATION_JSON })
	@Produces({ MediaType.APPLICATION_JSON })
	public ExecutionResult execute(@Context HttpServletRequest httpRequest, ExecutionRequest request) {	
		return groovy.execute(request, httpRequest.getRemoteAddr());
	}
	
}
