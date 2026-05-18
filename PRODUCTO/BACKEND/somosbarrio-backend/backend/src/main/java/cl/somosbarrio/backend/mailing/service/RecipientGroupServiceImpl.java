package cl.somosbarrio.backend.mailing.service;

import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import cl.somosbarrio.backend.mailing.dto.CreateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.UpdateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.entity.RecipientGroupEntity;
import cl.somosbarrio.backend.mailing.repository.RecipientGroupRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipientGroupServiceImpl implements RecipientGroupService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$", Pattern.CASE_INSENSITIVE);
    private static final TypeReference<List<String>> LIST_OF_STRING = new TypeReference<>() {};

    private final RecipientGroupRepository recipientGroupRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RecipientGroupDto> listActive() {
        return recipientGroupRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toRecipientGroupDto)
                .toList();
    }

    @Override
    @Transactional
    public RecipientGroupDto create(CreateRecipientGroupRequest request) {
        ensureNameUnique(request.getName(), null);
        validateEmails(request.getEmails());

        RecipientGroupEntity entity = new RecipientGroupEntity();
        entity.setName(request.getName().trim());
        entity.setDescription(request.getDescription());
        entity.setEmails(writeEmails(request.getEmails()));

        return toRecipientGroupDto(recipientGroupRepository.save(entity));
    }

    @Override
    @Transactional
    public RecipientGroupDto update(java.util.UUID id, UpdateRecipientGroupRequest request) {
        RecipientGroupEntity entity = recipientGroupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Grupo destinatario no encontrado", HttpStatus.NOT_FOUND));

        if (request.getName() != null) {
            String trimmedName = request.getName().trim();
            ensureNameUnique(trimmedName, id);
            entity.setName(trimmedName);
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getEmails() != null) {
            validateEmails(request.getEmails());
            entity.setEmails(writeEmails(request.getEmails()));
        }

        return toRecipientGroupDto(recipientGroupRepository.save(entity));
    }

    @Override
    @Transactional
    public void deactivate(java.util.UUID id) {
        RecipientGroupEntity entity = recipientGroupRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND,
                        "Grupo destinatario no encontrado", HttpStatus.NOT_FOUND));
        entity.setActive(false);
        recipientGroupRepository.save(entity);
    }

    private void ensureNameUnique(String name, java.util.UUID existingId) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "El nombre del grupo es obligatorio", HttpStatus.BAD_REQUEST);
        }
        Optional<RecipientGroupEntity> existing = recipientGroupRepository.findByNameIgnoreCase(name.trim());
        if (existing.isPresent() && !existing.get().getId().equals(existingId)) {
            throw new BusinessException(ErrorCode.CONFLICT_STATE,
                    "Ya existe un grupo con ese nombre", HttpStatus.CONFLICT);
        }
    }

    private void validateEmails(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Debe indicar al menos un email", HttpStatus.BAD_REQUEST);
        }
        for (String email : emails) {
            if (email == null || email.isBlank()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Cada email debe ser válido", HttpStatus.BAD_REQUEST);
            }
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            if (!EMAIL_PATTERN.matcher(normalized).matches()) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                        "Email inválido: " + email, HttpStatus.BAD_REQUEST);
            }
        }
    }

    private String writeEmails(List<String> emails) {
        try {
            return objectMapper.writeValueAsString(emails);
        } catch (Exception ex) {
            log.error("Error serializando emails del grupo: {}", ex.getMessage(), ex);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo serializar la lista de emails", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private List<String> parseEmails(String emailsJson) {
        try {
            return objectMapper.readValue(emailsJson, LIST_OF_STRING);
        } catch (Exception ex) {
            log.warn("No se pudo parsear emails de recipient group: {}", ex.getMessage());
            return List.of();
        }
    }

    private RecipientGroupDto toRecipientGroupDto(RecipientGroupEntity group) {
        return RecipientGroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .emails(parseEmails(group.getEmails()))
                .createdAt(group.getCreatedAt())
                .build();
    }
}
