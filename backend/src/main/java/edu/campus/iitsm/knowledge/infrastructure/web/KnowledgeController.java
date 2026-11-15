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
    String sql = "SELECT id, code, title, body, status FROM knowledge_article WHERE is_active = true ORDER BY code ASC";
    List<Map<String, Object>> articles = jdbcTemplate.query(
        sql,
        (rs, rowNum) -> Map.of(
            "id", rs.getObject("id").toString(),
            "code", rs.getString("code"),
            "title", rs.getString("title"),
            "snippet", rs.getString("body") != null ? rs.getString("body") : "",
            "status", rs.getString("status")
        )
    );
    return ResponseEntity.ok(articles);
  }
}
