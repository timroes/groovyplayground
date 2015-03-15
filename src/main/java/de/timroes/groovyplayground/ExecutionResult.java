package de.timroes.groovyplayground;

import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author Tim Roes - mail@timroes.de
 */
public class ExecutionResult {
	
	private final long executionTime;
	private final Object returnValue;
	private final String returnType;
	private final List<Output> output;
	
	private ExecutionResult(Builder builder) {
		this.executionTime = builder.executionTime;
		this.returnValue = builder.returnValue;
		this.returnType = builder.returnType;
		this.output = builder.output;
	}

	public long getExecutionTime() {
		return executionTime;
	}

	public String getReturnValue() {
		return returnValue == null ? null : String.valueOf(returnValue);
	}

	public String getReturnType() {
		return returnType;
	}
	
	public static Builder create() {
		return new Builder();
	}

	public List<Output> getOutput() {
		return output;
	}
	
	public static class Builder {
		
		private long executionTime;
		private String returnType;
		private Object returnValue;
		private final List<Output> output = new LinkedList<>();
		
		public Builder addCompilationException(String message, int line) {
			output.add(new Output(OutputType.COMPILATION_ERROR, message, line, true));
			return this;
		}

		public Builder addException(String message, int line) {
			output.add(new Output(OutputType.EXCEPTION, message, line, true));
			return this;
		}
		
		public Builder addOutput(String message, int line, boolean lineBreak) {
			output.add(new Output(OutputType.PRINT, message, line, lineBreak));
			return this;
		}
		
		public Builder executionTime(long time) {
			executionTime = time;
			return this;
		}
		
		public Builder scriptReturn(Object result) {
			this.returnValue = result;
			this.returnType = result == null ? null : result.getClass().getName();
			return this;
		}
		
		public ExecutionResult build() {
			return new ExecutionResult(this);
		}
		
	}
	
	public static class Output {
		
		private final OutputType type;
		private final String message;
		private final int line;
		private final boolean lineBreak;

		private Output(OutputType type, String message, int line, boolean lineBreak) {
			this.type = type;
			this.message = message;
			this.line = line;
			this.lineBreak = lineBreak;
		}

		public OutputType getType() {
			return type;
		}

		public String getMessage() {
			return message;
		}

		public int getLine() {
			return line;
		}

		public boolean isLineBreak() {
			return lineBreak;
		}
		
	}
	
	public enum OutputType {
		COMPILATION_ERROR, EXCEPTION, PRINT
	}

}
