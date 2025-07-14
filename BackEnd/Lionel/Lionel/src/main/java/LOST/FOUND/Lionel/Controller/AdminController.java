package LOST.FOUND.Lionel.Controller;

import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> saveAdmin(@RequestBody Admin admin) {
        String result = adminService.saveAdmin(admin);
        if (result.equals("Admin saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }

    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        if (admins.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(admins, HttpStatus.OK);
    }

    
    @GetMapping("/getByEmail/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Admin> getAdminByEmail(@PathVariable String email) {
        Admin admin = adminService.getAdminByEmail(email);
        if (admin == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(admin, HttpStatus.OK);
    }

    
    @PutMapping("/update/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateAdmin(@PathVariable Long adminId, @RequestBody Admin updatedAdmin) {
        String result = adminService.updateAdmin(adminId, updatedAdmin);
        if (result.equals("Admin updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    
    @DeleteMapping("/delete/{adminId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long adminId) {
        String result = adminService.deleteAdmin(adminId);
        if (result.equals("Admin deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
}
