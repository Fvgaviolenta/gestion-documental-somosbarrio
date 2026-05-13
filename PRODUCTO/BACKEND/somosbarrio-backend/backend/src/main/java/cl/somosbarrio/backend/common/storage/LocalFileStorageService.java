package cl.somosbarrio.backend.common.storage;

import cl.somosbarrio.backend.exception.ErrorCode;
import cl.somosbarrio.backend.exception.custom.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
public class LocalFileStorageService implements FileStorageService {

    private final Path uploadRoot;

    public LocalFileStorageService(@Value("${app.upload.root:./uploads}") String uploadRoot) {
        this.uploadRoot = Paths.get(uploadRoot).toAbsolutePath().normalize();
    }

    @Override
    public String store(InputStream data, String originalName, String module) {
        try {
            String date = LocalDate.now().toString();
            Path dir = uploadRoot.resolve(module).resolve(date);
            Files.createDirectories(dir);

            String ext = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename);
            Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);

            return module + "/" + date + "/" + filename;
        } catch (IOException e) {
            log.error("Error storing file: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR,
                    "No se pudo almacenar el archivo", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Path resolve(String storagePath) {
        return uploadRoot.resolve(storagePath).normalize();
    }

    @Override
    public void delete(String storagePath) {
        try {
            Files.deleteIfExists(resolve(storagePath));
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", storagePath, e.getMessage());
        }
    }
}
