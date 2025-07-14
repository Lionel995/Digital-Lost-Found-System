package LOST.FOUND.Lionel.Controller;

import LOST.FOUND.Lionel.Model.FoundItem;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Services.FoundItemService;
import LOST.FOUND.Lionel.Services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/foundItems")
@CrossOrigin("*")
public class FoundItemController {

    @Autowired
    private FoundItemService foundItemService;

    @Autowired
    private UserService userService;

    
    @PostMapping(value = "/saveFoundItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> reportFoundItem(
            @RequestParam("foundItem") String foundItemJson,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        
        try {
            ObjectMapper mapper = new ObjectMapper();
            FoundItem foundItem = mapper.readValue(foundItemJson, FoundItem.class);
            
            if (imageFile != null && !imageFile.isEmpty()) {
                foundItem.setImageFile(imageFile);
                System.out.println("Image file received: " + imageFile.getOriginalFilename() + 
                                  ", size: " + imageFile.getSize() + " bytes");
            } else {
                System.out.println("No image file received or empty file");
            }
            
            String response = foundItemService.saveFoundItem(foundItem, user.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to parse found item: " + e.getMessage());
        }
    }

    
    @GetMapping("/getAll")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<FoundItem>> getAllFoundItems() {
        return ResponseEntity.ok(foundItemService.getAllFoundItems());
    }

    
    @GetMapping("/getFoundItemById/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getFoundItemById(@PathVariable Long id) {
        Optional<FoundItem> foundItem = foundItemService.getFoundItemById(id);

        if (foundItem.isPresent()) {
            return ResponseEntity.ok(foundItem.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Found item with ID " + id + " not found");
        }
    }

    
    @PutMapping(value = "/updateFoundItem/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateFoundItem(
            @PathVariable Long id,
            @RequestParam("foundItem") String foundItemJson,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        try {
            ObjectMapper mapper = new ObjectMapper();
            FoundItem updatedFoundItem = mapper.readValue(foundItemJson, FoundItem.class);
            
            if (imageFile != null && !imageFile.isEmpty()) {
                updatedFoundItem.setImageFile(imageFile);
                System.out.println("Image file received for update: " + imageFile.getOriginalFilename() + 
                                  ", size: " + imageFile.getSize() + " bytes");
            } else {
                System.out.println("No image file received for update or empty file");
            }
            
            String response = foundItemService.updateFoundItem(id, updatedFoundItem, user.getId());

            if (response.equals("Found item not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else if (response.equals("You can only update your own found items")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            } else if (response.equals("Status cannot be updated")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to parse found item: " + e.getMessage());
        }
    }

    
    @DeleteMapping("/deleteFoundItem/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteFoundItem(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        String response = foundItemService.deleteFoundItem(id, user.getId());

        if (response.equals("Found item not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else if (response.equals("You can only delete your own found items")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        return ResponseEntity.ok(response);
    }
}