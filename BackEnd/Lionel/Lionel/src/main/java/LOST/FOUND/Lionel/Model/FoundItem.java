package LOST.FOUND.Lionel.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.web.multipart.MultipartFile;

@Entity
@Table(name = "found_items")
public class FoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "lost_item_id", nullable = true)
    private LostItem matchedLostItem;
    
    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;
    
    @Column(name = "category", nullable = false)
    private String category;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "found_date", nullable = false)
    private String foundDate;
    
    @Column(name = "location_found", length = 200)
    private String locationFound;
    
    @Column(name = "image_url", nullable = true)
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FoundItemStatus status;
    
    @Transient
    @JsonIgnore
    private MultipartFile imageFile;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LostItem getMatchedLostItem() {
        return matchedLostItem;
    }

    public void setMatchedLostItem(LostItem matchedLostItem) {
        this.matchedLostItem = matchedLostItem;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFoundDate() {
        return foundDate;
    }

    public void setFoundDate(String foundDate) {
        this.foundDate = foundDate;
    }

    public String getLocationFound() {
        return locationFound;
    }

    public void setLocationFound(String locationFound) {
        this.locationFound = locationFound;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public FoundItemStatus getStatus() {
        return status;
    }

    public void setStatus(FoundItemStatus status) {
        this.status = status;
    }
    
    public MultipartFile getImageFile() {
        return imageFile;
    }

    public void setImageFile(MultipartFile imageFile) {
        this.imageFile = imageFile;
    }

    public FoundItem(Long id, User user, LostItem matchedLostItem, String itemName, String category, String description,
            String foundDate, String locationFound, String imageUrl, FoundItemStatus status) {
        this.id = id;
        this.user = user;
        this.matchedLostItem = matchedLostItem;
        this.itemName = itemName;
        this.category = category;
        this.description = description;
        this.foundDate = foundDate;
        this.locationFound = locationFound;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public FoundItem() {
    }
    
}