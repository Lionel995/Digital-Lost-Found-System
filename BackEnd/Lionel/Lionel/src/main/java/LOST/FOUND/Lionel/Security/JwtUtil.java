package LOST.FOUND.Lionel.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretString;

    
    private final long JWT_TOKEN_VALIDITY = 24 * 60 * 60 * 1000;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretString.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    
    public String extractRole(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            System.out.println("Error extracting role from token: " + e.getMessage());
            return null;
        }
    }

    
    public String extractAuthorities(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.get("authorities", String.class);
        } catch (Exception e) {
            System.out.println("Error extracting authorities from token: " + e.getMessage());
            return null;
        }
    }

    
    public List<String> getRoleAuthorities(String token) {
        String authorities = extractAuthorities(token);
        if (authorities != null) {
            return Arrays.asList(authorities);
        }
        
        String role = extractRole(token);
        if (role != null) {
            return Arrays.asList("ROLE_" + role.toUpperCase());
        }
        
        return Arrays.asList(); 
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    
    public String generateTokenWithRole(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("authorities", "ROLE_" + role.toUpperCase());
        
        System.out.println("Generating token for user: " + username + " with role: " + role);
        return createToken(claims, username);
    }

   
    public String generateTokenWithUserRole(String username, String name, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("authorities", "ROLE_" + role.toUpperCase());
        claims.put("name", name);
        
        System.out.println("Generating token for user: " + username + " (" + name + ") with role: " + role);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            System.out.println("JWT validation error: " + e.getMessage());
            return false;
        }
    }

    
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
