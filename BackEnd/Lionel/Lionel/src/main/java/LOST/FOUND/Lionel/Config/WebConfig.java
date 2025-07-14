// package LOST.FOUND.Lionel.Config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// import java.nio.file.Path;
// import java.nio.file.Paths;

// @Configuration
// public class WebConfig implements WebMvcConfigurer {

//     @Override
//     public void addResourceHandlers(ResourceHandlerRegistry registry) {
//         // Get the absolute path to the uploads directory
//         Path uploadDir = Paths.get("uploads");
//         String uploadPath = uploadDir.toFile().getAbsolutePath();
        
//         // Register the resource handler for the uploads directory
//         registry.addResourceHandler("/uploads/**")
//                 .addResourceLocations("file:" + uploadPath + "/");
                
//         System.out.println("Configured resource handler for uploads at: " + uploadPath);
//     }
// }





package LOST.FOUND.Lionel.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        System.out.println("🔧 Configuring static resource handlers...");
        
        // Get the absolute path to the uploads directory
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        System.out.println("📁 Upload directory path: " + uploadPath);
        System.out.println("📁 Directory exists: " + uploadDir.toFile().exists());
        
        // Register the resource handler for the uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/")
                .setCachePeriod(3600)
                .resourceChain(true);
        
        // Also add a specific handler for images
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + uploadPath + "/images/")
                .setCachePeriod(3600)
                .resourceChain(true);
                
        System.out.println("✅ Static resource handlers configured");
        System.out.println("🔗 /uploads/** -> file:" + uploadPath + "/");
        System.out.println("🔗 /uploads/images/** -> file:" + uploadPath + "/images/");
    }
}
