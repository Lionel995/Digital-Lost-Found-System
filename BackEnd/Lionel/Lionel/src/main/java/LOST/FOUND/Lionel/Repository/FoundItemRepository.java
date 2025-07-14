package LOST.FOUND.Lionel.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Model.LostItem;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long> {
    
    Optional<LostItem> findByItemNameAndCategoryAndLocationFound(String itemName, String category,
           String locationFound);
}
