



package LOST.FOUND.Lionel.Services;

import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.LostItemStatus;
import LOST.FOUND.Lionel.Repository.LostItemRepository;
import LOST.FOUND.Lionel.Repository.UserRepository;
import jakarta.transaction.Transactional;
import LOST.FOUND.Lionel.Model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private UserRepository userRepository;

    public List<LostItem> getAllLostItems() {
        return lostItemRepository.findAll();
    }

    public Optional<LostItem> getLostItemById(Long id) {
        return lostItemRepository.findById(id);
    }

    @Transactional
    public String saveLostItem(LostItem lostItem, Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return "User not found";
        }

        lostItem.setUser(user.get());
        lostItem.setStatus(LostItemStatus.LOST);

        System.out.println("Preparing to save LostItem: " + lostItem.getItemName() + ", for user ID: " + userId);

        if (lostItem.getImageFile() != null && !lostItem.getImageFile().isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + lostItem.getImageFile().getOriginalFilename();
                Path uploadPath = Paths.get("uploads/images");
                
                
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    System.out.println("Created directory: " + uploadPath.toAbsolutePath());
                }
                
                Path filePath = uploadPath.resolve(filename);
                System.out.println("Saving file to: " + filePath.toAbsolutePath());
                
                Files.copy(lostItem.getImageFile().getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
               
                lostItem.setImageUrl("/uploads/images/" + filename);
                System.out.println("Image saved at: " + lostItem.getImageUrl());
            } catch (IOException e) {
                e.printStackTrace();
                return "Failed to save image file: " + e.getMessage();
            }
        } else {
            System.out.println("No image file to process");
        }

        LostItem savedItem = lostItemRepository.save(lostItem);
        System.out.println("Saved LostItem ID: " + savedItem.getId());
        return "Lost item saved successfully";
    }

    public String deleteLostItem(Long id) {
        Optional<LostItem> lostItem = lostItemRepository.findById(id);
        if (lostItem.isPresent()) {
            lostItemRepository.deleteById(id);
            return "Lost item deleted successfully";
        } else {
            return "Lost item not found";
        }
    }
}
