package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;
import static com.mongodb.client.model.Filters.where;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpCode;
import io.javalin.http.NotFoundResponse;

public class TodoController {

  private static final String OWNER_KEY = "owner";
  private static final String CATEGORY_KEY = "category";
  private static final String STATUS_KEY = "status";
  private static final String BODY_KEY = "body";

  private final JacksonMongoCollection<Todo> todoCollection;

  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(database, "todos", Todo.class);
  }

  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if (todo== null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
    }
  }

  public void deleteTodo(Context ctx) {
    String id = ctx.pathParam("id");
    todoCollection.deleteOne(eq("_id", new ObjectId(id)));
  }

  public void getTodos(Context ctx, Object Objects) {

    List<Bson> filters = new ArrayList<>();

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      filters.add(regex(OWNER_KEY, Pattern.quote(ctx.queryParam(OWNER_KEY)), "i"));
    }

    if (ctx.queryParamMap().containsKey(CATEGORY_KEY)) {
      filters.add(regex(CATEGORY_KEY, Pattern.quote(ctx.queryParam(CATEGORY_KEY)), "i"));
    }

    if (ctx.queryParamMap().containsKey(BODY_KEY)) {
      filters.add(regex(BODY_KEY, Pattern.quote(ctx.queryParam(BODY_KEY)), "i"));
    }

    if (ctx.queryParamMap().containsKey(STATUS_KEY)) {
      filters.add(where(STATUS_KEY + "== true"));
    }

    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "owner");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");

    ctx.json(todoCollection.find(filters.isEmpty() ? new Document() : and(filters))
    .sort(sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy))
    .into(new ArrayList<>()));
  }

  public void addNewTodo(Context ctx) {
    Todo newTodo = ctx.bodyValidator(Todo.class)
       // Verify that the todo has a name that is not blank
      .check(tdo -> tdo.owner != null && tdo.owner.length() > 0, "Todo must have a non-empty todo owner")
       // Verify that the provided email is a valid email
      .check(tdo -> tdo.category != null && tdo.category.length() > 0, "Todo must have a non-empty todo category")
       // Verify that the provided age is > 0
      .check(tdo -> tdo.body != null && tdo.body.length() > 0, "Todo must have a non-empty todo body")
      .get();
  }
}
// Fix the addNewTodo, and add status and continue here.
