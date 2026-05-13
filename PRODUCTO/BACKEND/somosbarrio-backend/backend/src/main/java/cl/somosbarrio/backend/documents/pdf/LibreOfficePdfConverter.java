package cl.somosbarrio.backend.documents.pdf;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Conversión .docx → .pdf mediante LibreOffice en modo headless (opcional).
 */
@Component
@Slf4j
public class LibreOfficePdfConverter {

    private final Optional<Path> executable;

    public LibreOfficePdfConverter(@Value("${app.documents.libreoffice-path:}") String libreOfficePath) {
        if (libreOfficePath == null || libreOfficePath.isBlank()) {
            executable = Optional.empty();
        } else {
            executable = Optional.of(Path.of(libreOfficePath.trim()));
        }
    }

    public boolean isAvailable() {
        return executable.filter(Files::exists).isPresent();
    }

    /**
     * Convierte {@code docxFile} y deja el PDF en {@code targetPdf} (sobrescribe).
     */
    public void convert(Path docxFile, Path targetPdf) throws Exception {
        Path exe = executable.orElseThrow(() -> new IllegalStateException("LibreOffice no configurado"));
        Path outDir = docxFile.toAbsolutePath().getParent();
        if (outDir == null) {
            throw new IllegalStateException("docx sin directorio padre");
        }
        String baseName = stripExtension(docxFile.getFileName().toString());
        ProcessBuilder pb = new ProcessBuilder(
                exe.toString(),
                "--headless",
                "--convert-to", "pdf",
                "--outdir", outDir.toString(),
                docxFile.toAbsolutePath().toString()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        boolean finished = process.waitFor(120, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new IllegalStateException("LibreOffice excedió el tiempo de espera");
        }
        if (process.exitValue() != 0) {
            throw new IllegalStateException("LibreOffice terminó con código " + process.exitValue());
        }
        Path produced = outDir.resolve(baseName + ".pdf");
        if (!Files.isRegularFile(produced)) {
            throw new IllegalStateException("No se generó el PDF esperado en " + produced);
        }
        Path pdfParent = targetPdf.toAbsolutePath().getParent();
        if (pdfParent != null) {
            Files.createDirectories(pdfParent);
        }
        Files.move(produced, targetPdf, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
    }

    private static String stripExtension(String name) {
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }
}
