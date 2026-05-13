package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.DocumentRepositoryFilter;
import cl.somosbarrio.backend.documents.dto.DocumentSummaryDto;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.repository.DocumentRepository;
import cl.somosbarrio.backend.documents.repository.DocumentSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentRepositoryServiceImpl implements DocumentRepositoryService {

    private final DocumentRepository documentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentSummaryDto> search(DocumentRepositoryFilter filter, Pageable pageable) {
        return documentRepository
                .findAll(DocumentSpecifications.withFilter(filter), pageable)
                .map(this::toSummary);
    }

    private DocumentSummaryDto toSummary(DocumentEntity document) {
        String createdByName = document.getCreatedBy().getFirstName() + " " + document.getCreatedBy().getLastName();
        return DocumentSummaryDto.builder()
                .id(document.getId())
                .code(document.getCode())
                .title(document.getTitle())
                .documentType(document.getTemplate().getDocumentType())
                .status(document.getStatus())
                .activityId(document.getActivity() != null ? document.getActivity().getId() : null)
                .activityTitle(document.getActivity() != null ? document.getActivity().getTitle() : null)
                .createdById(document.getCreatedBy().getId())
                .createdByName(createdByName)
                .createdAt(document.getCreatedAt())
                .approvedAt(document.getApprovedAt())
                .build();
    }
}
