package com.railway.concessionsystem.service;

import com.railway.concessionsystem.model.Application;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.PDPageContentStream;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class ConcessionPrintService {

    private float mm(float value) {
        return value * 2.83465f;
    }

    public byte[] generateForms(List<Application> applications) throws Exception {

        PDDocument document = new PDDocument();

        for (Application app : applications) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDPageContentStream content =
                    new PDPageContentStream(document, page);

            content.beginText();
            content.setFont(PDType1Font.HELVETICA, 11);

            // ===== Student Name =====
            content.newLineAtOffset(mm(40), mm(230));
            content.showText(app.getStudentName());

            // ===== DOB =====
            content.newLineAtOffset(0, -mm(8));
            content.showText(app.getStudentDob().toString());

            // ===== Category =====
            content.newLineAtOffset(0, -mm(8));
            content.showText(app.getCategory());

            // ===== Route =====
            content.newLineAtOffset(0, -mm(8));
            content.showText(app.getRouteFrom());

            content.newLineAtOffset(mm(60), 0);
            content.showText(app.getRouteTo());

            // ===== Certificate Number =====
            content.newLineAtOffset(-mm(60), -mm(8));
            content.showText(app.getCurrentCertificateNo());

            // ===== Valid Until =====
            content.newLineAtOffset(0, -mm(8));
            if(app.getValidUntil()!=null)
                content.showText(app.getValidUntil().toString());

            content.endText();
            content.close();
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        document.save(out);
        document.close();

        return out.toByteArray();
    }
}