package cl.somosbarrio.backend.documents.mapper;

import cl.somosbarrio.backend.documents.dto.DocumentAttachmentDto;
import cl.somosbarrio.backend.documents.dto.DocumentDto;
import cl.somosbarrio.backend.documents.dto.DocumentTemplateDto;
import cl.somosbarrio.backend.documents.entity.DocumentAttachmentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentEntity;
import cl.somosbarrio.backend.documents.entity.DocumentStatus;
import cl.somosbarrio.backend.documents.entity.DocumentTemplateEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "templateId",     source = "template.id")
    @Mapping(target = "templateName",   source = "template.name")
    @Mapping(target = "documentType",   source = "template.documentType")
    @Mapping(target = "activityId",     source = "activity.id")
    @Mapping(target = "activityTitle",  source = "activity.title")
    @Mapping(target = "createdById",    source = "createdBy.id")
    @Mapping(target = "createdByName",  expression = "java(entity.getCreatedBy().getFirstName() + ' ' + entity.getCreatedBy().getLastName())")
    @Mapping(target = "approvedById",   source = "approvedBy.id")
    @Mapping(target = "approvedByName", expression = "java(entity.getApprovedBy() != null ? entity.getApprovedBy().getFirstName() + ' ' + entity.getApprovedBy().getLastName() : null)")
    @Mapping(target = "statusLabel",    source = "status", qualifiedByName = "statusLabel")
    @Mapping(target = "attachments",    ignore = true)
    DocumentDto toDto(DocumentEntity entity);

    @Mapping(target = "id",               source = "id")
    @Mapping(target = "originalFilename", source = "originalFilename")
    @Mapping(target = "contentType",      source = "contentType")
    @Mapping(target = "sizeBytes",        source = "sizeBytes")
    @Mapping(target = "createdAt",        source = "createdAt")
    DocumentAttachmentDto toAttachmentDto(DocumentAttachmentEntity entity);

    DocumentTemplateDto toTemplateDto(DocumentTemplateEntity entity);

    @Named("statusLabel")
    default String statusLabel(DocumentStatus status) {
        return switch (status) {
            case BORRADOR    -> "Borrador";
            case EN_REVISION -> "En revisión";
            case APROBADA    -> "Aprobada";
            case RECHAZADA   -> "Rechazada";
        };
    }
}
