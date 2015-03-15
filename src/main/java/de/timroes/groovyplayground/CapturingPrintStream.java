package de.timroes.groovyplayground;

import com.google.common.io.ByteStreams;
import java.io.PrintStream;

/**
 *
 * @author Tim Roes - mail@timroes.de
 */
public class CapturingPrintStream extends PrintStream {
	
	private final ExecutionResult.Builder builder;

	public CapturingPrintStream(ExecutionResult.Builder builder) {
		super(ByteStreams.nullOutputStream());
		this.builder = builder;
	}
	
	@Override
	public void print(Object o) {
		print(String.valueOf(o));
	}
	
	@Override
	public void print(int i) {
		print(String.valueOf(i));
	}

	@Override
	public void print(char[] chars) {
		print(String.valueOf(chars));
	}

	@Override
	public void print(double d) {
		print(String.valueOf(d));
	}

	@Override
	public void print(float f) {
		print(String.valueOf(f));
	}

	@Override
	public void print(long l) {
		print(String.valueOf(l));
	}

	@Override
	public void print(char c) {
		print(String.valueOf(c));
	}

	@Override
	public void print(boolean bln) {
		print(String.valueOf(bln));
	}

	@Override
	public void print(String string) {
		builder.addOutput(string, GroovyExecutor.causingLineInStacktrace(Thread.currentThread().getStackTrace()), false);
	}

	@Override
	public void println(Object o) {
		println(String.valueOf(o));
	}

	@Override
	public void println(char[] chars) {
		println(String.valueOf(chars));
	}

	@Override
	public void println(double d) {
		println(String.valueOf(d));
	}

	@Override
	public void println(float f) {
		println(String.valueOf(f));
	}

	@Override
	public void println(long l) {
		println(String.valueOf(l));
	}

	@Override
	public void println(char c) {
		println(String.valueOf(c));
	}

	@Override
	public void println(boolean bln) {
		println(String.valueOf(bln));
	}

	@Override
	public void println() {
		println("");
	}

	@Override
	public void println(int i) {
		println(String.valueOf(i));
	}

	@Override
	public void println(String string) {
		builder.addOutput(string, GroovyExecutor.causingLineInStacktrace(Thread.currentThread().getStackTrace()), true);
	}
				
}
