package umm3601.todo;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({ "VisibilityModifier" })
public class Todo{
  @SuppressWarnings({ "MemberName" })
  @ObjectId @Id
  public String _id;

  public String owner;
  public String category;
  public boolean status;
  public String body;
}
