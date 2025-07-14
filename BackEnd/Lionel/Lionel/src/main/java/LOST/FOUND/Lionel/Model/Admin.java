package LOST.FOUND.Lionel.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admins")
public class Admin {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name; 

    @Column(name = "email", unique = true, nullable = false, length = 150)
    private String email; 

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber; 

    @Column(name = "password", nullable = false, length = 255)
    private String password; 

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "two_fa_enabled")
    private boolean twoFaEnabled = true; 

    @Column(name = "otp")
    private String otp; 

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry; 

    @Column(name = "reset_token")
    private String resetToken; 

    @Column(name = "reset_token_expiry")
    private Long resetTokenExpiry; 

    

    public boolean isTwoFaEnabled() {
        return twoFaEnabled;
    }

    public void setTwoFaEnabled(boolean twoFaEnabled) {
        this.twoFaEnabled = twoFaEnabled;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(LocalDateTime otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public Long getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(Long resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Admin(Long id, String name, String email, String phoneNumber, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        
    }

    public Admin(boolean twoFaEnabled, String otp, LocalDateTime otpExpiry, String resetToken, Long resetTokenExpiry) {
        this.twoFaEnabled = twoFaEnabled;
        this.otp = otp;
        this.otpExpiry = otpExpiry;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
    }

    public Admin() {
    }



}
