package LOST.FOUND.Lionel.Repository;

import LOST.FOUND.Lionel.Model.PasswordResetToken;
import LOST.FOUND.Lionel.Model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);

}
