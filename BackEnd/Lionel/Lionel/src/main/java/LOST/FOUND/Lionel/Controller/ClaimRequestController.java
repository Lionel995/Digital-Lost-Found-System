package LOST.FOUND.Lionel.Controller;

import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Model.ClaimRequest;
import LOST.FOUND.Lionel.Model.ClaimStatus;
import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.Role;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Services.ClaimRequestService;
import LOST.FOUND.Lionel.Services.EmailService;
import LOST.FOUND.Lionel.Repository.UserRepository;
import LOST.FOUND.Lionel.Repository.LostItemRepository;
import LOST.FOUND.Lionel.Repository.AdminRepository;
import LOST.FOUND.Lionel.Repository.FoundItemRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/claimRequests")
@CrossOrigin("*")
public class ClaimRequestController {

    @Autowired
    private ClaimRequestService claimRequestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private EmailService emailService;

    
    @PostMapping("/create")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> createClaimRequest(
            @RequestParam(required = false) Long lostItemId,
            @RequestParam(required = false) Long foundItemId,
            @RequestBody ClaimRequest claimRequest,
            Authentication authentication) {

        
        String email = authentication.getName();  
        User user = userRepository.findByEmail(email);  
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        if (lostItemId != null) {
            Optional<ClaimRequest> existingClaim = claimRequestService.findClaimRequestByUserAndLostItem(user, lostItemId);
            if (existingClaim.isPresent()) {
                return ResponseEntity.badRequest().body("User has already submitted a claim for this lost item.");
            }
        }

        if (foundItemId != null) {
            Optional<ClaimRequest> existingClaim = claimRequestService.findClaimRequestByUserAndFoundItem(user, foundItemId);
            if (existingClaim.isPresent()) {
                return ResponseEntity.badRequest().body("User has already submitted a claim for this found item.");
            }
        }

        if (lostItemId != null) {
            LostItem lostItem = lostItemRepository.findById(lostItemId).orElse(null);
            if (lostItem == null) {
                return ResponseEntity.badRequest().body("Lost item not found.");
            }
            claimRequest.setLostItem(lostItem);
        }

        if (foundItemId != null) {
            FoundItem foundItem = foundItemRepository.findById(foundItemId).orElse(null);
            if (foundItem == null) {
                return ResponseEntity.badRequest().body("Found item not found.");
            }
            claimRequest.setFoundItem(foundItem);
        }

        if (lostItemId == null && foundItemId == null) {
            return ResponseEntity.badRequest().body("Either lost item ID or found item ID must be provided.");
        }

        
        if (claimRequest.getContactInformation() == null || claimRequest.getContactInformation().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Contact information is required.");
        }

        claimRequest.setUser(user);
        claimRequest.setStatus(ClaimStatus.PENDING);

        ClaimRequest savedClaim = claimRequestService.createClaimRequest(claimRequest);

        return ResponseEntity.status(201).body("Claim request successfully submitted with ID: " + savedClaim.getId());
    }

    
    @GetMapping("/getClaimById/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getClaimRequestById(@PathVariable Long id, Authentication authentication) {
        Optional<ClaimRequest> claimRequest = claimRequestService.getClaimRequestById(id);
        if (!claimRequest.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        String email = authentication.getName();  
        User loggedInUser = userRepository.findByEmail(email);  
        Admin admin = adminRepository.findByEmail(email);

        
        if (loggedInUser != null && !claimRequest.get().getUser().equals(loggedInUser) && admin == null) {
            return ResponseEntity.status(403).body("Access Denied: You can only view your own claim requests.");
        }

        return ResponseEntity.ok(claimRequest.get());
    }

    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllClaimRequests(Authentication authentication) {
        String email = authentication.getName();
        System.out.println("🔍 Attempting to get all claims for email: " + email);
        
        
        Admin admin = adminRepository.findByEmail(email);
        if (admin != null) {
            System.out.println("✅ Admin found: " + admin.getName() + " with role: " + admin.getRole());
            return ResponseEntity.ok(claimRequestService.getAllClaimRequests());
        }
        
        
        User user = userRepository.findByEmail(email);
        if (user != null && user.getRole() == Role.ADMIN) {
            System.out.println("✅ User with admin role found: " + user.getName());
            return ResponseEntity.ok(claimRequestService.getAllClaimRequests());
        }
        
        System.out.println("❌ Access denied - not an admin");
        return ResponseEntity.status(403).body("Access Denied: Only admins can view all claim requests.");
    }

    
    @PutMapping("/ClaimVerification/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateClaimStatus(
            @PathVariable Long id,
            @RequestParam ClaimStatus status,
            Authentication authentication) {

        String email = authentication.getName();
        
        
        Admin admin = adminRepository.findByEmail(email);
        if (admin == null) {
            
            User user = userRepository.findByEmail(email);
            if (user == null || user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body("Access Denied: Only admins can update claim status.");
            }
            
            return ResponseEntity.status(403).body("Access Denied: Admin entity required for status update.");
        }

        ResponseEntity<String> response = claimRequestService.updateClaimStatus(id, status, admin.getId());
        
        
        if (response.getStatusCode().is2xxSuccessful()) {
            Optional<ClaimRequest> claimRequest = claimRequestService.getClaimRequestById(id);
            if (claimRequest.isPresent()) {
                User user = claimRequest.get().getUser();
                String itemName = "";
                
                if (claimRequest.get().getLostItem() != null) {
                    itemName = claimRequest.get().getLostItem().getItemName();
                } else if (claimRequest.get().getFoundItem() != null) {
                    itemName = claimRequest.get().getFoundItem().getItemName();
                }
                
                try {
                    emailService.sendClaimStatusNotification(
                        user.getEmail(), 
                        user.getName(), 
                        itemName, 
                        status.toString()
                    );
                } catch (Exception e) {
                    
                    System.err.println("Failed to send email notification: " + e.getMessage());
                }
            }
        }
        
        return response;
    }

    
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteClaimRequest(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();  
        User user = userRepository.findByEmail(email);  
        Admin admin = adminRepository.findByEmail(email);

        if (user != null) {
            return claimRequestService.deleteClaimRequest(id, user.getId());
        } else if (admin != null) {
            
            Optional<ClaimRequest> claimRequest = claimRequestService.getClaimRequestById(id);
            if (!claimRequest.isPresent()) {
                return ResponseEntity.status(404).body("Claim request not found.");
            }
            
            claimRequestService.deleteClaimRequestById(id);
            return ResponseEntity.ok("Claim request deleted successfully by admin.");
        }

        return ResponseEntity.status(403).body("Access Denied: Only the user who created the claim or an admin can delete it.");
    }

    
    @PutMapping("/rollback/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rollbackClaimDecision(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();  
        Admin admin = adminRepository.findByEmail(email);  
        if (admin == null) {
            return ResponseEntity.status(403).body("Access Denied: Only admins can rollback claim decisions.");
        }

        try {
            ClaimRequest updatedClaim = claimRequestService.rollbackClaimDecision(id, admin.getId());
            
            
            User user = updatedClaim.getUser();
            String itemName = "";
            
            if (updatedClaim.getLostItem() != null) {
                itemName = updatedClaim.getLostItem().getItemName();
            } else if (updatedClaim.getFoundItem() != null) {
                itemName = updatedClaim.getFoundItem().getItemName();
            }
            
            String subject = "Your Claim Request Status Has Changed";
            String body = "Dear " + user.getName() + ",\n\n" +
                          "The status of your claim request for the item '" + itemName + "' has been reset to PENDING.\n\n" +
                          "An administrator will review your claim again.\n\n" +
                          "Thank you for your patience.\n\n" +
                          "Regards,\nThe Lost and Found Team";
            
            try {
                
                emailService.sendEmail(user.getEmail(), subject, body);
            } catch (Exception e) {
                
                System.err.println("Failed to send email notification: " + e.getMessage());
            }
            
            return ResponseEntity.ok("Claim decision has been rolled back to PENDING.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    @GetMapping("/claimsByStatus")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getClaimsByStatus(@RequestParam ClaimStatus status, Authentication authentication) {
        String email = authentication.getName();  
        
        
        Admin admin = adminRepository.findByEmail(email);
        User user = userRepository.findByEmail(email);
        
        if (admin == null && (user == null || user.getRole() != Role.ADMIN)) {
            return ResponseEntity.status(403).body("Access Denied: Only admins can view claim requests by status.");
        }

        return ResponseEntity.ok(claimRequestService.getClaimsByStatus(status));
    }
    
    
    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyClaimRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        
        return ResponseEntity.ok(claimRequestService.getClaimsByUser(user.getId()));
    }
}
