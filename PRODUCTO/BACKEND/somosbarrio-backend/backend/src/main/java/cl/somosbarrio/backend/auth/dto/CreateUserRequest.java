package cl.somosbarrio.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100,
          message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String password;

    @NotBlank @Size(max = 100)
    private String firstName;

    @NotBlank @Size(max = 100)
    private String lastName;

    @NotEmpty
    private Set<String> roles;
}
