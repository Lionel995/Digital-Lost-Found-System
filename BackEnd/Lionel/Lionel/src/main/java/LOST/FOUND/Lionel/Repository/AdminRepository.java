package LOST.FOUND.Lionel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LOST.FOUND.Lionel.Model.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    
    Admin findByEmail(String email);

    
    boolean existsByEmail(String email);
}
