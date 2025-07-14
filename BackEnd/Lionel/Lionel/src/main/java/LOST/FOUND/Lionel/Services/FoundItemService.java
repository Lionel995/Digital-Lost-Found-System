package LOST.FOUND.Lionel.Services;

import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Model.FoundItemStatus;
import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.LostItemStatus;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Repository.FoundItemRepository;
import LOST.FOUND.Lionel.Repository.LostItemRepository;
import LOST.FOUND.Lionel.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FoundItemService {

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public String saveFoundItem(FoundItem foundItem, Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return "User not found";
        }

        foundItem.setUser(userOptional.get());

      
        if (foundItem.getImageFile() != null && !foundItem.getImageFile().isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + foundItem.getImageFile().getOriginalFilename();
                Path uploadPath = Paths.get("uploads/images");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    System.out.println("Created directory: " + uploadPath.toAbsolutePath());
                }
                Path filePath = uploadPath.resolve(filename);
                System.out.println("Saving file to: " + filePath.toAbsolutePath());
                
                Files.copy(foundItem.getImageFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
               
                foundItem.setImageUrl("/uploads/images/" + filename);
                System.out.println("Found item image saved at: " + foundItem.getImageUrl());
            } catch (IOException e) {
                e.printStackTrace();
                return "Failed to save image file: " + e.getMessage();
            }
        } else {
            System.out.println("No image file to process for found item");
        }

        Optional<LostItem> matchedLostItem = lostItemRepository.findByItemNameAndCategoryAndLocationLost(
                foundItem.getItemName(), foundItem.getCategory(), foundItem.getLocationFound());

        if (matchedLostItem.isPresent()) {
            LostItem lostItem = matchedLostItem.get();

            if (lostItem.getStatus() == LostItemStatus.LOST) {
                lostItem.setStatus(LostItemStatus.FOUND);
                lostItemRepository.save(lostItem);
            }

            foundItem.setMatchedLostItem(lostItem);
        }

        foundItem.setStatus(FoundItemStatus.AVAILABLE);

        FoundItem savedItem = foundItemRepository.save(foundItem);
        System.out.println("Saved FoundItem ID: " + savedItem.getId());
        return "Found item recorded successfully";
    }

    public List<FoundItem> getAllFoundItems() {
        return foundItemRepository.findAll();
    }

    public Optional<FoundItem> getFoundItemById(Long id) {
        return foundItemRepository.findById(id);
    }

    @Transactional
    public String updateFoundItem(Long id, FoundItem updatedFoundItem, Long userId) {
        Optional<FoundItem> existingFoundItem = foundItemRepository.findById(id);

        if (existingFoundItem.isEmpty()) {
            return "Found item not found";
        }

        FoundItem foundItem = existingFoundItem.get();

        if (!foundItem.getUser().getId().equals(userId)) {
            return "You can only update your own found items";
        }

        if (updatedFoundItem.getStatus() != null && foundItem.getStatus() != updatedFoundItem.getStatus()) {
            return "Status cannot be updated";
        }


        foundItem.setItemName(updatedFoundItem.getItemName());
        foundItem.setCategory(updatedFoundItem.getCategory());
        foundItem.setDescription(updatedFoundItem.getDescription());
        foundItem.setFoundDate(updatedFoundItem.getFoundDate());
        foundItem.setLocationFound(updatedFoundItem.getLocationFound());

        
        if (updatedFoundItem.getImageFile() != null && !updatedFoundItem.getImageFile().isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + updatedFoundItem.getImageFile().getOriginalFilename();
                Path uploadPath = Paths.get("uploads/images");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    System.out.println("Created directory: " + uploadPath.toAbsolutePath());
                }
                Path filePath = uploadPath.resolve(filename);
                System.out.println("Saving updated file to: " + filePath.toAbsolutePath());
                
                Files.copy(updatedFoundItem.getImageFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                // Set the URL path that will be accessible from the web
                foundItem.setImageUrl("/uploads/images/" + filename);
                System.out.println("Updated found item image saved at: " + foundItem.getImageUrl());
            } catch (IOException e) {
                e.printStackTrace();
                return "Failed to update image file: " + e.getMessage();
            }
        }

        FoundItem savedItem = foundItemRepository.save(foundItem);
        System.out.println("Updated FoundItem ID: " + savedItem.getId());
        return "Found item updated successfully";
    }

    public String deleteFoundItem(Long id, Long userId) {
        Optional<FoundItem> existingFoundItem = foundItemRepository.findById(id);

        if (existingFoundItem.isEmpty()) {
            return "Found item not found";
        }

        FoundItem foundItem = existingFoundItem.get();

        if (!foundItem.getUser().getId().equals(userId)) {
            return "You can only delete your own found items";
        }

        foundItemRepository.delete(foundItem);
        return "Found item deleted successfully";
    }
}
