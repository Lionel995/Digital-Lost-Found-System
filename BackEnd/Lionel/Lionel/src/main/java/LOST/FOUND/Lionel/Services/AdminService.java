package LOST.FOUND.Lionel.Services;

import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Model.Role;
import LOST.FOUND.Lionel.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String saveAdmin(Admin admin) {
        Admin existingAdmin = adminRepository.findByEmail(admin.getEmail());
        if (existingAdmin != null) {
            return "Admin already exists";
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        if (admin.getRole() == null) {
            admin.setRole(Role.ADMIN);
        }
        adminRepository.save(admin);
        return "Admin saved successfully";
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }

    public String updateAdmin(Long adminId, Admin updatedAdmin) {
        Optional<Admin> adminOptional = adminRepository.findById(adminId);
        if (adminOptional.isPresent()) {
            Admin existingAdmin = adminOptional.get();

            existingAdmin.setName(updatedAdmin.getName());
            existingAdmin.setPhoneNumber(updatedAdmin.getPhoneNumber());

      
            if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().isEmpty()) {
                existingAdmin.setPassword(passwordEncoder.encode(updatedAdmin.getPassword()));
            }

            adminRepository.save(existingAdmin);
            return "Admin updated successfully";
        } else {
            return "Admin not found";
        }
    }

    public String deleteAdmin(Long adminId) {
        try {
            if (adminRepository.existsById(adminId)) {
                adminRepository.deleteById(adminId);
                return "Admin deleted successfully";
            } else {
                return "Admin not found";
            }
        } catch (DataIntegrityViolationException e) {
            return "Cannot delete this admin because of associated records. Remove related data first.";
        } catch (Exception e) {
            return "Unexpected error while deleting admin: " + e.getMessage();
        }
    }
}
