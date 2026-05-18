package cl.somosbarrio.backend.mailing.service;

import cl.somosbarrio.backend.mailing.dto.CreateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.UpdateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.entity.RecipientGroupEntity;
import cl.somosbarrio.backend.mailing.repository.RecipientGroupRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RecipientGroupServiceImplTest {

    @Mock
    private RecipientGroupRepository recipientGroupRepository;

    private RecipientGroupServiceImpl service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new RecipientGroupServiceImpl(recipientGroupRepository, new ObjectMapper());
    }

    @Test
    void create_savesGroupAndReturnsDto() {
        CreateRecipientGroupRequest request = new CreateRecipientGroupRequest();
        request.setName("Grupo Test");
        request.setDescription("Descripción");
        request.setEmails(List.of("user@example.com", "otro@example.com"));

        when(recipientGroupRepository.findByNameIgnoreCase("Grupo Test")).thenReturn(Optional.empty());
        when(recipientGroupRepository.save(any(RecipientGroupEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RecipientGroupDto dto = service.create(request);

        assertThat(dto.getName()).isEqualTo("Grupo Test");
        assertThat(dto.getDescription()).isEqualTo("Descripción");
        assertThat(dto.getEmails()).containsExactly("user@example.com", "otro@example.com");
    }

    @Test
    void update_changesNameAndEmails() {
        UUID id = UUID.randomUUID();
        RecipientGroupEntity existing = new RecipientGroupEntity();
        existing.setId(id);
        existing.setName("Original");
        existing.setEmails("[\"a@example.com\"]");

        UpdateRecipientGroupRequest request = new UpdateRecipientGroupRequest();
        request.setName("Nuevo Nombre");
        request.setEmails(List.of("nuevo@example.com"));

        when(recipientGroupRepository.findById(id)).thenReturn(Optional.of(existing));
        when(recipientGroupRepository.findByNameIgnoreCase("Nuevo Nombre")).thenReturn(Optional.empty());
        when(recipientGroupRepository.save(any(RecipientGroupEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RecipientGroupDto dto = service.update(id, request);

        assertThat(dto.getName()).isEqualTo("Nuevo Nombre");
        assertThat(dto.getEmails()).containsExactly("nuevo@example.com");
    }

    @Test
    void deactivate_setsActiveFalse() {
        UUID id = UUID.randomUUID();
        RecipientGroupEntity entity = new RecipientGroupEntity();
        entity.setId(id);
        entity.setActive(true);

        when(recipientGroupRepository.findById(id)).thenReturn(Optional.of(entity));

        service.deactivate(id);

        ArgumentCaptor<RecipientGroupEntity> captor = ArgumentCaptor.forClass(RecipientGroupEntity.class);
        verify(recipientGroupRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    void listActive_returnsDtos() {
        RecipientGroupEntity group = new RecipientGroupEntity();
        group.setId(UUID.randomUUID());
        group.setName("Grupo A");
        group.setEmails("[\"a@example.com\"]");

        when(recipientGroupRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(group));

        List<RecipientGroupDto> dtos = service.listActive();

        assertThat(dtos).hasSize(1);
        assertThat(dtos.get(0).getName()).isEqualTo("Grupo A");
    }

    @Test
    void create_duplicateName_throwsConflict() {
        CreateRecipientGroupRequest request = new CreateRecipientGroupRequest();
        request.setName("Grupo Test");
        request.setEmails(List.of("user@example.com"));

        RecipientGroupEntity existing = new RecipientGroupEntity();
        existing.setId(UUID.randomUUID());

        when(recipientGroupRepository.findByNameIgnoreCase("Grupo Test")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(RuntimeException.class);
    }
}
