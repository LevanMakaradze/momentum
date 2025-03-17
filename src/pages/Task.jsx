import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const Task = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // fetch task,statusses and comments(get requests)
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://momentum.redberryinternship.ge/api/tasks/${taskId}`,
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );
        setTask(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://momentum.redberryinternship.ge/api/statuses`
        );

        const formattedStatuses = response.data.map((status) => ({
          value: status.id,
          label: status.name,
        }));
        setStatuses(formattedStatuses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );
        setComments(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
    fetchStatus();
    fetchComments();
  }, [taskId]);

  // set the default selected status
  useEffect(() => {
    if (task && statuses.length > 0) {
      const currentStatus = statuses.find(
        (status) => status.value === task.status.id
      );
      if (currentStatus) {
        setSelectedStatus(currentStatus);
      }
    }
  }, [task, statuses]);

  // update task status (put request)
  const updateTaskStatus = async (newStatus) => {
    try {
      setUpdateLoading(true);

      await axios.put(
        `https://momentum.redberryinternship.ge/api/tasks/${taskId}`,
        {
          status_id: newStatus.value,
        },
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      // update task status
      setTask((prev) => ({
        ...prev,
        status: {
          id: newStatus.value,
          name: newStatus.label,
        },
      }));

      alert("სტატუსი წარმატებით შეიცვალა");
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
      alert("სტატუსი ვერ შეიცვალა");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleStatusChange = (option) => {
    setSelectedStatus(option);
    updateTaskStatus(option);
  };

  // Send comment to api and get updated comments from api
  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) {
      alert("გთხოვ შეიყვანოთ კომენტარი");
      return;
    }

    try {
      setCommentLoading(true);

      const response = await axios.post(
        `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
        {
          text: newComment,
        },
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      // Refresh comments after posting
      const commentsResponse = await axios.get(
        `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      setComments(commentsResponse.data);
      setNewComment(""); // clear input field
    } catch (err) {
      setError(`Failed to post comment: ${err.message}`);
      alert("Failed to post comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Send reply to api and get updated comments from api
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) {
      alert("გთხოვთ შეიყვანოთ პასუხი");
      return;
    }

    try {
      setCommentLoading(true);

      const response = await axios.post(
        `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
        {
          text: replyText,
          parent_id: commentId,
        },
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      // Refresh comments after posting reply
      const commentsResponse = await axios.get(
        `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      setComments(commentsResponse.data);
      setReplyText(""); // Clear reply input
      setReplyingTo(null); // Hide reply form
    } catch (err) {
      setError(`Failed to post reply: ${err.message}`);
      alert("Failed to post reply");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <p>Loading task details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!task) return <p>Task not found</p>;

  return (
    <div style={{ margin: "100px auto", width: "80%" }}>
      <h1>სათაური: {task.name}</h1>
      <div>
        <p>აღწერა: {task.description}</p>
        <p>დეპარტამენტი: {task.department.name}</p>
        <p>პრიორიტეტი: {task.priority.name}</p>
        <div>
          <p>სტატუსი: </p>
          <Select
            options={statuses}
            value={selectedStatus}
            onChange={handleStatusChange}
            isDisabled={updateLoading}
          />
        </div>
        <p>
          თანამშრომელი: {task.employee.name} {task.employee.surname}
        </p>
        <p>{task.employee.department.name}</p>
        <div>
          <img
            src={task.employee.avatar}
            alt="avatar"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
        </div>
        <p>კომენტარები {comments.length}</p>
        <div>
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: "20px" }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              type="text"
              placeholder="დაწერე კომენტარი"
            />
            <button
              type="submit"
              disabled={commentLoading}
              style={{ padding: "8px 16px" }}
            >
              დააკომენტარე
            </button>
          </form>

          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                border: "1px solid black",
                margin: "10px",
                padding: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <img
                  src={comment.author_avatar}
                  alt="avatar"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
                <p>nick: {comment.author_nickname}</p>
              </div>

              <p>{comment.text}</p>

              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
              >
                {replyingTo === comment.id ? "გააუქმე პასუხი" : "უპასუხე"}
              </button>

              {replyingTo === comment.id && (
                <div>
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    type="text"
                    placeholder="დაწერე პასუხი"
                  />
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={commentLoading}
                  >
                    უპასუხე
                  </button>
                </div>
              )}

              {comment.sub_comments &&
                comment.sub_comments.map((subComment) => (
                  <div
                    key={subComment.id}
                    style={{ border: "1px solid green", margin: "15px 40px" }}
                  >
                    <div>
                      <img
                        src={subComment.author_avatar}
                        alt="avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                        }}
                      />
                      <p>nick: {subComment.author_nickname}</p>
                    </div>
                    <p>{subComment.text}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Task;
