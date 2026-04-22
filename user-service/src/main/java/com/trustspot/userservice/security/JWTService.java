package com.trustspot.userservice.security;

// jwt authentication belongs here
import io.jsonwebtoken.Jwts; //Jwts used to create and parse JWTs
import io.jsonwebtoken.SignatureAlgorithm; //SignatureAlgorithm used to specify the algorithm for signing the JWT
import org.springframework.sterotype.Service; //marks this class as a Spring service component. Spring will automatically create and manage this class (dependency injection)
import java.util.Date; //Date used to set the expiration time of the JWT

@Service
public class JWTService {

    // Value annotation is used to inject the value of the JWT secret key from the application properties file. The secret key is used to sign the JWTs, ensuring their integrity and authenticity.
    // find jwt.secret in application.properties and inject it here and get it value and assign it it to SECRET_KEY variable
    @Value("${jwt.secret}")
    private final String SECRET_KEY;

    // create jwt token using us
    public String generateToken(String email){

        // start building jwt token use builder pattern
        return Jwts.builder()
                .setSubject(email) //set main identity of the token, in this case, the user's email. This is the information that will be stored in the token and can be retrieved later when the token is parsed.
                .setIssuedAt(new Date()) // set the time when the token was issued. This is useful for tracking the age of the token and can be used in conjunction with the expiration time to determine if the token is still valid.
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // set the expiration time of the token. In this case, the token will expire in 1 hour (1000 milliseconds * 60 seconds * 60 minutes). After this time, the token will no longer be valid and cannot be used for authentication.
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // specify the algorithm used to sign the token (HS256 in this case) and provide the secret key that will be used for signing. This ensures that the token cannot be tampered with, as any changes to the token will invalidate the signature.
                .compact(); // finalize the building of the token and return it as a compact string. This string can be sent to clients and used for authentication in subsequent requests.
    }
}