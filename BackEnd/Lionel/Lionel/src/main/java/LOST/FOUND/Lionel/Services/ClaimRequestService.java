package LOST.FOUND.Lionel.Services;

import LOST.FOUND.Lionel.Model.ClaimRequest;
import LOST.FOUND.Lionel.Model.ClaimStatus;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Model.Admin;
import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Repository.ClaimRequestRepository;
import LOST.FOUND.Lionel.Repository.AdminRepository;
import LOST.FOUND.Lionel.Repository.LostItemRepository;
import LOST.FOUND.Lionel.Repository.FoundItemRepository;
import LOST.FOUND.Lionel.Repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClaimRequestService {

    @Autowired
    private ClaimRequestRepository claimRequestRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;
    
    @Autowired
    private UserRepository userRepository;

    public ClaimRequest createClaimRequest(ClaimRequest claimRequest) {
        return claimRequestRepository.save(claimRequest);
    }

    public List<ClaimRequest> getAllClaimRequests() {
        return claimRequestRepository.findAll();
    }

    public Optional<ClaimRequest> getClaimRequestById(Long id) {
        return claimRequestRepository.findById(id);
    }

    public Optional<ClaimRequest> findClaimRequestByUserAndLostItem(User user, Long lostItemId) {
        Optional<LostItem> lostItem = lostItemRepository.findById(lostItemId);

        if (lostItem.isPresent()) {
            return claimRequestRepository.findByUserAndLostItem(user, lostItem.get());
        } else {
            return Optional.empty();
        }
    }

    public Optional<ClaimRequest> findClaimRequestByUserAndFoundItem(User user, Long foundItemId) {
        Optional<FoundItem> foundItem = foundItemRepository.findById(foundItemId);

        if (foundItem.isPresent()) {
            return claimRequestRepository.findByUserAndFoundItem(user, foundItem.get());
        } else {
            return Optional.empty();
        }
    }

    @Transactional
    public ResponseEntity<String> updateClaimStatus(Long id, ClaimStatus status, Long adminId) {
        Optional<ClaimRequest> optionalClaimRequest = claimRequestRepository.findById(id);

        if (!optionalClaimRequest.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Claim request not found");
        }

        ClaimRequest claimRequest = optionalClaimRequest.get();

        if (claimRequest.getStatus() != ClaimStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Claim request has already been reviewed");
        }

        Admin admin = adminRepository.findById(adminId)
                .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }

        claimRequest.setStatus(status);
        claimRequest.setAdmin(admin);

        claimRequestRepository.save(claimRequest);

        return ResponseEntity.ok("Claim status updated successfully");
    }

    @Transactional
    public ResponseEntity<String> deleteClaimRequest(Long id, Long userId) {
        Optional<ClaimRequest> optionalClaimRequest = claimRequestRepository.findById(id);

        if (!optionalClaimRequest.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Claim request not found.");
        }

        ClaimRequest claimRequest = optionalClaimRequest.get();

        if (!claimRequest.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own claim requests.");
        }

        if (claimRequest.getStatus() != ClaimStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("You can only delete claims that are still pending.");
        }

        claimRequestRepository.delete(claimRequest);
        return ResponseEntity.ok("Claim request deleted successfully.");
    }
    
    @Transactional
    public void deleteClaimRequestById(Long id) {
        claimRequestRepository.deleteById(id);
    }

    @Transactional
    public ClaimRequest rollbackClaimDecision(Long claimId, Long adminId) {
        Optional<ClaimRequest> optionalClaimRequest = claimRequestRepository.findById(claimId);

        if (!optionalClaimRequest.isPresent()) {
            throw new RuntimeException("Claim request not found");
        }

        ClaimRequest claimRequest = optionalClaimRequest.get();

        if (claimRequest.getAdmin() == null) {
            throw new RuntimeException("This claim has not been reviewed by an admin.");
        }

        if (!claimRequest.getAdmin().getId().equals(adminId)) {
            throw new RuntimeException("You can only roll back decisions made by you.");
        }

        if (claimRequest.getStatus() == ClaimStatus.PENDING) {
            return claimRequest;
        }

        claimRequest.setStatus(ClaimStatus.PENDING);
        claimRequest.setAdmin(null);

        return claimRequestRepository.save(claimRequest);
    }

    public List<ClaimRequest> getClaimsByStatus(ClaimStatus status) {
        return claimRequestRepository.findByStatus(status);
    }
    
    public List<ClaimRequest> getClaimsByUser(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            throw new RuntimeException("User not found");
        }
        return claimRequestRepository.findByUser(user.get());
    }
}
