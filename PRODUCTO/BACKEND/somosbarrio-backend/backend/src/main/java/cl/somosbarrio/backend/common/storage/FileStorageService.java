package cl.somosbarrio.backend.common.storage;

import java.io.InputStream;
import java.nio.file.Path;

public interface FileStorageService {

    /**
     * Stores the file and returns the relative path used to retrieve it later.
     */
    String store(InputStream data, String originalName, String module);

    Path resolve(String storagePath);

    void delete(String storagePath);
}
