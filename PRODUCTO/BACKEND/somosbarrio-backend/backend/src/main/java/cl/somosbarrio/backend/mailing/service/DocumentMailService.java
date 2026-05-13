package cl.somosbarrio.backend.mailing.service;

import cl.somosbarrio.backend.mailing.dto.EmailLogDto;
import cl.somosbarrio.backend.mailing.dto.RecipientGroupDto;
import cl.somosbarrio.backend.mailing.dto.SendDocumentRequest;
import cl.somosbarrio.backend.mailing.dto.SendDocumentResponse;

import java.util.List;
import java.util.UUID;

public interface DocumentMailService {
    List<RecipientGroupDto> listActiveRecipientGroups();
    SendDocumentResponse sendDocument(UUID documentId, UUID actorId, SendDocumentRequest request);
    List<EmailLogDto> findByDocumentId(UUID documentId);
}
