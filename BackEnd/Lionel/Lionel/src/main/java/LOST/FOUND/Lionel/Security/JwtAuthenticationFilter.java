package LOST.FOUND.Lionel.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        System.out.println(" Incoming request path: " + path);

        
        if (path.equals("/auth/login") || 
            path.equals("/auth/verify-credentials") ||
            path.equals("/auth/confirm-otp") ||
            path.equals("/auth/request-reset") || 
            path.equals("/auth/reset-password") || 
            path.equals("/users/save") || 
            path.equals("/admins/create")) {
            
            System.out.println("Skipping authentication for: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (header != null && header.startsWith("Bearer ")) {
            try {
                token = header.substring(7);
                username = jwtUtil.extractUsername(token);
                System.out.println("Successfully extracted username: " + username);
            } catch (Exception e) {
                System.out.println("Error processing JWT token: " + e.getMessage());
                
            }
        } else {
            System.out.println(" No valid Authorization header found");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    
                    
                    List<String> tokenAuthorities = jwtUtil.getRoleAuthorities(token);
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    if (!tokenAuthorities.isEmpty()) {
                        
                        for (String authority : tokenAuthorities) {
                            authorities.add(new SimpleGrantedAuthority(authority));
                        }
                        System.out.println("Added authorities from token: " + tokenAuthorities);
                    } else {
                        
                        try {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                            userDetails.getAuthorities().forEach(auth -> 
                                authorities.add(new SimpleGrantedAuthority(auth.getAuthority())));
                            System.out.println(" Using UserDetails authorities: " + userDetails.getAuthorities());
                        } catch (Exception e) {
                            System.out.println("Could not load user details: " + e.getMessage());
                        }
                    }
                    
                    
                    UserDetails principal = org.springframework.security.core.userdetails.User.builder()
                            .username(username)
                            .password("")
                            .authorities(authorities)
                            .build();
                    
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(principal, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    System.out.println("Authenticated user: " + username + ", Authorities: " + authorities);
                    
                   
                    String role = jwtUtil.extractRole(token);
                    System.out.println(" User role from token: " + role);
                    
                } else {
                    System.out.println(" Invalid token for user: " + username);
                }
            } catch (Exception e) {
                System.out.println(" Error during authentication: " + e.getMessage());
                e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }
}
