package de.timroes.groovyplayground;

import com.google.apphosting.api.DeadlineExceededException;
import java.io.IOException;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
	public ExecutionResult execute(@Context HttpServletRequest httpRequest,
			@Context HttpServletResponse response, ExecutionRequest request) throws IOException {
		try {
			return groovy.execute(request, httpRequest.getRemoteAddr());
		} catch(DeadlineExceededException ex) {
			response.sendError(418, "Deadline exceeded");
			return null;
		}
	}
	
}
