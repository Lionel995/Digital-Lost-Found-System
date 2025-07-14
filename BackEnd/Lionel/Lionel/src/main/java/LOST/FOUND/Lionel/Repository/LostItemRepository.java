package LOST.FOUND.Lionel.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.User;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    
    List<LostItem> findByUser(User user);

   Optional<LostItem> findByItemNameAndCategoryAndLocationLost(String itemName, String category,
           String locationLost);
}
