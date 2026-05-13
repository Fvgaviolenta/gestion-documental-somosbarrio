package cl.somosbarrio.backend.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class RoleEntity {

    @Id
    private Short id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
