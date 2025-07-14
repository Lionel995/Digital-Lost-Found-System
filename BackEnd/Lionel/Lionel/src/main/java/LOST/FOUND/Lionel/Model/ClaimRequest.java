package LOST.FOUND.Lionel.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "claim_requests")
public class ClaimRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lost_item_id", nullable = true)
    private LostItem lostItem;

    @ManyToOne
    @JoinColumn(name = "found_item_id", nullable = true)
    private FoundItem foundItem;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "proof_description", length = 500)
    private String proofDescription;

    
    @Column(name = "contact_information", length = 100, nullable = false)
    private String contactInformation;
    
    
    @Column(name = "additional_details", length = 500)
    private String additionalDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ClaimStatus status;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = true)
    private Admin admin;

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LostItem getLostItem() {
        return lostItem;
    }

    public void setLostItem(LostItem lostItem) {
        this.lostItem = lostItem;
    }

    public FoundItem getFoundItem() {
        return foundItem;
    }

    public void setFoundItem(FoundItem foundItem) {
        this.foundItem = foundItem;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProofDescription() {
        return proofDescription;
    }

    public void setProofDescription(String proofDescription) {
        this.proofDescription = proofDescription;
    }

    public String getContactInformation() {
        return contactInformation;
    }

    public void setContactInformation(String contactInformation) {
        this.contactInformation = contactInformation;
    }

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public ClaimRequest(Long id, LostItem lostItem, FoundItem foundItem, User user, String proofDescription,
            String contactInformation, String additionalDetails, ClaimStatus status, Admin admin) {
        this.id = id;
        this.lostItem = lostItem;
        this.foundItem = foundItem;
        this.user = user;
        this.proofDescription = proofDescription;
        this.contactInformation = contactInformation;
        this.additionalDetails = additionalDetails;
        this.status = status;
        this.admin = admin;
    }

    public ClaimRequest() {
    }
}
