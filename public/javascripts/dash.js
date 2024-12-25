// script.js

// Function to add a task when the "Add" button is clicked
function addTask() {
    // Get the task input value
    var taskInput = document.getElementById("taskInput");
    var taskValue = taskInput.value;
  
    // Check if the task input is not empty
    if (taskValue.trim() !== "") {
      // Create a new task container
      var taskContainer = document.createElement("div");
      taskContainer.classList.add("task-container");
  
      // Create the task info div
      var taskInfo = document.createElement("div");
      taskInfo.classList.add("task-info");
  
      // Create the task icon
      var taskIcon = document.createElement("i");
      taskIcon.classList.add("fa-solid", "fa-calendar-check");
  
      // Create the task title
      var taskTitle = document.createElement("h2");
      taskTitle.textContent = taskValue;
  
      // Append the icon and title to the task info div
      taskInfo.appendChild(taskIcon);
      taskInfo.appendChild(taskTitle);
  
      // Create the task description paragraph
      var taskDescription = document.createElement("p");
      taskDescription.textContent = "Description for " + taskValue + " goes here.";
  
      // Append the task info and description to the task container
      taskContainer.appendChild(taskInfo);
      taskContainer.appendChild(taskDescription);
  
      // Get the task container in the right-container and append the new task container
      var taskContainerWrapper = document.querySelector(".right-container .task-container");
      taskContainerWrapper.appendChild(taskContainer);
  
      // Clear the task input
      taskInput.value = "";
    }
  }
  
  // Add other functionalities or event listeners as needed
// Add this function to toggle the display of the upload form
function toggleUploadForm() {
    var uploadFormContainer = document.getElementById("uploadFormContainer");
    uploadFormContainer.style.display = (uploadFormContainer.style.display === "none") ? "block" : "none";
}
