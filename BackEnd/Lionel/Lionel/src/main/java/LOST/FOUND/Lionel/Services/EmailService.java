


package LOST.FOUND.Lionel.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        String body = "Your OTP is: " + otp + "\nIt will expire in 5 minutes.";
        sendEmail(to, "Your OTP Code", body);
    }

    public void sendResetLink(String to, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String body = "Click below to reset your password:\n" + resetUrl;
        sendEmail(to, "Password Reset Link", body);
    }
    
    public void sendClaimStatusNotification(String to, String userName, String itemName, String status) {
        String subject = "Update on Your Claim Request";
        String body = "Dear " + userName + ",\n\n" +
                      "Your claim request for the item '" + itemName + "' has been " + status + ".\n\n" +
                      (status.equals("APPROVED") ? 
                        "Please contact the administrator to arrange for item collection." :
                        "If you believe this is an error, please contact the administrator for more information.") + "\n\n" +
                      "Thank you for using our Lost and Found system.\n\n" +
                      "Regards,\nThe Lost and Found Team";
        
        sendEmail(to, subject, body);
    }

  
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
