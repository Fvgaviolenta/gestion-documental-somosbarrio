package cl.somosbarrio.backend.documents.service;

import cl.somosbarrio.backend.documents.dto.DocumentRepositoryFilter;
import cl.somosbarrio.backend.documents.dto.DocumentSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DocumentRepositoryService {
    Page<DocumentSummaryDto> search(DocumentRepositoryFilter filter, Pageable pageable);
}
