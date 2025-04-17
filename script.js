let reservations = [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
const daysContainer = document.getElementById("calendarDays");

function dateString(date) {
  return date.toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", function () {
  loadReservations();
  setupCalendar();
  setMinDate();
  updateReservationsTable();

  document
    .getElementById("reservationForm")
    .addEventListener("submit", handleFormSubmit);
  document
    .getElementById("prevMonth")
    .addEventListener("click", () => navigateMonth(-1));
  document
    .getElementById("nextMonth")
    .addEventListener("click", () => navigateMonth(1));
});


function validateName(name) {
  const regex = /^[a-zA-Z]{3,}$/;
  const nameError = document.getElementById("nameError");
  if (!regex.test(name)) {
    nameError.textContent = "Le nom doit contenir au moins 3 lettres et uniquement des lettres.";
    return false;
  }
  nameError.textContent = "";
  
  return true;
}

function validateTime(time) {
  const timeError = document.getElementById("timeError");
  const [hours, minutes] = time.split(":").map(Number);
  if (hours < 9 || hours > 18 || (hours === 18 && minutes > 0)) {
    timeError.textContent = "L'heure doit être entre 09:00 et 18:00.";
    return false;
  }
  timeError.textContent = "";
  return true;
}

function validateAvalability(date, time) {
  const reservationDate = new Date(date + " " + time);
  const isReserved = reservations.some((reservation) => {
    const resDate = new Date(reservation.date + " " + reservation.time);
    return resDate.getTime() === reservationDate.getTime();
  });
  const availabilityError = document.getElementById("availabilityError");
if (isReserved) {
  availabilityError.textContent = "Ce créneau est déjà réservé.";
  return false;
}
availabilityError.textContent = "";
return true;
}

function validateParticipants(participants) {
  const participantsError = document.getElementById("participantsError");
  if (participants < 1 || participants > 10) {
    participantsError.textContent =
      "Le nombre de participants doit être entre 1 et 10.";
    return false;
  }
  participantsError.textContent = "";
  return true;
}

function addReservation(name, date, time, participants) {
  const reservation = {
    id: Date.now(),
    name: name,
    date: date,
    time: time,
    participants: participants,
  };
  reservations.push(reservation);
  saveReservations();
  updateReservationsTable();
  updateCalendar(date, time);
}

function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function loadReservations() {
  const savedReservations = localStorage.getItem("reservations");
  if (savedReservations) {
    reservations = JSON.parse(savedReservations);
  }
}

function deleteReservation(id) {
  reservations = reservations.filter((reservation) => reservation.id !== id);
  saveReservations();
  updateReservationsTable();
  updateCalendar();
}

function updateReservationsTable() {
  const tableBody = document.getElementById("reservationList");
  const notReservationDiv = document.getElementById("noReservations");
  tableBody.innerHTML = "";

  if (reservations.length === 0) {
    notReservationDiv.style.display = "block";
  } else {
    notReservationDiv.style.display = "none";
  }

  const sortedReservations = [...reservations].sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(a.date) - new Date(b.date);
    }
    return a.time.localeCompare(b.time);
  });

  sortedReservations.forEach((reservation) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = reservation.name;
    row.appendChild(nameCell);

    const dateCell = document.createElement("td");
    dateCell.textContent = reservation.date;
    row.appendChild(dateCell);

    const timeCell = document.createElement("td");
    timeCell.textContent = reservation.time;
    row.appendChild(timeCell);

    const participantsCell = document.createElement("td");
    participantsCell.textContent = reservation.participants;
    row.appendChild(participantsCell);

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", () => {
      deleteReservation(reservation.id);
    });
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

function setMinDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("date").setAttribute("min", today);
  }
  

function setupCalendar() {
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  dayNames.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.textContent = day;
    dayElement.className = "day-name";
    daysContainer.appendChild(dayElement);
  });
  updateCalendar();
}

function getReservedDates() {
    const dates = reservations.map((r) => r.date);
    return [...new Set(dates)]; 
  }
  
function updateCalendar() {
  const daysContainer = document.getElementById("calendarDays");
  const monthTitle = document.getElementById("currentMonth");

  const dayElements = daysContainer.querySelectorAll(".day");
  dayElements.forEach((day) => day.remove());

  const options = { year: "numeric", month: "long" };
  monthTitle.textContent = new Date(
    currentYear,
    currentMonth
  ).toLocaleDateString("fr-FR", options);

  const firsttDay = new Date(currentYear, currentMonth, 1);
  const starting = firsttDay.getDay();

  const lastDate = new Date(currentYear, currentMonth + 1, 0);
  const totalDays = lastDate.getDate();

  for (let i = 0; i < starting; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day empty";
    daysContainer.appendChild(emptyDay);
  }
  const today = new Date();
  const reservedDates = getReservedDates();
  for (let i = 1; i <= totalDays; i++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.textContent = i;

    const dateObj = new Date(currentYear, currentMonth, i);
    const dateString = dateString(dateObj);
    if (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }
    if (dateObj < new Date(today.setHours(0, 0, 0, 0))) {
      dayElement.classList.add("disabled");
    }
    else {
        if (reservedDates.includes(dateString)) {
      dayElement.classList.add("reserved");
    }
    dayElement.addEventListener("click",function(){
        document.getElementById("date").value = dateString(dateObj);
    });
  }
    daysContainer.appendChild(dayElement);
    }
}
function handleFormSubmit(event) {
    event.preventDefault();
  
    const name = document.getElementById("name").value.trim();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const participants = parseInt(document.getElementById("participants").value);
  
    const isNameValid = validateName(name);
    const isTimeValid = validateTime(time);
    const isAvailable = validateAvalability(date, time);
    const isParticipantsValid = validateParticipants(participants);
  
    if (isNameValid && isTimeValid && isAvailable && isParticipantsValid) {
      addReservation(name, date, time, participants);
      document.getElementById("reservationForm").reset();
    }
  }
  
