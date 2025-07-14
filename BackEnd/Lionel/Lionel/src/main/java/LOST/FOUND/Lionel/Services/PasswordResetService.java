package LOST.FOUND.Lionel.Services;

import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private EmailService emailService;

    @Autowired 
    private PasswordEncoder passwordEncoder;

    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) return "User not found";

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendResetLink(email, token);
        return "Reset link sent";
    }

    public String resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findAll().stream()
            .filter(u -> token.equals(u.getResetToken()) && u.getResetTokenExpiry().isAfter(LocalDateTime.now()))
            .findFirst();

        if (userOpt.isEmpty()) return "Invalid or expired token";

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

       
        testPassword(user, newPassword);

        return "Password reset successful";
    }


    public void testPassword(User user, String rawPassword) {
        boolean matches = passwordEncoder.matches(rawPassword, user.getPassword());
        System.out.println("Password matches? " + matches);
    }
}
