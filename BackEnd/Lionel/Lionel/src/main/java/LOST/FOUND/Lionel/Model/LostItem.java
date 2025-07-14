package LOST.FOUND.Lionel.Model;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "lost_items")
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @JsonManagedReference
    @OneToOne(mappedBy = "matchedLostItem", cascade = CascadeType.ALL)
    private FoundItem matchedFoundItem;
    
    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;
    
    @Column(name = "category", nullable = false)
    private String category;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "lost_date", nullable = false)
    private String lostDate;
    
    @Column(name = "location_lost", length = 200)
    private String locationLost;
    
    @Column(name = "image_url", nullable = true)
    private String imageUrl;

    @Transient
    @JsonIgnore
    private MultipartFile imageFile;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LostItemStatus status;

    

    public MultipartFile getImageFile() {
        return imageFile;
    }

    public void setImageFile(MultipartFile imageFile) {
        this.imageFile = imageFile;
    }
    

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

    public FoundItem getMatchedFoundItem() {
        return matchedFoundItem;
    }

    public void setMatchedFoundItem(FoundItem matchedFoundItem) {
        this.matchedFoundItem = matchedFoundItem;
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

    public String getLostDate() {
        return lostDate;
    }

    public void setLostDate(String lostDate) {
        this.lostDate = lostDate;
    }

    public String getLocationLost() {
        return locationLost;
    }

    public void setLocationLost(String locationLost) {
        this.locationLost = locationLost;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LostItemStatus getStatus() {
        return status;
    }

    public void setStatus(LostItemStatus status) {
        this.status = status;
    }

    public LostItem(Long id, User user, FoundItem matchedFoundItem, String itemName, String category,
            String description, String lostDate, String locationLost, String imageUrl, LostItemStatus status) {
        this.id = id;
        this.user = user;
        this.matchedFoundItem = matchedFoundItem;
        this.itemName = itemName;
        this.category = category;
        this.description = description;
        this.lostDate = lostDate;
        this.locationLost = locationLost;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public LostItem() {
    }
    

    
}

