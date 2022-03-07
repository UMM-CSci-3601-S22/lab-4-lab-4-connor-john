package umm3601.mongotest;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Projections.excludeId;
import static com.mongodb.client.model.Projections.fields;
import static com.mongodb.client.model.Projections.include;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.AggregateIterable;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoIterable;
import com.mongodb.client.model.Accumulators;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;


@SuppressWarnings({ "MagicNumber" })
public class MongoTodoSpec {

  private MongoCollection<Document> todoDocuments;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @BeforeAll
  public static void setupDB() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void clearAndPopulateDB() {
    todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
      new Document()
        .append("owner", "Fry")
        .append("status", true)
        .append("category", "homework")
        .append("body", "Some test body"));
    testTodos.add(
      new Document()
        .append("owner", "Barry")
        .append("status", false)
        .append("category", "groceries")
        .append("body", "Another random test body"));
    testTodos.add(
      new Document()
        .append("owner", "Workman")
        .append("status", true)
        .append("category", "video games")
        .append("body", "Once again, we have another random test body"));

    todoDocuments.insertMany(testTodos);
  }

  private List<Document> intoList(MongoIterable<Document> documents) {
    List<Document> todos = new ArrayList<>();
    documents.into(todos);
    return todos;
  }

  private int countTodos(FindIterable<Document> documents) {
    List<Document> todos = intoList(documents);
    return todos.size();
  }

  @Test
  public void shouldBeThreeTodos() {
    FindIterable<Document> documents = todoDocuments.find();
    int numberOfTodos = countTodos(documents);
    assertEquals(3, numberOfTodos, "Should be 3 total todos");
  }

  @Test
  public void shouldBeOneWithOwnerFry() {
    FindIterable<Document> documents = todoDocuments.find(eq("owner", "Fry"));
    int numberOfTodos = countTodos(documents);
    assertEquals(1, numberOfTodos, "Should be 1 todo with owner Fry");
  }

  @Test
  public void shouldBeTwoCompleted() {
    FindIterable<Document> documents = todoDocuments.find(eq("status", true));
    int numberOfTodos = countTodos(documents);
    assertEquals(2, numberOfTodos, "Should be 2 with complete status");
  }

  @Test
  public void shouldBeCompletedInOrderByOwner() {
    FindIterable<Document> documents
      = todoDocuments.find(eq("status", true))
      .sort(Sorts.ascending("owner"));
    List<Document> docs = intoList(documents);
    assertEquals(2, docs.size(), "Should be 1");
    assertEquals("Fry", docs.get(0).get("owner"), "First should have owner Fry");
    assertEquals("Workman", docs.get(1).get("owner"), "Second should have owner Workman");
  }

  @Test
  public void shouldBeIncomplete() {
    FindIterable<Document> documents
      = todoDocuments.find(and(eq("status", false),
      eq("category", "groceries")));
    List<Document> docs = intoList(documents);
    assertEquals(1, docs.size(), "Should be 1");
    assertEquals("Barry", docs.get(0).get("owner"), "First should have owner Barry");
  }

  @Test
  public void justOwnerAndBody() {
    FindIterable<Document> documents
      = todoDocuments.find().projection(fields(include("owner", "body")));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals("Fry", docs.get(0).get("owner"), "First should have owner Fry");
    assertNull(docs.get(0).get("category"), "First should have a category");
    assertNotNull(docs.get(0).get("body"), "First should have a body'");
    assertNotNull(docs.get(0).get("_id"), "First should have '_id'");
  }

  @Test
  public void justOwnerAndBodyNoId() {
    FindIterable<Document> documents
      = todoDocuments.find()
      .projection(fields(include("owner", "body"), excludeId()));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals("Fry", docs.get(0).get("owner"), "First should be Fry");
    assertNotNull(docs.get(0).get("body"), "First should have a body");
    assertNull(docs.get(0).get("category"), "First shouldn't have 'category'");
    assertNull(docs.get(0).get("_id"), "First should not have '_id'");
  }

  @Test
  public void justOwnerAndBodyNoIdSortedByCategory() {
    FindIterable<Document> documents
      = todoDocuments.find()
      .sort(Sorts.ascending("category"))
      .projection(fields(include("owner", "body"), excludeId()));
    List<Document> docs = intoList(documents);
    assertEquals(3, docs.size(), "Should be 3");
    assertEquals("Barry", docs.get(0).get("owner"), "First should be Barry");
    assertNotNull(docs.get(0).get("body"), "First should have body");
    assertNull(docs.get(0).get("category"), "First shouldn't have 'category'");
    assertNull(docs.get(0).get("_id"), "First should not have '_id'");
  }

  @Test
  public void ageCounts() {
    AggregateIterable<Document> documents
      = todoDocuments.aggregate(
      Arrays.asList(
        /*
         * Groups data by the "age" field, and then counts
         * the number of documents with each given age.
         * This creates a new "constructed document" that
         * has "age" as it's "_id", and the count as the
         * "ageCount" field.
         */
        Aggregates.group("$status",
          Accumulators.sum("statusCount", 1)),
        Aggregates.sort(Sorts.ascending("_id"))
      )
    );
    List<Document> docs = intoList(documents);
    assertEquals(2, docs.size(), "Should be two distinct statuses");
    assertEquals(false, docs.get(0).get("_id"));
    assertEquals(1, docs.get(0).get("statusCount"));
    assertEquals(true, docs.get(1).get("_id"));
    assertEquals(2, docs.get(1).get("statusCount"));
  }

}
