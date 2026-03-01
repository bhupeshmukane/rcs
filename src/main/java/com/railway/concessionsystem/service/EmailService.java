package com.railway.concessionsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Railway Concession OTP Verification");
        message.setText("Your OTP is: " + otp + "\nValid for 5 minutes.");

        mailSender.send(message);

    }
    public void sendGenericEmail(String to, String subject, String body) {

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);

    mailSender.send(message);
}
}