package de.timroes.groovyplayground;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author Tim Roes - mail@timroes.de
 */
public class ExecutionRequest {
	
	private final String source;

	@JsonCreator
	public ExecutionRequest(@JsonProperty("source") String source) {
		this.source = source;
	}

	public String getSource() {
		return source;
	}

}
