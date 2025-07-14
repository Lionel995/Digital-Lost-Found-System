package LOST.FOUND.Lionel.Repository;

import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LOST.FOUND.Lionel.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
   
   User findByEmail(String email);

  

   Optional<User> findById(Long userId);
}
