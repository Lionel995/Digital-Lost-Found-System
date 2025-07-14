package LOST.FOUND.Lionel.Security;

import java.util.List;
//import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Repository.AdminRepository;
import LOST.FOUND.Lionel.Repository.UserRepository;

@Primary  
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email);  // Direct return, no Optional
        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
        }

        Admin admin = adminRepository.findByEmail(email);  // Direct return, no Optional
        if (admin != null) {
            return new org.springframework.security.core.userdetails.User(
                admin.getEmail(), admin.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        throw new UsernameNotFoundException("User or Admin not found with email: " + email);
    }
}
