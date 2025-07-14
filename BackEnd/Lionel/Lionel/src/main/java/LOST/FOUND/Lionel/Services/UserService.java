package LOST.FOUND.Lionel.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import LOST.FOUND.Lionel.Model.Role;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String saveUser(User user) {

        User checkUser = userRepository.findByEmail(user.getEmail());
        if (checkUser != null) {
            return "User already exists";
        } else {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getRole() == null) {
                user.setRole(Role.USER);
            }
            userRepository.save(user);
            return "User saved successfully";
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public String updateUser(Long userId, User updatedUser) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setName(updatedUser.getName());
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            userRepository.save(existingUser);
            return "User updated successfully";
        } else {
            return "User not found";
        }
    }

    public String deleteUser(Long userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return "User deleted successfully";
        } else {
            return "User not found";
        }
    }

}