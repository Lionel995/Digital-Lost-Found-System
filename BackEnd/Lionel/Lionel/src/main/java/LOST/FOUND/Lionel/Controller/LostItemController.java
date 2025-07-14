// package LOST.FOUND.Lionel.Controller;

// import LOST.FOUND.Lionel.Model.LostItem;
// import LOST.FOUND.Lionel.Model.User;
// import LOST.FOUND.Lionel.Model.Role;
// import LOST.FOUND.Lionel.Services.LostItemService;
// import LOST.FOUND.Lionel.Services.UserService;
// // import com.fasterxml.jackson.databind.ObjectMapper;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.*;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.Authentication;
// import org.springframework.web.bind.annotation.*;
// // import org.springframework.web.multipart.MultipartFile;

// import java.util.List;
// import java.util.Optional;

// @CrossOrigin("*")
// @RestController
// @RequestMapping("/lostItem")
// public class LostItemController {

//     @Autowired
//     private LostItemService lostItemService;

//     @Autowired
//     private UserService userService;

//     @PostMapping(value = "/saveLostItem", consumes = MediaType.APPLICATION_JSON_VALUE)
// @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
// public ResponseEntity<?> saveLostItem(
//         @RequestBody LostItem lostItem,
//         Authentication authentication) {

//     String email = authentication.getName();
//     User user = userService.getUserByEmail(email);

//     String result = lostItemService.saveLostItem(lostItem, user.getId());
//     if (result.equals("Lost item saved successfully")) {
//         return new ResponseEntity<>(result, HttpStatus.CREATED);
//     } else {
//         return new ResponseEntity<>(result, HttpStatus.CONFLICT);
//     }
// }



//     // View all lost items (admin or user)
//     @GetMapping(value = "/getAllLostItems", produces = MediaType.APPLICATION_JSON_VALUE)
//     @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
//     public ResponseEntity<List<LostItem>> getAllLostItems() {
//         List<LostItem> lostItems = lostItemService.getAllLostItems();
//         return ResponseEntity.ok(lostItems);
//     }

//     // View lost item by ID
//     @GetMapping(value = "/getLostItemById/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
//     @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
//     public ResponseEntity<?> getLostItemById(@PathVariable Long id) {
//         Optional<LostItem> lostItem = lostItemService.getLostItemById(id);
//         if (lostItem.isPresent()) {
//             return ResponseEntity.ok(lostItem.get());
//         } else {
//             return new ResponseEntity<>("Lost item with ID " + id + " not found", HttpStatus.NOT_FOUND);
//         }
//     }

//     // Delete lost item by ID — only owner or admin
//     @DeleteMapping(value = "/deleteLostItem/{id}")
//     @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
//     public ResponseEntity<?> deleteLostItem(@PathVariable Long id, Authentication authentication) {
//         String email = authentication.getName();
//         User user = userService.getUserByEmail(email);

//         Optional<LostItem> optionalLostItem = lostItemService.getLostItemById(id);
//         if (optionalLostItem.isEmpty()) {
//             return new ResponseEntity<>("Lost item not found", HttpStatus.NOT_FOUND);
//         }

//         LostItem lostItem = optionalLostItem.get();

//         if (user.getRole() != Role.ADMIN && !lostItem.getUser().getId().equals(user.getId())) {
//             return new ResponseEntity<>("Access Denied: You can only delete your own lost items", HttpStatus.FORBIDDEN);
//         }

//         String result = lostItemService.deleteLostItem(id);
//         if (result.equals("Lost item deleted successfully")) {
//             return new ResponseEntity<>(result, HttpStatus.OK);
//         } else {
//             return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
//         }
//     }
// }





package LOST.FOUND.Lionel.Controller;

import LOST.FOUND.Lionel.Model.LostItem;
import LOST.FOUND.Lionel.Model.User;
import LOST.FOUND.Lionel.Model.Role;
import LOST.FOUND.Lionel.Services.LostItemService;
import LOST.FOUND.Lionel.Services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@CrossOrigin("*")
@RestController
@RequestMapping("/lostItem")
public class LostItemController {

    @Autowired
    private LostItemService lostItemService;

    @Autowired
    private UserService userService;

    // Save lost item with image upload
    @PostMapping(value = "/saveLostItem", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> saveLostItem(
            @RequestParam("lostItem") String lostItemJson,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        try {
            ObjectMapper mapper = new ObjectMapper();
            LostItem lostItem = mapper.readValue(lostItemJson, LostItem.class);
            
            if (imageFile != null && !imageFile.isEmpty()) {
                lostItem.setImageFile(imageFile);
                System.out.println("Image file received: " + imageFile.getOriginalFilename() + 
                                  ", size: " + imageFile.getSize() + " bytes");
            } else {
                System.out.println("No image file received or empty file");
            }
            
            String result = lostItemService.saveLostItem(lostItem, user.getId());
            if (result.equals("Lost item saved successfully")) {
                return new ResponseEntity<>(result, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(result, HttpStatus.CONFLICT);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Failed to parse lost item: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    
    @GetMapping(value = "/getAllLostItems", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<LostItem>> getAllLostItems() {
        List<LostItem> lostItems = lostItemService.getAllLostItems();
        return ResponseEntity.ok(lostItems);
    }

    
    @GetMapping(value = "/getLostItemById/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getLostItemById(@PathVariable Long id) {
        Optional<LostItem> lostItem = lostItemService.getLostItemById(id);
        if (lostItem.isPresent()) {
            return ResponseEntity.ok(lostItem.get());
        } else {
            return new ResponseEntity<>("Lost item with ID " + id + " not found", HttpStatus.NOT_FOUND);
        }
    }

    
    @DeleteMapping(value = "/deleteLostItem/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteLostItem(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        Optional<LostItem> optionalLostItem = lostItemService.getLostItemById(id);
        if (optionalLostItem.isEmpty()) {
            return new ResponseEntity<>("Lost item not found", HttpStatus.NOT_FOUND);
        }

        LostItem lostItem = optionalLostItem.get();

        if (user.getRole() != Role.ADMIN && !lostItem.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>("Access Denied: You can only delete your own lost items", HttpStatus.FORBIDDEN);
        }

        String result = lostItemService.deleteLostItem(id);
        if (result.equals("Lost item deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}






