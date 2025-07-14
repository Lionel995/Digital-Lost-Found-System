package LOST.FOUND.Lionel.Repository;

import LOST.FOUND.Lionel.Model.ClaimRequest;
import LOST.FOUND.Lionel.Model.ClaimStatus;
import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRequestRepository extends JpaRepository<ClaimRequest, Long> {
    Optional<ClaimRequest> findByUserAndLostItem(User user, LostItem lostItem);
    Optional<ClaimRequest> findByUserAndFoundItem(User user, FoundItem foundItem);
    List<ClaimRequest> findByStatus(ClaimStatus status);
    List<ClaimRequest> findByUser(User user);
}
