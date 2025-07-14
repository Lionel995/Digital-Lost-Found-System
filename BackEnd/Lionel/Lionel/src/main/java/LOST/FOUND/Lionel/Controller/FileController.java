package LOST.FOUND.Lionel.Controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FileController {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        System.out.println("🖼️ FileController: Serving image: " + filename);
        
        try {
            Path filePath = fileStorageLocation.resolve("images").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            System.out.println("📁 Looking for file at: " + filePath);
            System.out.println("📄 File exists: " + resource.exists());
            System.out.println("📄 File readable: " + resource.isReadable());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                String fileName = resource.getFilename();
                
                if (fileName != null) {
                    if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (fileName.toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    } else if (fileName.toLowerCase().endsWith(".gif")) {
                        contentType = "image/gif";
                    }
                }

                System.out.println("✅ Successfully serving: " + filename + " as " + contentType);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .body(resource);
            } else {
                System.out.println("❌ File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            System.out.println("❌ Error serving file: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        String message = "File server is working! Upload directory: " + fileStorageLocation.toString();
        System.out.println("🧪 " + message);
        return ResponseEntity.ok(message);
    }
}
