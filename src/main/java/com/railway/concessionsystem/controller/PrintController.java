package com.railway.concessionsystem.controller;

import com.railway.concessionsystem.model.Application;
import com.railway.concessionsystem.repository.ApplicationRepository;
import com.railway.concessionsystem.service.ConcessionPrintService;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/print")
public class PrintController {

    private final ApplicationRepository repo;

    public PrintController(ApplicationRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> printSingle(@PathVariable Long id) throws Exception {

        Application app = repo.findById(id).orElseThrow();

        List<Application> list = List.of(app);

        ConcessionPrintService service = new ConcessionPrintService();

        byte[] pdf = service.generateForms(list);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/batch")
    public ResponseEntity<byte[]> printBatch(@RequestBody List<Long> ids) throws Exception {

        List<Application> apps = repo.findAllById(ids);

        ConcessionPrintService service = new ConcessionPrintService();

        byte[] pdf = service.generateForms(apps);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}