package LOST.FOUND.Lionel.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/file-paths")
    public ResponseEntity<?> testFilePaths() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            
            Path uploadsDir = Paths.get("uploads");
            Path imagesDir = Paths.get("uploads/images");
            
            
            boolean uploadsExists = Files.exists(uploadsDir);
            boolean imagesExists = Files.exists(imagesDir);
            
            response.put("uploadsDirectoryExists", uploadsExists);
            response.put("imagesDirectoryExists", imagesExists);
            response.put("uploadsAbsolutePath", uploadsDir.toAbsolutePath().toString());
            
            
            if (imagesExists) {
                File[] files = imagesDir.toFile().listFiles();
                String[] fileNames = new String[files != null ? files.length : 0];
                
                if (files != null) {
                    for (int i = 0; i < files.length; i++) {
                        fileNames[i] = files[i].getName();
                    }
                }
                
                response.put("imageFiles", fileNames);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}