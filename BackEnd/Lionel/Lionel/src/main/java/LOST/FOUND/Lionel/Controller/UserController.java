package LOST.FOUND.Lionel.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

//import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Repository.AdminRepository;
import LOST.FOUND.Lionel.Services.UserService;

@CrossOrigin("*")
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminRepository adminRepository;

    
    @PostMapping("/save")
    public ResponseEntity<String> saveUser(@RequestBody User user) {
        String result = userService.saveUser(user);
        if (result.equals("User saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }

    
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        String email = getLoggedInEmail();
        if (isAdmin(email)) {
            return ResponseEntity.ok(userService.getAllUsers());
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only admins can view all users.");
        }
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        String email = getLoggedInEmail();

        if (isAdmin(email)) {
            Optional<User> user = userService.getUserById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        }

        User user = userService.getUserByEmail(email);
        if (user == null || !user.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only view your own profile.");
        }

        return ResponseEntity.ok(user);
    }

    
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        String requesterEmail = getLoggedInEmail();

        if (isAdmin(requesterEmail) || requesterEmail.equals(email)) {
            User user = userService.getUserByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only view your own profile.");
    }

    
    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        String email = getLoggedInEmail();

        if (isAdmin(email)) {
            return new ResponseEntity<>(userService.updateUser(id, updatedUser), HttpStatus.OK);
        }

        User user = userService.getUserByEmail(email);
        if (user == null || !user.getId().equals(id)) {
            return new ResponseEntity<>("Access Denied: You can only update your own profile.", HttpStatus.FORBIDDEN);
        }

        String result = userService.updateUser(id, updatedUser);
        if (result.equals("User updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String email = getLoggedInEmail();

        if (isAdmin(email)) {
            return new ResponseEntity<>(userService.deleteUser(id), HttpStatus.OK);
        }

        User user = userService.getUserByEmail(email);
        if (user == null || !user.getId().equals(id)) {
            return new ResponseEntity<>("Access Denied: You can only delete your own account.", HttpStatus.FORBIDDEN);
        }

        String result = userService.deleteUser(id);
        if (result.equals("User deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    
    private String getLoggedInEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    
    private boolean isAdmin(String email) {
        return adminRepository.findByEmail(email) != null;
    }
}
