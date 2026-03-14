package com.railway.concessionsystem.service;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public void sendOtpEmail(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        if (fromAddress != null && !fromAddress.isBlank()) {
            message.setFrom(fromAddress);
        }
        message.setSubject("Railway Concession OTP Verification");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");

        mailSender.send(message);

    }

    public void sendConcessionIssuedEmail(String toEmail,
                                      String certificateNo,
                                      LocalDate validUntil) {

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("Railway Concession Issued");
    message.setText(
        "Your railway concession has been issued.\n\n" +
        "Certificate No: " + certificateNo + "\n" +
        "Valid Until: " + validUntil + "\n\n" +
        "Thank you."
    );

    mailSender.send(message);
}
    public void sendGenericEmail(String to, String subject, String body) {

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(to);
    if (fromAddress != null && !fromAddress.isBlank()) {
        message.setFrom(fromAddress);
    }
    message.setSubject(subject);
    message.setText(body);

    mailSender.send(message);
}
}
