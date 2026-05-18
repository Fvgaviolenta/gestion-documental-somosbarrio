package cl.somosbarrio.backend.mailing.service;

import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.CreateRecipientGroupRequest;
import cl.somosbarrio.backend.mailing.dto.UpdateRecipientGroupRequest;

import java.util.List;
import java.util.UUID;

public interface RecipientGroupService {

    List<RecipientGroupDto> listActive();

    RecipientGroupDto create(CreateRecipientGroupRequest request);

    RecipientGroupDto update(UUID id, UpdateRecipientGroupRequest request);

    void deactivate(UUID id);
}
