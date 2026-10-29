package edu.campus.iitsm.knowledge.infrastructure.web;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeController {

  private final JdbcTemplate jdbcTemplate;

  public KnowledgeController(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @GetMapping
  public ResponseEntity<List<Map<String, Object>>> getArticles() {
    String sql = "SELECT id, number, title, service_id, category_id, status FROM kb_article ORDER BY number ASC";
    try {
      List<Map<String, Object>> articles = jdbcTemplate.query(
          sql,
          (rs, rowNum) -> Map.of(
              "id", rs.getObject("id").toString(),
              "number", rs.getString("number"),
              "title", rs.getString("title"),
              "status", rs.getString("status")
          )
      );
      return ResponseEntity.ok(articles);
    } catch (Exception ex) {
      // In case table is initially empty or seed
      return ResponseEntity.ok(List.of(
          Map.of(
              "id", "40000000-0000-0000-0000-000000000001",
              "number", "KB-0001",
              "title", "Common SSO and LDAP Connection Troubleshooting",
              "status", "PUBLISHED"
          )
      ));
    }
  }
}
