namespace OperationsTracker.Api.Models;

public class Comment
{
    public int CommentID { get; set; }
    public int WorkOrderID { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public string? AuthorName { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class AddCommentRequest
{
    public int AuthorID { get; set; }
    public string CommentText { get; set; } = string.Empty;
}
