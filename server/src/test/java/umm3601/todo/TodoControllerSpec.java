package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static io.javalin.plugin.json.JsonMapperKt.JSON_MAPPER_KEY;
import static java.util.Map.entry;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.core.JavalinConfig;
import io.javalin.core.validation.ValidationException;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HandlerType;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJackson;


@SuppressWarnings({ "MagicNumber" })
public class TodoControllerSpec {
  private static final long MAX_REQUEST_SIZE = new JavalinConfig().maxRequestSize;

  private MockHttpServletRequest mockReq = new MockHttpServletRequest();
  private MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private TodoController todoController;

  private ObjectId samsId;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  private static JavalinJackson javalinJackson = new JavalinJackson();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
    MongoClientSettings.builder()
    .applyToClusterSettings(builder ->
    builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
    .build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setUpEach() throws IOException {
    mockReq.resetAll();
    mockRes.resetAll();

    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos= new ArrayList<>();
    testTodos.add(
      new Document()
      .append("owner", "Blance")
      .append("body", "Some test body")
      .append("category", "software design")
      .append("status", "false")
    );
    testTodos.add(
      new Document()
      .append("owner", "Fry")
      .append("body", "Another meaningless test body")
      .append("category", "video games")
      .append("status", "false")
    );
    testTodos.add(
      new Document()
      .append("owner", "Barry")
      .append("body", "Once again, another test body that has no meaning")
      .append("category", "groceries")
      .append("status", "false")
    );

    samsId = new ObjectId();
    Document sam =
    new Document()
    .append("_id", samsId)
    .append("owner", "Barry")
    .append("body", "Here we are for one final meaningless test body")
    .append("category", "groceries");
    //.append("status", "false")

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(sam);

    todoController = new TodoController(db);
  }

  private Context mockContext(String path) {
    return mockContext(path, Map.of());
  }

  private Context mockContext(String path, Map<String, String> pathParams) {
    return ContextUtil.init(
        mockReq, mockRes,
        path,
        pathParams,
        HandlerType.INVALID,
        Map.ofEntries(
          entry(JSON_MAPPER_KEY, javalinJackson),
          entry(ContextUtil.maxRequestSizeKey, MAX_REQUEST_SIZE)));
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @Test
  public void canGetAllTodos() throws IOException {

    String path = "api/todos";
    Context ctx = mockContext(path);
    todoController.getTodos(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(db.getCollection("todos").countDocuments(),
    javalinJackson.fromJsonString(result, Todo[].class).length);
  }

  @Test
  public void canGetTodosWithOwnerFry() throws IOException {

    mockReq.setQueryString("owner=Fry");
    Context ctx = mockContext("api/todos");
    todoController.getTodos(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = javalinJackson.fromJsonString(result, Todo[].class);

    assertEquals(1, resultTodos.length); //Only one with owner "Fry"
    for (Todo todo : resultTodos) {
      assertEquals("Fry", todo.owner);
    }
  }

  @Test
  public void canGetTodosWithCategory() throws IOException {

    mockReq.setQueryString("category=video games");
    Context ctx = mockContext("api/todos");
    todoController.getTodos(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    String result = ctx.resultString();

    Todo[] resultTodos = javalinJackson.fromJsonString(result, Todo[].class);

    assertEquals(1, resultTodos.length); //Only one with category "videogames"
    for (Todo todo : resultTodos) {
      assertEquals("video games", todo.category);
    }
  }

  @Test
  public void canGetTodosWithBody() throws IOException {

    mockReq.setQueryString("body=Some test body"); //This doesn't test partial body searches
    Context ctx = mockContext("api/todos");
    todoController.getTodos(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    String result = ctx.resultString();

    Todo[] resultTodos = javalinJackson.fromJsonString(result, Todo[].class);

    assertEquals(1, resultTodos.length); //Only one with body "Some test body"
    for (Todo todo : resultTodos) {
      assertEquals("Some test body", todo.body);
    }
  }

  @Test
  public void canGetTodosWithSpecifiedOwnerAndCategory() throws IOException {

    mockReq.setQueryString("owner=Fry&category=video games");
    Context ctx = mockContext("api/todos");
    todoController.getTodos(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());
    String result = ctx.resultString();
    Todo[] resultTodos = javalinJackson.fromJsonString(result, Todo[].class);

    assertEquals(1, resultTodos.length); // There should be one todo returned
    for (Todo todo : resultTodos) {
      assertEquals("Fry", todo.owner);
      assertEquals("video games", todo.category);
    }
  }

  @Test
  public void canGetTodoWithSpecifiedId() throws IOException {

    String testID = samsId.toHexString();

    Context ctx = mockContext("api/todos", Map.of("id", testID));
    todoController.getTodo(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());

    String result = ctx.resultString();
    Todo resultTodo = javalinJackson.fromJsonString(result, Todo.class);

    assertEquals(samsId.toHexString(), resultTodo._id);
    assertEquals("Barry", resultTodo.owner);
    assertEquals("Here we are for one final meaningless test body", resultTodo.body);
    assertEquals("groceries", resultTodo.category);
  }

  @Test
  public void respondsAppropriatelyToRequestForIllegalId() throws IOException {
    Context ctx = mockContext("api/todos", Map.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  @Test
  public void respondsAppropriatelyToNonexistentID() throws IOException {
    Context ctx = mockContext("api/todos", Map.of("id", "58af3a600343927e48e87335"));

    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  @Test
  public void canAddTodo() throws IOException {

    String testNewTodo = "{"
      + "\"owner\": \"Fry\","
      + "\"category\": \"video games\","
      + "\"body\": \"Another test body\","
      + "\"status\": true"
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/todos");

    todoController.addNewTodo(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());

    String result = ctx.resultString();
    String id = javalinJackson.fromJsonString(result, ObjectNode.class).get("id").asText();
    assertNotEquals("", id);
    System.out.println(id);

    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(id))));

    //verify todo was added to the database and the correct ID
    Document addedTodo = db.getCollection("todos").find(eq("_id", new ObjectId(id))).first();
    assertNotNull(addedTodo);
    assertEquals("Fry", addedTodo.getString("owner"));
    assertEquals(true, addedTodo.getBoolean("status"));
    assertEquals("video games", addedTodo.getString("category"));
    assertEquals("Another test body", addedTodo.getString("body"));
  }

  @Test
  public void respondsAppropriatelyToInvalidOwner() throws IOException {

    String testNewTodo = "{"
      + "\"category\": \"video games\","
      + "\"body\": \"Another test body\","
      + "\"status\": true"
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/todos");

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void respondsAppropriatelyToInvalidCategory() throws IOException {

    String testNewTodo = "{"
      + "\"owner\": \"Fry\","
      + "\"body\": \"Another test body\","
      + "\"status\": true"
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/todos");

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void respondsAppropriatelyToInvalidBody() throws IOException {

    String testNewTodo = "{"
      + "\"owner\": \"Fry\","
      + "\"category\": \"video games\","
      + "\"status\": true"
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/todos");

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

    @Test
  public void respondsAppropriatelyToInvalidStatus() throws IOException {

    String testNewTodo = "{"
      + "\"owner\": \"Fry\","
      + "\"category\": \"video games\","
      + "\"body\": \"Another test body\","
      + "\"status\": \"beans\""
      + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = mockContext("api/todos");

    assertThrows(ValidationException.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void canDeleteTodo() throws IOException {

    String testID = samsId.toHexString();

    // Todo exists before deletion
    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));

    Context ctx = mockContext("api/todos", Map.of("id", testID));
    todoController.deleteTodo(ctx);

    assertEquals(HttpCode.OK.getStatus(), mockRes.getStatus());

    // Todo is no longer in the database
    assertEquals(0, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(testID))));
  }

}
