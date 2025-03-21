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
  const [updateLoading, setUpdateLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch task, statuses and comments(get requests)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch task data
        const taskResponse = await axios.get(
          `https://momentum.redberryinternship.ge/api/tasks/${taskId}`,
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );

        // Fetch statuses
        const statusResponse = await axios.get(
          `https://momentum.redberryinternship.ge/api/statuses`
        );

        // Fetch comments
        const commentsResponse = await axios.get(
          `https://momentum.redberryinternship.ge/api/tasks/${taskId}/comments`,
          {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          }
        );

        // Update state with fetched data
        setTask(taskResponse.data);

        const formattedStatuses = statusResponse.data.map((status) => ({
          value: status.id,
          label: status.name,
        }));
        setStatuses(formattedStatuses);

        setComments(commentsResponse.data);

        // Set the initial selected status
        if (taskResponse.data && formattedStatuses.length > 0) {
          const currentStatus = formattedStatuses.find(
            (status) => status.value === taskResponse.data.status.id
          );
          if (currentStatus) {
            setSelectedStatus(currentStatus);
          }
        }
      } catch (err) {
        console.error("Error loading task data:", err);
        setError("Failed to load task data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

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

      await axios.post(
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

      alert("კომენტარი წარმატებით დაემატა!");
      setComments(commentsResponse.data);
      setNewComment(""); // clear input field
    } catch (err) {
      alert("კომენტარი ვერ დაემატა!");
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

      await axios.post(
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
      alert("პასუხი წარმატებით დაემატა!");
      setComments(commentsResponse.data);
      setReplyText(""); // Clear reply input
      setReplyingTo(null); // Hide reply form
    } catch (err) {
      console.error(err);
      alert("პასუხი ვერ დაემატა!");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleResize = (e) => {
    const textarea = e.target;
    textarea.style.height = "20px"; // Reset height to initial height
    textarea.style.height = `${Math.min(textarea.scrollHeight - 20, 100)}px`; // Resize up to max height of 100px
  };

  const priorityColors = {
    1: "#08A508", //Green
    2: "#FFBE0B", //Yellow
    3: "#FA4D4D",
  };

  const departmentColors = {
    0: "#ff66a8",
    1: "#89b6ff",
    2: "#ffd86d",
    3: "#fd9a6a",
    4: "#17f1fd",
    5: "#41ff0c",
    6: "#e14704",
  };

  // Show loading state
  if (isLoading) {
    return <div className={styles.loading}>იტვირთება...</div>;
  }

  // Show error message if there was an error
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Return null or a placeholder if task is still null after loading
  if (!task) {
    return <div className={styles.error}>დავალების ჩატვირთვა ვერ მოხერხდა</div>;
  }

  return (
    <div className={styles.taskContainer}>
      <div className={styles.taskDetails}>
        <div className={styles.taskHeader}>
          <div className={styles.taskHeaderTop}>
            <span
              className={styles.priority}
              style={{
                borderColor: priorityColors[task.priority.id],
                color: priorityColors[task.priority.id],
              }}
            >
              <img src={task.priority.icon} width="18px" height="20px" />
              {task.priority.name}
            </span>
            <span
              className={styles.department}
              style={{
                backgroundColor: departmentColors[task.department.id],
              }}
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

      <div className={styles.commentsContainer}>
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
            კომენტარები{" "}
            <span>
              {
                // calculate total comments count (comments+subcomments)
                (() => {
                  let count = 0;
                  comments.forEach((comment) => {
                    count++;
                    count += comment.sub_comments.length;
                  });
                  return count;
                })()
              }
            </span>
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
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      className={styles.replyButton}
                    >
                      <CornerUpLeft
                        size="16px"
                        style={{ marginRight: "6px" }}
                      />
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
                <div className={styles.subCommentList}>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
