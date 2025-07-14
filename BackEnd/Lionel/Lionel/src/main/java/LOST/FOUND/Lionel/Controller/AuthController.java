package LOST.FOUND.Lionel.Controller;

import LOST.FOUND.Lionel.Model.*;
import LOST.FOUND.Lionel.Repository.*;
import LOST.FOUND.Lionel.Security.JwtUtil;
import LOST.FOUND.Lionel.Services.EmailService;
import LOST.FOUND.Lionel.Services.PasswordResetService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

//@CrossOrigin("*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private EmailService emailService;
    @Autowired private PasswordResetService resetService;

    @PostMapping("/verify-credentials")
    public ResponseEntity<?> verifyCredentials(@RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            String email = authentication.getName();

            User user = userRepository.findByEmail(email);
            Admin admin = null;

            if (user == null) {
                admin = adminRepository.findByEmail(email);
                if (admin == null) {
                    return ResponseEntity.badRequest().body("User or Admin not found");
                }
            }

            // Handle OTP for User
            if (user != null) {
                String otp = generateOtp();
                user.setOtp(otp);
                user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
                userRepository.save(user);

                emailService.sendOtpEmail(email, otp);
                return ResponseEntity.ok("OTP sent to email");
            }

            // Handle OTP for Admin
            if (admin != null) {
                String otp = generateOtp();
                admin.setOtp(otp);
                admin.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
                adminRepository.save(admin);

                emailService.sendOtpEmail(email, otp);
                return ResponseEntity.ok("OTP sent to email");
            }

            return ResponseEntity.badRequest().body("User or Admin not found");

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(403).body("Invalid credentials or user not authorized");
        }
    }

    @PostMapping("/confirm-otp")
    public ResponseEntity<?> confirmOtp(@RequestBody OtpDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail());
        Admin admin = null;

        if (user == null) {
            admin = adminRepository.findByEmail(dto.getEmail());
            if (admin == null || admin.getOtp() == null) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
        }

        
        if (user != null) {
            if (!user.getOtp().equals(dto.getOtp()) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("OTP expired or invalid");
            }

            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);

            
            String token = jwtUtil.generateTokenWithUserRole(user.getEmail(), user.getName(), user.getRole().name());
            
            System.out.println("Generated token for user: " + user.getEmail() + " with role: " + user.getRole().name());
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole().name().toLowerCase()
            ));
        }

        
        if (admin != null) {
            if (!admin.getOtp().equals(dto.getOtp()) || admin.getOtpExpiry().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("OTP expired or invalid");
            }

            admin.setOtp(null);
            admin.setOtpExpiry(null);
            adminRepository.save(admin);

            
            String token = jwtUtil.generateTokenWithUserRole(admin.getEmail(), admin.getName(), admin.getRole().name());
            
            System.out.println("Generated token for admin: " + admin.getEmail() + " with role: " + admin.getRole().name());
            
            return ResponseEntity.ok(Map.of(
                "token", token,
                "email", admin.getEmail(),
                "name", admin.getName(),
                "role", admin.getRole().name().toLowerCase()
            ));
        }

        return ResponseEntity.badRequest().body("Invalid OTP");
    }

    @PostMapping("/request-reset")
    public ResponseEntity<?> requestReset(@RequestBody EmailDTO request) {
        
        return ResponseEntity.ok(resetService.createPasswordResetToken(request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        return ResponseEntity.ok(resetService.resetPassword(token, newPassword));
    }

    
    @PostMapping("/login-direct")
    public ResponseEntity<?> loginDirect(@RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            String email = authentication.getName();

            // Check if it's a user
            User user = userRepository.findByEmail(email);
            if (user != null) {
                String token = jwtUtil.generateTokenWithUserRole(user.getEmail(), user.getName(), user.getRole().name());
                
                System.out.println("Direct login - Generated token for user: " + user.getEmail() + " with role: " + user.getRole().name());
                
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "role", user.getRole().name().toLowerCase()
                ));
            }

            
            Admin admin = adminRepository.findByEmail(email);
            if (admin != null) {
                String token = jwtUtil.generateTokenWithUserRole(admin.getEmail(), admin.getName(), admin.getRole().name());
                
                System.out.println("Direct login - Generated token for admin: " + admin.getEmail() + " with role: " + admin.getRole().name());
                
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "email", admin.getEmail(),
                    "name", admin.getName(),
                    "role", admin.getRole().name().toLowerCase()
                ));
            }

            return ResponseEntity.badRequest().body("User or Admin not found");

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(403).body("Invalid credentials: " + ex.getMessage());
        }
    }

    
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null) {
                return ResponseEntity.badRequest().body("Token is required");
            }

            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                String authorities = jwtUtil.extractAuthorities(token);

                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", username != null ? username : "null",
                    "role", role != null ? role : "null",
                    "authorities", authorities != null ? authorities : "null"
                ));
            } else {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Token is invalid or expired"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error validating token: " + e.getMessage());
        }
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
