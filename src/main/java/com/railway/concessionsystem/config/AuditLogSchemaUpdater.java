package com.railway.concessionsystem.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class AuditLogSchemaUpdater {

    private final JdbcTemplate jdbcTemplate;

    public AuditLogSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void ensureAuditLogPerformedByColumn() {
        if (!tableExists("audit_log")) {
            return;
        }

        boolean hasPerformedBySnakeCase = columnExists("audit_log", "performed_by");
        if (hasPerformedBySnakeCase) {
            return;
        }

        boolean hasPerformedByCamelCase = columnExists("audit_log", "performedBy");
        if (hasPerformedByCamelCase) {
            jdbcTemplate.execute("ALTER TABLE audit_log RENAME COLUMN performedBy TO performed_by");
            return;
        }

        jdbcTemplate.execute("ALTER TABLE audit_log ADD COLUMN performed_by VARCHAR(255)");
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables " +
                        "WHERE table_schema = DATABASE() AND table_name = ?",
                Integer.class,
                tableName
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }
}
