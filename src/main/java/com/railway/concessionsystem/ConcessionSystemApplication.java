package com.railway.concessionsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConcessionSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConcessionSystemApplication.class, args);
	}

}
