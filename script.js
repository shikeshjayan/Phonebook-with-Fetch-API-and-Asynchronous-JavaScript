"use strict";

const url = "https://69118b5d7686c0e9c20dd821.mockapi.io/ContactLists";

const contactForm = document.getElementById("contactForm");
const contactList = document.getElementById("contactList");
const noContact = document.getElementById("noContacts");
const searchInput = document.getElementById("search");

// Load existing contacts on page load
document.addEventListener("DOMContentLoaded", fetchContacts);

async function fetchContacts() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch contacts");

    const contacts = await response.json();
    if (contacts.length === 0) return;

    noContact.classList.add("d-none");
    contacts.forEach(displayContact);
  } catch (error) {
    console.error("Error fetching contacts:", error);
  }
}

// Add contact
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newContact = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };

  if (!newContact.name || !newContact.phone) {
    alert("Please enter both name and phone number");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      throw new Error("Failed to add Contact");
    }

    const addedContact = await response.json();

    contactForm.reset();
    document.getElementById("name").focus();
    alert("Contact added successfully");
    displayContact(addedContact);
  } catch (error) {
    console.error("Error adding contact:", error);
    alert("Network error. Please check your connection.");
  }
});

// Display a single contact
function displayContact(contact) {
  noContact.classList.add("d-none");

  const li = document.createElement("li");
  li.classList.add("border-bottom", "py-2");
  li.setAttribute("data-id", contact.id);
  li.setAttribute("data-name", contact.name.toLowerCase());
  li.setAttribute("data-phone", contact.phone);

  li.innerHTML = `
    <div class="card p-2 d-flex align-items-center">
      <div class="d-flex align-items-center w-100">
        <!-- User Image -->
        <img src="./image/icons8-user-32.png" alt="User" class="me-3" width="40" height="40" />

        <!-- Contact Info -->
        <div class="flex-grow-1 text-center contact-info">
          <h5 class="mb-0 contact-name">${contact.name}</h5>
          <small class="text-muted contact-phone">${contact.phone}</small>
        </div>

        <!-- Action Icons -->
        <div class="d-flex align-items-center">
          <img src="./image/icons8-delete-32.png" alt="Delete" class="mx-2 delete-btn user-select-auto" role="button" />
          <img src="./image/icons8-edit-32.png" alt="Edit" class="mx-2 edit-btn user-select-auto" role="button" />
        </div>
      </div>
    </div>
  `;
  contactList.appendChild(li);
}

// Search functionality
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  const allContacts = contactList.querySelectorAll("li");

  let visibleCount = 0;

  allContacts.forEach((li) => {
    const name = li.getAttribute("data-name");
    const phone = li.getAttribute("data-phone");

    if (name.includes(searchTerm) || phone.includes(searchTerm)) {
      li.style.display = "";
      visibleCount++;
    } else {
      li.style.display = "none";
    }
  });

  // Show or hide "no contacts" message
  if (visibleCount === 0 && allContacts.length > 0) {
    noContact.textContent = "No contacts found matching your search.";
    noContact.classList.remove("d-none");
  } else if (allContacts.length === 0) {
    noContact.textContent = "No contacts yet. Add your first contact above!";
    noContact.classList.remove("d-none");
  } else {
    noContact.classList.add("d-none");
  }
});

