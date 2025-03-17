import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./Task.module.css";
import { ChartPie, User, Calendar, CornerUpLeft } from "lucide-react";

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

  const handleResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "20px"; // Reset height to initial height
    textarea.style.height = `${Math.min(textarea.scrollHeight - 20, 100)}px`; // Resize up to max height of 100px
  };

  if (loading)
    return <p className={styles.loadingMessage}>Loading task details...</p>;
  if (error) return <p className={styles.errorMessage}>Error: {error}</p>;
  if (!task) return <p className={styles.notFoundMessage}>Task not found</p>;

  return (
    <div className={styles.taskContainer}>
      <div className={styles.taskDetails}>
        <div className={styles.taskHeader}>
          <div className={styles.taskHeaderTop}>
            <span
              className={`${
                task.priority.id === 1
                  ? styles.priority1
                  : task.priority.id === 2
                  ? styles.priority2
                  : task.priority.id === 3
                  ? styles.priority3
                  : ""
              }`}
            >
              <img src={task.priority.icon} width="18px" height="20px" />
              {task.priority.name}
            </span>
            <span
              className={`${
                task.department.id === 0
                  ? styles.department0
                  : task.department.id === 1
                  ? styles.department1
                  : task.department.id === 2
                  ? styles.department2
                  : task.department.id === 3
                  ? styles.department3
                  : task.department.id === 4
                  ? styles.department4
                  : task.department.id === 5
                  ? styles.department5
                  : task.department.id === 6
                  ? styles.department6
                  : ""
              }`}
            >
              {task.department.name}
            </span>
          </div>

          <span className={styles.taskTitle}>{task.name}</span>

          <p className={styles.taskDescription}>{task.description}</p>
        </div>

        <div className={styles.taskInfo}>
          <span className={styles.taskDetailsTitle}>დავალების დეტალები</span>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <ChartPie size="24px" />
              სტატუსი
            </span>
            <div className={styles.infoValue}>
              <div className={styles.statusSelector}>
                <Select
                  options={statuses}
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  isDisabled={updateLoading}
                  className={styles.select}
                />
              </div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <User size="24px" />
              თანამშრომელი
            </span>
            <div className={styles.infoValue}>
              <img
                src={task.employee.avatar}
                className={styles.employeeAvatar}
              />
              <div className={styles.employeeTitle}>
                <span className={styles.employeeDepartment}>
                  {task.employee.department.name}
                </span>
                <span className={styles.employeeName}>
                  {task.employee.name} {task.employee.surname}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Calendar size="24px" />
              დავალების ვადა
            </span>
            <span className={styles.infoValue}>
              {(() => {
                const dateString = task.due_date; // "2025-03-13T20:00:00.000000Z"
                const date = new Date(dateString);

                const weekdays = [
                  "კვი",
                  "ორშ",
                  "სამ",
                  "ოთხ",
                  "ხუთ",
                  "პარ",
                  "შაბ",
                ];
                const day = String(date.getUTCDate()).padStart(2, "0");
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const year = date.getUTCFullYear();

                return `${
                  weekdays[date.getUTCDay()]
                } - ${day}/${month}/${year}`;
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.commentsSection}>
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onInput={handleResize}
            className={styles.commentInput}
            placeholder="დაწერე კომენტარი"
          />
          <button
            type="submit"
            disabled={commentLoading}
            className={styles.commentButton}
          >
            დააკომენტარე
          </button>
        </form>
        <span className={styles.commentsTitle}>
          კომენტარები <span>{comments.length}</span>
        </span>
        <div className={styles.commentsList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>

              <div className={styles.parentComment}>
              <div className={styles.commentAvatar}>
                <img
                  src={comment.author_avatar}
                  alt="avatar"
                  className={styles.commentAvatar}
                />
              </div>
              <div className={styles.commentContent}>
                <p className={styles.commentAuthor}>
                  {comment.author_nickname}
                </p>
                <p className={styles.commentText}>{comment.text}</p>
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className={styles.replyButton}
                >
                  <CornerUpLeft size="16px" style={{ marginRight: "6px" }} />
                  {replyingTo === comment.id ? "გააუქმე პასუხი" : "უპასუხე"}
                </button>
              </div>
              </div>
              {replyingTo === comment.id && (
                <div className={styles.replyForm}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onInput={handleResize}
                    className={styles.replyInput}
                    placeholder="დაწერე პასუხი"
                  />

                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={commentLoading}
                    className={styles.replySubmitButton}
                  >
                    უპასუხე
                  </button>
                </div>
              )}
              

              {comment.sub_comments &&
                comment.sub_comments.map((subComment) => (
                  <div key={subComment.id} className={styles.subComment}>
                    <div className={styles.commentAvatar}>
                      <img
                        src={subComment.author_avatar}
                        alt="avatar"
                        className={styles.commentAvatar}
                      />
                    </div>
                    <div className={styles.commentContent}>
                      <p className={styles.commentAuthor}>
                        {subComment.author_nickname}
                      </p>
                      <p className={styles.commentText}>{subComment.text}</p>
                    </div>
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