// Handle delete and edit
contactList.addEventListener("click", async (e) => {
  // Delete functionality
  if (e.target.classList.contains("delete-btn")) {
    const li = e.target.closest("li");

    if (!confirm("Are you sure you want to delete this contact?")) return;

    const contactId = li.getAttribute("data-id");

    try {
      const deleteResponse = await fetch(`${url}/${contactId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete contact.");
      }

      li.remove();

      // Show 'No Contacts' message if list is empty
      if (!contactList.hasChildNodes()) {
        noContact.textContent = "No contacts yet. Add your first contact above!";
        noContact.classList.remove("d-none");
      }

      alert("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert("Network error. Please try again");
    }
  }

  // Edit functionality
  if (e.target.classList.contains("edit-btn")) {
    const li = e.target.closest("li");
    const contactId = li.getAttribute("data-id");
    const cardDiv = li.querySelector(".card");
    const nameElement = li.querySelector(".contact-name");
    const phoneElement = li.querySelector(".contact-phone");
    const currentName = nameElement.textContent;
    const currentPhone = phoneElement.textContent;

    // Replace entire card content with edit form
    cardDiv.innerHTML = `
      <div class="d-flex align-items-center w-100 p-2">
        <!-- User Image -->
        <img src="./image/icons8-user-32.png" alt="User" class="me-3" width="40" height="40" />

        <!-- Edit Form -->
        <div class="flex-grow-1">
          <input type="text" class="form-control form-control-sm mb-2 edit-name" value="${currentName}" placeholder="Name" />
          <input type="text" class="form-control form-control-sm edit-phone" value="${currentPhone}" placeholder="Phone" />
        </div>

        <!-- Action Buttons -->
        <div class="d-flex align-items-center ms-3">
          <button class="btn btn-sm btn-secondary me-2 cancel-edit-btn">Cancel</button>
          <button class="btn btn-sm btn-success save-edit-btn" data-id="${contactId}">Save</button>
        </div>
      </div>
    `;

    // Focus on name input
    li.querySelector(".edit-name").focus();
  }

  // Save edited contact
  if (e.target.classList.contains("save-edit-btn")) {
    const li = e.target.closest("li");
    const contactId = e.target.getAttribute("data-id");
    const newName = li.querySelector(".edit-name").value.trim();
    const newPhone = li.querySelector(".edit-phone").value.trim();

    if (!newName || !newPhone) {
      alert("Please enter both name and phone number");
      return;
    }

    try {
      const response = await fetch(`${url}/${contactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, phone: newPhone }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact");
      }

      const updatedContact = await response.json();

      // Update the li element with new data
      li.setAttribute("data-name", updatedContact.name.toLowerCase());
      li.setAttribute("data-phone", updatedContact.phone);

      // Restore the card with updated data
      const cardDiv = li.querySelector(".card");
      cardDiv.innerHTML = `
        <div class="d-flex align-items-center w-100">
          <!-- User Image -->
          <img src="./image/icons8-user-32.png" alt="User" class="me-3" width="40" height="40" />

          <!-- Contact Info -->
          <div class="flex-grow-1 text-center contact-info">
            <h5 class="mb-0 contact-name">${updatedContact.name}</h5>
            <small class="text-muted contact-phone">${updatedContact.phone}</small>
          </div>

          <!-- Action Icons -->
          <div class="d-flex align-items-center">
            <img src="./image/icons8-delete-32.png" alt="Delete" class="mx-2 delete-btn user-select-auto" role="button" />
            <img src="./image/icons8-edit-32.png" alt="Edit" class="mx-2 edit-btn user-select-auto" role="button" />
          </div>
        </div>
      `;

      alert("Contact updated successfully");
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Network error. Please try again");
    }
  }

  // Cancel editing
  if (e.target.classList.contains("cancel-edit-btn")) {
    const li = e.target.closest("li");
    const contactId = li.getAttribute("data-id");
    const originalName = li.getAttribute("data-name");
    const originalPhone = li.getAttribute("data-phone");

    // Restore the card with original data
    const cardDiv = li.querySelector(".card");
    cardDiv.innerHTML = `
      <div class="d-flex align-items-center w-100">
        <!-- User Image -->
        <img src="./image/icons8-user-32.png" alt="User" class="me-3" width="40" height="40" />

        <!-- Contact Info -->
        <div class="flex-grow-1 text-center contact-info">
          <h5 class="mb-0 contact-name">${originalName.charAt(0).toUpperCase() + originalName.slice(1)}</h5>
          <small class="text-muted contact-phone">${originalPhone}</small>
        </div>

        <!-- Action Icons -->
        <div class="d-flex align-items-center">
          <img src="./image/icons8-delete-32.png" alt="Delete" class="mx-2 delete-btn user-select-auto" role="button" />
          <img src="./image/icons8-edit-32.png" alt="Edit" class="mx-2 edit-btn user-select-auto" role="button" />
        </div>
      </div>
    `;
  }
});